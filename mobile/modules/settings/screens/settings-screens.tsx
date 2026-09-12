import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GREEN = "#C5FF27";
const INK = "#101010";
const CARD = "#191919";
const MUTED = "#858585";

export default function SettingsScreen() {
  const router = useRouter();
  const [mealReminders, setMealReminders] = useState(true);
  const [waterReminders, setWaterReminders] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={21} color="#FFF" />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>YOUR PREFERENCES</Text>
          <Text style={styles.title}>Settings</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.sectionLabel}>NUTRITION</Text>
        <View style={styles.card}>
          <SettingLink
            icon="flag-outline"
            title="Daily calorie goal"
            value="2,000 kcal"
          />
          <Divider />
          <SettingLink
            icon="pie-chart-outline"
            title="Macro targets"
            value="Balanced"
          />
          <Divider />
          <SettingLink
            icon="restaurant-outline"
            title="Diet preference"
            value="Vegetarian"
          />
          <Divider />
          <SettingLink icon="warning-outline" title="Allergies" value="None" />
        </View>

        <Text style={styles.sectionLabel}>REMINDERS</Text>
        <View style={styles.card}>
          <SettingToggle
            icon="notifications-outline"
            title="Meal reminders"
            subtitle="Breakfast, lunch and dinner"
            value={mealReminders}
            onChange={setMealReminders}
          />
          <Divider />
          <SettingToggle
            icon="water-outline"
            title="Water reminders"
            subtitle="Every two hours"
            value={waterReminders}
            onChange={setWaterReminders}
          />
          <Divider />
          <SettingToggle
            icon="document-text-outline"
            title="Weekly report"
            subtitle="Nutrition summary every Sunday"
            value={weeklyReport}
            onChange={setWeeklyReport}
          />
        </View>

        <Text style={styles.sectionLabel}>APP</Text>
        <View style={styles.card}>
          <SettingLink icon="moon-outline" title="Appearance" value="Dark" />
          <Divider />
          <SettingLink icon="scale-outline" title="Units" value="Metric" />
          <Divider />
          <SettingLink
            icon="language-outline"
            title="Language"
            value="English"
          />
        </View>

        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <SettingLink icon="person-outline" title="Personal details" />
          <Divider />
          <SettingLink
            icon="shield-checkmark-outline"
            title="Privacy and data"
          />
          <Divider />
          <SettingLink icon="help-circle-outline" title="Help and support" />
        </View>

        <Pressable style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={18} color="#FF7777" />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
        <Text style={styles.version}>Uli mobile · Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingLink({
  icon,
  title,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  value?: string;
}) {
  return (
    <Pressable style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={GREEN} />
      </View>
      <Text style={styles.rowTitle}>{title}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      <Ionicons name="chevron-forward" size={16} color="#555" />
    </Pressable>
  );
}

function SettingToggle({
  icon,
  title,
  subtitle,
  value,
  onChange,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={GREEN} />
      </View>
      <View style={styles.toggleCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#363636", true: GREEN }}
        thumbColor={value ? INK : "#888"}
        ios_backgroundColor="#363636"
      />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: INK },
  header: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 17,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#292929",
  },
  backButton: {
    width: 41,
    height: 41,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#292929",
  },
  headerCopy: { flex: 1, alignItems: "center" },
  eyebrow: {
    color: GREEN,
    fontSize: 7.5,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  title: { color: "#FFF", fontSize: 18, fontWeight: "800", marginTop: 2 },
  headerSpacer: { width: 41 },
  content: { paddingHorizontal: 17, paddingBottom: 30 },
  sectionLabel: {
    color: "#686868",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginTop: 23,
    marginBottom: 8,
    marginLeft: 3,
  },
  card: {
    borderRadius: 21,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#292929",
    overflow: "hidden",
  },
  row: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#252A1D",
  },
  rowTitle: {
    flex: 1,
    color: "#ECECEC",
    fontSize: 11.5,
    fontWeight: "700",
    marginLeft: 11,
  },
  rowValue: { color: MUTED, fontSize: 9, marginRight: 7 },
  toggleCopy: { flex: 1, marginRight: 8 },
  rowSubtitle: { color: MUTED, fontSize: 8, marginTop: 4, marginLeft: 11 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#292929",
    marginLeft: 60,
  },
  signOutButton: {
    height: 53,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    backgroundColor: "#231919",
    borderWidth: 1,
    borderColor: "#3B2525",
  },
  signOutText: { color: "#FF7777", fontSize: 11, fontWeight: "800" },
  version: {
    color: "#4E4E4E",
    fontSize: 8,
    textAlign: "center",
    marginTop: 16,
  },
});
