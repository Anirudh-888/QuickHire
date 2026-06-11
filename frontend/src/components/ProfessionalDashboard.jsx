import { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, Wrench, Image as ImageIcon, Briefcase, CheckCircle, Loader2, Navigation2, ExternalLink } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, updateDoc, query, where, arrayUnion } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
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

const ProfessionalDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [translatedJobs, setTranslatedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  
  const { i18n } = useTranslation();

  // Simple in-memory cache to avoid redundant API calls
  const [translationCache] = useState({});

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    const translateAllJobs = async () => {
      if (jobs.length === 0) return;
      
      const targetLang = i18n.language || 'en';
      if (targetLang.startsWith('en')) {
        setTranslatedJobs(jobs);
        setTranslating(false);
        return;
      }

      setTranslating(true);
      const translateText = async (text) => {
        if (!text) return text;
        const cacheKey = `${targetLang}_${text}`;
        if (translationCache[cacheKey]) return translationCache[cacheKey];
        
        try {
          const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
          const data = await res.json();
          if (data?.responseData?.translatedText) {
            translationCache[cacheKey] = data.responseData.translatedText;
            return data.responseData.translatedText;
          }
        } catch (e) {
          console.error("Translation error:", e);
        }
        return text; // Fallback to original
      };

      const tJobs = await Promise.all(jobs.map(async job => {
        const tCategory = await translateText(job.category);
        const tDesc = await translateText(job.description);
        return { ...job, category: tCategory, description: tDesc };
      }));

      setTranslatedJobs(tJobs);
      setTranslating(false);
    };

    translateAllJobs();
  }, [jobs, i18n.language, translationCache]);

  const fetchJobs = async () => {
    try {
      const q = query(collection(db, "jobs"), where("status", "==", "open"));
      const querySnapshot = await getDocs(q);
      const jobsData = [];
      querySnapshot.forEach((doc) => {
        jobsData.push({ id: doc.id, ...doc.data() });
      });
      // Sort by newest first
      jobsData.sort((a, b) => new Date(b.createdAt || 0).getTime() < new Date(a.createdAt || 0).getTime() ? -1 : 1);
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please login to apply for jobs.");
      return;
    }

    setApplying(true);
    try {
      const jobRef = doc(db, 'jobs', selectedJob.id);
      await updateDoc(jobRef, {
        applicants: arrayUnion(user.uid)
      });
      setApplySuccess(true);
      setTimeout(() => {
        setApplySuccess(false);
        setSelectedJob(null);
        fetchJobs(); // Refresh jobs
      }, 2000);
    } catch (error) {
      console.error("Error applying to job:", error);
      alert("Failed to apply. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const JobCard = ({ job }) => (
    <div className="job-card registration-card" onClick={() => setSelectedJob(job)} style={{ cursor: 'pointer', transition: 'transform 0.2s', padding: '1.5rem' }}>
      <div className="job-card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Wrench size={20} className="primary-text" /> {job.category}
        </h3>
        <span className="status-badge new" style={{ background: 'rgba(110, 231, 183, 0.2)', color: '#6ee7b7', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' }}>New</span>
      </div>
      <p className="job-desc-preview" style={{ color: '#9ca3af', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        {job.description?.substring(0, 80)}...
      </p>
      
      <div className="job-meta-row" style={{ display: 'flex', gap: '1rem', color: '#d1d5db', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} /> {job.date}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {job.time}</span>
      </div>
      <div className="job-meta-row location" style={{ display: 'flex', gap: '1rem', color: '#d1d5db', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={14} /> {job.city}, {job.pincode}</span>
      </div>
      
      {job.imageUrls && job.imageUrls.length > 0 && (
        <div className="job-meta-row" style={{ color: '#6ee7b7', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><ImageIcon size={14} /> {job.imageUrls.length} Photos</span>
        </div>
      )}
      
      <button className="view-details-btn submit-btn mt-4" style={{ width: '100%', padding: '0.6rem' }}>View Details</button>
    </div>
  );

  const JobDetails = ({ job, onClose }) => {
    const mapAddress = [job.street, job.city, job.pincode].filter(Boolean).join(', ');
    const mapUrl = mapAddress ? `https://maps.google.com/maps?q=${encodeURIComponent(mapAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed` : '';
    const isAlreadyApplied = auth.currentUser && job.applicants?.includes(auth.currentUser.uid);

    // Build Google Maps navigation URL — prefer lat/lng coords, fall back to address text
    const googleMapsUrl = job.location
      ? `https://www.google.com/maps/dir/?api=1&destination=${job.location.lat},${job.location.lng}`
      : mapAddress
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}`
        : null;

    const openGoogleMaps = () => {
      if (googleMapsUrl) window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
    };

    // Lock page scroll while modal is visible
    useEffect(() => {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }, []);

    return (
      <div
        onClick={onClose}
        className="modal-backdrop-premium"
      >
        {/* ── Modal Shell ── */}
        <div
          onClick={e => e.stopPropagation()}
          className="animate-fade-in-up modal-shell-premium"
        >

          {/* ── Coloured Top Banner ── */}
          <div className="modal-header-premium" style={{
            borderRadius: '20px 20px 0 0',
            padding: '2rem 2rem 1.5rem',
            position: 'relative',
          }}>
            {/* Close */}
            <button onClick={onClose} style={{
              position: 'absolute', right: '1.25rem', top: '1.25rem',
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: '50%', width: '34px', height: '34px',
              color: '#fff', fontSize: '1.1rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>&times;</button>

            {/* Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '0.6rem' }}>
                <Briefcase size={26} color="#fff" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#fff' }}>
                  {job.category} Needed
                </h2>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={15} /> {job.city}, {job.pincode}
                </p>
              </div>
            </div>

            {/* Quick-stat chips */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[
                { icon: <Calendar size={14}/>, label: job.date },
                { icon: <Clock size={14}/>, label: job.time },
                { icon: <MapPin size={14}/>, label: job.street },
                ...(job.imageUrls?.length > 0 ? [{ icon: <ImageIcon size={14}/>, label: `${job.imageUrls.length} Photos` }] : []),
              ].map((chip, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff', borderRadius: '30px', padding: '0.3rem 0.75rem', fontSize: '0.82rem', fontWeight: '600',
                }}>
                  {chip.icon} {chip.label}
                </span>
              ))}
            </div>
          </div>

          {/* ── Main Content ── */}
          <div className="job-detail-grid" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '0', flex: 1,
          }}>

            {/* Left: Description + Photos */}
            <div className="job-detail-left" style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>

              {/* Description */}
              <div style={{ padding: '1.75rem', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                  <Wrench size={15} /> Task Description
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.95rem', margin: 0 }}>
                  {job.description}
                </p>
              </div>

              {/* Photos */}
              {job.imageUrls?.length > 0 && (
                <div style={{ padding: '1.75rem', flex: 1 }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                    <ImageIcon size={15} /> Photos from Client
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.6rem' }}>
                    {job.imageUrls.map((url, idx) => (
                      <div key={idx} style={{ borderRadius: '8px', overflow: 'hidden', aspectRatio: '1', border: '1px solid var(--border)', cursor: 'zoom-in' }}>
                        <img src={url} alt={`Photo ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
                          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Map + Apply */}
            <div className="job-detail-right" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                  <MapPin size={15} /> Exact Location
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.85rem' }}>
                  {job.street}, {job.city} – {job.pincode}
                </p>

                {/* Map — clicking opens Google Maps navigation */}
                <div
                  onClick={googleMapsUrl ? openGoogleMaps : undefined}
                  title={googleMapsUrl ? 'Click to navigate in Google Maps' : ''}
                  style={{
                    flex: 1, minHeight: '280px', borderRadius: '10px', overflow: 'hidden',
                    border: '1px solid var(--border)', zIndex: 0,
                    position: 'relative',
                    cursor: googleMapsUrl ? 'pointer' : 'default',
                  }}
                >
                  {job.location ? (
                    <MapContainer
                      center={[job.location.lat, job.location.lng]}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                      zoomControl={false}
                      dragging={false}
                      scrollWheelZoom={false}
                      doubleClickZoom={false}
                      touchZoom={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[job.location.lat, job.location.lng]} />
                    </MapContainer>
                  ) : mapUrl ? (
                    <iframe width="100%" height="100%" frameBorder="0" style={{ border: 0 }} src={mapUrl} allowFullScreen></iframe>
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.03)' }}>
                      <p style={{ color: 'var(--text-secondary)' }}>No location provided</p>
                    </div>
                  )}

                  {/* Clickable overlay hint — shown only when coords/address exist */}
                  {googleMapsUrl && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      zIndex: 999,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'flex-end',
                      paddingBottom: '14px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)',
                      pointerEvents: 'none', /* pass clicks through to parent */
                    }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: '#fff', borderRadius: '30px',
                        padding: '5px 14px', fontSize: '0.78rem', fontWeight: '600',
                        letterSpacing: '0.02em',
                      }}>
                        <Navigation2 size={13} /> Click map to navigate
                      </span>
                    </div>
                  )}
                </div>

                {/* Navigate button */}
                {googleMapsUrl && (
                  <button
                    onClick={openGoogleMaps}
                    style={{
                      marginTop: '0.75rem',
                      width: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '0.65rem 1rem',
                      borderRadius: '10px',
                      border: '1.5px solid #4285f4',
                      background: 'rgba(66,133,244,0.12)',
                      color: '#4285f4',
                      fontWeight: '700', fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'background 0.2s, transform 0.15s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(66,133,244,0.22)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(66,133,244,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <Navigation2 size={16} />
                    Navigate with Google Maps
                    <ExternalLink size={13} style={{ opacity: 0.7 }} />
                  </button>
                )}
              </div>

              {/* Apply Button – sticky bottom */}
              <div style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid var(--border)' }}>
                {applySuccess ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', color: '#059669', fontWeight: '700', fontSize: '1rem', padding: '0.85rem', background: '#d1fae5', borderRadius: '10px' }}>
                    <CheckCircle size={22} /> Successfully Applied!
                  </div>
                ) : isAlreadyApplied ? (
                  <button disabled style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', border: 'none', background: 'var(--border)', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '1rem', cursor: 'not-allowed' }}>
                    Already Applied
                  </button>
                ) : (
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="submit-btn"
                    style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem', marginTop: 0 }}
                  >
                    {applying ? 'Submitting…' : 'Apply for this Job Now'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Responsive: stack columns on mobile */}
          <style>{`
            @media (max-width: 768px) {
              .job-detail-grid {
                grid-template-columns: 1fr !important;
              }
              .job-detail-left {
                border-right: none !important;
                border-bottom: 1px solid var(--border) !important;
              }
              .job-detail-right {
                border-top: 1px solid var(--border) !important;
              }
            }
          `}</style>
        </div>
      </div>
    );
  };


  return (
    <div className="dashboard-page animate-fade-in-up">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Available Jobs</h1>
        <p className="dashboard-subtitle">Browse open tasks from clients and apply immediately.</p>
      </div>

      <div className="dashboard-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <Loader2 className="spinner" size={32} style={{ margin: '0 auto 1rem', color: 'var(--primary)' }} />
            Loading jobs...
          </div>
        ) : translating ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <Loader2 className="spinner" size={32} style={{ margin: '0 auto 1rem', color: 'var(--primary)' }} />
            Translating to your language...
          </div>
        ) : translatedJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <h3>No jobs available right now</h3>
            <p>Check back later for new requests.</p>
          </div>
        ) : (
          <div className="jobs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {translatedJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>

      {selectedJob && (
        <JobDetails job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
};

export default ProfessionalDashboard;
