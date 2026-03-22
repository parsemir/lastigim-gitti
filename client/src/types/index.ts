export interface User {
  id: string;
  email: string;
  name: string;
  role: 'RESIDENT' | 'ADMIN';
}

export type ReportStatus = 'REPORTED' | 'UNDER_REVIEW' | 'SCHEDULED' | 'FIXED';

export interface Report {
  id: string;
  latitude: number;
  longitude: number;
  description: string | null;
  address: string | null;
  photoUrl: string | null;
  status: ReportStatus;
  adminNotes: string | null;
  estimatedFixDate: string | null;
  createdAt: string;
  user: { id: string; name: string };
  voteScore: number;
  voteCount: number;
  distance?: number | null;
}

export interface Analytics {
  total: number;
  byStatus: {
    reported: number;
    underReview: number;
    scheduled: number;
    fixed: number;
  };
  avgFixTimeHours: number;
  hotspots: { latitude: number; longitude: number; count: number }[];
}
