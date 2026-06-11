export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660',
};

export type HandRank =
  | 'Royal Flush'
  | 'Straight Flush'
  | 'Four of a Kind'
  | 'Full House'
  | 'Flush'
  | 'Straight'
  | 'Three of a Kind'
  | 'Two Pair'
  | 'One Pair'
  | 'High Card';

export const HAND_RANK_VALUES: Record<HandRank, number> = {
  'Royal Flush': 10,
  'Straight Flush': 9,
  'Four of a Kind': 8,
  'Full House': 7,
  'Flush': 6,
  'Straight': 5,
  'Three of a Kind': 4,
  'Two Pair': 3,
  'One Pair': 2,
  'High Card': 1,
};

export interface HandResult {
  rank: HandRank;
  rankValue: number;
  highCards: number[];
  description: string;
}

export type PlayerAction = 'fold' | 'check' | 'call' | 'raise' | 'all-in';

export interface AIPersonality {
  name: string;
  title: string;
  avatar: string;
  style: string;
  tightness: number;
  aggression: number;
  bluffFrequency: number;
  description: string;
}

export interface Player {
  id: string;
  name: string;
  title: string;
  avatar: string;
  chips: number;
  holeCards: Card[];
  currentBet: number;
  totalBetThisRound: number;
  hasFolded: boolean;
  isAllIn: boolean;
  isDealer: boolean;
  isHuman: boolean;
  personality: AIPersonality | null;
  seatIndex: number;
}

export type GamePhase =
  | 'waiting'
  | 'pre-flop'
  | 'flop'
  | 'turn'
  | 'river'
  | 'showdown'
  | 'hand-complete';

export interface GameState {
  players: Player[];
  communityCards: Card[];
  pot: number;
  sidePots: { amount: number; eligiblePlayerIds: string[] }[];
  currentPlayerIndex: number;
  dealerIndex: number;
  smallBlind: number;
  bigBlind: number;
  phase: GamePhase;
  minimumRaise: number;
  lastRaiseAmount: number;
  handNumber: number;
  difficulty: number;
  playerLevel: number;
  handsWon: number;
  handsPlayed: number;
  showTutorial: boolean;
  coachMessage: string | null;
  handResult: {
    winners: { playerId: string; handDescription: string; amount: number }[];
    playerHands: { playerId: string; result: HandResult }[];
  } | null;
}

export const AI_PERSONALITIES: AIPersonality[] = [
  {
    name: 'Scott Wu',
    title: 'The Calculator',
    avatar: '/avatars/scott.png',
    style: 'Tight-Aggressive',
    tightness: 0.7,
    aggression: 0.8,
    bluffFrequency: 0.25,
    description: 'CEO who plays by the numbers. Rarely enters a pot, but when he does, watch out.',
  },
  {
    name: 'Walden Yan',
    title: 'The Wildcard',
    avatar: '/avatars/walden.png',
    style: 'Loose-Aggressive',
    tightness: 0.3,
    aggression: 0.85,
    bluffFrequency: 0.4,
    description: 'CPO who keeps you guessing. Plays lots of hands and applies maximum pressure.',
  },
  {
    name: 'Steven Hao',
    title: 'The Rock',
    avatar: '/avatars/steven.png',
    style: 'Tight-Passive',
    tightness: 0.8,
    aggression: 0.3,
    bluffFrequency: 0.1,
    description: 'CTO who only plays premium hands. Patient and methodical — if he bets, he has it.',
  },
  {
    name: 'Russell Kaplan',
    title: 'The Gambler',
    avatar: '/avatars/russell.png',
    style: 'Loose-Passive',
    tightness: 0.35,
    aggression: 0.4,
    bluffFrequency: 0.15,
    description: 'President who loves seeing flops. Calls a lot and hopes to get lucky.',
  },
];
