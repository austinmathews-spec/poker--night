import { Card, HandResult, HandRank, RANK_VALUES } from './types';

function getCombinations(cards: Card[], size: number): Card[][] {
  const result: Card[][] = [];
  function combine(start: number, current: Card[]) {
    if (current.length === size) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < cards.length; i++) {
      current.push(cards[i]);
      combine(i + 1, current);
      current.pop();
    }
  }
  combine(0, []);
  return result;
}

function evaluateFiveCards(cards: Card[]): HandResult {
  const values = cards.map((c) => RANK_VALUES[c.rank]).sort((a, b) => b - a);
  const suits = cards.map((c) => c.suit);

  const isFlush = suits.every((s) => s === suits[0]);

  const uniqueValues = [...new Set(values)].sort((a, b) => b - a);
  let isStraight = false;
  let straightHigh = 0;

  if (uniqueValues.length === 5) {
    if (uniqueValues[0] - uniqueValues[4] === 4) {
      isStraight = true;
      straightHigh = uniqueValues[0];
    }
    if (
      uniqueValues[0] === 14 &&
      uniqueValues[1] === 5 &&
      uniqueValues[2] === 4 &&
      uniqueValues[3] === 3 &&
      uniqueValues[4] === 2
    ) {
      isStraight = true;
      straightHigh = 5;
    }
  }

  const counts: Record<number, number> = {};
  for (const v of values) {
    counts[v] = (counts[v] || 0) + 1;
  }
  const countEntries = Object.entries(counts)
    .map(([val, cnt]) => ({ value: Number(val), count: cnt }))
    .sort((a, b) => b.count - a.count || b.value - a.value);

  if (isFlush && isStraight && straightHigh === 14) {
    return {
      rank: 'Royal Flush',
      rankValue: 10,
      highCards: [14],
      description: 'Royal Flush!',
    };
  }

  if (isFlush && isStraight) {
    return {
      rank: 'Straight Flush',
      rankValue: 9,
      highCards: [straightHigh],
      description: `Straight Flush, ${rankName(straightHigh)} high`,
    };
  }

  if (countEntries[0].count === 4) {
    const quad = countEntries[0].value;
    const kicker = countEntries[1].value;
    return {
      rank: 'Four of a Kind',
      rankValue: 8,
      highCards: [quad, kicker],
      description: `Four of a Kind, ${rankName(quad)}s`,
    };
  }

  if (countEntries[0].count === 3 && countEntries[1].count === 2) {
    return {
      rank: 'Full House',
      rankValue: 7,
      highCards: [countEntries[0].value, countEntries[1].value],
      description: `Full House, ${rankName(countEntries[0].value)}s full of ${rankName(countEntries[1].value)}s`,
    };
  }

  if (isFlush) {
    return {
      rank: 'Flush',
      rankValue: 6,
      highCards: values,
      description: `Flush, ${rankName(values[0])} high`,
    };
  }

  if (isStraight) {
    return {
      rank: 'Straight',
      rankValue: 5,
      highCards: [straightHigh],
      description: `Straight, ${rankName(straightHigh)} high`,
    };
  }

  if (countEntries[0].count === 3) {
    const trips = countEntries[0].value;
    const kickers = countEntries.slice(1).map((e) => e.value);
    return {
      rank: 'Three of a Kind',
      rankValue: 4,
      highCards: [trips, ...kickers],
      description: `Three of a Kind, ${rankName(trips)}s`,
    };
  }

  if (countEntries[0].count === 2 && countEntries[1].count === 2) {
    const high = Math.max(countEntries[0].value, countEntries[1].value);
    const low = Math.min(countEntries[0].value, countEntries[1].value);
    const kicker = countEntries[2].value;
    return {
      rank: 'Two Pair',
      rankValue: 3,
      highCards: [high, low, kicker],
      description: `Two Pair, ${rankName(high)}s and ${rankName(low)}s`,
    };
  }

  if (countEntries[0].count === 2) {
    const pair = countEntries[0].value;
    const kickers = countEntries.slice(1).map((e) => e.value);
    return {
      rank: 'One Pair',
      rankValue: 2,
      highCards: [pair, ...kickers],
      description: `Pair of ${rankName(pair)}s`,
    };
  }

  return {
    rank: 'High Card',
    rankValue: 1,
    highCards: values,
    description: `${rankName(values[0])} high`,
  };
}

function rankName(value: number): string {
  const names: Record<number, string> = {
    2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six',
    7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten',
    11: 'Jack', 12: 'Queen', 13: 'King', 14: 'Ace',
  };
  return names[value] || String(value);
}

export function evaluateHand(holeCards: Card[], communityCards: Card[]): HandResult {
  const allCards = [...holeCards, ...communityCards];
  if (allCards.length < 5) {
    return { rank: 'High Card', rankValue: 1, highCards: [], description: 'Not enough cards' };
  }

  const combinations = getCombinations(allCards, 5);
  let best: HandResult | null = null;

  for (const combo of combinations) {
    const result = evaluateFiveCards(combo);
    if (!best || compareHands(result, best) > 0) {
      best = result;
    }
  }

  return best!;
}

export function compareHands(a: HandResult, b: HandResult): number {
  if (a.rankValue !== b.rankValue) return a.rankValue - b.rankValue;
  for (let i = 0; i < Math.min(a.highCards.length, b.highCards.length); i++) {
    if (a.highCards[i] !== b.highCards[i]) return a.highCards[i] - b.highCards[i];
  }
  return 0;
}

export function getHandStrength(holeCards: Card[], communityCards: Card[]): number {
  if (communityCards.length === 0) {
    return getPreFlopStrength(holeCards);
  }
  const result = evaluateHand(holeCards, communityCards);
  return result.rankValue / 10 + result.highCards[0] / 140;
}

function getPreFlopStrength(holeCards: Card[]): number {
  const v1 = RANK_VALUES[holeCards[0].rank];
  const v2 = RANK_VALUES[holeCards[1].rank];
  const high = Math.max(v1, v2);
  const low = Math.min(v1, v2);
  const suited = holeCards[0].suit === holeCards[1].suit;
  const isPair = v1 === v2;

  let strength = 0;

  if (isPair) {
    strength = 0.5 + (high / 14) * 0.5;
  } else {
    strength = (high + low) / 28;
    if (suited) strength += 0.05;
    if (high - low <= 2) strength += 0.03;
    if (high - low === 1) strength += 0.02;
  }

  if (isPair && high >= 10) strength = Math.min(strength + 0.15, 1);
  if (high === 14 && low >= 10) strength = Math.min(strength + 0.1, 1);
  if (high === 14 && low === 13 && suited) strength = 0.95;
  if (isPair && high === 14) strength = 0.95;

  return Math.max(0, Math.min(1, strength));
}

export function getHandRankDescription(rank: HandRank): string {
  const descriptions: Record<HandRank, string> = {
    'Royal Flush': 'A, K, Q, J, 10 all of the same suit. The best possible hand!',
    'Straight Flush': 'Five consecutive cards of the same suit.',
    'Four of a Kind': 'Four cards of the same rank.',
    'Full House': 'Three of a kind plus a pair.',
    'Flush': 'Five cards of the same suit, not in sequence.',
    'Straight': 'Five consecutive cards of mixed suits.',
    'Three of a Kind': 'Three cards of the same rank.',
    'Two Pair': 'Two different pairs.',
    'One Pair': 'Two cards of the same rank.',
    'High Card': 'No combination — highest card plays.',
  };
  return descriptions[rank];
}
