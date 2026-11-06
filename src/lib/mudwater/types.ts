/** Client safe shapes shared by the stadium and the setup strip. */

export interface ArenaPlayerState {
  barrel: number;
  entered: boolean;
  lastAction: number;
}

export interface PlayerState {
  handle: string;
  avatar: string | null;
  wallet: string | null;
  verified: boolean;
  isHolder?: boolean | null;
  holders: ArenaPlayerState | null;
  open: ArenaPlayerState | null;
}

export interface GameState {
  configured: boolean;
  chainId: number;
  contract: string;
  deadline: number;
  counts: { holders: number[]; open: number[] };
  sealed: { holders: boolean; open: boolean };
  player: PlayerState | null;
}
