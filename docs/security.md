# Security & Compliance Architecture

## 1. Authentication & Session Protection
- **Bcrypt Hash**: Passwords are salted with factor 10. Plain text passwords are never stored or logged.
- **JWT Authorization**: Cryptographically signed JSON Web Tokens carrying minimal user claims (`userId`, `role`, `email`).
- **Role Isolation**: Strict middleware guards ensure Patient, Doctor, and Admin routes cannot be traversed by unauthorized actors.

## 2. Medical Data Confidentiality (HIPAA Design Principles)
- **Authorized Doctor-Patient Relationship**: Doctors can only access patient medical history if the patient has booked or attended an appointment with that doctor.
- **Admin Privilege Limitation**: System administrators govern account status and infrastructure, but clinical records remain protected.
- **Sanitized Audit Logs**: Security audit logging records actions and targets while systematically stripping passwords, tokens, and raw health content from logs.

## 3. Defense Against Common Vulnerabilities
- **Rate Limiting**: Authentication endpoints enforce in-memory IP request throttling to mitigate brute-force attempts.
- **Input Validation**: Strongly typed schema validation with Zod on both client and server boundaries.
- **CORS & Safe Headers**: Cross-origin protections configured on the Express server.
- **Double-Booking Transactional Locks**: Concurrency checks ensure slots cannot be claimed twice under parallel requests.
