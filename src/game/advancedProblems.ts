import type { HandTemplate, TileCode } from "./types";

// The winning tile is kept separate from the concealed tiles.
function tiles(codes: string): TileCode[] {
  return codes.split(" ") as TileCode[];
}

export const advancedTemplates: HandTemplate[] = [
  {
    key: "sanbaiman-ryanpeikou-ron",
    title: "二盃口とドラ2の12翻",
    level: "advanced",
    concealed: tiles("2m 3m 1m 2m 3m 5m 6m 7m 5m 6m 7m 9m 9m"),
    winningTile: "1m",
    solution: {
      groups: [tiles("1m 2m 3m"), tiles("1m 2m 3m"), tiles("5m 6m 7m"), tiles("5m 6m 7m"), tiles("9m 9m")],
      winningGroup: 0, wait: "両面",
    },
    melds: [],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["4m"],
    han: 12,
    fu: 30,
    yaku: [
      { name: "清一色", han: 6 },
      { name: "二盃口", han: 3 },
      { name: "平和", han: 1 },
      { name: "ドラ", han: 2 },
    ],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "門前ロン", fu: 10 },
    ],
    explanation:
      "123萬と567萬がそれぞれ2組ある二盃口。23萬に一萬をロンする両面待ちで平和も成立します。表示牌の四萬に対して五萬2枚がドラ。清一色6＋二盃口3＋平和1＋ドラ2＝12翻の三倍満です。一盃口は重複せず、七対子としての10翻より高い順子形を採用します。20＋10＝30符です。",
  },
  {
    key: "sanbaiman-ryanpeikou-tsumo",
    title: "二盃口の平和ツモで11翻",
    level: "advanced",
    concealed: tiles("2p 3p 4p 2p 3p 4p 6p 7p 8p 6p 7p 1p 1p"),
    winningTile: "8p",
    solution: {
      groups: [tiles("2p 3p 4p"), tiles("2p 3p 4p"), tiles("6p 7p 8p"), tiles("6p 7p 8p"), tiles("1p 1p")],
      winningGroup: 3, wait: "両面",
    },
    melds: [],
    win: "tsumo",
    roundWind: "東",
    doraIndicators: ["north"],
    han: 11,
    fu: 20,
    yaku: [
      { name: "清一色", han: 6 },
      { name: "二盃口", han: 3 },
      { name: "平和", han: 1 },
      { name: "門前清自摸和", han: 1 },
    ],
    fuDetails: [{ label: "平和ツモの固定符（ツモ符を加算しない）", fu: 20 }],
    explanation:
      "234筒と678筒を2組ずつそろえ、雀頭は一筒。67筒の両面待ちを八筒でツモした平和形です。清一色6＋二盃口3＋平和1＋門前清自摸和1＝11翻の三倍満。一盃口は重複せず、七対子としての9翻より高い順子形を採用します。表示牌の北に対するドラは東で、手牌にはありません。平和ツモはツモ符を加えず20符固定です。",
  },
  {
    key: "kazoe-iipeikou-ittsu-ron",
    title: "一盃口・一気通貫とドラ3の数え役満",
    level: "advanced",
    concealed: tiles("1s 2s 3s 1s 2s 3s 4s 5s 6s 7s 8s 5s 5s"),
    winningTile: "9s",
    solution: {
      groups: [tiles("1s 2s 3s"), tiles("1s 2s 3s"), tiles("4s 5s 6s"), tiles("7s 8s 9s"), tiles("5s 5s")],
      winningGroup: 3, wait: "両面",
    },
    melds: [],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["4s"],
    han: 13,
    fu: 30,
    yaku: [
      { name: "清一色", han: 6 },
      { name: "一盃口", han: 1 },
      { name: "一気通貫", han: 2 },
      { name: "平和", han: 1 },
      { name: "ドラ", han: 3 },
    ],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "門前ロン", fu: 10 },
    ],
    explanation:
      "123索が2組ある一盃口と、123・456・789索の一気通貫が複合します。78索に九索をロンする両面待ちで平和も成立。表示牌の四索に対して、456索の五索1枚と雀頭の五索2枚がドラです。清一色6＋一盃口1＋一気通貫2＋平和1＋ドラ3＝13翻の数え役満。20＋10＝30符です。",
  },
  {
    key: "kazoe-chinitsu-sanankou-ron",
    title: "清一色・三暗刻とドラ3の数え役満",
    level: "advanced",
    concealed: tiles("1p 1p 1p 3p 3p 3p 6p 6p 6p 8p 8p 5p 5p"),
    winningTile: "8p",
    solution: {
      groups: [tiles("1p 1p 1p"), tiles("3p 3p 3p"), tiles("6p 6p 6p"), tiles("8p 8p 8p"), tiles("5p 5p")],
      winningGroup: 3, wait: "シャンポン",
    },
    melds: [],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["2p"],
    han: 13,
    fu: 50,
    yaku: [
      { name: "清一色", han: 6 },
      { name: "対々和", han: 2 },
      { name: "三暗刻", han: 2 },
      { name: "ドラ", han: 3 },
    ],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "門前ロン", fu: 10 },
      { label: "一筒の暗刻（么九牌）", fu: 8 },
      { label: "三筒・六筒の暗刻（中張牌）", fu: 8 },
      { label: "八筒のロン完成刻子（中張牌の明刻扱い）", fu: 2 },
    ],
    explanation:
      "五筒・八筒のシャンポン待ちを八筒でロン。八筒の刻子は明刻扱いなので三暗刻であり、四暗刻にはなりません。副露はないため清一色は6翻です。表示牌の二筒に対して三筒3枚がドラで、清一色6＋対々和2＋三暗刻2＋ドラ3＝13翻の数え役満。20＋10＋8＋8＋2＝48符を50符へ切り上げます。",
  },
  {
    key: "sanbaiman-shousangen-sanankou-ron",
    title: "小三元・混一色・三暗刻の11翻",
    level: "advanced",
    concealed: tiles("white white white green green green 2s 2s 2s 7s 7s red red"),
    winningTile: "7s",
    solution: {
      groups: [tiles("white white white"), tiles("green green green"), tiles("2s 2s 2s"), tiles("7s 7s 7s"), tiles("red red")],
      winningGroup: 3, wait: "シャンポン",
    },
    melds: [],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["9m"],
    han: 11,
    fu: 60,
    yaku: [
      { name: "混一色", han: 3 },
      { name: "小三元", han: 2 },
      { name: "役牌・白", han: 1 },
      { name: "役牌・發", han: 1 },
      { name: "対々和", han: 2 },
      { name: "三暗刻", han: 2 },
    ],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "門前ロン", fu: 10 },
      { label: "白・發の暗刻（么九牌）", fu: 16 },
      { label: "二索の暗刻（中張牌）", fu: 4 },
      { label: "七索のロン完成刻子（中張牌の明刻扱い）", fu: 2 },
      { label: "中の雀頭（役牌）", fu: 2 },
    ],
    explanation:
      "白と發の刻子、中の雀頭で小三元。白・發の役牌2翻も別に加算します。七索・中のシャンポン待ちを七索でロンしたため、七索は明刻扱いで三暗刻です。混一色3＋小三元2＋役牌2＋対々和2＋三暗刻2＝11翻の三倍満。中は刻子ではないので大三元ではなく、四暗刻も成立しません。表示牌の九萬に対する一萬はなく、ドラは0枚。20＋10＋16＋4＋2＋2＝54符を60符へ切り上げます。",
  },
  {
    key: "sanbaiman-tanyao-sanankou-ron",
    title: "断么九・清一色・三暗刻の11翻",
    level: "advanced",
    concealed: tiles("2m 2m 2m 4m 4m 4m 6m 6m 8m 8m 8m 3m 3m"),
    winningTile: "6m",
    solution: {
      groups: [tiles("2m 2m 2m"), tiles("4m 4m 4m"), tiles("6m 6m 6m"), tiles("8m 8m 8m"), tiles("3m 3m")],
      winningGroup: 2, wait: "シャンポン",
    },
    melds: [],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["north"],
    han: 11,
    fu: 50,
    yaku: [
      { name: "清一色", han: 6 },
      { name: "断么九", han: 1 },
      { name: "対々和", han: 2 },
      { name: "三暗刻", han: 2 },
    ],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "門前ロン", fu: 10 },
      { label: "二萬・四萬・八萬の暗刻（中張牌）", fu: 12 },
      { label: "六萬のロン完成刻子（中張牌の明刻扱い）", fu: 2 },
    ],
    explanation:
      "萬子の2〜8だけで清一色と断么九。三萬・六萬のシャンポン待ちを六萬でロンし、二萬・四萬・八萬の3組が暗刻として残ります。六萬は明刻扱いなので四暗刻ではありません。清一色6＋断么九1＋対々和2＋三暗刻2＝11翻の三倍満。表示牌の北に対するドラは東で、手牌にはありません。20＋10＋12＋2＝44符を50符へ切り上げます。",
  },
];
