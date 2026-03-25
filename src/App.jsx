import React, { useEffect, useState } from 'react';
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

export default function App() {
  const [activeStep, setActiveStep] = useState(steps[0]);
  const [questionIndex, setQuestionIndex] = useState(0);

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

  const currentQuestion = questions[questionIndex];

  const goToNextStep = () => {
    const currentIndex = steps.indexOf(activeStep);
    const nextStep = steps[Math.min(currentIndex + 1, steps.length - 1)];
    setActiveStep(nextStep);
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
              <button type="button" className="action-button record pulse" onClick={goToNextStep}>
                <img src={RedButton} alt="Parler" />
                <span>Appuyer une fois pour parler</span>
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
              <button type="button" className="action-button record" onClick={goToNextStep}>
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
            </div>

            <div className="button-stack button-stack--split">
              <button type="button" className="action-button confirm pulse" onClick={goToNextStep}>
                <img src={GreenButton} alt="Valider la réponse" />
                <span>Valider votre réponse</span>
              </button>
              <button type="button" className="action-button record" onClick={() => setActiveStep('speak')}>
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
