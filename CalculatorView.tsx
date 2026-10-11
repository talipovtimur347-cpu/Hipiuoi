import React, { useState } from 'react';

interface Resource {
  id: string;
  name: string;
  price: number;
  max: number;
}

const RESOURCES: Resource[] = [
  { id: 'stone', name: 'Камень', price: 5000, max: 1000 },
  { id: 'wood', name: 'Дерево', price: 2500, max: 1000 },
  { id: 'red_flowers', name: 'Красные цветы', price: 1500, max: 1000 },
  { id: 'blue_flowers', name: 'Синие цветы', price: 1400, max: 1000 },
  { id: 'pink_flowers', name: 'Розовые цветы', price: 1500, max: 1000 },
];

interface CalculatorViewProps {
  onBack: () => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({ onBack }) => {
  const [values, setValues] = useState<Record<string, number>>({
    stone: 0,
    wood: 0,
    red_flowers: 0,
    blue_flowers: 0,
    pink_flowers: 0,
  });

  const handleChange = (id: string, val: number) => {
    const num = isNaN(val) ? 0 : Math.max(0, val);
    setValues((prev) => ({ ...prev, [id]: num }));
  };

  const handleReset = () => {
    setValues({
      stone: 0,
      wood: 0,
      red_flowers: 0,
      blue_flowers: 0,
      pink_flowers: 0,
    });
  };

  const formatMoney = (num: number) => {
    return num.toLocaleString('ru-RU') + ' $';
  };

  const grandTotal = RESOURCES.reduce((acc, res) => {
    return acc + (values[res.id] || 0) * res.price;
  }, 0);

  return (
    <section className="fade-in-up delay-1" style={{ maxWidth: '850px', margin: '0 auto', padding: '0 1rem' }}>
      <h1 className="section-title" style={{ marginBottom: '3rem', marginTop: '2rem' }}>
        КАЛЬКУЛЯТОР ДОХОДА
      </h1>

      <div className="calc-wrapper">
        <div id="calc-items">
          {RESOURCES.map((res) => {
            const currentVal = values[res.id] || 0;
            const rowTotal = currentVal * res.price;

            return (
              <div key={res.id} className="calc-row">
                <div className="res-name">
                  {res.name}
                  <span className="res-price">{formatMoney(res.price)} / шт.</span>
                </div>
                <div className="res-slider-container">
                  <input
                    type="range"
                    min="0"
                    max={res.max}
                    value={currentVal}
                    onChange={(e) => handleChange(res.id, parseInt(e.target.value) || 0)}
                  />
                </div>
                <input
                  type="number"
                  min="0"
                  value={currentVal === 0 ? '' : currentVal}
                  placeholder="0"
                  onChange={(e) => handleChange(res.id, parseInt(e.target.value) || 0)}
                />
                <div className="res-total">{formatMoney(rowTotal)}</div>
              </div>
            );
          })}
        </div>

        <div className="calc-total-wrapper">
          <div className="total-label">ОБЩИЙ ДОХОД</div>
          <div className="total-value">{formatMoney(grandTotal)}</div>
        </div>

        <div className="reset-btn-container">
          <button
            type="button"
            className="btn-glitch"
            onClick={handleReset}
            style={{ cursor: 'pointer', background: 'transparent' }}
          >
            <span className="btn-text">СБРОСИТЬ</span>
            <span className="btn-decor">_</span>
          </button>
        </div>
      </div>
    </section>
  );
};
