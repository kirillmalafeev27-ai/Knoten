export function buildLevelPrompt(profile, blueprint) {
  const safeProfile = {
    name: profile?.name || "Lerner",
    age: profile?.age || "18-30",
    level: profile?.level || "A1",
    topic: profile?.topic || "Alltag",
  };

  const levelDescriptions = blueprint
    .map((level, index) => {
      const tokenCounts = level.sentences.map((s) => s.pathLength);
      return `Level ${index + 1}: ${level.sentences.length} sentences with token counts [${tokenCounts.join(", ")}]`;
    })
    .join("\n");

  return `Generate German language exercises for a learning game.

Student profile:
- Name: ${safeProfile.name}
- Age: ${safeProfile.age}
- CEFR level: ${safeProfile.level}
- Topic: ${safeProfile.topic}

${levelDescriptions}

RULES:
1. Each sentence MUST have EXACTLY the specified number of tokens. A token is 1-3 words that fit in one grid cell.
2. Every sentence must be a complete, grammatically correct German sentence.
3. "translation" = Russian translation. "grammar_note" = short grammar explanation in Russian.
4. Use vocabulary and grammar appropriate for ${safeProfile.level} level.
5. All sentences within a level should relate to the topic "${safeProfile.topic}".

EXAMPLES by token count:
3 tokens: {"tokens":["Das","ist","gut."],"translation":"Это хорошо.","grammar_note":"Связка ist после подлежащего."}
4 tokens: {"tokens":["Ich","lerne","jeden Tag","Deutsch."],"translation":"Я учу немецкий каждый день.","grammar_note":"Глагол lerne стоит на втором месте."}
5 tokens: {"tokens":["Wir","gehen","heute","in den","Park."],"translation":"Мы идём сегодня в парк.","grammar_note":"Предлог in с Akkusativ при движении."}
6 tokens: {"tokens":["Am Wochenende","fahre","ich","mit dem","Zug","nach Berlin."],"translation":"На выходных я еду поездом в Берлин.","grammar_note":"При обстоятельстве времени в начале глагол остаётся на 2-м месте."}

Output ONLY valid JSON, no other text:
{"levels":[{"id":"generated-1","sentences":[...]}]}`;
}
