import { Profile } from '@/types';

/**
 * vCard 3.0 helpers. We encode a profile as a standard vCard so the QR works
 * two ways: SANG decodes it richly, and any generic scanner / phone camera
 * recognises it as a contact too.
 */

/** Escape the characters that are special inside a vCard value. */
function escape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function unescape(value: string): string {
  return value.replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
}

/** Build a vCard 3.0 string from a profile. */
export function buildVCard(profile: Profile): string {
  const name = profile.name.trim();
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${escape(name)}`, `N:${escape(name)};;;;`];
  if (profile.phone.trim()) {
    lines.push(`TEL;TYPE=CELL:${escape(profile.phone.trim())}`);
  }
  if (profile.email.trim()) {
    lines.push(`EMAIL;TYPE=INTERNET:${escape(profile.email.trim())}`);
  }
  lines.push('END:VCARD');
  return lines.join('\n');
}

/**
 * Parse a scanned string into a Profile. Returns null if it isn't a vCard we
 * can read. Tolerates CRLF line endings and folded/quoted-printable-free cards.
 */
export function parseVCard(raw: string): Profile | null {
  if (!raw || !/BEGIN:VCARD/i.test(raw)) {
    return null;
  }

  let name = '';
  let phone = '';
  let email = '';

  const lines = raw.split(/\r\n|\r|\n/);
  for (const line of lines) {
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const rawKey = line.slice(0, sep);
    const value = unescape(line.slice(sep + 1).trim());
    const key = rawKey.split(';')[0].trim().toUpperCase();

    switch (key) {
      case 'FN':
        if (!name) name = value;
        break;
      case 'N':
        // N is structured: Family;Given;Additional;Prefix;Suffix
        if (!name) {
          const parts = value.split(';').map((p) => p.trim());
          name = [parts[1], parts[0]].filter(Boolean).join(' ').trim();
        }
        break;
      case 'TEL':
        if (!phone) phone = value;
        break;
      case 'EMAIL':
        if (!email) email = value;
        break;
    }
  }

  if (!name && !phone && !email) {
    return null;
  }
  return { name, phone, email };
}
