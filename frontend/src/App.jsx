import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ClientPortal from './components/ClientPortal';
import ClientDashboard from './components/ClientDashboard';
import ProfessionalPortal from './components/ProfessionalPortal';
import ProfessionalDashboard from './components/ProfessionalDashboard';
import ContactUs from './components/ContactUs';
import AIAgent from './components/AIAgent';
import SplashLoader from './components/SplashLoader';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Keep splash mounted slightly longer than the hide animation (4000ms total)
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <div className="app-layout registration-container">
          {showSplash && <SplashLoader />}
          <AIAgent />
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/client/*" element={<ClientPortal />} />
              <Route path="/client-dashboard" element={<ClientDashboard />} />
              <Route path="/professional/*" element={<ProfessionalPortal />} />
              <Route path="/professional-dashboard" element={<ProfessionalDashboard />} />
              <Route path="/contact" element={<ContactUs />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
