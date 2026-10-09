# Future Scope & Extension Architecture

SmartCare is engineered with modular interfaces and service abstractions to support forward-looking enhancements:

1. **WebRTC Video Consultation Module**:
   - Integration with WebRTC or Daily.co/Twilio for real-time video consults.
   - Clean appointment status handling with `TELECONSULTATION` type already established.

2. **Cloud Storage Abstraction (AWS S3 / Google Cloud Storage)**:
   - Storage service interface can seamlessly switch from local disk file storage to signed pre-authenticated S3/GCS bucket URLs for large imaging files (DICOM / MRI).

3. **Multi-Channel Dispatch (SMS / WhatsApp)**:
   - Outbox architecture in `notification.service.ts` ready to attach Twilio SMS or WhatsApp Business API providers for appointment reminders.

4. **Payment Gateway Integration**:
   - Stripe / Razorpay escrow holding consultation fees until the physician marks the consultation as `COMPLETED`.

5. **FHIR / HL7 Interoperability**:
   - Standardized healthcare record exchange endpoints for hospital electronic health record (EHR) migration.
