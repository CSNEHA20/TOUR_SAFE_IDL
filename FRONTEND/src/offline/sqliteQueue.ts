interface QueueItem {
  id: string;
  payload: string;
  timestamp: number;
  status: 'PENDING' | 'COMMITTED';
}

class SQLiteQueue {
  private inMemoryQueue: QueueItem[] = [];
  private db: any = null;

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    try {
      // In native environment, this loads react-native-sqlite-storage
      const SQLite = require('react-native-sqlite-storage');
      this.db = SQLite.openDatabase(
        { name: 'toursafe.db', location: 'default' },
        () => {
          this.db.transaction((tx: any) => {
            tx.executeSql(
              `CREATE TABLE IF NOT EXISTS TelemetryQueue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                payload TEXT,
                timestamp INTEGER,
                status TEXT
              );`,
              [],
              () => console.log('SQLite TelemetryQueue table initialized successfully.'),
              (err: any) => console.error('Failed to create SQLite table:', err)
            );
          });
        },
        (err: any) => {
          console.warn('SQLite database open failed, falling back to in-memory queue.', err);
        }
      );
    } catch (e) {
      console.warn('react-native-sqlite-storage not available in current environment. Using in-memory fallback.');
    }
  }

  public async enqueue(encryptedPayload: string, timestamp: number): Promise<void> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        this.db.transaction((tx: any) => {
          tx.executeSql(
            'INSERT INTO TelemetryQueue (payload, timestamp, status) VALUES (?, ?, ?);',
            [encryptedPayload, timestamp, 'PENDING'],
            () => resolve(),
            (txErr: any, err: any) => {
              console.error('Failed to enqueue packet to SQLite:', err);
              // Fallback to in-memory
              this.enqueueInMemory(encryptedPayload, timestamp);
              resolve();
            }
          );
        });
      });
    } else {
      this.enqueueInMemory(encryptedPayload, timestamp);
    }
  }

  private enqueueInMemory(payload: string, timestamp: number) {
    this.inMemoryQueue.push({
      id: `mem-${Date.now()}-${Math.random()}`,
      payload,
      timestamp,
      status: 'PENDING',
    });
  }

  public async getPendingItems(): Promise<QueueItem[]> {
    if (this.db) {
      return new Promise((resolve) => {
        this.db.transaction((tx: any) => {
          tx.executeSql(
            "SELECT * FROM TelemetryQueue WHERE status = 'PENDING' ORDER BY timestamp ASC;",
            [],
            (txSelect: any, results: any) => {
              const items: QueueItem[] = [];
              const len = results.rows.length;
              for (let i = 0; i < len; i++) {
                items.push(results.rows.item(i));
              }
              resolve(items);
            },
            (txErr: any, err: any) => {
              console.error('SQLite fetch pending error:', err);
              resolve(this.inMemoryQueue.filter(i => i.status === 'PENDING'));
            }
          );
        });
      });
    } else {
      return this.inMemoryQueue.filter(i => i.status === 'PENDING');
    }
  }

  public async markCommitted(id: string): Promise<void> {
    if (this.db && typeof id === 'number') {
      return new Promise((resolve) => {
        this.db.transaction((tx: any) => {
          tx.executeSql(
            "UPDATE TelemetryQueue SET status = 'COMMITTED' WHERE id = ?;",
            [id],
            () => resolve(),
            () => {
              this.markCommittedInMemory(id.toString());
              resolve();
            }
          );
        });
      });
    } else {
      this.markCommittedInMemory(id);
    }
  }

  private markCommittedInMemory(id: string) {
    const item = this.inMemoryQueue.find(i => i.id === id);
    if (item) {
      item.status = 'COMMITTED';
    }
  }
}

export const sqliteQueue = new SQLiteQueue();
export default sqliteQueue;
