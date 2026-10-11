import React from 'react';

interface LeadersViewProps {
  onBack: () => void;
}

export const LeadersView: React.FC<LeadersViewProps> = ({ onBack }) => {
  return (
    <section className="fade-in-up delay-1" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
      <div className="info-wrapper">
        <div className="info-text info-text-top">Owner</div>
        <div className="info-image-container">
          <img src="/images/20261010004050_1.jpg" alt="Akula Tankist Photo" />
        </div>
        <div className="info-text info-text-bottom">Akula Tankist</div>
      </div>

      <div className="info-wrapper">
        <div className="info-text info-text-top">Co-owner</div>
        <div className="info-image-container">
          <img src="/images/sidakk.png" alt="Sidakk Salvatore Photo" />
        </div>
        <div className="info-text info-text-bottom">Sidakk Salvatore</div>
      </div>

      <div className="info-wrapper">
        <div className="info-text info-text-top">DEP OWNER</div>
        <div className="info-image-container">
          <img src="/images/20261010233419_1.jpg" alt="Sontana Terrokilla Photo" />
        </div>
        <div className="info-text info-text-bottom">Sontana Terrokilla</div>
      </div>

      <div className="back-btn-container fade-in-up delay-2">
        <button type="button" onClick={onBack} className="btn-glitch cursor-pointer">
          <span className="btn-text">RETURN</span>
          <span className="btn-decor">_</span>
        </button>
      </div>
    </section>
  );
};
