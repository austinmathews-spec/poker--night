'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/game-store';

export default function CoachTip() {
  const { coachMessage, dismissCoachMessage } = useGameStore();

  return (
    <AnimatePresence>
      {coachMessage && (
        <motion.div
          className="fixed top-4 left-1/2 z-50 max-w-md w-full"
          style={{ transform: 'translateX(-50%)' }}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className="mx-4 bg-gradient-to-r from-indigo-900/95 to-purple-900/95 backdrop-blur-md rounded-xl border border-indigo-400/30 shadow-2xl shadow-indigo-500/20 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center">
                <span className="text-lg">🎓</span>
              </div>
              <div className="flex-1">
                <p className="text-indigo-100 text-sm font-medium leading-relaxed">{coachMessage}</p>
              </div>
              <button
                onClick={dismissCoachMessage}
                className="text-white/40 hover:text-white/80 text-xs transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
