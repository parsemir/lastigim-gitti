import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Report } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import MapMarkers from '../components/MapMarkers';

// Buca, Izmir center coordinates
const BUCA_CENTER: [number, number] = [38.3888, 27.1750];
const DEFAULT_ZOOM = 14;

function LocationButton() {
  const map = useMap();
  const { t } = useLanguage();

  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 16 });
  };

  return (
    <button
      onClick={handleLocate}
      className="absolute bottom-24 right-4 z-[1000] bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition"
      title={t('myLocation')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      </svg>
    </button>
  );
}

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();
  const { lang, t } = useLanguage();

  useEffect(() => {
    loadReports();
    loadVotes();
  }, [statusFilter]);

  const loadReports = async () => {
    try {
      const res = await api.get('/reports', { params: { status: statusFilter } });
      setReports(res.data);
    } catch (err) {
      console.error('Failed to load reports', err);
    }
  };

  const loadVotes = async () => {
    try {
      const res = await api.get('/votes/my');
      setUserVotes(res.data);
    } catch (err) {
      console.error('Failed to load votes', err);
    }
  };

  const handleVote = async (reportId: string, value: number) => {
    try {
      const res = await api.post(`/votes/${reportId}`, { value });
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, voteScore: res.data.voteScore, voteCount: res.data.voteCount } : r
        )
      );
      setUserVotes((prev) => {
        const newVotes = { ...prev };
        if (prev[reportId] === value) {
          delete newVotes[reportId];
        } else {
          newVotes[reportId] = value;
        }
        return newVotes;
      });
    } catch (err) {
      console.error('Vote failed', err);
    }
  };

  const handleDelete = async (reportId: string) => {
    try {
      await api.delete(`/reports/${reportId}`);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const filterLabels: Record<string, () => string> = {
    ALL: () => t('statusAll'),
    REPORTED: () => t('statusReported'),
    UNDER_REVIEW: () => t('statusReview'),
    SCHEDULED: () => t('statusScheduled'),
    FIXED: () => t('statusFixed'),
  };

  const legendItems = [
    { color: '#ef4444', labelKey: 'statusReported' as const },
    { color: '#eab308', labelKey: 'statusUnderReview' as const },
    { color: '#2563eb', labelKey: 'statusScheduled' as const },
    { color: '#22c55e', labelKey: 'statusFixed' as const },
  ];

  return (
    <div className="relative h-full">
      {/* Status filter bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex gap-1 bg-white rounded-full shadow-lg px-2 py-1">
        {Object.keys(filterLabels).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              statusFilter === s
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {filterLabels[s]()}
          </button>
        ))}
      </div>

      <MapContainer center={BUCA_CENTER} zoom={DEFAULT_ZOOM} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapMarkers reports={reports} userVotes={userVotes} onVote={handleVote} onDelete={handleDelete} />
        <LocationButton />
      </MapContainer>

      {/* FAB - Report Pothole */}
      <button
        onClick={() => navigate('/report')}
        className="absolute bottom-6 right-4 z-[1000] bg-accent-500 hover:bg-accent-600 text-white px-5 py-3 rounded-full shadow-xl font-semibold flex items-center gap-2 transition transform hover:scale-105"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {t('reportPothole')}
      </button>

      {/* Legend */}
      <div className="absolute bottom-6 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
        <p className="text-xs font-semibold text-gray-600 mb-1">{t('status')}</p>
        <div className="space-y-1">
          {legendItems.map((item) => (
            <div key={item.labelKey} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
              <span className="text-xs text-gray-600">{t(item.labelKey)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
