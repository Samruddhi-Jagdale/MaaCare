# MaaCare — AI-Enhanced Maternal Healthcare Monitoring Platform

> An enterprise-grade, responsive, and secure full-stack maternal healthcare surveillance and clinical tracking platform designed for expectant mothers, community health workers (ASHAs), and healthcare administrators.

---

## 🌟 Key Modules & Implemented Capabilities

### 1. 🤰 Pregnancy Journey Tracker
- **Gestational Week & Trimester Calculation**: Computes real gestation progress from recorded Last Menstrual Period (LMP) or Estimated Delivery Date (EDD).
- **Interactive Visual Timeline**: 40-week clinical progress bar with milestone dividers (Trimester 1, 2, and 3).
- **Clinical Milestones**: Outlines key diagnostic checkpoints including dating ultrasound, NT scan, TIFFA anomaly scan, OGTT diabetes screen, and growth scans.
- **Stage Care & Guidance**: Contextual clinical advice on nutrition, IFA supplementation, and danger awareness tailored to the current gestational stage.

### 2. 📋 Digital Maternal Health Record
- **Comprehensive Patient Passport**: Confidential maternal clinical profile with blood group, age, gestation, and emergency contact details.
- **Vitals & Observation Tracking**: Date-wise logs for Blood Pressure (BP), maternal Weight (kg), Hemoglobin (Hb in g/dL), Blood Sugar, Fetal Heart Rate (bpm), and Fundal Height (cm).
- **Active Supplements Schedule**: Prescribed iron-folic acid (IFA) and calcium regimens with administration timings and dosage guidelines.
- **Danger Signs Vigilance**: Automatic flagging of obstetric red flags (e.g. vaginal bleeding, high blood pressure/headache, reduced fetal movement) requiring urgent referral.

### 3. 📅 Smart Appointment & Follow-up Management
- **5-Stage Appointment Lifecycle**: Upcoming, Completed, Overdue, Missed, and Cancelled statuses.
- **Duplicate Booking Prevention**: Rejects duplicate bookings for the same patient on the same calendar day.
- **Automatic Overdue Synchronization**: Background sync auto-marks past-due upcoming appointments as `Overdue`.
- **Visit Documentation**: Health workers record observations, clinical findings, next follow-up dates, and action plans.

### 4. 🔔 Database-Backed Notification Center
- **Interactive Notification Bell**: Real-time unread count badge with animated alerts.
- **Automated Workflow Notifications**: Dispatched automatically upon appointment scheduling, status updates, and follow-up deadlines.
- **Administrative Broadcasts**: Authorized system administrators can dispatch public health advisories to all users or specific roles.
- **Read State Management**: Supports marking individual notifications as read and bulk "mark all as read".

### 5. 📊 Admin Surveillance & Analytics Console
- **District Maternal Health Metrics**: Live database counts for enrolled mothers, active health workers, upcoming visits, overdue follow-ups, and completed checkups.
- **6-Month Trend Activity**: Real monthly aggregate trends of registrations and antenatal checkups.
- **Trimester Population Distribution**: Dynamic distribution bar across Trimester 1, 2, and 3.
- **Date-Range Filtering**: Inspect surveillance metrics between customized start and end dates.
- **CSV Data Export**: One-click export for Enrolled Mothers report and Checkups report with confidential health record formatting.

### 6. 🌐 Maternal Healthcare Education (English & Marathi)
- **Bilingual Support**: Instant language toggle between English and Marathi (`मराठी`) across the application.
- **Emergency Obstetric Warning Signs**: Critical danger signs with direct click-to-call hotlines for **108** (Ambulance), **102** (Janani Shishu Suraksha), and **104** (Health Helpline).
- **Trimester Care Roadmap**: Trimester-wise fetal development highlights, medical test checklists, and dietary guidelines aligned with WHO and National Health Mission protocols.
- **Clinical FAQs Accordion**: Evidence-based answers to common antenatal questions.

### 7. 🔒 Security & Role-Based Access Control (RBAC)
- **Triple-Layer Authorization**: Strict server-side RBAC guarding `admin`, `worker`, and `woman` roles.
- **Record Isolation**: Expectant mothers can only access their own clinical records; health workers can only manage their assigned caseload.
- **Brute-Force Rate Limiting**: Dedicated rate limiting for authentication routes (`/api/auth/*`) and general API endpoints.
- **Input Sanitization & Validation**: `express-validator` schema enforcement on registrations, logins, and medical records.
- **Security Headers**: `helmet` integration securing HTTP headers.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS 3.4, Lucide Icons, Axios, React Router 6 |
| **Backend** | Node.js, Express.js, JSON Web Tokens (JWT), Bcrypt.js, Helmet, Express Rate Limit, Express Validator |
| **Database** | MongoDB with Mongoose ODM (Indexes, Compound Queries, Schemas) |
| **Testing** | Automated Node.js verification suites, Postman API Collection v2.1 |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18.x or v20.x recommended)
- MongoDB running locally on `mongodb://localhost:27017` or a MongoDB Atlas connection string

### 1. Clone & Configure Backend
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (or use `backend/.env.example` as a template):
```env
MONGODB_URI=mongodb://localhost:27017/maacare
JWT_SECRET=supersecretkey123
PORT=5001
FRONTEND_URL=http://localhost:5174
NODE_ENV=development
```

Start the backend server:
```bash
npm start
# Server will run on http://localhost:5001
```

### 2. Configure & Start Frontend
```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
VITE_API_BASE_URL=http://localhost:5001
```

Start the Vite development server:
```bash
npm run dev
# Frontend runs on http://localhost:5174
```

---

## 🔑 Default Demonstration Accounts

| Role | Email | Password | Access Permissions |
|---|---|---|---|
| **System Admin** | `admin@maacare.org` | `adminpassword123` | District surveillance, worker account provisioning, CSV exports, broadcasts |
| **Health Worker (ASHA)** | `worker@maacare.org` | `workerpassword123` | Assigned mother caseload, antenatal appointment scheduling, observations |
| **Expectant Mother** | Public registration via `/register` or login with registered email | `password123` | Personal pregnancy journey tracker, digital health record, appointment alerts |

---

## 🧪 Postman & Automated Test Verification

A complete Postman collection is available at:
`backend/MaaCare_API_Postman_Collection.json`

To run the automated 20-step verification suite locally:
```bash
cd backend
node test_all_features.js
```

All 20 tests verify:
1. Health check endpoint status
2. English & Marathi maternal education guide retrieval
3. Admin JWT login and security authorization
4. Surveillance statistics, 6-month trends, and trimester distribution
5. CSV export generation for mothers and checkups
6. Administrative broadcast announcements
7. Health worker account creation and login
8. Expectant mother self-registration
9. Clinical pregnancy profile creation with LMP, EDD, and worker assignment
10. Antenatal checkup scheduling with BP, weight, Hb, supplements, and prescriptions
11. Duplicate booking prevention (400 validation)
12. Notification dispatch to mother's inbox
13. Unread notification counters and mark-as-read transitions
14. Security isolation: 403 Forbidden checks for unauthorized access across roles

---

## 🚢 Deployment Guide

### Backend (Render / Railway)
1. Push repository to GitHub.
2. In Render, create a new **Web Service** connected to the repository root directory `backend`.
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Configure Environment Variables in Render:
   - `MONGODB_URI`: Your MongoDB Atlas URI (`mongodb+srv://...`)
   - `JWT_SECRET`: A secure random secret string
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Your deployed frontend URL (e.g. `https://maacare.vercel.app`)

### Frontend (Vercel)
1. In Vercel, import the repository and select the `frontend` root directory.
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add Environment Variable:
   - `VITE_API_BASE_URL`: Your deployed Render backend URL (e.g. `https://maacare-api.onrender.com`)
6. Notice: `vercel.json` is already configured in `frontend/` to handle client-side routing on page refresh.

---

## 📄 License
This project is open-source under the MIT License for educational and healthcare advancement purposes.
