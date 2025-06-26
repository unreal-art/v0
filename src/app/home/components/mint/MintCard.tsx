"use client";

import { MintInfo } from '@/hooks/usePostMints';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistance } from 'date-fns';
import { MintFillIcon } from '@/app/components/icons';

interface MintCardProps {
  mint: MintInfo;
  isExpanded?: boolean;
}

export default function MintCard({ mint, isExpanded = false }: MintCardProps) {
  const mintDate = mint.created_at ? new Date(mint.created_at) : new Date();
  const timeAgo = formatDistance(mintDate, new Date(), { addSuffix: true });
  const username = mint.user_profile?.username || 'Anonymous User';
  const avatarUrl = mint.user_profile?.avatar_url || '/default-avatar.png';
  const shortHash = mint.transaction_hash
    ? `${mint.transaction_hash.substring(0, 6)}...${mint.transaction_hash.substring(mint.transaction_hash.length - 4)}`
    : null;

  return (
    <div className={`bg-gray-900 rounded-lg p-3 mb-2 ${isExpanded ? 'flex flex-col' : 'flex items-center justify-between'}`}>
      <div className="flex items-center">
        <div className="w-8 h-8 relative mr-2 rounded-full overflow-hidden">
          <Image
            src={avatarUrl}
            alt={username}
            width={32}
            height={32}
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <Link href={`/home/profile/${mint.user_id}`} className="text-white hover:underline">
            <p className="font-medium">{username}</p>
          </Link>
          <p className="text-xs text-gray-400">{timeAgo}</p>
        </div>
        <div className="flex items-center text-yellow-400">
          <MintFillIcon className="w-4 h-4 mr-1" color="#FFD700" />
          <span className="text-xs">Minted</span>
        </div>
      </div>
      {isExpanded && shortHash && (
        <div className="mt-2 pt-2 border-t border-gray-800 text-xs text-gray-500 w-full">
          <p className="truncate">TX: {shortHash}</p>
        </div>
      )}
    </div>
  );
}
