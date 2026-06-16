import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import '../index.css';

const Navbar = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Isolated Floating Logo with Glowing and Continuous Rotating Ring */}
      <Link to="/" className="floating-logo-container" onClick={closeMenu}>
        <div className="logo-glow-effect"></div>
        <div className="logo-animated-ring"></div>
        <img src="/logo.png" alt="QuickHire" className="isolated-logo-img" />
      </Link>

      <nav className="ios-navbar animate-fade-in-up">
        <div className="nav-container">
          <Link to="/" className="nav-logo" onClick={closeMenu}>
            <span className="nav-brand">QuickHire</span>
          </Link>
        
        {/* Desktop Links */}
        <div className="nav-links">
          <Link to="/" className={`nav-item ${isActive('/')}`}>{t('navHome', 'Home')}</Link>
          <Link to="/client" className={`nav-item ${isActive('/client')}`}>{t('navClients', 'For Clients')}</Link>
          <Link to="/professional" className={`nav-item ${isActive('/professional')}`}>{t('navProfs', 'For Professionals')}</Link>
          <Link to="/contact" className={`nav-item ${isActive('/contact')}`}>{t('navContact', 'Contact Us')}</Link>
        </div>

        <div className="nav-actions">
          <LanguageSwitcher />
          <ThemeToggle />
          
          {/* Hamburger Menu Icon */}
          <button 
            className="hamburger-btn" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {isMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Links */}
      {isMenuOpen && (
        <div className="mobile-nav-menu animate-fade-in">
          <Link to="/" className={`mobile-nav-item ${isActive('/')}`} onClick={closeMenu}>{t('navHome', 'Home')}</Link>
          <Link to="/client" className={`mobile-nav-item ${isActive('/client')}`} onClick={closeMenu}>{t('navClients', 'For Clients')}</Link>
          <Link to="/professional" className={`mobile-nav-item ${isActive('/professional')}`} onClick={closeMenu}>{t('navProfs', 'For Professionals')}</Link>
          <Link to="/contact" className={`mobile-nav-item ${isActive('/contact')}`} onClick={closeMenu}>{t('navContact', 'Contact Us')}</Link>
        </div>
      )}
    </nav>
    </>
  );
};

export default Navbar;
