import { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
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

function FlyToPosition({ position }: { position: [number, number] | null }) {
  const map = useMap();
  const lastFlown = useRef<string | null>(null);

  if (position) {
    const key = `${position[0]},${position[1]}`;
    if (lastFlown.current !== key) {
      lastFlown.current = key;
      map.flyTo(position, 17, { duration: 1 });
    }
  }

  return null;
}

export default function ReportPage() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressError, setAddressError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addressWrapperRef = useRef<HTMLDivElement>(null);
  const [nearbyReports, setNearbyReports] = useState<any[]>([]);
  const [duplicateDismissed, setDuplicateDismissed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLocationSelect = async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    setLocationError('');
    setDuplicateDismissed(false);
    // Reverse geocode to auto-fill address
    reverseGeocode(lat, lng);
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

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=tr`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch {
      // Silently fail — address is optional
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(t('locationError'));
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        handleLocationSelect(latitude, longitude);
        setLocating(false);
      },
      () => {
        setLocationError(t('locationError'));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&viewbox=26.5,38.0,28.0,38.8&bounded=1&accept-language=tr`
      );
      const data = await response.json();
      setAddressSuggestions(data);
      setShowSuggestions(data.length > 0);
      if (data.length === 0) {
        setAddressError(t('addressNotFound'));
      } else {
        setAddressError('');
      }
    } catch {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  }, [t]);

  const handleAddressChange = (value: string) => {
    setAddress(value);
    setAddressError('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 400);
  };

  const handleSuggestionClick = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    setAddress(suggestion.display_name);
    setShowSuggestions(false);
    setAddressSuggestions([]);
    handleLocationSelect(lat, lng);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addressWrapperRef.current && !addressWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      if (address) formData.append('address', address);
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
          <FlyToPosition position={position} />
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

          {/* Use My Location Button */}
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={locating}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-60"
          >
            {locating ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('locating')}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2m0 16v2m10-10h-2M4 12H2" />
                </svg>
                {t('useMyLocation')}
              </>
            )}
          </button>
          {locationError && (
            <p className="text-sm text-red-600 -mt-2">{locationError}</p>
          )}

          {/* Address Input with Autocomplete */}
          <div ref={addressWrapperRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('address')}</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                onFocus={() => { if (addressSuggestions.length > 0) setShowSuggestions(true); }}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                placeholder={t('addressPlaceholder')}
                autoComplete="off"
              />
            </div>
            {showSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {addressSuggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="w-full text-left px-3 py-2.5 hover:bg-primary-50 transition text-sm text-gray-700 border-b border-gray-100 last:border-b-0 flex items-start gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="line-clamp-2">{s.display_name}</span>
                  </button>
                ))}
              </div>
            )}
            {addressError && (
              <p className="text-sm text-red-600 mt-1">{addressError}</p>
            )}
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
