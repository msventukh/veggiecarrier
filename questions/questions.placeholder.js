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
    name: "A",
    questions: [
      { audio: "audio/a-100.mp3", answer: "Placeholder song A-100" },
      { audio: "audio/a-200.mp3", answer: "Placeholder song A-200" },
      { audio: "audio/a-300.mp3", answer: "Placeholder song A-300" },
      { audio: "audio/a-400.mp3", answer: "Placeholder song A-400" },
      { audio: "audio/a-500.mp3", answer: "Placeholder song A-500" },
      { audio: "audio/a-600.mp3", answer: "Placeholder song A-600" },
      { audio: "audio/a-800.mp3", answer: "Placeholder song A-800" },
      { audio: "audio/a-1000.mp3", answer: "Placeholder song A-1000" },
    ],
  },
  {
    name: "B",
    questions: [
      { youtube: { id: "1n8Xg3_YaqM", start: "0:50", end: "0:58" }, answer: "Massive Attack — Silent Spring" },
      { youtube: { id: "dQw4w9WgXcQ", start: 43, end: 51 }, answer: "Rick Astley — Never Gonna Give You Up" },
      { audio: "audio/b-300.mp3", answer: "Placeholder song B-300" },
      { audio: "audio/b-400.mp3", answer: "Placeholder song B-400" },
      { audio: "audio/b-500.mp3", answer: "Placeholder song B-500" },
      { audio: "audio/b-600.mp3", answer: "Placeholder song B-600" },
      { audio: "audio/b-800.mp3", answer: "Placeholder song B-800" },
      { audio: "audio/b-1000.mp3", answer: "Placeholder song B-1000" },
    ],
  },
  {
    name: "C",
    questions: [
      { audio: "audio/c-100.mp3", answer: "Placeholder song C-100" },
      { audio: "audio/c-200.mp3", answer: "Placeholder song C-200" },
      { audio: "audio/c-300.mp3", answer: "Placeholder song C-300" },
      { audio: "audio/c-400.mp3", answer: "Placeholder song C-400" },
      { audio: "audio/c-500.mp3", answer: "Placeholder song C-500" },
      { audio: "audio/c-600.mp3", answer: "Placeholder song C-600" },
      { audio: "audio/c-800.mp3", answer: "Placeholder song C-800" },
      { audio: "audio/c-1000.mp3", answer: "Placeholder song C-1000" },
    ],
  },
  {
    name: "D",
    questions: [
      { audio: "audio/d-100.mp3", answer: "Placeholder song D-100" },
      { audio: "audio/d-200.mp3", answer: "Placeholder song D-200" },
      { audio: "audio/d-300.mp3", answer: "Placeholder song D-300" },
      { audio: "audio/d-400.mp3", answer: "Placeholder song D-400" },
      { audio: "audio/d-500.mp3", answer: "Placeholder song D-500" },
      { audio: "audio/d-600.mp3", answer: "Placeholder song D-600" },
      { audio: "audio/d-800.mp3", answer: "Placeholder song D-800" },
      { audio: "audio/d-1000.mp3", answer: "Placeholder song D-1000" },
    ],
  },
  {
    name: "E",
    questions: [
      { audio: "audio/e-100.mp3", answer: "Placeholder song E-100" },
      { audio: "audio/e-200.mp3", answer: "Placeholder song E-200" },
      { audio: "audio/e-300.mp3", answer: "Placeholder song E-300" },
      { audio: "audio/e-400.mp3", answer: "Placeholder song E-400" },
      { audio: "audio/e-500.mp3", answer: "Placeholder song E-500" },
      { audio: "audio/e-600.mp3", answer: "Placeholder song E-600" },
      { audio: "audio/e-800.mp3", answer: "Placeholder song E-800" },
      { audio: "audio/e-1000.mp3", answer: "Placeholder song E-1000" },
    ],
  },
  {
    name: "F",
    questions: [
      { audio: "audio/f-100.mp3", answer: "Placeholder song F-100" },
      { audio: "audio/f-200.mp3", answer: "Placeholder song F-200" },
      { audio: "audio/f-300.mp3", answer: "Placeholder song F-300" },
      { audio: "audio/f-400.mp3", answer: "Placeholder song F-400" },
      { audio: "audio/f-500.mp3", answer: "Placeholder song F-500" },
      { audio: "audio/f-600.mp3", answer: "Placeholder song F-600" },
      { audio: "audio/f-800.mp3", answer: "Placeholder song F-800" },
      { audio: "audio/f-1000.mp3", answer: "Placeholder song F-1000" },
    ],
  },
  {
    name: "G",
    questions: [
      { audio: "audio/g-100.mp3", answer: "Placeholder song G-100" },
      { audio: "audio/g-200.mp3", answer: "Placeholder song G-200" },
      { audio: "audio/g-300.mp3", answer: "Placeholder song G-300" },
      { audio: "audio/g-400.mp3", answer: "Placeholder song G-400" },
      { audio: "audio/g-500.mp3", answer: "Placeholder song G-500" },
      { audio: "audio/g-600.mp3", answer: "Placeholder song G-600" },
      { audio: "audio/g-800.mp3", answer: "Placeholder song G-800" },
      { audio: "audio/g-1000.mp3", answer: "Placeholder song G-1000" },
    ],
  },
  {
    name: "H",
    questions: [
      { audio: "audio/h-100.mp3", answer: "Placeholder song H-100" },
      { audio: "audio/h-200.mp3", answer: "Placeholder song H-200" },
      { audio: "audio/h-300.mp3", answer: "Placeholder song H-300" },
      { audio: "audio/h-400.mp3", answer: "Placeholder song H-400" },
      { audio: "audio/h-500.mp3", answer: "Placeholder song H-500" },
      { audio: "audio/h-600.mp3", answer: "Placeholder song H-600" },
      { audio: "audio/h-800.mp3", answer: "Placeholder song H-800" },
      { audio: "audio/h-1000.mp3", answer: "Placeholder song H-1000" },
    ],
  },
];
