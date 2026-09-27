import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/lib/auth-client";
import { Text, TextInput } from "@/components/ui/typography";

const GREEN = "#C5FF27";
const INK = "#101010";

export default function SignInScreen() {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsPending(true);
    setError(null);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (result.error) {
        setError(
          result.error.message ?? "Unable to sign in. Please try again.",
        );
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to reach the authentication server.",
      );
    } finally {
      setIsPending(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    if (isCreatingAccount && !name.trim()) {
      setError("Enter your name.");
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      const result = isCreatingAccount
        ? await authClient.signUp.email({
            name: name.trim(),
            email: email.trim(),
            password,
          })
        : await authClient.signIn.email({
            email: email.trim(),
            password,
          });

      if (result.error) {
        setError(result.error.message ?? "Authentication failed.");
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to reach the authentication server.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mark}>
            <Text style={styles.markText}>U</Text>
          </View>
          <Text style={styles.eyebrow}>YOUR HEALTH, IN BALANCE</Text>
          <Text style={styles.title}>Welcome to Uli</Text>
          <Text style={styles.subtitle}>
            Sign in to keep your nutrition, fitness, and progress in sync.
          </Text>

          {isCreatingAccount ? (
            <TextInput
              autoCapitalize="words"
              editable={!isPending}
              onChangeText={setName}
              placeholder="Name"
              placeholderTextColor="#656565"
              style={styles.input}
              value={name}
            />
          ) : null}
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            editable={!isPending}
            inputMode="email"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#656565"
            style={styles.input}
            value={email}
          />
          <TextInput
            autoCapitalize="none"
            autoComplete={
              isCreatingAccount ? "new-password" : "current-password"
            }
            editable={!isPending}
            onChangeText={setPassword}
            onSubmitEditing={handleEmailAuth}
            placeholder="Password"
            placeholderTextColor="#656565"
            secureTextEntry
            style={styles.input}
            value={password}
          />

          <Pressable
            disabled={isPending}
            onPress={handleEmailAuth}
            style={({ pressed }) => [
              styles.emailButton,
              pressed && styles.pressed,
              isPending && styles.disabled,
            ]}
          >
            {isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.emailButtonText}>
                {isCreatingAccount ? "Create account" : "Sign in"}
              </Text>
            )}
          </Pressable>

          <Pressable
            disabled={isPending}
            onPress={() => {
              setIsCreatingAccount((current) => !current);
              setError(null);
            }}
          >
            <Text style={styles.switchText}>
              {isCreatingAccount
                ? "Already have an account? Sign in"
                : "New to Uli? Create an account"}
            </Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={isPending}
            onPress={handleGoogleSignIn}
            style={({ pressed }) => [
              styles.googleButton,
              pressed && styles.pressed,
              isPending && styles.disabled,
            ]}
          >
            {isPending ? (
              <ActivityIndicator color={INK} />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color={INK} />
                <Text style={styles.googleButtonText}>
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.terms}>
            By continuing, you agree to Uli&apos;s terms and privacy policy.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: INK },
  keyboardView: { flex: 1 },
  content: {
    flexGrow: 1,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  mark: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN,
    marginBottom: 28,
  },
  markText: { color: INK, fontSize: 34, fontWeight: "900" },
  eyebrow: {
    color: GREEN,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.8,
  },
  title: { color: "#FFF", fontSize: 34, fontWeight: "900", marginTop: 9 },
  subtitle: {
    color: "#8D8D8D",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 28,
  },
  input: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#303030",
    backgroundColor: "#191919",
    color: "#FFF",
    fontSize: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  emailButton: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#292929",
  },
  emailButtonText: { color: "#FFF", fontSize: 14, fontWeight: "800" },
  switchText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 16,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 22,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#333",
  },
  dividerText: { color: "#666", fontSize: 9, fontWeight: "800" },
  googleButton: {
    height: 56,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: GREEN,
  },
  pressed: { opacity: 0.86 },
  disabled: { opacity: 0.65 },
  googleButtonText: { color: INK, fontSize: 14, fontWeight: "900" },
  error: {
    color: "#FF8585",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 16,
  },
  terms: {
    color: "#575757",
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 20,
  },
});
