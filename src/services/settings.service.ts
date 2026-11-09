import { APP_CONFIG } from "@/config/app.config";
import { env } from "@/config/env";
import { apiClient } from "@/lib/api/client";
import { mockDelay } from "@/mocks/utils";
import type { AuthUser } from "@/types/auth";
import type { ProfileSettings, SettingsBundle, StoreSettings } from "@/types/settings";

const PROFILE_KEY = "ecommerce-admin:profile";
const STORE_KEY = "ecommerce-admin:store";

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? ({ ...fallback, ...(JSON.parse(raw) as T) } as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function getDefaultStore(): StoreSettings {
  return {
    storeName: APP_CONFIG.company.name,
    contactEmail: APP_CONFIG.company.email,
    contactPhone: APP_CONFIG.company.phone,
    address: APP_CONFIG.company.address,
    currency: APP_CONFIG.currency,
    locale: APP_CONFIG.locale,
  };
}

function getDefaultProfile(user: AuthUser): ProfileSettings {
  return {
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  };
}

export const settingsService = {
  /** GET /settings */
  async getSettings(user: AuthUser): Promise<SettingsBundle> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay(160);
      return {
        profile: readStorage(PROFILE_KEY, getDefaultProfile(user)),
        store: readStorage(STORE_KEY, getDefaultStore()),
      };
    }

    return apiClient<SettingsBundle>("/settings");
  },

  /** PATCH /settings/profile */
  async updateProfile(user: AuthUser, input: ProfileSettings): Promise<ProfileSettings> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      const profile = { ...getDefaultProfile(user), ...input };
      writeStorage(PROFILE_KEY, profile);
      return profile;
    }

    return apiClient<ProfileSettings>("/settings/profile", { method: "PATCH", json: input });
  },

  /** PATCH /settings/store */
  async updateStore(input: StoreSettings): Promise<StoreSettings> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      writeStorage(STORE_KEY, input);
      return input;
    }

    return apiClient<StoreSettings>("/settings/store", { method: "PATCH", json: input });
  },

  /** POST /settings/change-password */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (currentPassword === newPassword) {
      throw new Error("The new password must be different from the current password.");
    }

    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay(320);
      return;
    }

    await apiClient<void>("/settings/change-password", {
      method: "POST",
      json: { currentPassword, newPassword },
    });
  },
};
