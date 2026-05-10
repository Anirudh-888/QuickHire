import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="language-switcher">
      <select 
        value={i18n.language} 
        onChange={handleLanguageChange}
        className="language-select"
      >
        <option value="en">English</option>
        <option value="kn">ಕನ್ನಡ (Kannada)</option>
        <option value="hi">हिंदी (Hindi)</option>
        <option value="te">తెలుగు (Telugu)</option>
        <option value="ta">தமிழ் (Tamil)</option>
        <option value="ml">മലയാളം (Malayalam)</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
