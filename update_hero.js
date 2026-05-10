const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend', 'src', 'locales');

const updates = {
  en: {
    homeHeroTitle: "Quick Hire",
    homeHeroSubtitle: "Empowering professionals, top class Client service."
  },
  hi: {
    homeHeroTitle: "Quick Hire",
    homeHeroSubtitle: "पेशेवरों को सशक्त बनाना, शीर्ष श्रेणी की ग्राहक सेवा।"
  },
  kn: {
    homeHeroTitle: "Quick Hire",
    homeHeroSubtitle: "ವೃತ್ತಿಪರರನ್ನು ಸಬಲೀಕರಣಗೊಳಿಸುವುದು, ಉನ್ನತ ದರ್ಜೆಯ ಗ್ರಾಹಕ ಸೇವೆ."
  },
  te: {
    homeHeroTitle: "Quick Hire",
    homeHeroSubtitle: "నిపుణులను సాధికారపరచడం, అగ్రశ్రేణి క్లయింట్ సేవ."
  },
  ta: {
    homeHeroTitle: "Quick Hire",
    homeHeroSubtitle: "தொழில் வல்லுநர்களை மேம்படுத்துதல், உயர்தர வாடிக்கையாளர் சேவை."
  },
  ml: {
    homeHeroTitle: "Quick Hire",
    homeHeroSubtitle: "പ്രൊഫഷണലുകളെ ശാക്തീകരിക്കുന്നു, മികച്ച ക്ലയന്റ് സേവനം."
  }
};

Object.keys(updates).forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.homeHeroTitle = updates[lang].homeHeroTitle;
    data.homeHeroSubtitle = updates[lang].homeHeroSubtitle;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${lang}.json`);
  }
});
