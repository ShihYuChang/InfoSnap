import { Timestamp } from 'firebase/firestore';
import {
  getDaysLeft,
  parseRegularTimestamp,
  parseTimestamp,
} from './timestamp';

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

describe('get days left till the end of the month', () => {
  test('should return 17', () => {
    const result = getDaysLeft('2023-05-14');
    expect(result).toBe(17);
  });

  test('should return 1', () => {
    const result = getDaysLeft('2023-05-30');
    expect(result).toBe(1);
  });
});

describe('parse regular timestamp to readable format', () => {
  test('should return 2023-05-16', () => {
    const now = new Date();
    const result = parseRegularTimestamp(now, 'YYYY-MM-DD');
    expect(result).toBe('2023-05-16');
  });

  test('should return 16', () => {
    const now = new Date();
    const result = parseRegularTimestamp(now, 'DD');
    expect(result).toBe('16');
  });
});
