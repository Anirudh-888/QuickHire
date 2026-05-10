import { useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';

const ClientLogin = ({ hideContainer }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setMessage(t('btnProcessing'));

    try {
      // Mock API call simulation
      await new Promise(resolve => setTimeout(resolve, 2000));

      setStatus('success');
      setMessage(t('loginSuccessMsg'));
      
      // Reset form
      setFormData({ email: '', password: '' });
      
      // Redirect after a short delay (e.g. to dashboard)
      setTimeout(() => navigate('/'), 1500);

    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage(t('errorMsg'));
    }
  };

  const content = (
    <div className="registration-card">
      <div className="registration-header">
          <h2>{t('clientLoginTitle')}</h2>
          <p>{t('clientLoginSubtitle')}</p>
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

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? (
              <span className="btn-content">
                <Loader2 className="spinner" size={20} /> {t('btnProcessing')}
              </span>
            ) : (
              t('btnLogin')
            )}
          </button>
        </form>

        <div className="auth-switch">
          <p>{t('noAccount')} <Link to="/client/register">{t('clientBtnRegister')}</Link></p>
        </div>

        {status === 'success' && (
          <div className="status-message success">
            <CheckCircle size={20} />
            <p>{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="status-message error">
            <AlertCircle size={20} />
            <p>{message}</p>
          </div>
        )}
      </div>
  );

  if (hideContainer) return content;
  return (
    <div className="registration-container">
      {content}
    </div>
  );
};

export default ClientLogin;
