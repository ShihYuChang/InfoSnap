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

export function getDaysLeft(date) {
  const now = new Date(date);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const diffInMs = endOfMonth - now;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;
  return diffInDays;
}

export function parseRegularTimestamp(date, format) {
  const now = new Date(date);
  return dayjs(now).format(format);
}
