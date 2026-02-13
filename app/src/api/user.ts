import api from './client';
import { ENDPOINTS } from '../constants/api';
import type { ApiUser } from './auth';

export async function getMe() {
  const { data } = await api.get<ApiUser>(ENDPOINTS.user.me);
  return data;
}

export async function updateMe(body: { name?: string; preferred_languages?: string[] }) {
  const { data } = await api.put<ApiUser>(ENDPOINTS.user.me, body);
  return data;
}

export async function deleteAccount() {
  await api.delete(ENDPOINTS.user.deleteAccount);
}

export async function createPin(pin: string) {
  await api.post(ENDPOINTS.user.pin, { pin });
}

export async function verifyPin(pin: string) {
  const { data } = await api.post<{ valid: boolean }>(ENDPOINTS.user.pinVerify, { pin });
  return data.valid;
}

export async function checkPinExists() {
  const { data } = await api.get<{ has_pin: boolean }>(ENDPOINTS.user.pinExists);
  return data.has_pin;
}

export async function getUserStats() {
  const { data } = await api.get<{ total_hours: number; unique_books: number; streak_days: number }>(ENDPOINTS.user.stats);
  return data;
}

export async function recordListenTime(seconds: number, bookId: string) {
  await api.post(ENDPOINTS.user.listenTime, null, { params: { seconds, book_id: bookId } });
}

export async function changeWhatsapp(newNumber: string, newCountryCode: string) {
  await api.post(ENDPOINTS.user.changeWhatsapp, {
    new_whatsapp_number: newNumber,
    new_country_code: newCountryCode,
  });
}

export async function verifyWhatsapp(otp: string) {
  await api.post(ENDPOINTS.user.verifyWhatsapp, { otp });
}
