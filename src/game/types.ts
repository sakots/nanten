export type Suit = "m" | "p" | "s";
export type TileCode =
  | `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}${Suit}`
  | "east"
  | "south"
  | "west"
  | "north"
  | "white"
  | "green"
  | "red";
export type Level = "all" | "basic" | "intermediate" | "advanced";
export type Win = "ron" | "tsumo";
export type Wind = "東" | "南" | "西" | "北";

export interface Problem {
  id: string;
  title: string;
  level: Exclude<Level, "all">;
  concealed: TileCode[];
  winningTile: TileCode;
  melds: { tiles: TileCode[]; kind: "chi" | "pon" | "kan"; open: boolean }[];
  solution: {
    groups: TileCode[][];
    winningGroup: number;
    wait: "両面" | "嵌張" | "辺張" | "シャンポン" | "単騎";
  };
  win: Win;
  dealer: boolean;
  roundWind: Wind;
  seatWind: Wind;
  doraIndicators: TileCode[];
  han: number;
  fu: number;
  yaku: { name: string; han: number }[];
  fuDetails: { label: string; fu: number }[];
  explanation: string;
}

export interface Score {
  basePoints: number;
  limit: string | null;
  payments: { label: string; points: number }[];
  total: number;
}

export type HandTemplate = Omit<Problem, "id" | "dealer" | "seatWind"> & {
  key: string;
};
