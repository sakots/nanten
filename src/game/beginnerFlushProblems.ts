import type { HandTemplate, TileCode } from "./types";

// Concealed tiles do not include the winning tile or any declared meld.
function tiles(codes: string): TileCode[] {
  return codes.split(" ") as TileCode[];
}

export const beginnerFlushTemplates: HandTemplate[] = [
  {
    key: "beginner-chinitsu-open-chi-kanchan",
    title: "チーした清一色の5翻",
    level: "basic",
    concealed: tiles("3p 5p 6p 7p 8p 9p 9p 9p 5p 5p"),
    winningTile: "4p",
    solution: {
      groups: [tiles("3p 4p 5p"), tiles("6p 7p 8p"), tiles("9p 9p 9p"), tiles("5p 5p")],
      winningGroup: 0, wait: "嵌張",
    },
    melds: [{ tiles: tiles("1p 2p 3p"), kind: "chi", open: true }],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["north"],
    han: 5,
    fu: 30,
    yaku: [{ name: "清一色", han: 5 }],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "九筒の暗刻（么九牌）", fu: 8 },
      { label: "嵌張待ち", fu: 2 },
    ],
    explanation:
      "筒子だけで字牌がないので、役は清一色だけです。123筒をチーしているため5翻で、満貫になります。35筒に四筒をロンする嵌張待ちです。ドラ表示牌の北に対する東はなく、ドラは0枚。符は副底20＋九筒の暗刻8＋嵌張2＝30符です。鳴いているので門前ロンの10符は付きません。",
  },
  {
    key: "beginner-chinitsu-open-pon-tanki",
    title: "ポンした清一色の単騎待ち",
    level: "basic",
    concealed: tiles("1s 2s 3s 3s 4s 5s 5s 6s 7s 8s"),
    winningTile: "8s",
    solution: {
      groups: [tiles("1s 2s 3s"), tiles("3s 4s 5s"), tiles("5s 6s 7s"), tiles("8s 8s")],
      winningGroup: 3, wait: "単騎",
    },
    melds: [{ tiles: tiles("9s 9s 9s"), kind: "pon", open: true }],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["north"],
    han: 5,
    fu: 30,
    yaku: [{ name: "清一色", han: 5 }],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "九索の明刻（么九牌）", fu: 4 },
      { label: "単騎待ち", fu: 2 },
    ],
    explanation:
      "九索をポンしていても、索子だけで字牌がなければ清一色です。役は副露した清一色の5翻だけで、満貫になります。八索を単騎でロンして雀頭を完成させます。北表示のドラは東で、手牌にはなく0枚。符は20＋九索の明刻4＋単騎2＝26符を30符へ切り上げます。",
  },
  {
    key: "beginner-chinitsu-two-calls-shanpon-tsumo",
    title: "二つ鳴いても清一色は5翻",
    level: "basic",
    concealed: tiles("4m 4m 4m 9m 9m 7m 7m"),
    winningTile: "9m",
    solution: {
      groups: [tiles("4m 4m 4m"), tiles("9m 9m 9m"), tiles("7m 7m")],
      winningGroup: 1, wait: "シャンポン",
    },
    melds: [
      { tiles: tiles("1m 2m 3m"), kind: "chi", open: true },
      { tiles: tiles("8m 8m 8m"), kind: "pon", open: true },
    ],
    win: "tsumo",
    roundWind: "東",
    doraIndicators: ["north"],
    han: 5,
    fu: 40,
    yaku: [{ name: "清一色", han: 5 }],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "八萬の明刻（中張牌）", fu: 2 },
      { label: "四萬の暗刻（中張牌）", fu: 4 },
      { label: "九萬の暗刻（么九牌）", fu: 8 },
      { label: "ツモ", fu: 2 },
    ],
    explanation:
      "チーとポンの2組があっても、萬子だけなら清一色の5翻で満貫です。七萬・九萬のシャンポン待ちを九萬でツモします。鳴いているので門前清自摸和は付かず、暗刻も四萬と九萬の2組なので三暗刻はありません。役は清一色だけで、北表示の東もなくドラ0枚。符は20＋八萬の明刻2＋四萬の暗刻4＋九萬の暗刻8＋ツモ2＝36符から40符です。",
  },
  {
    key: "beginner-chinitsu-open-kan-four-dora",
    title: "清一色と明槓のドラ4枚",
    level: "basic",
    concealed: tiles("2m 3m 4m 4m 5m 6m 7m 8m 2m 2m"),
    winningTile: "9m",
    solution: {
      groups: [tiles("2m 3m 4m"), tiles("4m 5m 6m"), tiles("7m 8m 9m"), tiles("2m 2m")],
      winningGroup: 2, wait: "両面",
    },
    melds: [{ tiles: tiles("1m 1m 1m 1m"), kind: "kan", open: true }],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["9m", "north"],
    han: 9,
    fu: 40,
    yaku: [
      { name: "清一色", han: 5 },
      { name: "ドラ", han: 4 },
    ],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "一萬の明槓（么九牌）", fu: 16 },
    ],
    explanation:
      "一萬を明槓した萬子だけの手で、役は清一色5翻だけです。九萬表示の次は一萬なので、明槓の4枚がすべてドラ。もう1枚の表示牌の北に対する東はありません。清一色5＋ドラ4＝9翻の倍満です。78萬に九萬をロンする両面待ちで、符は副底20＋一萬の明槓16＝36符を40符へ切り上げます。一萬は槓の4枚だけで、手牌や表示牌に5枚目はありません。",
  },
  {
    key: "beginner-chinitsu-closed-tanki-ron",
    title: "門前の清一色は6翻",
    level: "basic",
    concealed: tiles("1s 1s 1s 2s 3s 4s 5s 6s 7s 6s 7s 8s 9s"),
    winningTile: "9s",
    solution: {
      groups: [tiles("1s 1s 1s"), tiles("2s 3s 4s"), tiles("5s 6s 7s"), tiles("6s 7s 8s"), tiles("9s 9s")],
      winningGroup: 4, wait: "単騎",
    },
    melds: [],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["north"],
    han: 6,
    fu: 40,
    yaku: [{ name: "清一色", han: 6 }],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "門前ロン", fu: 10 },
      { label: "一索の暗刻（么九牌）", fu: 8 },
      { label: "単騎待ち", fu: 2 },
    ],
    explanation:
      "索子だけを鳴かずにそろえた清一色は6翻で、跳満になります。九索の単騎待ちをロンする形で、一索の刻子もあるため平和は付きません。順子は234・567・678で、一盃口や一気通貫もなく、役は清一色だけです。北表示の東はなくドラ0枚。符は20＋門前ロン10＋一索の暗刻8＋単騎2＝40符です。",
  },
  {
    key: "beginner-chinitsu-concealed-kan-ron",
    title: "暗槓しても門前清一色の6翻",
    level: "basic",
    concealed: tiles("1p 2p 3p 5p 7p 7p 8p 9p 2p 2p"),
    winningTile: "6p",
    solution: {
      groups: [tiles("1p 2p 3p"), tiles("5p 6p 7p"), tiles("7p 8p 9p"), tiles("2p 2p")],
      winningGroup: 1, wait: "嵌張",
    },
    melds: [{ tiles: tiles("4p 4p 4p 4p"), kind: "kan", open: false }],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["north", "west"],
    han: 6,
    fu: 50,
    yaku: [{ name: "清一色", han: 6 }],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "門前ロン", fu: 10 },
      { label: "四筒の暗槓（中張牌）", fu: 16 },
      { label: "嵌張待ち", fu: 2 },
    ],
    explanation:
      "四筒の暗槓は門前を崩さないので、筒子だけの清一色は6翻のままで跳満です。57筒に六筒をロンする嵌張待ちで、槓子もあるため平和は付きません。ほかの役はなく、役は清一色だけ。表示牌の北・西に対するドラは東・北で、どちらもなく0枚です。符は20＋門前ロン10＋四筒の暗槓16＋嵌張2＝48符を50符へ切り上げます。",
  },
];
