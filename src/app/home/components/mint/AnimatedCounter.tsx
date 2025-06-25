"use client";

import React, { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  className?: string;
}

export default function AnimatedCounter({ value, className = "" }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(0);
  
  useEffect(() => {
    // Don't animate on initial render if value is 0
    if (value === 0) {
      setDisplayValue(0);
      return;
    }
    
    // Skip animation if it's the first non-zero value we're seeing
    if (prevValueRef.current === 0 && value > 0) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }
    
    // Only animate when value increases
    if (value > prevValueRef.current) {
      setIsAnimating(true);
      
      // Reset counter to 0 and then count up
      setDisplayValue(0);
      
      // After a short delay, start counting up
      const timeout = setTimeout(() => {
        // Animate up to value
        let current = 0;
        const interval = setInterval(() => {
          current += 1;
          setDisplayValue(current);
          
          if (current >= value) {
            clearInterval(interval);
            setIsAnimating(false);
          }
        }, 50); // Speed of count up
        
        return () => clearInterval(interval);
      }, 300); // Delay before starting animation
      
      return () => clearTimeout(timeout);
    } else {
      // If not increasing, just set the value directly without animation
      setDisplayValue(value);
    }
    
    prevValueRef.current = value;
  }, [value]);
  
  // Don't render anything if value is 0
  if (value === 0) return null;
  
  return (
    <span 
      className={`${className} ${isAnimating ? 'animate-pulse text-yellow-300' : ''}`}
    >
      {displayValue}
    </span>
  );
}
