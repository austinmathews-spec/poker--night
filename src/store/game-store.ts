import { create } from 'zustand';
import {
  GameState,
  Player,
  Card,
  GamePhase,
  AI_PERSONALITIES,
  PlayerAction,
} from '@/engine/types';
import { createDeck, shuffleDeck, dealCards } from '@/engine/deck';
import { evaluateHand, compareHands } from '@/engine/hand-evaluator';
import { getAIDecision, generateCoachTip } from '@/engine/ai-player';

interface GameStore extends GameState {
  deck: Card[];
  isAnimating: boolean;
  actionLog: { player: string; action: string; amount?: number }[];
  startNewGame: (showTutorial: boolean) => void;
  dealNewHand: () => void;
  playerAction: (action: PlayerAction, amount?: number) => void;
  nextPhase: () => void;
  processAITurns: () => Promise<void>;
  dismissCoachMessage: () => void;
  setShowTutorial: (show: boolean) => void;
  updateCoachTip: () => void;
}

function createPlayer(
  id: string,
  name: string,
  title: string,
  avatar: string,
  chips: number,
  seatIndex: number,
  isHuman: boolean,
  personality: typeof AI_PERSONALITIES[number] | null,
): Player {
  return {
    id,
    name,
    title,
    avatar,
    chips,
    holeCards: [],
    currentBet: 0,
    totalBetThisRound: 0,
    hasFolded: false,
    isAllIn: false,
    isDealer: false,
    isHuman,
    personality,
    seatIndex,
  };
}

const INITIAL_CHIPS = 1000;
const INITIAL_SMALL_BLIND = 10;
const INITIAL_BIG_BLIND = 20;

export const useGameStore = create<GameStore>((set, get) => ({
  players: [],
  communityCards: [],
  pot: 0,
  sidePots: [],
  currentPlayerIndex: 0,
  dealerIndex: 0,
  smallBlind: INITIAL_SMALL_BLIND,
  bigBlind: INITIAL_BIG_BLIND,
  phase: 'waiting',
  minimumRaise: INITIAL_BIG_BLIND,
  lastRaiseAmount: INITIAL_BIG_BLIND,
  handNumber: 0,
  difficulty: 1,
  playerLevel: 1,
  handsWon: 0,
  handsPlayed: 0,
  showTutorial: true,
  coachMessage: null,
  handResult: null,
  deck: [],
  isAnimating: false,
  actionLog: [],

  startNewGame: (showTutorial: boolean) => {
    const players: Player[] = [
      createPlayer('human', 'You', 'The Student', '/avatars/player.png', INITIAL_CHIPS, 0, true, null),
      ...AI_PERSONALITIES.map((p, i) =>
        createPlayer(p.name, p.name, p.title, p.avatar, INITIAL_CHIPS, i + 1, false, p),
      ),
    ];
    players[0].isDealer = true;

    set({
      players,
      communityCards: [],
      pot: 0,
      sidePots: [],
      currentPlayerIndex: 0,
      dealerIndex: 0,
      smallBlind: INITIAL_SMALL_BLIND,
      bigBlind: INITIAL_BIG_BLIND,
      phase: 'waiting',
      minimumRaise: INITIAL_BIG_BLIND,
      lastRaiseAmount: INITIAL_BIG_BLIND,
      handNumber: 0,
      difficulty: 1,
      playerLevel: 1,
      handsWon: 0,
      handsPlayed: 0,
      showTutorial,
      coachMessage: null,
      handResult: null,
      deck: [],
      isAnimating: false,
      actionLog: [],
    });
  },

  dealNewHand: () => {
    const state = get();
    const activePlayers = state.players.filter((p) => p.chips > 0);
    if (activePlayers.length < 2) return;

    let deck = shuffleDeck(createDeck());
    const newDealerIndex = (state.dealerIndex + 1) % state.players.length;

    const players = state.players.map((p, i) => ({
      ...p,
      holeCards: [] as Card[],
      currentBet: 0,
      totalBetThisRound: 0,
      hasFolded: p.chips <= 0,
      isAllIn: false,
      isDealer: i === newDealerIndex,
    }));

    for (const player of players) {
      if (!player.hasFolded) {
        const { dealt, remaining } = dealCards(deck, 2);
        player.holeCards = dealt.map((c) => ({ ...c, faceUp: player.isHuman }));
        deck = remaining;
      }
    }

    const sbIndex = getNextActivePlayer(players, newDealerIndex);
    const bbIndex = getNextActivePlayer(players, sbIndex);

    const sbAmount = Math.min(state.smallBlind, players[sbIndex].chips);
    players[sbIndex].chips -= sbAmount;
    players[sbIndex].currentBet = sbAmount;
    players[sbIndex].totalBetThisRound = sbAmount;
    if (players[sbIndex].chips === 0) players[sbIndex].isAllIn = true;

    const bbAmount = Math.min(state.bigBlind, players[bbIndex].chips);
    players[bbIndex].chips -= bbAmount;
    players[bbIndex].currentBet = bbAmount;
    players[bbIndex].totalBetThisRound = bbAmount;
    if (players[bbIndex].chips === 0) players[bbIndex].isAllIn = true;

    const firstToAct = getNextActivePlayer(players, bbIndex);

    set({
      players,
      deck,
      communityCards: [],
      pot: sbAmount + bbAmount,
      sidePots: [],
      dealerIndex: newDealerIndex,
      currentPlayerIndex: firstToAct,
      phase: 'pre-flop',
      minimumRaise: state.bigBlind,
      lastRaiseAmount: state.bigBlind,
      handNumber: state.handNumber + 1,
      coachMessage: null,
      handResult: null,
      isAnimating: false,
      actionLog: [
        { player: players[sbIndex].name, action: 'posts small blind', amount: sbAmount },
        { player: players[bbIndex].name, action: 'posts big blind', amount: bbAmount },
      ],
    });

    setTimeout(() => get().updateCoachTip(), 100);
  },

  playerAction: (action: PlayerAction, amount?: number) => {
    const state = get();
    const playerIndex = state.currentPlayerIndex;
    const player = state.players[playerIndex];
    if (!player || player.hasFolded || player.isAllIn) return;

    const players = [...state.players.map((p) => ({ ...p }))];
    const currentPlayer = players[playerIndex];
    let pot = state.pot;
    const toCall = Math.max(0, getMaxBet(players) - currentPlayer.currentBet);
    const log = [...state.actionLog];
    let minRaise = state.minimumRaise;
    let lastRaise = state.lastRaiseAmount;

    switch (action) {
      case 'fold':
        currentPlayer.hasFolded = true;
        log.push({ player: currentPlayer.name, action: 'folds' });
        break;
      case 'check':
        log.push({ player: currentPlayer.name, action: 'checks' });
        break;
      case 'call': {
        const callAmount = Math.min(toCall, currentPlayer.chips);
        currentPlayer.chips -= callAmount;
        currentPlayer.currentBet += callAmount;
        currentPlayer.totalBetThisRound += callAmount;
        pot += callAmount;
        if (currentPlayer.chips === 0) currentPlayer.isAllIn = true;
        log.push({ player: currentPlayer.name, action: 'calls', amount: callAmount });
        break;
      }
      case 'raise': {
        const raiseAmount = amount || minRaise;
        const totalBet = toCall + raiseAmount;
        const actualAmount = Math.min(totalBet, currentPlayer.chips);
        currentPlayer.chips -= actualAmount;
        currentPlayer.currentBet += actualAmount;
        currentPlayer.totalBetThisRound += actualAmount;
        pot += actualAmount;
        if (currentPlayer.chips === 0) currentPlayer.isAllIn = true;
        const raiseOver = actualAmount - toCall;
        if (raiseOver > lastRaise) {
          lastRaise = raiseOver;
          minRaise = raiseOver;
        }
        log.push({ player: currentPlayer.name, action: 'raises', amount: actualAmount });
        break;
      }
      case 'all-in': {
        const allInAmount = currentPlayer.chips;
        currentPlayer.currentBet += allInAmount;
        currentPlayer.totalBetThisRound += allInAmount;
        pot += allInAmount;
        currentPlayer.chips = 0;
        currentPlayer.isAllIn = true;
        log.push({ player: currentPlayer.name, action: 'goes all-in', amount: allInAmount });
        break;
      }
    }

    const activePlayers = players.filter((p) => !p.hasFolded);
    if (activePlayers.length === 1) {
      const winner = activePlayers[0];
      set({
        players,
        pot,
        actionLog: log,
        handResult: {
          winners: [{ playerId: winner.id, handDescription: 'Last player standing', amount: pot }],
          playerHands: [],
        },
        phase: 'hand-complete',
        handsPlayed: state.handsPlayed + 1,
        handsWon: winner.isHuman ? state.handsWon + 1 : state.handsWon,
      });
      players.find((p) => p.id === winner.id)!.chips += pot;
      set({ players: [...players], pot: 0 });
      updateDifficulty(get, set);
      return;
    }

    const nextPlayer = getNextActivePlayer(players, playerIndex);
    const bettingComplete = isBettingRoundComplete(players, state.phase, state.dealerIndex);

    if (bettingComplete) {
      players.forEach((p) => { p.currentBet = 0; });
      set({ players, pot, minimumRaise: minRaise, lastRaiseAmount: lastRaise, actionLog: log });
      get().nextPhase();
    } else {
      set({
        players,
        pot,
        currentPlayerIndex: nextPlayer,
        minimumRaise: minRaise,
        lastRaiseAmount: lastRaise,
        actionLog: log,
        coachMessage: null,
      });
    }
  },

  processAITurns: async () => {
    const processNext = async () => {
      const state = get();
      if (state.phase === 'hand-complete' || state.phase === 'showdown' || state.phase === 'waiting') return;

      const current = state.players[state.currentPlayerIndex];
      if (!current || current.isHuman || current.hasFolded || current.isAllIn) {
        if (current && (current.hasFolded || current.isAllIn) && !current.isHuman) {
          const next = getNextActivePlayer(state.players, state.currentPlayerIndex);
          if (isBettingRoundComplete(state.players, state.phase, state.dealerIndex)) {
            state.players.forEach((p) => { p.currentBet = 0; });
            set({ players: [...state.players] });
            get().nextPhase();
            return;
          }
          set({ currentPlayerIndex: next });
          await processNext();
        }
        return;
      }

      set({ isAnimating: true });
      await delay(800 + Math.random() * 600);

      const decision = getAIDecision(
        current,
        state.communityCards,
        state.pot,
        getMaxBet(state.players),
        state.minimumRaise,
        state.phase,
        state.difficulty,
      );

      get().playerAction(decision.action, decision.amount);
      set({ isAnimating: false });

      await delay(300);
      const newState = get();
      if (newState.phase !== 'hand-complete' && newState.phase !== 'showdown' && newState.phase !== 'waiting') {
        const nextP = newState.players[newState.currentPlayerIndex];
        if (nextP && !nextP.isHuman && !nextP.hasFolded && !nextP.isAllIn) {
          await processNext();
        } else {
          get().updateCoachTip();
        }
      }
    };

    await processNext();
  },

  nextPhase: () => {
    const state = get();
    let { deck, communityCards } = state;
    const { phase } = state;
    const players = state.players.map((p) => ({ ...p, currentBet: 0 }));
    let newPhase: GamePhase = phase;

    const allInOrFolded = players.every((p) => p.hasFolded || p.isAllIn);

    switch (phase) {
      case 'pre-flop': {
        const { dealt, remaining } = dealCards(deck, 3);
        communityCards = dealt.map((c) => ({ ...c, faceUp: true }));
        deck = remaining;
        newPhase = 'flop';
        break;
      }
      case 'flop': {
        const { dealt, remaining } = dealCards(deck, 1);
        communityCards = [...communityCards, ...dealt.map((c) => ({ ...c, faceUp: true }))];
        deck = remaining;
        newPhase = 'turn';
        break;
      }
      case 'turn': {
        const { dealt, remaining } = dealCards(deck, 1);
        communityCards = [...communityCards, ...dealt.map((c) => ({ ...c, faceUp: true }))];
        deck = remaining;
        newPhase = 'river';
        break;
      }
      case 'river':
        newPhase = 'showdown';
        break;
    }

    if (newPhase === 'showdown' || (allInOrFolded && newPhase !== phase)) {
      while (communityCards.length < 5) {
        const { dealt, remaining } = dealCards(deck, 1);
        communityCards = [...communityCards, ...dealt.map((c) => ({ ...c, faceUp: true }))];
        deck = remaining;
      }

      const activePlayers = players.filter((p) => !p.hasFolded);
      const playerHands = activePlayers.map((p) => ({
        playerId: p.id,
        result: evaluateHand(p.holeCards, communityCards),
      }));

      playerHands.sort((a, b) => compareHands(b.result, a.result));
      const bestHand = playerHands[0].result;
      const winnerHands = playerHands.filter((ph) => compareHands(ph.result, bestHand) === 0);

      const shareAmount = Math.floor(state.pot / winnerHands.length);
      const winners = winnerHands.map((wh) => ({
        playerId: wh.playerId,
        handDescription: wh.result.description,
        amount: shareAmount,
      }));

      for (const w of winners) {
        const p = players.find((pl) => pl.id === w.playerId)!;
        p.chips += w.amount;
      }

      players.forEach((p) => {
        if (!p.hasFolded) {
          p.holeCards = p.holeCards.map((c) => ({ ...c, faceUp: true }));
        }
      });

      const humanWon = winners.some((w) => w.playerId === 'human');

      set({
        players,
        communityCards,
        deck,
        phase: 'showdown',
        handResult: { winners, playerHands },
        pot: 0,
        handsPlayed: state.handsPlayed + 1,
        handsWon: humanWon ? state.handsWon + 1 : state.handsWon,
      });
      updateDifficulty(get, set);
      return;
    }

    const firstToAct = getNextActivePlayer(players, state.dealerIndex);

    set({
      players,
      communityCards,
      deck,
      phase: newPhase,
      currentPlayerIndex: firstToAct,
      minimumRaise: state.bigBlind,
      lastRaiseAmount: state.bigBlind,
    });

    setTimeout(() => {
      const s = get();
      const p = s.players[s.currentPlayerIndex];
      if (p && !p.isHuman && !p.hasFolded && !p.isAllIn) {
        get().processAITurns();
      } else {
        get().updateCoachTip();
      }
    }, 500);
  },

  dismissCoachMessage: () => set({ coachMessage: null }),

  setShowTutorial: (show: boolean) => set({ showTutorial: show }),

  updateCoachTip: () => {
    const state = get();
    const human = state.players.find((p) => p.isHuman);
    if (!human || human.hasFolded || state.phase === 'waiting' || state.phase === 'hand-complete' || state.phase === 'showdown') {
      return;
    }

    const tip = generateCoachTip(
      human.holeCards,
      state.communityCards,
      state.phase,
      state.pot,
      getMaxBet(state.players),
      human.currentBet,
    );
    set({ coachMessage: tip });
  },
}));

function getNextActivePlayer(players: Player[], fromIndex: number): number {
  let idx = (fromIndex + 1) % players.length;
  let safety = 0;
  while ((players[idx].hasFolded || players[idx].isAllIn || players[idx].chips <= 0) && safety < players.length) {
    idx = (idx + 1) % players.length;
    safety++;
  }
  return idx;
}

function getMaxBet(players: Player[]): number {
  return Math.max(0, ...players.map((p) => p.currentBet));
}

function isBettingRoundComplete(players: Player[], _phase: GamePhase, _dealerIndex: number): boolean {
  const active = players.filter((p) => !p.hasFolded && !p.isAllIn);
  if (active.length <= 1) return true;
  const maxBet = getMaxBet(players);
  return active.every((p) => p.currentBet === maxBet);
}

function updateDifficulty(
  get: () => GameStore,
  set: (partial: Partial<GameStore>) => void,
) {
  const state = get();
  const winRate = state.handsPlayed > 0 ? state.handsWon / state.handsPlayed : 0;

  let newDifficulty = state.difficulty;
  let newLevel = state.playerLevel;

  if (state.handsPlayed >= 5 && state.handsPlayed % 5 === 0) {
    if (winRate > 0.4 && newDifficulty < 4) {
      newDifficulty = Math.min(4, newDifficulty + 1);
      newLevel = Math.min(4, newLevel + 1);
    } else if (winRate < 0.15 && newDifficulty > 1) {
      newDifficulty = Math.max(1, newDifficulty - 1);
    }
  }

  if (newDifficulty !== state.difficulty) {
    set({ difficulty: newDifficulty, playerLevel: newLevel });
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
