const MIN_LENGTH = 2;
const MAX_LENGTH = 50;

export function normalizePetName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export function validatePetName(raw: string): { ok: true; name: string } | { ok: false; error: string } {
  const name = normalizePetName(raw);

  if (name.length < MIN_LENGTH) {
    return { ok: false, error: `Pet name must be at least ${MIN_LENGTH} characters` };
  }
  if (name.length > MAX_LENGTH) {
    return { ok: false, error: `Pet name must be at most ${MAX_LENGTH} characters` };
  }

  return { ok: true, name };
}
