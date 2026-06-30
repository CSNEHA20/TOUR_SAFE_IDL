# TourSafe – Requirements Document

> **Project:** TourSafe – Smart Real-Time Tourist Safety Monitoring & Emergency Response System  
> **Team:** TriArch (Sneha C, Madhumitha S, Vishal Lakshmikanthan)  
> **Institution:** Sri Sairam Engineering College, Chennai  
> **Department:** Computer Science & Engineering  
> **Version:** v1.0 – June 2026  
> **GitHub:** https://github.com/CSNEHA20/TOUR_SAFE_IDL.git

---

## 1. Project Overview

TourSafe is an intelligent, technology-driven tourist safety solution that integrates Artificial Intelligence (AI), Geo-Fencing, and Blockchain-based Digital Identity Management. The system is designed to ensure tourist safety, especially in remote and high-risk regions, by addressing the critical 30–40 minute emergency response delay through autonomous AI detection, instant identity verification, and automated emergency dispatch.

The platform targets a **70% reduction in emergency response latency** — compressing the identification-to-dispatch window from a fatal 20–30 minute lag to under 5 minutes. This preserves the critical "Golden Hour" for life-saving medical intervention.

---

## 2. Problem Statement

### 2.1 Core Problems Identified

**Problem 1 – No Automatic Detection:**  
If a tourist is unconscious, they cannot press an SOS button. Current systems are entirely useless when the traveler is most in need. There is no AI-based anomaly detection infrastructure and no geo-fencing for high-risk zones.

**Problem 2 – Unknown Identity:**  
Over 6,000 unique valid ID document types exist globally. Police cannot read a foreign ID. There is no accessible record of blood type, allergies, medications, or emergency contacts. Cross-border data localization restrictions legally prevent local authorities from accessing a foreign tourist's critical medical history.

**Problem 3 – Slow Emergency Response:**  
In remote areas, emergency response takes up to 30–40 minutes. Each lost minute results in a 7–10% drop in survival probability for cardiac arrest or severe trauma. Urban EMS achieves 90% coverage in under 9 minutes; rural areas are up to 3x slower.

**Problem 4 – Fragmented Legacy Systems:**  
The existing emergency infrastructure relies on paper-based reporting, manual data entry, phone-based dispatch, and siloed databases across police, EMS, and hospitals. No automated pipeline simultaneously identifies a victim, locates the nearest resources, generates a standardized incident report, and dispatches multiple agencies within seconds.

### 2.2 The "Golden Hour" Timeline (Current State)

| Minute | What Happens |
|--------|-------------|
| 0–5 | Accident happens. Nobody knows. |
| 5–20 | Someone finds the victim. No ID. No medical info. Cannot call family. |
| 20–30 | Police arrive. Paperwork begins. Hospital notified separately. |
| 30+ | Help arrives. Survival probability has already dropped 20–30%. |

**TourSafe Goal:** Compress all of the above into under 5 minutes, automatically.

### 2.3 Statistical Justification

- Injuries are the leading cause of non-natural death for international travelers — up to 25% of all traveler fatalities.
- Injuries exceed infectious diseases as a cause of traveler death by a factor of up to 25 times.
- 70% of women avoid solo travel due to safety concerns.
- 96% would travel to risky areas with safe-certified support.
- 25% of solo travelers felt unsafe in the last year.
- 29% of solo travelers faced scams or theft.
- 42% find traditional travel insurance ineffective for daily safety.
- 80% of surveyed tourists agreed that existing safety solutions are insufficient.
- 90% of tour operators supported authority-connected safety monitoring.

---

## 3. Stakeholders

| Stakeholder | Role |
|-------------|------|
| Tourists (domestic & international) | Primary end users of the mobile application |
| Solo female travelers | High-priority target — 84% of all independent travelers |
| Adventure seekers / hikers | High-risk activity group requiring real-time monitoring |
| Families traveling to remote areas | Safety-conscious group needing emergency support |
| Corporate travelers | Travelers needing trusted safety support |
| Local law enforcement / police | Authority dashboard users; e-FIR recipients |
| Emergency Medical Services (EMS) | Responders receiving automated e-FIR and alerts |
| Hospital emergency departments | Receiving dispatch notifications with pre-filled victim data |
| Tourism Safety Officers | Dashboard users monitoring tourist clusters and zones |
| State Tourism Departments | B2G clients; Safe Zone licensing customers |
| Travel agencies & tour operators | B2B commission model clients |

---

## 4. Functional Requirements

### 4.1 Tourist Mobile Application

#### 4.1.1 User Registration & Onboarding
- **FR-01:** The system shall allow tourists to register using verified KYC or passport credentials.
- **FR-02:** The system shall generate a unique blockchain-based Digital ID (DID) for each registered tourist upon onboarding.
- **FR-03:** The onboarding flow shall collect: full name, blood type, known allergies and medication sensitivities, chronic medical conditions, emergency contact details (name, phone, relationship), home country emergency service numbers, and travel insurance policy identifiers.
- **FR-04:** The system shall generate a personal QR code for each tourist, displayed on the app's lock screen, that encodes the tourist's DID identifier and a signed verification token.
- **FR-05:** The system shall support digital identity verification through Aadhaar or passport authentication, ensuring tamper-proof and trustworthy identity management.

#### 4.1.2 Live Location Tracking
- **FR-06:** The application shall continuously track the tourist's GPS location at 1Hz (once per second) using background location services.
- **FR-07:** The application shall transmit GPS coordinates in real-time to the FastAPI backend via WebSocket.
- **FR-08:** The application shall maintain location tracking even when the app is in the background or the device screen is off.
- **FR-09:** The system shall cache GPS data in Redis on the backend for sub-millisecond dashboard access with a 5-minute TTL for stale data eviction.

#### 4.1.3 Geo-Fencing & Zone Alerts
- **FR-10:** The application shall load geo-fence boundary data (GeoJSON polygon format) from the server during session initialization.
- **FR-11:** The application shall perform client-side geo-fence boundary checks using Turf.js against cached GeoJSON hazard zone data, enabling offline geo-fence detection without network connectivity.
- **FR-12:** The application shall display an immediate push notification warning the tourist when they enter a geo-fenced hazardous zone.
- **FR-13:** The system shall simultaneously notify the B2G authority dashboard via Socket.io when a geo-fence breach is detected, updating the tourist's status indicator to amber.
- **FR-14:** If a tourist remains in a hazardous zone for more than 10 minutes (configurable) without a confirmed safe exit, the system shall escalate the alert status and notify the duty officer.

#### 4.1.4 SOS Emergency Features
- **FR-15:** The application shall provide a one-touch SOS emergency button on the home screen.
- **FR-16:** The application shall implement a "Shake-to-Alert" feature that triggers an SOS when the device detects a specific shake pattern.
- **FR-17:** The application shall support predefined code words for discreet emergency triggering (for situations where visible SOS activation is dangerous).
- **FR-18:** The application shall include an Emergency Override screen for conscious users who wish to manually trigger an alert.
- **FR-19:** Manual SOS triggers shall initiate the same automated response chain as AI-detected emergencies.

#### 4.1.5 AI-Based Anomaly Detection (Core Feature)
- **FR-20:** The application shall poll the device's IMU accelerometer sensor at 50Hz (50 samples per second) continuously in the background.
- **FR-21:** Each raw accelerometer sample (Ax, Ay, Az) shall be processed using the Total Acceleration Magnitude formula: `A_mag = sqrt(Ax² + Ay² + Az²)`.
- **FR-22:** The application shall accumulate sensor samples in an in-memory ring buffer and produce a sliding window of 150 data points (3 seconds at 50Hz) with a 50% overlap (new window every 1.5 seconds).
- **FR-23:** Each telemetry window (with GPS coordinate and timestamp) shall be transmitted to the FastAPI backend for LSTM Autoencoder inference.
- **FR-24:** The backend LSTM ONNX inference engine shall evaluate each window and compute a Reconstruction Error (Mean Squared Error between input and reconstruction).
- **FR-25:** A first-stage anomaly flag shall trigger when the Reconstruction Error crosses the calibrated 99.5th-percentile threshold.
- **FR-26:** A confirmed anomaly shall be classified only when two consecutive overlapping windows both exceed the threshold, eliminating single-window noise spikes.
- **FR-27:** The system shall detect two emergency types:
  - **Crash/Physical Impact:** Massive instantaneous spike in A_mag (high G-force event) followed by chaos or stillness.
  - **Immobility/Unconsciousness:** IMU flatline at approximately 9.81 m/s² (Earth's gravity) persisting across multiple windows, co-occurring with a static GPS coordinate in a remote/isolated zone.

#### 4.1.6 Offline-First Resilience (Core Feature)
- **FR-28:** The application shall implement a network interceptor that detects loss of connectivity before every WebSocket transmission attempt.
- **FR-29:** When offline, all telemetry payloads shall be serialized to JSON, encrypted using AES-256-CBC with a session-derived symmetric key, and queued in a local SQLite database (TelemetryQueue table).
- **FR-30:** A background autocommit job shall poll network status every 30 seconds and, upon restored connectivity, flush all PENDING rows from the SQLite queue to the server in chronological order.
- **FR-31:** Successfully transmitted rows shall be marked as COMMITTED; the system shall target a 99.9%+ offline data recovery rate.
- **FR-32:** Geo-fence boundary checks (via Turf.js) shall function fully offline using locally cached GeoJSON data.

### 4.2 Blockchain Digital Identity (DID) Layer

- **FR-33:** The application shall generate a secp256k1 asymmetric key pair (public + private) during onboarding using ethers.js.
- **FR-34:** The private key shall be stored exclusively in the device's secure hardware enclave using Expo SecureStore and shall never leave the device.
- **FR-35:** The tourist's medical data vault shall be encrypted using the public key and stored on IPFS (via Pinata or Web3.Storage), returning an IPFS Content Identifier (CID).
- **FR-36:** The CID and public key hash shall be anchored on-chain via the Identity Resolution Smart Contract on the Polygon PoS network (Amoy Testnet for development; Mainnet for production).
- **FR-37:** The DID shall conform to the W3C Decentralized Identifier (DID) standard.
- **FR-38:** Upon a confirmed AI emergency, the backend shall call the smart contract's `grantEmergencyAccess` function using the government agency's registered Emergency Cryptographic Access Key, granting time-limited decryption of the victim's medical vault.
- **FR-39:** The encrypted vault shall be dual-pinned to both Pinata and Filecoin for redundancy.
- **FR-40:** Every emergency access event shall be recorded as an immutable transaction on the Polygon blockchain, creating a permanent, tamper-proof audit trail.
- **FR-41:** The smart contract shall implement: `registerDID`, `resolveDID`, `grantEmergencyAccess`, and `revokeEmergencyAccess` functions.

### 4.3 B2G Authority Dashboard

- **FR-42:** The dashboard shall display real-time GPS dots for all currently tracked tourists in the authority's jurisdiction, color-coded by safety status (green = normal, amber = geo-fence alert, red = confirmed emergency).
- **FR-43:** The dashboard shall render live incident heatmap overlays aggregating historical anomaly data to reveal high-risk geographic zones.
- **FR-44:** The dashboard shall display active geo-fence boundary polygons on the map.
- **FR-45:** The dashboard shall show real-time trajectories of tourists who have triggered active anomaly alerts.
- **FR-46:** The dashboard shall provide a searchable Traveler Directory for all registered tourists in the jurisdiction.
- **FR-47:** The dashboard shall implement authority agency login using JWT token authentication.
- **FR-48:** Upon AI anomaly confirmation, the e-FIR engine shall automatically compile and dispatch a structured incident report (JSON + PDF formats) to the nearest police station and hospital, determined by Haversine distance calculation.
- **FR-49:** The e-FIR shall include: auto-generated UUID, incident timestamp, victim identity (decrypted from DID), blood type and allergies, emergency contacts, incident GPS coordinates, anomaly classification (CRASH or IMMOBILITY), LSTM reconstruction error trace, dispatch targets, geo-fence status, and offline data flag.
- **FR-50:** The SNN-CAD algorithm shall monitor tourist GPS trajectories and alert authorities when a tourist deviates significantly from established safe routes into hazardous terrain (AUC ~0.97).
- **FR-51:** The Haversine Distance formula shall be used to determine the nearest police station and hospital from the incident GPS coordinate for dispatch routing.

### 4.4 MVP Core Features (Initial Build Priority)

The following two features are the primary focus for the base prototype to be pushed to the main branch:

1. **SOS Emergency Button** – One-touch manual SOS trigger with the full response chain (identity unlock → e-FIR generation → police + hospital notification).
2. **AI-Based Anomaly Detection** – LSTM Autoencoder processing 50Hz IMU data to autonomously detect crashes and unconsciousness.

The MVP shall also include: user registration, blockchain digital ID generation, live GPS location tracking, and basic geo-fence alert display.

---

## 5. Non-Functional Requirements

### 5.1 Performance
- **NFR-01:** The LSTM ONNX inference engine shall complete inference within 100 milliseconds per telemetry window.
- **NFR-02:** The total emergency response pipeline (accident → AI detection → identity unlock → e-FIR generation → police + hospital notified) shall complete in under 5 minutes.
- **NFR-03:** DID resolution latency (QR code scan → decrypted medical data displayed) shall be under 15 seconds.
- **NFR-04:** e-FIR dispatch latency (AI anomaly confirmation → delivery to police and hospital) shall be under 60 seconds.
- **NFR-05:** The 99th-percentile response latency for anomaly detection (telemetry receipt → Socket.io dashboard push) shall remain under 500 milliseconds at peak load.
- **NFR-06:** The Redis GPS cache shall provide sub-millisecond read latency for real-time dashboard map rendering.
- **NFR-07:** The system shall handle 1,000 concurrent WebSocket connections each sending 50Hz telemetry (50,000 data points/second total ingestion rate).
- **NFR-08:** The system shall handle 5,000 concurrent WebSocket connections with 10% simultaneously triggering anomaly events (500 simultaneous e-FIR generation requests).

### 5.2 Reliability & Availability
- **NFR-09:** The offline telemetry buffer shall achieve a data recovery rate greater than 99.9% for data captured during zero-connectivity periods.
- **NFR-10:** The IPFS medical vault shall be dual-pinned to Pinata and Filecoin for redundancy; a MongoDB-backed encrypted fallback shall also be maintained.
- **NFR-11:** The backend shall be deployable as a horizontally scalable Kubernetes deployment with auto-scaling.
- **NFR-12:** MongoDB shall be deployed as a managed Atlas cluster with geographic replication for data residency compliance.

### 5.3 Security
- **NFR-13:** All offline telemetry data shall be encrypted with AES-256-CBC before being stored in the SQLite offline buffer.
- **NFR-14:** The tourist's private cryptographic key shall be stored exclusively in the device's hardware-backed secure enclave (Expo SecureStore / Android Keystore).
- **NFR-15:** Emergency Cryptographic Access Keys shall only be activated when an AI-confirmed emergency payload has been fired for that specific tourist; access shall be time-limited.
- **NFR-16:** The smart contract shall enforce that no entity — including TourSafe administrative accounts — can decrypt tourist medical data outside of a confirmed AI emergency event.
- **NFR-17:** The smart contract shall undergo a mandatory third-party security audit before mainnet deployment.
- **NFR-18:** All sensitive medical data shall be implemented with a Privacy-First Architecture with end-to-end encryption, and all data shall stay within sovereign borders per applicable law.

### 5.4 Privacy & Compliance
- **NFR-19:** Zero-Knowledge Proofs (ZKP) shall be used for selective credential disclosure — a first responder can confirm legitimacy without receiving raw personal data until explicitly authorized.
- **NFR-20:** All raw telemetry data (GPS, IMU, trajectory logs) shall be automatically purged from TourSafe servers at the conclusion of each trip (24 hours after the traveler's registered return date or manual session close). Only anonymized, aggregated incident data shall be retained long-term.
- **NFR-21:** The system shall implement a jurisdiction-aware data architecture ensuring traveler data is processed and stored in cloud regions matching the traveler's destination country.
- **NFR-22:** The system shall comply with: India PDPA, EU GDPR, CCPA (California), India IT Act 2000, and India IT Amendment Act 2008.

### 5.5 Usability
- **NFR-23:** The tourist app shall provide an intuitive user interface requiring no technical expertise for all safety features, including one-touch SOS.
- **NFR-24:** The QR code emergency access flow shall display the tourist's critical medical information on the first responder's screen within 15 seconds of a scan.
- **NFR-25:** The authority dashboard shall be accessible via a standard web browser without requiring specialized software installation.

### 5.6 Battery Optimization
- **NFR-26:** The application shall implement adaptive sensor polling: 50Hz during active travel, reduced to 5Hz during stationary periods (detected by GPS stability).
- **NFR-27:** The application shall implement foreground/background sensor management compliant with iOS and Android battery optimization guidelines.

---

## 6. AI Model Requirements

### 6.1 LSTM Autoencoder Specifications
- **Model Type:** Sequence-to-Sequence LSTM Autoencoder (TensorFlow/Keras)
- **Input:** A_mag time series (150 timesteps per window, 50Hz × 3 seconds)
- **Encoder:** 2 stacked LSTM layers (compresses input to compact latent vector)
- **Decoder:** RepeatVector layer + 2 LSTM layers (reconstructs the original sequence)
- **Training Data:** Labeled normal activity data — walking, driving, sitting, light hiking
- **Loss Function:** Mean Squared Error (MSE)
- **Optimizer:** Adam
- **Anomaly Threshold:** 99.5th percentile of reconstruction errors on normal validation data
- **False Positive Rate Target:** Less than 2% of flags result in unnecessary emergency dispatch after two-stage confirmation
- **Production Format:** Exported to ONNX Runtime for sub-100ms inference latency
- **Deployment:** FastAPI async worker pool (non-blocking ML inference)

### 6.2 SNN-CAD Algorithm
- **Purpose:** Spatial trajectory anomaly detection (complements LSTM temporal analysis)
- **Input:** Time-ordered GPS coordinate trajectory
- **Method:** Hausdorff distance between observed trajectory and historical safe route patterns
- **AUC:** ~0.97 (exceptional discrimination between safe deviations and genuinely dangerous excursions)
- **Output:** Predictive hazard alert before an accident occurs

---

## 7. Hardware MVP Prototype Requirements (Validation)

| Component | Purpose |
|-----------|---------|
| ESP32 DevKit V1 or Raspberry Pi Pico W | Edge compute with Wi-Fi/Bluetooth for sensor telemetry transmission |
| MPU6050 IMU Module (6-axis, I2C) | Provides raw Ax, Ay, Az accelerometer data at 50Hz |
| NEO-6M GPS Module (UART) | Provides real-time latitude/longitude coordinates |
| Momentary Push-Button | Simulates manual SOS override |
| 18650 Li-ion Battery + TP4056 Module | Portable rechargeable power for untethered field demo |
| 5V Active Buzzer + RGB LED | Visual (green/amber/red) and audible status feedback |

### 7.1 Physical Testing Protocol
- **Crash Detection Validation:** MPU6050 subjected to high-G-force impulses; A_mag spike transmitted to LSTM → confirmed anomaly → e-FIR generated within seconds.
- **Offline Buffer Validation:** Wi-Fi disabled mid-session → telemetry accumulates in buffer → Wi-Fi re-enabled → autocommit flush restores complete data to server.
- **Geo-Fence Breach Validation:** GPS position spoofed to simulate hazard zone entry → immediate amber alert on dashboard + push notification.

---

## 8. SDG Alignment

| SDG Goal | Target | TourSafe's Contribution |
|----------|--------|------------------------|
| SDG 8 – Decent Work & Economic Growth | Target 8.9 – Sustainable Tourism | Protects the tourism economy (₹15.73 Lakh Crore in India alone); drives revenue to vetted local businesses; prevents safety incidents that deter travelers and suppress destination revenue. |
| SDG 11 – Sustainable Cities & Communities | Target 11.7 – Safe Public Spaces | Audits city infrastructure and local zones for travelers; makes tourist destinations safer and more resilient through proactive monitoring and faster response infrastructure. |
| SDG 16 – Peace, Justice & Strong Institutions | Target 16.1 – Reduce Violence | Strengthens law enforcement capacity via automated e-FIR system; improves speed, accuracy, and accountability of tourist safety incident response; reduces violence through 24/7 real-time emergency response. |

---

## 9. Business Model Requirements

### 9.1 B2G Zone Licensing
- Annual license fee: ₹2 Crore per designated Safe Zone.
- Includes: Full authority dashboard access, real-time monitoring, incident heatmaps, automated e-FIR, and aggregated safety intelligence reports.

### 9.2 B2B Per-Trip Commission
- Per-trip fee: ₹499 per traveler per registered trip.
- Partners: Travel agencies, tour operators, hotel groups, adventure tourism companies.
- Benefit: Access to lightweight safety dashboard + 'TourSafe Certified' marketing designation.

### 9.3 Financial Targets
- Break-even: End of Year 1
- Year 1 Revenue: $800,000 | Net Profit: $150,000
- Year 2 Revenue: $2.5M | Net Profit: $700,000
- Year 5 Revenue: $12M (scaling to international tourism boards)
- Seed Funding Required: $1,000,000 (50% platform development, 30% marketing, 20% operational)

---

## 10. Key Performance Indicators (KPIs)

| KPI | Definition | Target |
|-----|------------|--------|
| Mean Time to Respond (MTTR) | AI anomaly confirmation → first responder e-FIR acknowledgment | < 5 minutes |
| Emergency Response Time Reduction | Compared to current 30–40 minute baseline | 70% reduction |
| False Positive Rate | LSTM flags not corresponding to genuine emergencies (post two-stage confirmation) | < 2% |
| Active User Monitoring Coverage | Travelers actively tracked by TourSafe at any given moment | 5,000+ (within 12 months) |
| Offline Data Recovery Rate | Telemetry captured offline → successfully delivered via autocommit | > 99.9% |
| DID Resolution Latency | QR scan → decrypted medical data displayed | < 15 seconds |
| e-FIR Dispatch Latency | AI anomaly confirmation → delivery to police + hospital | < 60 seconds |
| AI Accuracy Threshold | LSTM anomaly detection confidence before alert fires | 95% confidence interval |
| Tourist Arrival Boost | Projected increase following safety framework implementation | 15% |

---

## 11. Constraints & Assumptions

- The mobile application is built using React Native (bare CLI) with TypeScript for cross-platform iOS and Android support.
- Android Studio is used for emulator testing (Android Virtual Device, API Level 33+).
- VS Code with AnthropicAI extension and GitHub Copilot is the primary development IDE.
- Smart contracts are deployed on Polygon Amoy Testnet (Chain ID: 80002) during development; Polygon PoS Mainnet for production.
- All Solidity contracts must pass a mandatory third-party security audit before mainnet deployment.
- No source code is assumed pre-existing; all modules are built from scratch.
- The GitHub repository (main branch) shall serve as the single source of truth for base project documents and the initial prototype scaffold.
- Team members work in separate feature branches (frontend, backend, database) cloned from main.
