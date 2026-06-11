'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/game-store';

export default function BettingControls() {
  const { players, currentPlayerIndex, pot, phase, minimumRaise, isAnimating, playerAction } = useGameStore();
  const [raiseAmount, setRaiseAmount] = useState(0);

  const human = players.find((p) => p.isHuman);
  const currentPlayer = players[currentPlayerIndex];
  if (!human || !currentPlayer?.isHuman || human.hasFolded || human.isAllIn) return null;
  if (phase === 'waiting' || phase === 'showdown' || phase === 'hand-complete') return null;

  const maxBet = Math.max(0, ...players.map((p) => p.currentBet));
  const toCall = maxBet - human.currentBet;
  const canCheck = toCall === 0;
  const canCall = toCall > 0 && human.chips >= toCall;
  const canRaise = human.chips > toCall + minimumRaise;
  const effectiveRaise = Math.max(minimumRaise, raiseAmount);

  const handleRaise = () => {
    playerAction('raise', effectiveRaise);
    setRaiseAmount(0);
  };

  const presetRaises = [
    { label: '½ Pot', amount: Math.floor(pot / 2) },
    { label: 'Pot', amount: pot },
    { label: '2x Pot', amount: pot * 2 },
  ].filter((r) => r.amount >= minimumRaise && r.amount < human.chips);

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="bg-gradient-to-t from-black via-black/95 to-transparent pt-8 pb-6 px-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Raise slider */}
          {canRaise && (
            <div className="flex items-center gap-3 px-2">
              <span className="text-white/60 text-xs font-mono w-16">${minimumRaise}</span>
              <input
                type="range"
                min={minimumRaise}
                max={human.chips - toCall}
                step={Math.max(1, Math.floor(minimumRaise / 2))}
                value={effectiveRaise}
                onChange={(e) => setRaiseAmount(Number(e.target.value))}
                className="flex-1 accent-yellow-500 h-2"
              />
              <span className="text-white/60 text-xs font-mono w-16 text-right">${human.chips - toCall}</span>
            </div>
          )}

          {/* Preset raise amounts */}
          {canRaise && presetRaises.length > 0 && (
            <div className="flex gap-2 justify-center">
              {presetRaises.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setRaiseAmount(preset.amount)}
                  className="px-3 py-1 text-xs rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-center">
            <motion.button
              onClick={() => playerAction('fold')}
              disabled={isAnimating}
              className="px-6 py-3 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-red-600/20"
              whileTap={{ scale: 0.95 }}
            >
              Fold
            </motion.button>

            {canCheck && (
              <motion.button
                onClick={() => playerAction('check')}
                disabled={isAnimating}
                className="px-6 py-3 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
                whileTap={{ scale: 0.95 }}
              >
                Check
              </motion.button>
            )}

            {canCall && (
              <motion.button
                onClick={() => playerAction('call')}
                disabled={isAnimating}
                className="px-6 py-3 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
                whileTap={{ scale: 0.95 }}
              >
                Call ${toCall}
              </motion.button>
            )}

            {canRaise && (
              <motion.button
                onClick={handleRaise}
                disabled={isAnimating}
                className="px-6 py-3 rounded-xl bg-yellow-500/80 hover:bg-yellow-500 text-black font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-yellow-500/20"
                whileTap={{ scale: 0.95 }}
              >
                Raise ${effectiveRaise}
              </motion.button>
            )}

            <motion.button
              onClick={() => playerAction('all-in')}
              disabled={isAnimating}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-purple-600/20"
              whileTap={{ scale: 0.95 }}
            >
              All In ${human.chips}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
