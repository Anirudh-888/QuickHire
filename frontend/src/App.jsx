import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ClientPortal from './components/ClientPortal';
import ProfessionalPortal from './components/ProfessionalPortal';
import ContactUs from './components/ContactUs';
import LanguageSwitcher from './components/LanguageSwitcher';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app-layout registration-container">
          <LanguageSwitcher />
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/client/*" element={<ClientPortal />} />
              <Route path="/professional/*" element={<ProfessionalPortal />} />
              <Route path="/contact" element={<ContactUs />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
