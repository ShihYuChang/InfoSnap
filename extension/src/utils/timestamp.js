import dayjs from 'dayjs';

export function parseTimestamp(timestamp, format) {
  const date = new Date(timestamp);
  const formattedDate = dayjs(date).format(format);
  return formattedDate;
}

export function parseFirebaseTimestamp(timestamp, format) {
  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
  );
  const formattedDate = dayjs(date).format(format);
  return formattedDate;
}
