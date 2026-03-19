export function buildLevelPrompt(profile, blueprint) {
  const safeProfile = {
    name: profile?.name || "Lerner",
    age: profile?.age || "18-30",
    level: profile?.level || "A1",
    topic: profile?.topic || "Alltag",
  };

  const levelCount = blueprint.length;
  const layoutDescription = blueprint
    .map((level, index) => {
      const tokenLengths = level.sentences.map((sentence) => sentence.pathLength).join(", ");
      return `Level ${index + 1}: ${level.size}x${level.size}, Satzlaengen ${tokenLengths}`;
    })
    .join("\n");

  return `Du bist ein Deutschlehrer. Erstelle ${levelCount} Level fuer ein Sprachlernspiel.\n\n` +
    `Schuelerprofil:\n` +
    `- Name: ${safeProfile.name}\n` +
    `- Alter: ${safeProfile.age}\n` +
    `- Niveau: ${safeProfile.level}\n` +
    `- Thema: ${safeProfile.topic}\n\n` +
    `Technische Constraints:\n` +
    `- Jeder Satz muss genau so viele Tokens enthalten wie seine Pfadlaenge.\n` +
    `- Ein Token darf ein einzelnes Wort oder eine kurze feste Wortgruppe sein.\n` +
    `- Verwende fuer ${safeProfile.level} passende Grammatik und Lexik.\n` +
    `- Alle Saetze eines Levels sollen thematisch zusammenpassen.\n` +
    `- Gib nur valides JSON ohne Erklaerung zurueck.\n` +
    `- Jede Ebene braucht dieselbe Anzahl Saetze wie ihre Rastergroesse.\n\n` +
    `Layout:\n${layoutDescription}\n\n` +
    `Antwortformat:\n` +
    `{"levels":[{"id":"generated-1","sentences":[{"tokens":["Ich","lerne","jeden Tag","Deutsch"],"translation":"...","grammar_note":"..."}]}]}`;
}
