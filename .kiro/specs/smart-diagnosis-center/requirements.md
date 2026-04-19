# Requirements Document

## Introduction

The Smart Diagnosis Center is a full-stack web application that enables patients to submit symptoms and receive AI-powered triage, priority classification, and automatic doctor/lab assignment. The system supports real-time queue tracking, appointment booking, PDF report generation, and emergency alerting. Doctors and admins access a real-time dashboard with analytics, report management, and emergency notifications. The application uses React.js + Tailwind CSS on the frontend, Node.js + Express on the backend, MongoDB for persistence, OpenAI GPT-4o mini for AI analysis, and Firebase for push notifications.

---

## Glossary

- **Patient**: A registered user who submits symptoms and books appointments.
- **Doctor**: A medical professional who reviews patient cases and uploads reports.
- **Admin**: A system administrator who manages users, doctors, and analytics.
- **System**: The Smart Diagnosis Center backend API and business logic layer.
- **AI_Analyzer**: The GPT-4o mini integration module responsible for symptom analysis.
- **Priority_Engine**: The backend module that scores symptoms and assigns a priority level.
- **Auth_Service**: The backend module responsible for JWT-based authentication and authorization.
- **Appointment_Service**: The backend module that manages appointment creation, assignment, and status.
- **Report_Service**: The backend module that handles report upload, storage, and PDF download.
- **Queue_Service**: The backend module that tracks and broadcasts live queue positions.
- **Notification_Service**: The Firebase-based module that sends push notifications and emergency alerts.
- **Dashboard**: The real-time doctor/admin UI showing patient lists, analytics, and alerts.
- **Priority Level**: One of four classifications — Low, Medium, High, or Emergency — assigned to a patient case based on symptom scoring.
- **Symptom Score**: A numeric value computed by the Priority_Engine from submitted symptoms.
- **JWT**: JSON Web Token used for stateless authentication.

---

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a patient or doctor, I want to register and log in securely, so that I can access my personalized features and data.

#### Acceptance Criteria

1. THE Auth_Service SHALL accept registration requests containing a name, email, password, and role (patient or doctor).
2. WHEN a registration request is received with a duplicate email, THE Auth_Service SHALL return a 409 Conflict error with a descriptive message.
3. THE Auth_Service SHALL store passwords as bcrypt hashes with a minimum cost factor of 10.
4. WHEN valid credentials are submitted, THE Auth_Service SHALL return a signed JWT with an expiry of 24 hours.
5. WHEN an invalid email or password is submitted, THE Auth_Service SHALL return a 401 Unauthorized error.
6. WHILE a JWT is valid and unexpired, THE System SHALL grant access to protected routes matching the token's role.
7. IF a request to a protected route contains an expired or malformed JWT, THEN THE Auth_Service SHALL return a 401 Unauthorized error.
8. THE Auth_Service SHALL enforce role-based access control, restricting doctor and admin routes to users with the corresponding role.

---

### Requirement 2: Symptom Submission and AI Analysis

**User Story:** As a patient, I want to describe my symptoms and receive an AI-powered analysis, so that I understand the urgency of my condition.

#### Acceptance Criteria

1. WHEN a patient submits a symptom description, THE AI_Analyzer SHALL send the description to the OpenAI GPT-4o mini API with a structured medical triage prompt.
2. THE AI_Analyzer SHALL return a structured response containing a plain-language summary, a suggested urgency level, and recommended next steps.
3. WHEN the OpenAI API returns an error or times out after 10 seconds, THE AI_Analyzer SHALL return a fallback message indicating that AI analysis is temporarily unavailable.
4. THE System SHALL store the symptom description and AI analysis result in the patient's case record in MongoDB.
5. WHEN a symptom description is empty or fewer than 10 characters, THE System SHALL return a 400 Bad Request error with a descriptive validation message.

---

### Requirement 3: Priority Scoring and Classification

**User Story:** As a doctor, I want each patient case to be automatically classified by priority, so that I can attend to the most critical patients first.

#### Acceptance Criteria

1. WHEN a symptom submission is received, THE Priority_Engine SHALL compute a Symptom Score by evaluating keywords in the symptom description against a predefined scoring table.
2. THE Priority_Engine SHALL assign a score of 100 to symptom descriptions containing breathing-related keywords (e.g., "breathing difficulty", "can't breathe", "shortness of breath") and classify the case as Emergency.
3. THE Priority_Engine SHALL assign a score of 75 to symptom descriptions containing chest pain keywords (e.g., "chest pain", "chest tightness") and classify the case as High.
4. THE Priority_Engine SHALL assign a score of 50 to symptom descriptions containing fever keywords (e.g., "fever", "high temperature") and classify the case as Medium.
5. THE Priority_Engine SHALL assign a score of 25 to symptom descriptions containing minor illness keywords (e.g., "cold", "runny nose", "sore throat") and classify the case as Low.
6. WHEN a symptom description matches multiple keyword categories, THE Priority_Engine SHALL assign the highest matching score and corresponding Priority Level.
7. WHEN no keywords match, THE Priority_Engine SHALL assign a score of 25 and classify the case as Low.
8. THE System SHALL store the computed Symptom Score and Priority Level in the patient's case record.

---

### Requirement 4: Automatic Doctor and Lab Assignment

**User Story:** As a patient, I want to be automatically assigned to an appropriate doctor and lab based on my priority, so that I receive timely and relevant care.

#### Acceptance Criteria

1. WHEN a case is classified as Emergency or High, THE Appointment_Service SHALL assign the patient to the next available doctor with the fewest active High or Emergency cases.
2. WHEN a case is classified as Medium or Low, THE Appointment_Service SHALL assign the patient to the next available doctor using a round-robin assignment strategy.
3. THE Appointment_Service SHALL assign a lab based on the Priority Level: Emergency and High cases SHALL be assigned to the urgent care lab; Medium and Low cases SHALL be assigned to the general lab.
4. IF no doctors are available, THEN THE Appointment_Service SHALL place the patient in a pending queue and notify the patient via the Notification_Service.
5. THE System SHALL store the assigned doctor ID, lab name, and appointment status in the case record.

---

### Requirement 5: Appointment Booking and Management

**User Story:** As a patient, I want to book, view, and manage my appointments, so that I can plan my visit to the diagnosis center.

#### Acceptance Criteria

1. WHEN a patient confirms an appointment, THE Appointment_Service SHALL create an appointment record with status "scheduled" and return the appointment ID and estimated time.
2. THE Appointment_Service SHALL allow a patient to cancel a scheduled appointment up to 1 hour before the appointment time.
3. WHEN a patient attempts to cancel an appointment less than 1 hour before the appointment time, THE Appointment_Service SHALL return a 400 Bad Request error with a descriptive message.
4. THE System SHALL allow a patient to retrieve all their appointments, sorted by appointment time in ascending order.
5. WHEN an appointment status changes, THE Notification_Service SHALL send a push notification to the patient with the updated status.

---

### Requirement 6: Live Queue Status Tracking

**User Story:** As a patient, I want to see my real-time position in the queue, so that I know how long I need to wait.

#### Acceptance Criteria

1. THE Queue_Service SHALL maintain a queue ordered by Priority Level (Emergency first, then High, Medium, Low) and by submission time within the same priority.
2. WHEN a patient's queue position changes, THE Queue_Service SHALL broadcast the updated position to the patient's active session.
3. THE System SHALL expose a REST endpoint that returns the patient's current queue position and estimated wait time.
4. WHEN a patient's appointment is called, THE Queue_Service SHALL remove the patient from the queue and notify the patient via the Notification_Service.

---

### Requirement 7: Emergency Alert

**User Story:** As a patient in a critical situation, I want to trigger an emergency alert, so that medical staff are immediately notified.

#### Acceptance Criteria

1. WHEN a patient activates the emergency alert button, THE System SHALL immediately set the patient's case Priority Level to Emergency and Symptom Score to 100.
2. WHEN an emergency alert is triggered, THE Notification_Service SHALL send a push notification to all online doctors and admins within 5 seconds.
3. THE System SHALL log the emergency alert event with a timestamp and the patient's ID in the database.
4. WHEN an emergency alert is triggered, THE Queue_Service SHALL move the patient to the front of the queue.

---

### Requirement 8: Report Upload and Download

**User Story:** As a doctor, I want to upload patient reports, and as a patient, I want to download my reports as PDFs, so that medical records are accessible.

#### Acceptance Criteria

1. WHEN a doctor uploads a report file, THE Report_Service SHALL store the file and associate it with the patient's case record.
2. THE Report_Service SHALL accept report files in PDF and image formats (JPEG, PNG) with a maximum file size of 10 MB.
3. IF a file exceeds 10 MB or is an unsupported format, THEN THE Report_Service SHALL return a 400 Bad Request error with a descriptive message.
4. WHEN a patient requests a report download, THE Report_Service SHALL return the report as a downloadable PDF file.
5. WHERE the report is stored as an image, THE Report_Service SHALL convert the image to PDF format before returning it to the patient.
6. THE System SHALL restrict report access so that only the assigned patient and the assigned doctor can download a given report.

---

### Requirement 9: Doctor and Admin Real-Time Dashboard

**User Story:** As a doctor or admin, I want a real-time dashboard showing all patient cases sorted by priority, so that I can manage the queue efficiently.

#### Acceptance Criteria

1. THE Dashboard SHALL display all active patient cases sorted by Priority Level in descending order (Emergency, High, Medium, Low).
2. WHEN a new case is submitted or a case priority changes, THE Dashboard SHALL update the patient list within 3 seconds without requiring a page refresh.
3. THE Dashboard SHALL highlight Emergency cases with a red visual indicator and High cases with an orange visual indicator.
4. THE Dashboard SHALL display for each case: patient name, Priority Level, Symptom Score, assigned doctor, queue position, and appointment status.
5. WHEN an emergency alert is received, THE Dashboard SHALL display a prominent alert banner with the patient's name and location.

---

### Requirement 10: Analytics

**User Story:** As an admin, I want to view daily patient and revenue analytics, so that I can monitor the center's performance.

#### Acceptance Criteria

1. THE Dashboard SHALL display the total number of patients seen per day for the past 30 days as a line or bar chart.
2. THE Dashboard SHALL display daily revenue calculated as the count of completed appointments multiplied by the configured consultation fee.
3. THE Dashboard SHALL display a breakdown of cases by Priority Level for the current day as a pie or donut chart.
4. WHEN the admin selects a date range, THE System SHALL return aggregated analytics data for that range within 2 seconds.

---

### Requirement 11: Frontend UI and Responsiveness

**User Story:** As any user, I want a clean, responsive medical-themed interface, so that I can use the application comfortably on any device.

#### Acceptance Criteria

1. THE System SHALL render all pages using a blue and white medical color theme with Tailwind CSS utility classes.
2. THE System SHALL use a card-based layout for patient cases, appointments, and dashboard widgets.
3. THE System SHALL display Emergency cases with a red background or red border on all patient-facing and doctor-facing views.
4. THE System SHALL be fully responsive and usable on screen widths from 320px to 1920px.
5. WHEN the application is loading data, THE System SHALL display a loading indicator to the user.
6. IF a network error occurs, THEN THE System SHALL display a user-friendly error message without exposing internal error details.

---

### Requirement 12: API Structure and Communication

**User Story:** As a developer, I want well-structured REST APIs, so that the frontend and backend communicate reliably.

#### Acceptance Criteria

1. THE System SHALL expose an Authentication API at `/api/auth` with endpoints for registration (`POST /register`) and login (`POST /login`).
2. THE System SHALL expose an Appointment API at `/api/appointments` with endpoints for create, read, and cancel operations.
3. THE System SHALL expose a Symptom Analysis API at `/api/symptoms/analyze` that accepts a symptom description and returns the AI analysis result and Priority Level.
4. THE System SHALL expose a Report API at `/api/reports` with endpoints for upload (`POST`) and download (`GET /:id`).
5. THE System SHALL return all API responses in JSON format with a consistent structure containing `success`, `data`, and `message` fields.
6. THE System SHALL implement CORS to allow requests only from the configured frontend origin.
