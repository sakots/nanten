import type { TileCode } from "../game/types";
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
  return `${numerals[Number(code[0]) - 1]}${suit}`;
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
type Color = "ink" | "red" | "green" | "blue";
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
  if (rank === 2) return index === 0 ? "green" : "red";
  if (rank === 3) return index === 0 ? "blue" : index === 1 ? "red" : "green";
  if (rank === 5) return index === 2 ? "red" : "blue";
  if (rank === 6) return index < 2 ? "green" : "red";
  if (rank === 7) return index < 3 ? "green" : "red";
  if (rank === 9) return index < 3 ? "green" : index < 6 ? "blue" : "red";
  return "blue";
}

function Circles({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <g transform="translate(21 27)" fill="none" strokeWidth="1.5">
        <circle r="12.4" className="nt-tile-blue" stroke="currentColor" />
        <circle r="9.8" className="nt-tile-green" stroke="currentColor" />
        <circle
          r="7.1"
          className="nt-tile-blue"
          stroke="currentColor"
          strokeDasharray="2.4 1.5"
        />
        <circle r="3.7" className="nt-tile-red" stroke="currentColor" />
        <circle
          r="1.2"
          className="nt-tile-red"
          fill="currentColor"
          stroke="none"
        />
      </g>
    );
  }
  const radius = rank >= 7 ? 4.3 : 5.2;
  return (
    <g>
      {dotLayouts[rank].map(([x, y], index) => (
        <g
          key={index}
          transform={`translate(${x} ${y})`}
          className={`nt-tile-${dotColor(rank, index)}`}
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

const bambooLayouts: readonly (readonly Point[])[] = [
  [],
  [],
  [
    [13, 27],
    [29, 27],
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
    [12, 12],
    [30, 12],
    [12, 27],
    [30, 27],
    [12, 42],
    [30, 42],
  ],
  [
    [10, 12],
    [21, 12],
    [32, 12],
    [12, 29],
    [30, 29],
    [12, 43],
    [30, 43],
  ],
  [
    [12, 9],
    [30, 9],
    [12, 21],
    [30, 21],
    [12, 33],
    [30, 33],
    [12, 45],
    [30, 45],
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

function Bamboo({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <g strokeLinejoin="round" strokeLinecap="round">
        <path
          d="M21 28Q8 33 10 44Q13 40 16 37Q13 47 17 49L23 32 M23 29Q32 33 33 45Q27 42 23 34"
          className="nt-tile-green"
          fill="currentColor"
        />
        <path
          d="M22 32Q14 28 17 20Q19 16 25 17L27 14L30 17L26 20Q29 27 22 32Z"
          className="nt-tile-green"
          fill="currentColor"
        />
        <path
          d="M18 24Q22 21 25 25L22 30Z"
          className="nt-tile-red"
          fill="currentColor"
        />
        <path
          d="M19 35L17 45 M23 36L24 46 M14 47H19 M22 48H27"
          className="nt-tile-blue"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        <path
          d="M27 17L32 18L27 20 M22 15L20 11 M24 14L25 10"
          className="nt-tile-red"
          stroke="currentColor"
          fill="none"
          strokeWidth="1.3"
        />
        <circle cx="25" cy="19" r="0.8" fill="#fffaf0" />
        <path
          d="M12 36L16 33 M12 40L16 36 M27 36L30 39"
          fill="none"
          stroke="#fffaf0"
          strokeWidth="0.8"
        />
      </g>
    );
  }
  const height = rank === 2 ? 30 : rank <= 4 ? 17 : rank === 8 ? 9 : 11;
  return (
    <g>
      {bambooLayouts[rank].map(([x, y], index) => (
        <g
          key={index}
          transform={`translate(${x} ${y})`}
          className={`nt-tile-${rank === 7 && index < 3 ? "red" : "green"}`}
        >
          <path
            d={`M-1.7 ${-height / 2}Q0 ${-height / 2 - 1} 1.7 ${-height / 2}L1.3 ${height / 2}Q0 ${height / 2 + 1} -1.3 ${height / 2}Z`}
            fill="currentColor"
          />
          <path
            d={`M-2.6 ${-height / 2 + 1}H2.6 M-2.5 0H2.5 M-2.5 ${height / 2 - 1}H2.5`}
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d={`M-0.4 ${-height / 2 + 2}V-1.4 M-0.4 1.4V${height / 2 - 2}`}
            stroke="#fffaf0"
            strokeWidth="0.55"
          />
        </g>
      ))}
    </g>
  );
}

function Face({ code }: { code: TileCode }) {
  if (code === "white") {
    return (
      <rect
        x="9"
        y="10"
        width="24"
        height="34"
        rx="1.3"
        fill="none"
        className="nt-tile-blue"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    );
  }
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
  const rank = Number(code[0]);
  if (code[1] === "p") return <Circles rank={rank} />;
  if (code[1] === "s") return <Bamboo rank={rank} />;
  return (
    <>
      <Glyph name={numerals[rank - 1]} x={9} y={5} width={24} height={20} />
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
          y="3"
          width="40.6"
          height="54"
          rx="4"
        />
        <rect
          className="nt-tile-face"
          x="0.7"
          y="0.7"
          width="40.6"
          height="52.5"
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
