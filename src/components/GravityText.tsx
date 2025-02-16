
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

    const calculateRelativisticGravity = (dx: number, dy: number, dist: number) => {
      // คำนวณแรงโน้มถ่วงตามทฤษฎีสัมพัทธภาพทั่วไป
      const G = 1; // ค่าคงที่แรงโน้มถ่วง
      const c = 300; // ความเร็วแสง (scaled)
      const Rs = 2 * G * 100 / (c * c); // รัศมี Schwarzschild
      
      // คำนวณการบิดเบือนของเวลาและอวกาศ
      const gravitationalTimeDilation = Math.sqrt(1 - Rs / (dist + Rs));
      
      // คำนวณการเบนของแสง (gravitational lensing)
      const bendingAngle = 4 * G * 100 / (c * c * dist);
      
      // คำนวณแรงที่เพิ่มขึ้นเมื่อเข้าใกล้ขอบฟ้าเหตุการณ์
      const eventHorizonEffect = dist < Rs * 3 ? Math.pow(Rs / dist, 2) : 0;
      
      return {
        force: G * 100 / (dist * dist) * (1 + eventHorizonEffect),
        timeDilation: gravitationalTimeDilation,
        bendingAngle: bendingAngle
      };
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.current.forEach(particle => {
        // คำนวณระยะห่างจากเมาส์
        const dx = mousePos.current.x - particle.x;
        const dy = mousePos.current.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // คำนวณผลกระทบจากสัมพัทธภาพ
        const { force, timeDilation, bendingAngle } = calculateRelativisticGravity(dx, dy, dist);
        
        // ใช้สมการการเคลื่อนที่แบบ Velocity Verlet Integration
        const dt = 0.16 * timeDilation; // เวลาถูกบิดเบือนตามทฤษฎีสัมพัทธภาพ
        const drag = 0.97; 
        
        // คำนวณความเร่งรวมผลของการบิดเบือนอวกาศ
        const ax = (dx / dist) * force * Math.cos(bendingAngle);
        const ay = (dy / dist) * force * Math.sin(bendingAngle);
        
        // แรงสปริงถูกปรับตามการบิดเบือนของอวกาศ
        const k = 0.05 * timeDilation;
        const springX = (particle.originX - particle.x) * k;
        const springY = (particle.originY - particle.y) * k;
        
        // อัพเดทความเร็วและตำแหน่ง
        const oldVx = particle.vx;
        const oldVy = particle.vy;
        
        particle.vx = (oldVx + (ax + springX) * dt) * drag;
        particle.vy = (oldVy + (ay + springY) * dt) * drag;
        
        particle.x += (oldVx + particle.vx) * 0.5 * dt;
        particle.y += (oldVy + particle.vy) * 0.5 * dt;
        
        // ปรับความโปร่งใสตามระยะห่างและการบิดเบือนของเวลา
        particle.opacity = dist < 100 ? 0.3 + 0.7 * (dist / 100) * timeDilation : 1;
        
        // วาดตัวอักษร
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
