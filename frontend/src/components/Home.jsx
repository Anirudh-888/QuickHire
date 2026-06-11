import { Link } from 'react-router-dom';
import { Shield, Zap, Award, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import anirudhPhoto from '../assets/anirudh.jpg';
import prajwalPhoto from '../assets/prajwal.jpg';
import shivkumarPhoto from '../assets/shivkumar.jpg';
import '../index.css';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="landing-page animate-fade-in-up">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">{t('homeHeroTitle', 'Quick Hire')}</h1>
          <p className="hero-subtitle">{t('homeHeroSubtitle', 'Empowering professionals, top class Client service.')}</p>
          <div className="hero-actions">
            <Link to="/client" className="submit-btn home-btn">{t('btnFindProf', 'Find Professionals')}</Link>
            <Link to="/professional" className="submit-btn home-btn outline">{t('btnFindJobs', 'Find Jobs')}</Link>
          </div>
        </div>
      </section>

      {/* Why Us / Features */}
      <section className="features-section">
        <h2 className="section-title">{t('whyChoose', 'Why Choose QuickHire?')}</h2>
        <div className="features-grid">
          <div className="feature-card registration-card">
            <Zap className="feature-icon" />
            <h3>{t('featConvenience', 'Ultimate Convenience')}</h3>
            <p>{t('featConvenienceDesc', 'Our platform is designed to make hiring and finding work as seamless as possible with instant matching.')}</p>
          </div>
          <div className="feature-card registration-card">
            <Shield className="feature-icon" />
            <h3>{t('featSecurity', 'High-Level Security')}</h3>
            <p>{t('featSecurityDesc', 'We verify every professional and secure every transaction, ensuring a safe environment for everyone.')}</p>
          </div>
          <div className="feature-card registration-card">
            <Award className="feature-icon" />
            <h3>{t('featAchievements', 'Proven Achievements')}</h3>
            <p>{t('featAchievementsDesc', 'Over 10,000+ successful job matches and a growing community of satisfied clients and workers.')}</p>
          </div>
        </div>
      </section>

      {/* Team / Builders Placeholder */}
      <section className="team-section">
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
