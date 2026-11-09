"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Monitor, Moon, Palette, Save, Sun, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { usePermission } from "@/components/auth/auth-provider";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { APP_CONFIG } from "@/config/app.config";
import { THEME_PRESET_OPTIONS, type ThemeMode } from "@/lib/preferences/theme";
import { updateSessionProfileAction } from "@/server/auth-actions";
import { settingsService } from "@/services/settings.service";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";
import type { SettingsBundle, StoreSettings } from "@/types/settings";

interface ProfileFormState {
  name: string;
  email: string;
  avatar: string;
}

const emptyStore: StoreSettings = {
  storeName: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  currency: APP_CONFIG.currency,
  locale: APP_CONFIG.locale,
};

export function SettingsView({ defaultTab }: { defaultTab: string }) {
  const router = useRouter();
  const { can, user } = usePermission();
  const [tab, setTab] = useState(defaultTab);
  const [settings, setSettings] = useState<SettingsBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileFormState>({ name: "", email: "", avatar: "" });
  const [store, setStore] = useState<StoreSettings>(emptyStore);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingStore, setIsSavingStore] = useState(false);

  const { themeMode, themePreset, setPreference } = usePreferencesStore(
    useShallow((state) => ({
      themeMode: state.values.theme_mode,
      themePreset: state.values.theme_preset,
      setPreference: state.setPreference,
    })),
  );

  const canUpdateProfile = can("profile:update");
  const canUpdateStore = can("settings:update");

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setError(null);

    settingsService
      .getSettings(user)
      .then((bundle) => {
        if (!isActive) return;
        setSettings(bundle);
        setProfile({
          name: bundle.profile.name,
          email: bundle.profile.email,
          avatar: bundle.profile.avatar ?? "",
        });
        setStore(bundle.store);
      })
      .catch((caught: unknown) => {
        if (isActive) {
          setError(caught instanceof Error ? caught.message : "Unable to load settings.");
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [user]);

  useEffect(() => {
    if (tab === "store" && !can("settings:read")) {
      setTab("profile");
    }
  }, [tab, can]);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (profile.name.trim().length < 2) {
      toast.error("Invalid name", { description: "Name must be at least 2 characters." });
      return;
    }

    setIsSavingProfile(true);

    try {
      const sessionResult = await updateSessionProfileAction({
        name: profile.name.trim(),
        avatar: profile.avatar.trim() || undefined,
      });

      if (!sessionResult.ok) {
        toast.error("Profile update failed", { description: sessionResult.error });
        return;
      }

      await settingsService.updateProfile(user, {
        name: profile.name.trim(),
        email: profile.email,
        avatar: profile.avatar.trim() || undefined,
      });

      toast.success("Profile updated");
      router.refresh();
    } catch (caught) {
      toast.error("Profile update failed", {
        description: caught instanceof Error ? caught.message : "Unable to update your profile.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleStoreSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canUpdateStore) {
      toast.error("Not allowed", { description: "Your role cannot update store settings." });
      return;
    }

    if (store.storeName.trim().length < 2 || !store.contactEmail.includes("@")) {
      toast.error("Invalid details", { description: "Enter a store name and a valid contact email." });
      return;
    }

    setIsSavingStore(true);

    try {
      const updated = await settingsService.updateStore({
        ...store,
        storeName: store.storeName.trim(),
        contactEmail: store.contactEmail.trim(),
        contactPhone: store.contactPhone.trim(),
        address: store.address.trim(),
      });
      setStore(updated);
      toast.success("Store settings saved");
    } catch (caught) {
      toast.error("Save failed", {
        description: caught instanceof Error ? caught.message : "Unable to save store settings.",
      });
    } finally {
      setIsSavingStore(false);
    }
  };

  const onThemePresetChange = (value: string) => {
    const preset = THEME_PRESET_OPTIONS.find((option) => option.value === value);
    if (preset) setPreference("theme_preset", preset.value);
  };

  const onThemeModeChange = (value: string) => {
    if (value === "light" || value === "dark" || value === "system") {
      setPreference("theme_mode", value as ThemeMode);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Settings" description="Update your profile, store details, and appearance." />
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="space-y-4">
        <PageHeader title="Settings" description="Update your profile, store details, and appearance." />
        <Alert variant="destructive">
          <AlertTitle>Unable to load settings</AlertTitle>
          <AlertDescription>{error ?? "Settings are unavailable right now."}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" description="Update your profile, store details, and appearance." />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="profile">
            <UserRound />
            Profile
          </TabsTrigger>
          {can("settings:read") ? (
            <TabsTrigger value="store">
              <Palette />
              Store
            </TabsTrigger>
          ) : null}
          <TabsTrigger value="appearance">
            <Palette />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>This is how your account appears across the dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="grid max-w-2xl gap-4" noValidate>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Name" htmlFor="settings-name">
                    <Input
                      id="settings-name"
                      value={profile.name}
                      onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                      disabled={!canUpdateProfile}
                    />
                  </FormField>
                  <FormField label="Email" htmlFor="settings-email" hint="Sign-in email changes require a Super Admin.">
                    <Input id="settings-email" value={profile.email} disabled />
                  </FormField>
                </div>
                <FormField
                  label="Avatar URL"
                  htmlFor="settings-avatar"
                  hint="Optional. Leave empty to use your initials."
                >
                  <Input
                    id="settings-avatar"
                    value={profile.avatar}
                    onChange={(event) => setProfile((current) => ({ ...current, avatar: event.target.value }))}
                    placeholder="https://…"
                    disabled={!canUpdateProfile}
                  />
                </FormField>
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="submit" size="sm" disabled={!canUpdateProfile || isSavingProfile}>
                    <Save data-icon="inline-start" />
                    {isSavingProfile ? "Saving…" : "Save profile"}
                  </Button>
                  <span className="text-muted-foreground text-xs">
                    Signed in as {user.roleName} · {user.permissions.length} permissions
                  </span>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {can("settings:read") ? (
          <TabsContent value="store" className="mt-4">
            <Card size="sm">
              <CardHeader>
                <CardTitle>Store</CardTitle>
                <CardDescription>Public store details used on invoices and customer emails.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStoreSubmit} className="grid max-w-2xl gap-4" noValidate>
                  {!canUpdateStore ? (
                    <Alert>
                      <AlertTitle>Read-only access</AlertTitle>
                      <AlertDescription>Your role can view store settings but cannot change them.</AlertDescription>
                    </Alert>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormField label="Store name" htmlFor="store-name">
                      <Input
                        id="store-name"
                        value={store.storeName}
                        onChange={(event) => setStore((current) => ({ ...current, storeName: event.target.value }))}
                        disabled={!canUpdateStore}
                      />
                    </FormField>
                    <FormField label="Contact email" htmlFor="store-email">
                      <Input
                        id="store-email"
                        type="email"
                        value={store.contactEmail}
                        onChange={(event) => setStore((current) => ({ ...current, contactEmail: event.target.value }))}
                        disabled={!canUpdateStore}
                      />
                    </FormField>
                    <FormField label="Contact phone" htmlFor="store-phone">
                      <Input
                        id="store-phone"
                        value={store.contactPhone}
                        onChange={(event) => setStore((current) => ({ ...current, contactPhone: event.target.value }))}
                        disabled={!canUpdateStore}
                      />
                    </FormField>
                    <FormField label="Currency" hint="Used by the storefront and invoices.">
                      <Select
                        value={store.currency}
                        onValueChange={(value) => setStore((current) => ({ ...current, currency: value }))}
                        disabled={!canUpdateStore}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["USD", "EUR", "GBP", "IDR", "JPY", "SGD"].map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                  <FormField label="Address" htmlFor="store-address">
                    <Textarea
                      id="store-address"
                      value={store.address}
                      onChange={(event) => setStore((current) => ({ ...current, address: event.target.value }))}
                      rows={2}
                      disabled={!canUpdateStore}
                    />
                  </FormField>
                  <div className="flex items-center gap-2">
                    <Button type="submit" size="sm" disabled={!canUpdateStore || isSavingStore}>
                      <Save data-icon="inline-start" />
                      {isSavingStore ? "Saving…" : "Save store settings"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        ) : null}

        <TabsContent value="appearance" className="mt-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Personalize the dashboard theme. These preferences are stored in your browser.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid max-w-2xl gap-5">
              <div className="grid gap-2">
                <span className="text-sm font-medium">Theme mode</span>
                <ToggleGroup type="single" variant="outline" value={themeMode} onValueChange={onThemeModeChange}>
                  <ToggleGroupItem value="light" aria-label="Light theme">
                    <Sun data-icon="inline-start" />
                    Light
                  </ToggleGroupItem>
                  <ToggleGroupItem value="dark" aria-label="Dark theme">
                    <Moon data-icon="inline-start" />
                    Dark
                  </ToggleGroupItem>
                  <ToggleGroupItem value="system" aria-label="System theme">
                    <Monitor data-icon="inline-start" />
                    System
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="grid gap-2">
                <span className="text-sm font-medium">Theme preset</span>
                <Select value={themePreset} onValueChange={onThemePresetChange}>
                  <SelectTrigger className="w-full sm:max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {THEME_PRESET_OPTIONS.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        <span
                          className="size-2.5 rounded-full"
                          style={{
                            backgroundColor: themeMode === "dark" ? preset.primary.dark : preset.primary.light,
                          }}
                        />
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <p className="text-muted-foreground text-xs">
                Sidebar layout, content width, fonts, and navbar behavior can be adjusted from the preferences button in
                the dashboard header.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
