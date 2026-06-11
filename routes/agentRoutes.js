const express = require('express');
const router = express.Router();

// Supported languages translation helper for local fallback responses
const LOCAL_RESPONSES = {
  en: {
    welcomeGuest: "Hello! Welcome to QuickHire. I am your personal assistant. I can help you register as a Client to find professionals, or as a Professional to find jobs. How can I guide you today?",
    welcomeClient: "Hello, {name}! I am your personal QuickHire Assistant. I see you are logged in as a Client. You have {jobCount} active job request(s). How can I help you manage your orders today?",
    welcomeProf: "Hello, {name}! I am your personal QuickHire Assistant. I see you are a Professional. Your profile verification status is '{status}'. How can I help you find jobs or manage your services today?",
    noActiveJobs: "You don't have any active service requests right now. Would you like me to guide you on how to post a job?",
    jobSummaryHeader: "Here is a summary of your active service request(s):\n\n",
    jobSummaryItem: "• **Category**: {category}\n  **Date**: {date} at {time}\n  **Location**: {street}, {city} ({pincode})\n  **Status**: {status}\n  **Description**: {description}\n\n",
    profVerificationStatus: "Your professional profile status is currently **{status}**.\n\n" +
      "• If it's **Pending**, our team is currently reviewing your uploaded ID proof. This typically takes 24 hours.\n" +
      "• If it's **Verified**, you are fully approved to apply and work!\n" +
      "• If you haven't uploaded an ID proof, please visit the portal to complete your registration.",
    profRecommendedServices: "As a professional on QuickHire, you can provide services such as:\n" +
      "• **Home & Repair**: Plumber, Electrician, Carpenter, Cleaner, Mechanic, Painter, Appliance Repair, HVAC Technician.\n" +
      "• **Tech & Creative**: Software Developer, Web Designer, Graphic Designer, Video Editor, IT Support.\n" +
      "• **Events & Personal**: Photographer, Event Planner, Chef/Caterer, Driver, Babysitter, Personal Trainer, Tutor.\n\n" +
      "Make sure to specify your categories clearly when applying for jobs so clients can verify your expertise!",
    generalHelp: "I can assist you with:\n" +
      "1. Summarizing your active orders/service requests.\n" +
      "2. Giving details about your opted services.\n" +
      "3. Explaining what services you should provide as a professional.\n" +
      "4. Explaining how to register, log in, or get verified.\n\n" +
      "What would you like to know?",
    fallback: "I understand you have a question about QuickHire. To get live, smart AI answers tailored exactly to your query, please configure a Gemini API key in the settings menu (click the gear icon in this chat window)."
  },
  hi: {
    welcomeGuest: "नमस्ते! QuickHire में आपका स्वागत है। मैं आपका व्यक्तिगत सहायक हूँ। मैं आपको काम के लिए पेशेवर खोजने के लिए एक ग्राहक (Client) के रूप में, या नौकरी खोजने के लिए एक पेशेवर (Professional) के रूप में पंजीकरण करने में मदद कर सकता हूँ। आज मैं आपका मार्गदर्शन कैसे करूँ?",
    welcomeClient: "नमस्ते, {name}! मैं आपका व्यक्तिगत QuickHire सहायक हूँ। मैं देख रहा हूँ कि आप ग्राहक के रूप में लॉग इन हैं। आपके पास {jobCount} सक्रिय कार्य अनुरोध हैं। आज मैं आपके ऑर्डर प्रबंधित करने में आपकी क्या मदद कर सकता हूँ?",
    welcomeProf: "नमस्ते, {name}! मैं आपका व्यक्तिगत QuickHire सहायक हूँ। मैं देख रहा हूँ कि आप एक पेशेवर हैं। आपकी प्रोफ़ाइल सत्यापन स्थिति '{status}' है। आज मैं आपको नौकरी खोजने या अपनी सेवाओं को प्रबंधित करने में कैसे मदद कर सकता हूँ?",
    noActiveJobs: "अभी आपके पास कोई सक्रिय कार्य अनुरोध नहीं है। क्या आप चाहते हैं कि मैं नौकरी पोस्ट करने के तरीके के बारे में आपका मार्गदर्शन करूँ?",
    jobSummaryHeader: "यहाँ आपके सक्रिय कार्य अनुरोधों का सारांश है:\n\n",
    jobSummaryItem: "• **श्रेणी**: {category}\n  **दिनांक**: {date} को {time} बजे\n  **स्थान**: {street}, {city} ({pincode})\n  **स्थिति**: {status}\n  **विवरण**: {description}\n\n",
    profVerificationStatus: "आपकी पेशेवर प्रोफ़ाइल स्थिति वर्तमान में **{status}** है।\n\n" +
      "• यदि यह **लंबित (Pending)** है, तो हमारी टीम आपके अपलोड किए गए पहचान पत्र की समीक्षा कर रही है। इसमें आमतौर पर 24 घंटे लगते हैं।\n" +
      "• यदि यह **सत्यापित (Verified)** है, तो आप काम शुरू करने के लिए स्वीकृत हैं!\n" +
      "• यदि आपने पहचान पत्र अपलोड नहीं किया है, तो कृपया पंजीकरण पूरा करने के लिए पोर्टल पर जाएं।",
    profRecommendedServices: "QuickHire पर एक पेशेवर के रूप में, आप निम्नलिखित सेवाएं प्रदान कर सकते हैं:\n" +
      "• **घर और मरम्मत**: प्लंबर, इलेक्ट्रीशियन, बढ़ई (Carpenter), क्लीनर, मैकेनिक, पेंटर, उपकरण मरम्मत।\n" +
      "• **टेक और क्रिएटिव**: सॉफ्टवेयर डेवलपर, वेब डिजाइनर, ग्राफिक डिजाइनर, वीडियो एडिटर।\n" +
      "• **इवेंट और व्यक्तिगत**: फोटोग्राफर, इवेंट प्लानर, रसोइया (Chef), ड्राइवर, ट्यूटर।\n\n" +
      "नौकरियों के लिए आवेदन करते समय अपनी श्रेणियों को स्पष्ट रूप से निर्दिष्ट करना सुनिश्चित करें!",
    generalHelp: "मैं आपकी इसमें सहायता कर सकता हूँ:\n" +
      "1. आपके सक्रिय ऑर्डर/सेवा अनुरोधों का सारांश देना।\n" +
      "2. आपके द्वारा चुनी गई सेवाओं का विवरण देना।\n" +
      "3. यह समझाना कि एक पेशेवर के रूप में आपको कौन सी सेवाएं प्रदान करनी चाहिए।\n" +
      "4. पंजीकरण, लॉगिन या सत्यापित होने की प्रक्रिया समझाना।\n\n" +
      "आप क्या जानना चाहेंगे?",
    fallback: "मैं समझता हूँ कि QuickHire के बारे में आपका कोई प्रश्न है। अपनी क्वेरी के अनुसार लाइव, स्मार्ट AI उत्तर पाने के लिए, कृपया सेटिंग्स मेनू (इस चैट विंडो में गियर आइकन पर क्लिक करें) में एक Gemini API कुंजी कॉन्फ़िगर करें।"
  },
  kn: {
    welcomeGuest: "ನಮಸ್ಕಾರ! QuickHire ಗೆ ಸ್ವಾಗತ. ನಾನು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಸಹಾಯಕ. ವೃತ್ತಿಪರರನ್ನು ಹುಡುಕಲು ಗ್ರಾಹಕರಾಗಿ (Client) ಅಥವಾ ಕೆಲಸ ಹುಡುಕಲು ವೃತ್ತಿಪರರಾಗಿ (Professional) ನೋಂದಾಯಿಸಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಲಿ?",
    welcomeClient: "ನಮಸ್ಕಾರ, {name}! ನಾನು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ QuickHire ಸಹಾಯಕ. ನೀವು ಗ್ರಾಹಕರಾಗಿ ಲಾಗ್ ಇನ್ ಆಗಿರುವುದನ್ನು ನಾನು ನೋಡುತ್ತಿದ್ದೇನೆ. ನಿಮ್ಮಲ್ಲಿ {jobCount} ಸಕ್ರಿಯ ಕೆಲಸದ ವಿನಂತಿಗಳಿವೆ. ಇಂದು ನಿಮ್ಮ ಆರ್ಡರ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಲು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    welcomeProf: "ನಮಸ್ಕಾರ, {name}! ನಾನು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ QuickHire ಸಹಾಯಕ. ನೀವು ವೃತ್ತಿಪರರಾಗಿದ್ದೀರಿ ಎಂದು ನಾನು ನೋಡುತ್ತಿದ್ದೇನೆ. ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಪರಿಶೀಲನೆ ಸ್ಥಿತಿ '{status}' ಆಗಿದೆ. ಇಂದು ಕೆಲಸ ಹುಡುಕಲು ಅಥವಾ ನಿಮ್ಮ ಸೇವೆಗಳನ್ನು ನಿರ್ವಹಿಸಲು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    noActiveJobs: "ನಿಮ್ಮ ಬಳಿ ಪ್ರಸ್ತುತ ಯಾವುದೇ ಸಕ್ರಿಯ ಕೆಲಸದ ವಿನಂತಿಗಳಿಲ್ಲ. ಕೆಲಸವನ್ನು ಪೋಸ್ಟ್ ಮಾಡುವುದು ಹೇಗೆ ಎಂದು ಮಾರ್ಗದರ್ಶನ ನೀಡಬೇಕೆ?",
    jobSummaryHeader: "ನಿಮ್ಮ ಸಕ್ರಿಯ ಕೆಲಸದ ವಿನಂತಿಗಳ ಸಾರಾಂಶ ಇಲ್ಲಿದೆ:\n\n",
    jobSummaryItem: "• **ವರ್ಗ**: {category}\n  **ದಿನಾಂಕ**: {date} ರಂದು {time} ಕ್ಕೆ\n  **ಸ್ಥಳ**: {street}, {city} ({pincode})\n  **ಸ್ಥಿತಿ**: {status}\n  **ವಿವರಣೆ**: {description}\n\n",
    profVerificationStatus: "ನಿಮ್ಮ ವೃತ್ತಿಪರ ಪ್ರೊಫೈಲ್ ಸ್ಥಿತಿ ಪ್ರಸ್ತುತ **{status}** ಆಗಿದೆ.\n\n" +
      "• ಇದು **ಬಾಕಿ ಇದ್ದರೆ (Pending)**, ನಮ್ಮ ತಂಡವು ನಿಮ್ಮ ಐಡಿ ಪುರಾವೆಯನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದೆ. ಇದಕ್ಕೆ ಸಾಮಾನ್ಯವಾಗಿ 24 ಗಂಟೆಗಳು ಬೇಕಾಗುತ್ತವೆ.\n" +
      "• ಇದು **ಪರಿಶೀಲಿಸಲ್ಪಟ್ಟಿದ್ದರೆ (Verified)**, ನೀವು ಕೆಲಸ ಮಾಡಲು ಸಂಪೂರ್ಣವಾಗಿ ಅನುಮೋದನೆ ಪಡೆದಿದ್ದೀರಿ!\n" +
      "• ಐಡಿ ಪುರಾವೆ ಅಪ್‌ಲೋಡ್ ಮಾಡದಿದ್ದರೆ, ದಯವಿಟ್ಟು ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಲು ಪೋರ್ಟಲ್‌ಗೆ ಭೇಟಿ ನೀಡಿ.",
    profRecommendedServices: "QuickHire ನಲ್ಲಿ ವೃತ್ತಿಪರರಾಗಿ, ನೀವು ಈ ಕೆಳಗಿನ ಸೇವೆಗಳನ್ನು ನೀಡಬಹುದು:\n" +
      "• **ಮನೆ ಮತ್ತು ದುರಸ್ತಿ**: ಪ್ಲಂಬರ್, ಎಲೆಕ್ಟ್ರಿಷಿಯನ್, ಕಾರ್ಪೆಂಟರ್, ಕ್ಲೀನರ್, ಮೆಕ್ಯಾನಿಕ್, ಪೇಂಟರ್.\n" +
      "• **ಟೆಕ್ ಮತ್ತು ಕ್ರಿಯೇಟಿವ್**: ಸಾಫ್ಟ್‌ವೇರ್ ಡೆವಲಪರ್, ವೆಬ್ ಡಿಸೈನರ್, ಗ್ರಾಫಿಕ್ ಡಿಸೈನರ್, ವಿಡಿಯೋ ಎಡಿಟರ್.\n" +
      "• **ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ವೈಯಕ್ತಿಕ**: ಛಾಯಾಗ್ರಾಹಕ (Photographer), ಇವೆಂಟ್ ಪ್ಲಾನರ್, ಅಡುಗೆಯವರು, ಚಾಲಕರು, ಶಿಕ್ಷಕರು.\n\n" +
      "ಕೆಲಸಕ್ಕೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವಾಗ ನಿಮ್ಮ ವರ್ಗಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ನಮೂದಿಸಿ!",
    generalHelp: "ನಾನು ನಿಮಗೆ ಈ ವಿಷಯಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n" +
      "1. ನಿಮ್ಮ ಸಕ್ರಿಯ ಆರ್ಡರ್‌ಗಳು/ಕೆಲಸದ ವಿನಂತಿಗಳ ಸಾರಾಂಶ ನೀಡಲು.\n" +
      "2. ನೀವು ಆಯ್ಕೆ ಮಾಡಿದ ಸೇವೆಗಳ ವಿವರಗಳನ್ನು ನೀಡಲು.\n" +
      "3. ವೃತ್ತಿಪರರಾಗಿ ನೀವು ಯಾವ ಸೇವೆಗಳನ್ನು ಒದಗಿಸಬೇಕೆಂದು ತಿಳಿಸಲು.\n" +
      "4. ನೋಂದಣಿ, ಲಾಗಿನ್ ಅಥವಾ ಪರಿಶೀಲನೆ ಪ್ರಕ್ರಿಯೆಯನ್ನು ವಿವರಿಸಲು.\n\n" +
      "ನೀವು ಏನನ್ನು ತಿಳಿಯಲು ಬಯಸುತ್ತೀರಿ?",
    fallback: "QuickHire ಬಗ್ಗೆ ನಿಮ್ಮಲ್ಲಿ ಪ್ರಶ್ನೆ ಇದೆ ಎಂದು ನನಗೆ ಅರ್ಥವಾಗಿದೆ. ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಲೈವ್, ಸ್ಮಾರ್ಟ್ AI ಉತ್ತರಗಳನ್ನು ಪಡೆಯಲು, ದಯವಿಟ್ಟು ಸೆಟ್ಟಿಂಗ್‌ಗಳ ಮೆನುವಿನಲ್ಲಿ (ಈ ಚಾಟ್ ವಿಂಡೋದಲ್ಲಿ ಗೇರ್ ಐಕಾನ್ ಕ್ಲಿಕ್ ಮಾಡಿ) Gemini API ಕೀಲಿಯನ್ನು ಕಾನ್ಫಿಗರ್ ಮಾಡಿ."
  },
  te: {
    welcomeGuest: "నమస్కారం! QuickHire కి స్వాగతం. నేను మీ వ్యక్తిగత సహాయకుడిని. నిపుణులను కనుగొనడానికి క్లయింట్‌గా లేదా ఉద్యోగాలను కనుగొనడానికి ప్రొఫెషనల్‌గా నమోదు చేసుకోవడానికి నేను మీకు సహాయం చేయగలను. ఈ రోజు నేను మీకు ఎలా మార్గదర్శకత్వం చేయగలను?",
    welcomeClient: "నమస్కారం, {name}! నేను మీ వ్యక్తిగత QuickHire సహాయకుడిని. మీరు క్లయింట్‌గా లాగిన్ అయినట్లు నేను చూస్తున్నాను. మీ వద్ద {jobCount} క్రియాశీల ఉద్యోగ అభ్యర్థనలు ఉన్నాయి. ఈ రోజు మీ ఆర్డర్‌లను నిర్వహించడంలో నేను మీకు ఎలా సహాయపడగలను?",
    welcomeProf: "నమస్కారం, {name}! నేను మీ వ్యక్తిగత QuickHire సహాయకుడిని. మీరు ప్రొఫెషనల్ అని నేను చూస్తున్నాను. మీ ప్రొఫైల్ వెరిఫికేషన్ స్థితి '{status}'. ఈ రోజు ఉద్యోగాలను కనుగొనడంలో లేదా మీ సేవలను నిర్వహించడంలో నేను మీకు ఎలా సహాయపడగలను?",
    noActiveJobs: "ప్రస్తుతం మీ వద్ద ఎలాంటి యాక్టివ్ సర్వీస్ అభ్యర్థనలు లేవు. ఉద్యోగాన్ని ఎలా పోస్ట్ చేయాలో నేను మీకు మార్గదర్శకత్వం చేయాలా?",
    jobSummaryHeader: "మీ క్రియాశీల సేవా అభ్యర్థనల సారాంశం ఇక్కడ ఉంది:\n\n",
    jobSummaryItem: "• **వర్గం**: {category}\n  **తేదీ**: {date} న {time} గంటలకు\n  **చిరునామా**: {street}, {city} ({pincode})\n  **స్థితి**: {status}\n  **వివరణ**: {description}\n\n",
    profVerificationStatus: "మీ ప్రొఫెషనల్ ప్రొఫైల్ స్థితి ప్రస్తుతం **{status}** గా ఉంది.\n\n" +
      "• ఇది **పెండింగ్** లో ఉంటే, మా బృందం మీ ఐడి ప్రూఫ్‌ను సమీక్షిస్తోంది. దీనికి సాధారణంగా 24 గంటలు పడుతుంది.\n" +
      "• ఇది **వెరిఫైడ్** అయితే, మీరు ఉద్యోగాలకు దరఖాస్తు చేసుకోవడానికి అనుమతించబడ్డారు!\n" +
      "• మీరు ఐడి ప్రూఫ్ అప్‌లోడ్ చేయకపోతే, దయచేసి పోర్టల్ సందర్శించి నమోదు పూర్తి చేయండి.",
    profRecommendedServices: "QuickHire లో ప్రొఫెషనల్‌గా, మీరు ఈ క్రింది సేవలను అందించవచ్చు:\n" +
      "• **ఇల్లు & మరమ్మతులు**: ప్లంబర్, ఎలక్ట్రీషియన్, కార్పెంటర్, క్లీనర్, మెకానిక్, పెయింటర్.\n" +
      "• **టెక్ & క్రియేటివ్**: సాఫ్ట్‌వేర్ డెవలపర్, వెబ్ డిజైనర్, గ్రాఫిక్ డిజైనర్, వీడియో ఎడిటర్.\n" +
      "• **ఈవెంట్స్ & పర్సనల్**: ఫోటోగ్రాఫర్, ఈవెంట్ ప్లానర్, వంట మనుషులు, డ్రైవర్, ట్యూటర్.\n\n" +
      "ఉద్యోగాలకు దరఖాస్తు చేసేటప్పుడు మీ నైపుణ్యాల విభాగాలను స్పష్టంగా పేర్కొనండి!",
    generalHelp: "నేను మీకు వీటిలో సహాయం చేయగలను:\n" +
      "1. మీ క్రియాశీల ఆర్డర్లు/అభ్యర్థనల సారాంశం.\n" +
      "2. మీరు ఎంచుకున్న సేవల వివరాలు.\n" +
      "3. ప్రొఫెషనల్‌గా మీరు ఏ సేవలను అందించాలో వివరించడం.\n" +
      "4. రిజిస్ట్రేషన్, లాగిన్ లేదా వెరిఫికేషన్ విధానాన్ని వివరించడం.\n\n" +
      "మీరు ఏమి తెలుసుకోవాలనుకుంటున్నారు?",
    fallback: "QuickHire గురించి మీ వద్ద ప్రశ్న ఉందని నేను గ్రహించాను. మీ ప్రశ్నలకు ప్రత్యక్ష, స్మార్ట్ AI సమాధానాలు పొందడానికి, దయచేసి సెట్టింగ్ల మెనూలో (ఈ చాట్ విండ్‌లోని గేర్ చిహ్నాన్ని క్లిక్ చేయండి) ఒక Gemini API కీని కాన్ఫిగర్ చేయండి."
  },
  ta: {
    welcomeGuest: "வணக்கம்! QuickHire-க்கு உங்களை வரவேற்கிறோம். நான் உங்கள் தனிப்பட்ட உதவியாளர். நிபுணர்களைக் கண்டறிய கிளையண்டாகவோ அல்லது வேலைகளைக் கண்டறிய நிபுணராகவோ பதிவு செய்ய நான் உங்களுக்கு உதவ முடியும். இன்று நான் உங்களுக்கு எவ்வாறு வழிகாட்ட வேண்டும்?",
    welcomeClient: "வணக்கம், {name}! நான் உங்கள் தனிப்பட்ட QuickHire உதவியாளர். நீங்கள் கிளையண்டாக உள்நுழைந்துள்ளதை நான் காண்கிறேன். உங்களிடம் {jobCount} செயலில் உள்ள வேலை கோரிக்கைகள் உள்ளன. இன்று உங்கள் ஆர்டர்களை நிர்வகிக்க நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
    welcomeProf: "வணக்கம், {name}! நான் உங்கள் தனிப்பட்ட QuickHire உதவியாளர். நீங்கள் ஒரு நிபுணர் என்பதை நான் காண்கிறேன். உங்கள் சுயவிவர சரிபார்ப்பு நிலை '{status}'. இன்று வேலைகளைக் கண்டறிய அல்லது உங்கள் சேவைகளை நிர்வகிக்க நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
    noActiveJobs: "உங்களிடம் தற்போது செயலில் உள்ள வேலை கோரிக்கைகள் எதுவும் இல்லை. ஒரு வேலையை எவ்வாறு இடுகையிடுவது என்று நான் உங்களுக்கு வழிகாட்ட வேண்டுமா?",
    jobSummaryHeader: "உங்களது செயலில் உள்ள வேலை கோரிக்கைகளின் சுருக்கம் இதோ:\n\n",
    jobSummaryItem: "• **வகை**: {category}\n  **தேதி**: {date} அன்று {time} மணிக்கு\n  **முகவரி**: {street}, {city} ({pincode})\n  **நிலை**: {status}\n  **விளக்கம்**: {description}\n\n",
    profVerificationStatus: "உங்கள் நிபுணர் சுயவிவர நிலை தற்போது **{status}** ஆகும்.\n\n" +
      "• இது **Pending** ஆக இருந்தால், எங்களது குழு உங்கள் ஐடி ஆதாரத்தை மதிப்பாய்வு செய்கிறது. இதற்கு பொதுவாக 24 மணிநேரம் ஆகும்.\n" +
      "• இது **Verified** ஆக இருந்தால், நீங்கள் வேலை செய்ய முழுமையாக அங்கீகரிக்கப்பட்டுள்ளீர்கள்!\n" +
      "• நீங்கள் ஐடி ஆதாரத்தை பதிவேற்றவில்லை எனில், தயவுசெய்து போர்ட்டலுக்குச் சென்று பதிவை முடிக்கவும்.",
    profRecommendedServices: "QuickHire-இல் ஒரு நிபுணராக, நீங்கள் பின்வரும் சேவைகளை வழங்கலாம்:\n" +
      "• **வீடு & பழுதுபார்ப்பு**: பிளம்பர், எலக்ட்ரீஷியன், தச்சர் (Carpenter), கிளீனர், மெக்கானிக், பெயிண்டர்.\n" +
      "• **டெக் & கிரியேட்டிவ்**: மென்பொருள் உருவாக்குநர், வலை வடிவமைப்பாளர், கிராபிக்ஸ் வடிவமைப்பாளர்.\n" +
      "• **நிகழ்வுகள் & தனிப்பட்ட**: புகைப்படக் கலைஞர், நிகழ்வுத் திட்டமிடுபவர், சமையல்காரர், ஓட்டுநர், ஆசிரியர்.\n\n" +
      "வேலைகளுக்கு விண்ணப்பிக்கும் போது உங்கள் சேவை வகைகளைத் தெளிவாகக் குறிப்பிடவும்!",
    generalHelp: "நான் உங்களுக்கு இதில் உதவ முடியும்:\n" +
      "1. உங்கள் செயலில் உள்ள ஆர்டர்களின் சுருக்கம்.\n" +
      "2. நீங்கள் தேர்வு செய்த சேவைகளின் விவரங்கள்.\n" +
      "3. ஒரு நிபுணராக நீங்கள் என்ன சேவைகளை வழங்க வேண்டும் என்பதை விளக்குவது.\n" +
      "4. பதிவு செய்தல், உள்நுழைதல் அல்லது சரிபார்ப்பு செயல்முறையை விளக்குவது.\n\n" +
      "நீங்கள் என்ன தெரிந்து கொள்ள விரும்புகிறீர்கள்?",
    fallback: "QuickHire பற்றி உங்களிடம் கேள்வி உள்ளது என்பதை நான் புரிந்து கொள்கிறேன். உங்கள் கேள்விக்கு நேரடி, ஸ்மார்ட் AI பதில்களைப் பெற, தயவுசெய்து அமைப்புகள் மெனுவில் (இந்த அரட்டை சாளரத்தில் உள்ள கியர் ஐகானைக் கிளிக் செய்க) ஒரு Gemini API விசையை உள்ளமைக்கவும்."
  },
  ml: {
    welcomeGuest: "നമസ്കാരം! QuickHire-ലേക്ക് സ്വാഗതം. ഞാൻ നിങ്ങളുടെ വ്യക്തിഗത സഹായിയാണ്. വിദഗ്ദ്ധരെ കണ്ടെത്താൻ ഒരു ക്ലയന്റായോ, അല്ലെങ്കിൽ ജോലി കണ്ടെത്താൻ ഒരു പ്രൊഫഷണലായോ രജിസ്റ്റർ ചെയ്യാൻ ഞാൻ നിങ്ങളെ സഹായിക്കാം. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?",
    welcomeClient: "നമസ്കാരം, {name}! ഞാൻ നിങ്ങളുടെ വ്യക്തിഗത QuickHire സഹായിയാണ്. നിങ്ങൾ ക്ലയന്റായി ലോഗിൻ ചെയ്തിരിക്കുന്നതായി ഞാൻ കാണുന്നു. നിങ്ങൾക്ക് {jobCount} സജീവമായ ജോലികൾ ഉണ്ട്. ഇന്ന് നിങ്ങളുടെ ഓർഡറുകൾ കൈകാര്യം ചെയ്യാൻ ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?",
    welcomeProf: "നമസ്കാരം, {name}! ഞാൻ നിങ്ങളുടെ വ്യക്തിഗത QuickHire സഹായിയാണ്. നിങ്ങൾ ഒരു പ്രൊഫഷണലാണെന്ന് ഞാൻ കാണുന്നു. നിങ്ങളുടെ പ്രൊഫൈൽ വെരിഫിക്കേഷൻ സ്റ്റാറ്റസ് '{status}' ആണ്. ഇന്ന് ജോലി കണ്ടെത്താനോ നിങ്ങളുടെ സേവനങ്ങൾ നിയന്ത്രിക്കാനോ ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?",
    noActiveJobs: "നിങ്ങൾക്ക് ഇപ്പോൾ സജീവമായ ജോലി ആവശ്യങ്ങൾ ഒന്നുമില്ല. ഒരു ജോലി എങ്ങനെ പോസ്റ്റ് ചെയ്യണം എന്ന് ഞാൻ പറഞ്ഞുതരട്ടെയോ?",
    jobSummaryHeader: "നിങ്ങളുടെ സജീവമായ ജോലി ആവശ്യങ്ങളുടെ ചുരുക്കം ഇതാ:\n\n",
    jobSummaryItem: "• **വിഭാഗം**: {category}\n  **തീയതി**: {date}-ൽ {time}-ന്\n  **സ്ഥലം**: {street}, {city} ({pincode})\n  **അവസ്ഥ**: {status}\n  **വിവരണം**: {description}\n\n",
    profVerificationStatus: "നിങ്ങളുടെ പ്രൊഫഷണൽ പ്രൊഫൈൽ സ്റ്റാറ്റസ് ഇപ്പോൾ **{status}** ആണ്.\n\n" +
      "• ഇത് **Pending** ആണെങ്കിൽ, ഞങ്ങളുടെ ടീം നിങ്ങളുടെ ഐഡി പരിശോധിക്കുകയാണ്. ഇതിന് സാധാരണയായി 24 മണിക്കൂർ എടുക്കും.\n" +
      "• ഇത് **Verified** ആണെങ്കിൽ, നിങ്ങൾക്ക് ജോലി ചെയ്യാൻ അനുമതിയുണ്ട്!\n" +
      "• നിങ്ങൾ ഐഡി അപ്‌ലോഡ് ചെയ്തിട്ടില്ലെങ്കിൽ, ദയവായി പോർട്ടൽ സന്ദർശിച്ച് രജിസ്ട്രേഷൻ പൂർത്തിയാക്കുക.",
    profRecommendedServices: "QuickHire-ൽ ഒരു പ്രൊഫഷണലായി, നിങ്ങൾക്ക് ഈ സേവനങ്ങൾ നൽകാം:\n" +
      "• **വീടും അറ്റകുറ്റപ്പണികളും**: പ്ലംബർ, ഇലക്ട്രീഷ്യൻ, കാർപെന്റർ, ക്ലീനർ, മെക്കാനിക്, പെയിന്റർ.\n" +
      "• **ടെക് & ക്രിയേറ്റീവ്**: സോഫ്റ്റ്‌വെയർ ഡെവലപ്പർ, വെബ് ഡിസൈനർ, ഗ്രാഫിക് ഡിസൈനർ.\n" +
      "• **ഇവന്റുകൾ & വ്യക്തിഗതം**: ഫോട്ടോഗ്രാഫർ, ഇവന്റ് പ്ലാനർ, പാചകക്കാരൻ, ഡ്രൈവർ, ട്യൂട്ടർ.\n\n" +
      "ജോലികൾക്ക് അപേക്ഷിക്കുമ്പോൾ നിങ്ങളുടെ സേവന വിഭാഗങ്ങൾ കൃത്യമായി രേഖപ്പെടുത്തുക!",
    generalHelp: "ഞാൻ നിങ്ങളെ താഴെ പറയുന്ന കാര്യങ്ങളിൽ സഹായിക്കാം:\n" +
      "1. നിങ്ങളുടെ സജീവമായ ഓർഡറുകളുടെ ഒരു ചുരുക്കം നൽകുക.\n" +
      "2. നിങ്ങൾ തിരഞ്ഞെടുത്ത സേവനങ്ങളുടെ വിവരങ്ങൾ നൽകുക.\n" +
      "3. ഒരു പ്രൊഫഷണലായി നിങ്ങൾ എന്തൊക്കെ സേവനങ്ങൾ നൽകണം എന്ന് വിശദീകരിക്കുക.\n" +
      "4. രജിസ്ട്രേഷൻ, ലോഗിൻ അല്ലെങ്കിൽ വെരിഫിക്കേഷൻ എന്നിവ വിശദീകരിക്കുക.\n\n" +
      "നിങ്ങൾക്ക് എന്താണ് അറിയേണ്ടത്?",
    fallback: "QuickHire-നെക്കുറിച്ച് നിങ്ങൾക്ക് ഒരു ചോദ്യമുണ്ടെന്ന് ഞാൻ മനസ്സിലാക്കുന്നു. നിങ്ങളുടെ ചോദ്യങ്ങൾക്ക് കൃത്യമായ തത്സമയ AI മറുപടികൾ ലഭിക്കുന്നതിനായി, ദയവായി സെറ്റിംഗ്സ് മെനുവിൽ (ഈ ചാറ്റ് വിൻഡോയിലെ ഗിയർ ഐക്കൺ ക്ലിക്ക് ചെയ്യുക) ഒരു Gemini API കീ ക്രമീകരിക്കുക."
  }
};

// GET /api/agent/status
router.get('/status', (req, res) => {
  const hasEnvKey = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  res.status(200).json({ hasKey: hasEnvKey });
});

// POST /api/agent/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, history, userContext, language } = req.body;
    const lang = LOCAL_RESPONSES[language] ? language : 'en';
    const localStrings = LOCAL_RESPONSES[lang];

    // Determine API Key from header or environment
    const rawClientKey = req.headers['x-gemini-key'];
    const clientApiKey = (rawClientKey && rawClientKey !== 'undefined' && rawClientKey !== 'null' && rawClientKey.trim() !== '') ? rawClientKey : null;
    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    const lowercaseMessage = (message || '').toLowerCase().trim();

    if (!apiKey) {
      // ── RUN LOCAL SIMULATED INTELLIGENCE ───────────────────────────────────
      let reply = "";

      // Greeting or Hello
      if (lowercaseMessage === "hello" || lowercaseMessage === "hi" || lowercaseMessage === "hey" || lowercaseMessage === "नमस्ते" || lowercaseMessage === "ನಮಸ್ಕಾರ") {
        if (!userContext || !userContext.name) {
          reply = localStrings.welcomeGuest;
        } else if (userContext.role === 'Client') {
          reply = localStrings.welcomeClient
            .replace('{name}', userContext.name)
            .replace('{jobCount}', userContext.activeJobs ? userContext.activeJobs.length : 0);
        } else {
          reply = localStrings.welcomeProf
            .replace('{name}', userContext.name)
            .replace('{status}', userContext.verificationStatus || 'Pending');
        }
      } 
      // Summarize active orders / service requests
      else if (lowercaseMessage.includes('summar') || lowercaseMessage.includes('order') || lowercaseMessage.includes('job') || lowercaseMessage.includes('सक्रिय') || lowercaseMessage.includes('ಸಾರಾಂಶ') || lowercaseMessage.includes('സംഗ്രഹം') || lowercaseMessage.includes('சுருக்கம்') || lowercaseMessage.includes('సారాంశం')) {
        if (!userContext || !userContext.name) {
          reply = localStrings.welcomeGuest + "\n\n(Please login to view active orders)";
        } else if (userContext.role === 'Client') {
          const jobs = userContext.activeJobs || [];
          if (jobs.length === 0) {
            reply = localStrings.noActiveJobs;
          } else {
            reply = localStrings.jobSummaryHeader;
            jobs.forEach(job => {
              reply += localStrings.jobSummaryItem
                .replace('{category}', job.category || 'N/A')
                .replace('{date}', job.date || 'N/A')
                .replace('{time}', job.time || 'N/A')
                .replace('{street}', job.street || '')
                .replace('{city}', job.city || '')
                .replace('{pincode}', job.pincode || '')
                .replace('{status}', job.status || 'open')
                .replace('{description}', job.description || '');
            });
          }
        } else {
          // Professional summary of jobs
          reply = localStrings.profVerificationStatus.replace('{status}', userContext.verificationStatus || 'Pending') + "\n\n";
          const appliedCount = userContext.appliedJobsCount || 0;
          if (lang === 'en') {
            reply += `You have applied to **${appliedCount}** job(s) on the platform. Keep checking the portal for client responses!`;
          } else if (lang === 'hi') {
            reply += `आपने इस प्लेटफॉर्म पर **${appliedCount}** नौकरियों के लिए आवेदन किया है। ग्राहक की प्रतिक्रियाओं के लिए पोर्टल देखते रहें!`;
          } else if (lang === 'kn') {
            reply += `ನೀವು ಈ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ನಲ್ಲಿ **${appliedCount}** ಕೆಲಸಗಳಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ್ದೀರಿ. ಕ್ಲೈಂಟ್ ಪ್ರತಿಕ್ರಿಯೆಗಳಿಗಾಗಿ ಪೋರ್ಟಲ್ ಪರಿಶೀಲಿಸುತ್ತಿರಿ!`;
          } else if (lang === 'te') {
            reply += `మీరు ఈ ప్లాట్‌ఫామ్‌లో **${appliedCount}** ఉద్యోగాలకు దరఖాస్తు చేసుకున్నారు. క్లయింట్ స్పందనల కోసం పోర్టల్‌ను తనిഖీ చేస్తూ ఉండండి!`;
          } else if (lang === 'ta') {
            reply += `இந்தத் தளத்தில் **${appliedCount}** வேலைகளுக்கு நீங்கள் விண்ணப்பித்துள்ளீர்கள். வாடிக்கையாளர்களின் பதில்களுக்கு போர்ட்டலைத் தொடர்ந்து சரிபார்க்கவும்!`;
          } else if (lang === 'ml') {
            reply += `നിങ്ങൾ ഈ പ്ലാറ്റ്‌ഫോമിൽ **${appliedCount}** ജോലികൾക്ക് അപേക്ഷിച്ചിട്ടുണ്ട്. ക്ലയന്റുകളുടെ പ്രതികരണങ്ങൾക്കായി പോർട്ടൽ പരിശോധിക്കുന്നത് തുടരുക!`;
          }
        }
      }
      // What services should I provide (Professional)
      else if (lowercaseMessage.includes('service') || lowercaseMessage.includes('provide') || lowercaseMessage.includes('काम') || lowercaseMessage.includes('ಸೇವೆ') || lowercaseMessage.includes('സേവനങ്ങൾ') || lowercaseMessage.includes('சேவைகள்') || lowercaseMessage.includes('సేవలు')) {
        if (userContext && userContext.role === 'Professional') {
          reply = localStrings.profRecommendedServices;
        } else {
          reply = localStrings.generalHelp;
        }
      }
      // Verification status / How to verify
      else if (lowercaseMessage.includes('verif') || lowercaseMessage.includes('id') || lowercaseMessage.includes('सत्यापन') || lowercaseMessage.includes('ಪರಿಶೀಲನೆ') || lowercaseMessage.includes('ശരിവയ്ക്കൽ') || lowercaseMessage.includes('சரிபார்ப்பு') || lowercaseMessage.includes('ధృవీకరణ')) {
        if (userContext && userContext.role === 'Professional') {
          reply = localStrings.profVerificationStatus.replace('{status}', userContext.verificationStatus || 'Pending');
        } else {
          reply = "QuickHire verifies all professionals by checking their Government IDs (PDF or Image upload) via an automated background scanner and our support team. This ensures safety for our Clients.";
        }
      }
      // Fallback
      else {
        reply = localStrings.generalHelp + "\n\n" + localStrings.fallback;
      }

      return res.status(200).json({
        reply,
        isSimulated: true
      });
    }

    // ── CALL LIVE GEMINI API ────────────────────────────────────────────────
    // Format conversation history for Gemini:
    // User messages are mapped to 'user', AI replies are mapped to 'model'.
    const contents = [];

    if (history && Array.isArray(history)) {
      history.forEach(msg => {
        if (msg.role && msg.content) {
          contents.push({
            role: msg.role === 'ai' || msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        }
      });
    }

    // Append the new message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Structure System Instructions with full user context
    let contextStr = "The user is currently a Guest / Not logged in.";
    if (userContext && userContext.name) {
      contextStr = `User Name: ${userContext.name}
Role: ${userContext.role}
Language selected in App: ${language} (${lang})
`;
      if (userContext.role === 'Client') {
        const jobs = userContext.activeJobs || [];
        contextStr += `Active Jobs Posted: ${jobs.length}\n`;
        jobs.forEach((job, idx) => {
          contextStr += `Job #${idx + 1}: Category=${job.category}, Date=${job.date}, Time=${job.time}, Street=${job.street}, City=${job.city}, Pincode=${job.pincode}, Status=${job.status}, Description=${job.description}\n`;
        });
      } else if (userContext.role === 'Professional') {
        contextStr += `Profile Verification Status: ${userContext.verificationStatus || 'Pending'}
Applied Jobs Count: ${userContext.appliedJobsCount || 0}
`;
      }
    }

    const systemInstruction = `You are a highly personalized, warm, and helpful AI assistant for the 'QuickHire' application.
Your name is 'QuickHire Mitra' or 'QuickHire Sahayak'.
You are dedicated to guiding the user and providing immediate help on their orders, job matches, and app features.

Here is the details of the current user you are talking to:
-----------------------
${contextStr}
-----------------------

CRITICAL INSTRUCTION:
1. You MUST respond ONLY in the user's selected language: '${language}'. Use the correct native script. E.g. for Hindi (hi) use Devanagari script, for Kannada (kn) use Kannada script, for Telugu (te) use Telugu script, for Tamil (ta) use Tamil script, for Malayalam (ml) use Malayalam script.
2. Address the user directly by their name: '${userContext?.name || ''}' to make it personal.
3. Be specific. If they ask about their orders or jobs, read the context provided above and describe their exact details (e.g. date, category, status). Do NOT give generic or placeholder descriptions.
4. If they are a Professional, guide them on what services are available to provide and summarize their job applications or verification process.
5. Keep answers concise, clear, and structured (use bullet points if listing details).
`;

    // Make request to Gemini Developer API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            maxOutputTokens: 800,
            temperature: 0.5
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[GEMINI ERROR RESPONSE]:", errorData);
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const resData = await response.json();
    const replyText = resData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!replyText) {
      throw new Error("Empty response from Gemini API");
    }

    return res.status(200).json({
      reply: replyText,
      isSimulated: false
    });

  } catch (error) {
    console.error("[AGENT CHAT ERROR]:", error);
    // If live API calls fail, fallback to local simulated response gracefully and return 200 so axios doesn't crash
    const lang = LOCAL_RESPONSES[language] ? language : 'en';
    const localStrings = LOCAL_RESPONSES[lang];
    
    let reply = `[API/Key Error: ${error.message} - Running in simulated fallback mode]\n\n`;
    const lowercaseMessage = (message || '').toLowerCase().trim();
    
    if (lowercaseMessage === "hello" || lowercaseMessage === "hi" || lowercaseMessage === "hey" || lowercaseMessage === "नमस्ते" || lowercaseMessage === "ನಮಸ್ಕಾರ") {
      if (!userContext || !userContext.name) {
        reply += localStrings.welcomeGuest;
      } else if (userContext.role === 'Client') {
        reply += localStrings.welcomeClient
          .replace('{name}', userContext.name)
          .replace('{jobCount}', userContext.activeJobs ? userContext.activeJobs.length : 0);
      } else {
        reply += localStrings.welcomeProf
          .replace('{name}', userContext.name)
          .replace('{status}', userContext.verificationStatus || 'Pending');
      }
    } else if (lowercaseMessage.includes('summar') || lowercaseMessage.includes('order') || lowercaseMessage.includes('job') || lowercaseMessage.includes('सक्रिय') || lowercaseMessage.includes('ಸಾರಾಂಶ') || lowercaseMessage.includes('ಸംഗ್ರഹം') || lowercaseMessage.includes('சுருக்கம்') || lowercaseMessage.includes('సారాంశం')) {
      if (!userContext || !userContext.name) {
        reply += localStrings.welcomeGuest + "\n\n(Please login to view active orders)";
      } else if (userContext.role === 'Client') {
        const jobs = userContext.activeJobs || [];
        if (jobs.length === 0) {
          reply += localStrings.noActiveJobs;
        } else {
          reply += localStrings.jobSummaryHeader;
          jobs.forEach(job => {
            reply += localStrings.jobSummaryItem
              .replace('{category}', job.category || 'N/A')
              .replace('{date}', job.date || 'N/A')
              .replace('{time}', job.time || 'N/A')
              .replace('{street}', job.street || '')
              .replace('{city}', job.city || '')
              .replace('{pincode}', job.pincode || '')
              .replace('{status}', job.status || 'open')
              .replace('{description}', job.description || '');
          });
        }
      } else {
        reply += localStrings.profVerificationStatus.replace('{status}', userContext.verificationStatus || 'Pending') + "\n\n";
        const appliedCount = userContext.appliedJobsCount || 0;
        if (lang === 'en') reply += `You have applied to **${appliedCount}** job(s) on the platform. Keep checking the portal for client responses!`;
        else if (lang === 'hi') reply += `आपने इस प्लेटफॉर्म पर **${appliedCount}** नौकरियों के लिए आवेदन किया है। ग्राहक की प्रतिक्रियाओं के लिए पोर्टल देखते रहें!`;
        else if (lang === 'kn') reply += `ನೀವು ಈ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ನಲ್ಲಿ **${appliedCount}** ಕೆಲಸಗಳಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ್ದೀರಿ. ಕ್ಲೈಂಟ್ ಪ್ರತಿಕ್ರಿಯೆಗಳಿಗಾಗಿ ಪೋರ್ಟಲ್ ಪರಿಶೀಲಿಸುತ್ತಿರಿ!`;
        else if (lang === 'te') reply += `మీరు ఈ ప్లాట్‌ఫామ్‌లో **${appliedCount}** ఉద్యోగాలకు దരఖాస్తు చేసుకున్నారు. క్లయింట్ స్పందనల కోసం పోర్టల్‌ను తనిఖీ చేస్తూ ఉండండి!`;
        else if (lang === 'ta') reply += `இந்தத் தளத்தில் **${appliedCount}** வேலைகளுக்கு நீங்கள் விண்ணப்பித்துள்ளீர்கள். வாடிக்கையாளர்களின் பதில்களுக்கு போர்ட்டலைத் தொடர்ந்து சரிபார்க்கவும்!`;
        else if (lang === 'ml') reply += `നിങ്ങൾ ഈ പ്ലാറ്റ്‌ഫോമിൽ **${appliedCount}** ജോലികൾക്ക് അപേക്ഷിച്ചിട്ടുണ്ട്. ക്ലയന്റുകളുടെ പ്രതികരണങ്ങൾക്കായി പോർട്ടൽ പരിശോധിക്കുന്നത് തുടരുക!`;
      }
    } else if (lowercaseMessage.includes('service') || lowercaseMessage.includes('provide') || lowercaseMessage.includes('काम') || lowercaseMessage.includes('ಸೇವೆ') || lowercaseMessage.includes('സേവനങ്ങൾ') || lowercaseMessage.includes('சேவைகள்') || lowercaseMessage.includes('సేవలు')) {
      if (userContext && userContext.role === 'Professional') {
        reply += localStrings.profRecommendedServices;
      } else {
        reply += localStrings.generalHelp;
      }
    } else {
      reply += localStrings.generalHelp + "\n\n" + localStrings.fallback;
    }

    return res.status(200).json({
      reply,
      isSimulated: true,
      error: error.message
    });
  }
});

module.exports = router;
