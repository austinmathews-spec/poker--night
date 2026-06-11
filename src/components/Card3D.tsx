'use client';

import { motion } from 'framer-motion';
import { Card, SUIT_SYMBOLS } from '@/engine/types';

interface Card3DProps {
  card: Card;
  index?: number;
  small?: boolean;
  delay?: number;
}

const suitColor: Record<string, string> = {
  hearts: '#ef4444',
  diamonds: '#3b82f6',
  clubs: '#22c55e',
  spades: '#1e1e1e',
};

export default function Card3D({ card, index = 0, small = false, delay = 0 }: Card3DProps) {
  const w = small ? 'w-12 h-[68px]' : 'w-[72px] h-[100px]';
  const textSize = small ? 'text-xs' : 'text-base';
  const symbolSize = small ? 'text-lg' : 'text-2xl';

  return (
    <motion.div
      className="perspective-[800px]"
      initial={{ rotateY: 180, scale: 0.5, opacity: 0 }}
      animate={{ rotateY: card.faceUp ? 0 : 180, scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: delay + index * 0.1, type: 'spring', stiffness: 200 }}
    >
      <div className={`${w} relative`} style={{ transformStyle: 'preserve-3d' }}>
        {/* Front */}
        <div
          className={`${w} absolute inset-0 rounded-lg border-2 border-white/30 flex flex-col items-center justify-center shadow-xl`}
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(145deg, #ffffff 0%, #f3f4f6 100%)',
          }}
        >
          <span className={`${textSize} font-bold`} style={{ color: suitColor[card.suit] }}>
            {card.rank}
          </span>
          <span className={symbolSize} style={{ color: suitColor[card.suit] }}>
            {SUIT_SYMBOLS[card.suit]}
          </span>
        </div>
        {/* Back */}
        <div
          className={`${w} absolute inset-0 rounded-lg border-2 border-white/20 shadow-xl`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'repeating-linear-gradient(45deg, #1e3a5f, #1e3a5f 4px, #1e4d7a 4px, #1e4d7a 8px)',
          }}
        >
          <div className="absolute inset-1 rounded border border-yellow-400/40 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-yellow-400/60" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
