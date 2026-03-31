import React, { useEffect, useRef } from 'react';

const HoneycombCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const glowCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const scrollRef = useRef(0);

  useEffect(() => {
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

    // PRE-RENDER HEXAGONS
    const createHexTexture = (color: string) => {
      const offscreen = document.createElement('canvas');
      const padding = 10;
      offscreen.width = hexWidth + padding;
      offscreen.height = hexHeight + padding;
      const octx = offscreen.getContext('2d');
      if (octx) {
        octx.translate(padding/2, padding/2);
        octx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i + Math.PI / 6;
          const px = (hexWidth/2) + hexRadius * Math.cos(angle);
          const py = (hexHeight/2) + hexRadius * Math.sin(angle);
          if (i === 0) octx.moveTo(px, py);
          else octx.lineTo(px, py);
        }
        octx.closePath();
        octx.strokeStyle = color;
        octx.lineWidth = 0.7;
        octx.stroke();
      }
      return offscreen;
    };

    offscreenCanvasRef.current = createHexTexture('rgba(0, 0, 0, 1)');
    glowCanvasRef.current = createHexTexture('#f97316');

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

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / hexWidth) + 1;
      const rows = Math.ceil(height / hexVerticalSpacing) + 1;
      const offsetY = -(scrollRef.current % hexVerticalSpacing);

      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          let x = c * hexWidth;
          const y = r * hexVerticalSpacing + offsetY;

          if (r % 2 !== 0) {
            x += hexWidth / 2;
          }

          const dx = x - mouseRef.current.x;
          const dy = y - mouseRef.current.y;
          const distSq = dx * dx + dy * dy; // Use squared distance for performance
          
          const maxDist = 250;
          const maxDistSq = maxDist * maxDist;
          const baseAlpha = 0.04;
          
          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            const interactionAlpha = (1 - dist / maxDist) * 1;
            const totalAlpha = Math.max(baseAlpha, interactionAlpha);
            
            ctx.globalAlpha = totalAlpha;
            const texture = interactionAlpha > baseAlpha ? glowCanvasRef.current : offscreenCanvasRef.current;
            if (texture) ctx.drawImage(texture, x - hexWidth/2, y - hexHeight/2);
          } else {
            ctx.globalAlpha = baseAlpha;
            if (offscreenCanvasRef.current) {
              ctx.drawImage(offscreenCanvasRef.current, x - hexWidth/2, y - hexHeight/2);
            }
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

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 hidden lg:block" />;
};

export default HoneycombCursor;
