import React from 'react';

export const IntelGrid: React.FC = () => {
  return (
    <section className="intel-grid fade-in-up delay-4">
      {/* 01: Критерии отбора */}
      <article className="data-block">
        <div className="block-header">
          <span className="block-id">01</span>
          <h2 className="block-title">Критерии отбора</h2>
        </div>
        <div className="block-content">
          <ul className="data-list">
            <li>
              <span className="label">Возраст:</span>
              <span className="value">от 2 лет</span>
            </li>
            <li>
              <span className="label">Онлайн:</span>
              <span className="value">от 4 часов/сутки</span>
            </li>
            <li>
              <span className="label">Желание работать:</span>
              <span className="value">Наличие Discord и желание фармить</span>
            </li>
          </ul>
        </div>
      </article>

      {/* 02: Активы корпорации */}
      <article className="data-block">
        <div className="block-header">
          <span className="block-id">02</span>
          <h2 className="block-title">Активы корпорации</h2>
        </div>
        <div className="block-content">
          <ul className="data-list">
            <li>
              <span className="label">Автопарк:</span>
              <span className="value">6 машин элитного класса</span>
            </li>
            <li>
              <span className="label">База:</span>
              <span className="value">Дом рядом с заводами</span>
            </li>
            <li style={{ display: 'block', borderBottom: 'none' }}>
              <span className="label">Заводы:</span>
              <br />&nbsp;&nbsp;- 1. Завод в Палето-Бэй
              <br />&nbsp;&nbsp;- 2. Завод в Ла-меса
            </li>
          </ul>
        </div>
      </article>

      {/* 03: Директивы */}
      <article className="data-block">
        <div className="block-header">
          <span className="block-id">03</span>
          <h2 className="block-title">Директивы</h2>
        </div>
        <div className="block-content">
          <p>
            Никаких извинений. Никаких слабостей. Мы берем то, что принадлежит нам, и устраняем препятствия.
          </p>
        </div>
      </article>
    </section>
  );
};
