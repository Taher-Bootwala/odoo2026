'use client';

import { useEffect, useRef, useState } from 'react';

const STATUS_MESSAGES = [
  'Discovering assets...',
  'Scanning network nodes...',
  'Mapping connections...',
  'Loading IT infrastructure...',
  'Synchronizing data...',
  'Building dashboard...',
  'Almost ready...'
];

export default function IntroOverlay() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [statusText, setStatusText] = useState(STATUS_MESSAGES[0]);
  const [progressWidth, setProgressWidth] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if intro was already played in this session to prevent annoyance
    if (sessionStorage.getItem('introPlayed')) {
      setIsVisible(false);
      document.getElementById('dashboard-wrapper')?.classList.add('dashboard-visible');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ---- Config ----
    const INTRO_DURATION = 5500; // ms total
    const PULSE_INTERVAL = 600;
    const MAX_PULSES = 7;
    const NODE_SPAWN_DELAY = 300;
    const COLORS = {
      bg: '#1a2d40',
      bgGrad1: '#0f1f2e',
      bgGrad2: '#1e3a52',
      pulse: 'rgba(107, 150, 183, ',
      node: '#6B96B7',
      nodeGlow: 'rgba(107, 150, 183, 0.3)',
      line: 'rgba(107, 150, 183, ',
      text: '#d5e1ed',
      accent: '#8AAFC9',
      particle: 'rgba(138, 175, 201, '
    };

    const NODE_ICONS = [
      (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
        ctx.strokeRect(x - s, y - s * 0.7, s * 2, s * 1.2);
        ctx.beginPath(); ctx.moveTo(x - s * 0.4, y + s * 0.8); ctx.lineTo(x + s * 0.4, y + s * 0.8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y + s * 0.5); ctx.lineTo(x, y + s * 0.8); ctx.stroke();
      },
      (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
        ctx.strokeRect(x - s, y - s, s * 2, s * 0.8);
        ctx.strokeRect(x - s, y + s * 0.1, s * 2, s * 0.8);
        ctx.beginPath(); ctx.arc(x - s * 0.5, y - s * 0.6, s * 0.15, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x - s * 0.5, y + s * 0.5, s * 0.15, 0, Math.PI * 2); ctx.fill();
      },
      (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
        ctx.beginPath(); ctx.arc(x, y, s * 0.9, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, s * 0.4, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, s * 0.12, 0, Math.PI * 2); ctx.fill();
      },
      (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
        ctx.strokeRect(x - s, y - s * 0.5, s * 2, s);
        const dotR = s * 0.12;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath(); ctx.arc(x - s * 0.6 + i * s * 0.4, y, dotR, 0, Math.PI * 2); ctx.fill();
        }
      },
      (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
        ctx.strokeRect(x - s, y - s, s * 2, s * 0.7);
        ctx.strokeRect(x - s, y - s * 0.1, s * 2, s * 0.7);
        ctx.beginPath(); ctx.moveTo(x - s * 0.6, y - s * 0.65); ctx.lineTo(x, y - s * 0.65); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - s * 0.6, y + s * 0.25); ctx.lineTo(x, y + s * 0.25); ctx.stroke();
      },
      (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
        ctx.beginPath(); ctx.arc(x, y, s * 0.15, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x, y - s * 0.1, s * 0.5, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y - s * 0.1, s * 0.8, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y + s * 0.15); ctx.lineTo(x, y + s * 0.8); ctx.stroke();
      },
      (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
        ctx.strokeRect(x - s * 0.6, y - s * 1.1, s * 1.2, s * 0.6);
        ctx.strokeRect(x - s, y - s * 0.4, s * 2, s * 0.8);
        ctx.strokeRect(x - s * 0.6, y + s * 0.2, s * 1.2, s * 0.7);
      },
      (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
        const r = s * 0.15;
        ctx.beginPath();
        ctx.moveTo(x - s * 0.5 + r, y - s);
        ctx.arcTo(x + s * 0.5, y - s, x + s * 0.5, y + s, r);
        ctx.arcTo(x + s * 0.5, y + s, x - s * 0.5, y + s, r);
        ctx.arcTo(x - s * 0.5, y + s, x - s * 0.5, y - s, r);
        ctx.arcTo(x - s * 0.5, y - s, x + s * 0.5, y - s, r);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - s * 0.2, y + s * 0.7); ctx.lineTo(x + s * 0.2, y + s * 0.7); ctx.stroke();
      }
    ];

    let w = window.innerWidth;
    let h = window.innerHeight;
    let cx = w / 2;
    let cy = h / 2;
    canvas.width = w;
    canvas.height = h;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      cx = w / 2;
      cy = h / 2;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', resize);

    // Classes
    class Pulse {
      birth: number; x: number; y: number; maxRadius: number; speed: number;
      constructor(time: number) {
        this.birth = time; this.x = cx; this.y = cy; this.maxRadius = Math.max(w, h) * 0.8; this.speed = 280;
      }
      get radius() { return ((performance.now() - this.birth) / 1000) * this.speed; }
      get alive() { return this.radius < this.maxRadius; }
      draw(ctx: CanvasRenderingContext2D) {
        const r = this.radius; const alpha = Math.max(0, 1 - r / this.maxRadius) * 0.45;
        ctx.beginPath(); ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = COLORS.pulse + alpha + ')'; ctx.lineWidth = 2; ctx.stroke();
        if (r > 20) {
          ctx.beginPath(); ctx.arc(this.x, this.y, r - 8, 0, Math.PI * 2);
          ctx.strokeStyle = COLORS.pulse + (alpha * 0.3) + ')'; ctx.lineWidth = 6; ctx.stroke();
        }
      }
    }

    class Node {
      x: number; y: number; targetX: number; targetY: number; size: number; delay: number; birth: number;
      iconIdx: number; phase: number; floatAmp: number; opacity: number; scale: number; glowPulse: number;
      constructor(x: number, y: number, delay: number, iconIdx: number) {
        this.x = x; this.y = y; this.targetX = x; this.targetY = y; this.size = 12 + Math.random() * 6;
        this.delay = delay; this.birth = performance.now() + delay; this.iconIdx = iconIdx % NODE_ICONS.length;
        this.phase = Math.random() * Math.PI * 2; this.floatAmp = 2 + Math.random() * 3;
        this.opacity = 0; this.scale = 0; this.glowPulse = Math.random() * Math.PI * 2;
      }
      get visible() { return performance.now() > this.birth; }
      update(dt: number) {
        if (!this.visible) return;
        const age = (performance.now() - this.birth) / 1000;
        this.opacity = Math.min(1, age / 0.5);
        this.scale = Math.min(1, age / 0.4);
        if (age < 0.4) this.scale = 1 + (1 - age / 0.4) * 0.3 * Math.sin(age * 20);
        this.phase += dt * 1.2;
        this.y = this.targetY + Math.sin(this.phase) * this.floatAmp;
        this.x = this.targetX + Math.cos(this.phase * 0.7) * this.floatAmp * 0.5;
        this.glowPulse += dt * 2;
      }
      draw(ctx: CanvasRenderingContext2D) {
        if (!this.visible || this.opacity <= 0) return;
        ctx.save(); ctx.globalAlpha = this.opacity; ctx.translate(this.x, this.y); ctx.scale(this.scale, this.scale);
        const glowAlpha = 0.15 + Math.sin(this.glowPulse) * 0.08;
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 2.5);
        grd.addColorStop(0, `rgba(107, 150, 183, ${glowAlpha})`); grd.addColorStop(1, 'rgba(107, 150, 183, 0)');
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(0, 0, this.size * 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(15, 31, 46, 0.85)'; ctx.strokeStyle = COLORS.node; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 0, this.size, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = COLORS.accent; ctx.fillStyle = COLORS.accent; ctx.lineWidth = 1;
        NODE_ICONS[this.iconIdx](ctx, 0, 0, this.size * 0.5);
        ctx.restore();
      }
    }

    class Connection {
      a: Node; b: Node; birth: number; progress: number;
      constructor(nodeA: Node, nodeB: Node, delay: number) {
        this.a = nodeA; this.b = nodeB; this.birth = performance.now() + delay; this.progress = 0;
      }
      get visible() { return performance.now() > this.birth; }
      update() {
        if (!this.visible) return;
        this.progress = Math.min(1, ((performance.now() - this.birth) / 1000) / 0.6);
      }
      draw(ctx: CanvasRenderingContext2D) {
        if (!this.visible || this.progress <= 0 || !this.a.visible || !this.b.visible) return;
        const ax = this.a.x, ay = this.a.y, bx = this.b.x, by = this.b.y;
        const ex = ax + (bx - ax) * this.progress, ey = ay + (by - ay) * this.progress;
        ctx.save(); ctx.globalAlpha = Math.min(this.a.opacity, this.b.opacity) * 0.4;
        ctx.strokeStyle = COLORS.node; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.stroke();
        if (this.progress > 0.3) {
          const t = ((performance.now() / 1500) % 1);
          const px = ax + (bx - ax) * t, py = ay + (by - ay) * t;
          ctx.setLineDash([]); ctx.fillStyle = COLORS.accent; ctx.globalAlpha = 0.8;
          ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
    }

    class Particle {
      x: number = 0; y: number = 0; vx: number = 0; vy: number = 0; size: number = 0;
      alpha: number = 0; life: number = 0; age: number = 0; twinkleSpeed: number = 0;
      constructor() { this.reset(); }
      reset() {
        const angle = Math.random() * Math.PI * 2; const dist = Math.random() * Math.max(w, h) * 0.5;
        this.x = cx + Math.cos(angle) * dist; this.y = cy + Math.sin(angle) * dist;
        this.vx = (Math.random() - 0.5) * 0.5; this.vy = (Math.random() - 0.5) * 0.5;
        this.size = 1 + Math.random() * 2; this.alpha = 0.1 + Math.random() * 0.3;
        this.life = 3 + Math.random() * 5; this.age = 0; this.twinkleSpeed = 1 + Math.random() * 3;
      }
      update(dt: number) { this.x += this.vx; this.y += this.vy; this.age += dt; if (this.age > this.life) this.reset(); }
      draw(ctx: CanvasRenderingContext2D) {
        const flicker = 0.5 + 0.5 * Math.sin(this.age * this.twinkleSpeed);
        ctx.fillStyle = COLORS.particle + (this.alpha * flicker) + ')';
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
      }
    }

    let pulses: Pulse[] = [];
    let nodes: Node[] = [];
    let connections: Connection[] = [];
    let particles: Particle[] = [];
    let startTime = performance.now();
    let currentStatusIdx = 0;
    let lastPulse = 0;
    let pulseCount = 0;

    const drawGrid = (alpha: number) => {
      ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = 'rgba(107, 150, 183, 0.06)'; ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.restore();
    };

    const count = 14; const minDist = 100; const maxDist = Math.min(w, h) * 0.4;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const ring = i < 6 ? 0.4 + Math.random() * 0.2 : 0.7 + Math.random() * 0.2;
      const dist = minDist + (maxDist - minDist) * ring;
      nodes.push(new Node(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, i * NODE_SPAWN_DELAY + Math.random() * 200, i));
    }
    for (let i = 1; i < nodes.length; i++) {
      const target = Math.floor(Math.random() * i);
      connections.push(new Connection(nodes[i], nodes[target], nodes[i].delay + 400));
      if (Math.random() > 0.6 && i > 2) {
        const extra = Math.floor(Math.random() * i);
        if (extra !== target) connections.push(new Connection(nodes[i], nodes[extra], nodes[i].delay + 700));
      }
    }
    for (let i = 0; i < 60; i++) particles.push(new Particle());

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const dt = 1 / 60;
      
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
      bgGrad.addColorStop(0, COLORS.bgGrad2); bgGrad.addColorStop(1, COLORS.bgGrad1);
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);
      
      drawGrid(Math.min(1, elapsed / 1000));
      
      if (elapsed - lastPulse > PULSE_INTERVAL && pulseCount < MAX_PULSES) {
        pulses.push(new Pulse(performance.now())); lastPulse = elapsed; pulseCount++;
      }
      
      pulses = pulses.filter(p => p.alive);
      pulses.forEach(p => p.draw(ctx));
      connections.forEach(c => { c.update(); c.draw(ctx); });
      particles.forEach(p => { p.update(dt); p.draw(ctx); });
      nodes.forEach(n => { n.update(dt); n.draw(ctx); });
      
      const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
      const centerAlpha = 0.15 + Math.sin(elapsed / 500) * 0.05;
      centerGlow.addColorStop(0, `rgba(107, 150, 183, ${centerAlpha})`); centerGlow.addColorStop(1, 'rgba(107, 150, 183, 0)');
      ctx.fillStyle = centerGlow; ctx.beginPath(); ctx.arc(cx, cy, 80, 0, Math.PI * 2); ctx.fill();
      
      setProgressWidth(Math.min(1, elapsed / INTRO_DURATION) * 100);
      
      const statusInterval = INTRO_DURATION / STATUS_MESSAGES.length;
      const newIdx = Math.min(STATUS_MESSAGES.length - 1, Math.floor(elapsed / statusInterval));
      if (newIdx !== currentStatusIdx) {
        currentStatusIdx = newIdx;
        setStatusText(STATUS_MESSAGES[currentStatusIdx]);
      }
      
      if (elapsed >= INTRO_DURATION) {
        finishIntro();
        return;
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);

    const finishIntro = () => {
      setIsFadingOut(true);
      sessionStorage.setItem('introPlayed', 'true');
      
      const flashEl = document.createElement('div');
      flashEl.style.cssText = `
        position: fixed; inset: 0; z-index: 10001;
        background: rgba(107, 150, 183, 0.3);
        pointer-events: none;
        animation: introFlash 0.6s ease-out forwards;
      `;
      document.body.appendChild(flashEl);
      
      setTimeout(() => {
        setIsVisible(false);
        flashEl.remove();
        document.getElementById('dashboard-wrapper')?.classList.add('dashboard-visible');
      }, 800);
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finishIntro();
    };
    window.addEventListener('keydown', handleKeydown);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`intro-overlay ${isFadingOut ? 'intro-exit' : ''}`} id="intro-overlay">
      <canvas id="intro-canvas" ref={canvasRef}></canvas>
      <div className="intro-center-content" id="intro-center-content">
        <div className="intro-logo" id="intro-logo">
          <svg width="64" height="64" viewBox="0 0 32 32" fill="none">
            <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#intro-brand-grad)" />
            <path d="M10 22V14L16 10L22 14V22L16 18L10 22Z" fill="white" opacity="0.9" />
            <path d="M16 10V18" stroke="white" strokeWidth="1.5" opacity="0.6" />
            <defs>
              <linearGradient id="intro-brand-grad" x1="2" y1="2" x2="30" y2="30">
                <stop stopColor="#6B96B7" />
                <stop offset="1" stopColor="#3D5A80" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h2 className="intro-title" id="intro-title">AssetHub</h2>
        <p className="intro-subtitle" id="intro-subtitle">Initializing Network...</p>
        <div className="intro-progress-bar" id="intro-progress-bar">
          <div className="intro-progress-fill" id="intro-progress-fill" style={{ width: `${progressWidth}%` }}></div>
        </div>
        <p className="intro-status" id="intro-status" style={{ opacity: 1, transition: 'opacity 0.15s' }}>
          {statusText}
        </p>
      </div>
      <div className="intro-skip" id="intro-skip">
        <button className="intro-skip-btn" id="intro-skip-btn" onClick={() => {
          setIsFadingOut(true);
          sessionStorage.setItem('introPlayed', 'true');
          setTimeout(() => { setIsVisible(false); document.getElementById('dashboard-wrapper')?.classList.add('dashboard-visible'); }, 800);
        }}>
          Skip Intro
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="13 17 18 12 13 7" />
            <polyline points="6 17 11 12 6 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
