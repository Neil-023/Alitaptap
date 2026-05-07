import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import styles from './Certificate.module.css';

const Certificate = ({ score, roomName }) => {
  const navigate = useNavigate();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dateLabel = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className={styles.page}>
      <Confetti
        width={dimensions.width}
        height={dimensions.height}
        numberOfPieces={260}
        recycle={false}
        gravity={0.22}
      />
      <div className={styles.card}>
        <p className={styles.kicker}>Room Secured</p>
        <h1 className={styles.title}>{score}/100</h1>
        <p className={styles.subtitle}>Fire safety score achieved.</p>

        <div className={styles.certificate}>
          <p className={styles.certificateTitle}>Safe Home Certificate</p>
          <div className={styles.certificateBody}>
            <span className={styles.label}>Issued to</span>
            <h2 className={styles.roomName}>{roomName}</h2>
            <div className={styles.divider}></div>
            <div className={styles.metaRow}>
              <span>Date</span>
              <span>{dateLabel}</span>
            </div>
            <div className={styles.metaRow}>
              <span>Inspector</span>
              <span>Alitaptap AI</span>
            </div>
          </div>
        </div>

        <button className={styles.cta} onClick={() => navigate('/')}>Start another scan</button>
      </div>
    </div>
  );
};

export default Certificate;
