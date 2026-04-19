# 🏥 Smart Diagnosis Center

> AI-powered medical triage platform — describe symptoms, get instant priority classification, doctor assignment, and real-time queue tracking.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![React](https://img.shields.io/badge/react-19-blue)
![MongoDB](https://img.shields.io/badge/database-MongoDB-green)

---

## 📁 Project Structure

```
diagnosis-center/
│
├── frontend/                    # React + Vite + Tailwind CSS
│   └── diagnosis center/
│       ├── src/
│       │   ├── api/             # Axios client
│       │   ├── components/      # Shared UI components
│       │   │   └── charts/      # Recharts analytics
│       │   ├── context/         # Auth & Notification context
│       │   ├── hooks/           # useSSE, useQueue, useLoading
│       │   └── pages/           # All route pages
│       ├── public/
│       └── package.json
│
├── backend/                     # Node.js + Express REST API
│   ├── config/                  # MongoDB connection
│   ├── middleware/              # Auth, RBAC, Upload
│   ├── models/                  # Mongoose schemas
│   ├── routes/                  # API route handlers
│   ├── services/                # Business logic
│   ├── server.js
│   └── package.json
│
├── README.md
├── .gitignore
└── LICENSE
```

---

## ✨ Features

### 🧑‍⚕️ Patient Side
- Signup / Login (JWT auth)
- AI-powered symptom analysis (GPT-4o mini)
- Appointment booking (3-step flow)
- Live queue tracking (Server-Sent Events)
- Report download (PDF)
- Emergency alert button 🚨
- Profile with photo upload

### 👨‍⚕️ Doctor Side
- Real-time case dashboard (SSE + polling)
- Priority-sorted patient list
- Report upload per case
- Appointment status management

### 🛡️ Admin Side
- Analytics dashboard (daily patients, revenue)
- Priority breakdown charts
- Emergency alert notifications

### ⚡ Smart Priority Engine
| Symptom | Score | Priority |
|---------|-------|----------|
| Breathing difficulty | 100 | 🚨 Emergency |
| Chest pain | 75 | 🔴 High |
| Fever | 50 | 🟡 Medium |
| Cold / Sore throat | 25 | 🟢 Low |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Lucide React |
| Backend | Node.js, Express.js (ESM) |
| Database | MongoDB + Mongoose |
| AI | OpenAI GPT-4o mini |
| Real-time | Server-Sent Events (SSE) |
| Auth | JWT + bcrypt |
| Notifications | Firebase Admin (FCM) |
| Charts | Recharts |
| Icons | Lucide React |

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- OpenAI API key

### 1. Clone the repo
```bash
git clone https://github.com/231FA04G02/diagnosis-center.git
cd diagnosis-center
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/diagnosis-center
JWT_SECRET=your-jwt-secret-here
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
FIREBASE_SERVICE_ACCOUNT_KEY={}
FRONTEND_ORIGIN=http://localhost:5173
CONSULTATION_FEE=500
PORT=5000
```

Start backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd "frontend/diagnosis center"
npm install
```

Create `frontend/diagnosis center/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | ✅ | Get profile |
| PATCH | `/api/auth/profile` | ✅ | Update name |
| PATCH | `/api/auth/avatar` | ✅ | Update photo |
| POST | `/api/symptoms/analyze` | Patient | AI symptom analysis |
| POST | `/api/appointments` | Patient | Book appointment |
| GET | `/api/appointments` | Patient | My appointments |
| DELETE | `/api/appointments/:id` | Patient | Cancel appointment |
| GET | `/api/queue/position` | Patient | Queue position |
| GET | `/api/queue/stream` | Patient | SSE queue updates |
| POST | `/api/emergency/alert` | Patient | Trigger emergency |
| POST | `/api/reports` | Doctor | Upload report |
| GET | `/api/reports/:id` | Patient/Doctor | Download PDF |
| GET | `/api/dashboard/cases` | Doctor/Admin | Active cases |
| GET | `/api/dashboard/stream` | Doctor/Admin | SSE dashboard |
| GET | `/api/dashboard/analytics` | Admin | Analytics data |
| POST | `/api/chat` | ✅ | AI chatbot |

---

## 🎨 Pages

| Route | Page | Access |
|-------|------|--------|
| `/` | Home | Public |
| `/about` | About | Public |
| `/services` | Services | Public |
| `/contact` | Contact | Public |
| `/login` | Login / Register | Public |
| `/book` | Book Appointment | Patient |
| `/dashboard/patient` | Patient Dashboard | Patient |
| `/dashboard/doctor` | Doctor Dashboard | Doctor |
| `/dashboard/admin` | Admin Dashboard | Admin |
| `/emergency` | Emergency Alert | Patient |
| `/profile` | Profile | Logged in |

---

## 🔐 Roles

| Role | Access |
|------|--------|
| `patient` | Book appointments, view queue, download reports, emergency |
| `doctor` | View cases, upload reports, update status |
| `admin` | Analytics, all cases, emergency alerts |

---

## 📸 Screenshots

> Add screenshots here after deployment

---

## 📄 License

MIT © [231FA04G02](https://github.com/231FA04G02)
