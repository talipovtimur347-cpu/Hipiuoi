import React, { useState, useEffect } from 'react';
import { GalaxyIntro } from './components/GalaxyIntro';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { IntelGrid } from './components/IntelGrid';
import { FleetSection } from './components/FleetSection';
import { ApplyModal } from './components/ApplyModal';
import { CalculatorView } from './components/CalculatorView';
import { LeadersView } from './components/LeadersView';
import { AboutView } from './components/AboutView';
import { StaffSyncModal } from './components/StaffSyncModal';
import { fetchApplicationsFromFirestore } from './lib/firebase';
import { CandidateApplication } from './types';

export default function App() {
  const [showIntro, setShowIntro] = useState(false);
  const [currentTab, setCurrentTab] = useState<'home' | 'calc' | 'leaders' | 'about'>('home');
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [pendingAppsCount, setPendingAppsCount] = useState<number>(0);

  // Live count of applications still waiting for an HR decision
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const apps = await fetchApplicationsFromFirestore();
        if (!cancelled) setPendingAppsCount(apps.filter((a) => a.status === 'pending').length);
      } catch {
        try {
          const res = await fetch('/api/applications?status=pending');
          const data = await res.json();
          if (!cancelled && data.success && typeof data.count === 'number') {
            setPendingAppsCount(data.count);
          }
        } catch {
          /* badge stays at its last value */
        }
      }
    };
    load();
    const timer = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  // IntersectionObserver for .fade-in-up reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );

    document.querySelectorAll('.fade-in-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [currentTab, showIntro]);

  // Spawn random glitch background blocks
  useEffect(() => {
    const glitchContainer = document.getElementById('glitch-blocks');
    if (!glitchContainer) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const block = document.createElement('div');
        block.className = 'glitch-block';
        const size = Math.random() * 8 + 2;
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        block.style.width = size + 'px';
        block.style.height = size + 'px';
        block.style.top = top + 'vh';
        block.style.left = left + 'vw';
        glitchContainer.appendChild(block);
        setTimeout(() => {
          if (glitchContainer.contains(block)) {
            glitchContainer.removeChild(block);
          }
        }, 200);
      }
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const handleApplicationCreated = () => {
    setPendingAppsCount((prev) => prev + 1);
  };

  if (showIntro) {
    return <GalaxyIntro onEnter={() => setShowIntro(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#030407] text-[#89949F] relative overflow-x-hidden flex flex-col font-mono">
      {/* Background Video & CRT/Scanline Layers */}
      <video
        className="video-bg pointer-events-none"
        src="/bg-video.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="crt-overlay" />
      <div className="noise-bg" />
      <div className="grid-bg" />
      <div className="glitch-blocks" id="glitch-blocks" />

      {/* Main Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onBackToIntro={() => setShowIntro(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenApply={() => setIsApplyOpen(true)}
      />

      {/* Dynamic View based on currentTab */}
      <main className="container flex-1">
        {currentTab === 'home' && (
          <div>
            <HeroSection
              onOpenApply={() => setIsApplyOpen(true)}
              pendingCount={pendingAppsCount}
            />
            <IntelGrid />
            <FleetSection />
          </div>
        )}

        {currentTab === 'calc' && (
          <CalculatorView onBack={() => setCurrentTab('home')} />
        )}

        {currentTab === 'leaders' && (
          <LeadersView onBack={() => setCurrentTab('home')} />
        )}

        {currentTab === 'about' && (
          <AboutView
            onBack={() => setCurrentTab('home')}
            onOpenApply={() => setIsApplyOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="sys-footer mt-auto py-8 border-t border-white/5 text-center text-[10px] tracking-[0.25em] text-zinc-600 uppercase font-['Bruno_Ace_SC',sans-serif]">
        <div>APATHY CORP &copy; 2026 // RADMIR RP // СИСТЕМА ПРИЕМА ЗАЯВОК</div>
      </footer>

      {/* Recruitment Application Modal */}
      <ApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onApplicationCreated={handleApplicationCreated}
      />

      {/* Staff Sync Gateway Modal */}
      <StaffSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
}
