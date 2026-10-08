// Edit this file between games to set up categories and questions.
// Each category must have exactly as many questions as there are VALUES,
// in matching order (questions[i] corresponds to VALUES[i]).
//
// Each question is a song clip the players have to guess, given either as
// a local file or as a segment of a YouTube video:
//   audio   — path to a pre-trimmed clip, relative to index.html (put the files
//             in the audio/ folder). The whole file is played.
//   youtube — { id, start, end }: the video ID (the part after "v=" in the URL)
//             and where the clip starts and ends, in seconds (83.5) or "m:ss"
//             ("1:23.5"). `start` defaults to 0; without `end` the video plays
//             to its end. Needs an internet connection and the local server
//             (see README).
//   answer  — what the GM sees on "Reveal Answer", e.g. "Queen — Bohemian Rhapsody".

const VALUES = [100, 200, 300, 400, 500, 600, 800, 1000];

const CATEGORIES = [
  {
    name: "Alt-Rock & Punk Anthems",
    questions: [
      { youtube: { id: "BLZWkjBXfN8" }, answer: "Linkin Park — In the End" },
      { youtube: { id: "5qZQEq_C3vc" }, answer: "Linkin Park — Numb" },
      { youtube: { id: "-uQi0vJK9lk" }, answer: "The Offspring — The Kids Aren't Alright" },
      { youtube: { id: "gS86jipcKzw" }, answer: "Green Day — Basket Case" },
      { youtube: { id: "ulRXvH8VOl8" }, answer: "Green Day — Wake Me up When September Ends" },
      { youtube: { id: "iYcbfc_UB6M" }, answer: "Drowning Pool — Bodies" },
      { youtube: { id: "fT5t8Td9T44" }, answer: "Limp Bizkit — Take A Look Around" },
      { youtube: { id: "BepGmpLT9HA" }, answer: "The Offspring — Pretty Fly (For A White Guy)" },
    ],
  },
  {
    name: "Classic Rock",
    questions: [
      { youtube: { id: "cF3OWCYLLVQ" }, answer: "Dire Straits — Sultans Of Swing" },
      { youtube: { id: "170sceOWWXc" }, answer: "The Rolling Stones — Paint It Black" },
      { youtube: { id: "9fNrJMkTWEE" }, answer: "Kansas — Dust in the Wind" },
      { youtube: { id: "FhgFtXESdPk" }, answer: "Fleetwood Mac — The Chain" },
      { youtube: { id: "FS8p_F0Stog" }, answer: "Blue Oyster Cult — (Don't Fear) The Reaper" },
      { youtube: { id: "oNvWDP_GkiY" }, answer: "U2 — With Or Without You" },
      { youtube: { id: "qtwBFz6lfrY" }, answer: "Van Halen — Ain't Talkin' 'Bout Love" },
      { youtube: { id: "4K6cvc27_CE" }, answer: "Pink Floyd — Wish You Were Here" },
    ],
  },
  {
    name: "Metal & Heavy",
    questions: [
      { youtube: { id: "CHIWNDAwTqQ" }, answer: "Metallica — Enter Sandman" },
      { youtube: { id: "KUZ7jG7BKE8" }, answer: "Rammstein — Sonne" },
      { youtube: { id: "pTYIf2pkxzQ" }, answer: "Metallica — Nothing Else Matters" },
      { youtube: { id: "E0ozmU9cJDg" }, answer: "Metallica — Master of Puppets" },
      { youtube: { id: "jQjdEDWDeQ8" }, answer: "Rammstein — Engel" },
      { youtube: { id: "W4DfbinBgL4" }, answer: "Iron Maiden — The Trooper" },
      { youtube: { id: "60ZFYYqIzIQ" }, answer: "Rammstein — Ohne dich" },
      { youtube: { id: "ByBhN_X5nVg" }, answer: "System Of A Down — Roulette" },
    ],
  },
  {
    name: "Covers",
    questions: [
      { youtube: { id: "gSS2IgnnBo8" }, answer: "Johnny Cash — Hurt (original: Nine Inch Nails)" },
      { youtube: { id: "9PmfpsIh5w0" }, answer: "Metallica — Whiskey In The Jar (original: Thin Lizzy)" },
      { youtube: { id: "QJAL6VpX4dY" }, answer: "Israel Kamakawiwo'ole — Over the Rainbow (original: Judy Garland)" },
      { youtube: { id: "MYrXK5ek_PQ" }, answer: "Jeff Buckley — Hallelujah (original: Leonard Cohen)" },
      { youtube: { id: "3MXovHX3YNg" }, answer: "Geoff Castellucci — Sixteen Tons (original: Tennessee Ernie Ford)" },
      { youtube: { id: "QEnkU8bQ-xk" }, answer: "Johnny Cash — One (original: U2)" },
      { youtube: { id: "dAHf9AJHX3o" }, answer: "Placebo — Running Up That Hill (original: Kate Bush)" },
      { youtube: { id: "ub7N1zW1z-4" }, answer: "Nouvelle Vague — In a Manner of Speaking (feat. Camille) (original: Tuxedomoon)" },
    ],
  },
  {
    name: "Movie, TV & Game Soundtracks",
    questions: [
      { youtube: { id: "xxsvTvDQKMY" }, answer: "Joe Hisaishi — Merry-Go-Round of Life (from 'Howl's Moving Castle')" },
      { youtube: { id: "7GlsxNI4LVI" }, answer: "Hans Zimmer — Cornfield Chase (Interstellar)" },
      { youtube: { id: "UFFa0QoHWvE" }, answer: "Seatbelts — Tank! (Cowboy Bebop)" },
      { youtube: { id: "znfYwABeSZ0" }, answer: "Yann Tiersen — Comptine d'un autre été, l'après-midi (Amélie)" },
      { youtube: { id: "Y2UOwvUQ8L0" }, answer: "Gustavo Santaolalla — The Last of Us (video game)" },
      { youtube: { id: "1OZDaRhHHyM" }, answer: "Ryuichi Sakamoto — Merry Christmas Mr. Lawrence (film)" },
      { youtube: { id: "aF10I72tsio" }, answer: "John Murphy — In the House - In a Heartbeat (28 Days Later)" },
      { youtube: { id: "3w-FQoNrwHM" }, answer: "Frank Klepacki & The Tiberian Sons — Hell March (Command & Conquer: Red Alert)" },
    ],
  },
  {
    name: "Radiohead",
    questions: [
      { youtube: { id: "zFYEYRcjK2g" }, answer: "Radiohead — Creep" },
      { youtube: { id: "7374CZQoS2Y" }, answer: "Radiohead — No Surprises" },
      { youtube: { id: "7fv84nPfTH0" }, answer: "Radiohead — High and Dry" },
      { youtube: { id: "Bf01riuiJWA" }, answer: "Radiohead — Exit Music (For A Film)" },
      { youtube: { id: "CvjRlYpXS5U" }, answer: "Radiohead — Jigsaw Falling Into Place" },
      { youtube: { id: "2y6kop0VTXY" }, answer: "Radiohead — Street Spirit (Fade Out)" },
      { youtube: { id: "pYHEpDnvVPk" }, answer: "Radiohead — Reckoner" },
      { youtube: { id: "2w6kHS_IRrE" }, answer: "Radiohead — 2 + 2 = 5" },
    ],
  },
  {
    name: "Trip-Hop",
    questions: [
      { youtube: { id: "3h-JYx76QNM" }, answer: "Massive Attack — Teardrop (feat. Elizabeth Fraser)" },
      { youtube: { id: "c417rIku6Iw" }, answer: "Portishead — Glory Box" },
      { youtube: { id: "rxbCaiyYSXM" }, answer: "Nightmares On Wax — You Wish" },
      { youtube: { id: "7nxWP9BhI7w" }, answer: "Portishead — Roads" },
      { youtube: { id: "VLRa4nvkTy4" }, answer: "Massive Attack — Unfinished Sympathy (2012 Mix/Master) (feat. Shara Nelson)" },
      { youtube: { id: "hvlcwJINLy0" }, answer: "Hooverphonic — Mad About You (Orchestra Version)" },
      { youtube: { id: "aGDY6AX2zSI" }, answer: "Tricky & Martina Topley-Bird — Hell Is Round The Corner" },
      { youtube: { id: "Kyc6DkMAn5k" }, answer: "Morcheeba — Fragments of Freedom" },
    ],
  },
  {
    name: "Russian & Ukrainian Rock",
    questions: [
      { youtube: { id: "8wWrzr3_46Y" }, answer: "Океан Ельзи — Обійми" },
      { youtube: { id: "QDgTIM6-sFc" }, answer: "Один в каное — Демони" },
      { youtube: { id: "nsn_MGZIo0k" }, answer: "ДахаБраха — Монах" },
      { youtube: { id: "OOzkEbWEZFc" }, answer: "Аквариум — Стаканы" },
      { youtube: { id: "qk3NGiE9E0Q" }, answer: "Борис Гребенщиков — Время N" },
      { youtube: { id: "76XMuzO6HK0" }, answer: "Lumen — Гореть (2023)" },
      { youtube: { id: "rl2OQTkyfAY" }, answer: "Аквариум — Небо цвета дождя" },
      { youtube: { id: "tikj_kShdKQ" }, answer: "Торба-на-Круче — Друг" },
    ],
  },
];
