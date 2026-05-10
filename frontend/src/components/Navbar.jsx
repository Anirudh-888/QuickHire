import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ThemeToggle from './ThemeToggle';
import '../index.css';

const Navbar = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="ios-navbar animate-fade-in-up">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <img src="/logo.png" alt="QuickHire" className="nav-logo-img" />
          <span className="nav-brand">QuickHire</span>
        </Link>
        
        <div className="nav-links">
          <Link to="/" className={`nav-item ${isActive('/')}`}>{t('navHome', 'Home')}</Link>
          <Link to="/client" className={`nav-item ${isActive('/client')}`}>{t('navClients', 'For Clients')}</Link>
          <Link to="/professional" className={`nav-item ${isActive('/professional')}`}>{t('navProfs', 'For Professionals')}</Link>
          <Link to="/contact" className={`nav-item ${isActive('/contact')}`}>{t('navContact', 'Contact Us')}</Link>
        </div>

        <div className="nav-actions">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
