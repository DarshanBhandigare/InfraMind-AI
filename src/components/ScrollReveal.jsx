import React from 'react';
import { motion } from 'framer-motion';

/**
 * ScrollReveal Component
 * Wraps children with a cinematic "fade and slide" entry animation triggered by scroll position.
 */
const ScrollReveal = ({ 
  children, 
  direction = 'up', 
  delay = 0, 
  duration = 0.8,
  distance = 40,
  width = '100%',
  once = true
}) => {
  const getInitialProps = () => {
    switch (direction) {
      case 'up': return { y: distance, opacity: 0 };
      case 'down': return { y: -distance, opacity: 0 };
      case 'left': return { x: distance, opacity: 0 };
      case 'right': return { x: -distance, opacity: 0 };
      default: return { y: distance, opacity: 0 };
    }
  };

  const getAnimateProps = () => {
    switch (direction) {
      case 'up':
      case 'down': return { y: 0, opacity: 1 };
      case 'left':
      case 'right': return { x: 0, opacity: 1 };
      default: return { y: 0, opacity: 1 };
    }
  };

  return (
    <motion.div
      style={{ width, position: 'relative' }}
      initial={getInitialProps()}
      whileInView={getAnimateProps()}
      viewport={{ once, margin: "-100px" }}
      transition={{ 
        duration, 
        delay, 
        ease: [0.16, 1, 0.3, 1] // Premium ease-out expo
      }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
