import { Stack } from "expo-router";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SystemUI from "expo-system-ui";

SystemUI.setBackgroundColorAsync("#101010");

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#101010" }}>
      <BottomSheetModalProvider>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: "#101010" },
            statusBarStyle: "light",
          }}
        >
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
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
