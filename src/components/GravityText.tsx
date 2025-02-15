
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  char: string;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
}

export const GravityText = ({ text }: { text: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const animationFrame = useRef<number>();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initParticles = () => {
      particles.current = [];
      const fontSize = 20;
      ctx.font = `${fontSize}px 'IBM Plex Mono'`;
      
      // Calculate text width for centering
      const textWidth = ctx.measureText(text).width;
      const startX = (canvas.width - textWidth) / 2;
      const startY = canvas.height / 2;

      // Create particles for each character
      [...text].forEach((char, i) => {
        const x = startX + i * (fontSize * 0.6);
        particles.current.push({
          x,
          y: startY,
          char,
          originX: x,
          originY: startY,
          vx: 0,
          vy: 0
        });
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff00';
      ctx.font = "20px 'IBM Plex Mono'";
      
      particles.current.forEach(particle => {
        // Calculate distance from mouse
        const dx = mousePos.current.x - particle.x;
        const dy = mousePos.current.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Gravitational force
        const force = dist < 200 ? 0.5 / (dist + 1) : 0;
        
        // Apply force towards mouse
        particle.vx = particle.vx * 0.9 + dx * force * 0.1;
        particle.vy = particle.vy * 0.9 + dy * force * 0.1;
        
        // Spring force back to original position
        const springForceX = (particle.originX - particle.x) * 0.01;
        const springForceY = (particle.originY - particle.y) * 0.01;
        
        particle.vx += springForceX;
        particle.vy += springForceY;
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Draw character with glow effect
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 10;
        ctx.fillText(particle.char, particle.x, particle.y);
        ctx.shadowBlur = 0;
      });
      
      animationFrame.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    // Initial setup
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [text]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 bg-terminal-bg"
    />
  );
};
