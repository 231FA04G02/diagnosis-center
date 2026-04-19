// Feature: smart-diagnosis-center
import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { analyze } from '../services/aiAnalyzer.js';
import { scoreSymptoms } from '../services/priorityEngine.js';
import Case from '../models/Case.js';
import * as queueService from '../services/queueService.js';

const router = Router();

// POST /api/symptoms/analyze — patient: submit symptoms, get AI analysis + priority
router.post('/analyze', authMiddleware, async (req, res, next) => {
  try {
    const { description } = req.body;

    if (!description || description.length < 10) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Symptom description must be at least 10 characters',
      });
    }

    const [aiResult, { score, level }] = await Promise.all([
      analyze(description),
      Promise.resolve(scoreSymptoms(description)),
    ]);

    const newCase = await Case.create({
      patientId: req.user.id,
      symptomDescription: description,
      aiAnalysis: { ...aiResult, analyzedAt: new Date() },
      symptomScore: score,
      priorityLevel: level,
      status: 'pending',
    });

    await queueService.enqueue(newCase._id, req.user.id, level, score, new Date());

    return res.status(201).json({
      success: true,
      data: {
        caseId: newCase._id,
        aiAnalysis: aiResult,
        priorityLevel: level,
        symptomScore: score,
      },
      message: 'Symptoms analyzed successfully',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
