export interface StoreSettings {
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  locale: string;
}

export interface ProfileSettings {
  name: string;
  email: string;
  avatar?: string;
}

export interface SettingsBundle {
  profile: ProfileSettings;
  store: StoreSettings;
}
