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

  useEffect(() => {
    if (activeStep !== 'question') {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setQuestionIndex((current) => (current + 1) % questions.length);
    }, QUESTION_ROTATION_MS);

    return () => window.clearInterval(interval);
  }, [activeStep]);

  useEffect(() => {
    if (activeStep !== 'thanks') {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setActiveStep('question');
      setQuestionIndex(0);
    }, THANKS_RESTART_MS);

    return () => window.clearTimeout(timeout);
  }, [activeStep]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
          console.log(`Enregistrement trop court (${duration}ms < ${MIN_RECORDING_DURATION_MS}ms)`);
          alert(`Enregistrement trop court (${(duration / 1000).toFixed(1)}s). Minimum 5 secondes requis.`);
          setActiveStep('speak');
        }
        
        // Fermer le stream du micro
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Erreur accès au micro:', error);
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const currentQuestion = questions[questionIndex];

  const goToNextStep = () => {
    const currentIndex = steps.indexOf(activeStep);
    const nextStep = steps[Math.min(currentIndex + 1, steps.length - 1)];
    setActiveStep(nextStep);
  };

  const handleRecordingButtonClick = () => {
    if (activeStep === 'speak') {
      startRecording();
      setActiveStep('recording');
    } else if (activeStep === 'recording') {
      stopRecording();
    }
  };

  const restartFlow = () => {
    setActiveStep('question');
    setQuestionIndex(0);
  };

  return (
    <main className="app-shell">
      <div className="device-frame">
        {activeStep === 'question' && (
          <section className="screen-frame screen-question fade-in-up">
            <div className="top-copy intro-copy">
              <h1>Aidez un porteur de projet</h1>
              <p>en répondant à l&apos;une de ces question</p>
            </div>

            <div className="question-card" role="status" aria-live="polite">
              <p key={currentQuestion} className="question-text fade-in-up">{currentQuestion}</p>
            </div>

            <div className="screen-actions">
              <div className="hint-block compact">
                <img className="joystick" src={Joystick} alt="Navigation entre les questions" />
                <span>Faites défiler les questions</span>
              </div>

              <div className="button-stack">
                <button type="button" className="action-button confirm pulse" onClick={goToNextStep}>
                  <img src={GreenButton} alt="Valider" />
                  <span>Validez le choix</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {activeStep === 'speak' && (
          <section className="screen-frame screen-speak fade-in-up">
            <div className="top-copy">
              <img className="hero-icon icon-small" src={Whisper} alt="Parlez à l'oreille" />
              <p className="eyebrow">Parlez à l&apos;oreille</p>
            </div>

            <div className="question-card question-card--large">
              <p>{currentQuestion}</p>
            </div>

            <div className="button-stack">
              <button type="button" className="action-button record pulse" onClick={handleRecordingButtonClick}>
                <img src={RedButton} alt="Parler" />
                <span>Appuyez pour enregistrer<br />Appuyez à nouveau pour arrêter</span>
              </button>
            </div>
          </section>
        )}

        {activeStep === 'recording' && (
          <section className="screen-frame screen-recording fade-in-up">
            <div className="top-copy">
              <img className="hero-icon icon-small" src={Whisper} alt="Enregistrement vocal" />
              <p className="eyebrow">Parlez à l&apos;oreille</p>
            </div>

            <div className="recording-panel">
              <div className="waveform" aria-hidden="true">
                {recordingBars.map((bar) => (
                  <span
                    key={bar}
                    className="wave-bar"
                    style={{ animationDelay: `${bar * 0.08}s` }}
                  />
                ))}
              </div>
              <p>Enregistrement en cours...</p>
            </div>

            <div className="button-stack">
              <button type="button" className="action-button record" onClick={handleRecordingButtonClick}>
                <img src={RedButton} alt="Finaliser" />
                <span>Finaliser l'enregistrement</span>
              </button>
            </div>
          </section>
        )}

        {activeStep === 'confirm' && (
          <section className="screen-frame screen-confirm fade-in-up">
            <div className="top-copy top-copy--spacious">
              <h2>Confirmer votre réponse</h2>
              <p>Votre message sera envoyé au porteur de projet.</p>
              {uploadError && (
                <div style={{ 
                  color: '#d32f2f', 
                  marginTop: '10px', 
                  padding: '10px',
                  backgroundColor: 'rgba(211, 47, 47, 0.1)',
                  borderRadius: '4px'
                }}>
                  Erreur: {uploadError}
                </div>
              )}
            </div>

            <div className="button-stack button-stack--split">
              <button 
                type="button" 
                className="action-button confirm pulse" 
                onClick={async () => {
                  if (recordedAudio) {
                    setIsUploading(true);
                    setUploadError(null);
                    
                    try {
                      const formData = new FormData();
                      formData.append('audio', recordedAudio, 'recording.webm');
                      formData.append('question', currentQuestion);
                      
                      const response = await fetch('/api/upload-audio', {
                        method: 'POST',
                        body: formData
                      });

                      if (!response.ok) {
                        const contentType = response.headers.get('content-type');
                        let errorMsg = `Erreur serveur (${response.status})`;
                        
                        try {
                          if (contentType?.includes('application/json')) {
                            const error = await response.json();
                            errorMsg = error.error || errorMsg;
                          } else {
                            const text = await response.text();
                            errorMsg = text || errorMsg;
                          }
                        } catch (e) {
                          console.error('Impossible de parser la réponse erreur:', e);
                        }
                        
                        throw new Error(errorMsg);
                      }

                      const contentType = response.headers.get('content-type');
                      if (!contentType?.includes('application/json')) {
                        throw new Error('Le serveur n\'a pas répondu avec du JSON. Vérifiez que le serveur (npm run server) est lancé sur le port 3001');
                      }

                      const result = await response.json();
                      console.log('✓ Audio sauvegardé:', result.filename);
                      
                      setRecordedAudio(null);
                      setIsUploading(false);
                      goToNextStep(); // Vers 'thanks'
                    } catch (error) {
                      console.error('Erreur upload:', error);
                      setUploadError(error.message);
                      setIsUploading(false);
                    }
                  }
                }}
                disabled={isUploading}
              >
                <img src={GreenButton} alt="Valider la réponse" />
                <span>{isUploading ? 'Enregistrement...' : 'Valider votre réponse'}</span>
              </button>
              <button 
                type="button" 
                className="action-button record" 
                onClick={() => {
                  setRecordedAudio(null);
                  setUploadError(null);
                  setActiveStep('speak');
                }}
                disabled={isUploading}
              >
                <img src={RedButton} alt="Refaire l'enregistrement" />
                <span>Refaire l'enregistrement</span>
              </button>
            </div>
          </section>
        )}

        {activeStep === 'thanks' && (
          <section className="screen-frame screen-thanks fade-in-up">
            <div className="top-copy thanks-copy">
              <img className="hero-icon icon-medium" src={Hand} alt="Merci" />
              <h2>Merci</h2>
              <p>
                Votre réponse a été enregistrée. Elle aidera à améliorer le projet.
              </p>
            </div>

            <div className="partner-block">
              <span>Dispositif réalisé par</span>
              <img src={OpenHub} alt="OpenHub" className="openhub" />
              <p className="partner-note">
                La plateforme technologique de l&apos;UCLouvain, qui accélère l&apos;innovation pour les entreprises et les porteurs de projet.
              </p>
              <button type="button" className="ghost-link" onClick={restartFlow}>
                Recommencer
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
