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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover group">
      <div className="flex">
        {/* Photo */}
        {report.photoUrl ? (
          <div className="relative w-28 sm:w-36 flex-shrink-0">
            <img
              src={report.photoUrl}
              alt="Pothole"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5" />
          </div>
        ) : (
          <div className="w-20 sm:w-24 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full ${config.bgColor} ${config.color} font-semibold`}>
                  {config.label[lang]}
                </span>
                <span className="text-xs text-gray-400">{timeAgo(report.createdAt, lang)}</span>
              </div>
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all duration-200 p-1 rounded-lg hover:bg-red-50"
                  title={t('deleteReport')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-sm text-gray-800 font-medium line-clamp-2 leading-snug">
              {report.description || t('noDescriptionProvided')}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-5 h-5 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                {report.user.name.charAt(0)}
              </div>
              <span className="text-xs text-gray-500">{report.user.name}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-50">
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
