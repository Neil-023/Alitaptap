import React, { useRef } from 'react';
import { Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './PreCapture.module.css';
import rightImage from '../assets/right.png';
import wrongImage from '../assets/wrong.png';

const PreCapture = ({ onCapture }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const handleOpenCamera = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    if (onCapture) {
      onCapture(file);
    }
    navigate('/loading');
    event.target.value = '';
  };

  return (
    <div className={styles.page}>
      <div className={styles['scan-guide-container']}>
        {/* Text group for Guide title and description */}
        <div className={styles['guide-text-group']}>
          <p className={styles['guide-title']}>Guide</p>
          <h2 className={styles['guide-heading']}>How to get a perfect scan.</h2>
          <p className={styles['guide-description']}>
            Frame the entire corner, keep the lights on, and avoid zooming in too close.
          </p>
        </div>

        {/* Images container for connected side-by-side images with divider */}
        <div className={styles['guide-images-container']}>
          <div className={styles['guide-images-row']}>
            <img
              src={rightImage}
              alt="Wide Angle scan example with green checkmark and guides"
              className={styles['guide-image']}
            />
            <div className={styles['vertical-divider']}></div>
            <img
              src={wrongImage}
              alt="Too Close scan example with power outlet and red X mark"
              className={styles['guide-image']}
            />
          </div>
          {/* Labels below the connected image block */}
          <div className={styles['guide-labels-row']}>
            <p className={`${styles['guide-label']} ${styles['guide-label-correct']}`}>
              ✓ Wide angle, well-lit
            </p>
            <p className={`${styles['guide-label']} ${styles['guide-label-incorrect']}`}>
              ✕ Too close, dark
            </p>
          </div>
        </div>

        {/* Open Camera button */}
        <div className={styles.actionBar}>
          <button className={styles['open-camera-button']} onClick={handleOpenCamera}>
            <Camera size={18} strokeWidth={2.4} />
            I'm ready - Open Camera
          </button>
          <input
            ref={inputRef}
            className={styles.hiddenInput}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
};

export default PreCapture;