# TourSafe – Tech Stack

> **Project:** TourSafe – Smart Real-Time Tourist Safety Monitoring & Emergency Response System  
> **Team:** TriArch (Sneha C, Madhumitha S, Vishal Lakshmikanthan)  
> **Institution:** Sri Sairam Engineering College, Chennai  
> **Version:** v1.0 – June 2026  
> **GitHub:** https://github.com/CSNEHA20/TOUR_SAFE_IDL.git

---

## 1. Architecture Overview

TourSafe is built on a **MERN-stack foundation extended with Python ML, Blockchain, and IoT layers**. The full system comprises five interconnected technology domains:

1. **Mobile Client** – React Native (Bare CLI) + TypeScript
2. **Backend & Real-Time Engine** – FastAPI (Python) + Redis + MongoDB + Socket.io
3. **Machine Learning Engine** – TensorFlow + ONNX Runtime + LSTM Autoencoder
4. **Blockchain Identity Layer** – Polygon PoS + Solidity + Hardhat + ethers.js
5. **B2G Authority Dashboard** – React.js + Node.js + Express.js + Mapbox GL JS

---

## 2. Mobile Application Layer

### 2.1 Core Framework

| Technology | Version / Config | Purpose & Rationale |
|------------|-----------------|---------------------|
| **React Native (Bare CLI)** | Latest stable | Cross-platform native iOS and Android from a single TypeScript codebase. The bare CLI workflow (NOT Expo managed) is deliberately chosen to ensure full, unrestricted access to native device hardware — specifically the IMU accelerometer at 50Hz polling rates, background location services, and the device's secure hardware enclave — without the abstraction constraints of a managed environment. |
| **TypeScript** | Strict mode | Non-negotiable for this application. Core data structures (GPS coordinate arrays, timestamped IMU telemetry packets, cryptographic key objects) require compile-time type safety to prevent data corruption in life-critical operations. |
| **Android Studio** | Latest stable | Used for AVD (Android Virtual Device) setup targeting API Level 33+, device debugging, APK build validation, and Android emulator testing phases. |
| **Expo (Bare Workflow modules)** | — | Individual Expo SDK modules (Sensors, Location, SecureStore) are used within the bare React Native workflow for hardware access. NOT the Expo managed workflow. |

### 2.2 Mobile State Management

| Technology | Purpose |
|------------|---------|
| **Redux Toolkit** | Global application state management: current safety status, active geo-fence alerts, WebSocket connection state, offline queue metrics. Single source of truth for all UI components. |
| **TanStack Query** | Server-state synchronization: automatic background refetching, cache invalidation, and optimistic updates. Prevents stale data from corrupting the live telemetry view. |

### 2.3 Sensor & Location

| Technology | Configuration | Purpose |
|------------|--------------|---------|
| **Expo Sensors API** | 50Hz polling | Programmatic access to the device's IMU accelerometer. Provides raw Ax, Ay, Az acceleration values at 50 samples per second — the primary input to the LSTM Autoencoder. |
| **Expo Location API** | 1Hz, background | Continuous GPS location tracking at 1 per second. Configured with foreground and background location permissions to ensure tracking when the app is not in the foreground. |

### 2.4 Offline Resilience & Data Layer

| Technology | Purpose |
|------------|---------|
| **SQLite** | Local offline telemetry queue. Stores AES-256-encrypted telemetry payloads with status flags (PENDING, IN_FLIGHT, COMMITTED, FAILED) for offline-first resilience. |
| **AsyncStorage** | Lightweight session state and user preferences storage (not for sensitive data). |
| **AES-256-CBC Encryption** | All offline telemetry payloads are encrypted before SQLite storage using a session-derived symmetric key. Zero data exposure if device is lost during an offline period. |

### 2.5 Maps & Geo-Fencing (Client-Side)

| Technology | Purpose |
|------------|---------|
| **Google Maps API** | Base map rendering for the traveler's location awareness UI within the mobile application. |
| **Turf.js** | Geospatial analysis library for client-side computation of geo-fence boundary checks against cached GeoJSON hazard zone data. Enables offline geo-fence detection — boundary violations can be detected even without any network signal. |

### 2.6 Blockchain Identity (Client-Side)

| Technology | Purpose |
|------------|---------|
| **ethers.js** | Ethereum/Polygon JavaScript library for wallet generation, secp256k1 key pair generation, smart contract interaction, transaction signing, and DID vault management on the client side. |
| **Expo SecureStore / React Native Keychain** | Secure local storage of the tourist's private cryptographic key in the device's secure hardware enclave or hardware-backed keystore. The private key never leaves the device. |

### 2.7 Navigation

| Technology | Purpose |
|------------|---------|
| **React Navigation** | Primary navigation structure: Onboarding Flow (DID registration, medical data entry, emergency contact setup), Home/Dashboard screen, Live Map screen, Emergency Override screen. |

---

## 3. Backend & Real-Time Engine

### 3.1 Core Web Framework

| Technology | Purpose & Rationale |
|------------|---------------------|
| **FastAPI (Python, ASGI)** | The primary backend framework built on the ASGI (Asynchronous Server Gateway Interface) standard. Chosen over Django, Flask, or Spring Boot for two reasons: (1) Native proximity to Python's ML ecosystem (TensorFlow, ONNX Runtime); (2) Native support for high-concurrency async operations via the asyncio event loop. Processing 50Hz sensor data from thousands of concurrent travelers is I/O-bound — FastAPI handles thousands of concurrent WebSocket connections without spawning a new thread per connection. All Pydantic data models are strictly typed for data integrity at the API boundary. |
| **Pydantic** | Data validation and type enforcement for all API models: incoming telemetry packets, anomaly events, and incident dispatch payloads. |
| **asyncio** | Python's native async event loop — the foundation of FastAPI's high-concurrency architecture. |

### 3.2 Real-Time Communication

| Technology | Purpose |
|------------|---------|
| **WebSocket (FastAPI)** | Primary telemetry ingestion endpoint: `/ws/telemetry/{traveler_id}`. Persistent connection open for the duration of the traveler's session. Receives 50Hz telemetry windows continuously; pushes back configuration updates, geo-fence boundary data, and emergency notifications to the client without polling. |
| **Socket.io** | Persistent bidirectional WebSocket event channels between the FastAPI backend and the MERN authority dashboard. Event-driven push model: the millisecond the LSTM anomaly threshold is crossed, a structured incident packet is emitted to all connected authority dashboard clients in the relevant geographic zone. Propagation latency: tens of milliseconds. Chosen over HTTP polling because polling every 5 seconds would introduce up to 5-second notification delays — unacceptable for a life-critical system. |

### 3.3 Data Storage

| Technology | Configuration | Purpose |
|------------|--------------|---------|
| **Redis** | 5-minute TTL on GPS keys | Ultra-fast in-memory cache exclusively for live GPS coordinates of all currently tracked travelers. Key-value store: `traveler_id → {lat, lng, timestamp}`. Sub-millisecond read latency for real-time dashboard map rendering. GPS data with 5-min TTL automatically evicts stale data for offline travelers. |
| **MongoDB** | Atlas managed cluster with geographic replication | Persistent schema-flexible document storage for: Traveler Profile collection (encrypted metadata, DID identifiers, subscription records); Telemetry Archive collection (anonymized logs for heatmap generation); Incident Log collection (full anomaly event records with LSTM traces, GPS, response timestamps); e-FIR Archive (all generated FIRs with dispatch status); Geo-fence GeoJSON Boundaries collection. |

### 3.4 Containerization & DevOps

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerizes all backend services for environment parity between development, staging, and production. |
| **Docker Compose** | Orchestrates multi-container backend: FastAPI server + MongoDB + Redis + e-FIR Node.js microservice + Socket.io relay. Single command to reproduce the full backend. |
| **Kubernetes (EKS/GKE/AKS)** | Production orchestration with horizontal auto-scaling triggered by WebSocket connection count and telemetry ingestion throughput. |
| **GitHub Actions** | CI/CD pipeline: unit tests + integration tests + Hardhat Testnet run on every PR; automated Docker image builds and staging deployment on main branch merges; manual approval required for production deployments. |

---

## 4. Machine Learning Engine

### 4.1 Core ML Stack

| Technology | Purpose |
|------------|---------|
| **TensorFlow + Keras** | LSTM Autoencoder training. Two stacked encoder LSTM layers compress the 150-timestep input to a latent vector; RepeatVector + two decoder LSTM layers reconstruct the sequence. Loss function: Mean Squared Error. Optimizer: Adam. |
| **ONNX Runtime (Python)** | Production inference engine. The trained TF/Keras LSTM model is exported to ONNX format using `tf2onnx`. ONNX Runtime inference is significantly faster than native TensorFlow inference for single-sample prediction tasks (one window evaluated every 1.5 seconds). Deployed in FastAPI async worker pool for non-blocking ML inference. |
| **tf2onnx** | Library for exporting TensorFlow/Keras models to ONNX format for production optimization. |

### 4.2 ML Algorithms

| Algorithm | Role | Key Detail |
|-----------|------|------------|
| **LSTM Autoencoder (Seq2Seq)** | Temporal anomaly detection | Trained only on normal activity data (walking, driving, sitting, hiking). Any deviation produces high Reconstruction Error (MSE). Two-consecutive-window confirmation protocol before emergency alert. |
| **SNN-CAD (Sequential Nearest Neighbor Cumulative Anomaly Detection)** | Spatial trajectory anomaly detection | Computes Hausdorff distance between observed GPS trajectory and historical safe route patterns. Detects geographic deviations into hazardous terrain. AUC ~0.97. |
| **Haversine Distance** | Optimal dispatch routing | Calculates great-circle distance on Earth's curved surface between incident GPS coordinate and all registered emergency resource locations (police, hospitals, EMS). Routes e-FIR to nearest responders. |
| **A_mag Magnitude Formula** | Sensor data pre-processing | `A_mag = sqrt(Ax² + Ay² + Az²)`. Collapses 3-axis accelerometer data into an orientation-invariant scalar. LSTM trains and infers on A_mag — not raw axis data — enabling generalization across all users and device placements. |

---

## 5. Blockchain Identity Layer

### 5.1 Blockchain Network

| Technology | Configuration | Purpose |
|------------|--------------|---------|
| **Polygon PoS** | Amoy Testnet (Chain ID: 80002) → Mainnet | Layer 2 Ethereum-compatible blockchain. Chosen over Ethereum mainnet because Polygon offers sub-second block finality and gas fees of fractions of a cent (vs. Ethereum's $1–$500+ per transaction). Fully EVM-compatible — all Ethereum tooling works natively. |
| **Solidity** | Smart contract language | Implements the Identity Resolution Contract: maintains DID record mappings, handles registration, resolution, and time-limited emergency access grants. |
| **Hardhat** | Development framework | Smart contract compilation, TypeScript unit testing (Chai assertion library), local node for rapid iteration, Amoy Testnet deployment scripts, Hardhat Verify plugin for Polygonscan audit. |
| **ethers.js** | Client + backend | Contract interaction, transaction signing, wallet management, and secp256k1 key pair generation. |

### 5.2 Cryptographic Standards

| Technology | Purpose |
|------------|---------|
| **secp256k1 Asymmetric Key Pairs** | The same elliptic curve standard used by Bitcoin and Ethereum. Generates public-private key pairs during onboarding. Public key stored on-chain; private key stays in device hardware enclave. Medical vault encrypted with public key — only the private key can decrypt. |
| **AES-256** | Symmetric encryption for offline telemetry buffer in SQLite. |
| **Zero-Knowledge Proofs (ZKP)** | Selective credential disclosure — first responders can verify legitimacy without receiving raw personal data until explicitly authorized by an emergency event. |

### 5.3 Decentralized Storage

| Technology | Purpose |
|------------|---------|
| **IPFS (InterPlanetary File System)** | Decentralized storage for encrypted medical data vaults. Content addressed by cryptographic hash. The IPFS CID is anchored in the on-chain DID record. |
| **Pinata + Filecoin** | Dual-pinning services for IPFS vaults — ensures redundancy and high availability for emergency access. |
| **W3C DID Standard** | Each tourist is issued a globally unique Decentralized Identifier (DID) conforming to the W3C DID Core v1.0 specification. |

---

## 6. B2G Authority Dashboard

### 6.1 Frontend

| Technology | Purpose |
|------------|---------|
| **React.js** | Single-page application for the authority dashboard. Views: Live Map, Incident Feed, Traveler Directory, e-FIR Archive. |
| **Mapbox GL JS** | WebGL-based mapping engine for real-time geographic visualization: live GPS tourist positions (color-coded by safety status), incident heatmaps, active geo-fence boundary polygons, and trajectory tracking of tourists in active alerts. |

### 6.2 Backend

| Technology | Purpose |
|------------|---------|
| **Node.js + Express.js** | Dashboard backend microservices: e-FIR generation and dispatch, jurisdictional dispatch routing, agency authentication, traveler telemetry queries, incident management. |
| **JWT Authentication** | Authority agency login and session management for the dashboard. |

### 6.3 e-FIR Engine

- Activates on AI anomaly confirmation
- Retrieves decrypted DID credentials via Emergency Cryptographic Access Key
- Compiles LSTM anomaly log (reconstruction error trace + A_mag time series)
- Formats structured JSON payload + human-readable PDF
- Dispatches both formats to nearest police station + hospital via Haversine-identified endpoints
- Archives complete e-FIR in MongoDB with dispatch status log

---

## 7. Development Tooling

| Tool | Purpose |
|------|---------|
| **Visual Studio Code** | Primary IDE for all development (React Native, FastAPI, Node.js, Solidity). |
| **AnthropicAI Extension (VS Code)** | AI-assisted code generation and refactoring throughout all project modules. |
| **GitHub Copilot** | AI pair programming for IntelliSense, code suggestions, and refactoring across the codebase. |
| **Android Studio** | Android Virtual Device (AVD) emulator setup, device debugging, APK build validation for Android-specific testing phases. |
| **GitHub** | Version control: main branch holds all project documents and base scaffold; feature branches for frontend, backend, and database development. |

---

## 8. IoT Hardware (Physical MVP Prototype)

| Component | Spec | Purpose |
|-----------|------|---------|
| **ESP32 DevKit V1 / Raspberry Pi Pico W** | Built-in Wi-Fi + Bluetooth | Edge compute unit for sensor polling at 50Hz and A_mag calculation before telemetry transmission. |
| **MPU6050 IMU** | 6-axis (accel + gyro), I2C | Primary sensor providing Ax, Ay, Az values for the LSTM anomaly pipeline. |
| **NEO-6M GPS Module** | UART | Real-time latitude/longitude for Haversine dispatch routing and immobility detection. |
| **Momentary Push-Button** | — | Simulates manual SOS override for demo. |
| **18650 Li-ion Battery + TP4056** | USB-C rechargeable | Portable power for untethered field demos. |
| **5V Active Buzzer + RGB LED** | Green/Amber/Red | Visual and audible status feedback (normal / geo-fence breach / confirmed emergency). |

---

## 9. Tech Stack Summary Table

| Category | Technology | Role |
|----------|------------|------|
| Mobile Framework | React Native (Bare CLI) + TypeScript | Cross-platform iOS/Android native app |
| Mobile State | Redux Toolkit + TanStack Query | State management + server-state sync |
| Mobile Maps | Google Maps API + Turf.js | Map rendering + offline geo-fence detection |
| Mobile Sensors | Expo Sensors API (50Hz) | IMU accelerometer for AI anomaly input |
| Mobile Location | Expo Location API (1Hz) | Background GPS tracking |
| Mobile Offline | SQLite + AES-256-CBC + AsyncStorage | Encrypted offline telemetry queue |
| Mobile Identity | ethers.js + Expo SecureStore | DID wallet + secure key storage |
| Mobile Navigation | React Navigation | Screen navigation structure |
| Backend Core | FastAPI (Python, ASGI) | High-concurrency async WebSocket server |
| Backend Cache | Redis | Live GPS sub-millisecond cache |
| Backend Database | MongoDB | Persistent document storage |
| Backend Real-time | Socket.io | Push alerts to authority dashboard |
| ML Training | TensorFlow + Keras | LSTM Autoencoder training |
| ML Inference | ONNX Runtime | Fast production inference (<100ms/window) |
| ML Algorithms | LSTM Autoencoder + SNN-CAD + Haversine | Anomaly detection + routing |
| Blockchain Network | Polygon PoS (Amoy → Mainnet) | DID anchoring (sub-cent gas fees) |
| Smart Contracts | Solidity + Hardhat | Identity Resolution Contract |
| Blockchain Client | ethers.js | Contract interaction + signing |
| Cryptography | secp256k1 + AES-256 + ZKP | Key pairs + offline encryption + privacy |
| Identity Standard | W3C DID Core v1.0 | Self-Sovereign Identity |
| Decentralized Storage | IPFS + Pinata + Filecoin | Encrypted medical vault storage |
| Dashboard Frontend | React.js + Mapbox GL JS | Real-time authority map + incident feed |
| Dashboard Backend | Node.js + Express.js | e-FIR microservice + dispatch routing |
| Dashboard Auth | JWT | Agency authentication |
| Containerization | Docker + Docker Compose | Reproducible multi-service environment |
| Orchestration | Kubernetes (EKS/GKE/AKS) | Production horizontal auto-scaling |
| CI/CD | GitHub Actions | Automated test + build + deploy pipeline |
| Dev IDE | VS Code + AnthropicAI + GitHub Copilot | AI-assisted development |
| Android Testing | Android Studio (AVD, API 33+) | Android emulator testing and APK validation |
| IoT Edge | ESP32 / Raspberry Pi Pico W | Hardware prototype compute |
| IoT Sensors | MPU6050 IMU + NEO-6M GPS | Physical sensor array for prototype |
| Testing (Load) | Locust | Backend load testing (1,000–5,000 concurrent connections) |
| Testing (Contracts) | Hardhat + Chai + TypeScript | Smart contract unit testing |
