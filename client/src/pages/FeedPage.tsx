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
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">{t('allReports')}</h1>
          <span className="text-sm text-gray-500">{reports.length} {t('reports')}</span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex gap-1 bg-white rounded-lg shadow-sm p-1">
            {[
              { key: 'votes', label: () => t('mostVotes') },
              { key: 'newest', label: () => t('newest') },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                className={`px-3 py-1 rounded text-xs font-medium transition ${
                  sort === s.key ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {s.label()}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm"
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
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">{t('noReportsFound')}</p>
            <p className="text-sm mt-1">{t('beFirst')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                userVote={userVotes[report.id] || 0}
                onVote={handleVote}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
