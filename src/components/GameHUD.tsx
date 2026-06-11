'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/game-store';

export default function GameHUD() {
  const { pot, phase, handNumber, difficulty, playerLevel, handsWon, handsPlayed } = useGameStore();

  const levelNames = ['', 'Beginner', 'Intermediate', 'Advanced', 'Shark'];
  const levelColors = ['', 'text-green-400', 'text-blue-400', 'text-purple-400', 'text-red-400'];

  if (phase === 'waiting') return null;

  return (
    <div className="fixed top-4 left-4 z-40 flex flex-col gap-2">
      {/* Pot */}
      <motion.div
        className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10"
        animate={{ scale: pot > 0 ? [1, 1.03, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-white/50 text-xs">Pot</p>
        <p className="text-yellow-400 font-bold text-lg font-mono">${pot}</p>
      </motion.div>

      {/* Phase */}
      <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
        <p className="text-white/50 text-xs">Round</p>
        <p className="text-white font-semibold text-sm capitalize">{phase.replace('-', ' ')}</p>
      </div>

      {/* Stats */}
      <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
        <p className="text-white/50 text-xs">Hand #{handNumber}</p>
        <p className="text-white/70 text-xs">
          Won: {handsWon}/{handsPlayed}
        </p>
        <p className={`${levelColors[playerLevel]} text-xs font-semibold mt-1`}>
          Level {difficulty}: {levelNames[playerLevel]}
        </p>
      </div>
    </div>
  );
}
