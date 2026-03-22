interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: Props) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Road */}
        <rect x="20" y="60" width="60" height="30" rx="4" fill="#374151" />
        {/* Road lines */}
        <rect x="38" y="68" width="10" height="4" rx="2" fill="#FCD34D" />
        <rect x="55" y="68" width="10" height="4" rx="2" fill="#FCD34D" />
        {/* Pothole crack */}
        <ellipse cx="50" cy="78" rx="14" ry="8" fill="#1F2937" />
        <ellipse cx="50" cy="77" rx="10" ry="5" fill="#111827" />
        {/* Warning triangle */}
        <path d="M50 12L72 48H28L50 12Z" fill="#F97316" />
        <path d="M50 18L67 45H33L50 18Z" fill="#FDBA74" />
        <text x="50" y="42" textAnchor="middle" fill="#9A3412" fontSize="22" fontWeight="bold">!</text>
        {/* Location pin outline */}
        <circle cx="50" cy="30" r="0" fill="none" stroke="#F97316" strokeWidth="0" />
      </svg>
    </div>
  );
}
