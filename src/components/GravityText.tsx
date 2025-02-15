
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
      const fontSize = 24; // เพิ่มขนาดตัวอักษร
      ctx.font = `${fontSize}px 'IBM Plex Mono'`;
      
      // คำนวณความกว้างของข้อความเพื่อจัดกึ่งกลาง
      const textWidth = ctx.measureText(text).width;
      const startX = (canvas.width - textWidth) / 2;
      const startY = canvas.height / 2;

      // สร้าง particles สำหรับแต่ละตัวอักษร
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

    const drawScanlines = () => {
      const scanlineHeight = 2;
      const scanlineSpacing = 4;
      ctx.fillStyle = 'rgba(0, 255, 0, 0.03)';
      
      for (let y = 0; y < canvas.height; y += scanlineSpacing) {
        ctx.fillRect(0, y, canvas.width, scanlineHeight);
      }
    };

    const drawCRTNoise = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 0.05;
        data[i] = data[i] * (1 + noise);
        data[i + 1] = data[i + 1] * (1 + noise);
        data[i + 2] = data[i + 2] * (1 + noise);
      }
      
      ctx.putImageData(imageData, 0, 0);
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      drawScanlines();
      
      particles.current.forEach(particle => {
        // คำนวณระยะห่างจากเมาส์
        const dx = mousePos.current.x - particle.x;
        const dy = mousePos.current.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // ปรับปรุงแรงโน้มถ่วง
        const gravitationalConstant = 1;
        const force = dist < 200 ? (gravitationalConstant * 100) / (dist * dist + 100) : 0;
        
        // ใช้สมการการเคลื่อนที่แบบ Verlet Integration
        const dt = 0.16; // delta time
        const drag = 0.95; // แรงต้าน
        
        // คำนวณความเร่งจากแรงโน้มถ่วงและแรงสปริง
        const ax = dx * force * 0.1;
        const ay = dy * force * 0.1;
        
        // แรงสปริงแบบ Hooke's Law
        const springConstant = 0.03;
        const springX = (particle.originX - particle.x) * springConstant;
        const springY = (particle.originY - particle.y) * springConstant;
        
        // อัปเดตความเร็วและตำแหน่ง
        particle.vx = (particle.vx + (ax + springX) * dt) * drag;
        particle.vy = (particle.vy + (ay + springY) * dt) * drag;
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // ปรับความโปร่งใสตามระยะห่างจากเมาส์
        particle.opacity = dist < 100 ? 1 - (dist / 100) * 0.5 : 1;
        
        // วาดตัวอักษรพร้อมเอฟเฟกต์เรืองแสง
        ctx.save();
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 15;
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = '#00ff00';
        ctx.fillText(particle.char, particle.x, particle.y);
        ctx.restore();
      });
      
      drawCRTNoise();
      
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

    // ติดตั้งและเริ่มต้นการทำงาน
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
      style={{
        imageRendering: 'pixelated'
      }}
    />
  );
};
