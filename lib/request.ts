export function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

export function asOptionalString(value: unknown) {
  const clean = asString(value);
  return clean.length > 0 ? clean : null;
}

export function asBoolean(value: unknown, fallback = true) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return fallback;
}

export function asNumber(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function hasRequiredStrings(body: Record<string, unknown>, fields: string[]) {
  return fields.every((field) => asString(body[field]).length > 0);
}

export function parseSearch(value: unknown) {
  return asString(value).toLowerCase();
}
