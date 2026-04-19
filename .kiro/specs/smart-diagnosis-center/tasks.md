# Implementation Plan: Smart Diagnosis Center

## Overview

Incremental implementation starting with backend infrastructure, then core services, then frontend wiring. Each task builds on the previous. Property-based tests are placed close to the code they validate to catch regressions early.

## Tasks

- [ ] 1. Backend project scaffold and database connection
  - Initialize `backend/` with `npm init`, install dependencies: `express`, `mongoose`, `dotenv`, `cors`, `jsonwebtoken`, `bcrypt`, `openai`, `firebase-admin`, `multer`, `pdf-lib`, `sharp`
  - Create `backend/server.js` with Express app, CORS middleware (env-configured origin), JSON body parser, and global error handler mapping known error types to HTTP status codes
  - Create `backend/config/db.js` with Mongoose connection using `MONGO_URI` from `.env`
  - Create `backend/.env` with placeholder keys: `MONGO_URI`, `JWT_SECRET`, `OPENAI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_KEY`, `FRONTEND_ORIGIN`, `CONSULTATION_FEE`
  - _Requirements: 12.5, 12.6_

- [ ] 2. Data models
  - [ ] 2.1 Create all six Mongoose models: `User`, `Case`, `Appointment`, `Report`, `QueueEntry`, `EmergencyLog` in `backend/models/` matching the schemas in the design document
    - `User`: name, email, passwordHash, role enum, fcmTokens, isAvailable, activeHighCases
    - `Case`: patientId, symptomDescription (minLength 10), aiAnalysis sub-doc, symptomScore, priorityLevel enum, assignedDoctorId, labName, status enum, emergencyAlert, submittedAt
    - `Appointment`: caseId, patientId, doctorId, labName, status enum, appointmentTime, estimatedDuration
    - `Report`: caseId, patientId, doctorId, filePath, originalName, mimeType, fileSize, uploadedAt
    - `QueueEntry`: caseId, patientId, priorityLevel, symptomScore, submittedAt
    - `EmergencyLog`: patientId, caseId, triggeredAt, notifiedDoctors
    - _Requirements: 1.1, 2.4, 3.8, 4.5, 5.1, 6.1, 7.3, 8.1_

- [ ] 3. Auth middleware and RBAC
  - [ ] 3.1 Create `backend/middleware/auth.js` — verify JWT from `Authorization: Bearer` header, attach `req.user = { id, role }`, return 401 on invalid/expired token
    - Create `backend/middleware/rbac.js` — factory function `requireRole(...roles)` returning middleware that returns 403 if `req.user.role` is not in the allowed list
    - _Requirements: 1.6, 1.7, 1.8_

  - [ ]* 3.2 Write property test for RBAC enforcement
    - **Property 5: Role-based access control is enforced for all protected routes**
    - **Validates: Requirements 1.6, 1.7, 1.8**

- [ ] 4. Auth Service and routes
  - [ ] 4.1 Implement `backend/services/authService.js`: `register()`, `login()`, `hashPassword()` (bcrypt rounds=10), `verifyToken()`
    - Create `backend/routes/auth.js`: `POST /register` (201 + JWT), `POST /login` (200 + JWT), duplicate email → 409, wrong credentials → 401
    - Mount at `/api/auth` in `server.js`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 4.2 Write property test for valid registrations always accepted
    - **Property 1: Valid registrations are always accepted**
    - **Validates: Requirements 1.1**

  - [ ]* 4.3 Write property test for password hashing
    - **Property 2: Passwords are always stored as bcrypt hashes with cost ≥ 10**
    - **Validates: Requirements 1.3**

  - [ ]* 4.4 Write property test for JWT expiry
    - **Property 3: JWT expiry is always 24 hours**
    - **Validates: Requirements 1.4**

  - [ ]* 4.5 Write property test for invalid credentials
    - **Property 4: Invalid credentials always return 401**
    - **Validates: Requirements 1.5**

  - [ ]* 4.6 Write unit tests for Auth Service
    - Test duplicate email returns 409, bcrypt hash verification, token payload shape
    - _Requirements: 1.1–1.5_

- [ ] 5. Priority Engine
  - [ ] 5.1 Implement `backend/services/priorityEngine.js` — pure `scoreSymptoms(description)` function with keyword scoring table (100/75/50/25), highest-match wins, default Low/25
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 5.2 Write property test for valid score and level output
    - **Property 6: Priority Engine always produces a valid score and level**
    - **Validates: Requirements 3.1, 3.7**

  - [ ]* 5.3 Write property test for keyword matching correctness
    - **Property 7: Keyword matching produces correct score and level**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6**

  - [ ]* 5.4 Write unit tests for Priority Engine
    - Test each keyword category, mixed-category highest-wins, empty string, unicode, very long string
    - _Requirements: 3.1–3.7_

- [ ] 6. AI Analyzer
  - [ ] 6.1 Implement `backend/services/aiAnalyzer.js` — call OpenAI GPT-4o mini with structured triage system prompt, 10-second `AbortSignal` timeout, return `{ summary, urgencyLevel, nextSteps }`; on error return fallback object
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 7. Symptom submission route
  - [ ] 7.1 Create `backend/routes/symptoms.js`: `POST /analyze` (patient auth)
    - Validate description ≥ 10 chars → 400 if not
    - Call `aiAnalyzer.analyze()` and `priorityEngine.scoreSymptoms()`
    - Create and persist `Case` document with description, AI analysis, score, and level
    - Enqueue case via Queue Service (task 8)
    - Return `{ success, data: { caseId, aiAnalysis, priorityLevel, symptomScore }, message }`
    - Mount at `/api/symptoms` in `server.js`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.8_

  - [ ]* 7.2 Write property test for short symptom descriptions rejected
    - **Property 9: Short symptom descriptions are always rejected**
    - **Validates: Requirements 2.5**

  - [ ]* 7.3 Write property test for symptom submission persistence
    - **Property 8: Symptom submission persists description, AI analysis, score, and level**
    - **Validates: Requirements 2.4, 3.8**

- [ ] 8. Queue Service and routes
  - [ ] 8.1 Implement `backend/services/queueService.js`: `enqueue()`, `dequeue()`, `getPosition()`, `moveToFront()`, `broadcastUpdate()`
    - Queue ordered by symptomScore desc, then submittedAt asc (FIFO within same priority)
    - Estimated wait: `(position - 1) × 15` minutes
    - `broadcastUpdate()` calls SSE Broadcaster (task 9)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 8.2 Create `backend/routes/queue.js`: `GET /position` (patient), `GET /all` (doctor/admin), `GET /stream` (patient — SSE)
    - Mount at `/api/queue` in `server.js`
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 8.3 Write property test for queue ordering
    - **Property 13: Queue ordering respects priority then submission time**
    - **Validates: Requirements 6.1**

- [ ] 9. SSE Broadcaster
  - [ ] 9.1 Implement `backend/services/sseBroadcaster.js`: `addClient()`, `removeClient()`, `broadcast()`, `broadcastToRole()`
    - Set SSE headers (`Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`)
    - Maintain `Map<userId, res>` and `Map<userId, role>` for role broadcasts
    - Wire `GET /api/queue/stream` and `GET /api/dashboard/stream` SSE endpoints
    - _Requirements: 6.2, 9.2_

- [ ] 10. Appointment Service and routes
  - [ ] 10.1 Implement `backend/services/appointmentService.js`: `createAppointment()`, `cancelAppointment()` (1-hour guard → 400), `getPatientAppointments()` (sorted asc), `assignDoctor()` (Emergency/High: min active cases; Medium/Low: round-robin), `assignLab()` (Emergency/High → urgent-care-lab; else → general-lab)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4_

  - [ ] 10.2 Create `backend/routes/appointments.js`: `POST /`, `GET /`, `DELETE /:id`, `GET /all` (doctor/admin), `PATCH /:id/status` (doctor/admin)
    - On status change, call `notificationService.sendToUser()` for the patient
    - Mount at `/api/appointments` in `server.js`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 10.3 Write property test for lab assignment consistency
    - **Property 10: Lab assignment is always consistent with priority level**
    - **Validates: Requirements 4.3**

  - [ ]* 10.4 Write property test for appointment retrieval sort order
    - **Property 11: Appointment retrieval is always sorted ascending by time**
    - **Validates: Requirements 5.4**

  - [ ]* 10.5 Write property test for cancellation time window
    - **Property 12: Cancellation is allowed only when more than 1 hour remains**
    - **Validates: Requirements 5.2, 5.3**

  - [ ]* 10.6 Write unit tests for Appointment Service
    - Test doctor assignment strategies, lab assignment, cancellation boundary (exactly 60 min, 61 min, 59 min)
    - _Requirements: 4.1–4.4, 5.1–5.4_

- [ ] 11. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Emergency alert route
  - [ ] 12.1 Create `backend/routes/emergency.js`: `POST /alert` (patient auth)
    - Set case `symptomScore = 100`, `priorityLevel = 'Emergency'`, `emergencyAlert = true`, `emergencyAlertAt = now`
    - Call `queueService.moveToFront(caseId)`
    - Create `EmergencyLog` record with `patientId`, `caseId`, `triggeredAt`
    - Call `notificationService.sendToRole('doctor', ...)` and `notificationService.sendToRole('admin', ...)`
    - Mount at `/api/emergency` in `server.js`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 12.2 Write property test for emergency alert escalation
    - **Property 14: Emergency alert always escalates to score=100 and level=Emergency**
    - **Validates: Requirements 7.1, 7.4**

  - [ ]* 12.3 Write property test for emergency alert logging
    - **Property 15: Emergency alert is always logged with timestamp and patient ID**
    - **Validates: Requirements 7.3**

- [ ] 13. Report Service and routes
  - [ ] 13.1 Create `backend/middleware/upload.js` — Multer config: `limits.fileSize = 10MB`, `fileFilter` accepting only `application/pdf`, `image/jpeg`, `image/png`; reject others with 400
    - Implement `backend/services/reportService.js`: `uploadReport()`, `downloadReport()` (403 if not assigned patient/doctor), `convertImageToPdf()` using `pdf-lib` + `sharp`
    - File storage path: `uploads/reports/{caseId}/{timestamp}-{originalname}`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ] 13.2 Create `backend/routes/reports.js`: `POST /` (doctor, multipart), `GET /:id` (patient/doctor)
    - `GET /:id` calls `reportService.downloadReport()`, sets `Content-Type: application/pdf`, streams buffer
    - Mount at `/api/reports` in `server.js`
    - _Requirements: 8.1–8.6_

  - [ ]* 13.3 Write property test for report upload association
    - **Property 16: Report upload associates file with case record**
    - **Validates: Requirements 8.1, 8.2**

  - [ ]* 13.4 Write property test for invalid file uploads rejected
    - **Property 17: Invalid file uploads are always rejected**
    - **Validates: Requirements 8.3**

  - [ ]* 13.5 Write property test for report download always returns PDF
    - **Property 18: Report download always returns a PDF**
    - **Validates: Requirements 8.4, 8.5**

  - [ ]* 13.6 Write property test for report access restriction
    - **Property 19: Report access is restricted to assigned patient and doctor**
    - **Validates: Requirements 8.6**

- [ ] 14. Notification Service
  - [ ] 14.1 Implement `backend/services/notificationService.js`: initialize `firebase-admin` from `FIREBASE_SERVICE_ACCOUNT_KEY` env var, implement `sendToUser()`, `sendToRole()`, `registerToken()`
    - Create `backend/routes/notifications.js`: `POST /token` (any authenticated user) — saves FCM token to `user.fcmTokens`
    - Mount at `/api/notifications` in `server.js`
    - _Requirements: 4.4, 5.5, 6.4, 7.2_

- [ ] 15. Analytics Service and dashboard routes
  - [ ] 15.1 Implement `backend/services/analyticsService.js`: `getDailyPatientCounts()`, `getDailyRevenue()`, `getPriorityBreakdown()` using MongoDB `$group` aggregation pipelines
    - Create `backend/routes/dashboard.js`: `GET /cases` (doctor/admin — all active cases sorted by priority desc), `GET /stream` (doctor/admin — SSE), `GET /analytics` (admin — query params `startDate`, `endDate`)
    - Mount at `/api/dashboard` in `server.js`
    - _Requirements: 9.1, 9.2, 9.4, 10.1, 10.2, 10.3, 10.4_

  - [ ]* 15.2 Write property test for dashboard cases sorted by priority
    - **Property 21: Dashboard cases are always sorted by priority descending**
    - **Validates: Requirements 9.1**

  - [ ]* 15.3 Write property test for dashboard response fields
    - **Property 20: Dashboard API response always contains all required case fields**
    - **Validates: Requirements 9.4**

  - [ ]* 15.4 Write property test for analytics calculations
    - **Property 22: Analytics calculations are always correct**
    - **Validates: Requirements 10.1, 10.2, 10.3**

  - [ ]* 15.5 Write unit tests for Analytics Service
    - Test revenue calculation, date grouping, priority breakdown counts
    - _Requirements: 10.1–10.3_

- [ ] 16. API response consistency and integration tests
  - [ ]* 16.1 Write property test for consistent JSON response structure
    - **Property 23: All API responses have consistent JSON structure**
    - **Validates: Requirements 12.5**

  - [ ]* 16.2 Write integration test for full symptom submission flow
    - Submit symptoms → AI analysis (mocked) → priority scoring → case creation → queue enqueue
    - Use `mongodb-memory-server`, mock OpenAI and Firebase Admin with `vi.mock()`
    - _Requirements: 2.1–2.5, 3.1–3.8_

  - [ ]* 16.3 Write integration test for full appointment flow
    - Create → retrieve (verify sorted) → cancel valid → cancel too-late (expect 400)
    - _Requirements: 5.1–5.5_

  - [ ]* 16.4 Write integration test for emergency alert flow
    - Trigger alert → verify case escalation → verify queue reorder → verify notification dispatch
    - _Requirements: 7.1–7.4_

  - [ ]* 16.5 Write integration test for report upload/download flow
    - Upload PDF → download → verify `Content-Type: application/pdf`
    - Upload JPEG → download → verify PDF conversion
    - _Requirements: 8.1–8.6_

- [ ] 17. Checkpoint — Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Frontend: Axios client, AuthContext, and routing
  - [ ] 18.1 Install frontend dependencies: `react-router-dom`, `axios`, `recharts`, `firebase`
    - Create `src/api/client.js` — Axios instance with `baseURL` from env, request interceptor attaching `Authorization: Bearer <token>` from localStorage, response interceptor dispatching errors to global state
    - Create `src/context/AuthContext.jsx` — JWT storage in localStorage, `user` state (decoded payload), `login()`, `logout()`, `register()` functions
    - Create `src/context/NotificationContext.jsx` — FCM token registration on login via `POST /api/notifications/token`
    - _Requirements: 11.5, 11.6, 12.1_

  - [ ] 18.2 Update `src/main.jsx` and `src/App.jsx` — wrap app in `AuthContext`, set up React Router v6 with all page routes, add `<Navbar>` and `<Footer>` to root layout
    - _Requirements: 11.1, 12.1_

- [ ] 19. Shared hooks and utility components
  - [ ] 19.1 Create `src/hooks/useLoading.js`, `src/hooks/useSSE.js` (EventSource with exponential backoff retry: 1s→2s→4s→max 30s), `src/hooks/useQueue.js`
    - Create `src/components/LoadingSpinner.jsx` and `src/components/ErrorBanner.jsx` (renders `response.data.message`, generic message for network errors)
    - _Requirements: 11.5, 11.6_

  - [ ] 19.2 Create `src/components/Navbar.jsx` (blue-600/blue-800 theme, responsive hamburger on mobile), `src/components/Footer.jsx`
    - Create `src/components/PriorityBadge.jsx` — color-coded badge: Emergency=red-500, High=orange-400, Medium=yellow-400, Low=green-400
    - Create `src/components/CaseCard.jsx` — card with `rounded-xl shadow-md p-4`, displays patient name, priority badge, symptom score, assigned doctor, queue position, appointment status; Emergency cases get `border-red-500` border
    - Create `src/components/QueueWidget.jsx` — subscribes to SSE via `useSSE`, displays live position and estimated wait
    - _Requirements: 9.3, 11.1, 11.2, 11.3, 11.4_

- [ ] 20. Analytics chart components
  - [ ] 20.1 Create `src/components/charts/DailyPatientsChart.jsx` (recharts `LineChart` or `BarChart`), `src/components/charts/RevenueChart.jsx`, `src/components/charts/PriorityPieChart.jsx` (recharts `PieChart`)
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 21. Static pages
  - [ ] 21.1 Create `src/pages/Home.jsx` — hero section, feature highlights, blue/white theme
    - Create `src/pages/About.jsx` — center description
    - Create `src/pages/Services.jsx` — services list with card layout
    - Create `src/pages/Contact.jsx` — contact form and center info
    - _Requirements: 11.1, 11.2, 11.4_

- [ ] 22. BookAppointment page (multi-step)
  - [ ] 22.1 Create `src/pages/BookAppointment.jsx` — three-step flow:
    - Step 1: symptom textarea (client-side min 10 chars validation), submit → `POST /api/symptoms/analyze`
    - Step 2: display AI analysis result and `<PriorityBadge>`, confirm button
    - Step 3: confirm appointment → `POST /api/appointments`, show assigned doctor, lab, estimated time
    - Show `<LoadingSpinner>` during API calls; show `<ErrorBanner>` on errors
    - _Requirements: 2.1, 2.2, 4.1–4.3, 5.1, 11.5, 11.6_

- [ ] 23. PatientDashboard page
  - [ ] 23.1 Create `src/pages/PatientDashboard.jsx`:
    - `<QueueWidget>` subscribing to `GET /api/queue/stream`
    - Appointments list from `GET /api/appointments` (sorted asc), cancel button disabled if < 1 hour to appointment time
    - Reports section with download links calling `GET /api/reports/:id`
    - _Requirements: 5.2, 5.4, 6.2, 6.3, 8.4_

- [ ] 24. DoctorDashboard page
  - [ ] 24.1 Create `src/pages/DoctorDashboard.jsx`:
    - Case list subscribing to `GET /api/dashboard/stream` via `useSSE`; fallback poll `GET /api/dashboard/cases` every 5 seconds
    - Render `<CaseCard>` for each case; Emergency cases with `border-red-500`
    - Report upload form per case (file input, 10 MB client-side limit, `POST /api/reports`)
    - Status update dropdown per appointment (`PATCH /api/appointments/:id/status`)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 8.1, 8.2_

- [ ] 25. AdminDashboard page
  - [ ] 25.1 Create `src/pages/AdminDashboard.jsx`:
    - Date range picker → `GET /api/dashboard/analytics?startDate=&endDate=`
    - Render `<DailyPatientsChart>`, `<RevenueChart>`, `<PriorityPieChart>`
    - Emergency alert banner rendered when SSE event `type: 'emergency'` is received (patient name + caseId)
    - _Requirements: 9.5, 10.1, 10.2, 10.3, 10.4_

- [ ] 26. Emergency page
  - [ ] 26.1 Create `src/pages/Emergency.jsx`:
    - Prominent red button triggering `POST /api/emergency/alert`
    - On success: show confirmation message and updated queue position
    - Display nearest emergency contact numbers
    - _Requirements: 7.1, 7.2, 11.3_

- [ ] 27. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `vitest` + `fast-check` with minimum 100 iterations; tag format: `// Feature: smart-diagnosis-center, Property N: <property_text>`
- Integration tests use `mongodb-memory-server` with `vi.mock()` for OpenAI and Firebase Admin
- Backend `vitest.config.js` should set `environment: 'node'` and `coverage.provider: 'v8'`
- SSE fallback polling (every 5s) ensures the 3-second dashboard update requirement is met even if SSE drops
