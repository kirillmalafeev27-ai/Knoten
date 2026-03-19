import { COL } from "../palette.js";
import { createLevel } from "./shared.js";

export const B2_LEVELS = [
  createLevel({
    id: "b2-1",
    title: "Konjunktiv II",
    level: "B2",
    topic: "Arbeit",
    size: 6,
    transform: "rotate-180",
    sentences: [
      {
        color: COL.P,
        tokens: ["Wenn ich Zeit hätte", "würde ich", "heute", "länger", "Deutsch", "lernen"],
        translation: "Если бы у меня было время, я бы сегодня дольше учил немецкий.",
        grammarNote: "Konjunktiv II выражает нереальное или желаемое условие.",
      },
      {
        color: COL.B,
        tokens: ["Wenn sie mehr Mut hätte", "würde sie", "ein eigenes", "Projekt", "sofort", "starten"],
        translation: "Если бы у нее было больше смелости, она бы сразу запустила свой проект.",
        grammarNote: "Условие и следствие удобно делить на два крупных смысловых блока.",
      },
      {
        color: COL.G,
        tokens: ["Wenn wir früher gingen", "könnten wir", "den Zug", "noch", "heute", "erreichen"],
        translation: "Если бы мы вышли раньше, мы могли бы успеть на поезд еще сегодня.",
        grammarNote: "Во второй части тоже может стоять Konjunktiv II.",
      },
      {
        color: COL.O,
        tokens: ["Wenn er ruhiger wäre", "würde er", "im Gespräch", "klarer", "und freundlicher", "wirken"],
        translation: "Если бы он был спокойнее, в разговоре он звучал бы яснее и дружелюбнее.",
        grammarNote: "Сравнительные наречия хорошо работают как отдельные опоры.",
      },
      {
        color: COL.Y,
        tokens: ["Wenn du genauer liest", "würdest du", "viele kleine", "Details", "schneller", "finden"],
        translation: "Если бы ты читал внимательнее, ты бы быстрее находил многие мелкие детали.",
        grammarNote: "Konjunktiv II помогает отрабатывать советы и гипотезы.",
      },
      {
        color: COL.R,
        tokens: ["Wenn ihr bleiben könntet", "würdet ihr", "das Konzert", "bis ganz", "zum Ende", "hören"],
        translation: "Если бы вы могли остаться, вы бы дослушали концерт до самого конца.",
        grammarNote: "Длинные обстоятельственные группы можно хранить в одной клетке.",
      },
    ],
  }),
  createLevel({
    id: "b2-2",
    title: "Abstrakte Aussagen",
    level: "B2",
    topic: "Gesellschaft",
    size: 6,
    transform: "rotate-90",
    sentences: [
      {
        color: COL.B,
        tokens: ["Obwohl die Aufgabe komplex wirkt", "finden wir", "gemeinsam", "einen", "guten", "Einstieg"],
        translation: "Хотя задача кажется сложной, мы вместе находим хороший вход.",
        grammarNote: "Союз 'obwohl' требует придаточного порядка слов.",
      },
      {
        color: COL.G,
        tokens: ["Sobald die Daten klar sind", "kann das", "Team", "klarer", "entscheiden", "und handeln"],
        translation: "Как только данные становятся ясны, команда может принимать решения и действовать увереннее.",
        grammarNote: "На B2 допустимы более плотные смысловые блоки.",
      },
      {
        color: COL.P,
        tokens: ["Je offener wir sprechen", "desto leichter", "lassen sich", "Konflikte", "früh", "lösen"],
        translation: "Чем открытее мы говорим, тем легче удается рано решать конфликты.",
        grammarNote: "Корреляция 'je ... desto ...' хорошо тренирует логику порядка слов.",
      },
      {
        color: COL.O,
        tokens: ["Während viele nur planen", "setzt sie", "Ideen", "schnell", "und sauber", "um"],
        translation: "Пока многие только планируют, она быстро и чисто воплощает идеи.",
        grammarNote: "Разделяемый глагол 'umsetzen' снова закрывает предложение.",
      },
      {
        color: COL.Y,
        tokens: ["Selbst wenn Kritik hart klingt", "nimmt er", "sie", "als", "wertvolles", "Feedback"],
        translation: "Даже если критика звучит жестко, он воспринимает ее как ценную обратную связь.",
        grammarNote: "После 'selbst wenn' сохраняется придаточный порядок.",
      },
      {
        color: COL.R,
        tokens: ["Damit ein Team stabil bleibt", "braucht es", "klare Rollen", "und offenes", "ehrliches", "Feedback"],
        translation: "Чтобы команда оставалась устойчивой, ей нужны ясные роли и открытая честная обратная связь.",
        grammarNote: "Безличное 'es' помогает удержать формальный стиль.",
      },
    ],
  }),
  createLevel({
    id: "b2-3",
    title: "Kultur und Deutung",
    level: "B2",
    topic: "Kultur",
    size: 6,
    transform: "mirror-x",
    sentences: [
      {
        color: COL.G,
        tokens: ["Was ein Text verschweigt", "prägt oft", "unsere", "spätere", "Lesart", "stärker"],
        translation: "То, о чем текст умалчивает, часто сильнее формирует наше последующее прочтение.",
        grammarNote: "Субстантивированное придаточное может стоять в позиции подлежащего.",
      },
      {
        color: COL.B,
        tokens: ["Indem wir genauer zuhören", "erkennen wir", "feine", "soziale", "Signale", "früher"],
        translation: "Вслушиваясь внимательнее, мы раньше распознаем тонкие социальные сигналы.",
        grammarNote: "Союз 'indem' описывает способ действия.",
      },
      {
        color: COL.P,
        tokens: ["Kaum hatte der Vortrag begonnen", "wurden viele", "ungewöhnlich", "wach", "und", "neugierig"],
        translation: "Едва начался доклад, многие стали необычно бодрыми и любопытными.",
        grammarNote: "Инверсия после 'kaum' делает фразу заметно книжной.",
      },
      {
        color: COL.O,
        tokens: ["Nicht weil es leicht wäre", "sondern weil", "es sinnvoll", "ist", "bleiben wir", "dran"],
        translation: "Мы продолжаем не потому, что это легко, а потому, что это имеет смысл.",
        grammarNote: "Связка 'nicht weil ... sondern weil ...' тренирует контраст.",
      },
      {
        color: COL.Y,
        tokens: ["Sogar wer langsam vorankommt", "kann dabei", "ein tiefes", "Gefühl", "für Sprache", "entwickeln"],
        translation: "Даже тот, кто продвигается медленно, может при этом развить глубокое чувство языка.",
        grammarNote: "На B2 полезно держать длинные номинальные группы без упрощения.",
      },
      {
        color: COL.R,
        tokens: ["Erst wenn Zweifel sichtbar werden", "beginnt oft", "ein wirklich", "ehrliches", "Gespräch", "darüber"],
        translation: "Лишь когда сомнения становятся видимыми, часто начинается по-настоящему честный разговор об этом.",
        grammarNote: "После вынесенного обстоятельства происходит инверсия.",
      },
    ],
  }),
];
