import { MMKV } from 'react-native-mmkv';
import * as SecureStore from 'expo-secure-store';
import { StudyState } from '../types';

export const MMKV_KEY = 'ia-assistente-estudos-state-v1';
export const SECURE_KEY = 'anthropic-api-key';

const storage = new MMKV();

export function readStudyState(): StudyState | null {
  const raw = storage.getString(MMKV_KEY);
  if (raw == null) {
    return null;
  }
  try {
    return JSON.parse(raw) as StudyState;
  } catch {
    console.warn('[storage] Failed to parse study state from MMKV. Resetting to defaults.');
    return null;
  }
}

export function writeStudyState(state: StudyState): void {
  storage.set(MMKV_KEY, JSON.stringify(state));
}

export async function readApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(SECURE_KEY);
}

export async function writeApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(SECURE_KEY, key);
}
