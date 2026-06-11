import { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, X, Send, Settings, AlertTriangle, Sparkles } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './AIAgent.css';

const SUGGESTION_CHIPS = {
  en: {
    Client: ["Summarize my active orders", "Explain details of my last order", "How does verification work?"],
    Professional: ["What services should I provide?", "Summarize my applications", "How to get verified?"],
    Guest: ["What is QuickHire?", "How to register as client?", "How to find jobs?"]
  },
  hi: {
    Client: ["मेरे सक्रिय ऑर्डर का सारांश", "मेरे अंतिम ऑर्डर का विवरण", "सत्यापन कैसे काम करता है?"],
    Professional: ["मुझे कौन सी सेवाएं देनी चाहिए?", "मेरे आवेदनों का सारांश", "सत्यापन कैसे कराएं?"],
    Guest: ["QuickHire क्या है?", "ग्राहक कैसे बनें?", "काम कैसे ढूंढें?"]
  },
  kn: {
    Client: ["ನನ್ನ ಸಕ್ರಿಯ ಆರ್ಡರ್‌ಗಳ ಸಾರಾಂಶ", "ನನ್ನ ಕೊನೆಯ ಆರ್ಡರ್ ವಿವರಗಳು", "ಪರಿಶೀಲನೆ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?"],
    Professional: ["ನಾನು ಯಾವ ಸೇವೆಗಳನ್ನು ನೀಡಬೇಕು?", "ನನ್ನ ಅರ್ಜಿಗಳ ಸಾರಾಂಶ", "ಪರಿಶೀಲನೆ ಮಾಡಿಸುವುದು ಹೇಗೆ?"],
    Guest: ["QuickHire ಎಂದರೇನು?", "ಗ್ರಾಹಕರಾಗಿ ನೋಂದಾಯಿಸುವುದು ಹೇಗೆ?", "ಕೆಲಸ ಹುಡುಕುವುದು ಹೇಗೆ?"]
  },
  te: {
    Client: ["నా క్రియాశీల ఆర్డర్ల సారాంశం", "నా చివరి ఆర్డర్ వివరాలు", "వెరిఫికేషన్ ఎలా పనిచేస్తుంది?"],
    Professional: ["నేను ఏ సేవలను అందించాలి?", "నా దరఖాస్తుల సారాంశం", "వెరిఫైడ్ ఎలా అవ్వాలి?"],
    Guest: ["QuickHire అంటే ఏమిటి?", "క్లయింట్‌గా ఎలా నమోదు కావాలి?", "ఉద్యోగాలను ఎలా కనుగొనాలి?"]
  },
  ta: {
    Client: ["எனது ஆர்டர்களின் சுருக்கம்", "எனது கடைசி ஆர்டரின் விவரங்கள்", "சரிபார்ப்பு எவ்வாறு செயல்படுகிறது?"],
    Professional: ["நான் என்ன சேவைகளை வழங்க வேண்டும்?", "எனது விண்ணப்பங்களின் சுருக்கம்", "சரிபார்ப்பு செய்வது எப்படி?"],
    Guest: ["QuickHire என்றால் என்ன?", "வாடிக்கையாளராக பதிவு செய்வது எப்படி?", "வேலைகளை கண்டறிவது எப்படி?"]
  },
  ml: {
    Client: ["എന്റെ ഓർഡറുകളുടെ സംഗ്രഹം", "എന്റെ അവസാന ഓർഡറിന്റെ വിവരങ്ങൾ", "വെരിഫിക്കേഷൻ എങ്ങനെയാണ്?"],
    Professional: ["ഞാൻ എന്തൊക്കെ സേവനങ്ങൾ നൽകണം?", "അപേക്ഷകളുടെ സംഗ്രഹം", "എങ്ങനെ വെരിഫൈ ചെയ്യാം?"],
    Guest: ["എന്താണ് QuickHire?", "എങ്ങനെ ക്ലയന്റാകാം?", "എങ്ങനെ ജോലി കണ്ടെത്താം?"]
  }
};

const AIAgent = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('quickhire_gemini_key') || '');
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSimulated, setIsSimulated] = useState(true);

  // User details context states
  const [currentUser, setCurrentUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [activeJobs, setActiveJobs] = useState([]);
  const [appliedJobsCount, setAppliedJobsCount] = useState(0);

  const messagesEndRef = useRef(null);
  const currentLang = SUGGESTION_CHIPS[i18n.language] ? i18n.language : 'en';

  // Fetch Firestore details of current logged-in user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Fetch profile details
          const uDoc = await getDoc(doc(db, "users", user.uid));
          if (uDoc.exists()) {
            const data = uDoc.data();
            setUserDoc(data);

            if (data.role === 'Client') {
              // Fetch Client's Posted Jobs
              const q = query(collection(db, "jobs"), where("clientId", "==", user.uid));
              const querySnapshot = await getDocs(q);
              const jobs = [];
              querySnapshot.forEach((doc) => {
                jobs.push({ id: doc.id, ...doc.data() });
              });
              setActiveJobs(jobs);
            } else if (data.role === 'Professional') {
              // Fetch jobs where Professional has applied
              const q = query(collection(db, "jobs"), where("applicants", "array-contains", user.uid));
              const querySnapshot = await getDocs(q);
              setAppliedJobsCount(querySnapshot.size);
            }
          }
        } catch (e) {
          console.error("Error loading user context for AI:", e);
        }
      } else {
        setUserDoc(null);
        setActiveJobs([]);
        setAppliedJobsCount(0);
      }
    });
    return () => unsubscribe();
  }, []);

  // Check key configuration status from server or local storage on load
  useEffect(() => {
    const checkKeyStatus = async () => {
      const localKey = localStorage.getItem('quickhire_gemini_key') || '';
      if (localKey.trim() !== '') {
        setIsSimulated(false);
        return;
      }
      try {
        const res = await axios.get('/api/agent/status');
        if (res.data && res.data.hasKey) {
          setIsSimulated(false);
        } else {
          setIsSimulated(true);
        }
      } catch (e) {
        console.warn("Failed to fetch key status:", e);
        setIsSimulated(true);
      }
    };
    checkKeyStatus();
  }, [apiKey]);

  // Trigger personalized greeting when opening/loading
  const getGreeting = useCallback(() => {
    const name = userDoc?.fullName || '';
    const role = userDoc?.role || 'Guest';
    const activeCount = activeJobs.length;

    const greetings = {
      en: {
        Guest: "Hello! Welcome to QuickHire. I am your personal assistant. I can help you register as a Client to find professionals, or as a Professional to find jobs. How can I guide you today?",
        Client: `Hello ${name}! I am your personal QuickHire Assistant. I see you are logged in as a Client. You have ${activeCount} active job request(s). How can I help you manage your orders today?`,
        Professional: `Hello ${name}! I am your personal QuickHire Assistant. I see you are a Professional. Your profile verification status is '${userDoc?.verificationStatus || 'Pending'}'. How can I help you find jobs or manage your services today?`
      },
      hi: {
        Guest: "नमस्ते! QuickHire में आपका स्वागत है। मैं आपका व्यक्तिगत सहायक हूँ। मैं आपको काम के लिए पेशेवर खोजने के लिए एक ग्राहक (Client) के रूप में, या नौकरी खोजने के लिए एक पेशेवर (Professional) के रूप में पंजीकरण करने में मदद कर सकता हूँ। आज मैं आपका मार्गदर्शन कैसे करूँ?",
        Client: `नमस्ते ${name}! मैं आपका व्यक्तिगत QuickHire सहायक हूँ। मैं देख रहा हूँ कि आप ग्राहक के रूप में लॉग इन हैं। आपके पास ${activeCount} सक्रिय कार्य अनुरोध हैं। आज मैं आपके ऑर्डर प्रबंधित करने में आपकी क्या मदद कर सकता हूँ?`,
        Professional: `नमस्ते ${name}! मैं आपका व्यक्तिगत QuickHire सहायक हूँ। मैं देख रहा हूँ कि आप एक पेशेवर हैं। आपकी प्रोफ़ाइल सत्यापन स्थिति '${userDoc?.verificationStatus || 'Pending'}' है। आज मैं आपको नौकरी खोजने या अपनी सेवाओं को प्रबंधित करने में कैसे मदद कर सकता हूँ?`
      },
      kn: {
        Guest: "ನಮಸ್ಕಾರ! QuickHire ಗೆ ಸ್ವಾಗತ. ನಾನು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಸಹಾಯಕ. ವೃತ್ತಿಪರರನ್ನು ಹುಡುಕಲು ಗ್ರಾಹಕರಾಗಿ (Client) ಅಥವಾ ಕೆಲಸ ಹುಡುಕಲು ವೃತ್ತಿಪರರಾಗಿ (Professional) ನೋಂದಾಯಿಸಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಲಿ?",
        Client: `ನಮಸ್ಕಾರ ${name}! ನಾನು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ QuickHire ಸಹಾಯಕ. ನೀವು ಗ್ರಾಹಕರಾಗಿ ಲಾಗ್ ಇൻ ಆಗಿರುವುದನ್ನು ನಾನು ನೋಡುತ್ತಿದ್ದೇನೆ. ನಿಮ್ಮಲ್ಲಿ ${activeCount} ಸಕ್ರಿಯ ಕೆಲಸದ ವಿನಂತಿಗಳಿವೆ. ಇಂದು ನಿಮ್ಮ ಆರ್ಡರ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಲು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?`,
        Professional: `ನಮಸ್ಕಾರ ${name}! ನಾನು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ QuickHire ಸಹಾಯಕ. ನೀವು ವೃತ್ತಿಪರರಾಗಿದ್ದೀರಿ ಎಂದು ನಾನು ನೋಡುತ್ತಿದ್ದೇನೆ. ನಿಮ್ಮ ಪ್ರೊഫೈಲ್ ಪರಿಶೀಲನೆ ಸ್ಥಿತಿ '${userDoc?.verificationStatus || 'Pending'}' ಆಗಿದೆ. ಇಂದು ಕೆಲಸ ಹುಡುಕಲು ಅಥವಾ ನಿಮ್ಮ ಸೇವೆಗಳನ್ನು ನಿರ್ವಹಿಸಲು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?`
      },
      te: {
        Guest: "నమస్కారం! QuickHire కి స్వాగతం. నేను మీ వ్యక్తిగత సహాయకుడిని. నిపుణులను కనుగొనడానికి క్లయింట్‌గా లేదా ఉద్యోగాలను కనుగొనడానికి ప్రొఫెషనల్‌గా నమోదు చేసుకోవడానికి నేను మీకు సహాయం చేయగలను. ఈ రోజు నేను మీకు ఎలా మార్గదర్శకత్వం చేయగలను?",
        Client: `నమస్కారం ${name}! నేను మీ వ్యక్తిగత QuickHire సహాయకుడిని. మీరు క్లయింట్‌గా లాగిన్ అయినట్లు నేను చూస్తున్నాను. మీ వద్ద ${activeCount} క్రియాశీల ఉద్యోగ అభ్యర్థనలు ఉన్నాయి. ఈ రోజు మీ ఆర్డర్‌లను నిర్వహించడంలో నేను మీకు ఎలా సహాయపడగలను?`,
        Professional: `నమస్కారం ${name}! నేను మీ వ్యక్తిగత QuickHire సహాయకుడిని. మీరు ప్రొఫెషనల్ అని నేను చూస్తున్నాను. మీ ప్రొఫైల్ వెరిఫికేషన్ స్థితి '${userDoc?.verificationStatus || 'Pending'}'. ఈ రోజు ఉద్యోగాలను కనుగొనడంలో లేదా మీ సేవలను నిర్వహించడంలో నేను మీకు ఎలా సహాయపడగలను?`
      },
      ta: {
        Guest: "வணக்கம்! QuickHire-க்கு உங்களை வரவேற்கிறோம். நான் உங்கள் தனிப்பட்ட உதவியாளர். நிபுணர்களைக் கண்டறிய கிளையண்டாகவோ அல்லது வேலைகளைக் கண்டறிய நிபுணராகவோ பதிவு செய்ய நான் உங்களுக்கு உதவ முடியும். இன்று நான் உங்களுக்கு எவ்வாறு வழிகாட்ட வேண்டும்?",
        Client: `வணக்கம் ${name}! நான் உங்கள் தனிப்பட்ட QuickHire உதவியாளர். நீங்கள் கிளையண்டாக உள்நுழைந்துள்ளதை நான் காண்கிறேன். உங்களிடம் ${activeCount} செயலில் உள்ள வேலை கோரிக்கைகள் உள்ளன. இன்று உங்கள் ஆர்டர்களை நிர்வகிக்க நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?`,
        Professional: `வணக்கம் ${name}! நான் உங்கள் தனிப்பட்ட QuickHire உதவியாளர். நீங்கள் ஒரு நிபுணர் என்பதை நான் காண்கிறேன். உங்கள் சுயவிவர சரிபார்ப்பு நிலை '${userDoc?.verificationStatus || 'Pending'}'. இன்று வேலைகளைக் கண்டறிய அல்லது உங்கள் சேவைகளை நிர்வகிக்க நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?`
      },
      ml: {
        Guest: "നമസ്കാരം! QuickHire-ലേക്ക് സ്വാഗതം. ഞാൻ നിങ്ങളുടെ വ്യക്തിഗത സഹായിയാണ്. വിദഗ്ദ്ധരെ കണ്ടെത്താൻ ഒരു ക്ലയന്റായോ, അല്ലെങ്കിൽ ജോലി കണ്ടെത്താൻ ഒരു പ്രൊഫഷണലായോ രജിസ്റ്റർ ചെയ്യാൻ ഞാൻ നിങ്ങളെ സഹായിക്കാം. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?",
        Client: `നമസ്കാരം ${name}! ഞാൻ നിങ്ങളുടെ വ്യക്തിഗത QuickHire സഹായിയാണ്. നിങ്ങൾ ക്ലയന്റായി ലോഗിൻ ചെയ്തിരിക്കുന്നതായി ഞാൻ കാണുന്നു. നിങ്ങൾക്ക് ${activeCount} സജീവമായ ജോലികൾ ഉണ്ട്. ഇന്ന് നിങ്ങളുടെ ഓർഡറുകൾ കൈകാര്യം ചെയ്യാൻ ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?`,
        Professional: `നമസ്കാരം ${name}! ഞാൻ നിങ്ങളുടെ വ്യക്തിഗത QuickHire സഹായിയാണ്. നിങ്ങൾ ഒരു പ്രൊഫഷണലാണെന്ന് ഞാൻ കാണുന്നു. നിങ്ങളുടെ പ്രൊഫൈൽ വെരിഫിക്കേഷൻ സ്റ്റാറ്റസ് '${userDoc?.verificationStatus || 'Pending'}' ആണ്. ഇന്ന് ജോലി കണ്ടെത്താനോ നിങ്ങളുടെ സേവനങ്ങൾ നിയന്ത്രിക്കാനോ ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?`
      }
    };

    const strings = greetings[currentLang] || greetings.en;
    return strings[role] || strings.Guest;
  }, [userDoc, activeJobs, currentLang]);

  // Set initial greeting message when widget mounts or language / user details change
  useEffect(() => {
    const greeting = getGreeting();
    setMessages([
      {
        role: 'ai',
        content: greeting
      }
    ]);
  }, [getGreeting]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    localStorage.setItem('quickhire_gemini_key', apiKey);
    setShowSettings(false);
  };

  const handleClearApiKey = () => {
    setApiKey('');
    localStorage.removeItem('quickhire_gemini_key');
    setShowSettings(false);
  };

  const handleSendMessage = async (textToSend) => {
    const queryText = textToSend || inputVal;
    if (!queryText.trim()) return;

    // Add user message to state
    const userMsg = { role: 'user', content: queryText };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      // Build userContext body parameter to pass current page state and Firestore facts to the AI
      const userContext = currentUser ? {
        uid: currentUser.uid,
        name: userDoc?.fullName || currentUser.email,
        role: userDoc?.role || 'Guest',
        verificationStatus: userDoc?.verificationStatus || 'Pending',
        activeJobs: activeJobs,
        appliedJobsCount: appliedJobsCount
      } : {
        role: 'Guest'
      };

      const payload = {
        message: queryText,
        history: messages.slice(-10), // Send last 10 messages for context
        userContext,
        language: currentLang
      };

      const response = await axios.post('/api/agent/chat', payload, {
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': apiKey // will be empty string if not set, backend will check env or run simulation
        }
      });

      const data = response.data;
      setIsSimulated(!!data.isSimulated);

      setMessages(prev => [...prev, {
        role: 'ai',
        content: data.reply || "No response received."
      }]);

    } catch (error) {
      console.error("AI response error:", error);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: "Error: Could not connect to AI. Please try again later."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const chips = SUGGESTION_CHIPS[currentLang]?.[userDoc?.role || 'Guest'] || SUGGESTION_CHIPS.en.Guest;

  return (
    <div className="ai-agent-container">
      {/* ── Launcher Launcher Bubble ── */}
      {!isOpen && (
        <button 
          className="ai-agent-launcher" 
          onClick={() => setIsOpen(true)}
          title="QuickHire Personal Assistant"
        >
          <Bot size={28} />
          <div className="ai-launcher-pulse" />
        </button>
      )}

      {/* ── Chat Window ── */}
      {isOpen && (
        <div className="ai-chat-card">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <div className="ai-avatar-wrapper">
                <Bot size={22} />
                <div className="ai-online-dot" />
              </div>
              <div className="ai-chat-title">
                <h4>{userDoc?.role === 'Client' ? 'Client Assistant' : userDoc?.role === 'Professional' ? 'Professional Guide' : 'QuickHire Assistant'}</h4>
                <span>{isSimulated ? 'Local Assistant' : 'Live Personal AI'}</span>
              </div>
            </div>
            
            <div className="ai-chat-header-actions">
              <button 
                className={`ai-header-btn ${showSettings ? 'settings-active' : ''}`}
                onClick={() => setShowSettings(!showSettings)}
                title="Settings"
              >
                <Settings size={16} />
              </button>
              <button 
                className="ai-header-btn" 
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <form onSubmit={handleSaveApiKey} className="ai-settings-panel">
              <h5>Gemini API Key</h5>
              <p>Optional: Enter a Gemini API Key to enable live smart conversations. Your key is saved locally in your browser.</p>
              <div className="ai-api-input-wrapper">
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <button type="submit" className="submit-btn" style={{ margin: 0, padding: '0.4rem 0.8rem' }}>Save</button>
                {apiKey && (
                  <button type="button" onClick={handleClearApiKey} className="submit-btn outline" style={{ margin: 0, padding: '0.4rem 0.8rem', borderColor: '#ef4444', color: '#ef4444' }}>Clear</button>
                )}
              </div>
            </form>
          )}

          {/* Messages Area */}
          <div className="ai-messages-area">
            {messages.map((msg, idx) => (
              <div key={idx} className={`ai-message ${msg.role}`}>
                <div className="ai-msg-avatar">
                  {msg.role === 'ai' ? 'AI' : 'ME'}
                </div>
                <div className="ai-msg-bubble">
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* Warning when running in simulation */}
            {isSimulated && (
              <div className="ai-simulated-warning">
                <AlertTriangle size={12} />
                <span>Simulation Mode (No Gemini API Key)</span>
              </div>
            )}

            {loading && (
              <div className="ai-message ai">
                <div className="ai-msg-avatar">AI</div>
                <div className="ai-msg-bubble" style={{ padding: '0.5rem 1rem' }}>
                  <div className="ai-typing-indicator">
                    <div className="ai-typing-dot"></div>
                    <div className="ai-typing-dot"></div>
                    <div className="ai-typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          {chips.length > 0 && !loading && (
            <div className="ai-chips-wrapper">
              {chips.map((chip, idx) => (
                <button
                  key={idx}
                  className="ai-suggestion-chip"
                  onClick={() => handleSendMessage(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="ai-chat-input-area">
            <input
              type="text"
              className="ai-input-field"
              placeholder={
                currentLang === 'hi' ? 'सुझाव पूछें...' : 
                currentLang === 'kn' ? 'ಪ್ರಶ್ನೆ ಕೇಳಿ...' : 
                currentLang === 'te' ? 'ప్రశ్న అడగండి...' : 
                currentLang === 'ta' ? 'கேள்வி கேளுங்கள்...' : 
                currentLang === 'ml' ? 'ചോദ്യം ചോദിക്കുക...' : 
                'Ask something...'
              }
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={loading}
            />
            <button 
              className="ai-send-btn" 
              onClick={() => handleSendMessage()}
              disabled={loading || !inputVal.trim()}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAgent;
