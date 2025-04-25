//'use client';
 // Important for using browser APIs

 import { useEffect, useRef, useState } from 'react';
 import dynamic from 'next/dynamic';
 
 // Avoid SSR issues with webgazer
 const NoSSR = dynamic(() => Promise.resolve(() => null), { ssr: false });
 
 export default function EyeTracker() {
   const dotRef = useRef(null);
   const [webgazerLoaded, setWebgazerLoaded] = useState(false);
 
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
 
     window.webgazer.setGazeListener((data, timestamp) => {
       if (data == null) return;
       const dot = dotRef.current;
       if (dot) {
         dot.style.left = data.x + 'px';
         dot.style.top = data.y + 'px';
       }
     }).begin();
 
     // Optional: hide face overlay and prediction points
     // window.webgazer.showVideo(false).showFaceOverlay(false).showFaceFeedbackBox(false);
     window.webgazer.showVideo(true).showFaceOverlay(true).showFaceFeedbackBox(true);
     // This lets it learn from mouse movement:
      window.addEventListener('click', () => {
        window.webgazer.recordScreenPosition(window.event.clientX, window.event.clientY, 'click');
      });
     return () => {
       window.webgazer.end();
     };
   }, [webgazerLoaded]);
 
   return (
     <div>
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
       <p style={{ padding: '20px' }}>Look around and watch the red dot follow your gaze!</p>
       <NoSSR />
     </div>
   );
 } 
 