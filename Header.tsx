import React from 'react';

interface HeaderProps {
  currentTab: 'home' | 'calc' | 'leaders' | 'about';
  onSelectTab: (tab: 'home' | 'calc' | 'leaders' | 'about') => void;
  onBackToIntro?: () => void;
  onOpenSyncModal?: () => void;
  onOpenApply?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenSyncModal,
  onOpenApply,
}) => {
  return (
    <header className="sys-header">
      {currentTab === 'home' ? (
        <div style={{ opacity: 0, pointerEvents: 'none' }}>SPACER</div>
      ) : (
        <div>
          <button
            onClick={() => onSelectTab('home')}
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              opacity: 0.7,
              fontFamily: 'inherit',
              transition: 'opacity 0.3s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '0.7')}
          >
            &lt; BACK
          </button>
        </div>
      )}

      <nav className="top-nav">
        <button
          onClick={() => onSelectTab('about')}
          type="button"
          className={`nav-link cursor-pointer ${currentTab === 'about' ? 'active' : ''}`}
        >
          О APATHY
        </button>
        <button
          onClick={() => onSelectTab('calc')}
          type="button"
          className={`nav-link cursor-pointer ${currentTab === 'calc' ? 'active' : ''}`}
        >
          КАЛЬКУЛЯТОР
        </button>
        <button
          onClick={() => onSelectTab('leaders')}
          type="button"
          className={`nav-link cursor-pointer ${currentTab === 'leaders' ? 'active' : ''}`}
        >
          ЛИДЕРЫ
        </button>
        {onOpenApply && (
          <button
            onClick={onOpenApply}
            type="button"
            className="nav-link cursor-pointer"
          >
            ЗАЯВКА
          </button>
        )}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {onOpenSyncModal && (
          <button
            onClick={onOpenSyncModal}
            type="button"
            title="Синхронизация заявок"
            style={{
              background: 'transparent',
              border: '1px solid rgba(115, 130, 153, 0.3)',
              borderRadius: '4px',
              color: '#738299',
              fontSize: '0.65rem',
              letterSpacing: '1px',
              padding: '0.2rem 0.5rem',
              cursor: 'pointer',
            }}
          >
            SYNC
          </button>
        )}
        <div className="sys-status">
          STATUS: <span className="accent-text">ONLINE</span>
        </div>
      </div>
    </header>
  );
};
