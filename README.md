# 📸 SmartAttend — Smart Attendance System

> A next-generation attendance management solution powered by **QR Code scanning** and **AI Face Recognition**.

---

## ✨ System Highlights

| Feature | Technology |
|---|---|
| 🔐 **Authentication** | PBKDF2 Hashing + JWT Sessions |
| 👁️ **Face Recognition** | DeepFace (SFace) + OpenCV |
| 📅 **Timetable** | Interactive Weekly Schedule Grid (localStorage) |
| 📝 **Assignments** | Cross-device posting, API management & filtering (MongoDB) |
| 🔒 **QR Session Lock** | Auto-routing & strict navigation lock during active verification |
| 💳 **Bills & Payments** | Glassmorphic credit card simulator & UPI QR checkout |
| 🗄️ **Database** | Native MongoDB (NoSQL) |
| 🌐 **Frontend** | Astro + React (Node.js) |
| ⚙️ **Backend** | FastAPI (Python 3.9) |
| 🌓 **Theming** | Glassmorphism UI with Dark/Light Toggle |

---

## 🛠️ Hybrid Architecture

This project uses a **Dual-Engine** architecture to combine the best of two worlds:

### 1. Frontend Engine (Node.js)
*   **Role:** Powers the user interface and high-speed animations.
*   **Stack:** Astro, React, and Vanilla CSS.
*   **Responsibility:** Handling the camera stream, rendering the dashboard tabs (Overview, Attendance, Scanner, Timetable, Assignments, Bills & Fees, Logs, Settings), and managing UI themes.

### 2. AI & Data Engine (Python)
*   **Role:** Handles heavy data processing, API endpoints, and artificial intelligence.
*   **Stack:** FastAPI, MongoDB, DeepFace.
*   **Responsibility:** Securely hashing passwords, generating encrypted QR tokens, managing the assignments database, and performing 1:1 facial verification using embeddings.

---

## 💡 Key Added Modules & Flows

### 1. 📝 Assignment Posting & Tracking (Full-Stack MongoDB)
*   **Faculty Capabilities:** Create, filter (All, Active, Past Due), and delete assignments dynamically. Faculty submissions are instantly persisted in the MongoDB `assignments` collection.
*   **Student Dashboard Integration:** Read-only dynamic view of all active, past-due, and ongoing assignments. Fully color-coded to match due-date status (🟢 Active, 🔴 Past Due, 🔵 Ongoing) with max marks and author info.

### 2. 🔒 QR Scan-Session Lock System
To prevent students from skipping out of scanning or logging out mid-verification:
*   **Auto-Route:** Students are automatically redirected to the `Scanner` tab the moment a teacher initiates a QR session.
*   **Locked State:** All navigation (sidebar tabs, logout button, and browser reload/close) is strictly intercepted. Trying to leave triggers alerts warning that departure results in an **ABSENT** mark.
*   **Timer Sync:** A live banner shows the remaining time synced exactly to the teacher's QR expiration timestamp.

### 3. 💳 Student Bills & Fees Payment Portal
A fully animated, premium glassmorphism mock payment portal:
*   **Bill Ledger:** Displays current standing for tuition fees, hostel rent, examination fees, and library fines.
*   **Credit/Debit Card:** Displays an interactive credit card template that updates numbers, holder name, and expiry visually as you type.
*   **UPI Transfer:** Shows a mock dynamic QR code with an active laser scanning line to scan and pay.
*   **Transaction Simulator:** Simulates secure server processing before logging successful transaction IDs.

### 4. 📅 Timetable Scheduler
*   Interactive day-by-day scheduler for both students and faculty to track class hours (8:00 AM to 4:00 PM slots). Faculty can perform full CRUD operations to manage class rooms and subject IDs.

---

## 🔐 Security & AI Pipeline

### Authentication Flow
1.  **Secure Hashing:** Passwords are never stored as text. We use **PBKDF2-SHA256** to derive a cryptographically secure hash.
2.  **Tokenization:** Upon login, the server issues a **JWT (JSON Web Token)** that authorizes all subsequent AI requests.
3.  **RBAC:** The system enforces Role-Based Access Control (Admin, Teacher, Student).

### Face Recognition Flow
1.  **Capture:** The frontend captures a frame from the webcam.
2.  **Base64 Processing:** The image is converted to a Base64 string and sent to the backend.
3.  **DeepFace Verify:** The backend retrieves the student's registered face (stored as Base64 in MongoDB), reconstructs it, and uses **OpenCV** + **DeepFace (SFace)** to compare the two faces.
4.  **Verification:** Attendance is only logged if the AI reports a "Match" with high confidence.

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.9+)
- **MongoDB** (Running locally on port 27017)

### 1. Backend (Python)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend (Node.js)
```bash
cd frontend
npm install
npm run dev
```

---

## 🗄️ Database Management (MongoDB)

You can manage and view your data using **MongoDB Compass** or **mongosh**.

### View Registered Users
```javascript
use attendance_db
db.users.find().pretty()
```

### View Assignments Table
```javascript
db.assignments.find().pretty()
```

### View AI Face Profiles
```javascript
db.face_profiles.find().pretty()
```

---

## 👨‍💻 Author
**Avinash K.**  
Mini Project — Smart Attendance System  
*Innovative attendance management using AI and Modern Web Technologies.*
