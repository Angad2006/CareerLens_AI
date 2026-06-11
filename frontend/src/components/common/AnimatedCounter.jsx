import { useState, useEffect } from 'react';

export default function AnimatedCounter({ value, duration = 1500, suffix = '', prefix = '' }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = parseFloat(value) || 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target * 10) / 10);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{prefix}{display % 1 === 0 ? Math.round(display) : display.toFixed(1)}{suffix}</span>;
}
