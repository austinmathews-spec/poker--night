'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Card3D from './Card3D';
import { Player } from '@/engine/types';

interface PlayerSeatProps {
  player: Player;
  isActive: boolean;
  position: { x: string; y: string };
  showCards: boolean;
}

export default function PlayerSeat({ player, isActive, position, showCards }: PlayerSeatProps) {
  const chipColor = player.chips > 500 ? 'text-emerald-400' : player.chips > 200 ? 'text-yellow-400' : 'text-red-400';

  return (
    <motion.div
      className="absolute flex flex-col items-center gap-1"
      style={{ left: position.x, top: position.y, transform: 'translate(-50%, -50%)' }}
      animate={{
        scale: isActive ? 1.05 : 1,
        filter: player.hasFolded ? 'grayscale(0.8) opacity(0.5)' : 'none',
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Glow ring when active */}
      {isActive && !player.hasFolded && (
        <motion.div
          className="absolute -inset-2 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(234,179,8,0.3) 0%, transparent 70%)',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Avatar */}
      <div className={`relative w-14 h-14 rounded-full overflow-hidden border-2 ${
        isActive ? 'border-yellow-400 shadow-lg shadow-yellow-400/30' :
        player.hasFolded ? 'border-gray-600' : 'border-white/30'
      }`}>
        {player.isHuman ? (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
            U
          </div>
        ) : (
          <Image src={player.avatar} alt={player.name} fill className="object-cover" sizes="56px" />
        )}
      </div>

      {/* Name & chips */}
      <div className="text-center min-w-[90px]">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/10">
          <p className="text-white text-xs font-semibold truncate">{player.name}</p>
          <p className={`${chipColor} text-xs font-mono`}>${player.chips}</p>
        </div>
      </div>

      {/* Current bet */}
      {player.currentBet > 0 && (
        <motion.div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2"
          initial={{ scale: 0, y: -10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="bg-yellow-500/90 text-black text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
            ${player.currentBet}
          </div>
        </motion.div>
      )}

      {/* Hole cards */}
      {player.holeCards.length > 0 && !player.hasFolded && (
        <div className="flex gap-0.5 mt-1">
          {player.holeCards.map((card, i) => (
            <Card3D key={i} card={showCards ? { ...card, faceUp: true } : card} index={i} small />
          ))}
        </div>
      )}

      {/* Folded label */}
      {player.hasFolded && (
        <div className="text-red-400/70 text-xs font-bold mt-1">FOLDED</div>
      )}

      {/* Dealer chip */}
      {player.isDealer && (
        <motion.div
          className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
        >
          D
        </motion.div>
      )}
    </motion.div>
  );
}
