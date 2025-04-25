import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const NoSSR = dynamic(() => Promise.resolve(() => null), { ssr: false });

const CALIBRATION_POINTS = [
  { x: '10%', y: '10%' },
  { x: '50%', y: '10%' },
  { x: '90%', y: '10%' },
  { x: '10%', y: '50%' },
  { x: '50%', y: '50%' },
  { x: '90%', y: '50%' },
  { x: '10%', y: '90%' },
  { x: '50%', y: '90%' },
  { x: '90%', y: '90%' },
];

export default function EyeTracker() {
  const dotRef = useRef(null);
  const [webgazerLoaded, setWebgazerLoaded] = useState(false);
  const [calibrated, setCalibrated] = useState(false);
  const [step, setStep] = useState(0);
  const [showCalibration, setShowCalibration] = useState(true);

  useEffect(() => {
    const loadWebgazer = async () => {
      if (typeof window !== 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://webgazer.cs.brown.edu/webgazer.js';
        script.async = true;
        script.onload = () => setWebgazerLoaded(true);
        document.body.appendChild(script);
      }
    };
    loadWebgazer();
  }, []);

  useEffect(() => {
    if (!webgazerLoaded) return;

    window.webgazer.setRegression('ridge')
      .saveDataAcrossSessions(true)
      .showVideo(false)
      .showFaceOverlay(false)
      .showFaceFeedbackBox(false);

    window.webgazer.begin();
  }, [webgazerLoaded]);

  useEffect(() => {
    if (!calibrated || !webgazerLoaded) return;

    window.webgazer.setGazeListener((data, timestamp) => {
      if (data == null) return;
      const dot = dotRef.current;
      if (dot) {
        dot.style.left = data.x + 'px';
        dot.style.top = data.y + 'px';
      }

      // Scroll logic
      const height = window.innerHeight;
      if (data.y < height * 0.2) {
        window.scrollBy({ top: -10, behavior: 'smooth' });
      } else if (data.y > height * 0.8) {
        window.scrollBy({ top: 10, behavior: 'smooth' });
      }
    });
  }, [calibrated, webgazerLoaded]);

  const handleCalibrationClick = () => {
    const point = document.getElementById(`calib-${step}`);
    
    if (point) {
      point.style.background = 'green';
    }
    const x = point.getBoundingClientRect().left + point.offsetWidth / 2;
    const y = point.getBoundingClientRect().top + point.offsetHeight / 2;
    
    for (let i = 0; i < 5; i++) {
      window.webgazer.recordScreenPosition(x, y, 'click');
    }
    if (step + 1 < CALIBRATION_POINTS.length) {
      setStep(step + 1);
    } else {
      setCalibrated(true);
      setShowCalibration(false);
    }
  };
  

  return (
    <div>
      {showCalibration ? (
        <div style={{ position: 'absolute', width: '100vw', height: '100vh',
          zIndex: 100
         }} onClick={handleCalibrationClick}>
          {CALIBRATION_POINTS.map((pos, idx) => (
            <div
              key={idx}
              id={`calib-${idx}`}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                transform: 'translate(-50%, -50%)',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: idx === step ? 'red' : 'gray',
              }}
            />
          ))}
          <p style={{ position: 'absolute', bottom: '10px', width: '100%', textAlign: 'center' }}>
            Click the red dot to calibrate ({step + 1}/{CALIBRATION_POINTS.length})
          </p>
        </div>
      ) : (
        <div style={{ padding: '20px' }}>
          <div
            ref={dotRef}
            style={{
              position: 'absolute',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'red',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          ></div>
          <h2>Scroll Test: Read This Long Text</h2>
          {[...Array(250)].map((_, i) => (
            <p key={i}>
              This is paragraph {i + 1}. Keep reading to test automatic scrolling based on your gaze.
            </p>
          ))}
        </div>
      )}
      <button
  onClick={() => {
    setShowCalibration(true);
    setCalibrated(false);
    setStep(0);
  }}
  style={{
    position: 'fixed',
    top: 10,
    right: 10,
    zIndex: 2000,
    padding: '10px 15px',
    fontSize: '16px',
  }}
>
  Recalibrate
</button>

      <NoSSR />
    </div>
  );
}
