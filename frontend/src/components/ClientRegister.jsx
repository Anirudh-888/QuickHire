import { useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import '../index.css';

const ClientRegister = ({ hideContainer }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
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
    setMessage(t('statusUploading'));

    try {
      // Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Save additional user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        role: "Client",
        createdAt: new Date().toISOString()
      });

      setStatus('success');
      setMessage(t('clientRegSuccessMsg'));
      
      // Reset form
      setFormData({ fullName: '', email: '', phoneNumber: '', password: '' });
      
      // Redirect after a short delay
      setTimeout(() => navigate('/client/login'), 2000);

    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage(error.message || t('errorMsg'));
    }
  };

  const content = (
    <div className="registration-card">
      <div className="registration-header">
          <h2>{t('clientRegTitle')}</h2>
          <p>{t('clientRegSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label htmlFor="fullName">{t('fullNameLabel')}</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder={t('fullNamePlaceholder')}
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>

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
            <label htmlFor="phoneNumber">{t('phoneLabel')}</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              placeholder={t('phonePlaceholder')}
              value={formData.phoneNumber}
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
              t('clientBtnRegister')
            )}
          </button>
        </form>

        <div className="auth-switch">
          <p>{t('haveAccount')} <Link to="/client/login">{t('btnLogin')}</Link></p>
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

export default ClientRegister;
