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

    const PARTICLE_COUNT = Math.min(Math.floor((width * height) / 8000), 50);

    const COLORS = [
      'rgba(249,115,22,',  // orange
      'rgba(234,88,12,',   // deep orange
      'rgba(251,146,60,',  // light orange
      'rgba(15,23,42,',    // near black
      'rgba(30,41,59,',    // dark slate
      'rgba(17,24,39,',    // dark gray-black
    ];
    const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

    const makeParticle = (x?: number, y?: number): Particle => ({
      x: x ?? Math.random() * width,
      y: y ?? Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.4 + 0.1),
      size: Math.random() * 2.2 + 1.8,
      opacity: Math.random() * 0.45 + 0.15,
      color: randomColor(),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.016,
    });

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

    const drawContainer = (size: number) => {
      const w = size * 5.5;
      const h = size * 2.8;
      const r = size * 0.5;

      // Body fill
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, r);
      ctx.fill();

      // Outline
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, r);
      ctx.stroke();

      // M label
      ctx.save();
      const fs = Math.max(4, size * 1.5);
      ctx.font = `700 ${fs}px sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', 0, 0);
      ctx.restore();

      // Corrugation ribs
      const ribCount = Math.max(2, Math.floor(w / (size * 1.8)));
      const savedLW = ctx.lineWidth;
      ctx.lineWidth = 0.3;
      for (let i = 1; i < ribCount; i++) {
        const rx = -w / 2 + (w / ribCount) * i;
        ctx.beginPath();
        ctx.moveTo(rx, -h / 2 + r);
        ctx.lineTo(rx, h / 2 - r);
        ctx.stroke();
      }
      ctx.lineWidth = savedLW;
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      if (mx > 0 && my > 0) {
        const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 200);
        grd.addColorStop(0, 'rgba(232,68,42,0.07)');
        grd.addColorStop(1, 'rgba(232,68,42,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(mx, my, 200, 0, Math.PI * 2);
        ctx.fill();
      }

      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 120;

        if (dist < repelRadius && dist > 0) {
          const force = (1 - dist / repelRadius) * 0.6;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.vx *= 0.98;
        p.vy *= 0.98;
        p.vy -= 0.003;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.5) {
          p.vx = (p.vx / speed) * 1.5;
          p.vy = (p.vy / speed) * 1.5;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (p.y < -20) {
          p.y = height + 10;
          p.x = Math.random() * width;
          p.vx = (Math.random() - 0.5) * 0.3;
          p.vy = -(Math.random() * 0.4 + 0.1);
        }
        if (p.x < -20) p.x = width + 10;
        if (p.x > width + 20) p.x = -10;

        let alpha = p.opacity;
        let size = p.size;
        if (dist < 200) {
          const boost = (1 - dist / 200) * 0.45;
          alpha = Math.min(0.95, alpha + boost);
          size = p.size + boost * 3;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `${p.color}0.82)`;
        ctx.strokeStyle = `${p.color}0.95)`;
        ctx.lineWidth = 0.5;

        drawContainer(size);

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