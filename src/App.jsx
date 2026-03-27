import React, { useEffect, useState, useRef, useCallback } from 'react';
import { GreenButton, Hand, Joystick, OpenHub, RedButton, Whisper } from './svg/index.js';

// --- CONFIGURATION ---
const KEYS = {
  GREEN: 'Enter',          
  RED: 'Escape',           
  JOY_UP: 'ArrowDown',     // Câblage inversé physiquement
  JOY_DOWN: 'ArrowUp'      // Câblage inversé physiquement
};

const QUESTIONS = [
  'Pensez-vous que les brosses à dents électriques sont plus durables que les brosses à dents manuelles ?',
  'Pour vous, quel produit du quotidien pourrait être repensé pour durer plus longtemps ?',
  'Quelle innovation simple améliorerait le recyclage ou la réutilisation dans votre quotidien ?'
];

const STEPS = ['question', 'speak', 'recording', 'confirm', 'thanks'];
const QUESTION_ROTATION_MS = 8000;
const THANKS_RESTART_MS = 10000;
const MIN_RECORDING_MS = 4000;

export default function App() {
  const [activeStep, setActiveStep] = useState('question');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [slideDir, setSlideDir] = useState('next'); // 'next' ou 'prev' pour l'animation
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingStartTimeRef = useRef(null);

  const goToNextStep = useCallback(() => {
    const currentIndex = STEPS.indexOf(activeStep);
    const nextStep = STEPS[Math.min(currentIndex + 1, STEPS.length - 1)];
    setActiveStep(nextStep);
  }, [activeStep]);

  const restartFlow = useCallback(() => {
    setActiveStep('question');
    setQuestionIndex(0);
    setSlideDir('next');
    setRecordedAudio(null);
    setUploadError(null);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const duration = Date.now() - recordingStartTimeRef.current;
        if (duration >= MIN_RECORDING_MS) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setRecordedAudio(audioBlob);
          setActiveStep('confirm');
        } else {
          setActiveStep('speak');
        }
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setActiveStep('recording');
    } catch (err) {
      console.error("Micro non accessible:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUpload = async () => {
    if (!recordedAudio || isUploading) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('audio', recordedAudio, 'recording.webm');
    formData.append('question', QUESTIONS[questionIndex]);

    try {
      const response = await fetch('/api/upload-audio', { method: 'POST', body: formData });
      if (!response.ok) throw new Error();
      goToNextStep();
    } catch (err) {
      setUploadError("Échec de l'envoi.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleActionGreen = useCallback(() => {
    if (activeStep === 'question') goToNextStep();
    else if (activeStep === 'confirm') handleUpload();
    else if (activeStep === 'thanks') restartFlow();
  }, [activeStep, goToNextStep, handleUpload, restartFlow]);

  const handleActionRed = useCallback(() => {
    if (activeStep === 'speak') startRecording();
    else if (activeStep === 'recording') stopRecording();
    else if (activeStep === 'confirm') {
      setRecordedAudio(null);
      setActiveStep('speak');
    }
  }, [activeStep, isRecording]);

  const handleJoystick = useCallback((direction) => {
    if (activeStep === 'question') {
      setSlideDir(direction); // On enregistre le sens de l'animation
      setQuestionIndex(prev => {
        if (direction === 'next') return (prev + 1) % QUESTIONS.length;
        return (prev - 1 + QUESTIONS.length) % QUESTIONS.length;
      });
    }
  }, [activeStep]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === KEYS.GREEN) handleActionGreen();
      if (e.key === KEYS.RED) handleActionRed();
      if (e.key === KEYS.JOY_DOWN) handleJoystick('next'); 
      if (e.key === KEYS.JOY_UP) handleJoystick('prev');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleActionGreen, handleActionRed, handleJoystick]);

  useEffect(() => {
    let timer;
    if (activeStep === 'question') {
      timer = setInterval(() => handleJoystick('next'), QUESTION_ROTATION_MS);
    } else if (activeStep === 'thanks') {
      timer = setTimeout(restartFlow, THANKS_RESTART_MS);
    }
    return () => {
      if (timer) clearInterval(timer);
      if (timer) clearTimeout(timer);
    };
  }, [activeStep, questionIndex, handleJoystick, restartFlow]);

  return (
    <main className="app-shell">
      {/* On injecte les animations de slide directement ici pour être sûr qu'elles fonctionnent */}
      <style>{`
        @keyframes slideInNext {
          0% { transform: translateX(100px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInPrev {
          0% { transform: translateX(-100px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .slide-next { animation: slideInNext 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; }
        .slide-prev { animation: slideInPrev 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; }
      `}</style>

      <div className="device-frame">

        {activeStep === 'question' && (
          <section className="screen-frame screen-question fade-in-up">
            <div className="top-copy intro-copy">
              <h1>Aidez un porteur de projet</h1>
              <p>en répondant à l'une de ces questions</p>
            </div>

            {/* C'est ici que la magie opère : la classe change selon la direction du joystick */}
            <div className={`question-card slide-${slideDir}`} key={questionIndex}>
              <p className="question-text">{QUESTIONS[questionIndex]}</p>
            </div>

            <div className="screen-actions">
              <div className="hint-block compact">
                <img src={Joystick} className="joystick" alt="Joystick" />
                <span>Joystick pour choisir</span>
              </div>
              <button className="action-button confirm pulse" onClick={handleActionGreen}>
                <img src={GreenButton} alt="Vert" />
                <span>Validez avec le bouton VERT</span>
              </button>
            </div>
          </section>
        )}

        {activeStep === 'speak' && (
          <section className="screen-frame screen-speak fade-in-up">
            <div className="top-copy">
              <img className="hero-icon icon-small" src={Whisper} alt="Whisper" />
              <p className="eyebrow">Prêt à répondre ?</p>
            </div>
            <div className="question-card question-card--large">
              <p>{QUESTIONS[questionIndex]}</p>
            </div>
            <button className="action-button record pulse" onClick={handleActionRed}>
              <img src={RedButton} alt="Rouge" />
              <span>Bouton ROUGE pour enregistrer</span>
            </button>
          </section>
        )}

        {activeStep === 'recording' && (
          <section className="screen-frame screen-recording fade-in-up">
            <div className="top-copy">
              <img className="hero-icon icon-small" src={Whisper} alt="Recording" />
              <p className="eyebrow">Enregistrement...</p>
            </div>
            <div className="recording-panel">
               <div className="waveform">
                 {[...Array(15)].map((_, i) => <span key={i} className="wave-bar" style={{animationDelay: `${i*0.1}s`}} />)}
               </div>
               <p>Parlez maintenant !</p>
            </div>
            <button className="action-button record" onClick={handleActionRed}>
              <img src={RedButton} alt="Rouge" />
              <span>Bouton ROUGE pour FINIR</span>
            </button>
          </section>
        )}

        {activeStep === 'confirm' && (
          <section className="screen-frame screen-confirm fade-in-up">
            <div className="top-copy top-copy--spacious">
              <h2>Confirmer l'envoi ?</h2>
              <p>Votre message va être transmis au porteur de projet.</p>
              {uploadError && <p className="error-msg">{uploadError}</p>}
            </div>
            <div className="button-stack button-stack--split">
              <button className="action-button confirm" onClick={handleActionGreen} disabled={isUploading}>
                <img src={GreenButton} alt="Vert" />
                <span>{isUploading ? 'Envoi...' : 'VERT : Envoyer'}</span>
              </button>
              <button className="action-button record" onClick={handleActionRed} disabled={isUploading}>
                <img src={RedButton} alt="Rouge" />
                <span>ROUGE : Recommencer</span>
              </button>
            </div>
          </section>
        )}

        {activeStep === 'thanks' && (
          <section className="screen-frame screen-thanks fade-in-up">
            <div className="top-copy thanks-copy">
              <img className="hero-icon icon-medium" src={Hand} alt="Merci" />
              <h2>Merci !</h2>
              <p>Votre voix a été enregistrée avec succès.</p>
            </div>
            <div className="partner-block">
              <img src={OpenHub} alt="OpenHub" className="openhub" />
              <p className="partner-note">Dispositif réalisé par l'UCLouvain OpenHub.</p>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
