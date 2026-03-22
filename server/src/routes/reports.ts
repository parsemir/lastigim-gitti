import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Get all reports with vote counts
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { sort, status, lat, lng } = req.query;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        votes: true,
      },
      orderBy: sort === 'newest' ? { createdAt: 'desc' } : { createdAt: 'desc' },
    });

    const reportsWithScores = reports.map((r) => {
      const voteScore = r.votes.reduce((sum, v) => sum + v.value, 0);
      let distance: number | null = null;
      if (lat && lng) {
        distance = getDistanceMeters(
          r.latitude, r.longitude,
          parseFloat(lat as string), parseFloat(lng as string)
        );
      }
      return {
        id: r.id,
        latitude: r.latitude,
        longitude: r.longitude,
        description: r.description,
        photoUrl: r.photoUrl,
        status: r.status,
        createdAt: r.createdAt,
        user: r.user,
        voteScore,
        voteCount: r.votes.length,
        distance,
      };
    });

    // Sort
    if (sort === 'votes') {
      reportsWithScores.sort((a, b) => b.voteScore - a.voteScore);
    } else if (sort === 'nearest' && lat && lng) {
      reportsWithScores.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }

    res.json(reportsWithScores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single report
router.get('/:id', async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true } },
        votes: true,
      },
    });
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const voteScore = report.votes.reduce((sum, v) => sum + v.value, 0);
    res.json({ ...report, voteScore });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Check for nearby duplicates
router.get('/nearby/check', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Valid lat/lng required' });
    }

    const allReports = await prisma.report.findMany({
      where: { status: { not: 'FIXED' } },
      include: {
        user: { select: { id: true, name: true } },
        votes: true,
      },
    });

    const nearby = allReports
      .map((r) => ({
        ...r,
        distance: getDistanceMeters(r.latitude, r.longitude, lat, lng),
        voteScore: r.votes.reduce((sum, v) => sum + v.value, 0),
      }))
      .filter((r) => r.distance <= 50)
      .sort((a, b) => a.distance - b.distance);

    res.json({ hasDuplicates: nearby.length > 0, nearby });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create report
router.post('/', authenticate, upload.single('photo'), async (req: AuthRequest, res: Response) => {
  try {
    const { latitude, longitude, description } = req.body;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Valid coordinates required' });
    }

    let photoUrl: string | null = null;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      photoUrl = `data:${req.file.mimetype};base64,${base64}`;
    }

    const report = await prisma.report.create({
      data: {
        latitude: lat,
        longitude: lng,
        description: description || null,
        photoUrl,
        userId: req.userId!,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    // Auto-upvote by reporter
    await prisma.vote.create({
      data: { value: 1, userId: req.userId!, reportId: report.id },
    });

    res.status(201).json({ ...report, voteScore: 1, voteCount: 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete report (owner or admin)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const report = await prisma.report.findUnique({ where: { id: req.params.id } });
    if (!report) return res.status(404).json({ error: 'Report not found' });

    if (report.userId !== req.userId && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'You can only delete your own reports' });
    }

    await prisma.report.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Haversine distance in meters
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default router;
