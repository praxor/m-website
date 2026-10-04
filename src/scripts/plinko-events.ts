export const PLINKO_STATE_EVENT = 'plinko:state';

export type PlinkoStateReason = 'ready' | 'score' | 'reset' | 'mode-change';

export type PlinkoStateDetail = {
  reason: PlinkoStateReason;
  totalPoints: number;
  pointsEarned: number;
  extremeMode: boolean;
};