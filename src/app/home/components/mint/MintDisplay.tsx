"use client";

import React, { useState } from 'react';
import { usePostMints } from '@/hooks/usePostMints';
import AnimatedCounter from './AnimatedCounter';
import { MintFillIcon } from '@/app/components/icons';
import MintList from './MintList';

interface MintDisplayProps {
  postId: number;
  className?: string;
  showDetailedView?: boolean;
}

/**
 * Component for displaying mint count with optional detailed mint list
 */
export default function MintDisplay({ postId, className = "", showDetailedView = false }: MintDisplayProps) {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading } = usePostMints(postId);
  
  const mintCount = data?.count || 0;
  
  // Simple display for mint count only (used in post lists/cards)
  if (!showDetailedView) {
    return (
      <div className={`flex items-center ${className}`}>
        <MintFillIcon className="w-4 h-4 mr-1 text-yellow-500" color="#FFD700" />
        <AnimatedCounter value={mintCount} className="text-sm" />
      </div>
    );
  }
  
  // Detailed display with expandable mint list (used in post detail view)
  return (
    <div className={`${className} mt-2`}>
      {/* Mint count header */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center p-2 rounded-md hover:bg-gray-800 transition-colors w-full"
      >
        <MintFillIcon className="w-5 h-5 mr-2 text-yellow-500" color="#FFD700" />
        <span className="font-medium">
          {mintCount} {mintCount === 1 ? 'Mint' : 'Mints'}
        </span>
        {data && data.uniqueUserCount && data.uniqueUserCount > 0 && data.uniqueUserCount !== mintCount && (
          <span className="text-sm text-gray-400 ml-2">
            by {data?.uniqueUserCount || 0} {(data?.uniqueUserCount || 0) === 1 ? 'user' : 'users'}
          </span>
        )}
        <svg 
          className={`ml-auto w-5 h-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Expandable mint list */}
      {expanded && (
        <div className="mt-2 border-t border-gray-800 pt-3">
          <MintList postId={postId} maxInitialDisplay={5} />
        </div>
      )}
    </div>
  );
}
