import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Report } from '../types';
import { STATUS_CONFIG, timeAgo } from '../utils/status';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import VoteButton from './VoteButton';

function createIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px; height: 24px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

interface Props {
  reports: Report[];
  userVotes: Record<string, number>;
  onVote: (reportId: string, value: number) => void;
  onDelete?: (reportId: string) => void;
}

export default function MapMarkers({ reports, userVotes, onVote, onDelete }: Props) {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  return (
    <>
      {reports.map((report) => {
        const config = STATUS_CONFIG[report.status];
        const canDelete = user && (user.id === report.user.id || user.role === 'ADMIN');

        const handleDelete = () => {
          if (window.confirm(t('confirmDelete'))) {
            onDelete?.(report.id);
          }
        };

        return (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={createIcon(config.mapColor)}
          >
            <Popup maxWidth={280} minWidth={200}>
              <div className="p-1">
                {report.photoUrl && (
                  <img
                    src={report.photoUrl}
                    alt="Pothole"
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                )}
                <p className="text-sm text-gray-700 mb-1">
                  {report.description || t('noDescription')}
                </p>
                {report.address && (
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="line-clamp-2">{report.address}</span>
                  </p>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color} font-medium`}>
                    {config.label[lang]}
                  </span>
                  <span className="text-xs text-gray-400">{timeAgo(report.createdAt, lang)}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{t('by')} {report.user.name}</p>
                <div className="flex items-center justify-between">
                  <VoteButton
                    reportId={report.id}
                    voteScore={report.voteScore}
                    userVote={userVotes[report.id] || 0}
                    onVote={onVote}
                  />
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      className="text-xs text-red-500 hover:text-red-700 font-medium transition"
                    >
                      {t('deleteReport')}
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
