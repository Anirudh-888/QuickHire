import { useEffect, useState } from 'react';
import './SplashLoader.css';

const SplashLoader = () => {
  const [phase, setPhase] = useState('entering'); // entering, merging, complete, hidden
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Start merging after 800ms
    const mergeTimer = setTimeout(() => {
      setPhase('merging');
    }, 800);

    // Trigger completion flash and final logo reveal after 2000ms
    const completeTimer = setTimeout(() => {
      setPhase('complete');
    }, 2000);

    // Fade out overlay after 3200ms
    const hideTimer = setTimeout(() => {
      setPhase('hidden');
    }, 3200);

    // Fully remove component from DOM after 4000ms
    const removeTimer = setTimeout(() => {
      setShouldRender(false);
    }, 4000);

    return () => {
      clearTimeout(mergeTimer);
      clearTimeout(completeTimer);
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div className={`splash-overlay ${phase}`}>
      <div className="splash-content">
        
        {/* Phase 1 & 2: Joining Words */}
        <div className="words-container">
          <span className="splash-word needs">Needs</span>
          <span className="splash-amp">&amp;</span>
          <span className="splash-word skills">Skills</span>
        </div>

        {/* Phase 3: Unified QuickHire Reveal */}
        <div className="reveal-container">
          <div className="reveal-logo-ring"></div>
          <h1 className="reveal-title">QuickHire</h1>
          <p className="reveal-tagline">Connecting Opportunities Instantly</p>
        </div>

      </div>
      
      {/* Expanding Ripple wave when they merge */}
      <div className="splash-ripple"></div>
    </div>
  );
};

export default SplashLoader;
