'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/game-store';
import PlayerSeat from './PlayerSeat';
import Card3D from './Card3D';
import BettingControls from './BettingControls';
import CoachTip from './CoachTip';
import GameHUD from './GameHUD';
import HandRankings from './HandRankings';
import ShowdownOverlay from './ShowdownOverlay';

const SEAT_POSITIONS = [
  { x: '50%', y: '88%' },   // 0: Human (bottom center)
  { x: '10%', y: '60%' },   // 1: Scott (left)
  { x: '30%', y: '12%' },   // 2: Walden (top-left)
  { x: '70%', y: '12%' },   // 3: Steven (top-right)
  { x: '90%', y: '60%' },   // 4: Russell (right)
];

export default function PokerTable() {
  const {
    players,
    communityCards,
    phase,
    currentPlayerIndex,
    dealNewHand,
    processAITurns,
  } = useGameStore();

  useEffect(() => {
    if (phase === 'waiting' && players.length > 0) {
      dealNewHand();
    }
  }, [phase, players.length, dealNewHand]);

  useEffect(() => {
    if (phase !== 'waiting' && phase !== 'showdown' && phase !== 'hand-complete') {
      const current = players[currentPlayerIndex];
      if (current && !current.isHuman && !current.hasFolded && !current.isAllIn) {
        processAITurns();
      }
    }
  }, [currentPlayerIndex, phase, players, processAITurns]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-950">
      {/* Ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-emerald-900/20 blur-3xl" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full" />
      </div>

      {/* 3D Table */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ perspective: '1200px' }}
      >
        <motion.div
          className="relative w-[700px] h-[380px]"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateX(25deg)',
          }}
          initial={{ rotateX: 45, opacity: 0 }}
          animate={{ rotateX: 25, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Table surface */}
          <div
            className="absolute inset-0 rounded-[180px] border-[12px] border-amber-900/80"
            style={{
              background: 'radial-gradient(ellipse at center, #1a5c2e 0%, #0f3d1e 50%, #0a2912 100%)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 2px 20px rgba(255,255,255,0.05), 0 0 80px rgba(0,0,0,0.5)',
            }}
          >
            {/* Felt texture pattern */}
            <div
              className="absolute inset-4 rounded-[160px] border border-yellow-600/20"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.15) 100%)',
              }}
            />

            {/* Community cards */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
              {communityCards.map((card, i) => (
                <Card3D key={`${card.rank}-${card.suit}`} card={card} index={i} delay={0.1} />
              ))}
              {/* Empty card slots */}
              {Array.from({ length: 5 - communityCards.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-[72px] h-[100px] rounded-lg border border-white/5 bg-white/[0.02]"
                />
              ))}
            </div>

            {/* Pot display on table */}
            {phase !== 'waiting' && (
              <motion.div
                className="absolute top-[30%] left-1/2 -translate-x-1/2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center gap-1 bg-black/40 rounded-full px-3 py-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/50" />
                  <span className="text-yellow-300 text-xs font-mono font-bold">
                    POT
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Player seats */}
      <div className="absolute inset-0">
        {players.map((player, i) => (
          <PlayerSeat
            key={player.id}
            player={player}
            isActive={i === currentPlayerIndex && phase !== 'waiting' && phase !== 'showdown' && phase !== 'hand-complete'}
            position={SEAT_POSITIONS[i]}
            showCards={phase === 'showdown' || phase === 'hand-complete'}
          />
        ))}
      </div>

      {/* Overlays */}
      <GameHUD />
      <HandRankings />
      <CoachTip />
      <BettingControls />
      <ShowdownOverlay />
    </div>
  );
}
