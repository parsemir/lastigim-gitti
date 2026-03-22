import { Report } from '../types';
import { STATUS_CONFIG, timeAgo } from '../utils/status';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import VoteButton from './VoteButton';

interface Props {
  report: Report;
  userVote: number;
  onVote: (reportId: string, value: number) => void;
  onDelete?: (reportId: string) => void;
}

export default function ReportCard({ report, userVote, onVote, onDelete }: Props) {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const config = STATUS_CONFIG[report.status];

  const canDelete = user && (user.id === report.user.id || user.role === 'ADMIN');

  const handleDelete = () => {
    if (window.confirm(t('confirmDelete'))) {
      onDelete?.(report.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
      <div className="flex">
        {report.photoUrl && (
          <img
            src={report.photoUrl}
            alt="Pothole"
            className="w-24 h-24 sm:w-32 sm:h-32 object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color} font-medium`}>
                  {config.label[lang]}
                </span>
                <span className="text-xs text-gray-400">{timeAgo(report.createdAt, lang)}</span>
              </div>
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="text-xs text-red-400 hover:text-red-600 transition p-1"
                  title={t('deleteReport')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-sm text-gray-700 line-clamp-2">
              {report.description || t('noDescriptionProvided')}
            </p>
            {report.address && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="line-clamp-1">{report.address}</span>
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">{t('by')} {report.user.name}</p>
          </div>
          <div className="mt-2">
            <VoteButton
              reportId={report.id}
              voteScore={report.voteScore}
              userVote={userVote}
              onVote={onVote}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
