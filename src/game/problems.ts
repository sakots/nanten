import type { HandTemplate, Level, Problem, TileCode } from "./types";
import { sortTiles } from "./tiles";
import { standardTemplates } from "./standardProblems";
import { advancedTemplates } from "./advancedProblems";
import { practiceExpansionTemplates } from "./practiceExpansion";
import { advancedExpansionTemplates } from "./advancedExpansion";
import { beginnerFlushTemplates } from "./beginnerFlushProblems";
import { beginnerSingleRoleTemplates } from "./beginnerSingleRoleProblems";
import { numericVariantTemplates } from "./numericVariantProblems";

// Space-separated literals keep the physical hand auditable; concealed NEVER includes the winning tile.
function tiles(codes: string): TileCode[] {
  return codes.split(" ") as TileCode[];
}

const templates: HandTemplate[] = [
  {
    key: "pinfu-ron",
    title: "両面待ちの平和",
    level: "advanced",
    concealed: tiles("2m 3m 4m 4p 5p 6p 6s 7s 8s 7s 8s 5p 5p"),
    winningTile: "9s",
    solution: {
      groups: [tiles("2m 3m 4m"), tiles("4p 5p 6p"), tiles("6s 7s 8s"), tiles("7s 8s 9s"), tiles("5p 5p")],
      winningGroup: 3, wait: "両面",
    },
    melds: [],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["north"],
    han: 1,
    fu: 30,
    yaku: [{ name: "平和", han: 1 }],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "門前ロン", fu: 10 },
    ],
    explanation:
      "789索の両面待ち。すべて順子で、雀頭の五筒は役牌ではありません。20＋10＝30符。ドラは東で、手牌にはありません。",
  },
  {
    key: "pinfu-tsumo",
    title: "平和ツモは20符",
    level: "advanced",
    concealed: tiles("2m 3m 4m 4p 5p 6p 6s 7s 8s 7s 8s 5p 5p"),
    winningTile: "9s",
    solution: {
      groups: [tiles("2m 3m 4m"), tiles("4p 5p 6p"), tiles("6s 7s 8s"), tiles("7s 8s 9s"), tiles("5p 5p")],
      winningGroup: 3, wait: "両面",
    },
    melds: [],
    win: "tsumo",
    roundWind: "東",
    doraIndicators: ["north"],
    han: 2,
    fu: 20,
    yaku: [
      { name: "平和", han: 1 },
      { name: "門前清自摸和", han: 1 },
    ],
    fuDetails: [{ label: "平和ツモの固定符（ツモ符を加算しない）", fu: 20 }],
    explanation:
      "平和と門前清自摸和で2翻。平和ツモは例外としてツモの2符を加えず、20符のまま計算します。",
  },
  {
    key: "open-tanyao",
    title: "鳴いた断么九",
    level: "advanced",
    concealed: tiles("4p 5p 6p 6s 7s 8s 2p 2p 3s 4s"),
    winningTile: "5s",
    solution: {
      groups: [tiles("4p 5p 6p"), tiles("6s 7s 8s"), tiles("3s 4s 5s"), tiles("2p 2p")],
      winningGroup: 2, wait: "両面",
    },
    melds: [{ tiles: tiles("2m 3m 4m"), kind: "chi", open: true }],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["north"],
    han: 1,
    fu: 30,
    yaku: [{ name: "断么九", han: 1 }],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "喰い平和形の最低30符への補正", fu: 10 },
    ],
    explanation:
      "すべて2〜8の数牌なので、副露していても断么九。通常の加符はなく20符ですが、平和形の副露ロンは最低30符です。",
  },
  {
    key: "white-pon",
    title: "白の明刻",
    level: "advanced",
    concealed: tiles("1m 2m 3m 4p 5p 6p 7s 8s 2p 2p"),
    winningTile: "9s",
    solution: {
      groups: [tiles("1m 2m 3m"), tiles("4p 5p 6p"), tiles("7s 8s 9s"), tiles("2p 2p")],
      winningGroup: 2, wait: "両面",
    },
    melds: [{ tiles: tiles("white white white"), kind: "pon", open: true }],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["north"],
    han: 1,
    fu: 30,
    yaku: [{ name: "役牌・白", han: 1 }],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "白の明刻（么九牌）", fu: 4 },
    ],
    explanation:
      "白の刻子で1翻。副底20＋么九牌の明刻4＝24符を、10符単位に切り上げて30符。両面待ちに待ち符は付きません。",
  },
  {
    key: "chiitoi-ron",
    title: "七対子の固定符",
    level: "advanced",
    concealed: tiles("1m 1m 3m 3m 5p 5p 7p 7p 2s 2s 4s 4s west"),
    winningTile: "west",
    solution: {
      groups: [tiles("1m 1m"), tiles("3m 3m"), tiles("5p 5p"), tiles("7p 7p"), tiles("2s 2s"), tiles("4s 4s"), tiles("west west")],
      winningGroup: 6, wait: "単騎",
    },
    melds: [],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["north"],
    han: 2,
    fu: 25,
    yaku: [{ name: "七対子", han: 2 }],
    fuDetails: [{ label: "七対子の固定符", fu: 25 }],
    explanation:
      "異なる7種類の対子で七対子。25符固定で、単騎待ちや門前ロンの符は加えず、30符にも切り上げません。",
  },
  {
    key: "concealed-kan",
    title: "暗槓とドラの60符",
    level: "advanced",
    concealed: tiles("2m 3m 4m 4p 5p 6p 6s 7s 2p 2p"),
    winningTile: "8s",
    solution: {
      groups: [tiles("2m 3m 4m"), tiles("4p 5p 6p"), tiles("6s 7s 8s"), tiles("2p 2p")],
      winningGroup: 2, wait: "両面",
    },
    melds: [
      { tiles: tiles("white white white white"), kind: "kan", open: false },
    ],
    win: "tsumo",
    roundWind: "東",
    doraIndicators: ["7s"],
    han: 3,
    fu: 60,
    yaku: [
      { name: "役牌・白", han: 1 },
      { name: "門前清自摸和", han: 1 },
      { name: "ドラ", han: 1 },
    ],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "白の暗槓（么九牌）", fu: 32 },
      { label: "ツモ", fu: 2 },
    ],
    explanation:
      "暗槓だけなら門前のままです。ドラ表示牌の七索に対してドラは八索が1枚。20＋32＋2＝54符を60符へ切り上げます。3翻60符は切り上げ満貫にしません。",
  },
  {
    key: "open-chinitsu",
    title: "副露した清一色",
    level: "intermediate",
    concealed: tiles("3m 4m 5m 6m 7m 8m 7m 8m 5m 5m"),
    winningTile: "9m",
    solution: {
      groups: [tiles("3m 4m 5m"), tiles("6m 7m 8m"), tiles("7m 8m 9m"), tiles("5m 5m")],
      winningGroup: 2, wait: "両面",
    },
    melds: [{ tiles: tiles("1m 2m 3m"), kind: "chi", open: true }],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["north"],
    han: 5,
    fu: 30,
    yaku: [{ name: "清一色（副露）", han: 5 }],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "喰い平和形の最低30符への補正", fu: 10 },
    ],
    explanation:
      "萬子だけで字牌がない清一色。副露により6翻から5翻になり満貫です。順子は123・345・678・789なので一気通貫や一盃口はありません。",
  },
  {
    key: "honitsu-ittsu",
    title: "混一色・一気通貫とドラ",
    level: "intermediate",
    concealed: tiles("1s 2s 3s 4s 5s 6s 7s 8s north north"),
    winningTile: "9s",
    solution: {
      groups: [tiles("1s 2s 3s"), tiles("4s 5s 6s"), tiles("7s 8s 9s"), tiles("north north")],
      winningGroup: 2, wait: "両面",
    },
    melds: [{ tiles: tiles("white white white"), kind: "pon", open: true }],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["west"],
    han: 6,
    fu: 30,
    yaku: [
      { name: "混一色（副露）", han: 2 },
      { name: "一気通貫（副露）", han: 1 },
      { name: "役牌・白", han: 1 },
      { name: "ドラ", han: 2 },
    ],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "白の明刻（么九牌）", fu: 4 },
    ],
    explanation:
      "索子と字牌の混一色に123・456・789の一気通貫、白が複合。表示牌の西の次は北なので雀頭の北2枚がドラです。24符を30符へ切り上げます。北は場風でも自風でもありません。",
  },
  {
    key: "sanankou",
    title: "対々和と三暗刻",
    level: "intermediate",
    concealed: tiles("2m 2m 2m 5p 5p 5p 8s 8s north north"),
    winningTile: "8s",
    solution: {
      groups: [tiles("2m 2m 2m"), tiles("5p 5p 5p"), tiles("8s 8s 8s"), tiles("north north")],
      winningGroup: 2, wait: "シャンポン",
    },
    melds: [{ tiles: tiles("white white white"), kind: "pon", open: true }],
    win: "tsumo",
    roundWind: "東",
    doraIndicators: ["south"],
    han: 5,
    fu: 40,
    yaku: [
      { name: "対々和", han: 2 },
      { name: "三暗刻", han: 2 },
      { name: "役牌・白", han: 1 },
    ],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "白の明刻（么九牌）", fu: 4 },
      { label: "中張牌の暗刻3組", fu: 12 },
      { label: "ツモ", fu: 2 },
    ],
    explanation:
      "八索はツモなので三つ目の暗刻になります。白は副露していますが三暗刻は成立。20＋4＋12＋2＝38符から40符。門前ではないので門前清自摸和は付きません。",
  },
  {
    key: "closed-chinitsu",
    title: "門前清一色の倍満",
    level: "intermediate",
    concealed: tiles("1m 2m 3m 3m 4m 5m 6m 7m 8m 7m 8m 5m 5m"),
    winningTile: "9m",
    solution: {
      groups: [tiles("1m 2m 3m"), tiles("3m 4m 5m"), tiles("6m 7m 8m"), tiles("7m 8m 9m"), tiles("5m 5m")],
      winningGroup: 3, wait: "両面",
    },
    melds: [],
    win: "tsumo",
    roundWind: "東",
    doraIndicators: ["north"],
    han: 8,
    fu: 20,
    yaku: [
      { name: "清一色", han: 6 },
      { name: "平和", han: 1 },
      { name: "門前清自摸和", han: 1 },
    ],
    fuDetails: [{ label: "平和ツモの固定符（ツモ符を加算しない）", fu: 20 }],
    explanation:
      "門前の清一色6翻に平和・門前清自摸和が複合して8翻の倍満。789萬の両面待ち、雀頭は五萬なので平和の条件を満たします。",
  },
  {
    key: "daisangen",
    title: "三元牌をそろえた大三元",
    level: "intermediate",
    concealed: tiles("2m 3m 5p 5p"),
    winningTile: "4m",
    solution: {
      groups: [tiles("2m 3m 4m"), tiles("5p 5p")],
      winningGroup: 0, wait: "両面",
    },
    melds: [
      { tiles: tiles("white white white"), kind: "pon", open: true },
      { tiles: tiles("green green green"), kind: "pon", open: true },
      { tiles: tiles("red red red"), kind: "pon", open: true },
    ],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["north"],
    han: 13,
    fu: 40,
    yaku: [{ name: "大三元（役満）", han: 13 }],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "三元牌の明刻3組", fu: 12 },
    ],
    explanation:
      "白・發・中すべての刻子で大三元の役満。役満は通常役やドラを加算しません。表示上は13翻相当とし、符は20＋12＝32符から40符ですが、支払いは符に関係なく役満です。",
  },
  {
    key: "honitsu-chiitoi",
    title: "混一色の七対子ツモ",
    level: "intermediate",
    concealed: tiles("1s 1s 2s 2s 4s 4s 5s 5s 7s 7s east east north"),
    winningTile: "north",
    solution: {
      groups: [tiles("1s 1s"), tiles("2s 2s"), tiles("4s 4s"), tiles("5s 5s"), tiles("7s 7s"), tiles("east east"), tiles("north north")],
      winningGroup: 6, wait: "単騎",
    },
    melds: [],
    win: "tsumo",
    roundWind: "東",
    doraIndicators: ["8m"],
    han: 6,
    fu: 25,
    yaku: [
      { name: "混一色", han: 3 },
      { name: "七対子", han: 2 },
      { name: "門前清自摸和", han: 1 },
    ],
    fuDetails: [{ label: "七対子の固定符", fu: 25 }],
    explanation:
      "索子と字牌による混一色3翻に七対子2翻、門前清自摸和1翻で跳満。風牌は対子なので役牌は付きません。七対子はツモでも25符固定です。",
  },
  {
    key: "sanbaiman-ittsu-tsumo",
    title: "清一色・一気通貫の三倍満",
    level: "intermediate",
    concealed: tiles("1m 2m 3m 4m 5m 6m 7m 8m 2m 3m 4m 5m 5m"),
    winningTile: "9m",
    solution: {
      groups: [tiles("1m 2m 3m"), tiles("4m 5m 6m"), tiles("7m 8m 9m"), tiles("2m 3m 4m"), tiles("5m 5m")],
      winningGroup: 2, wait: "両面",
    },
    melds: [],
    win: "tsumo",
    roundWind: "東",
    doraIndicators: ["7m"],
    han: 11,
    fu: 20,
    yaku: [
      { name: "清一色", han: 6 },
      { name: "一気通貫", han: 2 },
      { name: "平和", han: 1 },
      { name: "門前清自摸和", han: 1 },
      { name: "ドラ", han: 1 },
    ],
    fuDetails: [{ label: "平和ツモの固定符（ツモ符を加算しない）", fu: 20 }],
    explanation:
      "萬子の清一色に123・456・789の一気通貫、平和、門前清自摸和が複合。表示牌の七萬に対して八萬1枚がドラです。6＋2＋1＋1＋1＝11翻の三倍満。平和ツモは20符固定です。",
  },
  {
    key: "sanbaiman-tanyao-ron",
    title: "断么九・清一色とドラ4の三倍満",
    level: "intermediate",
    concealed: tiles("2m 3m 4m 4m 5m 6m 5m 6m 7m 6m 7m 5m 5m"),
    winningTile: "8m",
    solution: {
      groups: [tiles("2m 3m 4m"), tiles("4m 5m 6m"), tiles("5m 6m 7m"), tiles("6m 7m 8m"), tiles("5m 5m")],
      winningGroup: 3, wait: "両面",
    },
    melds: [],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["4m"],
    han: 12,
    fu: 30,
    yaku: [
      { name: "清一色", han: 6 },
      { name: "断么九", han: 1 },
      { name: "平和", han: 1 },
      { name: "ドラ", han: 4 },
    ],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "門前ロン", fu: 10 },
    ],
    explanation:
      "2〜8の萬子だけなので清一色と断么九。678萬の両面待ちで平和も成立します。表示牌の四萬に対して五萬4枚がドラ。6＋1＋1＋4＝12翻で、数え役満には届かず三倍満です。門前ロンは30符です。",
  },
  {
    key: "sanbaiman-chiitoi",
    title: "清一色の七対子とドラ",
    level: "intermediate",
    concealed: tiles("1m 1m 2m 2m 3m 3m 5m 5m 6m 6m 8m 8m 9m"),
    winningTile: "9m",
    solution: {
      groups: [tiles("1m 1m"), tiles("2m 2m"), tiles("3m 3m"), tiles("5m 5m"), tiles("6m 6m"), tiles("8m 8m"), tiles("9m 9m")],
      winningGroup: 6, wait: "単騎",
    },
    melds: [],
    win: "tsumo",
    roundWind: "東",
    doraIndicators: ["4m"],
    han: 11,
    fu: 25,
    yaku: [
      { name: "清一色", han: 6 },
      { name: "七対子", han: 2 },
      { name: "門前清自摸和", han: 1 },
      { name: "ドラ", han: 2 },
    ],
    fuDetails: [{ label: "七対子の固定符", fu: 25 }],
    explanation:
      "萬子だけの七対子で清一色6翻・七対子2翻。門前清自摸和1翻と、表示牌の四萬に対する五萬のドラ2翻を加えて11翻の三倍満です。七対子はツモ・単騎待ちでも25符固定です。",
  },
  {
    key: "kazoe-tanyao-tsumo",
    title: "ツモを加えて13翻の数え役満",
    level: "intermediate",
    concealed: tiles("2m 3m 4m 4m 5m 6m 5m 6m 7m 6m 7m 5m 5m"),
    winningTile: "8m",
    solution: {
      groups: [tiles("2m 3m 4m"), tiles("4m 5m 6m"), tiles("5m 6m 7m"), tiles("6m 7m 8m"), tiles("5m 5m")],
      winningGroup: 3, wait: "両面",
    },
    melds: [],
    win: "tsumo",
    roundWind: "東",
    doraIndicators: ["4m"],
    han: 13,
    fu: 20,
    yaku: [
      { name: "清一色", han: 6 },
      { name: "断么九", han: 1 },
      { name: "平和", han: 1 },
      { name: "門前清自摸和", han: 1 },
      { name: "ドラ", han: 4 },
    ],
    fuDetails: [{ label: "平和ツモの固定符（ツモ符を加算しない）", fu: 20 }],
    explanation:
      "清一色6翻・断么九1翻・平和1翻・門前清自摸和1翻に、五萬4枚のドラ4翻を加えて13翻の数え役満。通常の役満役ではなく、役とドラの合計で成立します。平和ツモの20符ですが、支払いは符に関係なく役満です。",
  },
  {
    key: "kazoe-ittsu-ron",
    title: "一気通貫とドラ4の数え役満",
    level: "intermediate",
    concealed: tiles("1m 2m 3m 4m 5m 6m 7m 8m 3m 4m 5m 5m 5m"),
    winningTile: "9m",
    solution: {
      groups: [tiles("1m 2m 3m"), tiles("4m 5m 6m"), tiles("7m 8m 9m"), tiles("3m 4m 5m"), tiles("5m 5m")],
      winningGroup: 2, wait: "両面",
    },
    melds: [],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["4m"],
    han: 13,
    fu: 30,
    yaku: [
      { name: "清一色", han: 6 },
      { name: "一気通貫", han: 2 },
      { name: "平和", han: 1 },
      { name: "ドラ", han: 4 },
    ],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "門前ロン", fu: 10 },
    ],
    explanation:
      "清一色6翻に123・456・789の一気通貫2翻と平和1翻。表示牌の四萬に対して五萬4枚がドラで、6＋2＋1＋4＝13翻の数え役満です。門前ロンは30符ですが、支払いは符に関係なく役満です。",
  },
  ...standardTemplates,
  ...advancedTemplates,
  ...practiceExpansionTemplates,
  ...advancedExpansionTemplates,
  ...beginnerFlushTemplates,
  ...beginnerSingleRoleTemplates,
  ...numericVariantTemplates,
];

// Each shape is practiced once as a child and once as dealer. Winds are shown explicitly;
// no template has a wind triplet or value-wind pair that changes its fu with the seat.
export const problems: Problem[] = templates.flatMap(({ key, ...template }, index) => {
  const concealed = sortTiles(template.concealed);
  const patternNumber = index + 1;
  return [
    { ...template, concealed, patternNumber, id: `${key}-child`, dealer: false, seatWind: "南" as const },
    { ...template, concealed, patternNumber, id: `${key}-dealer`, dealer: true, seatWind: "東" as const },
  ];
});

const handShapes = new Map(problems.map((problem) => [
  problem,
  JSON.stringify([
    sortTiles([...problem.concealed, problem.winningTile]),
    problem.melds,
  ]),
]));

export function createSession(
  level: Level,
  random: () => number = Math.random,
): Problem[] {
  const pool = problems.filter(
    (problem) => level === "all" || problem.level === level,
  );
  // Fisher–Yates on a new array preserves the curated collection and samples without replacement.
  for (let i = pool.length - 1; i > 0; i--) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1)
      throw new RangeError("乱数は0以上1未満で指定してください。");
    const j = Math.floor(value * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const selected: Problem[] = [];
  const seen = new Set<string>();
  for (const problem of pool) {
    const shape = handShapes.get(problem)!;
    if (seen.has(shape)) continue;
    seen.add(shape);
    selected.push(problem);
    if (selected.length === 10) break;
  }
  return selected;
}
