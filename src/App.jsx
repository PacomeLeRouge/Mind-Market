import React, { useEffect, useState, useRef } from 'react';
import { GreenButton, Hand, Joystick, OpenHub, RedButton, Whisper } from './svg/index.js';

const questions = [
  'Pensez-vous que les brosses à dents électriques sont plus durables que les brosses à dents manuelles ?',
  'Pour vous, quel produit du quotidien pourrait être repensé pour durer plus longtemps ?',
  'Quelle innovation simple améliorerait le recyclage ou la réutilisation dans votre quotidien ?'
];

const steps = ['question', 'speak', 'recording', 'confirm', 'thanks'];
const recordingBars = Array.from({ length: 15 }, (_, index) => index);
const QUESTION_ROTATION_MS = 5000;
const THANKS_RESTART_MS = 10000;
const MIN_RECORDING_DURATION_MS = 5000;

export default function App() {
  const [activeStep, setActiveStep] = useState(steps[0]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingStartTimeRef = useRef(null);

  // --- GESTION DE LA CARTE EG STARTS (GAMEPAD) ---
  const requestRef = useRef();
  const prevGamepadState = useRef({ buttons: [], axes: [] });

  useEffect(() => {
    const pollGamepad = () => {
      const gamepads = navigator.getGamepads();
      const pad = gamepads[0]; 

      if (pad) {
        // 1. JOYSTICK (Axe 0 = Horizontal)
        const x = pad.axes[0]; 
        const prevX = prevGamepadState.current.axes[0] || 0;

        // Seuil de 0.5 pour éviter la sensibilité excessive
        if (x > 0.5 && prevX <= 0.5) { // Droite
          setQuestionIndex((current) => (current + 1) % questions.length);
        }
        if (x < -0.5 && prevX >= -0.5) { // Gauche
           setQuestionIndex((current) => (current - 1 + questions.length) % questions.length);
        }

        // 2. BOUTONS (K1 = Rouge, K2 = Vert)
        const btnRedPressed = pad.buttons[0]?.pressed; // K1
        const prevRed = prevGamepadState.current.buttons[0];
        
        const btnGreenPressed = pad.buttons[1]?.pressed; // K2
        const prevGreen = prevGamepadState.current.buttons[1];

        // Action Bouton ROUGE (K1) -> Enregistrement / Stop
        if (btnRedPressed && !prevRed) {
          const redBtnElement = document.querySelector('.action-button.record');
          if (redBtnElement && !redBtnElement.disabled) redBtnElement.click();
        }

        // Action Bouton VERT (K2) -> Valider / Suivant
        if (btnGreenPressed && !prevGreen) {
          const greenBtnElement = document.querySelector('.action-button.confirm');
          if (greenBtnElement && !greenBtnElement.disabled) greenBtnElement.click();
        }

        prevGamepadState.current = {
          buttons: pad.buttons.map(b => b.pressed),
          axes: [...pad.axes]
        };
      }
      requestRef.current = requestAnimationFrame(pollGamepad);
    };

    requestRef.current = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);


  // --- LOGIQUE DE NAVIGATION ET TIMERS ---
  useEffect(() => {
    if (activeStep !== 'question') return undefined;
    const interval = window.setInterval(() => {
      setQuestionIndex((current) => (current + 1) % questions.length);
    }, QUESTION_ROTATION_MS);
    return () => window.clearInterval(interval);
  }, [activeStep]);

  useEffect(() => {
    if (activeStep !== 'thanks') return undefined;
    const timeout = window.setTimeout(() => {
      setActiveStep('question');
      setQuestionIndex(0);
    }, THANKS_RESTART_MS);
    return () => window.clearTimeout(timeout);
  }, [activeStep]);


  // --- CAPTURE AUDIO (MICRO USB) ---
  const startRecording = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const usbMic = audioInputs.find(device => device.label.toLowerCase().includes('usb')) || audioInputs[0];

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: usbMic ? { deviceId: { exact: usbMic.deviceId } } : true 
      });

      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const duration = Date.now() - recordingStartTimeRef.current;
        if (duration >= MIN_RECORDING_DURATION_MS) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setRecordedAudio(audioBlob);
          setActiveStep('confirm');
        } else {
          alert(`Enregistrement trop court. Minimum 5 secondes.`);
          setActiveStep('speak');
        }
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Erreur micro:', error);
      alert('Vérifiez que le micro USB est branché.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleRecordingButtonClick = () => {
    if (activeStep === 'speak') {
      startRecording();
      setActiveStep('recording');
    } else if (activeStep === 'recording') {
      stopRecording();
    }
  };

  const currentQuestion = questions[questionIndex];

  return (
    <main className="app-shell">
      <div className="device-frame">
        {activeStep === 'question' && (
          <section className="screen-frame screen-question fade-in-up">
            <div className="top-copy intro-copy">
              <h1>Aidez un porteur de projet</h1>
              <p>en répondant à l&apos;une de ces question</p>
            </div>
            <div className="question-card">
              <p key={currentQuestion} className="question-text fade-in-up">{currentQuestion}</p>
            </div>
            <div className="screen-actions">
              <div className="hint-block compact">
                <img className="joystick" src={Joystick} alt="Joystick" />
                <span>Utilisez le joystick pour choisir</span>
              </div>
              <div className="button-stack">
                <button type="button" className="action-button confirm pulse" onClick={() => setActiveStep('speak')}>
                  <img src={GreenButton} alt="Vert" />
                  <span>Validez (Bouton Vert)</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {activeStep === 'speak' && (
          <section className="screen-frame screen-speak fade-in-up">
            <div className="top-copy">
              <img className="hero-icon icon-small" src={Whisper} alt="Micro" />
              <p className="eyebrow">Prêt à répondre ?</p>
            </div>
            <div className="question-card question-card--large">
              <p>{currentQuestion}</p>
            </div>
            <div className="button-stack">
              <button type="button" className="action-button record pulse" onClick={handleRecordingButtonClick}>
                <img src={RedButton} alt="Rouge" />
                <span>Enregistrer (Bouton Rouge)</span>
              </button>
            </div>
          </section>
        )}

        {activeStep === 'recording' && (
          <section className="screen-frame screen-recording fade-in-up">
            <div className="top-copy">
              <img className="hero-icon icon-small" src={Whisper} alt="Enregistrement" />
              <p className="eyebrow">On vous écoute...</p>
            </div>
            <div className="recording-panel">
              <div className="waveform">
                {recordingBars.map((bar) => (
                  <span key={bar} className="wave-bar" style={{ animationDelay: `${bar * 0.08}s` }} />
                ))}
              </div>
              <p>Enregistrement en cours...</p>
            </div>
            <div className="button-stack">
              <button type="button" className="action-button record" onClick={handleRecordingButtonClick}>
                <img src={RedButton} alt="Rouge" />
                <span>Arrêter (Bouton Rouge)</span>
              </button>
            </div>
          </section>
        )}

        {activeStep === 'confirm' && (
          <section className="screen-frame screen-confirm fade-in-up">
            <div className="top-copy top-copy--spacious">
              <h2>Confirmer l'envoi ?</h2>
              <p>Appuyez sur Vert pour envoyer ou Rouge pour recommencer.</p>
              {uploadError && <div className="error-msg">{uploadError}</div>}
            </div>
            <div className="button-stack button-stack--split">
              <button 
                type="button" 
                className="action-button confirm pulse" 
                onClick={async () => {
                  if (!recordedAudio) return;
                  setIsUploading(true);
                  try {
                    const formData = new FormData();
                    formData.append('audio', recordedAudio, 'recording.webm');
                    formData.append('question', currentQuestion);
                    const res = await fetch('/api/upload-audio', { method: 'POST', body: formData });
                    if (!res.ok) throw new Error("Erreur serveur");
                    setRecordedAudio(null);
                    setActiveStep('thanks');
                  } catch (e) {
                    setUploadError(e.message);
                  } finally {
                    setIsUploading(false);
                  }
                }}
                disabled={isUploading}
              >
                <img src={GreenButton} alt="Vert" />
                <span>{isUploading ? 'Envoi...' : 'Envoyer (Vert)'}</span>
              </button>
              <button 
                type="button" 
                className="action-button record" 
                onClick={() => { setRecordedAudio(null); setActiveStep('speak'); }}
                disabled={isUploading}
              >
                <img src={RedButton} alt="Rouge" />
                <span>Refaire (Rouge)</span>
              </button>
            </div>
          </section>
        )}

        {activeStep === 'thanks' && (
          <section className="screen-frame screen-thanks fade-in-up">
            <div className="top-copy thanks-copy">
              <img className="hero-icon icon-medium" src={Hand} alt="Merci" />
              <h2>Merci !</h2>
              <p>Votre réponse a bien été transmise.</p>
            </div>
            <div className="partner-block">
              <img src={OpenHub} alt="OpenHub" className="openhub" />
              <button type="button" className="ghost-link" onClick={() => setActiveStep('question')}>
                Recommencer
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}