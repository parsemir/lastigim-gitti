import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../utils/api';
import { Report, Analytics, ReportStatus } from '../types';
import { STATUS_CONFIG, STATUS_ORDER, formatDate } from '../utils/status';
import { useLanguage } from '../contexts/LanguageContext';

const BUCA_CENTER: [number, number] = [38.3888, 27.1750];

function createIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:20px;height:20px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [view, setView] = useState<'table' | 'map'>('table');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ status: '', adminNotes: '', estimatedFixDate: '' });
  const { lang, t } = useLanguage();

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      const [reportsRes, analyticsRes] = await Promise.all([
        api.get('/admin/reports', { params: { status: statusFilter } }),
        api.get('/admin/analytics'),
      ]);
      setReports(reportsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (report: Report) => {
    setEditingId(report.id);
    setEditForm({
      status: report.status,
      adminNotes: report.adminNotes || '',
      estimatedFixDate: report.estimatedFixDate ? report.estimatedFixDate.split('T')[0] : '',
    });
  };

  const saveEdit = async (id: string) => {
    try {
      await api.patch(`/admin/reports/${id}`, editForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await api.delete(`/reports/${id}`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('adminDashboard')}</h1>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <StatCard label={t('totalReports')} value={analytics.total} color="bg-gray-800" />
            <StatCard label={t('statusReported')} value={analytics.byStatus.reported} color="bg-red-500" />
            <StatCard label={t('statusUnderReview')} value={analytics.byStatus.underReview} color="bg-yellow-500" />
            <StatCard label={t('statusScheduled')} value={analytics.byStatus.scheduled} color="bg-blue-500" />
            <StatCard label={t('statusFixed')} value={analytics.byStatus.fixed} color="bg-green-500" />
          </div>
        )}

        {analytics && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <p className="text-sm text-gray-600">
              {t('avgTimeToFix')}: <span className="font-semibold">{analytics.avgFixTimeHours}h</span>
              {' | '}
              {t('fixRate')}: <span className="font-semibold">
                {analytics.total > 0 ? Math.round((analytics.byStatus.fixed / analytics.total) * 100) : 0}%
              </span>
            </p>
          </div>
        )}

        {/* View Toggle & Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex gap-1 bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1 rounded text-sm font-medium ${view === 'table' ? 'bg-primary-600 text-white' : 'text-gray-600'}`}
            >
              {t('table')}
            </button>
            <button
              onClick={() => setView('map')}
              className={`px-3 py-1 rounded text-sm font-medium ${view === 'map' ? 'bg-primary-600 text-white' : 'text-gray-600'}`}
            >
              {t('map')}
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm"
          >
            <option value="ALL">{t('allStatus')}</option>
            <option value="REPORTED">{t('statusReported')}</option>
            <option value="UNDER_REVIEW">{t('statusUnderReview')}</option>
            <option value="SCHEDULED">{t('statusScheduled')}</option>
            <option value="FIXED">{t('statusFixed')}</option>
          </select>
        </div>

        {/* Table View */}
        {view === 'table' ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">{t('votes')}</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">{t('description')}</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">{t('reporter')}</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">{t('status')}</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">{t('date')}</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reports.map((report) => {
                    const config = STATUS_CONFIG[report.status];
                    const isEditing = editingId === report.id;

                    return (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-bold text-accent-500">{report.voteScore}</span>
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate">
                          {report.description || t('noDescription')}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{report.user.name}</td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <select
                              value={editForm.status}
                              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                              className="text-xs border rounded px-2 py-1"
                            >
                              {STATUS_ORDER.map((s) => (
                                <option key={s} value={s}>{STATUS_CONFIG[s].label[lang]}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color} font-medium`}>
                              {config.label[lang]}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {formatDate(report.createdAt, lang)}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder={t('adminNotes')}
                                value={editForm.adminNotes}
                                onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                                className="w-full text-xs border rounded px-2 py-1"
                              />
                              <input
                                type="date"
                                value={editForm.estimatedFixDate}
                                onChange={(e) => setEditForm({ ...editForm, estimatedFixDate: e.target.value })}
                                className="w-full text-xs border rounded px-2 py-1"
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={() => saveEdit(report.id)}
                                  className="text-xs bg-green-500 text-white px-2 py-1 rounded"
                                >
                                  {t('save')}
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="text-xs bg-gray-200 px-2 py-1 rounded"
                                >
                                  {t('cancel')}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(report)}
                                className="text-xs text-primary-600 hover:underline font-medium"
                              >
                                {t('edit')}
                              </button>
                              <button
                                onClick={() => handleDelete(report.id)}
                                className="text-xs text-red-500 hover:underline font-medium"
                              >
                                {t('deleteReport')}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {reports.length === 0 && (
              <div className="text-center py-8 text-gray-500">{t('noReportsFound')}</div>
            )}
          </div>
        ) : (
          /* Map View */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: '500px' }}>
            <MapContainer center={BUCA_CENTER} zoom={14} className="h-full w-full">
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {reports.map((report) => {
                const config = STATUS_CONFIG[report.status];
                return (
                  <Marker
                    key={report.id}
                    position={[report.latitude, report.longitude]}
                    icon={createIcon(config.mapColor)}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{report.description || t('noDescription')}</p>
                        <p className="text-gray-500">{t('votes')}: {report.voteScore}</p>
                        <p className="text-gray-500">{t('by')}: {report.user.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
                          {config.label[lang]}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`${color} text-white rounded-lg p-4`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-90">{label}</p>
    </div>
  );
}
