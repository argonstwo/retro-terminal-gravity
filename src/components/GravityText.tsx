
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  char: string;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  opacity: number;
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
      const fontSize = 24;
      ctx.font = `${fontSize}px 'IBM Plex Mono'`;
      
      const textWidth = ctx.measureText(text).width;
      const startX = (canvas.width - textWidth) / 2;
      const startY = canvas.height / 2;

      [...text].forEach((char, i) => {
        const x = startX + i * (fontSize * 0.6);
        particles.current.push({
          x,
          y: startY,
          char,
          originX: x,
          originY: startY,
          vx: 0,
          vy: 0,
          opacity: 1
        });
      });
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.current.forEach(particle => {
        // คำนวณระยะห่างจากเมาส์
        const dx = mousePos.current.x - particle.x;
        const dy = mousePos.current.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // คำนวณแรงโน้มถ่วงตามกฎของนิวตัน F = G * (m1 * m2) / r^2
        const G = 1; // ค่าคงที่แรงโน้มถ่วง
        const m1 = 1; // มวลของอนุภาค
        const m2 = 100; // มวลของเคอร์เซอร์
        const force = dist < 200 ? (G * m1 * m2) / (dist * dist + 1) : 0;
        
        // ใช้สมการการเคลื่อนที่แบบ Velocity Verlet Integration
        const dt = 0.16; // delta time
        const drag = 0.97; // แรงต้านอากาศ (เพิ่มขึ้นเพื่อการเคลื่อนที่ที่นุ่มนวลขึ้น)
        
        // คำนวณความเร่งตามกฎข้อที่สองของนิวตัน a = F/m
        const ax = force > 0 ? (dx / dist) * (force / m1) : 0;
        const ay = force > 0 ? (dy / dist) * (force / m1) : 0;
        
        // แรงสปริงตามกฎของฮุค F = -kx
        const k = 0.05; // spring constant
        const springX = (particle.originX - particle.x) * k;
        const springY = (particle.originY - particle.y) * k;
        
        // อัพเดทความเร็วและตำแหน่งด้วย Velocity Verlet
        const oldVx = particle.vx;
        const oldVy = particle.vy;
        
        particle.vx = (oldVx + (ax + springX) * dt) * drag;
        particle.vy = (oldVy + (ay + springY) * dt) * drag;
        
        particle.x += (oldVx + particle.vx) * 0.5 * dt;
        particle.y += (oldVy + particle.vy) * 0.5 * dt;
        
        // ปรับความโปร่งใสตามระยะห่าง
        particle.opacity = dist < 100 ? 0.3 + 0.7 * (dist / 100) : 1;
        
        // วาดตัวอักษรด้วยสไตล์เทอร์มินัล
        ctx.fillStyle = `rgba(0, 255, 0, ${particle.opacity})`;
        ctx.fillText(particle.char, particle.x, particle.y);
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
