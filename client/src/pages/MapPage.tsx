import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Report } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import MapMarkers from '../components/MapMarkers';

const BUCA_CENTER: [number, number] = [38.4192, 27.1287];
const DEFAULT_ZOOM = 13;

function LocationButton() {
  const map = useMap();
  const { t } = useLanguage();

  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 16 });
  };

  return (
    <button
      onClick={handleLocate}
      className="absolute bottom-28 right-4 z-[1000] bg-white p-3 rounded-2xl shadow-lg shadow-gray-200/50 hover:shadow-xl hover:bg-gray-50 transition-all duration-200 active:scale-95 group"
      title={t('myLocation')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 group-hover:text-primary-700" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
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

  const filterColors: Record<string, string> = {
    ALL: 'bg-gray-800 text-white',
    REPORTED: 'bg-red-500 text-white',
    UNDER_REVIEW: 'bg-yellow-500 text-white',
    SCHEDULED: 'bg-blue-500 text-white',
    FIXED: 'bg-green-500 text-white',
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
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] animate-slide-down">
        <div className="glass rounded-2xl shadow-lg shadow-gray-200/30 px-2 py-1.5 flex gap-1">
          {Object.keys(filterLabels).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                statusFilter === s
                  ? filterColors[s] + ' shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {filterLabels[s]()}
            </button>
          ))}
        </div>
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
        className="absolute bottom-8 right-4 z-[1000] bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-600 text-white px-6 py-4 rounded-2xl shadow-xl shadow-accent-500/30 font-bold flex items-center gap-2.5 transition-all duration-200 hover:shadow-2xl hover:shadow-accent-500/40 active:scale-95 animate-fade-in-up"
      >
        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        {t('reportPothole')}
      </button>

      {/* Legend */}
      <div className="absolute bottom-8 left-4 z-[1000] glass rounded-2xl shadow-lg shadow-gray-200/30 p-4 animate-fade-in-up">
        <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">{t('status')}</p>
        <div className="space-y-1.5">
          {legendItems.map((item) => (
            <div key={item.labelKey} className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: item.color }} />
              <span className="text-xs text-gray-600 font-medium">{t(item.labelKey)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Report count badge */}
      <div className="absolute top-4 right-4 z-[1000] glass rounded-xl shadow-md px-3 py-2 animate-fade-in">
        <span className="text-xs font-bold text-gray-700">{reports.length}</span>
        <span className="text-xs text-gray-500 ml-1">{t('reports')}</span>
      </div>
    </div>
  );
}
