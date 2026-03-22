import { ReportStatus } from '../types';
import { Language } from './translations';

export const STATUS_CONFIG: Record<ReportStatus, { label: Record<Language, string>; color: string; bgColor: string; mapColor: string }> = {
  REPORTED: { label: { en: 'Reported', tr: 'Bildirildi' }, color: 'text-red-700', bgColor: 'bg-red-100', mapColor: '#ef4444' },
  UNDER_REVIEW: { label: { en: 'Under Review', tr: 'İnceleniyor' }, color: 'text-yellow-700', bgColor: 'bg-yellow-100', mapColor: '#eab308' },
  SCHEDULED: { label: { en: 'Scheduled', tr: 'Planlandı' }, color: 'text-blue-700', bgColor: 'bg-blue-100', mapColor: '#2563eb' },
  FIXED: { label: { en: 'Fixed', tr: 'Onarıldı' }, color: 'text-green-700', bgColor: 'bg-green-100', mapColor: '#22c55e' },
};

export const STATUS_ORDER: ReportStatus[] = ['REPORTED', 'UNDER_REVIEW', 'SCHEDULED', 'FIXED'];

export function formatDate(dateStr: string, lang: Language = 'en'): string {
  return new Date(dateStr).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function timeAgo(dateStr: string, lang: Language = 'en'): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return lang === 'tr' ? 'az önce' : 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return lang === 'tr' ? `${minutes} dk önce` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return lang === 'tr' ? `${hours} sa önce` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return lang === 'tr' ? `${days} g önce` : `${days}d ago`;
  return formatDate(dateStr, lang);
}
