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
      const rows = level.rows || level.size;
      const cols = level.cols || level.size;
      return `Level ${index + 1}: ${rows}x${cols}, ${level.sentences.length} Saetze, Tokenanzahl pro Satz: [${tokenLengths}]`;
    })
    .join("\n");

  return `Du bist ein Deutschlehrer. Erstelle ${levelCount} Level fuer ein Sprachlernspiel.

Schuelerprofil:
- Name: ${safeProfile.name}
- Alter: ${safeProfile.age}
- Niveau: ${safeProfile.level}
- Thema: ${safeProfile.topic}

KRITISCHE REGELN (Verstoss = Fehler):
1. Jeder Satz hat EXAKT so viele Tokens wie angegeben. Ein Token = 1-2 Woerter (max. 3).
2. Jeder Satz ist ein VOLLSTAENDIGER, grammatisch korrekter deutscher Satz.
3. Jeder Satz endet mit . oder ! oder ? — KEIN Satz darf auf Artikel, Pronomen, Praeposition oder Konjunktion enden.
4. Keine Fragmente, keine Ellipsen ("..."), keine abgehaengten Nebensaetze.
5. Niveau ${safeProfile.level}: passende Grammatik und Lexik.
6. translation = Uebersetzung auf Russisch, grammar_note = kurze Grammatikerklaerung auf Russisch.

Layout:
${layoutDescription}

Beispiel fuer einen Satz mit 4 Tokens:
{"tokens":["Ich","lerne","jeden Tag","Deutsch."],"translation":"Я учу немецкий каждый день.","grammar_note":"Глагол lerne стоит на втором месте."}

Beispiel fuer einen Satz mit 3 Tokens:
{"tokens":["Das","ist","gut."],"translation":"Это хорошо.","grammar_note":"Связка ist после подлежащего."}

Antworte NUR mit validem JSON, KEIN anderer Text:
{"levels":[{"id":"generated-1","sentences":[...]}]}`;
}
