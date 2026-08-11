export type VictoryAnimationMode = 'level-complete' | 'game-win';

export const VICTORY_FLIGHT_DURATION_MS = {
  'level-complete': 2800,
  'game-win': 3300,
} as const;

export const triggerVictoryFlight = (
  mode: VictoryAnimationMode,
  setMode: (mode: VictoryAnimationMode | null) => void,
) => {
  setMode(mode);
};
