// season.js — the wish genie's seasonal persona, driven by the calendar month.
export function seasonOf() {
  const m = new Date().getMonth(); // 0..11
  if (m === 11) return { key: 'santa', name: 'Santa', emoji: '🎅', tint: '#C0392B', line: 'Ho ho ho — let me peek at both your lists.' };
  if (m === 1) return { key: 'cupid', name: 'Cupid', emoji: '💘', tint: '#D6336C', line: 'Love is in the air — and in your wishlists.' };
  if (m >= 2 && m <= 4) return { key: 'spring', name: 'the Spring Sprite', emoji: '🌸', tint: '#5E9C6E', line: 'Fresh blooms, fresh wishes.' };
  if (m >= 5 && m <= 7) return { key: 'sun', name: 'the Summer Genie', emoji: '🌞', tint: '#E08D27', line: 'Sunny days and warm-weather wants.' };
  if (m === 9) return { key: 'spooky', name: 'the Pumpkin Spirit', emoji: '🎃', tint: '#D9772B', line: 'A spooky-good look at your lists.' };
  return { key: 'genie', name: 'the Wish Genie', emoji: '🧞', tint: '#7C5CCB', line: 'Your wishes, summoned and compared.' };
}
