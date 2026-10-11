import React, { useState } from 'react';

interface AboutViewProps {
  onBack: () => void;
  onOpenApply?: () => void;
}

const ABOUT_IMAGES = [
  '/images/about_1.jpg',
  '/images/about_2.jpg',
  '/images/about_3.jpg',
  '/images/about_4.jpg',
  '/images/about_5.jpg',
  '/images/about_6.jpg',
];

export const AboutView: React.FC<AboutViewProps> = ({ onBack }) => {
  const [activeImgIdx, setActiveImgIdx] = useState<number | null>(null);

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeImgIdx === null) return;
    setActiveImgIdx((activeImgIdx - 1 + ABOUT_IMAGES.length) % ABOUT_IMAGES.length);
  };

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeImgIdx === null) return;
    setActiveImgIdx((activeImgIdx + 1) % ABOUT_IMAGES.length);
  };

  return (
    <section className="fade-in-up delay-1" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
      <h1 className="section-title" style={{ marginTop: '2rem', marginBottom: '3rem' }}>
        О КОРПОРАЦИИ
      </h1>

      <div className="about-text-block">
        <p>
          <strong>Apathy Corp</strong> — корпорация на сервере Radmir RP, созданная для тех, кто хочет нормально зарабатывать и играть в спокойной обстановке.
        </p>
        <br />
        <p>
          Название «Apathy» — просто про спокойный подход: мы ни с кем не ругаемся, не тратим нервы на ерунду и занимаемся своими делами. У нас есть свои заводы, рабочий транспорт и стабильная скупка ресурсов. Каждый делает свой вклад и сразу получает за это деньги.
        </p>
      </div>

      <div className="about-gallery">
        {ABOUT_IMAGES.map((src, idx) => (
          <div
            key={src}
            className="gallery-item cursor-pointer"
            onClick={() => setActiveImgIdx(idx)}
          >
            <img src={src} alt={`Apathy Corp ${idx + 1}`} />
          </div>
        ))}
      </div>

      <div className="about-text-block fade-in-up delay-2">
        <p>
          Мы не требуем невозможного — главное быть адекватным и иметь желание фармить вместе с нами. Заводы работают, тачки заправлены, выплаты всегда вовремя.
        </p>
        <br />
        <p>
          Если ищешь спокойное место, чтобы поднять денег и поиграть в нормальной компании — заглядывай к нам в Discord, будем рады видеть в составе.
        </p>
      </div>

      <div className="back-btn-container fade-in-up delay-3">
        <a
          href="https://discord.gg/4u6KFRt3f"
          target="_blank"
          rel="noreferrer"
          className="btn-glitch"
          style={{ marginRight: '1rem' }}
        >
          <span className="btn-text">DISCORD</span>
          <span className="btn-decor">_</span>
        </a>
        <button type="button" onClick={onBack} className="btn-glitch cursor-pointer">
          <span className="btn-text">RETURN</span>
          <span className="btn-decor">_</span>
        </button>
      </div>

      {/* Lightbox for About Gallery */}
      {activeImgIdx !== null && (
        <div
          className="lightbox-overlay active"
          onClick={() => setActiveImgIdx(null)}
          style={{ display: 'flex' }}
        >
          <div className="lightbox-close" onClick={() => setActiveImgIdx(null)}>
            &times;
          </div>
          <div className="lightbox-nav lightbox-prev" onClick={prevImg}>
            &#10094;
          </div>
          <img
            src={ABOUT_IMAGES[activeImgIdx]}
            alt="About Corp Enlarge"
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="lightbox-nav lightbox-next" onClick={nextImg}>
            &#10095;
          </div>
        </div>
      )}
    </section>
  );
};
