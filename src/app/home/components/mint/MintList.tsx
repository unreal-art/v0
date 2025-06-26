"use client";

import React, { useState } from 'react';
import { usePostMints, MintInfo } from '@/hooks/usePostMints';
import MintCard from './MintCard';
import { MintFillIcon } from '@/app/components/icons';

interface MintListProps {
  postId: number;
  maxInitialDisplay?: number;
}

/**
 * Component to display a list of mints for a post
 */
export default function MintList({ postId, maxInitialDisplay = 3 }: MintListProps) {
  const [showAll, setShowAll] = useState(false);
  const { data, isLoading, isError } = usePostMints(postId);
  
  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="py-3 px-4">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-800 h-8 w-8"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 bg-gray-800 rounded w-3/4"></div>
            <div className="h-2 bg-gray-800 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isError || !data || !data.mints || data.mints.length === 0) {
    return (
      <div className="text-center py-3 text-gray-500">
        <MintFillIcon className="h-6 w-6 mx-auto mb-2 opacity-50" color="#FFD700" />
        <p>No mints yet.</p>
      </div>
    );
  }
  
  // Determine how many mints to show
  const mintsToShow = showAll ? data.mints : data.mints.slice(0, maxInitialDisplay);
  const hasMore = data.mints.length > maxInitialDisplay;
  
  return (
    <div className="w-full">
      {/* Stats summary */}
      <div className="flex justify-between items-center mb-3 px-2">
        <h3 className="text-white font-semibold">Mints</h3>
        <div className="text-sm text-gray-400">
          <span>{data.count} {data.count === 1 ? 'mint' : 'mints'}</span>
          {data.uniqueUserCount > 0 && data.uniqueUserCount !== data.count && (
            <span> by {data.uniqueUserCount} {data.uniqueUserCount === 1 ? 'user' : 'users'}</span>
          )}
        </div>
      </div>
      
      {/* List of mints */}
      <div className="space-y-2">
        {mintsToShow.map((mint: MintInfo) => (
          <MintCard key={mint.id} mint={mint} isExpanded={showAll} />
        ))}
      </div>
      
      {/* Show more/less button */}
      {hasMore && (
        <button 
          onClick={() => setShowAll(!showAll)}
          className="mt-3 w-full py-2 text-sm text-center text-blue-400 hover:text-blue-300 transition-colors"
        >
          {showAll ? 'Show less' : 'Show all mints'}
        </button>
      )}
    </div>
  );
}
