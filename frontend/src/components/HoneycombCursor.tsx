import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: 'dot' | 'star' | 'cross';
}

const StarCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const PARTICLE_COUNT = Math.min(Math.floor((width * height) / 8000), 160);

    const COLORS = [
      'rgba(249,115,22,',   // orange-500
      'rgba(234,88,12,',    // orange-600
      'rgba(251,146,60,',   // orange-400
      'rgba(253,186,116,',  // orange-300
      'rgba(255,237,213,',  // orange-100
      'rgba(15,23,42,',     // slate-900
      'rgba(51,65,85,',     // slate-700
      'rgba(100,116,139,',  // slate-500
    ];

    const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];
    const randomShape = (): Particle['shape'] => {
      const r = Math.random();
      return r < 0.5 ? 'dot' : r < 0.8 ? 'star' : 'cross';
    };

    const makeParticle = (x?: number, y?: number): Particle => ({
      x: x ?? Math.random() * width,
      y: y ?? Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.4 + 0.1), // drift upward
      size: Math.random() * 2.5 + 0.8,
      opacity: Math.random() * 0.5 + 0.1,
      color: randomColor(),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.015,
      shape: randomShape(),
    });

    // Init particles spread across full page
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => makeParticle());

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    resizeCanvas();

    // Draw 4-point star
    const drawStar4 = (x: number, y: number, size: number) => {
      const outer = size * 1.8;
      const inner = size * 0.4;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i - Math.PI / 4;
        const r = i % 2 === 0 ? outer : inner;
        if (i === 0) ctx.moveTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
        else ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
      }
      ctx.closePath();
    };

    // Draw cross/plus
    const drawCross = (x: number, y: number, size: number) => {
      const len = size * 2;
      const thick = size * 0.35;
      ctx.beginPath();
      ctx.rect(x - thick, y - len, thick * 2, len * 2);
      ctx.rect(x - len, y - thick, len * 2, thick * 2);
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Soft cursor glow
      if (mx > 0 && my > 0) {
        const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 200);
        grd.addColorStop(0, 'rgba(249,115,22,0.07)');
        grd.addColorStop(1, 'rgba(249,115,22,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(mx, my, 200, 0, Math.PI * 2);
        ctx.fill();
      }

      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse repulsion / attraction
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 120;

        if (dist < repelRadius && dist > 0) {
          const force = (1 - dist / repelRadius) * 0.6;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Velocity damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Restore upward drift
        p.vy -= 0.003;

        // Clamp velocity
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.5) {
          p.vx = (p.vx / speed) * 1.5;
          p.vy = (p.vy / speed) * 1.5;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Wrap around edges — respawn at bottom when going off top
        if (p.y < -20) {
          p.y = height + 10;
          p.x = Math.random() * width;
          p.vx = (Math.random() - 0.5) * 0.3;
          p.vy = -(Math.random() * 0.4 + 0.1);
        }
        if (p.x < -20) p.x = width + 10;
        if (p.x > width + 20) p.x = -10;

        // Brightness boost near cursor
        let alpha = p.opacity;
        let size = p.size;
        if (dist < 200) {
          const boost = (1 - dist / 200) * 0.5;
          alpha = Math.min(0.95, alpha + boost);
          size = p.size + boost * 3;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `${p.color}1)`;

        if (p.shape === 'dot') {
          ctx.beginPath();
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'star') {
          drawStar4(0, 0, size);
          ctx.fill();
          // Lens flare arms for larger stars
          if (size > 2.5) {
            ctx.globalAlpha = alpha * 0.25;
            ctx.strokeStyle = `${p.color}1)`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(-size * 4, 0);
            ctx.lineTo(size * 4, 0);
            ctx.moveTo(0, -size * 4);
            ctx.lineTo(0, size * 4);
            ctx.stroke();
          }
        } else {
          drawCross(0, 0, size);
          ctx.fill();
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};

export default StarCursor;