# TourSafe – Frontend Requirements

> **Project:** TourSafe – Smart Real-Time Tourist Safety Monitoring & Emergency Response System  
> **Team:** TriArch (Sneha C, Madhumitha S, Vishal Lakshmikanthan)  
> **Institution:** Sri Sairam Engineering College, Chennai  
> **Version:** v1.0 – June 2026  
> **GitHub:** https://github.com/CSNEHA20/TOUR_SAFE_IDL.git

---

## 1. Frontend Overview

TourSafe's frontend consists of two separate applications:

1. **Tourist Mobile Application** — React Native (Bare CLI) + TypeScript for iOS and Android
2. **B2G Authority Dashboard** — React.js + Mapbox GL JS, web-based for police, EMS, and tourism safety officers

Both frontends must operate in real time, handle offline scenarios gracefully, and present life-critical information with absolute clarity.

---

## 2. Tourist Mobile Application

### 2.1 Technology Stack (Mobile)

| Technology | Version / Config | Notes |
|------------|-----------------|-------|
| React Native (Bare CLI) | Latest stable | NOT Expo managed workflow — bare CLI for unrestricted hardware access |
| TypeScript | Strict mode | Mandatory — compile-time type safety for life-critical data structures |
| React Navigation | v6+ | Primary navigation library |
| Redux Toolkit | Latest | Global state management |
| TanStack Query | Latest | Server-state synchronization |
| Expo Sensors API | Bare workflow module | 50Hz IMU accelerometer access |
| Expo Location API | Bare workflow module | 1Hz background GPS |
| Expo SecureStore | Bare workflow module | Hardware-backed private key storage |
| Google Maps API | Latest | Base map rendering in traveler's UI |
| Turf.js | Latest | Client-side geo-fence boundary computation (offline-capable) |
| ethers.js | v6+ | DID wallet, key generation, contract interaction |
| SQLite | react-native-sqlite-storage | Encrypted offline telemetry queue |
| AsyncStorage | @react-native-async-storage | Lightweight session state + preferences |
| Redux Toolkit | Latest | Safety status, geo-fence alerts, connection state |
| Socket.io Client | Latest | Real-time server event reception (optional client-push from backend) |

### 2.2 Development & Testing Environment

- **Primary IDE:** Visual Studio Code with AnthropicAI extension + GitHub Copilot
- **Android Testing:** Android Studio with AVD (Android Virtual Device), API Level 33+
- **iOS Testing:** Xcode Simulator (for iOS builds)
- **Target Platforms:** iOS and Android (single codebase)

---

## 3. Mobile Application — Screen-by-Screen Requirements

### 3.1 Splash / Welcome Screen

**Purpose:** First impression; brief brand identity display.

**UI Elements:**
- TourSafe logo and tagline ("Your Silent Guardian")
- Loading animation (brief — proceeds to onboarding or home)

**Logic:**
- Check if user is already registered (AsyncStorage lookup)
- If registered → navigate to Home Dashboard
- If not registered → navigate to Onboarding Flow

---

### 3.2 Onboarding Flow (5 sequential screens)

#### Screen 1 — Registration

**UI Elements:**
- Full Name input field
- Country / Nationality selector (dropdown)
- Aadhaar card number input OR Passport number input (toggle)
- Document upload/scan option for passport photo page
- Tech Comfort Level selector (Low / Medium / High)
- "Continue" button

**Validations:**
- Name: non-empty, alphabets only
- Aadhaar: 12-digit number validation
- Passport: alphanumeric format validation
- KYC verification must succeed before proceeding

---

#### Screen 2 — Medical Profile

**UI Elements:**
- Blood Type selector: A+, A-, B+, B-, AB+, AB-, O+, O-
- Allergies: multi-tag input (e.g., "Penicillin", "Latex", "Nuts")
- Medication sensitivities: free-text input
- Chronic conditions: multi-tag input (e.g., "Diabetes", "Hypertension")
- Travel insurance policy number: text input
- "Continue" button

**Design Note:**  
This screen is critical — errors here can cost a life. All fields must be clearly labeled. Blood type must be mandatory. Display a note: "This information will only be accessed by emergency responders during a confirmed emergency."

---

#### Screen 3 — Emergency Contact

**UI Elements:**
- Emergency contact full name
- Emergency contact phone number (with country code selector)
- Relationship (dropdown: Family / Friend / Doctor / Other)
- Home country emergency service number (e.g., 112, 911, 999)
- "Add another contact" option (up to 3 contacts)
- "Continue" button

---

#### Screen 4 — DID Generation Screen

**UI Elements:**
- Progress animation ("Securing your identity on the blockchain…")
- Step-by-step status display:
  - ✅ Generating cryptographic key pair
  - ✅ Encrypting your medical vault
  - ✅ Uploading to decentralized storage (IPFS)
  - ✅ Anchoring your identity on Polygon blockchain
  - ✅ Your TourSafe Digital ID is ready!
- On completion: display DID identifier string (shortened, copyable)
- "View your QR Code" button
- "Proceed to App" button

**Logic:**
- ethers.js: generate secp256k1 key pair
- Store private key → Expo SecureStore
- Encrypt medical vault with public key
- Upload to IPFS via Pinata API → get CID
- Call smart contract `registerDID(publicKeyHash, CID)` via ethers.js
- Generate QR code from DID + signed token

---

#### Screen 5 — Permissions

**UI Elements:**
- "TourSafe needs these permissions to protect you" header
- Location (Background): explanation card → "Allow Always" prompt
- Motion & Fitness / Sensors: explanation card → "Allow" prompt
- Push Notifications: explanation card → "Allow" prompt
- "Grant Permissions & Start Protection" button

**Note:** All three permissions are required for the system to function. If denied, display warning and retry prompt.

---

### 3.3 Home Dashboard (Main Screen)

**Purpose:** Primary operational screen while traveling. Must be glanceable at a second.

**UI Elements:**

**Safety Status Banner (TOP — Full Width)**
- Large colored banner: 
  - 🟢 GREEN — "YOU ARE SAFE" 
  - 🟡 AMBER — "GEO-FENCE ALERT — Hazardous Zone Nearby"
  - 🔴 RED — "EMERGENCY DETECTED — Help is on the way"

**SOS Emergency Button (CENTER — Primary CTA)**
- Large, prominent, RED circular button
- Label: "SOS — PRESS FOR EMERGENCY"
- Confirm tap: brief 2-second hold OR double-tap confirmation (prevents accidental activation)
- On activation: triggers full emergency response chain
- Shake-to-Alert status indicator below the button (ON/OFF toggle)

**Connection Status Indicator:**
- Small badge: "● LIVE" (green) or "● OFFLINE — Data stored securely" (amber)

**Active Alerts Section:**
- List of current geo-fence alerts (if any)
- "Entered: [Zone Name] — [distance] from restricted boundary"

**Quick Stats Row:**
- Trip duration (active)
- Total distance tracked
- Monitoring status (Active / Paused)

**Bottom Navigation Bar:**
- Home | Map | Emergency | Profile | Settings

---

### 3.4 Live Map Screen

**Purpose:** Show tourist their own location relative to safe and hazardous zones.

**UI Elements:**
- Google Maps base layer
- Tourist's live GPS position (pulsing blue dot)
- Safe zone overlays (green transparent polygons with labels)
- Hazardous zone overlays (red/amber transparent polygons with labels + warning icons)
- Geo-fence boundary lines (dashed)
- "Re-center" button (bottom-right)
- Distance indicator to nearest geo-fence boundary

**Behavior:**
- Map auto-centers on tourist's position (recenter on GPS update)
- If approaching a geo-fence boundary (within 150m): amber warning indicator appears before actual breach
- If inside a geo-fence: overlay turns solid red; immediate notification

---

### 3.5 Emergency Override Screen

**Purpose:** Manual emergency tools for conscious users.

**UI Elements:**
- Large manual SOS button (same as Home Dashboard)
- "Shake-to-Alert" section:
  - Status toggle (ON/OFF)
  - Sensitivity slider (Low / Medium / High)
  - Instruction: "Shake your phone sharply 3 times to trigger alert"
- "Code Word Alert" section:
  - Configurable code word input
  - Instruction: "Type your code word if you cannot press the SOS button openly"
- Recent alerts log (last 5 triggered alerts with timestamps)

---

### 3.6 Profile / DID Screen

**Purpose:** Tourist's digital identity and medical profile view.

**UI Elements:**
- QR Code (large, centered, always displayable — even on lock screen)
  - Label: "SHOW THIS TO EMERGENCY RESPONDERS"
  - Brightness auto-maximizes when screen is tapped
- DID identifier (shortened, copyable)
- "Blockchain Verified" badge
- Medical Profile Summary:
  - Blood Type
  - Allergies (listed)
  - Chronic Conditions (listed)
  - Insurance Policy #
- Emergency Contacts list
- "Edit Profile" button → navigates to re-entry of medical data (triggers re-encryption and IPFS re-upload)

---

### 3.7 Settings Screen

**UI Elements:**
- Notification preferences (Geo-fence alerts ON/OFF, AI alerts ON/OFF)
- Geo-fence sensitivity threshold (customizable dwell time before escalation; default: 10 min)
- Shake-to-Alert sensitivity
- Session management: "Close Active Trip" button → triggers data purge per privacy policy
- Language selector
- Privacy Policy and Terms display

---

## 4. Mobile Application — Global UI Requirements

### 4.1 Color System

| Color | Hex (Approx.) | Usage |
|-------|-------------|-------|
| Safe Green | #22C55E | Normal status, safe zones |
| Alert Amber | #F59E0B | Geo-fence breach, caution |
| Emergency Red | #EF4444 | Confirmed emergency, SOS button, restricted zones |
| TourSafe Blue | #3B82F6 | Brand, links, secondary actions |
| Dark Background | #0F172A | Primary app background (dark mode preferred — battery + visibility) |
| Light Text | #F8FAFC | Primary text on dark background |
| Card Background | #1E293B | Card / panel backgrounds |

### 4.2 Typography

- **Primary font:** System font (San Francisco on iOS, Roboto on Android) for native feel
- **Emergency text:** Bold, all-caps, high-contrast
- **Status indicators:** Large, readable at a glance (min 24sp for status text)
- **Body text:** Minimum 16sp for readability

### 4.3 Accessibility
- High-contrast color combinations (minimum AA contrast ratio)
- All interactive elements: minimum 48x48dp tap target
- Screen reader / VoiceOver support on all critical screens
- Large-text mode support

### 4.4 Performance
- Cold start (app launch to Home Dashboard): under 3 seconds
- SOS button response (tap to confirmation UI): under 500ms
- Map tile load time: under 2 seconds on 4G
- Geo-fence breach push notification: immediate (client-side, no round-trip)

### 4.5 Offline UX
- When offline: clear amber banner "OFFLINE — Data Stored Securely — Monitoring Continues"
- All safety features (geo-fence detection, SOS button, sensor monitoring) continue working offline
- Offline queue size displayed to reassure user data is not lost

---

## 5. B2G Authority Dashboard

### 5.1 Technology Stack (Dashboard)

| Technology | Purpose |
|------------|---------|
| React.js | Single-page application framework |
| Mapbox GL JS | WebGL-powered real-time map (heatmaps, live positions, geo-fence overlays) |
| Socket.io Client | Real-time alert reception from FastAPI backend |
| Axios / Fetch API | REST API calls to Node.js/Express.js backend |
| JWT (via Authorization header) | Agency authentication |
| TailwindCSS or CSS Modules | Styling (clean, professional, high-density data display) |
| React Query / TanStack Query | Server-state management for incident feeds |

### 5.2 Dashboard Views

#### 5.2.1 Login Screen
- Agency ID input
- Password input
- "Log In" button → JWT token issued by Node.js backend
- Accessible via standard web browser — no special software required

---

#### 5.2.2 Live Map View (Primary Operational View)

**Purpose:** Real-time situational awareness for all authority operators.

**UI Elements:**

**Map Canvas (Full screen, Mapbox GL JS):**
- Live GPS position dots for all tourists in jurisdiction:
  - 🟢 Green dot = SAFE (normal telemetry)
  - 🟡 Amber dot = GEO-FENCE ALERT (tourist entered hazard zone)
  - 🔴 Red dot = CONFIRMED EMERGENCY (LSTM anomaly triggered, e-FIR generated)
- Active geo-fence boundary polygon overlays (with zone names)
- Historical incident heatmap overlay (toggle ON/OFF)
- Real-time trajectory trails for tourists in active alerts

**Clicking a Tourist Dot → Tourist Profile Popup:**
- Tourist Name
- Blockchain UID
- Age + Tech Comfort Level
- Current Status Badge (SAFE / ALERT / EMERGENCY)
- Critical Medical Notes
- Emergency Contact (with "Call Contact" button)
- Recent Location History (timestamped GPS history)

**Top Stats Bar:**
- Total Tourists Tracked
- Active Alerts count
- Under Monitoring count
- Confirmed Emergencies count

**Settings Panel (bottom of map):**
- Show Geo-Zones toggle
- Predictive Warnings toggle (SNN-CAD alerts)

---

#### 5.2.3 Incident Feed View

**Purpose:** Chronological stream of all real-time events.

**UI Elements:**
- Scrollable event list: newest first
- Each card shows: Tourist name, incident type (GEO-FENCE / CRASH / IMMOBILITY), GPS coordinates, timestamp, status (ACTIVE / RESOLVED)
- Filter by: type, zone, time range, status
- "View on Map" button per card → jumps to tourist's position on map
- "Generate e-FIR" manual override button per incident

---

#### 5.2.4 Tourist Directory View

**Purpose:** Searchable registry of all registered tourists.

**UI Elements:**
- Search bar (by name or UID)
- Sortable columns: Name, Age, Status, Location
- Each row: expandable with full medical profile, emergency contacts, recent location history
- "Lost" / "Found" status tags
- "Call Emergency Contact" direct-dial button
- Filter: By Zone, By Status (SAFE / ALERT / EMERGENCY / LOST)

---

#### 5.2.5 e-FIR Archive View

**Purpose:** Historical record of all generated First Information Reports.

**UI Elements:**
- List of all generated e-FIRs with:
  - Incident ID (UUID)
  - Tourist name
  - Incident type
  - GPS coordinates
  - Dispatch timestamp
  - Police dispatch status (SENT / ACKNOWLEDGED / RESPONDED)
  - Hospital dispatch status (SENT / ACKNOWLEDGED / RESPONDED)
- "View Full e-FIR" button → shows complete JSON + PDF versions
- "Download PDF" button per e-FIR
- Filter by: date range, type, dispatch status

---

### 5.3 Real-Time Alert Behavior (Dashboard)

When a confirmed LSTM anomaly fires:
1. The live map dot for the affected tourist changes from green → **RED** with a pulsing animation
2. A system-level toast/banner notification appears: "🚨 EMERGENCY: [Tourist Name] — [Location] — e-FIR Generated"
3. The tourist's profile popup auto-opens on the map
4. The incident is prepended to the top of the Incident Feed
5. An audio alert plays (configurable volume)
6. The e-FIR is automatically archived and the dispatch status is shown

When a geo-fence breach fires:
1. Tourist dot → **AMBER** on the map
2. Toast notification: "⚠️ GEO-FENCE BREACH: [Tourist Name] entered [Zone Name]"
3. Event logged to Incident Feed

---

### 5.4 Dashboard UX Requirements

**Color System:**
- Dark-themed dashboard (dark map background + dark panels) for 24/7 operations-center readability
- Same green/amber/red status color system as mobile app for consistency
- High contrast text for readability under different lighting conditions

**Responsiveness:**
- Optimized for large-screen desktop monitors (1920×1080+) used in operations centers
- Also usable on tablets (1024px+ width)
- Accessible via standard web browser — Chrome, Firefox, Edge (no plugin required)

**Real-Time Performance:**
- Socket.io event → dashboard UI update: under 100ms
- Map dot position update (via Redis live GPS): sub-second refresh
- Incident feed updates: instant push (no polling)

**Authority Actions:**
- Manually trigger e-FIR generation (override)
- Mark incident as RESOLVED
- Add notes to incident record
- Call emergency contacts directly from dashboard
- Download e-FIR PDF for records

---

## 6. Shared Frontend Requirements

### 6.1 QR Code Emergency Access (First Responder Interface)
- The tourist's QR code must be scannable with any standard QR reader
- The decoded DID + signed token initiates emergency access flow via the B2G dashboard or a standalone responder web app
- On scan (by authorized agency device):
  - Display: Tourist Name, Blood Type, Allergies, Chronic Conditions, Emergency Contact, Insurance #
  - Time to display from scan: under 15 seconds
  - Language: English + the tourist's home country language (if available)

### 6.2 State Management Architecture

**Mobile (Redux Toolkit slices):**
- `safetySlice` — current safety status, active alerts, geo-fence breach list
- `offlineQueueSlice` — SQLite queue size, sync status, pending count
- `connectionSlice` — WebSocket connected/disconnected, network online/offline
- `didSlice` — DID identifier, IPFS CID, QR code payload

**Dashboard (React state + TanStack Query):**
- `liveMapState` — all tourist positions (Socket.io updated)
- `incidentFeedState` — real-time incident list (Socket.io appended)
- `travelerDirectoryState` — full tourist registry (REST API, periodic refresh)
- `efirArchiveState` — all generated FIRs (REST API with search/filter)

### 6.3 Error Handling & User Feedback

**Mobile:**
- Network loss → immediate offline mode banner (amber)
- DID registration failure → clear error message + retry option
- GPS unavailable → warning + fallback to last known position
- Sensor unavailable → alert user that AI monitoring is disabled on this device

**Dashboard:**
- WebSocket disconnection → red connection status banner + auto-reconnect with exponential backoff
- API errors → toast notifications with error codes
- Failed e-FIR dispatch → retry button + manual dispatch option

### 6.4 Localization
- Mobile app: English (primary) + major regional languages (Hindi, Tamil, etc.) for accessibility
- Dashboard: English (primary, for authority operators)
- Emergency QR medical display: bilingual (English + tourist's home language where available)
