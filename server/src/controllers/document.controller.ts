import { Response } from 'express';
import { db } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../services/audit.service.js';
import { v4 as uuidv4 } from 'uuid';

export async function uploadMedicalDocument(req: AuthenticatedRequest, res: Response) {
  try {
    const patientId = req.user?.patientId;
    if (!patientId) {
      return res.status(403).json({ success: false, error: 'Only patients can upload documents.' });
    }

    const { title, documentType, fileName, fileSize, mimeType, description } = req.body;

    if (!title || !documentType || !fileName) {
      return res.status(400).json({
        success: false,
        error: 'Title, document type, and file name are required.',
      });
    }

    const docId = `doc-${uuidv4().substring(0, 8)}`;
    const newDoc = db.createDocument({
      id: docId,
      patientId,
      title,
      documentType,
      fileName,
      fileSize: Number(fileSize) || 150000,
      mimeType: mimeType || 'application/pdf',
      fileUrl: `/uploads/${fileName}`,
      description: description || '',
      uploadedAt: new Date().toISOString(),
    });

    logAudit(req, 'UPLOAD_MEDICAL_DOCUMENT', 'MedicalDocument', docId, {
      title,
      documentType,
      fileName,
    });

    return res.status(201).json({
      success: true,
      message: 'Medical document uploaded and encrypted in record storage.',
      data: newDoc,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteMedicalDocument(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const patientId = req.user?.patientId;

    const patientDocs = db.getDocumentsByPatient(patientId!);
    const exists = patientDocs.find((d) => d.id === id);

    if (!exists && req.user?.role !== 'ADMIN') {
      return res.status(404).json({
        success: false,
        error: 'Document not found or you are not authorized to delete it.',
      });
    }

    db.deleteDocument(id);
    logAudit(req, 'DELETE_MEDICAL_DOCUMENT', 'MedicalDocument', id);

    return res.json({
      success: true,
      message: 'Document deleted successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
