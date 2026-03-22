import { useState, useRef, FormEvent } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import api from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import DuplicateWarning from '../components/DuplicateWarning';

const BUCA_CENTER: [number, number] = [38.3888, 27.1750];

const pinIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 30px; height: 30px; border-radius: 50%;
    background: #f97316; border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
  "><svg width="14" height="14" viewBox="0 0 20 20" fill="white"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function ReportPage() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [nearbyReports, setNearbyReports] = useState<any[]>([]);
  const [duplicateDismissed, setDuplicateDismissed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLocationSelect = async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    setDuplicateDismissed(false);
    try {
      const res = await api.get('/reports/nearby/check', { params: { lat, lng } });
      if (res.data.hasDuplicates) {
        setNearbyReports(res.data.nearby);
      } else {
        setNearbyReports([]);
      }
    } catch {
      setNearbyReports([]);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleVoteExisting = async (reportId: string) => {
    try {
      await api.post(`/votes/${reportId}`, { value: 1 });
      navigate('/');
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!position) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('latitude', position[0].toString());
      formData.append('longitude', position[1].toString());
      if (description) formData.append('description', description);
      if (photo) formData.append('photo', photo);

      await api.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/');
    } catch (err) {
      console.error('Failed to submit report', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Map */}
      <div className="h-1/2 md:h-full md:w-1/2 relative">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow text-sm text-gray-700 font-medium">
          {t('tapMapToPin')}
        </div>
        <MapContainer center={BUCA_CENTER} zoom={15} className="h-full w-full">
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          {position && <Marker position={position} icon={pinIcon} />}
        </MapContainer>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t('reportAPothole')}</h2>

        {nearbyReports.length > 0 && !duplicateDismissed && (
          <DuplicateWarning
            nearby={nearbyReports}
            onDismiss={() => setDuplicateDismissed(true)}
            onVoteExisting={handleVoteExisting}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Location Status */}
          <div className={`p-3 rounded-lg border ${position ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
            <div className="flex items-center gap-2">
              {position ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-green-700 font-medium">
                    {t('locationSet')}: {position[0].toFixed(5)}, {position[1].toFixed(5)}
                  </span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="text-sm text-gray-500">{t('tapMapToSetLocation')}</span>
                </>
              )}
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('photoOptional')}</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary-400 transition"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="max-h-40 mx-auto rounded" />
              ) : (
                <div className="text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm">{t('tapToUploadPhoto')}</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
              placeholder={t('descriptionPlaceholder')}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!position || submitting}
            className="w-full bg-accent-500 text-white py-3 rounded-lg font-semibold hover:bg-accent-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t('submitting') : t('submitReport')}
          </button>
        </form>
      </div>
    </div>
  );
}
