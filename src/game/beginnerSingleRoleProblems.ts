import type { HandTemplate, TileCode } from "./types";

// Concealed tiles do not include the winning tile or any declared meld.
function tiles(codes: string): TileCode[] {
  return codes.split(" ") as TileCode[];
}

export const beginnerSingleRoleTemplates: HandTemplate[] = [
  {
    key: "beginner-honitsu-open-chi-numeric-dora-three",
    title: "混一色だけに二萬のドラ3",
    level: "basic",
    concealed: tiles("2m 2m 2m 3m 4m 7m 8m 9m west west"),
    winningTile: "5m",
    solution: {
      groups: [tiles("2m 2m 2m"), tiles("3m 4m 5m"), tiles("7m 8m 9m"), tiles("west west")],
      winningGroup: 1, wait: "両面",
    },
    melds: [{ tiles: tiles("4m 5m 6m"), kind: "chi", open: true }],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["1m"],
    han: 5,
    fu: 30,
    yaku: [
      { name: "混一色（副露）", han: 2 },
      { name: "ドラ", han: 3 },
    ],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "二萬の暗刻（中張牌）", fu: 4 },
    ],
    explanation:
      "萬子と西だけの混一色です。副露した混一色2翻が唯一の役で、一萬表示の二萬3枚がドラとなり、計5翻の満貫です。西は場風でも自風でもなく、雀頭に符は付きません。順子があるため対々和ではなく、123萬がないため一気通貫もありません。三・四萬から五萬で和了する両面待ちで、20＋4＝24符を30符へ切り上げます。満貫の支払いは符に左右されません。",
  },
  {
    key: "beginner-honitsu-open-north-dora-three",
    title: "混一色だけに北のドラ3",
    level: "basic",
    concealed: tiles("2s 3s 4s 4s 5s 6s 7s 8s west west"),
    winningTile: "9s",
    solution: {
      groups: [tiles("2s 3s 4s"), tiles("4s 5s 6s"), tiles("7s 8s 9s"), tiles("west west")],
      winningGroup: 2, wait: "両面",
    },
    melds: [{ tiles: tiles("north north north"), kind: "pon", open: true }],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["west"],
    han: 5,
    fu: 30,
    yaku: [
      { name: "混一色（副露）", han: 2 },
      { name: "ドラ", han: 3 },
    ],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "北の明刻（么九牌）", fu: 4 },
    ],
    explanation:
      "索子と西・北だけの混一色で、役は副露した混一色2翻だけです。西表示の次は北なので、ポンした北3枚がドラとなり、計5翻の満貫になります。北と西は場風でも自風でもなく、役牌は付きません。234索があるため混全帯么九ではなく、123索がないため一気通貫もありません。七・八索から九索で和了する両面待ちで、20＋4＝24符を30符へ切り上げます。満貫なので支払いに符は影響しません。",
  },
  {
    key: "beginner-daisangen-open-kan-concealed-dragon",
    title: "白の明槓と中の暗刻で大三元",
    level: "basic",
    concealed: tiles("red red red 3p 4p 6s 6s"),
    winningTile: "5p",
    solution: {
      groups: [tiles("red red red"), tiles("3p 4p 5p"), tiles("6s 6s")],
      winningGroup: 1, wait: "両面",
    },
    melds: [
      { tiles: tiles("white white white white"), kind: "kan", open: true },
      { tiles: tiles("green green green"), kind: "pon", open: true },
    ],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["north", "2p"],
    han: 13,
    fu: 50,
    yaku: [{ name: "大三元（役満）", han: 13 }],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "白の明槓（么九牌）", fu: 16 },
      { label: "發の明刻（么九牌）", fu: 4 },
      { label: "中の暗刻（么九牌）", fu: 8 },
    ],
    explanation:
      "白の明槓・發の明刻・中の暗刻がそろい、大三元の単一役満です。数牌の順子と雀頭があるため字一色にはならず、副露しているため四暗刻でもありません。槓によって表示牌は2枚あり、北表示の東はなく、二筒表示の三筒が1枚ありますが、役満では役牌やドラを加算しません。表示上は13翻相当です。三・四筒の両面待ちで、20＋16＋4＋8＝48符を50符へ切り上げますが、支払いは符に関係なく役満です。",
  },
  {
    key: "beginner-suuankou-numeric-concealed-kan-shanpon",
    title: "一萬の暗槓を含むシャンポンの四暗刻",
    level: "basic",
    concealed: tiles("4p 4p 4p 6m 6m 6m 8s 8s 2p 2p"),
    winningTile: "8s",
    solution: {
      groups: [tiles("4p 4p 4p"), tiles("6m 6m 6m"), tiles("8s 8s 8s"), tiles("2p 2p")],
      winningGroup: 2, wait: "シャンポン",
    },
    melds: [{ tiles: tiles("1m 1m 1m 1m"), kind: "kan", open: false }],
    win: "tsumo",
    roundWind: "東",
    doraIndicators: ["north", "3p"],
    han: 13,
    fu: 70,
    yaku: [{ name: "四暗刻（役満）", han: 13 }],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "一萬の暗槓（么九牌）", fu: 32 },
      { label: "四筒・六萬・八索の暗刻（中張牌）", fu: 12 },
      { label: "ツモ", fu: 2 },
    ],
    explanation:
      "二筒・八索のシャンポン待ちを八索でツモし、一萬の暗槓と3組の暗刻で四暗刻が成立します。暗槓では門前が保たれます。単騎待ちではないため通常の単一役満で、表示上は13翻相当です。槓で表示牌は2枚になり、北表示の東はなく、三筒表示の四筒3枚がドラですが、門前清自摸和・対々和やドラは別に加算しません。嶺上開花の条件はありません。20＋32＋12＋2＝66符を70符へ切り上げますが、役満の支払いは符に左右されません。",
  },
  {
    key: "beginner-tsuuiisou-open-kan-shanpon",
    title: "白の明槓を含む字一色",
    level: "basic",
    concealed: tiles("north north north red red green green"),
    winningTile: "red",
    solution: {
      groups: [tiles("north north north"), tiles("red red red"), tiles("green green")],
      winningGroup: 1, wait: "シャンポン",
    },
    melds: [
      { tiles: tiles("white white white white"), kind: "kan", open: true },
      { tiles: tiles("west west west"), kind: "pon", open: true },
    ],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["north", "green"],
    han: 13,
    fu: 60,
    yaku: [{ name: "字一色（役満）", han: 13 }],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "白の明槓（么九牌）", fu: 16 },
      { label: "西の明刻（么九牌）", fu: 4 },
      { label: "北の暗刻（么九牌）", fu: 8 },
      { label: "ロンで完成した中の明刻（么九牌）", fu: 4 },
      { label: "發の雀頭（役牌）", fu: 2 },
    ],
    explanation:
      "白・西・北・中の面子と發の雀頭で、字牌だけの字一色です。發は対子なので大三元ではなく、風牌の面子は西と北だけなので四喜和でもありません。副露があり、槓も1組だけの単一役満で、表示上は13翻相当です。表示牌は2枚あり、北表示の東はなく、發表示の中3枚がドラですが、小三元・役牌などの通常役やドラは加算しません。發・中のシャンポン待ちを中でロンした刻子は明刻扱いです。20＋16＋4＋8＋4＋2＝54符を60符へ切り上げますが、支払いは役満です。",
  },
  {
    key: "beginner-chinroutou-open-kan-shanpon",
    title: "九萬の明槓を含む清老頭",
    level: "basic",
    concealed: tiles("1m 1m 1m 9s 9s 9p 9p"),
    winningTile: "9s",
    solution: {
      groups: [tiles("1m 1m 1m"), tiles("9s 9s 9s"), tiles("9p 9p")],
      winningGroup: 1, wait: "シャンポン",
    },
    melds: [
      { tiles: tiles("9m 9m 9m 9m"), kind: "kan", open: true },
      { tiles: tiles("1p 1p 1p"), kind: "pon", open: true },
    ],
    win: "ron",
    roundWind: "東",
    doraIndicators: ["north", "8s"],
    han: 13,
    fu: 60,
    yaku: [{ name: "清老頭（役満）", han: 13 }],
    fuDetails: [
      { label: "副底", fu: 20 },
      { label: "九萬の明槓（么九牌）", fu: 16 },
      { label: "一筒の明刻（么九牌）", fu: 4 },
      { label: "一萬の暗刻（么九牌）", fu: 8 },
      { label: "ロンで完成した九索の明刻（么九牌）", fu: 4 },
    ],
    explanation:
      "すべて数牌の一・九でそろえた清老頭の単一役満です。2組を副露しているため四暗刻ではなく、槓も1組だけなので四槓子にはなりません。表示上は13翻相当とし、混老頭・対々和などの通常役は加算しません。槓で表示牌は2枚になり、北表示の東はなく、八索表示の九索3枚がドラですが、これも役満には加算しません。九筒・九索のシャンポン待ちを九索でロンし、九索は明刻扱いです。20＋16＋4＋8＋4＝52符を60符へ切り上げますが、符に関係なく役満の支払いになります。",
  },
];
