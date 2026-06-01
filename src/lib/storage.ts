import AsyncStorage from '@react-native-async-storage/async-storage';

import { Contact, Profile } from '@/types';

const PROFILE_KEY = 'sang.profile';
const CONTACTS_KEY = 'sang.contacts';

/** The current user's own card, or null if they haven't onboarded yet. */
export async function getProfile(): Promise<Profile | null> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}

export async function saveProfile(profile: Profile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

/** All contacts scanned into this app, newest first. */
export async function getContacts(): Promise<Contact[]> {
  const raw = await AsyncStorage.getItem(CONTACTS_KEY);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as Contact[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function setContacts(contacts: Contact[]): Promise<void> {
  await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
}

/**
 * Add a scanned profile to the saved contacts. If a contact with the same
 * phone+email+name already exists it is refreshed instead of duplicated.
 * Returns the full, newest-first list.
 */
export async function addContact(profile: Profile): Promise<Contact[]> {
  const contacts = await getContacts();
  const matches = (c: Contact) =>
    c.name === profile.name && c.phone === profile.phone && c.email === profile.email;

  const existing = contacts.find(matches);
  const next: Contact = existing
    ? { ...existing, scannedAt: Date.now() }
    : { ...profile, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, scannedAt: Date.now() };

  const others = contacts.filter((c) => c.id !== next.id);
  const list = [next, ...others];
  await setContacts(list);
  return list;
}

export async function getContact(id: string): Promise<Contact | null> {
  const contacts = await getContacts();
  return contacts.find((c) => c.id === id) ?? null;
}

export async function removeContact(id: string): Promise<Contact[]> {
  const contacts = await getContacts();
  const list = contacts.filter((c) => c.id !== id);
  await setContacts(list);
  return list;
}
