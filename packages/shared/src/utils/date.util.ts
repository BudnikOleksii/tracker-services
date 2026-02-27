export const formatDate = (date: Date): string => {
  return date.toISOString();
};

export const isValidDate = (value: unknown): value is Date => {
  if (!(value instanceof Date)) {
    return false;
  }

  return !Number.isNaN(value.getTime());
};

export const parseDate = (value: string): Date => {
  const date = new Date(value);

  if (!isValidDate(date)) {
    throw new Error('Invalid date');
  }

  return date;
};
