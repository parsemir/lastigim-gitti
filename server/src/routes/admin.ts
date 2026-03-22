import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireAdmin);

// Get all reports with full details for admin
router.get('/reports', async (req: AuthRequest, res: Response) => {
  try {
    const { status, from, to } = req.query;

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from as string);
      if (to) where.createdAt.lte = new Date(to as string);
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        votes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = reports
      .map((r) => ({
        ...r,
        voteScore: r.votes.reduce((sum, v) => sum + v.value, 0),
        voteCount: r.votes.length,
      }))
      .sort((a, b) => b.voteScore - a.voteScore);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update report status
router.patch('/reports/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { status, adminNotes, estimatedFixDate } = req.body;

    const data: any = {};
    if (status) {
      data.status = status;
      if (status === 'FIXED') data.fixedAt = new Date();
    }
    if (adminNotes !== undefined) data.adminNotes = adminNotes;
    if (estimatedFixDate !== undefined) {
      data.estimatedFixDate = estimatedFixDate ? new Date(estimatedFixDate) : null;
    }

    const report = await prisma.report.update({
      where: { id: req.params.id },
      data,
      include: {
        user: { select: { id: true, name: true } },
        votes: true,
      },
    });

    res.json({
      ...report,
      voteScore: report.votes.reduce((sum, v) => sum + v.value, 0),
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Analytics
router.get('/analytics', async (_req: AuthRequest, res: Response) => {
  try {
    const [total, reported, underReview, scheduled, fixed] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { status: 'REPORTED' } }),
      prisma.report.count({ where: { status: 'UNDER_REVIEW' } }),
      prisma.report.count({ where: { status: 'SCHEDULED' } }),
      prisma.report.count({ where: { status: 'FIXED' } }),
    ]);

    // Average time to fix (for fixed reports)
    const fixedReports = await prisma.report.findMany({
      where: { status: 'FIXED', fixedAt: { not: null } },
      select: { createdAt: true, fixedAt: true },
    });

    let avgFixTimeHours = 0;
    if (fixedReports.length > 0) {
      const totalMs = fixedReports.reduce((sum, r) => {
        return sum + (r.fixedAt!.getTime() - r.createdAt.getTime());
      }, 0);
      avgFixTimeHours = Math.round(totalMs / fixedReports.length / 3600000);
    }

    // Most active areas (group by rough grid)
    const allReports = await prisma.report.findMany({
      select: { latitude: true, longitude: true },
    });

    const areaMap = new Map<string, number>();
    allReports.forEach((r) => {
      const key = `${r.latitude.toFixed(3)},${r.longitude.toFixed(3)}`;
      areaMap.set(key, (areaMap.get(key) || 0) + 1);
    });

    const hotspots = Array.from(areaMap.entries())
      .map(([coords, count]) => {
        const [lat, lng] = coords.split(',').map(Number);
        return { latitude: lat, longitude: lng, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      total,
      byStatus: { reported, underReview, scheduled, fixed },
      avgFixTimeHours,
      hotspots,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
