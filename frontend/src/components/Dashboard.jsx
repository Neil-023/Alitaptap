import React, { useEffect, useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import HazardCard from './HazardCard.jsx';
import BackgroundLights from './BackgroundLights';

const Dashboard = ({
  score,
  overallRisk,
  breakdown,
  hazards,
  roomName,
  classification,
}) => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(hazards[0]?.id || null);
  const [fixedIds, setFixedIds] = useState([]);
  const [showInfoModal, setShowInfoModal] = useState(false);


  useEffect(() => {
    setExpandedId(hazards[0]?.id || null);
    setFixedIds([]);
  }, [hazards]);

  const scoreColor = score >= 80 ? '#ff6b6b' : score >= 50 ? '#f6b44a' : '#46d39a';
  const computedLabel = score >= 80 ? 'High Risk' : score >= 50 ? 'Moderate Risk' : 'Low Risk';
  const riskLabel = classification || computedLabel;

  const toggleFixed = (id) => {
    setFixedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const closeInfoModal = () => {
    setShowInfoModal(false);
  };

  return (
    <BackgroundLights>
      <div className={styles.page}>
        <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.scoreBlock}>
            <p className={styles.kicker}>Result</p>
            <div className={styles.scoreCircle} style={{ '--score-color': scoreColor }}>
              <p className={styles.scoreValue}>{score}/100</p>
              <p className={styles.scoreLabel}>Overall score</p>
            </div>
          </div>
          <div className={styles.riskBlock}>
            <div className={styles.riskHeader}>
              <p className={styles.riskTitle}>Overall Risk</p>
              {roomName ? <span className={styles.roomTag}>{roomName}</span> : null}
            </div>
            <p className={styles.riskLevel} style={{ color: scoreColor }}>
              {riskLabel}
            </p>
            <p className={styles.riskText}>{overallRisk || 'No summary provided.'}</p>
          </div>
        </header>

        <section className={styles.breakdown}>
          <div className={styles.sectionHeader}>
            <h2>Breakdown</h2>
            <button
              type="button"
              className={styles.infoBadge}
              onClick={() => setShowInfoModal(true)}
              aria-label="Open breakdown explanation"
            >
              <Info size={14} strokeWidth={2} />
              
            </button>
          </div>
          <div className={styles.breakdownRows}>
            {breakdown.map((item) => (
              <div className={styles.breakdownRow} key={item.label}>
                <span className={styles.breakdownLabel}>{item.label}</span>
                <div className={styles.bar}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${item.value * 100}%`, backgroundColor: item.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.checklist}>
          <div className={styles.sectionHeader}>
            <h2>Checklist</h2>
            <span className={styles.hazardCount}>{hazards.length} Hazards</span>
          </div>
          <div className={styles.hazardList}>
            {hazards.length === 0 ? (
              <p className={styles.emptyState}>No hazards detected.</p>
            ) : (
              hazards.map((hazard) => (
                <HazardCard
                  key={hazard.id}
                  hazard={hazard}
                  expanded={expandedId === hazard.id}
                  fixed={fixedIds.includes(hazard.id)}
                  onToggleExpanded={() =>
                    setExpandedId((current) => (current === hazard.id ? null : hazard.id))
                  }
                  onToggleFixed={() => toggleFixed(hazard.id)}
                />
              ))
            )}
          </div>
        </section>

        <button
          type="button"
          className={styles.scanAgainButton}
          onClick={() => navigate('/precapture')}
        >
          Scan Again
        </button>
        </div>

        {showInfoModal ? (
          <div className={styles.modalOverlay} onClick={closeInfoModal}>
            <div
              className={styles.infoModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="breakdown-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <h3 id="breakdown-modal-title" className={styles.modalTitle}>Breakdown</h3>
              <div className={styles.modalBody}>
                <p>Stuff: Flammable Materials Present</p>
                <p>Power: Electrical/Gas Condition</p>
                <p>Space: Proximity of Stuff to Power</p>
                <p>Stuff: Clear way to doors/windows</p>
              </div>
              <div className={styles.modalWarning}>
                <AlertTriangle size={28} strokeWidth={2.5} />
                <span>Higher Number = WORSE</span>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={closeInfoModal}
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </BackgroundLights>
  );
};

export default Dashboard;
