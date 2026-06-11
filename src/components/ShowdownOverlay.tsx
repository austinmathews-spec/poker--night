'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/game-store';

export default function ShowdownOverlay() {
  const { phase, handResult, dealNewHand, players } = useGameStore();

  const show = (phase === 'showdown' || phase === 'hand-complete') && handResult;
  if (!show || !handResult) return null;

  const humanWon = handResult.winners.some((w) => w.playerId === 'human');
  const human = players.find((p) => p.isHuman);
  const busted = human && human.chips <= 0;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          className="relative bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl border border-white/10 max-w-sm w-full p-6 shadow-2xl text-center"
          initial={{ scale: 0.8, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {humanWon ? (
            <>
              <motion.div
                className="text-5xl mb-3"
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 0.6 }}
              >
                🏆
              </motion.div>
              <h2 className="text-yellow-400 text-2xl font-bold">You Win!</h2>
            </>
          ) : (
            <>
              <div className="text-5xl mb-3">💔</div>
              <h2 className="text-red-400 text-2xl font-bold">
                {busted ? 'Busted!' : 'You Lost'}
              </h2>
            </>
          )}

          <div className="mt-4 space-y-2">
            {handResult.winners.map((w) => {
              const player = players.find((p) => p.id === w.playerId);
              return (
                <div key={w.playerId} className="bg-white/5 rounded-lg p-3">
                  <p className="text-white font-semibold text-sm">{player?.name || 'Unknown'}</p>
                  <p className="text-white/60 text-xs">{w.handDescription}</p>
                  <p className="text-yellow-400 font-bold text-sm mt-1">+${w.amount}</p>
                </div>
              );
            })}
          </div>

          {/* Other players' hands */}
          {handResult.playerHands.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-white/40 text-xs mb-2">All hands:</p>
              <div className="space-y-1">
                {handResult.playerHands.map((ph) => {
                  const player = players.find((p) => p.id === ph.playerId);
                  const isWinner = handResult.winners.some((w) => w.playerId === ph.playerId);
                  return (
                    <div key={ph.playerId} className={`text-xs ${isWinner ? 'text-yellow-400' : 'text-white/50'}`}>
                      {player?.name}: {ph.result.description}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <motion.button
            onClick={dealNewHand}
            className="mt-6 px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-sm w-full transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            {busted ? 'New Game' : 'Next Hand →'}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
