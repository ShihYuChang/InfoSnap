import dayjs from 'dayjs';
import { Timestamp } from 'firebase/firestore';

export function parseTimestamp(timestamp, format) {
  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
  );
  const formattedDate = dayjs(date).format(format);
  return formattedDate;
}

export function getTimestampDaysAgo(daysAgo, hr, min, sec) {
  const now = new Date();
  now.setDate(now.getDate() - daysAgo);
  now.setHours(hr, min, sec);
  const timestamp = Timestamp.fromDate(now);
  return timestamp;
}

export function getTimestampWithTime(date, hr, min, sec, nanosec) {
  const now = new Date(date);
  now.setDate(now.getDate());
  now.setHours(hr, min, sec, nanosec);
  const timestamp = Timestamp.fromDate(now);
  return timestamp;
}
