"use client";

import React, { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  className?: string;
}

export default function AnimatedCounter({ value, className = "" }: AnimatedCounterProps) {
  // If value is 0, we'll show 1 briefly with animation and then hide
  const [displayValue, setDisplayValue] = useState(value || null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isShowing, setIsShowing] = useState(value > 0);
  const prevValueRef = useRef(value);
  
  useEffect(() => {
    // Initial render - set appropriate value
    if (prevValueRef.current === value) {
      // For zero count, don't show anything initially
      if (value === 0) {
        setDisplayValue(null);
        setIsShowing(false);
      } else {
        setDisplayValue(value);
        setIsShowing(true);
      }
      return;
    }
    
    // Animate when value increases
    if (value > prevValueRef.current) {
      setIsAnimating(true);
      setIsShowing(true);
      
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
            
            // If final value is 0, show 1 briefly and then hide
            if (value === 0) {
              // Show 1 briefly first
              setDisplayValue(1);
              
              // Then hide after a second
              setTimeout(() => {
                setDisplayValue(null);
                setIsShowing(false);
              }, 1000);
            }
          }
        }, 50); // Speed of count up
        
        return () => clearInterval(interval);
      }, 300); // Delay before starting animation
      
      return () => clearTimeout(timeout);
    } else if (value === 0 && prevValueRef.current > 0) {
      // If count drops to 0, hide the counter
      setDisplayValue(null);
      setIsShowing(false);
    } else {
      // For other non-increasing changes, set the value directly
      setDisplayValue(value);
    }
    
    prevValueRef.current = value;
  }, [value]);
  
  if (!isShowing && !isAnimating) return null;
  
  return (
    <span 
      className={`${className} ${isAnimating ? 'animate-pulse text-yellow-300' : ''}`}
    >
      {displayValue}
    </span>
  );
}
