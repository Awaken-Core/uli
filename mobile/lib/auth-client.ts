import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(
  /\/$/,
  "",
);

if (!apiBaseUrl) {
  throw new Error("EXPO_PUBLIC_API_BASE_URL is not configured");
}

export const authClient = createAuthClient({
  baseURL: apiBaseUrl,
  plugins: [
    expoClient({
      scheme: "mobile",
      storagePrefix: "uli",
      storage: SecureStore,
    }),
  ],
});
