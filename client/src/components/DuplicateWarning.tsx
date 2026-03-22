import { Report } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  nearby: Report[];
  onDismiss: () => void;
  onVoteExisting: (reportId: string) => void;
}

export default function DuplicateWarning({ nearby, onDismiss, onVoteExisting }: Props) {
  const { t } = useLanguage();

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-800 text-sm">{t('duplicateDetected')}</h3>
          <p className="text-sm text-yellow-700 mt-1">
            {nearby.length === 1 ? t('duplicateMessage1') : t('duplicateMessage1Plural')}{' '}
            {nearby.length} {nearby.length === 1 ? t('duplicateMessageWithin') : t('duplicateMessageWithinPlural')}{' '}
            {t('duplicateConsider')}
          </p>
          <div className="mt-3 space-y-2">
            {nearby.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between bg-white rounded p-2">
                <span className="text-sm text-gray-700 truncate flex-1">
                  {r.description || t('noDescription')} ({Math.round(r.distance)}{t('mAway')})
                </span>
                <button
                  onClick={() => onVoteExisting(r.id)}
                  className="ml-2 text-xs bg-accent-500 text-white px-3 py-1 rounded hover:bg-accent-600 flex-shrink-0"
                >
                  {t('upvoteThis')}
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={onDismiss}
            className="mt-3 text-sm text-yellow-700 underline hover:text-yellow-900"
          >
            {t('reportAnyway')}
          </button>
        </div>
      </div>
    </div>
  );
}
