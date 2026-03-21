import { COL } from "../palette.js";
import { createLevel } from "./shared.js";

function path(coords) {
  return coords.map(([r, c]) => ({ r, c }));
}

const OFFLINE_TEMPLATES = Object.freeze({
  3: ["Ich", "lerne", "Deutsch"],
  4: ["Wir", "lernen", "heute", "Deutsch"],
  5: ["Ich", "lerne", "heute", "neue", "Woerter"],
  6: ["Wir", "sprechen", "am Abend", "ueber", "neue", "Ideen"],
  7: ["Ich", "moechte", "heute", "mit Freunden", "etwas", "Neues", "lernen"],
  8: ["Wir", "koennen", "am Abend", "mit Ruhe", "sehr", "gut", "Deutsch", "lernen"],
  9: ["Ich", "arbeite", "heute", "mit meinem", "kleinen", "Team", "an", "neuen", "Ideen"],
  10: ["Wir", "reden", "am Abend", "mit unserer", "kleinen", "Gruppe", "ueber", "wichtige", "neue", "Ziele"],
  11: ["Ich", "moechte", "heute", "mit meiner", "netten", "Lehrerin", "im Kurs", "sehr", "gerne", "Deutsch", "lernen"],
  12: ["Wir", "arbeiten", "heute", "mit unserem", "neuen", "kleinen", "Team", "an", "einem", "klaren", "guten", "Plan"],
  13: ["Ich", "glaube", "dass", "wir", "mit kleinen", "klaren", "Schritten", "heute", "schon", "viel", "mehr", "Ruhe", "finden"],
  14: ["Wir", "merken", "heute", "im Kurs", "dass", "kleine", "klare", "Schritte", "oft", "sehr", "gute", "neue", "Wege", "oeffnen"],
  15: ["Ich", "denke", "heute", "dass", "wir", "mit einer", "ruhigen", "klaren", "Sprache", "viele", "schwierige", "Dinge", "viel", "besser", "verstehen"],
  16: ["Wir", "lernen", "am Abend", "mit unserer", "kleinen", "Gruppe", "wie", "man", "auch", "lange", "komplexe", "Saetze", "ruhig", "und", "klar", "baut"],
  17: ["Ich", "glaube", "wirklich", "dass", "wir", "mit sehr", "kleinen", "klaren", "Schritten", "heute", "schon", "viele", "neue", "Ideen", "fuer morgen", "finden", "koennen"],
  18: ["Wir", "merken", "heute", "im neuen", "Sprachkurs", "dass", "eine", "ruhige", "genaue", "und", "offene", "Sprache", "oft", "viel", "mehr", "Vertrauen", "aufbauen", "kann"],
  19: ["Ich", "denke", "seit heute", "dass", "wir", "mit einer", "klaren", "ehrlichen", "und", "freundlichen", "Haltung", "auch", "schwierige", "Themen", "im Team", "besser", "gemeinsam", "loesen", "koennen"],
  20: ["Wir", "sehen", "im Alltag", "dass", "kleine", "ruhige", "und", "klare", "Schritte", "oft", "zu", "besseren", "Ideen", "mehr", "gegenseitigem", "Vertrauen", "und", "stabilen", "Ergebnissen", "fuehren"],
  22: ["Ich", "glaube", "heute", "wirklich", "dass", "wir", "mit einer", "ruhigen", "klaren", "und", "offenen", "Sprache", "auch", "bei", "schwierigen", "Fragen", "mehr", "gegenseitiges", "Vertrauen", "und", "Loesungen", "finden"],
  23: ["Wir", "merken", "im neuen", "Sprachkurs", "dass", "eine", "ruhige", "klare", "und", "ehrliche", "Sprache", "selbst", "bei", "schwierigen", "langen", "Themen", "viel", "mehr", "gegenseitiges Vertrauen", "und", "gute", "Loesungen", "schafft"],
});

const OFFLINE_TRANSLATION = "Offline fallback. Online AI should replace this sentence pack.";
const OFFLINE_NOTE = "Offline fallback level. The deployed AI will regenerate this content when the API is available.";

const REFERENCE_LAYOUTS = Object.freeze([
  {
    ref: "83",
    title: "Reference 83",
    topic: "Reference Layout",
    rows: 10,
    cols: 6,
    paths: [
      { color: COL.G, cells: path([[1, 2], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [5, 2], [6, 2], [7, 2], [7, 3]]) },
      { color: COL.R, cells: path([[1, 4], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [6, 4], [7, 4], [8, 4], [8, 3], [8, 2], [8, 1]]) },
      { color: COL.Y, cells: path([[2, 2], [3, 2], [4, 2]]) },
      { color: COL.B, cells: path([[2, 4], [3, 4], [4, 4], [5, 4], [5, 5], [6, 5], [7, 5], [8, 5], [9, 5], [9, 4], [9, 3], [9, 2], [9, 1], [9, 0], [8, 0], [7, 0], [7, 1]]) },
      { color: COL.P, cells: path([[4, 5], [3, 5], [2, 5], [1, 5], [0, 5], [0, 4], [0, 3], [0, 2], [0, 1], [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [6, 1]]) },
    ],
  },
  {
    ref: "97",
    title: "Reference 97",
    topic: "Reference Layout",
    rows: 10,
    cols: 6,
    paths: [
      { color: COL.R, cells: path([[1, 4], [1, 3], [1, 2], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [8, 2], [8, 3]]) },
      { color: COL.B, cells: path([[2, 2], [2, 3], [2, 4], [2, 5], [1, 5], [0, 5], [0, 4], [0, 3], [0, 2], [0, 1], [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0]]) },
      { color: COL.P, cells: path([[3, 3], [3, 2], [4, 2]]) },
      { color: COL.Y, cells: path([[3, 5], [3, 4], [4, 4], [4, 3]]) },
      { color: COL.C, cells: path([[4, 5], [5, 5], [5, 4], [5, 3], [5, 2], [6, 2], [7, 2]]) },
      { color: COL.O, cells: path([[6, 3], [6, 4], [6, 5], [7, 5], [8, 5], [9, 5]]) },
      { color: COL.G, cells: path([[7, 3], [7, 4], [8, 4], [9, 4], [9, 3], [9, 2], [9, 1]]) },
    ],
  },
  {
    ref: "64",
    title: "Reference 64",
    topic: "Reference Layout",
    rows: 10,
    cols: 6,
    paths: [
      { color: COL.P, cells: path([[1, 1], [2, 1], [2, 2]]) },
      { color: COL.R, cells: path([[1, 2], [0, 2], [0, 1], [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [9, 1], [9, 2], [9, 3], [9, 4], [9, 5], [8, 5], [7, 5], [6, 5], [6, 4]]) },
      { color: COL.G, cells: path([[1, 3], [0, 3], [0, 4], [0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [5, 4], [5, 3], [6, 3], [7, 3]]) },
      { color: COL.B, cells: path([[1, 4], [2, 4], [3, 4], [4, 4], [4, 3], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [8, 3], [8, 4], [7, 4]]) },
      { color: COL.Y, cells: path([[2, 3], [3, 3], [3, 2], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1]]) },
    ],
  },
  {
    ref: "65",
    title: "Reference 65",
    topic: "Reference Layout",
    rows: 8,
    cols: 5,
    paths: [
      { color: COL.R, cells: path([[1, 3], [1, 2], [1, 1], [2, 1]]) },
      { color: COL.G, cells: path([[2, 2], [3, 2], [3, 3], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [7, 3], [7, 2], [7, 1], [7, 0], [6, 0]]) },
      { color: COL.P, cells: path([[2, 3], [2, 4], [1, 4], [0, 4], [0, 3], [0, 2], [0, 1], [0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [4, 1], [4, 2], [5, 2]]) },
      { color: COL.B, cells: path([[4, 0], [5, 0], [5, 1], [6, 1], [6, 2], [6, 3], [5, 3], [4, 3]]) },
    ],
  },
  {
    ref: "66",
    title: "Reference 66",
    topic: "Reference Layout",
    rows: 9,
    cols: 7,
    paths: [
      { color: COL.P, cells: path([[0, 0], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [2, 5], [2, 6], [3, 6], [4, 6], [5, 6]]) },
      { color: COL.O, cells: path([[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 6]]) },
      { color: COL.G, cells: path([[3, 1], [3, 2], [3, 3]]) },
      { color: COL.B, cells: path([[4, 1], [4, 2], [4, 3], [5, 3], [6, 3], [7, 3], [7, 2], [7, 1]]) },
      { color: COL.R, cells: path([[4, 4], [5, 4], [6, 4], [7, 4], [7, 5]]) },
      { color: COL.Y, cells: path([[5, 2], [5, 1], [5, 0], [4, 0], [3, 0], [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [3, 4], [3, 5], [4, 5], [5, 5], [6, 5], [6, 6], [7, 6], [8, 6]]) },
      { color: COL.C, cells: path([[6, 2], [6, 1], [6, 0], [7, 0], [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5]]) },
    ],
  },
  {
    ref: "70",
    title: "Reference 70",
    topic: "Reference Layout",
    rows: 9,
    cols: 7,
    paths: [
      { color: COL.Y, cells: path([[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [1, 2], [1, 3], [1, 4], [1, 5], [2, 5], [3, 5], [3, 4], [4, 4], [5, 4]]) },
      { color: COL.G, cells: path([[1, 1], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [4, 5], [5, 5]]) },
      { color: COL.P, cells: path([[2, 4], [2, 3], [3, 3], [4, 3], [5, 3], [5, 2]]) },
      { color: COL.B, cells: path([[3, 2], [3, 1], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5]]) },
      { color: COL.R, cells: path([[4, 2], [4, 1], [5, 1], [6, 1], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [8, 6]]) },
      { color: COL.O, cells: path([[5, 6], [6, 6], [6, 5], [6, 4], [6, 3], [6, 2]]) },
    ],
  },
  {
    ref: "71",
    title: "Reference 71",
    topic: "Reference Layout",
    rows: 9,
    cols: 7,
    paths: [
      { color: COL.G, cells: path([[0, 3], [1, 3], [2, 3], [3, 3], [3, 4], [4, 4], [5, 4]]) },
      { color: COL.Y, cells: path([[0, 4], [1, 4], [2, 4]]) },
      { color: COL.C, cells: path([[0, 5], [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6], [8, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [7, 1], [6, 1]]) },
      { color: COL.P, cells: path([[1, 1], [2, 1], [3, 1], [4, 1], [4, 2], [4, 3], [5, 3], [6, 3], [6, 4], [6, 5], [5, 5], [4, 5], [3, 5], [2, 5], [1, 5]]) },
      { color: COL.B, cells: path([[3, 2], [2, 2], [1, 2], [0, 2], [0, 1], [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [5, 1]]) },
      { color: COL.R, cells: path([[5, 2], [6, 2], [7, 2], [7, 3], [7, 4], [7, 5]]) },
      { color: COL.O, cells: path([[6, 0], [7, 0], [8, 0]]) },
    ],
  },
  {
    ref: "74",
    title: "Reference 74",
    topic: "Reference Layout",
    rows: 10,
    cols: 6,
    paths: [
      { color: COL.Y, cells: path([[1, 1], [1, 2], [1, 3], [1, 4], [2, 4], [3, 4]]) },
      { color: COL.B, cells: path([[2, 1], [2, 0], [1, 0], [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [4, 4], [5, 4], [5, 3], [5, 2], [6, 2]]) },
      { color: COL.G, cells: path([[2, 2], [3, 2], [3, 1], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [9, 1], [9, 2], [9, 3], [9, 4], [9, 5], [8, 5], [7, 5]]) },
      { color: COL.P, cells: path([[2, 3], [3, 3], [4, 3], [4, 2], [4, 1], [5, 1], [6, 1], [7, 1], [7, 2], [7, 3], [6, 3]]) },
      { color: COL.R, cells: path([[5, 5], [6, 5], [6, 4], [7, 4], [8, 4], [8, 3], [8, 2], [8, 1]]) },
    ],
  },
  {
    ref: "75",
    title: "Reference 75",
    topic: "Reference Layout",
    rows: 10,
    cols: 7,
    paths: [
      { color: COL.P, cells: path([[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6], [8, 6], [8, 5], [8, 4], [8, 3], [8, 2], [7, 2], [6, 2], [5, 2], [4, 2]]) },
      { color: COL.B, cells: path([[1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4]]) },
      { color: COL.R, cells: path([[1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [7, 4]]) },
      { color: COL.G, cells: path([[2, 3], [2, 2], [2, 1], [2, 0], [3, 0], [4, 0], [5, 0]]) },
      { color: COL.O, cells: path([[6, 0], [7, 0], [8, 0], [9, 0], [9, 1], [9, 2], [9, 3], [9, 4], [9, 5], [9, 6]]) },
      { color: COL.Y, cells: path([[7, 3], [6, 3], [5, 3], [4, 3], [3, 3], [3, 2], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1]]) },
    ],
  },
  {
    ref: "77",
    title: "Reference 77",
    topic: "Reference Layout",
    rows: 9,
    cols: 7,
    paths: [
      { color: COL.G, cells: path([[1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [5, 2], [5, 3], [5, 4], [6, 4], [6, 5]]) },
      { color: COL.Y, cells: path([[1, 3], [0, 3], [0, 4], [0, 5], [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6], [8, 6], [8, 5], [8, 4], [8, 3], [8, 2], [7, 2]]) },
      { color: COL.P, cells: path([[1, 4], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5]]) },
      { color: COL.R, cells: path([[2, 4], [3, 4], [4, 4], [4, 3], [4, 2], [3, 2]]) },
      { color: COL.O, cells: path([[3, 3], [2, 3], [2, 2], [1, 2], [0, 2], [0, 1], [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]]) },
      { color: COL.B, cells: path([[7, 5], [7, 4], [7, 3], [6, 3], [6, 2], [6, 1], [7, 1], [8, 1], [8, 0]]) },
    ],
  },
  {
    ref: "84",
    title: "Reference 84",
    topic: "Reference Layout",
    rows: 10,
    cols: 7,
    paths: [
      { color: COL.Y, cells: path([[1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [6, 2], [6, 3], [6, 4], [7, 4], [7, 5]]) },
      { color: COL.G, cells: path([[1, 3], [0, 3], [0, 4], [0, 5], [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6], [8, 6], [9, 6], [9, 5], [9, 4], [9, 3], [9, 2], [8, 2]]) },
      { color: COL.O, cells: path([[1, 4], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5]]) },
      { color: COL.R, cells: path([[2, 4], [3, 4], [4, 4], [5, 4], [5, 3], [5, 2], [4, 2], [3, 2]]) },
      { color: COL.P, cells: path([[4, 3], [3, 3], [2, 3], [2, 2], [1, 2], [0, 2], [0, 1], [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0]]) },
      { color: COL.B, cells: path([[8, 5], [8, 4], [8, 3], [7, 3], [7, 2], [7, 1], [8, 1], [9, 1], [9, 0]]) },
    ],
  },
]);

function getOfflineTokens(length) {
  const tokens = OFFLINE_TEMPLATES[length];
  if (!tokens) {
    throw new Error(`Missing offline fallback template for token length ${length}.`);
  }

  return [...tokens];
}

function buildFallbackSentences(layout) {
  return layout.paths.map((entry) => ({
    color: entry.color,
    tokens: getOfflineTokens(entry.cells.length),
    translation: OFFLINE_TRANSLATION,
    grammarNote: OFFLINE_NOTE,
  }));
}

function buildReferenceLevel(levelCode, layout, index) {
  const displayNumber = String(index + 1).padStart(2, "0");
  return createLevel({
    id: `${levelCode.toLowerCase()}-${displayNumber}`,
    title: `Level ${displayNumber}`,
    level: levelCode,
    topic: layout.topic,
    rows: layout.rows,
    cols: layout.cols,
    paths: layout.paths.map((entry) => entry.cells),
    sentences: buildFallbackSentences(layout),
  });
}

export function extendLevelPack(levelCode, _baseLevels) {
  return REFERENCE_LAYOUTS.map((layout, index) => buildReferenceLevel(levelCode, layout, index));
}
