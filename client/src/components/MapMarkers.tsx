import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Report } from '../types';
import { STATUS_CONFIG, timeAgo } from '../utils/status';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import VoteButton from './VoteButton';

function createIcon(color: string, isFixed: boolean) {
  const checkmark = isFixed
    ? `<path d="M7 10l2 2 4-4" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<circle cx="10" cy="10" r="3" fill="white" opacity="0.9"/>`;

  return L.divIcon({
    className: '',
    html: `<svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <filter id="s${color.replace('#', '')}">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
      </filter>
      <g filter="url(#s${color.replace('#', '')})">
        <path d="M18 2C10.268 2 4 8.268 4 16c0 10 14 24 14 24s14-14 14-24c0-7.732-6.268-14-14-14z" fill="${color}"/>
        <path d="M18 2C10.268 2 4 8.268 4 16c0 10 14 24 14 24s14-14 14-24c0-7.732-6.268-14-14-14z" fill="url(#g${color.replace('#', '')})" opacity="0.3"/>
        <defs>
          <linearGradient id="g${color.replace('#', '')}" x1="18" y1="2" x2="18" y2="40" gradientUnits="userSpaceOnUse">
            <stop stop-color="white" stop-opacity="0.4"/>
            <stop offset="1" stop-color="white" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <circle cx="18" cy="16" r="8" fill="white" opacity="0.2"/>
        <g transform="translate(8,6)">${checkmark}</g>
      </g>
    </svg>`,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
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
            icon={createIcon(config.mapColor, report.status === 'FIXED')}
          >
            <Popup maxWidth={300} minWidth={220}>
              <div className="p-1 -m-1">
                {report.photoUrl && (
                  <img
                    src={report.photoUrl}
                    alt="Pothole"
                    className="w-full h-36 object-cover rounded-lg mb-3 shadow-sm"
                  />
                )}
                <p className="text-sm text-gray-800 font-medium mb-2 leading-snug">
                  {report.description || t('noDescription')}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${config.bgColor} ${config.color} font-semibold`}>
                    {config.label[lang]}
                  </span>
                  <span className="text-xs text-gray-400">{timeAgo(report.createdAt, lang)}</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                      {report.user.name.charAt(0)}
                    </span>
                    {report.user.name}
                  </span>
                </p>
                <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                  <VoteButton
                    reportId={report.id}
                    voteScore={report.voteScore}
                    userVote={userVotes[report.id] || 0}
                    onVote={onVote}
                  />
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      className="text-xs text-gray-400 hover:text-red-500 font-medium transition flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
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
