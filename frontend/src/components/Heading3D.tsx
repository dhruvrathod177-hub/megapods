import React, { useRef } from 'react';

type HTMLTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';

interface Heading3DProps {
  children: React.ReactNode;
  className?: string;
  tag?: HTMLTag;
}

const Heading3D: React.FC<Heading3DProps> = ({ children, className = '', tag: Tag = 'h2' }) => {
  const ref = useRef<HTMLElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -10;
    const rotateY = ((x - cx) / cx) * 14;
    el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
    el.style.textShadow = `${-rotateY * 0.6}px ${rotateX * 0.6}px 18px rgba(234,88,12,0.22), 0 2px 32px rgba(0,0,0,0.10)`;
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
    el.style.textShadow = 'none';
  };

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={`heading-3d text-center transition-all duration-200 cursor-default ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Tag>
  );
};

export default Heading3D;
