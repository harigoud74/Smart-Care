import { Router } from 'express';
import authRoutes from './auth.routes.js';
import patientRoutes from './patient.routes.js';
import doctorRoutes from './doctor.routes.js';
import appointmentRoutes from './appointment.routes.js';
import recordRoutes from './record.routes.js';
import prescriptionRoutes from './prescription.routes.js';
import documentRoutes from './document.routes.js';
import adminRoutes from './admin.routes.js';
import recommendationRoutes from './recommendation.routes.js';
import notificationRoutes from './notification.routes.js';
import geminiRoutes from './gemini.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/patients', patientRoutes);
apiRouter.use('/doctors', doctorRoutes);
apiRouter.use('/appointments', appointmentRoutes);
apiRouter.use('/medical-records', recordRoutes);
apiRouter.use('/prescriptions', prescriptionRoutes);
apiRouter.use('/documents', documentRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/recommendations', recommendationRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/gemini', geminiRoutes);

// System health check
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'SmartCare Core Engine',
    timestamp: new Date().toISOString(),
    version: '2.5.0',
  });
});

export default apiRouter;
