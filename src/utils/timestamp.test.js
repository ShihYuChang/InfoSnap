import { Timestamp } from 'firebase/firestore';
import { parseTimestamp } from './timestamp';

describe('timestamp parser', () => {
  test('should parse the timestamp with only date to string', () => {
    const now_firebaseTimestamp = Timestamp.fromDate(
      new Date('2023-05-12 11:35')
    );
    const result = parseTimestamp(now_firebaseTimestamp, 'YYYY-MM-DD');
    expect(result).toBe('2023-05-12');
  });

  test('should parse the timestamp with hours and minutes to string', () => {
    const now_firebaseTimestamp = Timestamp.fromDate(
      new Date('2023-05-12 11:35')
    );
    const result = parseTimestamp(now_firebaseTimestamp, 'YYYY-MM-DD HH:mm');
    expect(result).toBe('2023-05-12 11:35');
  });
});
