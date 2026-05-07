import React from 'react';
import styles from './BackgroundLights.module.css';

// Generate 25 random fireflies/lights
const fireflies = Array.from({ length: 40 }).map((_, i) => ({
  id: i,
  top: Math.random() * 100, // Random Y position (0-100%)
  left: Math.random() * 100, // Random X position (0-100%)
  size: 2 + Math.random() * 3, // Tiny sizes (2px to 5px)
  duration: 8 + Math.random() * 10, // How slow they move (8s to 18s)
  fadeDuration: 2 + Math.random() * 3, // How fast they blink (2s to 5s)
  delay: Math.random() * -20, // Start at different times
}));

export default function BackgroundLights({ children }) {
  return (
    <div className={styles.container}>
      {/* The Moving, Fading Background Lights */}
      <div className={styles.lightsWrapper}>
        {fireflies.map((firefly) => (
          <div
            key={firefly.id}
            className={styles.light}
            style={{
              top: `${firefly.top}%`,
              left: `${firefly.left}%`,
              width: `${firefly.size}px`,
              height: `${firefly.size}px`,
              '--duration': `${firefly.duration}s`,
              '--fade-duration': `${firefly.fadeDuration}s`,
              '--delay': `${firefly.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Content overlay: place page UI on top of the lights */}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
