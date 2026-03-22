import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get user's votes
router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const votes = await prisma.vote.findMany({
      where: { userId: req.userId },
      select: { reportId: true, value: true },
    });
    const voteMap: Record<string, number> = {};
    votes.forEach((v) => (voteMap[v.reportId] = v.value));
    res.json(voteMap);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Cast or update vote
router.post('/:reportId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const { value } = req.body;

    if (value !== 1 && value !== -1) {
      return res.status(400).json({ error: 'Vote must be 1 or -1' });
    }

    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const existing = await prisma.vote.findUnique({
      where: { userId_reportId: { userId: req.userId!, reportId } },
    });

    if (existing) {
      if (existing.value === value) {
        // Remove vote (toggle off)
        await prisma.vote.delete({ where: { id: existing.id } });
      } else {
        // Change vote
        await prisma.vote.update({ where: { id: existing.id }, data: { value } });
      }
    } else {
      await prisma.vote.create({
        data: { value, userId: req.userId!, reportId },
      });
    }

    // Return updated score
    const votes = await prisma.vote.findMany({ where: { reportId } });
    const voteScore = votes.reduce((sum, v) => sum + v.value, 0);

    res.json({ voteScore, voteCount: votes.length });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
