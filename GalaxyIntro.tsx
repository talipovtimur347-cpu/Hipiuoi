import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface GalaxyIntroProps {
  onEnter: () => void;
}

export const GalaxyIntro: React.FC<GalaxyIntroProps> = ({ onEnter }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Web Audio Procedural Drone Synthesizer
  const toggleAudio = () => {
    if (!isPlayingAudio) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }

        const ctx = audioCtxRef.current;
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 2.5);
        masterGain.connect(ctx.destination);
        masterGainRef.current = masterGain;

        const freqs = [65.41, 98.0, 155.56, 196.0];
        const oscs: OscillatorNode[] = [];

        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(320 + idx * 80, ctx.currentTime);

          oscGain.gain.setValueAtTime(0.08 / (idx + 1), ctx.currentTime);

          osc.connect(filter);
          filter.connect(oscGain);
          oscGain.connect(masterGain);

          osc.start();
          oscs.push(osc);
        });

        oscillatorsRef.current = oscs;
        setIsPlayingAudio(true);
      } catch (e) {
        console.warn('Audio context init warning:', e);
      }
    } else {
      if (masterGainRef.current && audioCtxRef.current) {
        masterGainRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.8);
        setTimeout(() => {
          oscillatorsRef.current.forEach((osc) => {
            try {
              osc.stop();
            } catch {
              // ignore
            }
          });
          oscillatorsRef.current = [];
        }, 900);
      }
      setIsPlayingAudio(false);
    }
  };

  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach((osc) => {
        try {
          osc.stop();
        } catch {
          // ignore
        }
      });
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Canvas starfield & nebula simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const STAR_COUNT = 320;
    const NEBULA_COUNT = 4;

    class Star {
      x: number;
      y: number;
      size: number;
      alpha: number;
      baseAlpha: number;
      speed: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.8 + 0.4;
        this.baseAlpha = Math.random() * 0.7 + 0.2;
        this.alpha = this.baseAlpha;
        this.speed = Math.random() * 0.03 + 0.01;
        const colors = ['255, 255, 255', '200, 225, 255', '160, 200, 255', '230, 240, 255'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update(frame: number) {
        this.alpha = this.baseAlpha + Math.sin(frame * this.speed) * 0.25;
        if (this.alpha < 0.1) this.alpha = 0.1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.fill();

        if (this.size > 1.5 && this.alpha > 0.6) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${this.color}, ${this.alpha * 0.2})`;
          ctx.fill();
        }
      }
    }

    class ShootingStar {
      x = 0;
      y = 0;
      length = 0;
      speed = 0;
      angle = 0;
      vx = 0;
      vy = 0;
      life = 0;
      maxLife = 0;
      active = false;

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * (height * 0.4);
        this.length = Math.random() * 90 + 50;
        this.speed = Math.random() * 14 + 10;
        this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.life = 0;
        this.maxLife = Math.random() * 40 + 30;
        this.active = false;
      }

      trigger() {
        this.reset();
        this.active = true;
      }

      update() {
        if (!this.active) return;
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        if (this.life >= this.maxLife || this.x > width || this.y > height) {
          this.active = false;
        }
      }

      draw() {
        if (!this.active || !ctx) return;
        const progress = this.life / this.maxLife;
        const alpha = Math.sin(progress * Math.PI) * 0.85;
        const tailX = this.x - Math.cos(this.angle) * this.length;
        const tailY = this.y - Math.sin(this.angle) * this.length;

        const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        grad.addColorStop(0.3, `rgba(180, 215, 255, ${alpha * 0.6})`);
        grad.addColorStop(1, 'rgba(180, 215, 255, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }
    }

    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => new Star());
    const shootingStars: ShootingStar[] = [new ShootingStar(), new ShootingStar()];

    const nebulae = Array.from({ length: NEBULA_COUNT }, (_, i) => ({
      x: (width / (NEBULA_COUNT + 1)) * (i + 1) + (Math.random() - 0.5) * 150,
      y: height * 0.5 + (Math.random() - 0.5) * 120,
      radius: Math.random() * 220 + 160,
      hue: Math.random() > 0.5 ? 220 : 200,
      intensity: Math.random() * 0.05 + 0.03,
    }));

    let frame = 0;
    let animId: number;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Draw nebulae
      for (const neb of nebulae) {
        const radGrad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius);
        radGrad.addColorStop(0, `hsla(${neb.hue}, 40%, 65%, ${neb.intensity})`);
        radGrad.addColorStop(0.6, `hsla(${neb.hue}, 50%, 40%, ${neb.intensity * 0.4})`);
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = radGrad;
        ctx.fillRect(neb.x - neb.radius, neb.y - neb.radius, neb.radius * 2, neb.radius * 2);
      }

      // Draw stars
      for (const star of stars) {
        star.update(frame);
        star.draw();
      }

      // Shooting star trigger
      if (Math.random() < 0.008) {
        const inactive = shootingStars.find((s) => !s.active);
        if (inactive) inactive.trigger();
      }

      for (const s of shootingStars) {
        s.update();
        s.draw();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    setMouseOffset({
      x: ((e.clientX - cx) / cx) * 20,
      y: ((e.clientY - cy) / cy) * 16,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen overflow-hidden bg-[#030407] flex flex-col items-center justify-center select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Top Status & Audio Toggle */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 text-xs font-mono text-[#89949F]">
        <div className="flex items-center gap-2 tracking-widest text-[11px] uppercase">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span className="text-white font-bold tracking-wider">APATHY NET</span>
          <span className="text-zinc-500">//</span>
          <span className="text-[#22d3ee]">RADMIR RP</span>
        </div>

        <button
          onClick={toggleAudio}
          type="button"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400/40 text-xs transition-all cursor-pointer backdrop-blur-md"
        >
          {isPlayingAudio ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-white">Звук: Вкл</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-400">Звук: Выкл</span>
            </>
          )}
        </button>
      </div>

      {/* Center Interactive Logo & Title */}
      <div
        style={{
          transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`,
          transition: 'transform 0.1s ease-out',
        }}
        className="relative z-10 text-center flex flex-col items-center max-w-2xl px-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-950/20 text-cyan-300 text-[11px] tracking-widest uppercase mb-6 backdrop-blur-md">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Синхронизированная сеть Radmir RP</span>
        </div>

        <button
          onClick={onEnter}
          type="button"
          className="group relative cursor-pointer outline-none transition-transform duration-300 hover:scale-105"
        >
          <h1
            style={{ fontFamily: "'Space Age', sans-serif" }}
            className="text-5xl sm:text-7xl md:text-8xl tracking-[0.4em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 via-white to-zinc-400 transition-all duration-500 group-hover:tracking-[0.55em] filter drop-shadow-[0_0_35px_rgba(255,255,255,0.25)] pl-[0.4em]"
          >
            APATHY
          </h1>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mt-4 transition-all duration-500 group-hover:w-48 group-hover:via-white" />
        </button>

        <p className="mt-6 text-xs sm:text-sm uppercase tracking-[0.35em] text-zinc-400 font-light max-w-lg leading-relaxed">
          Эмоции мешают бизнесу. Корпорация на Radmir RP.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={onEnter}
            type="button"
            className="btn-apply group flex items-center gap-2.5 px-8 py-3.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-cyan-400 text-white text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.1)] hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] cursor-pointer"
          >
            <span>ВОЙТИ В ПОРТАЛ</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-6 text-[10px] uppercase tracking-[0.25em] text-zinc-600 flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
        <span>Защищенный шлюз синхронизации данных // v2.4</span>
      </div>
    </div>
  );
};
