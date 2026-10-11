import React, { useState } from 'react';

interface GalleryItemData {
  src: string;
  title: string;
}

const FLEET_ITEMS: GalleryItemData[] = [
  { src: '/images/trans_1.png', title: 'Mers Runner' },
  { src: '/images/trans_2.png', title: 'Mers v250 W447' },
  { src: '/images/trans_3.png', title: 'Dogge Run 1500 TRX' },
  { src: '/images/trans_4.png', title: 'Mers v250 W447' },
];

const FACTORY_ITEMS: GalleryItemData[] = [
  { src: '/images/factory_1_crop.png', title: 'Палето-бей' },
  { src: '/images/factory_2_crop.png', title: 'Ла-меса' },
];

const HQ_ITEMS: GalleryItemData[] = [
  { src: '/images/hq_crop.png', title: 'Чумаш' },
];

const ALL_GALLERY = [...FLEET_ITEMS, ...FACTORY_ITEMS, ...HQ_ITEMS];

export const FleetSection: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const openLightbox = (item: GalleryItemData) => {
    const idx = ALL_GALLERY.findIndex((g) => g.src === item.src);
    setActiveIdx(idx >= 0 ? idx : 0);
  };

  const closeLightbox = () => setActiveIdx(null);

  const prevItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx === null) return;
    setActiveIdx((activeIdx - 1 + ALL_GALLERY.length) % ALL_GALLERY.length);
  };

  const nextItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx === null) return;
    setActiveIdx((activeIdx + 1) % ALL_GALLERY.length);
  };

  const currentItem = activeIdx !== null ? ALL_GALLERY[activeIdx] : null;

  return (
    <>
      {/* 1. Транспорт Корпорации */}
      <section className="gallery-section fade-in-up delay-5">
        <h2 className="section-title">Транспорт Корпорации</h2>
        <div className="gallery-grid">
          {FLEET_ITEMS.map((item) => (
            <div
              key={item.src}
              className="gallery-item cursor-pointer"
              onClick={() => openLightbox(item)}
            >
              <img src={item.src} alt={item.title} />
              <div className="car-title">{item.title}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Местоположения заводов */}
      <section
        className="gallery-section fade-in-up delay-6"
        style={{ marginTop: '3rem' }}
      >
        <h2 className="section-title">Местоположения заводов</h2>
        <div
          className="gallery-grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          }}
        >
          {FACTORY_ITEMS.map((item) => (
            <div
              key={item.src}
              className="gallery-item cursor-pointer"
              onClick={() => openLightbox(item)}
            >
              <img src={item.src} alt={item.title} />
              <div className="car-title">{item.title}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Штаб квартира-Хранилище */}
      <section
        className="gallery-section fade-in-up delay-6"
        style={{ marginTop: '3rem', marginBottom: '3rem' }}
      >
        <h2 className="section-title">Штаб квартира-Хранилище</h2>
        <div
          className="gallery-grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          }}
        >
          {HQ_ITEMS.map((item) => (
            <div
              key={item.src}
              className="gallery-item cursor-pointer"
              onClick={() => openLightbox(item)}
            >
              <img src={item.src} alt={item.title} />
              <div className="car-title">{item.title}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Native Lightbox Modal matching script.js */}
      {currentItem && (
        <div
          className="lightbox-overlay active"
          onClick={closeLightbox}
          style={{ display: 'flex' }}
        >
          <div className="lightbox-close" onClick={closeLightbox}>
            &times;
          </div>
          <div className="lightbox-nav lightbox-prev" onClick={prevItem}>
            &#10094;
          </div>
          <img
            src={currentItem.src}
            alt={currentItem.title}
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="lightbox-nav lightbox-next" onClick={nextItem}>
            &#10095;
          </div>
        </div>
      )}
    </>
  );
};
