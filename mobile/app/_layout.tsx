import { Stack } from "expo-router";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SystemUI from "expo-system-ui";
import { ActivityIndicator, View } from "react-native";

import { authClient } from "@/lib/auth-client";

SystemUI.setBackgroundColorAsync("#101010");

export default function RootLayout() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#101010",
        }}
      >
        <ActivityIndicator color="#C5FF27" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#101010" }}>
      <BottomSheetModalProvider>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: "#101010" },
            statusBarStyle: "light",
          }}
        >
          <Stack.Protected guard={!!session}>
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
                contentStyle: { backgroundColor: "#101010" },
              }}
            />
            <Stack.Screen
              name="settings"
              options={{
                headerShown: false,
                title: "Settings",
                presentation: "transparentModal",
                animation: "slide_from_right",
                contentStyle: { backgroundColor: "#101010" },
              }}
            />
          </Stack.Protected>
          <Stack.Protected guard={!session}>
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
