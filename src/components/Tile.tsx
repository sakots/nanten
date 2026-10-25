import type { TileCode } from "../game/types";
import { normalizeTile } from "../game/tiles";
import "./Tile.css";

const numerals = [
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "七",
  "八",
  "九",
] as const;
const honorNames = {
  east: "東",
  south: "南",
  west: "西",
  north: "北",
  white: "白",
  green: "發",
  red: "中",
} as const;

export function tileName(code: TileCode): string {
  if (code in honorNames) return honorNames[code as keyof typeof honorNames];
  const suit = code[1] === "m" ? "萬" : code[1] === "p" ? "筒" : "索";
  return `${code[0] === "0" ? "赤" : ""}${numerals[Number(normalizeTile(code)[0]) - 1]}${suit}`;
}

// Hand-drawn strokes keep every character independent of installed fonts.
const glyphs = {
  一: "M12 50H88",
  二: "M22 28H78 M12 74H88",
  三: "M18 20H82 M25 49H75 M10 80H90",
  四: "M14 18H86V83H14Z M38 20V48Q38 62 25 68 M62 20V58Q62 64 70 64H83",
  五: "M16 17H84 M43 18L34 80 M19 45H73V80 M10 83H90",
  六: "M45 10L55 25 M12 34H88 M35 49Q28 73 12 87 M65 49Q75 67 88 85",
  七: "M10 43L88 30 M43 10V73Q43 85 56 85H78Q87 85 87 72",
  八: "M34 17Q33 60 10 86 M63 17Q65 59 90 86",
  九: "M12 35H64L58 77Q57 87 69 87H80Q89 87 89 74 M42 10Q43 68 15 90",
  萬: "M10 15H90 M32 6V25 M68 6V25 M23 31H77V58H23Z M24 44H76 M50 30V73 M14 90V69H86V91L74 88 M30 70V82H69V70 M50 69V87",
  東: "M10 17H90 M24 30H76V60H24Z M25 45H75 M50 5V94 M48 61Q33 80 9 88 M52 61Q69 80 91 88",
  南: "M10 18H90 M50 5V31 M17 92V32H83V91L71 87 M33 40L40 51 M67 40L60 51 M29 54H71 M30 70H70 M50 54V88",
  西: "M9 15H91 M15 34H85V87H15Z M38 16V48Q38 65 23 72 M61 16V61Q61 67 69 67H83 M16 82H84",
  北: "M35 8V89 M11 34H34 M10 80L35 69 M61 8V77Q61 88 73 88H82Q90 88 90 74 M62 48Q76 40 87 28",
  發: "M23 7L39 20 M10 29L27 39 M39 9Q29 35 8 47 M60 8Q72 32 93 43 M70 10L60 22 M84 23L73 32 M31 39H67 M14 51H39V66H18L15 82H39L36 94H25 M54 50H82 M56 51Q58 78 86 93 M80 52Q76 80 49 94 M53 67H85",
  中: "M14 25H86V70H14Z M50 5V95",
} as const;

type GlyphName = keyof typeof glyphs;
type Color = "ink" | "red" | "green";
type Point = readonly [number, number];

function Glyph({
  name,
  x,
  y,
  width,
  height,
  color = "ink",
}: {
  name: GlyphName;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: Color;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${width / 100} ${height / 100})`}
      className={`nt-tile-${color}`}
    >
      <path
        d={glyphs[name]}
        fill="none"
        stroke="currentColor"
        strokeWidth={name === "萬" ? 5.5 : 6.5}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </g>
  );
}

const dotLayouts: readonly (readonly Point[])[] = [
  [],
  [[21, 27]],
  [
    [21, 15],
    [21, 40],
  ],
  [
    [12, 13],
    [21, 27],
    [30, 41],
  ],
  [
    [12, 14],
    [30, 14],
    [12, 40],
    [30, 40],
  ],
  [
    [12, 12],
    [30, 12],
    [21, 27],
    [12, 42],
    [30, 42],
  ],
  [
    [12, 12],
    [30, 12],
    [12, 27],
    [30, 27],
    [12, 42],
    [30, 42],
  ],
  [
    [10, 11],
    [21, 17],
    [32, 23],
    [12, 34],
    [30, 34],
    [12, 45],
    [30, 45],
  ],
  [
    [12, 10],
    [30, 10],
    [12, 22],
    [30, 22],
    [12, 34],
    [30, 34],
    [12, 46],
    [30, 46],
  ],
  [
    [10, 12],
    [21, 12],
    [32, 12],
    [10, 27],
    [21, 27],
    [32, 27],
    [10, 42],
    [21, 42],
    [32, 42],
  ],
];

function dotColor(rank: number, index: number): Color {
  if (rank === 3) return index === 1 ? "red" : "ink";
  if (rank === 5) return index === 2 ? "red" : "ink";
  if (rank === 6) return index < 2 ? "ink" : "red";
  if (rank === 7) return index < 3 ? "ink" : "red";
  if (rank === 9) return index >= 3 && index < 6 ? "red" : "ink";
  return "ink";
}

function Circles({ rank, red = false }: { rank: number; red?: boolean }) {
  if (rank === 1) {
    return (
      <g transform="translate(21 27)" fill="none" strokeWidth="1.5">
        <circle r="15" className="nt-tile-ink" stroke="currentColor" />
        <circle r="12.5" className="nt-tile-ink" stroke="currentColor" />
        <circle
          r="10"
          className="nt-tile-ink"
          stroke="currentColor"
          strokeDasharray="2.4 1.5"
        />
        <circle r="7" className="nt-tile-red" stroke="currentColor" />
        <circle
          r="3.5"
          className="nt-tile-red"
          fill="currentColor"
          stroke="none"
        />
      </g>
    );
  }
  const radius = rank === 2 ? 9 : rank <= 5 ? 6.5 : rank === 6 ? 6 : 5;
  return (
    <g>
      {dotLayouts[rank].map(([x, y], index) => (
        <g
          key={index}
          transform={`translate(${x} ${y})`}
          className={`nt-tile-${red ? "red" : dotColor(rank, index)}`}
        >
          <circle
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <circle
            r={radius * 0.49}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <circle r="0.85" fill="currentColor" />
        </g>
      ))}
    </g>
  );
}

type BambooMark = readonly [
  x: number,
  y: number,
  rotation?: number,
  height?: number,
];

const bambooLayouts: readonly (readonly BambooMark[])[] = [
  [],
  [],
  [
    [21, 16],
    [21, 39],
  ],
  [
    [21, 15],
    [12, 38],
    [30, 38],
  ],
  [
    [12, 15],
    [30, 15],
    [12, 39],
    [30, 39],
  ],
  [
    [11, 13],
    [31, 13],
    [21, 27],
    [11, 41],
    [31, 41],
  ],
  [
    [10, 16],
    [21, 16],
    [32, 16],
    [10, 39],
    [21, 39],
    [32, 39],
  ],
  [
    [21, 10],
    [10, 27],
    [21, 27],
    [32, 27],
    [10, 43],
    [21, 43],
    [32, 43],
  ],
  [
    [9, 16],
    [15, 21, 55, 14],
    [27, 21, -55, 14],
    [33, 16],
    [9, 40],
    [15, 35, -55, 14],
    [27, 35, 55, 14],
    [33, 40],
  ],
  [
    [10, 12],
    [21, 12],
    [32, 12],
    [10, 27],
    [21, 27],
    [32, 27],
    [10, 42],
    [21, 42],
    [32, 42],
  ],
];

const peacockEyes: readonly Point[] = [
  [18, 12],
  [24, 12],
  [15, 17],
  [21, 17],
  [27, 17],
  [12, 22],
  [18, 22],
  [24, 22],
  [30, 22],
  [15, 27],
  [21, 27],
  [27, 27],
];

function Bamboo({ rank, red = false }: { rank: number; red?: boolean }) {
  if (rank === 1) {
    return (
      <g strokeLinejoin="round" strokeLinecap="round">
        <path
          d="M8 27Q10 17 15 11Q21 5 27 11Q32 17 34 27Q21 33 8 27Z"
          className="nt-tile-green"
          fill="currentColor"
        />
        <g
          className="nt-tile-paper"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
        >
          {peacockEyes.map(([x, y], index) => (
            <circle key={index} cx={x} cy={y} r="1.3" />
          ))}
        </g>
        <g
          className="nt-tile-ink"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
        >
          <path d="M7 31L20 42L6 42Z M27 30L36 40L23 42Z M9 32L8 40 M12 34L11 41 M15 37L14 41 M29 32L27 40 M32 35L30 41 M8 36L15 40 M29 35L33 39" />
          <path d="M15 31L26 42 M18 30L29 40 M21 30L32 38 M24 31L16 38 M28 32L20 40" />
        </g>
        <path
          d="M13 33Q9 29 8 34L9 39Q10 45 21 43Q29 43 30 39Q27 37 23 38L15 39Z"
          className="nt-tile-ink nt-tile-bird-body"
          stroke="currentColor"
          strokeWidth="0.9"
        />
        <circle
          cx="10"
          cy="34"
          r="0.7"
          className="nt-tile-ink"
          fill="currentColor"
        />
        <path
          d="M8 35L5 36L8 37 M16 44L15 48H13 M23 44L23 48H21"
          className="nt-tile-red"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
      </g>
    );
  }
  const height = rank <= 6 ? 18 : rank === 8 ? 20 : 12;
  return (
    <g>
      {bambooLayouts[rank].map(
        ([x, y, rotation = 0, length = height], index) => (
          <g
            key={index}
            transform={`translate(${x} ${y}) rotate(${rotation})`}
            className={`nt-tile-${red || (rank === 5 && index === 2) || (rank === 7 && index === 0) || (rank === 9 && index % 3 === 1) ? "red" : "green"}`}
          >
            <path
              d={`M-2 ${-length / 2}Q-4 ${-length / 2} -3 ${-length / 2 + 2}L-2 -1.8Q-3.7 0 -2 1.8L-2.5 ${length / 2 - 2}Q-4 ${length / 2} -2 ${length / 2}H2Q4 ${length / 2} 2.5 ${length / 2 - 2}L2 1.8Q3.7 0 2 -1.8L3 ${-length / 2 + 2}Q4 ${-length / 2} 2 ${-length / 2}Z`}
              fill="currentColor"
            />
            <path
              d={`M0 ${-length / 2 + 2}V${length / 2 - 2}`}
              className="nt-tile-paper"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path d="M-2.8 0H2.8" stroke="currentColor" strokeWidth="1.5" />
          </g>
        ),
      )}
    </g>
  );
}

function Face({ code }: { code: TileCode }) {
  if (code === "white") return null;
  if (code in honorNames) {
    return (
      <Glyph
        name={honorNames[code as Exclude<keyof typeof honorNames, "white">]}
        x={6}
        y={9}
        width={30}
        height={37}
        color={code === "green" ? "green" : code === "red" ? "red" : "ink"}
      />
    );
  }
  const red = code[0] === "0";
  const rank = Number(normalizeTile(code)[0]);
  if (code[1] === "p") return <Circles rank={rank} red={red} />;
  if (code[1] === "s") return <Bamboo rank={rank} red={red} />;
  return (
    <>
      <Glyph name={numerals[rank - 1]} x={9} y={5} width={24} height={20} color={red ? "red" : "ink"} />
      <Glyph name="萬" x={7} y={27} width={28} height={24} color="red" />
    </>
  );
}

export function Tile({
  code,
  compact = false,
  back = false,
}: {
  code: TileCode;
  compact?: boolean;
  back?: boolean;
}) {
  return (
    <span
      className={`nt-tile${compact ? " nt-tile-compact" : ""}${back ? " nt-tile-back" : ""}`}
      role="img"
      aria-label={back ? "裏向きの牌" : tileName(code)}
    >
      <svg viewBox="0 0 42 58" aria-hidden="true" focusable="false">
        <rect
          className="nt-tile-edge"
          x="0.7"
          y="0.7"
          width="40.6"
          height="54"
          rx="4"
        />
        <rect
          className="nt-tile-face"
          x="0.7"
          y="3.5"
          width="40.6"
          height="50.3"
          rx="4"
        />
        {back ? (
          <>
            <rect
              className="nt-tile-back-panel"
              x="3.5"
              y="3.5"
              width="35"
              height="46.5"
              rx="2.4"
            />
            <path
              className="nt-tile-back-detail"
              d="M7 8H35V45H7Z M10 11H32V42H10Z"
            />
          </>
        ) : (
          <Face code={code} />
        )}
      </svg>
    </span>
  );
}
