import { useState } from 'react';
import ProfessionalLogin from './ProfessionalLogin';
import ProfessionalRegister from './ProfessionalRegister';
import '../index.css';

const ProfessionalPortal = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleView = () => setIsLogin(!isLogin);

  return (
    <div className="portal-container animate-fade-in-up">
      <div className="portal-header">
        <h1>Professional Portal</h1>
        <p>Find jobs, manage your profile, and connect with clients.</p>
        
        <div className="portal-tabs">
          <button 
            className={`portal-tab ${isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`portal-tab ${!isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>
      </div>

      <div className="portal-content">
        {isLogin ? (
          <ProfessionalLogin onToggle={toggleView} hideContainer />
        ) : (
          <ProfessionalRegister onToggle={toggleView} hideContainer />
        )}
      </div>
    </div>
  );
};

export default ProfessionalPortal;
