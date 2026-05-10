import { useState } from 'react';
import ClientLogin from './ClientLogin';
import ClientRegister from './ClientRegister';
import '../index.css';

const ClientPortal = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleView = () => setIsLogin(!isLogin);

  // We pass onToggle prop to the children if we modify them, 
  // but since we already built ClientLogin and Register using react-router Links,
  // we need to slightly modify them to accept onToggle, OR we can just wrap them.
  // Actually, I'll build a wrapper that overrides the default switch.
  
  return (
    <div className="portal-container animate-fade-in-up">
      <div className="portal-header">
        <h1>Client Portal</h1>
        <p>Manage your job postings and find the best professionals.</p>
        
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
        {isLogin ? <ClientLogin hideContainer /> : <ClientRegister hideContainer />}
      </div>
    </div>
  );
};

export default ClientPortal;
