import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

const SettingsBtn = () => {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open settings"
      onPress={() => router.push("/settings")}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons name="settings-outline" size={20} color="#FFF" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.55 },
});

export default SettingsBtn;
