import { COL } from "../palette.js";
import { createLevel } from "./shared.js";

export const B1_LEVELS = [
  createLevel({
    id: "b1-1",
    title: "Nebensätze",
    level: "B1",
    topic: "Alltag",
    size: 5,
    transform: "rotate-90",
    sentences: [
      {
        color: COL.B,
        tokens: ["Ich", "bleibe", "zu Hause", "weil", "es regnet"],
        translation: "Я остаюсь дома, потому что идет дождь.",
        grammarNote: "После 'weil' сказуемое уходит в конец придаточного.",
      },
      {
        color: COL.G,
        tokens: ["Sie", "lacht", "sofort", "wenn", "er anruft"],
        translation: "Она сразу смеется, когда он звонит.",
        grammarNote: "Союз 'wenn' вводит придаточное времени.",
      },
      {
        color: COL.P,
        tokens: ["Wir", "lernen", "weiter", "obwohl", "es spät ist"],
        translation: "Мы продолжаем учиться, хотя уже поздно.",
        grammarNote: "После 'obwohl' сказуемое тоже уходит в конец.",
      },
      {
        color: COL.O,
        tokens: ["Er", "schweigt", "lange", "bevor", "er antwortet"],
        translation: "Он долго молчит, прежде чем ответить.",
        grammarNote: "Союз 'bevor' задает временную последовательность.",
      },
      {
        color: COL.Y,
        tokens: ["Du", "übst", "jeden Tag", "damit", "du sicher wirst"],
        translation: "Ты тренируешься каждый день, чтобы стать увереннее.",
        grammarNote: "После 'damit' мы объясняем цель действия.",
      },
    ],
  }),
  createLevel({
    id: "b1-2",
    title: "Relativsätze",
    level: "B1",
    topic: "Kultur",
    size: 6,
    transform: "identity",
    sentences: [
      {
        color: COL.B,
        tokens: ["Das Buch", "das ich lese", "ist", "heute", "ziemlich", "spannend"],
        translation: "Книга, которую я читаю, сегодня довольно захватывающая.",
        grammarNote: "Относительное придаточное стоит рядом с определяемым словом.",
      },
      {
        color: COL.G,
        tokens: ["Der Film", "den wir sahen", "war", "gestern", "sehr", "laut"],
        translation: "Фильм, который мы смотрели, вчера был очень громким.",
        grammarNote: "В Akkusativ относительное местоимение меняет форму.",
      },
      {
        color: COL.P,
        tokens: ["Die Stadt", "in der sie lebt", "ist", "im Winter", "oft", "grau"],
        translation: "Город, в котором она живет, зимой часто серый.",
        grammarNote: "Предлог может входить в относительную конструкцию.",
      },
      {
        color: COL.O,
        tokens: ["Der Lehrer", "mit dem wir sprechen", "bleibt", "heute", "sehr", "ruhig"],
        translation: "Учитель, с которым мы говорим, сегодня очень спокоен.",
        grammarNote: "Связка 'mit dem' показывает совместное действие.",
      },
      {
        color: COL.Y,
        tokens: ["Das Thema", "über das wir reden", "ist", "für uns", "noch", "neu"],
        translation: "Тема, о которой мы говорим, для нас еще новая.",
        grammarNote: "Предлог можно оставить в относительном блоке.",
      },
      {
        color: COL.R,
        tokens: ["Die Musik", "die du magst", "klingt", "für mich", "sehr", "frei"],
        translation: "Музыка, которая тебе нравится, звучит для меня очень свободно.",
        grammarNote: "Относительное местоимение согласуется с существительным по роду и числу.",
      },
    ],
  }),
  createLevel({
    id: "b1-3",
    title: "Gedanken und Ziele",
    level: "B1",
    topic: "Arbeit",
    size: 6,
    transform: "mirror-y",
    sentences: [
      {
        color: COL.G,
        tokens: ["Ich", "merke", "erst jetzt", "wie wichtig", "Ruhe", "ist"],
        translation: "Только сейчас я замечаю, как важен покой.",
        grammarNote: "Конструкция 'wie wichtig' запускает придаточное содержания.",
      },
      {
        color: COL.B,
        tokens: ["Sie", "glaubt", "immer noch", "dass kleine Schritte", "helfen", "können"],
        translation: "Она все еще верит, что маленькие шаги могут помочь.",
        grammarNote: "После 'dass' спрягаемый глагол стоит в конце.",
      },
      {
        color: COL.P,
        tokens: ["Wir", "reden", "heute", "über", "unsere", "Ziele"],
        translation: "Сегодня мы говорим о наших целях.",
        grammarNote: "Простая разговорная структура все еще важна и на B1.",
      },
      {
        color: COL.O,
        tokens: ["Er", "arbeitet", "seit Jahren", "mit jungen", "Musikern", "zusammen"],
        translation: "Он уже много лет работает вместе с молодыми музыкантами.",
        grammarNote: "Разделяемый глагол получает приставку в конце.",
      },
      {
        color: COL.Y,
        tokens: ["Du", "fragst", "oft danach", "wie Sprache", "Denken", "prägt"],
        translation: "Ты часто спрашиваешь, как язык формирует мышление.",
        grammarNote: "В косвенном вопросе порядок слов становится придаточным.",
      },
      {
        color: COL.R,
        tokens: ["Ihr", "plant", "für morgen", "einen kleinen", "Ausflug", "nach Dresden"],
        translation: "Вы планируете на завтра небольшую поездку в Дрезден.",
        grammarNote: "Два дополнения можно распределять по ритму фразы.",
      },
    ],
  }),
];
