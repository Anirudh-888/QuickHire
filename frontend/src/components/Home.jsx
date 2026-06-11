import { Link } from 'react-router-dom';
import { Shield, Zap, Award, Users, Wrench, Hammer, Sparkles, Search, Briefcase, Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import anirudhPhoto from '../assets/anirudh.jpg';
import prajwalPhoto from '../assets/prajwal.jpg';
import shivkumarPhoto from '../assets/shivkumar.jpg';
import '../index.css';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="landing-page animate-fade-in-up" style={{ padding: '2rem 1.5rem' }}>
      {/* Hero Section styled as a browser mockup */}
      <section className="hero-section" style={{ padding: '2rem 0' }}>
        <div className="browser-window-mockup">
          <div className="browser-window-header">
            <div className="browser-window-dots">
              <div className="browser-window-dot red"></div>
              <div className="browser-window-dot yellow"></div>
              <div className="browser-window-dot green"></div>
            </div>
            <div className="browser-window-address">quickhire.app</div>
            <div style={{ width: '52px' }}></div> {/* Spacer to center the address bar */}
          </div>

          <div className="browser-window-content">
            <div className="trusted-badge">
              <Sparkles size={14} style={{ color: '#818cf8' }} className="animate-pulse" />
              <span>{t('trustedBadge', 'Trusted by 10,000+ professionals')}</span>
            </div>

            <h1 className="hero-title-main">
              Quick <span className="gradient-text">Hire</span>
            </h1>

            <p className="hero-subtitle" style={{ maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
              {t('homeHeroSubtitle', 'Empowering professionals, top class client service.')}
            </p>

            <div className="hero-actions" style={{ display: 'flex', flexDirection: 'row', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/client" className="premium-pill-btn primary">
                <Search size={18} />
                {t('btnFindProf', 'Find Professionals')}
              </Link>
              <Link to="/professional" className="premium-pill-btn secondary">
                <Briefcase size={18} />
                {t('btnFindJobs', 'Find Jobs')}
              </Link>
            </div>

            <div className="floating-dock">
              <div className="dock-icon-circle red" title="Wrench"><Wrench size={20} /></div>
              <div className="dock-icon-circle orange" title="Hammer"><Hammer size={20} /></div>
              <div className="dock-icon-circle indigo" title="Users"><Users size={20} /></div>
              <div className="dock-icon-circle green" title="Shield"><Shield size={20} /></div>
              <div className="dock-icon-circle gold" title="Award"><Award size={20} /></div>
              <div className="dock-icon-circle cyan" title="AI Bot"><Bot size={20} /></div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us / Features Stacked vertically to match premium layout */}
      <section className="features-section" style={{ padding: '6rem 0 3rem 0' }}>
        <h2 className="section-title" style={{ marginBottom: '1rem' }}>{t('whyChoose', 'Why Choose QuickHire?')}</h2>
        <p className="section-subtitle" style={{ marginBottom: '3rem' }}>{t('whyChooseSub', 'Designed to make service matching beautiful, fast, and secure.')}</p>
        
        <div className="features-container-stacked">
          <div className="feature-card-premium">
            <div className="feature-premium-icon-box orange">
              <Zap size={24} />
            </div>
            <h3>{t('featConvenience', 'Ultimate Convenience')}</h3>
            <p>{t('featConvenienceDesc', 'Our platform is designed to make hiring effortless, fast, and beautifully simple.')}</p>
          </div>

          <div className="feature-card-premium">
            <div className="feature-premium-icon-box green">
              <Shield size={24} />
            </div>
            <h3>{t('featSecurity', 'High-Level Security')}</h3>
            <p>{t('featSecurityDesc', 'We verify every professional and protect every interaction end-to-end.')}</p>
          </div>

          <div className="feature-card-premium">
            <div className="feature-premium-icon-box purple">
              <Award size={24} />
            </div>
            <h3>{t('featAchievements', 'Proven Achievements')}</h3>
            <p>{t('featAchievementsDesc', 'Over 10,000+ successful job matches and a community that keeps growing.')}</p>
          </div>
        </div>
      </section>

      {/* Team / Builders Page Section */}
      <section className="team-section" style={{ padding: '4rem 0' }}>
        <h2 className="section-title">{t('meetBuilders', 'Meet the Builders')}</h2>
        <p className="section-subtitle">{t('meetBuildersSub', 'The passionate team behind QuickHire.')}</p>
        <div className="team-grid">
          <div className="team-member registration-card">
            <div className="photo-placeholder">
              <img src={anirudhPhoto} alt="S Anirudh" className="team-photo" />
            </div>
            <h4>{t('teamAnirudh', 'S Anirudh')}</h4>
            <p>{t('roleAnirudh', 'Entire project lead ("Front and Back end")')}</p>
          </div>
          <div className="team-member registration-card">
            <div className="photo-placeholder">
              <img src={prajwalPhoto} alt="Prajwal MR" className="team-photo" />
            </div>
            <h4>{t('teamPrajwal', 'Prajwal MR')}</h4>
            <p>{t('rolePrajwal', 'Front end')}</p>
          </div>
          <div className="team-member registration-card">
            <div className="photo-placeholder">
              <img src={shivkumarPhoto} alt="Shivkumar" className="team-photo" />
            </div>
            <h4>{t('teamShivkumar', 'Shivkumar')}</h4>
            <p>{t('roleShivkumar', 'Backend')}</p>
          </div>
          <div className="team-member registration-card">
            <div className="photo-placeholder"><Users size={48} /></div>
            <h4>{t('teamSwayam', 'Swayam ITI')}</h4>
            <p>{t('roleSwayam', 'Backend')}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
