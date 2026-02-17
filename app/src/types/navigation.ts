import type { Book } from './book';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Phone: undefined;
  Birthdate: { phone: string; countryCode: string };
  Login: undefined;
  PinSetup: { phone: string; countryCode: string; birthYear: string };
  Name: { phone: string; countryCode: string; birthYear: string; pin: string };
  Language: { phone: string; countryCode: string; birthYear: string; pin: string; name: string };
};

export type MainStackParamList = {
  Tabs: undefined;
  StoryDetail: { book: Book };
  FullPlayer: undefined;
  LockScreen: undefined;
  Downloads: undefined;
};

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Library: undefined;
  Profile: undefined;
};
