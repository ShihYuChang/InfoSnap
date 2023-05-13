import { getTagColor } from './Header';

describe('get tags with color object', () => {
  test('should get an object with tag name and their color', () => {
    const tags = [
      { name: 'dashboard', color: null },
      { name: 'finance', color: '#003D79' },
      { name: 'notes', color: '#01B468' },
      { name: 'tasks', color: '#FFA042' },
      { name: 'health', color: '#C48888' },
    ];
    const result = getTagColor(tags);
    expect(result).toEqual({
      finance: '#003D79',
      notes: '#01B468',
      tasks: '#FFA042',
      health: '#C48888',
    });
  });
});
