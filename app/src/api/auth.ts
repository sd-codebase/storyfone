import api from './client';
import { ENDPOINTS } from '../constants/api';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: ApiUser;
}

export interface ApiUser {
  id: string;
  name: string;
  whatsapp_number: string;
  country_code: string;
  birthdate: string;
  is_adult: boolean;
  is_verified: boolean;
  plan: string;
  status: string;
  preferred_languages: string[];
  created_at: string;
  pending_whatsapp_number?: string;
  pending_country_code?: string;
  has_pending_whatsapp: boolean;
}

export async function register(
  whatsapp_number: string,
  country_code: string,
  birthdate: string,
  pin: string,
  name: string,
  preferred_languages: string[],
) {
  const { data } = await api.post<AuthResponse>(ENDPOINTS.auth.register, {
    whatsapp_number,
    country_code,
    birthdate,
    pin,
    name,
    preferred_languages,
  });
  return data;
}

export async function login(whatsapp_number: string, country_code: string, pin: string) {
  const { data } = await api.post<AuthResponse>(ENDPOINTS.auth.login, {
    whatsapp_number,
    country_code,
    pin,
  });
  return data;
}

export interface LanguageOption {
  id: string;
  name: string;
}

export async function getAvailableLanguages() {
  const { data } = await api.get<LanguageOption[]>(ENDPOINTS.auth.languages);
  return data;
}
