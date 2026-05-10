import { useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../index.css';

const ProfessionalLogin = ({ onToggle }) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [status, setStatus] = useState('idle'); 
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setMessage(t('btnProcessing') || 'Processing...');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus('success');
      setMessage(t('loginSuccessMsg') || 'Login successful!');
      setFormData({ email: '', password: '' });
      setTimeout(() => window.location.href = '/', 1500);
    } catch (error) {
      setStatus('error');
      setMessage(t('errorMsg') || 'Error logging in.');
    }
  };

  return (
    <div className="registration-card animate-fade-in-up">
      <div className="registration-header">
        <h2>Professional Login</h2>
        <p>Welcome back! Login to find jobs.</p>
      </div>

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <label htmlFor="email">{t('emailLabel')}</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder={t('emailPlaceholder')}
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">{t('passwordLabel')}</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder={t('passwordPlaceholder')}
            value={formData.password}
            onChange={handleInputChange}
            required
            className="password-input"
          />
        </div>

        <button type="submit" className="submit-btn" disabled={status === 'submitting'}>
          {status === 'submitting' ? (
            <span className="btn-content"><Loader2 className="spinner" size={20} /></span>
          ) : (
            t('btnLogin') || 'Login'
          )}
        </button>
      </form>

      <div className="auth-switch">
        <p>Don't have an account? <button type="button" onClick={onToggle} className="text-link">Sign Up</button></p>
      </div>

      {status === 'success' && <div className="status-message success"><CheckCircle size={20} /><p>{message}</p></div>}
      {status === 'error' && <div className="status-message error"><AlertCircle size={20} /><p>{message}</p></div>}
    </div>
  );
};

export default ProfessionalLogin;
