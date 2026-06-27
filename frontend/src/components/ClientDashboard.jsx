import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, MapPin, Calendar, Clock, Wrench, Loader2, CheckCircle, AlertCircle, Search, X } from 'lucide-react';
import { db, storage, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../index.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to fly the map to a new position when geocoding succeeds
const FlyToLocation = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 14, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
};

// Component to handle map click events
const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : <Marker position={position} />;
};

const ClientDashboard = () => {
  const { t } = useTranslation();
  const geocodeTimerRef = useRef(null);

  const [formData, setFormData] = useState({
    category: '',
    date: '',
    time: '',
    street: '',
    city: '',
    pincode: '',
    description: ''
  });
  const [files, setFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }
  const [position, setPosition] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // ── Geolocation & Reverse-Geocoding ─────────────────────────────────────
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      return;
    }

    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });

        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
          const res = await fetch(url, {
            headers: { 'Accept-Language': 'en', 'User-Agent': 'QuickHire/1.0' }
          });
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const streetVal = addr.road || addr.suburb || addr.neighbourhood || addr.village || '';
            const cityVal = addr.city || addr.town || addr.municipality || addr.state_district || '';
            const pincodeVal = addr.postcode || '';

            setFormData(prev => ({
              ...prev,
              street: streetVal,
              city: cityVal,
              pincode: pincodeVal
            }));
          }
        } catch (err) {
          console.warn("Reverse geocoding failed:", err);
        } finally {
          setIsGeocoding(false);
        }
      },
      (err) => {
        console.warn("Geolocation permission denied or error:", err);
        setIsGeocoding(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, []);

  // Run on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      detectLocation();
    }, 0);
    return () => clearTimeout(timer);
  }, [detectLocation]);

  // ── Geocoding: runs whenever street, city, or pincode change ──────────────
  const geocodeAddress = useCallback(async (street, city, pincode) => {
    const query = [street, city, pincode].filter(Boolean).join(', ');
    if (query.length < 5) return; // wait until there's enough text

    setIsGeocoding(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'QuickHire/1.0' }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        setPosition({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      }
    } catch (err) {
      // silently fail — user can still click on the map manually
      console.warn('Geocoding failed:', err);
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    // Debounce geocoding when location fields change
    if (['street', 'city', 'pincode'].includes(name)) {
      clearTimeout(geocodeTimerRef.current);
      geocodeTimerRef.current = setTimeout(() => {
        geocodeAddress(updated.street, updated.city, updated.pincode);
      }, 800); // wait 800ms after the user stops typing
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      
      setImagePreviews(prev => {
        prev.forEach(url => URL.revokeObjectURL(url));
        return newPreviews;
      });
      setFiles(selectedFiles);
    }
  };

  const handleRemoveFile = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      if (droppedFiles.length > 0) {
        const newPreviews = droppedFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => {
          prev.forEach(url => URL.revokeObjectURL(url));
          return newPreviews;
        });
        setFiles(droppedFiles);
      }
    }
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      setStatus({ type: 'error', message: 'You must be logged in to post a request.' });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);
    setUploadProgress({ done: 0, total: files.length });

    try {
      // ── Upload all photos in parallel for speed ─────────────────────────
      const uploadPromises = files.map(async (file, idx) => {
        const fileRef = ref(storage, `jobs/${user.uid}/${Date.now()}_${idx}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        const url = await getDownloadURL(snapshot.ref);
        setUploadProgress(prev => ({ ...prev, done: prev.done + 1 }));
        return url;
      });

      const imageUrls = await Promise.all(uploadPromises);

      // ── Save job to Firestore ────────────────────────────────────────────
      await addDoc(collection(db, 'jobs'), {
        clientId: user.uid,
        clientEmail: user.email || '',
        ...formData,
        location: position ? { lat: position.lat, lng: position.lng } : null,
        imageUrls,
        status: 'open',
        createdAt: new Date().toISOString()
      });

      setStatus({ type: 'success', message: 'Service request successfully submitted!' });
      setFormData({ category: '', date: '', time: '', street: '', city: '', pincode: '', description: '' });
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setImagePreviews([]);
      setFiles([]);
      setPosition(null);
      setUploadProgress({ done: 0, total: 0 });
    } catch (error) {
      console.error('Job posting error:', error);
      setStatus({ type: 'error', message: error.message || 'Failed to submit request. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup debounce timer on unmount
  useEffect(() => () => clearTimeout(geocodeTimerRef.current), []);

  return (
    <div className="dashboard-page animate-fade-in-up">
      <div className="dashboard-header">
        <h1 className="dashboard-title">{t('dashboardTitle', 'Request a Professional')}</h1>
        <p className="dashboard-subtitle">{t('dashboardSubtitle', 'Fill out the details below to find the perfect professional for your task.')}</p>
      </div>

      <div className="dashboard-content">
        <form onSubmit={handleSubmit} className="job-form registration-card">

          {/* ── Service Details ─────────────────────────────────────────── */}
          <div className="form-section">
            <h3 className="section-heading"><Wrench size={20} /> Service Details</h3>

            <div className="form-group">
              <label>Service Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="feedback-textarea"
                required
              >
                <option value="" disabled>Select a category</option>
                <optgroup label="Home &amp; Repair">
                  <option value="Plumber">Plumber</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Cleaner">Cleaner</option>
                  <option value="Mechanic">Mechanic</option>
                  <option value="Painter">Painter</option>
                  <option value="Appliance Repair">Appliance Repair</option>
                  <option value="HVAC Technician">HVAC Technician</option>
                  <option value="Landscaper">Landscaper</option>
                </optgroup>
                <optgroup label="Tech &amp; Creative">
                  <option value="Software Developer">Software Developer</option>
                  <option value="Web Designer">Web Designer</option>
                  <option value="Graphic Designer">Graphic Designer</option>
                  <option value="Video Editor">Video Editor</option>
                  <option value="IT Support">IT Support</option>
                </optgroup>
                <optgroup label="Events &amp; Personal">
                  <option value="Photographer">Photographer</option>
                  <option value="Event Planner">Event Planner</option>
                  <option value="Chef/Caterer">Chef/Caterer</option>
                  <option value="Driver">Driver</option>
                  <option value="Babysitter">Babysitter</option>
                  <option value="Personal Trainer">Personal Trainer</option>
                  <option value="Tutor">Tutor</option>
                </optgroup>
                <optgroup label="Other">
                  <option value="General Labor">General Labor</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Other">Other</option>
                </optgroup>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="icon-label"><Calendar size={16} /> Preferred Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  style={{ cursor: 'pointer' }}
                  required
                />
              </div>
              <div className="form-group">
                <label className="icon-label"><Clock size={16} /> Preferred Time</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  style={{ cursor: 'pointer' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Describe the Repair/Task</label>
              <textarea
                name="description"
                rows="4"
                className="feedback-textarea"
                placeholder="Briefly describe what needs to be done..."
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>
          </div>

          {/* ── Upload Photos ────────────────────────────────────────────── */}
          <div className="form-section">
            <h3 className="section-heading"><Upload size={20} /> Upload Photos <span style={{ fontWeight: 400, fontSize: '0.8rem', color: '#9ca3af' }}>(optional)</span></h3>
            <div 
              className={`file-drop-zone ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="upload-circle-btn">
                <Upload size={20} />
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Drag and drop photos or click to browse
              </p>
              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden-file-input" />
            </div>

            {/* Thumbnail previews */}
            {imagePreviews.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                gap: '0.75rem',
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                borderRadius: '12px',
                border: '1.5px solid var(--border)'
              }}>
                {imagePreviews.map((url, idx) => (
                  <div key={idx} style={{
                    position: 'relative',
                    aspectRatio: '1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1.5px solid var(--border)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    <img src={url} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#dc2626'}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)'}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {files.length > 0 && (
              <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#10b981', fontWeight: 600 }}>
                ✓ {files.length} photo(s) selected
              </p>
            )}
            {/* Upload progress bar */}
            {isSubmitting && files.length > 0 && uploadProgress.total > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '4px' }}>
                  <span>Uploading photos…</span>
                  <span>{uploadProgress.done}/{uploadProgress.total}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', height: '6px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${uploadProgress.total ? (uploadProgress.done / uploadProgress.total) * 100 : 0}%`,
                    background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                    borderRadius: '9999px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* ── Location & Address ───────────────────────────────────────── */}
          <div className="form-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
              <h3 className="section-heading" style={{ margin: 0, border: 'none', padding: 0 }}><MapPin size={20} /> Location &amp; Address</h3>
              <button
                type="button"
                onClick={detectLocation}
                className="submit-btn"
                style={{
                  margin: 0,
                  padding: '0.4rem 1rem',
                  fontSize: '0.85rem',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(79, 70, 229, 0.1)',
                  color: 'var(--primary)',
                  border: '1px solid var(--primary)',
                  boxShadow: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(79, 70, 229, 0.2)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(79, 70, 229, 0.1)'}
              >
                <MapPin size={14} className={isGeocoding ? "spinner" : "animate-pulse-slow"} />
                {isGeocoding ? "Detecting..." : "Detect Location"}
              </button>
            </div>

            {/* Address fields FIRST so user types to geocode */}
            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                name="street"
                placeholder="123 Main St"
                value={formData.street}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  placeholder="ZIP / Pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Status hint */}
            <p style={{ marginBottom: '1rem', color: '#9ca3af', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isGeocoding
                ? <><Loader2 size={14} className="spinner" style={{ display: 'inline' }} /> Finding your location on the map…</>
                : position
                  ? <><CheckCircle size={14} style={{ color: '#6ee7b7', display: 'inline' }} /> Location pinned — you can drag or click to adjust.</>
                  : <><Search size={14} /> Type your address above or click the map to drop a pin.</>
              }
            </p>

            <div className="map-placeholder" style={{ padding: 0, overflow: 'hidden', height: '300px', borderRadius: '8px', zIndex: 0 }}>
              <MapContainer
                center={[20.5937, 78.9629]}
                zoom={4}
                style={{ height: '100%', width: '100%', zIndex: 1 }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} />
                <FlyToLocation position={position} />
              </MapContainer>
            </div>
          </div>

          {/* ── Submit ───────────────────────────────────────────────────── */}
          <button
            type="submit"
            className="submit-btn mt-6"
            style={{ width: '100%' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-content">
                <Loader2 className="spinner" size={20} />
                {files.length > 0 && uploadProgress.total > 0
                  ? `Uploading (${uploadProgress.done}/${uploadProgress.total})…`
                  : 'Saving your request…'}
              </span>
            ) : (
              'Post Request'
            )}
          </button>

          {status && (
            <div className={`status-message ${status.type}`} style={{ marginTop: '1rem' }}>
              {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <p>{status.message}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ClientDashboard;
