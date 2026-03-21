import { COL } from "../palette.js";
import { createLevel } from "./shared.js";

export const A1_LEVELS = [
  createLevel({
    id: "a1-1",
    title: "Sein und haben",
    level: "A1",
    topic: "Alltag",
    size: 3,
    transform: "identity",
    sentences: [
      {
        color: COL.B,
        tokens: ["Ich", "bin", "müde"],
        translation: "Я устал.",
        grammarNote: "После подлежащего сразу идет глагол.",
      },
      {
        color: COL.G,
        tokens: ["Du", "hast", "Zeit"],
        translation: "У тебя есть время.",
        grammarNote: "Глагол 'haben' стоит на второй позиции.",
      },
      {
        color: COL.P,
        tokens: ["Wir", "lernen", "Deutsch"],
        translation: "Мы учим немецкий.",
        grammarNote: "Базовый порядок слов: подлежащее + сказуемое + дополнение.",
      },
    ],
  }),
  createLevel({
    id: "a1-2",
    title: "Essen und Alltag",
    level: "A1",
    topic: "Essen",
    size: 4,
    transform: "rotate-90",
    sentences: [
      {
        color: COL.R,
        tokens: ["Er", "kauft", "einen", "Apfel"],
        translation: "Он покупает яблоко.",
        grammarNote: "Неопределенный артикль стоит перед существительным.",
      },
      {
        color: COL.Y,
        tokens: ["Sie", "trinkt", "heißen", "Kakao"],
        translation: "Она пьет горячее какао.",
        grammarNote: "Прилагательное стоит перед существительным и согласуется по форме.",
      },
      {
        color: COL.B,
        tokens: ["Wir", "mögen", "diese", "Musik"],
        translation: "Нам нравится эта музыка.",
        grammarNote: "Указательное слово 'diese' идет перед существительным.",
      },
      {
        color: COL.G,
        tokens: ["Ihr", "lernt", "heute", "zusammen"],
        translation: "Вы учитесь сегодня вместе.",
        grammarNote: "Обстоятельство времени часто ставится после глагола.",
      },
    ],
  }),
  createLevel({
    id: "a1-3",
    title: "Schule und Freizeit",
    level: "A1",
    topic: "Freizeit",
    size: 4,
    transform: "mirror-y",
    sentences: [
      {
        color: COL.O,
        tokens: ["Ich", "mache", "meine", "Hausaufgaben"],
        translation: "Я делаю домашнее задание.",
        grammarNote: "Притяжательное местоимение стоит перед существительным.",
      },
      {
        color: COL.B,
        tokens: ["Du", "spielst", "gerne", "Fußball"],
        translation: "Ты охотно играешь в футбол.",
        grammarNote: "Наречие 'gerne' обычно стоит после глагола.",
      },
      {
        color: COL.P,
        tokens: ["Er", "findet", "das", "Buch"],
        translation: "Он находит книгу.",
        grammarNote: "Определенный артикль отделяется в A1 как отдельный токен.",
      },
      {
        color: COL.G,
        tokens: ["Wir", "brauchen", "mehr", "Wasser"],
        translation: "Нам нужно больше воды.",
        grammarNote: "Количественное слово часто стоит перед существительным без артикля.",
      },
    ],
  }),
];
