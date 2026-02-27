export const formatDate = (date: Date): string => {
  return date.toISOString();
};

export const isValidDate = (value: unknown): value is Date => {
  if (!(value instanceof Date)) {
    return false;
  }

  return !Number.isNaN(value.getTime());
};

const ISO_8601_DATETIME_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export const parseDate = (value: string): Date => {
  if (!ISO_8601_DATETIME_REGEX.test(value)) {
    throw new Error('Invalid ISO-8601 date format');
  }

  const date = new Date(value);

  if (!isValidDate(date)) {
    throw new Error('Invalid date');
  }

  return date;
};
