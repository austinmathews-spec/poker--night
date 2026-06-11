import { Player, GamePhase, Card, PlayerAction } from './types';
import { getHandStrength } from './hand-evaluator';

interface AIDecision {
  action: PlayerAction;
  amount: number;
  reasoning: string;
}

export function getAIDecision(
  player: Player,
  communityCards: Card[],
  pot: number,
  currentBet: number,
  minimumRaise: number,
  phase: GamePhase,
  difficulty: number,
): AIDecision {
  const personality = player.personality!;
  const handStrength = getHandStrength(player.holeCards, communityCards);

  const scaledTightness = personality.tightness * (0.5 + difficulty * 0.125);
  const scaledAggression = personality.aggression * (0.4 + difficulty * 0.15);
  const scaledBluff = personality.bluffFrequency * (0.3 + difficulty * 0.175);

  const toCall = currentBet - player.currentBet;
  const potOdds = toCall > 0 ? toCall / (pot + toCall) : 0;

  const noise = difficulty < 3 ? (Math.random() - 0.5) * (0.3 - difficulty * 0.05) : 0;
  const effectiveStrength = Math.max(0, Math.min(1, handStrength + noise));

  const playThreshold = scaledTightness * 0.5;

  if (toCall === 0) {
    if (effectiveStrength > 0.7 && Math.random() < scaledAggression) {
      const raiseSize = computeRaiseSize(effectiveStrength, pot, minimumRaise, player.chips, scaledAggression);
      return {
        action: raiseSize >= player.chips ? 'all-in' : 'raise',
        amount: Math.min(raiseSize, player.chips),
        reasoning: `Strong hand (${(effectiveStrength * 100).toFixed(0)}%) — raising for value`,
      };
    }
    if (effectiveStrength > 0.5 && Math.random() < scaledAggression * 0.6) {
      const raiseSize = computeRaiseSize(effectiveStrength * 0.7, pot, minimumRaise, player.chips, scaledAggression);
      return {
        action: raiseSize >= player.chips ? 'all-in' : 'raise',
        amount: Math.min(raiseSize, player.chips),
        reasoning: `Decent hand — semi-bluff raise`,
      };
    }
    if (effectiveStrength < 0.3 && Math.random() < scaledBluff * 0.5) {
      const raiseSize = computeRaiseSize(0.5, pot, minimumRaise, player.chips, scaledAggression);
      return {
        action: raiseSize >= player.chips ? 'all-in' : 'raise',
        amount: Math.min(raiseSize, player.chips),
        reasoning: `Bluffing with a weak hand`,
      };
    }
    return { action: 'check', amount: 0, reasoning: 'Checking' };
  }

  if (effectiveStrength < playThreshold && effectiveStrength < potOdds * 1.5) {
    if (Math.random() < scaledBluff && toCall < pot * 0.3) {
      const raiseSize = computeRaiseSize(0.6, pot, minimumRaise, player.chips, scaledAggression);
      return {
        action: raiseSize >= player.chips ? 'all-in' : 'raise',
        amount: Math.min(raiseSize, player.chips),
        reasoning: `Bluff-raising to steal the pot`,
      };
    }
    return { action: 'fold', amount: 0, reasoning: `Weak hand (${(effectiveStrength * 100).toFixed(0)}%) — folding` };
  }

  if (effectiveStrength > 0.75 && Math.random() < scaledAggression) {
    const raiseSize = computeRaiseSize(effectiveStrength, pot, minimumRaise, player.chips, scaledAggression);
    if (raiseSize > toCall) {
      return {
        action: raiseSize >= player.chips ? 'all-in' : 'raise',
        amount: Math.min(raiseSize, player.chips),
        reasoning: `Very strong hand — raising big`,
      };
    }
  }

  if (toCall <= player.chips) {
    return { action: 'call', amount: toCall, reasoning: `Calling ${toCall}` };
  }

  if (effectiveStrength > 0.5) {
    return { action: 'all-in', amount: player.chips, reasoning: 'All-in with a playable hand' };
  }

  return { action: 'fold', amount: 0, reasoning: 'Cannot afford to call — folding' };
}

function computeRaiseSize(
  strength: number,
  pot: number,
  minimumRaise: number,
  chips: number,
  aggression: number,
): number {
  const baseBet = pot * (0.5 + strength * aggression);
  const raise = Math.max(minimumRaise, Math.round(baseBet));
  return Math.min(raise, chips);
}

export function generateCoachTip(
  holeCards: Card[],
  communityCards: Card[],
  phase: GamePhase,
  pot: number,
  currentBet: number,
  playerBet: number,
): string | null {
  const strength = getHandStrength(holeCards, communityCards);
  const toCall = currentBet - playerBet;

  if (phase === 'pre-flop') {
    if (strength > 0.8) {
      return "You have a premium hand! Consider raising to build the pot and thin the field.";
    }
    if (strength > 0.6) {
      return "Solid starting hand. A raise or call is reasonable here.";
    }
    if (strength > 0.4) {
      return "Marginal hand. Consider your position — calling is okay in late position, but folding is fine too.";
    }
    return "Weak starting hand. Most pros would fold this. Save your chips for better spots.";
  }

  if (phase === 'flop' || phase === 'turn' || phase === 'river') {
    if (strength > 0.8) {
      return "Very strong hand! Consider betting or raising for value. You want to get paid off.";
    }
    if (strength > 0.6) {
      return "Good hand. A bet for value or a call if facing a bet is usually correct.";
    }
    if (strength > 0.4 && toCall > 0) {
      const potOdds = ((toCall / (pot + toCall)) * 100).toFixed(0);
      return `Mediocre hand. You need ${potOdds}% equity to call profitably. Consider if your hand can improve.`;
    }
    if (strength <= 0.3 && toCall > 0) {
      return "Weak hand facing a bet. Folding saves chips for better opportunities.";
    }
    if (strength <= 0.3 && toCall === 0) {
      return "Weak hand but you can check for free. No need to bet — just see the next card.";
    }
  }

  return null;
}
