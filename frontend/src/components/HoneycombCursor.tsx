import React, { useEffect, useRef } from 'react';

const HoneycombCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const scrollRef = useRef(0);

  useEffect(() => {
    // Only run effect on desktop (width >= 1024px)
    if (window.innerWidth < 1024) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const hexRadius = 25;
    const hexWidth = hexRadius * Math.sqrt(3);
    const hexHeight = hexRadius * 2;
    const hexVerticalSpacing = hexHeight * 0.75;

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

    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    resizeCanvas();

    const drawHexagon = (x: number, y: number, radius: number, alpha: number, glow: boolean) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6;
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      
      if (glow) {
        ctx.strokeStyle = `rgba(249, 115, 22, ${alpha})`;
        ctx.shadowBlur = 15 * alpha;
        ctx.shadowColor = 'rgba(249, 115, 22, 0.5)';
      } else {
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.shadowBlur = 25 * alpha;
      }
      
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / hexWidth) + 2;
      const rows = Math.ceil(height / hexVerticalSpacing) + 2;

      // Offsets for smooth tiling
      const offsetX = 0;
      const offsetY = -(scrollRef.current % hexVerticalSpacing);

      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          let x = c * hexWidth + offsetX;
          const y = r * hexVerticalSpacing + offsetY;

          if (r % 2 !== 0) {
            x += hexWidth / 2;
          }

          const dx = x - mouseRef.current.x;
          const dy = y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          const maxDist = 250;
          const baseAlpha = 0.12; // Very subtle base grid
          
          if (dist < maxDist) {
            const interactionAlpha = (1 - dist / maxDist) * 0.7;
            const totalAlpha = Math.max(baseAlpha, interactionAlpha);
            drawHexagon(x, y, hexRadius, totalAlpha, interactionAlpha > baseAlpha);
          } else {
            drawHexagon(x, y, hexRadius, baseAlpha, false);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 hidden lg:block"
    />
  );
};

export default HoneycombCursor;
