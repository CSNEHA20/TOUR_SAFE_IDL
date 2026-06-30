# TourSafe – App Flow & System Design

> **Project:** TourSafe – Smart Real-Time Tourist Safety Monitoring & Emergency Response System  
> **Team:** TriArch (Sneha C, Madhumitha S, Vishal Lakshmikanthan)  
> **Institution:** Sri Sairam Engineering College, Chennai  
> **Version:** v1.0 – June 2026  
> **GitHub:** https://github.com/CSNEHA20/TOUR_SAFE_IDL.git

---

## 1. System Architecture Overview

TourSafe is a three-layer shield system. Each layer addresses a distinct dimension of the tourist safety problem:

```
┌──────────────────────────────────────────────────────┐
│         LAYER 1 — THE WATCHFUL GUARDIAN              │
│         AI Anomaly Engine (LSTM Autoencoder)         │
│         50Hz IMU → A_mag → Sliding Window → ONNX    │
│         Detects: Crash Signature + Unconsciousness   │
└──────────────────────┬───────────────────────────────┘
                       │ Confirms anomaly
┌──────────────────────▼───────────────────────────────┐
│         LAYER 2 — THE BRIDGE OF TRUST                │
│         Blockchain DID Identity Layer                │
│         Polygon PoS → Identity Resolution Contract   │
│         IPFS Medical Vault → Emergency QR Decryption │
└──────────────────────┬───────────────────────────────┘
                       │ Decrypted victim identity
┌──────────────────────▼───────────────────────────────┐
│         LAYER 3 — THE COMMAND CENTRE                 │
│         B2G Dashboard + e-FIR Engine                 │
│         React.js + Mapbox GL JS + Node.js            │
│         Live Map → Auto e-FIR → Police + Hospital    │
└──────────────────────────────────────────────────────┘
```

---

## 2. High-Level System Data Flow

```
📱 TOURIST DEVICE (React Native App)
    │
    ├─ IMU Accelerometer → 50Hz → A_mag Ring Buffer → Sliding Window (150pts / 3s, 50% overlap)
    ├─ GPS Location → 1Hz → Real-time coordinate
    └─ DID Wallet (ethers.js) + QR Code (lock screen)
    │
    ▼ WebSocket /ws/telemetry/{traveler_id}  [or → SQLite AES-256 buffer if offline]
    │
⚡ FASTAPI BACKEND (Python ASGI)
    │
    ├─ Redis Cache ← Live GPS coordinates (5-min TTL, sub-ms read latency)
    ├─ MongoDB ← Telemetry archive, Incident logs, e-FIR archive, Traveler profiles
    ├─ LSTM ONNX Worker Pool ← Telemetry window → Reconstruction Error → Anomaly Check
    └─ SNN-CAD Module ← GPS trajectory → Hausdorff distance → Trajectory anomaly check
    │
    ▼ Socket.io EVENT PUSH (millisecond latency)
    │
🗺️  MERN AUTHORITY DASHBOARD (React.js + Node.js + Mapbox GL JS)
    │
    ├─ Live Map (GPS dots: green/amber/red, heatmaps, geo-fence polygons)
    ├─ Incident Feed (real-time alert stream)
    └─ e-FIR Engine → Haversine routing → Police API + Hospital API
    │
⛓️  POLYGON BLOCKCHAIN
    ├─ Identity Resolution Smart Contract (DID registration, resolution, emergency access grant)
    └─ IPFS (Pinata + Filecoin) — Encrypted medical vault
```

---

## 3. Tourist Mobile App — Screen Flow

### 3.1 Onboarding Flow (First Launch)

```
App Launch
    │
    ▼
Welcome Screen
    │
    ▼
Registration Screen
    ├─ Full name
    ├─ Country / Nationality
    ├─ Aadhaar / Passport verification (KYC)
    └─ Tech Comfort Level
    │
    ▼
Medical Profile Entry
    ├─ Blood type (e.g., A+, O-)
    ├─ Known allergies (e.g., Penicillin)
    ├─ Medication sensitivities
    ├─ Chronic conditions (e.g., Diabetes)
    └─ Travel insurance policy number
    │
    ▼
Emergency Contact Setup
    ├─ Contact name, phone, relationship
    └─ Home country emergency service numbers
    │
    ▼
Blockchain DID Generation (ethers.js)
    ├─ Generate secp256k1 key pair
    ├─ Store private key in Expo SecureStore (hardware enclave)
    ├─ Encrypt medical vault with public key
    ├─ Upload encrypted vault to IPFS → get CID
    ├─ Call smart contract registerDID(publicKeyHash, IPFS_CID)
    └─ Generate personal QR code (DID + signed token) → show on lock screen
    │
    ▼
Permission Requests
    ├─ Background Location Access
    ├─ Motion Sensor / Accelerometer Access
    └─ Push Notification Permission
    │
    ▼
Home Dashboard (Main App)
```

### 3.2 Main App Screen Structure

```
Home Dashboard (Main Screen)
    ├─ Safety Status Indicator (SAFE / ALERT / EMERGENCY)
    ├─ Active Geo-fence Alerts display
    ├─ WebSocket connection status indicator
    ├─ SOS Emergency Button [PRIMARY CTA]
    └─ Navigation to other screens

Live Map Screen
    ├─ Tourist's own GPS position
    ├─ Nearby safe zones (green polygons)
    ├─ Nearby hazard zones (red/amber polygons)
    └─ Geo-fence boundary overlays

Emergency Override Screen
    ├─ Manual SOS button (large, accessible)
    ├─ Shake-to-Alert status
    └─ Code word emergency trigger

Profile / DID Screen
    ├─ QR Code display (always accessible, including lock screen)
    ├─ Medical profile summary
    └─ Emergency contact details

Settings Screen
    ├─ Notification preferences
    ├─ Geo-fence alert thresholds
    └─ Session management / trip close
```

---

## 4. Tourist Journey — Step by Step

### Part A: Setup (Before the Trip)

**Step 1 — Download & Register**  
Tourist downloads the TourSafe app. Enters name, blood type, allergies, medications, emergency contact.

**Step 2 — Digital ID Created**  
TourSafe creates a secure DID (Decentralized Identifier) for the tourist stored on the Polygon blockchain — tamper-proof and unforgeable.

**Step 3 — QR Code Generated**  
The app generates a personal QR code shown on the phone lock screen. Any first responder who scans it gets instant access to the tourist's medical info.

### Part B: During the Trip (Normal Monitoring)

**GPS Tracking (1Hz)**  
App records location every second → transmits to FastAPI backend → cached in Redis → dashboard live map updates.

**IMU Sensor Monitoring (50Hz)**  
Phone's motion sensor captures 50 readings per second. Every 3 seconds, the AI analyzes a batch of 150 readings to check if movement is normal.

**Geo-fence Check (Every GPS Update)**  
Turf.js checks current GPS against all cached GeoJSON hazard zone polygons → push notification if entered → simultaneous amber alert on authority dashboard.

**Offline Mode (No Signal)**  
If network is lost, TourSafe stores all data encrypted (AES-256) on the phone. When signal returns, autocommit flushes the complete historical record to the server — zero data loss.

### Part C: Emergency Detected

**AI Anomaly Confirmed**  
Two consecutive LSTM windows exceed the 99.5th-percentile Reconstruction Error threshold → confirmed anomaly (either CRASH or IMMOBILITY/UNCONSCIOUSNESS).

**Identity Unlocked**  
Blockchain DID is activated. Smart contract grantEmergencyAccess called → encrypted medical vault fetched from IPFS → decrypted using agency's Emergency Cryptographic Access Key → medical info ready.

**e-FIR Auto-Generated**  
e-FIR microservice compiles: incident UUID, timestamp, victim identity + medical data, GPS coordinates, anomaly type, LSTM error trace, geo-fence status.

**Police + Hospital Notified**  
Haversine distance calculation identifies nearest police station and hospital → e-FIR dispatched as JSON + PDF → authority dashboard lights up with the alert.

**Total Time: Under 5 Minutes — All Automated.**

---

## 5. System Design — Component Architecture

### 5.1 Mobile Application Modules

```
React Native App (TypeScript)
├── /screens
│   ├── OnboardingFlow/
│   │   ├── WelcomeScreen.tsx
│   │   ├── RegistrationScreen.tsx
│   │   ├── MedicalProfileScreen.tsx
│   │   ├── EmergencyContactScreen.tsx
│   │   └── DIDGenerationScreen.tsx
│   ├── HomeScreen.tsx (Safety status, SOS button, alerts)
│   ├── LiveMapScreen.tsx (Tourist position, safe/hazard zones)
│   ├── EmergencyOverrideScreen.tsx (Manual SOS, shake-to-alert)
│   ├── ProfileScreen.tsx (QR code, medical profile)
│   └── SettingsScreen.tsx
├── /services
│   ├── sensorService.ts       ← 50Hz IMU polling + A_mag computation
│   ├── locationService.ts     ← 1Hz background GPS
│   ├── telemetryService.ts    ← WebSocket transmission + offline buffer logic
│   ├── geofenceService.ts     ← Turf.js boundary checks
│   ├── didService.ts          ← ethers.js DID wallet + key generation
│   └── emergencyService.ts    ← SOS trigger + manual alert dispatch
├── /store (Redux Toolkit)
│   ├── safetySlice.ts         ← Safety status, alerts
│   ├── offlineQueueSlice.ts   ← SQLite queue metrics
│   └── connectionSlice.ts     ← WebSocket + network state
├── /offline
│   ├── sqliteQueue.ts         ← TelemetryQueue table operations
│   ├── aesEncryption.ts       ← AES-256-CBC encrypt/decrypt
│   └── autoCommitJob.ts       ← Background flush job (every 30s)
└── /blockchain
    ├── keyGeneration.ts        ← secp256k1 key pair
    ├── vaultEncryption.ts      ← Medical data vault encryption
    ├── ipfsUpload.ts           ← IPFS CID upload via Pinata
    ├── contractInteraction.ts  ← registerDID, resolveDID
    └── qrCodeGenerator.ts      ← DID + signed token QR
```

### 5.2 FastAPI Backend Modules

```
FastAPI Backend (Python)
├── /routers
│   ├── telemetry.py         ← WebSocket /ws/telemetry/{traveler_id}
│   ├── registration.py      ← Tourist registration REST endpoints
│   ├── geofence.py          ← Boundary data delivery to clients
│   └── incidents.py         ← Incident history REST queries
├── /models (Pydantic)
│   ├── TelemetryPacket.py   ← traveler_id, timestamp, gps, accel_x/y/z, amag
│   ├── AnomalyEvent.py      ← traveler_id, event_type, reconstruction_error, gps, timestamp
│   └── IncidentDispatch.py  ← Full anomaly + decrypted identity fields
├── /ml
│   ├── onnx_inference.py    ← ONNX Runtime worker pool, A_mag pre-processing
│   ├── snn_cad.py           ← Hausdorff distance trajectory analysis
│   └── threshold.py         ← Anomaly threshold calibration (99.5th percentile)
├── /cache
│   └── redis_gps.py         ← Live GPS coordinate cache (TTL: 5 min)
├── /database
│   └── mongo_client.py      ← Traveler profiles, telemetry archive, incident logs
├── /notifications
│   └── socketio_emitter.py  ← Real-time push to authority dashboard
└── /dispatch
    └── haversine_router.py  ← Nearest police + hospital calculation
```

### 5.3 Blockchain Smart Contract Structure

```
Solidity Smart Contract — Identity Resolution Contract
│
├── struct DIDRecord {
│       bytes32 publicKeyHash;
│       string ipfsCID;
│       uint256 registrationTimestamp;
│       address ownerAddress;
│   }
│
├── mapping(address => DIDRecord) private didRegistry;
│
├── function registerDID(bytes32 _publicKeyHash, string _ipfsCID)
│       external → stores DIDRecord on-chain
│
├── function resolveDID(address _traveler)
│       external view → returns publicKeyHash + ipfsCID
│
├── function grantEmergencyAccess(address _traveler, address _agencyKey)
│       external → emits EmergencyAccessGranted event (time-limited, AI-triggered only)
│
└── function revokeEmergencyAccess(address _traveler, address _agencyKey)
        external → closes temporary access window; logs on-chain
```

### 5.4 B2G Authority Dashboard Modules

```
MERN Dashboard (React.js + Node.js)
├── /frontend (React.js)
│   ├── LiveMapView.jsx         ← Mapbox GL JS: GPS dots (green/amber/red), heatmaps, geo-fences
│   ├── IncidentFeedView.jsx    ← Real-time Socket.io event stream
│   ├── TravelerDirectory.jsx   ← Searchable registry of registered tourists
│   ├── eFIRArchiveView.jsx     ← Generated FIRs with dispatch status
│   └── AuthLogin.jsx           ← JWT agency authentication
├── /backend (Node.js + Express.js)
│   ├── efirService.js          ← Generates JSON + PDF e-FIR on anomaly confirmation
│   ├── dispatchService.js      ← Routes e-FIR to police + hospital via Haversine
│   ├── socketRelay.js          ← Receives Socket.io events from FastAPI; pushes to dashboard
│   └── agencyAuth.js           ← JWT validation middleware
└── /mapbox
    └── heatmapLayer.js         ← Historical incident heatmap rendering
```

---

## 6. Data Flow Diagrams

### 6.1 Normal Monitoring Flow

```
Tourist Phone
    │ Accelerometer 50Hz → A_mag values
    │ GPS 1Hz → lat/lng coordinate
    │
    ▼ WebSocket (persistent connection)
FastAPI Backend
    │ → ONNX LSTM Worker: Reconstruction Error < threshold → NORMAL
    │ → Redis: Update GPS cache (traveler_id → lat/lng)
    │ → MongoDB: Archive telemetry window
    │
    ▼ Redis sub-ms read
Authority Dashboard
    └── Mapbox GL JS: Update live GPS dot for tourist (GREEN)
```

### 6.2 Geo-Fence Breach Flow

```
Tourist Phone (Turf.js offline check)
    │ GPS update → booleanPointInPolygon(GPS, geo_fence_polygons) → TRUE
    │
    ├─ LOCAL: Immediate push notification → Tourist alerted
    └─ TRANSMIT: Geo-fence breach event → FastAPI
                    │
                    ├─ Socket.io push → Dashboard: tourist status → AMBER
                    ├─ MongoDB: Log geo-fence breach event
                    └─ If still in zone after 10min → ESCALATE → Notify duty officer
```

### 6.3 Emergency Response Flow (Full Chain)

```
Tourist Phone
    │ IMU 50Hz: A_mag spike → crash signature detected
    │ OR IMU 50Hz: A_mag flatline at 9.81 m/s² in remote zone → unconsciousness
    │
    ▼ Telemetry window → WebSocket → FastAPI
LSTM ONNX Engine
    │ Window 1: Reconstruction Error > 99.5th percentile threshold → FLAG
    │ Window 2 (1.5s later): Reconstruction Error > threshold again → CONFIRMED ANOMALY
    │
    ▼ Anomaly Event emitted
Simultaneous Parallel Actions:
    │
    ├── Socket.io → Dashboard: Tourist status → RED, Incident packet pushed to authorities
    │
    ├── Blockchain DID Layer:
    │       └── Smart contract: grantEmergencyAccess(traveler, agency_key)
    │           → Fetch encrypted vault from IPFS
    │           → Decrypt vault with agency's Emergency Cryptographic Access Key
    │           → Medical data ready (blood type, allergies, emergency contacts)
    │
    └── e-FIR Microservice:
            ├── Compile: incident UUID + timestamp + decrypted victim identity
            ├── Add: GPS coordinates + LSTM error trace + anomaly type + geo-fence status
            ├── Format: JSON payload + PDF document
            ├── Haversine routing: find nearest police station + nearest hospital
            └── DISPATCH → Police API endpoint + Hospital Emergency API endpoint

Total: Accident → Detection → Identity → e-FIR → Police + Hospital Notified
Time: Under 5 Minutes | Fully Automated | No Human Needed to Start Chain
```

### 6.4 Offline Recovery Flow

```
Tourist Phone (no signal zone)
    │ Network ping → TIMEOUT
    │
    ├── Serialize telemetry payload → JSON
    ├── Encrypt → AES-256-CBC (session key)
    └── Insert → SQLite TelemetryQueue (status: PENDING)

Background Job (every 30 seconds):
    │ Network ping → SUCCESS
    │
    ├── Select all PENDING rows from SQLite (chronological order)
    ├── Transmit each row → WebSocket → FastAPI
    ├── Mark each row → COMMITTED
    └── Complete: Zero data loss guaranteed
```

---

## 7. Module Dependency Map

| Module | Depends On | Consumed By |
|--------|-----------|-------------|
| React Native App | FastAPI WebSocket, Polygon RPC, Google Maps API, IPFS | Tourist (end user) |
| Sensor Pipeline | Expo Sensors API, Expo Location API, Redux | SQLite Buffer, WebSocket Transmitter |
| SQLite Offline Buffer | AES-256 key, TelemetryQueue schema | Autocommit Job, WebSocket Transmitter |
| FastAPI WebSocket Handler | Pydantic models, asyncio, ONNX Runtime | Redis, MongoDB, Anomaly Engine |
| LSTM ONNX Engine | ONNX model file, A_mag pre-processing | Anomaly Event Emitter, e-FIR Service |
| SNN-CAD Algorithm | Historical safe route GeoJSON, Hausdorff lib | Anomaly Event Emitter, Dashboard |
| Haversine Router | Emergency resource location DB (police, hospitals) | e-FIR Microservice dispatch targets |
| Redis GPS Cache | FastAPI write ops, Redis instance | MERN Dashboard live map |
| MongoDB | FastAPI + Node.js writes | Dashboard queries, e-FIR archive, heatmaps |
| Socket.io Emitter | FastAPI anomaly confirmation | MERN Dashboard real-time incident feed |
| Polygon Smart Contract | Hardhat deployment, Polygon RPC | Mobile DID registration, e-FIR emergency access |
| IPFS Vault | Public key encryption, Pinata/Web3.Storage | e-FIR microservice, first responder QR access |
| e-FIR Microservice | LSTM anomaly payload, Decrypted DID, Haversine | Police API, Hospital Emergency API |
| MERN Dashboard | Socket.io stream, REST APIs, Mapbox GL JS, MongoDB | Authority operators |
| Mapbox GL JS | Redis live GPS, GeoJSON geo-fences, heatmap data | Dashboard Live Map View |

---

## 8. API Endpoints Reference

### 8.1 FastAPI Backend Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `WS` | `/ws/telemetry/{traveler_id}` | Primary telemetry ingestion WebSocket. Persistent connection per traveler session. |
| `POST` | `/api/register` | Tourist registration — creates traveler profile in MongoDB. |
| `POST` | `/api/did/register` | Anchors DID public key hash + IPFS CID on-chain. |
| `GET` | `/api/geofence/boundaries` | Returns GeoJSON polygon collection of all hazard zones for client-side caching. |
| `GET` | `/api/incidents/{traveler_id}` | Returns incident history for a specific traveler. |
| `POST` | `/api/sos/manual` | Manual SOS trigger endpoint — initiates full emergency response chain. |

### 8.2 Authority Dashboard Backend Endpoints (Node.js/Express.js)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/login` | Agency authentication — returns JWT token. |
| `GET` | `/dashboard/live-tourists` | Returns all live GPS positions (reads from Redis). |
| `GET` | `/dashboard/incidents` | Returns recent incident feed with full anomaly details. |
| `GET` | `/dashboard/tourists` | Searchable traveler directory. |
| `GET` | `/dashboard/efirs` | e-FIR archive with dispatch status. |
| `POST` | `/efir/generate` | Manually triggers e-FIR generation (authority override). |
| `GET` | `/heatmap/data` | Returns aggregated incident heatmap data for Mapbox. |

---

## 9. Sprint-Based Development Flow

### Sprint 1 — Core Infrastructure & Scaffolding
- Docker Compose: FastAPI + MongoDB + Redis containers
- FastAPI backbone with Pydantic models and WebSocket handler scaffold
- MERN dashboard scaffolding with Mapbox GL JS and JWT auth
- React Native app skeleton: all screens, React Navigation, permission requests
- Android Studio AVD setup (API Level 33+)

### Sprint 2 — Client Telemetry & Offline Caching
- Expo Sensors API: 50Hz IMU polling + A_mag computation + sliding window accumulator
- Expo Location API: 1Hz background GPS → WebSocket transmission
- SQLite offline buffer: TelemetryQueue table + AES-256-CBC encryption + autocommit job
- Turf.js geo-fence client: offline polygon checking + push notification on breach
- Test: offline → no-signal → reconnect → data sync

### Sprint 3 — ML Execution & Authority Communication
- LSTM Autoencoder: design, training on normal activity dataset, MSE loss, Adam optimizer
- ONNX export (tf2onnx) + ONNX Runtime worker pool in FastAPI (async, non-blocking)
- Reconstruction error threshold calibration (99.5th percentile on holdout validation set)
- Two-stage confirmation protocol implementation
- SNN-CAD integration: Hausdorff distance, safe route GeoJSON, trajectory hazard detection
- Socket.io integration: FastAPI anomaly → dashboard real-time alert push

### Sprint 4 — Blockchain DID & e-FIR Automation
- Solidity Identity Resolution Contract: registerDID, resolveDID, grantEmergencyAccess, revokeEmergencyAccess
- Hardhat unit tests (TypeScript + Chai) → Polygon Amoy Testnet deployment
- Mobile DID onboarding: secp256k1 key generation, vault encryption, IPFS upload, on-chain registration
- QR code generation and emergency decryption flow for first responders
- e-FIR microservice: compile JSON + PDF → Haversine routing → police + hospital dispatch → MongoDB archive

---

## 10. Key Performance Targets

| Metric | Target |
|--------|--------|
| Emergency response time (end-to-end) | < 5 minutes |
| Response time reduction vs. baseline (30–40 min) | 70% |
| LSTM inference latency per window | < 100 ms |
| Socket.io alert propagation latency | Tens of milliseconds |
| DID QR scan → medical data displayed | < 15 seconds |
| e-FIR dispatch latency | < 60 seconds |
| Offline data recovery rate | > 99.9% |
| LSTM false positive rate (post two-stage confirmation) | < 2% |
| 99th-percentile anomaly detection latency at peak load | < 500 ms |
| SNN-CAD AUC | ~0.97 |
| Concurrent travelers at initial rollout | 5,000+ |
