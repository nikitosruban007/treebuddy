export function pickPositiveReaction(params: {
  language: 'ua' | 'en';
  taskTitle?: string;
}): string {
  const ua = [
    'Круто! Ти реально зробив(ла) дію 🌿',
    'Супер! Ще один крок для природи.',
    'Топ! Прогрес видно одразу.',
    'Вау! Твоє дерево росте завдяки тобі.',
    'Так тримати! Це має значення.',
  ];

  const en = [
    'Nice! You actually did it.',
    'Great job — real action matters.',
    'Awesome! Your tree is growing.',
    'Solid! Instant progress.',
    'Keep going — this counts.',
  ];

  const list = params.language === 'ua' ? ua : en;
  const idx = Math.floor(Math.random() * list.length);

  const base = list[idx] ?? list[0];
  if (params.taskTitle && params.language === 'ua') {
    return `${base} (${params.taskTitle})`;
  }
  return base;
}
