export type Language = 'en' | 'tr';

const translations = {
  // App-wide
  appName: { en: 'Lastiğim Gitti', tr: 'Lastiğim Gitti' },
  appTaglineLogin: { en: 'İzmir - Pothole Reporting Platform', tr: 'İzmir - Çukur Raporlama Platformu' },
  appTaglineRegister: { en: 'Join your community in fixing İzmir\'s roads', tr: 'İzmir\'in yollarını onarmak için topluluğa katılın' },

  // Auth
  signIn: { en: 'Sign In', tr: 'Giriş Yap' },
  signingIn: { en: 'Signing in...', tr: 'Giriş yapılıyor...' },
  signUp: { en: 'Sign Up', tr: 'Kayıt Ol' },
  createAccount: { en: 'Create Account', tr: 'Hesap Oluştur' },
  creatingAccount: { en: 'Creating account...', tr: 'Hesap oluşturuluyor...' },
  email: { en: 'Email', tr: 'E-posta' },
  password: { en: 'Password', tr: 'Şifre' },
  fullName: { en: 'Full Name', tr: 'Ad Soyad' },
  emailPlaceholder: { en: 'you@example.com', tr: 'siz@ornek.com' },
  passwordPlaceholder: { en: 'Enter your password', tr: 'Şifrenizi girin' },
  passwordMinLength: { en: 'At least 6 characters', tr: 'En az 6 karakter' },
  namePlaceholder: { en: 'Your full name', tr: 'Adınız ve soyadınız' },
  noAccount: { en: "Don't have an account?", tr: 'Hesabınız yok mu?' },
  hasAccount: { en: 'Already have an account?', tr: 'Zaten hesabınız var mı?' },
  loginFailed: { en: 'Login failed', tr: 'Giriş başarısız' },
  registerFailed: { en: 'Registration failed', tr: 'Kayıt başarısız' },
  logout: { en: 'Logout', tr: 'Çıkış' },

  // Navbar
  map: { en: 'Map', tr: 'Harita' },
  feed: { en: 'Feed', tr: 'Akış' },
  report: { en: '+ Report', tr: '+ Bildir' },
  admin: { en: 'Admin', tr: 'Yönetim' },

  // Statuses
  statusAll: { en: 'All', tr: 'Tümü' },
  statusReported: { en: 'Reported', tr: 'Bildirildi' },
  statusUnderReview: { en: 'Under Review', tr: 'İnceleniyor' },
  statusReview: { en: 'Review', tr: 'İncele' },
  statusScheduled: { en: 'Scheduled', tr: 'Planlandı' },
  statusFixed: { en: 'Fixed', tr: 'Onarıldı' },

  // Map page
  reportPothole: { en: 'Report Pothole', tr: 'Çukur Bildir' },
  status: { en: 'Status', tr: 'Durum' },
  myLocation: { en: 'My Location', tr: 'Konumum' },
  noDescription: { en: 'No description', tr: 'Açıklama yok' },
  by: { en: 'by', tr: 'tarafından' },
  upvote: { en: 'Upvote', tr: 'Oyla' },
  downvote: { en: 'Downvote', tr: 'Olumsuz Oyla' },

  // Report page
  reportAPothole: { en: 'Report a Pothole', tr: 'Çukur Bildir' },
  tapMapToPin: { en: 'Tap the map to drop a pin', tr: 'Haritaya dokunarak konum belirleyin' },
  locationSet: { en: 'Location set', tr: 'Konum belirlendi' },
  tapMapToSetLocation: { en: 'Tap the map to set location', tr: 'Konum belirlemek için haritaya dokunun' },
  photoOptional: { en: 'Photo (optional)', tr: 'Fotoğraf (isteğe bağlı)' },
  tapToUploadPhoto: { en: 'Tap to upload a photo', tr: 'Fotoğraf yüklemek için dokunun' },
  description: { en: 'Description', tr: 'Açıklama' },
  descriptionPlaceholder: { en: 'Describe the pothole (size, severity, hazard level...)', tr: 'Çukuru tanımlayın (boyut, ciddiyet, tehlike seviyesi...)' },
  useMyLocation: { en: 'Use My Location', tr: 'Konumumu Kullan' },
  locating: { en: 'Locating...', tr: 'Konum bulunuyor...' },
  locationError: { en: 'Could not get your location. Please enable location services.', tr: 'Konumunuz alınamadı. Lütfen konum servislerini etkinleştirin.' },
  orEnterAddress: { en: 'Or enter an address', tr: 'Veya adres girin' },
  address: { en: 'Address', tr: 'Adres' },
  addressPlaceholder: { en: 'e.g. Buca, İzmir or street name...', tr: 'ör. Buca, İzmir veya sokak adı...' },
  searchAddress: { en: 'Search', tr: 'Ara' },
  searching: { en: 'Searching...', tr: 'Aranıyor...' },
  addressNotFound: { en: 'Address not found. Try a more specific address.', tr: 'Adres bulunamadı. Daha ayrıntılı bir adres deneyin.' },
  submitReport: { en: 'Submit Report', tr: 'Raporu Gönder' },
  submitting: { en: 'Submitting...', tr: 'Gönderiliyor...' },

  // Duplicate warning
  duplicateDetected: { en: 'Possible duplicate detected!', tr: 'Olası kopya tespit edildi!' },
  duplicateMessage1: { en: 'There is', tr: 'Bu konumun' },
  duplicateMessage1Plural: { en: 'There are', tr: 'Bu konumun' },
  duplicateMessageWithin: { en: 'existing report within 50 meters.', tr: "metre yakınında mevcut rapor var." },
  duplicateMessageWithinPlural: { en: 'existing reports within 50 meters.', tr: "metre yakınında mevcut rapor var." },
  duplicateConsider: { en: 'Consider upvoting instead.', tr: 'Bunun yerine oy vermeyi düşünün.' },
  upvoteThis: { en: 'Upvote this', tr: 'Bunu oyla' },
  reportAnyway: { en: 'Report anyway — this is a different pothole', tr: 'Yine de bildir — bu farklı bir çukur' },
  mAway: { en: 'm away', tr: 'm uzakta' },
  noDescriptionProvided: { en: 'No description provided', tr: 'Açıklama belirtilmedi' },

  // Feed page
  allReports: { en: 'All Reports', tr: 'Tüm Raporlar' },
  reports: { en: 'reports', tr: 'rapor' },
  mostVotes: { en: 'Most Votes', tr: 'En Çok Oy' },
  newest: { en: 'Newest', tr: 'En Yeni' },
  allStatus: { en: 'All Status', tr: 'Tüm Durumlar' },
  noReportsFound: { en: 'No reports found', tr: 'Rapor bulunamadı' },
  beFirst: { en: 'Be the first to report a pothole!', tr: 'İlk çukuru siz bildirin!' },

  // Admin dashboard
  adminDashboard: { en: 'Admin Dashboard', tr: 'Yönetim Paneli' },
  totalReports: { en: 'Total Reports', tr: 'Toplam Rapor' },
  avgTimeToFix: { en: 'Average time to fix', tr: 'Ortalama onarım süresi' },
  fixRate: { en: 'Fix rate', tr: 'Onarım oranı' },
  table: { en: 'Table', tr: 'Tablo' },
  votes: { en: 'Votes', tr: 'Oylar' },
  reporter: { en: 'Reporter', tr: 'Bildiren' },
  date: { en: 'Date', tr: 'Tarih' },
  actions: { en: 'Actions', tr: 'İşlemler' },
  edit: { en: 'Edit', tr: 'Düzenle' },
  save: { en: 'Save', tr: 'Kaydet' },
  cancel: { en: 'Cancel', tr: 'İptal' },
  adminNotes: { en: 'Admin notes...', tr: 'Yönetici notları...' },
  deleteReport: { en: 'Delete', tr: 'Sil' },
  confirmDelete: { en: 'Are you sure you want to delete this report?', tr: 'Bu raporu silmek istediğinizden emin misiniz?' },

  // Forgot / Reset password
  forgotPassword: { en: 'Forgot password?', tr: 'Şifrenizi mi unuttunuz?' },
  resetYourPassword: { en: 'Reset your password', tr: 'Şifrenizi sıfırlayın' },
  forgotPasswordDescription: { en: 'Enter your email and we\'ll send you a reset code.', tr: 'E-postanızı girin, size sıfırlama kodu gönderelim.' },
  sendResetCode: { en: 'Send Reset Code', tr: 'Sıfırlama Kodu Gönder' },
  sending: { en: 'Sending...', tr: 'Gönderiliyor...' },
  resetCodeSent: { en: 'A reset code has been sent to your email.', tr: 'Sıfırlama kodu e-postanıza gönderildi.' },
  checkEmailForCode: { en: 'Check your inbox (and spam folder) for the 6-digit code.', tr: 'Gelen kutunuzu (ve spam klasörünüzü) 6 haneli kod için kontrol edin.' },
  enterResetCode: { en: 'Enter Reset Code', tr: 'Sıfırlama Kodunu Girin' },
  resetCode: { en: 'Reset Code', tr: 'Sıfırlama Kodu' },
  newPassword: { en: 'New Password', tr: 'Yeni Şifre' },
  confirmPassword: { en: 'Confirm Password', tr: 'Şifreyi Onayla' },
  confirmPasswordPlaceholder: { en: 'Re-enter your new password', tr: 'Yeni şifrenizi tekrar girin' },
  resetPassword: { en: 'Reset Password', tr: 'Şifreyi Sıfırla' },
  resetting: { en: 'Resetting...', tr: 'Sıfırlanıyor...' },
  passwordsDoNotMatch: { en: 'Passwords do not match', tr: 'Şifreler eşleşmiyor' },
  rememberPassword: { en: 'Remember your password?', tr: 'Şifrenizi hatırlıyor musunuz?' },
  tryDifferentEmail: { en: '← Try a different email', tr: '← Farklı bir e-posta deneyin' },
  somethingWentWrong: { en: 'Something went wrong', tr: 'Bir hata oluştu' },
  // Time ago
  justNow: { en: 'just now', tr: 'az önce' },
  mAgo: { en: 'm ago', tr: 'dk önce' },
  hAgo: { en: 'h ago', tr: 'sa önce' },
  dAgo: { en: 'd ago', tr: 'g önce' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Language): string {
  return translations[key]?.[lang] ?? translations[key]?.['en'] ?? key;
}

export default translations;
