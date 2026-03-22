import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  reportId: string;
  voteScore: number;
  userVote: number;
  onVote: (reportId: string, value: number) => void;
}

export default function VoteButton({ reportId, voteScore, userVote, onVote }: Props) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onVote(reportId, 1)}
        className={`p-1 rounded transition ${
          userVote === 1
            ? 'text-accent-500 bg-orange-50'
            : 'text-gray-400 hover:text-accent-500'
        }`}
        title={t('upvote')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      <span className={`font-bold text-sm min-w-[20px] text-center ${
        voteScore > 0 ? 'text-accent-500' : voteScore < 0 ? 'text-red-500' : 'text-gray-500'
      }`}>
        {voteScore}
      </span>
      <button
        onClick={() => onVote(reportId, -1)}
        className={`p-1 rounded transition ${
          userVote === -1
            ? 'text-blue-500 bg-blue-50'
            : 'text-gray-400 hover:text-blue-500'
        }`}
        title={t('downvote')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
