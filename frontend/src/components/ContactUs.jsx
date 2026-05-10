import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import '../index.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="contact-page animate-fade-in-up">
      <div className="contact-header">
        <h1>Contact & Feedback</h1>
        <p>We'd love to hear from you. Reach out to us with any questions or feedback!</p>
      </div>

      <div className="contact-content">
        <div className="contact-info registration-card">
          <h2>Our Office</h2>
          <div className="info-item">
            <MapPin className="info-icon" />
            <p>123 QuickHire Tower, Tech Park<br/>Bangalore, 560001</p>
          </div>
          <div className="info-item">
            <Phone className="info-icon" />
            <p>+91 98765 43210</p>
          </div>
          <div className="info-item">
            <Mail className="info-icon" />
            <p>support@quickhire.dummy.com</p>
          </div>
        </div>

        <div className="contact-form-card registration-card">
          <h2>Send Feedback</h2>
          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-group">
              <label>Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea 
                rows="4"
                value={formData.message} 
                onChange={(e) => setFormData({...formData, message: e.target.value})} 
                required
                className="feedback-textarea"
              />
            </div>
            <button type="submit" className="submit-btn">
              <span className="btn-content"><Send size={18} /> Submit Feedback</span>
            </button>
          </form>
          {submitted && (
            <div className="status-message success mt-4">
              <CheckCircle size={20} /><p>Thank you for your feedback!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
