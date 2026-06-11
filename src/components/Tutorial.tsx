'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialProps {
  onComplete: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to Poker Trainer!',
    content:
      "You're about to learn Texas Hold'em — the most popular form of poker in the world. This trainer will teach you everything from the basics to advanced strategy.",
    icon: '🃏',
  },
  {
    title: 'The Basics',
    content:
      "Each player gets 2 private cards (\"hole cards\"). Then 5 community cards are dealt face-up on the table. Your goal: make the best 5-card hand using any combination of your 2 cards and the 5 community cards.",
    icon: '🎴',
  },
  {
    title: 'Betting Rounds',
    content:
      "There are 4 betting rounds:\n• Pre-Flop: After you get your 2 cards\n• Flop: After 3 community cards are dealt\n• Turn: After the 4th community card\n• River: After the 5th and final community card",
    icon: '💰',
  },
  {
    title: 'Your Actions',
    content:
      "On your turn, you can:\n• Check: Pass (free, if no one bet)\n• Call: Match the current bet\n• Raise: Increase the bet\n• Fold: Give up your hand\n• All-In: Bet all your chips",
    icon: '🎯',
  },
  {
    title: 'Hand Rankings (Best → Worst)',
    content:
      "Royal Flush > Straight Flush > Four of a Kind > Full House > Flush > Straight > Three of a Kind > Two Pair > One Pair > High Card\n\nTap \"Hand Rankings\" during play for details!",
    icon: '👑',
  },
  {
    title: 'Your Opponents',
    content:
      "You'll face the 4 Cognition AI co-founders, each with a unique playing style:\n• Scott Wu — Tight & aggressive\n• Walden Yan — Wild & unpredictable\n• Steven Hao — Patient & careful\n• Russell Kaplan — Loose & friendly\n\nAs you improve, they get smarter!",
    icon: '🤖',
  },
  {
    title: 'Coach Tips',
    content:
      "Look for coaching tips at the top of the screen — they'll help you make better decisions. The coach analyzes your hand strength and gives real-time advice.",
    icon: '🎓',
  },
  {
    title: "Let's Play!",
    content:
      "Start with $1,000 in chips. Blinds are $10/$20. Win chips to level up and face tougher opponents.\n\nGood luck — you've got this!",
    icon: '🚀',
  },
];

export default function Tutorial({ onComplete }: TutorialProps) {
  const [step, setStep] = useState(0);
  const current = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="relative bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl border border-white/10 max-w-md w-full p-8 shadow-2xl"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          {/* Progress */}
          <div className="flex gap-1 mb-6">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-yellow-500' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          <div className="text-5xl mb-4">{current.icon}</div>
          <h2 className="text-white text-xl font-bold mb-3">{current.title}</h2>
          <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{current.content}</p>

          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="text-white/50 hover:text-white text-sm transition-colors"
              >
                ← Back
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="text-white/30 hover:text-white/60 text-sm transition-colors"
              >
                Skip
              </button>
            )}
            <motion.button
              onClick={() => (isLast ? onComplete() : setStep(step + 1))}
              className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-sm transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              {isLast ? "Deal Me In!" : 'Next →'}
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
