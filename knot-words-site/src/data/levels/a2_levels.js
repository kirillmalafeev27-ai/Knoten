import { COL } from "../palette.js";
import { createLevel } from "./shared.js";

export const A2_LEVELS = [
  createLevel({
    id: "a2-1",
    title: "Modalverben",
    level: "A2",
    topic: "Alltag",
    size: 4,
    transform: "rotate-180",
    sentences: [
      {
        color: COL.P,
        tokens: ["Sie", "kann", "gut", "tanzen"],
        translation: "Она умеет хорошо танцевать.",
        grammarNote: "Модальный глагол стоит на второй позиции.",
      },
      {
        color: COL.G,
        tokens: ["Wir", "wollen", "heute", "kochen"],
        translation: "Мы хотим сегодня готовить.",
        grammarNote: "Инфинитив уходит в конец предложения.",
      },
      {
        color: COL.B,
        tokens: ["Er", "muss", "jetzt", "arbeiten"],
        translation: "Он должен сейчас работать.",
        grammarNote: "Слово 'jetzt' естественно стоит в середине предложения.",
      },
      {
        color: COL.Y,
        tokens: ["Ich", "darf", "heute", "bleiben"],
        translation: "Мне можно сегодня остаться.",
        grammarNote: "Модальный глагол управляет инфинитивом без 'zu'.",
      },
    ],
  }),
  createLevel({
    id: "a2-2",
    title: "Zeit im Alltag",
    level: "A2",
    topic: "Alltag",
    size: 5,
    transform: "identity",
    sentences: [
      {
        color: COL.B,
        tokens: ["Wir", "haben", "gestern", "lange", "gespielt"],
        translation: "Мы долго играли вчера.",
        grammarNote: "Временное обстоятельство может стоять в середине поля.",
      },
      {
        color: COL.G,
        tokens: ["Ich", "muss", "morgen", "früh", "aufstehen"],
        translation: "Мне нужно завтра рано встать.",
        grammarNote: "Инфинитив снова уходит в конец.",
      },
      {
        color: COL.O,
        tokens: ["Er", "fährt", "heute", "mit dem Zug", "nach Hause"],
        translation: "Он едет сегодня домой на поезде.",
        grammarNote: "Короткое словосочетание можно держать в одной клетке.",
      },
      {
        color: COL.Y,
        tokens: ["Sie", "kommt", "am Abend", "spät", "nach Hause"],
        translation: "Она поздно приходит домой вечером.",
        grammarNote: "Обстоятельства времени и образа действия можно разделять.",
      },
      {
        color: COL.P,
        tokens: ["Du", "lernst", "jeden Tag", "neue", "Wörter"],
        translation: "Ты каждый день учишь новые слова.",
        grammarNote: "Сочетание 'jeden Tag' остается целым смысловым блоком.",
      },
    ],
  }),
  createLevel({
    id: "a2-3",
    title: "Unterwegs",
    level: "A2",
    topic: "Reisen",
    size: 5,
    transform: "mirror-x",
    sentences: [
      {
        color: COL.R,
        tokens: ["Wir", "fahren", "nächste Woche", "nach", "Berlin"],
        translation: "Мы едем в Берлин на следующей неделе.",
        grammarNote: "Направление с 'nach' обычно стоит перед названием города.",
      },
      {
        color: COL.B,
        tokens: ["Ich", "nehme", "heute", "den Bus", "zur Arbeit"],
        translation: "Я еду сегодня на работу на автобусе.",
        grammarNote: "Короткие устойчивые группы удобно давать единым токеном.",
      },
      {
        color: COL.G,
        tokens: ["Er", "besucht", "seine Oma", "am", "Sonntag"],
        translation: "Он навещает бабушку в воскресенье.",
        grammarNote: "Время можно вынести ближе к концу.",
      },
      {
        color: COL.Y,
        tokens: ["Sie", "liest", "jeden Abend", "ein gutes", "Buch"],
        translation: "Она каждый вечер читает хорошую книгу.",
        grammarNote: "Словосочетание 'ein gutes' можно держать вместе ради ритма.",
      },
      {
        color: COL.P,
        tokens: ["Ihr", "sprecht", "sehr oft", "über", "Musik"],
        translation: "Вы очень часто говорите о музыке.",
        grammarNote: "Предлог 'über' тянет за собой тему разговора.",
      },
    ],
  }),
];
