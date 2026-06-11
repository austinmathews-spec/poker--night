'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/game-store';
import Tutorial from './Tutorial';
import PokerTable from './PokerTable';
import Image from 'next/image';
import { AI_PERSONALITIES } from '@/engine/types';

export default function PokerGame() {
  const { showTutorial, startNewGame, setShowTutorial } = useGameStore();
  const [gameStarted, setGameStarted] = useState(false);

  const handleStart = useCallback(
    (withTutorial: boolean) => {
      startNewGame(withTutorial);
      setGameStarted(true);
    },
    [startNewGame],
  );

  const handleTutorialComplete = useCallback(() => {
    setShowTutorial(false);
  }, [setShowTutorial]);

  if (!gameStarted) {
    return <LandingScreen onStart={handleStart} />;
  }

  return (
    <>
      <PokerTable />
      <AnimatePresence>
        {showTutorial && <Tutorial onComplete={handleTutorialComplete} />}
      </AnimatePresence>
    </>
  );
}

function LandingScreen({ onStart }: { onStart: (withTutorial: boolean) => void }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gray-950">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-emerald-900/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
      </div>

      <motion.div
        className="relative z-10 text-center max-w-xl mx-auto px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo / Title */}
        <motion.div
          className="mb-2"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <div className="text-6xl mb-4">🃏</div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
            Poker Trainer
          </h1>
          <p className="text-white/50 mt-2 text-sm">Learn Texas Hold&apos;em from scratch</p>
        </motion.div>

        {/* Opponents preview */}
        <motion.div
          className="flex justify-center gap-3 my-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {AI_PERSONALITIES.map((p, i) => (
            <motion.div
              key={p.name}
              className="text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 hover:border-yellow-500/50 transition-colors mx-auto">
                <Image src={p.avatar} alt={p.name} width={64} height={64} className="object-cover" />
              </div>
              <p className="text-white/70 text-xs mt-1 font-medium">{p.name.split(' ')[0]}</p>
              <p className="text-white/30 text-[10px]">{p.title}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          className="grid grid-cols-3 gap-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {[
            { icon: '🎓', text: 'Learn the basics' },
            { icon: '🤖', text: 'AI opponents' },
            { icon: '📈', text: 'Progressive difficulty' },
          ].map((f) => (
            <div key={f.text} className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="text-2xl mb-1">{f.icon}</div>
              <p className="text-white/60 text-xs">{f.text}</p>
            </div>
          ))}
        </motion.div>

        {/* Start buttons */}
        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.button
            onClick={() => onStart(true)}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-lg transition-colors shadow-lg shadow-yellow-500/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Tutorial
          </motion.button>
          <motion.button
            onClick={() => onStart(false)}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/70 font-medium rounded-xl text-sm border border-white/10 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Skip Tutorial — I Know the Rules
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
