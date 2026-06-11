import { useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { auth, db, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      setStatus('success');
      setMessage(t('loginSuccessMsg') || 'Login successful!');
      setFormData({ email: '', password: '' });
      setTimeout(() => window.location.href = '/professional-dashboard', 1500);
    } catch (error) {
      setStatus('error');
      setMessage(error.message || t('errorMsg') || 'Error logging in.');
    }
  };

  const handleGoogleSignIn = async () => {
    setStatus('submitting');
    setMessage(t('btnProcessing', 'Processing...'));

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user profile already exists
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.role !== 'Professional') {
          throw new Error(`This Google account is registered as a ${userData.role}. Please log in on the correct page.`);
        }
        
        setStatus('success');
        setMessage(t('loginSuccessMsg', 'Login successful!'));
        setTimeout(() => window.location.href = '/professional-dashboard', 1500);
      } else {
        // If the professional account doesn't exist, we must log them out and require registration
        await auth.signOut();
        throw new Error('Google account not found. Please click Sign Up to register and upload your ID verification document first.');
      }

    } catch (error) {
      console.error("Google Auth Error:", error);
      setStatus('error');
      setMessage(error.message || t('errorMsg', 'Google Authentication failed.'));
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

      <div className="divider">
        <span>{t('orSeparator', 'OR')}</span>
      </div>

      <button 
        type="button" 
        className="google-btn" 
        onClick={handleGoogleSignIn}
        disabled={status === 'submitting'}
      >
        <svg className="google-icon" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.5 24c0-1.55-.15-3.24-.47-4.77H24v9.03h12.75c-.55 3-2.25 5.54-4.78 7.23l7.47 5.8C43.82 37.56 46.5 31.42 46.5 24z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.47-5.8c-2.11 1.42-4.81 2.31-8.42 2.31-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Continue with Google
      </button>

      <div className="auth-switch">
        <p>Don't have an account? <button type="button" onClick={onToggle} className="text-link">Sign Up</button></p>
      </div>

      {status === 'success' && <div className="status-message success"><CheckCircle size={20} /><p>{message}</p></div>}
      {status === 'error' && <div className="status-message error"><AlertCircle size={20} /><p>{message}</p></div>}
    </div>
  );
};

export default ProfessionalLogin;
