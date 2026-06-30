import store from '../store';
import { setNetworkAvailable } from '../store/connectionSlice';
import { setPendingCount } from '../store/offlineQueueSlice';
import sqliteQueue from './sqliteQueue';
import aesEncryption from './aesEncryption';

class AutoCommitJob {
  private timerId: any = null;
  private serverUrl: string = 'http://localhost:8000/api/sos/manual'; // Fallback sync server

  public startJob() {
    console.log('Started 30-second background offline queue auto-commit job.');
    this.timerId = setInterval(() => {
      this.runSyncProcedure();
    }, 30000); // Trigger every 30 seconds
  }

  public stopJob() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private async runSyncProcedure() {
    // 1. Perform network connectivity ping test
    const isOnline = await this.pingTest();
    store.dispatch(setNetworkAvailable(isOnline));

    if (!isOnline) {
      console.log('[AutoCommit] Sync skipped: device is currently offline.');
      return;
    }

    // 2. Fetch pending items from SQLite
    const pendingItems = await sqliteQueue.getPendingItems();
    store.dispatch(setPendingCount(pendingItems.length));

    if (pendingItems.length === 0) {
      return;
    }

    console.log(`[AutoCommit] Syncing ${pendingItems.length} pending telemetry packet windows...`);

    for (const item of pendingItems) {
      try {
        // Decrypt package
        const decryptedPayload = aesEncryption.decrypt(item.payload);
        const windowData = JSON.parse(decryptedPayload);

        // Send to FastAPI manually via HTTP fallback or WebSocket handler
        const response = await fetch('http://localhost:8000/api/register', { // Simulating sync registry
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(windowData),
        });

        if (response.ok) {
          // Success: update status in SQLite
          await sqliteQueue.markCommitted(item.id);
          console.log(`[AutoCommit] Flushed telemetry window timestamp: ${item.timestamp} successfully.`);
        }
      } catch (e) {
        console.error(`[AutoCommit] Failed to sync package ID: ${item.id}:`, e);
        break; // Stop loop and retry in the next cycle
      }
    }

    // Re-verify remaining queue size
    const remainingItems = await sqliteQueue.getPendingItems();
    store.dispatch(setPendingCount(remainingItems.length));
  }

  private async pingTest(): Promise<boolean> {
    try {
      // Fetch home route with short timeout
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch('http://localhost:8000/', {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(id);
      return response.ok;
    } catch (e) {
      return false;
    }
  }
}

export const autoCommitJob = new AutoCommitJob();
export default autoCommitJob;
