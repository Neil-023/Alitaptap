// src/components/Welcome.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import logo from '../assets/logo.png'; // Make sure this path points to your actual logo
import BackgroundLights from './BackgroundLights';
import styles from './Welcome.module.css';

export default function Welcome() {
  const navigate = useNavigate();

  const handleStartScan = () => {
    navigate('/precapture');
  };

  return (
    <BackgroundLights>
      <div className={styles.container}>

      {/* 2. Logo and Titles */}
      <div className={styles.content}>
        <img src={logo} alt="Alitaptap Logo" className={styles.logo} />
        <h1 className={styles.title}>alitaptap</h1>
        <p className={styles.subtitle}>AI-Powered Fire Safety in Your Pocket.</p>
      </div>

      {/* 3. The Big Bottom Radial Glow */}
      <div className={styles.bottomGlow}></div>

        {/* 4. The Action Button */}
        <div className={styles.buttonWrapper}>
          <button className={styles.scanButton} onClick={handleStartScan}>
            <Camera size={24} strokeWidth={2.5} />
            START ROOM SCAN
          </button>
        </div>
      </div>

    </BackgroundLights>
  );
}