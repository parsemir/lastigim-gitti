import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Report } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import ReportCard from '../components/ReportCard';

export default function FeedPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [sort, setSort] = useState('votes');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    loadData();
  }, [sort, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsRes, votesRes] = await Promise.all([
        api.get('/reports', { params: { sort, status: statusFilter } }),
        api.get('/votes/my'),
      ]);
      setReports(reportsRes.data);
      setUserVotes(votesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      console.error(err);
    }
  };

  const handleDelete = async (reportId: string) => {
    try {
      await api.delete(`/reports/${reportId}`);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 custom-scrollbar">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-black text-gray-800">{t('allReports')}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{reports.length} {t('reports')}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6 animate-fade-in-up delay-100">
          <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1 border border-gray-100">
            {[
              { key: 'votes', label: () => t('mostVotes'), icon: '🔥' },
              { key: 'newest', label: () => t('newest'), icon: '🕐' },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  sort === s.key
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">{s.icon}</span>
                {s.label()}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm font-semibold text-gray-600 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
          >
            <option value="ALL">{t('allStatus')}</option>
            <option value="REPORTED">{t('statusReported')}</option>
            <option value="UNDER_REVIEW">{t('statusUnderReview')}</option>
            <option value="SCHEDULED">{t('statusScheduled')}</option>
            <option value="FIXED">{t('statusFixed')}</option>
          </select>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-400 mt-4">{t('loading') || 'Loading...'}</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className="text-lg font-bold text-gray-700">{t('noReportsFound')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('beFirst')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report, index) => (
              <div
                key={report.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(index * 50, 300)}ms`, opacity: 0 }}
              >
                <ReportCard
                  report={report}
                  userVote={userVotes[report.id] || 0}
                  onVote={handleVote}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
