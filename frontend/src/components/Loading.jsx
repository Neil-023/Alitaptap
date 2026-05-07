import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Loading.module.css';
import BackgroundLights from './BackgroundLights';

const MESSAGES = [
  'Analyzing spatial data...',
  'Detecting heat sources...',
  'Calculating flammability score...',
];

const Loading = ({ nextPath = '/dashboard', onAnalyze, errorMessage }) => {
  const navigate = useNavigate();
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState(errorMessage || '');

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((current) => (current + 1) % MESSAGES.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!onAnalyze) {
      return undefined;
    }

    let isActive = true;

    const runAnalysis = async () => {
      try {
        await onAnalyze();
        if (isActive) {
          navigate(nextPath);
        }
      } catch (err) {
        if (isActive) {
          const message = err instanceof Error ? err.message : 'Unable to analyze image.';
          setError(message);
        }
      }
    };

    runAnalysis();

    return () => {
      isActive = false;
    };
  }, [navigate, nextPath, onAnalyze]);

  useEffect(() => {
    setError(errorMessage || '');
  }, [errorMessage]);

  return (
    <BackgroundLights>
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.spinner} aria-hidden="true"></div>
          <div className={styles.pulse} aria-hidden="true"></div>
          <h1 className={styles.title}>Processing Scan</h1>
          <p className={styles.status} aria-live="polite">
            {error ? 'We hit a problem while analyzing your scan.' : MESSAGES[messageIndex]}
          </p>
          {error ? (
            <div className={styles.error}>
              <p className={styles.errorText}>{error}</p>
              <button
                type="button"
                className={styles.errorButton}
                onClick={() => navigate('/precapture')}
              >
                Back to guide
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </BackgroundLights>
  );
};

export default Loading;
