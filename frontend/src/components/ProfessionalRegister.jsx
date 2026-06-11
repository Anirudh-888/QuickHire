import { useState } from 'react';
import axios from 'axios';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { auth, db, storage, googleProvider } from '../firebase';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../index.css';

const ProfessionalRegister = ({ onToggle, hideContainer }) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [file, setFile] = useState(null);
  const [googleUser, setGoogleUser] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGooglePreFill = async () => {
    setStatus('idle');
    setMessage('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setGoogleUser(user);
      setFormData(prev => ({
        ...prev,
        fullName: user.displayName || '',
        email: user.email || ''
      }));
      setStatus('success');
      setMessage('Successfully authenticated with Google. Please complete your phone number and ID proof below.');
    } catch (error) {
      console.error("Google Auth Error:", error);
      setStatus('error');
      setMessage(error.message || 'Failed to authenticate with Google.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage(t('errorId'));
      setStatus('error');
      return;
    }

    setStatus('uploading');
    setMessage(t('statusUploading'));

    try {
      let user = null;

      if (googleUser) {
        user = googleUser;
      } else {
        // Create Email/Password User
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        user = userCredential.user;
      }

      // Upload ID Document
      const storageRef = ref(storage, `identityDocuments/${user.uid}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Save User data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        identityDocumentUrl: downloadURL,
        role: "Professional",
        isVerified: false,
        authProvider: googleUser ? 'google' : 'password',
        createdAt: new Date().toISOString()
      });

      setStatus('success');
      setMessage(t('successMsg'));
      
      // Reset form
      setFormData({ fullName: '', email: '', phoneNumber: '', password: '' });
      setFile(null);
      setGoogleUser(null);

    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage(error.message || t('errorMsg'));
    }
  };

  const content = (
    <div className="registration-card">
      <div className="registration-header">
          <h2>{t('title')}</h2>
          <p>{t('subtitle')}</p>
        </div>

        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <button 
            type="button" 
            className="google-btn" 
            onClick={handleGooglePreFill}
            disabled={status === 'uploading'}
          >
            <svg className="google-icon" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24c0-1.55-.15-3.24-.47-4.77H24v9.03h12.75c-.55 3-2.25 5.54-4.78 7.23l7.47 5.8C43.82 37.56 46.5 31.42 46.5 24z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.47-5.8c-2.11 1.42-4.81 2.31-8.42 2.31-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Pre-fill with Google
          </button>
        </div>

        <div className="divider">
          <span>{t('orSeparator', 'OR')}</span>
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
              disabled={googleUser !== null}
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

          {!googleUser && (
            <div className="form-group">
              <label htmlFor="password">{t('passwordLabel') || 'Password'}</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder={t('passwordPlaceholder') || 'Enter your password'}
                value={formData.password}
                onChange={handleInputChange}
                required
                className="password-input"
              />
            </div>
          )}

          <div className="form-group file-upload-group">
            <label>{t('idLabel')}</label>
            <div className="file-upload-box">
              <input
                type="file"
                id="identityDocument"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="file-input"
              />
              <div className="file-upload-content">
                <Upload className="upload-icon" size={32} />
                <span className="file-name">
                  {file ? file.name : t('idPlaceholder')}
                </span>
                <span className="file-hint">{t('idHint')}</span>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={status === 'uploading'}
          >
            {status === 'uploading' ? (
              <span className="btn-content">
                <Loader2 className="spinner" size={20} /> {t('btnProcessing')}
              </span>
            ) : (
              t('btnRegister')
            )}
          </button>
        </form>

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

export default ProfessionalRegister;
