import { useState } from 'react';
import axios from 'axios';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { auth, db, storage } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
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
      // 1. Create User
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Upload File to Storage
      const storageRef = ref(storage, `identityDocuments/${user.uid}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 3. Save User to Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        identityDocumentUrl: downloadURL,
        role: "Professional",
        isVerified: false,
        createdAt: new Date().toISOString()
      });

      setStatus('success');
      setMessage(t('successMsg'));
      
      // Reset form
      setFormData({ fullName: '', email: '', phoneNumber: '', password: '' });
      setFile(null);

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
