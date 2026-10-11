import React from 'react';

interface HeroSectionProps {
  onOpenApply: () => void;
  pendingCount?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenApply }) => {
  return (
    <section className="hero">
      <div className="flex justify-center w-full mb-6 fade-in-up delay-1">
        <h1
          style={{ fontFamily: "'Space Age', sans-serif" }}
          className="glitch-title"
        >
          Apathy
        </h1>
      </div>
      <p className="subtitle">
        Эмоции мешают бизнесу. Корпорация на Radmir RP.
      </p>
      <div
        className="hero-actions fade-in-up delay-3"
        style={{
          display: 'flex',
          gap: '1.5rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <a
          href="https://discord.gg/4u6KFRt3f"
          className="btn-glitch"
          target="_blank"
          rel="noreferrer"
        >
          <span className="btn-text">DISCORD LINK</span>
          <span className="btn-decor">_</span>
        </a>
        <button
          type="button"
          onClick={onOpenApply}
          className="btn-glitch btn-apply"
        >
          <span className="btn-text">ОТПРАВИТЬ ЗАЯВКУ</span>
          <span className="btn-decor">_</span>
        </button>
      </div>
    </section>
  );
};
