'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HandRank, HAND_RANK_VALUES } from '@/engine/types';
import { getHandRankDescription } from '@/engine/hand-evaluator';

const HAND_EXAMPLES: Record<HandRank, string> = {
  'Royal Flush': 'A♠ K♠ Q♠ J♠ 10♠',
  'Straight Flush': '9♥ 8♥ 7♥ 6♥ 5♥',
  'Four of a Kind': 'K♣ K♦ K♥ K♠ 3♦',
  'Full House': 'Q♦ Q♣ Q♥ 8♠ 8♣',
  'Flush': 'A♦ J♦ 8♦ 5♦ 3♦',
  'Straight': '10♠ 9♥ 8♦ 7♣ 6♠',
  'Three of a Kind': '7♥ 7♦ 7♠ K♣ 2♦',
  'Two Pair': 'J♠ J♥ 4♦ 4♣ A♠',
  'One Pair': '10♦ 10♣ A♥ 8♠ 5♦',
  'High Card': 'A♣ J♦ 8♠ 5♥ 3♣',
};

export default function HandRankings() {
  const [isOpen, setIsOpen] = useState(false);

  const rankings = (Object.keys(HAND_RANK_VALUES) as HandRank[]).sort(
    (a, b) => HAND_RANK_VALUES[b] - HAND_RANK_VALUES[a],
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-40 bg-black/60 backdrop-blur-sm text-white/80 hover:text-white px-3 py-2 rounded-lg border border-white/10 hover:border-white/30 text-xs font-medium transition-all"
      >
        📋 Hand Rankings
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            <motion.div
              className="relative bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl border border-white/10 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm p-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Poker Hand Rankings</h2>
                <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white text-lg">✕</button>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-white/50 text-xs mb-4">Best hand at the top, worst at the bottom.</p>
                {rankings.map((rank, i) => (
                  <div
                    key={rank}
                    className="bg-white/5 rounded-lg p-3 border border-white/5 hover:border-white/15 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-xs font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-semibold text-sm">{rank}</h3>
                          <span className="text-white/30 font-mono text-xs tracking-wider">
                            {HAND_EXAMPLES[rank]}
                          </span>
                        </div>
                        <p className="text-white/50 text-xs mt-0.5">{getHandRankDescription(rank)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
