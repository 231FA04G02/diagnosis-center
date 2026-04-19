// Feature: smart-diagnosis-center
// Report Service — upload, download, and image-to-PDF conversion

import fs from 'fs/promises';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import Report from '../models/Report.js';

/**
 * Create a Report document from a multer file object.
 *
 * @param {object} file - multer file object
 * @param {string} caseId
 * @param {string} doctorId
 * @param {string} patientId
 * @returns {Promise<Report>}
 */
export async function uploadReport(file, caseId, doctorId, patientId) {
  const report = await Report.create({
    caseId,
    patientId,
    doctorId,
    filePath: file.path,
    originalName: file.originalname,
    mimeType: file.mimetype,
    fileSize: file.size,
  });
  return report;
}

/**
 * Download a report as a PDF buffer.
 * Access is restricted to the assigned patient, doctor, or admin.
 *
 * @param {string} reportId
 * @param {string} requestingUserId
 * @param {string} requestingUserRole
 * @returns {Promise<Buffer>}
 */
export async function downloadReport(reportId, requestingUserId, requestingUserRole) {
  const report = await Report.findById(reportId).populate('caseId');
  if (!report) {
    const err = new Error('Report not found');
    err.status = 404;
    throw err;
  }

  if (requestingUserRole !== 'admin') {
    const patientMatch = report.patientId.toString() === requestingUserId;
    const doctorMatch = report.doctorId.toString() === requestingUserId;
    if (!patientMatch && !doctorMatch) {
      const err = new Error('Forbidden');
      err.status = 403;
      throw err;
    }
  }

  if (report.mimeType === 'application/pdf') {
    const buffer = await fs.readFile(report.filePath);
    return buffer;
  }

  // Image — convert to PDF
  return convertImageToPdf(report.filePath, report.mimeType);
}

/**
 * Convert an image file to a PDF buffer using sharp + pdf-lib.
 *
 * @param {string} imagePath
 * @param {string} mimeType - 'image/jpeg' | 'image/png'
 * @returns {Promise<Buffer>}
 */
export async function convertImageToPdf(imagePath, mimeType) {
  const imageBuffer = await fs.readFile(imagePath);
  const metadata = await sharp(imageBuffer).metadata();
  const { width, height } = metadata;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([width, height]);

  let embeddedImage;
  if (mimeType === 'image/jpeg') {
    embeddedImage = await pdfDoc.embedJpg(imageBuffer);
  } else {
    embeddedImage = await pdfDoc.embedPng(imageBuffer);
  }

  page.drawImage(embeddedImage, { x: 0, y: 0, width, height });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
