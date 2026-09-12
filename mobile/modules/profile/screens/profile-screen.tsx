import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import UserAvatar from "@/modules/profile/components/profile-icon";
import { NotificationModal } from "@/modules/notifications/components/notification-modal";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef } from "react";
import SettingsBtn from "../components/settings-btn";

const GREEN = "#C5FF27";
const INK = "#101010";
const CARD = "#191919";
const MUTED = "#858585";

const demoUser = {
  name: "Suzi Hathway",
  username: "suzi_hathway",
  avatarSeed: "suzi Hathway",
  calories: "1,840",
  streak: 12,
  level: 8,
  days: 76,
};

const week = [
  { day: "Mon", date: "24", state: "done" },
  { day: "Tue", date: "25", state: "done" },
  { day: "Wed", date: "26", state: "low" },
  { day: "Thu", date: "27", state: "today" },
  { day: "Fri", date: "28", state: "future" },
  { day: "Sat", date: "29", state: "future" },
  { day: "Sun", date: "30", state: "future" },
];

export default function ProfileScreen() {
  const notificationRef = useRef<BottomSheetModal>(null);

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.eyebrow}>YOUR SPACE</Text>
            <Text style={styles.pageTitle}>Profile</Text>
          </View>

          <View style={styles.topActions}>
            <Pressable
              onPress={() => notificationRef.current?.present()}
              style={styles.iconButton}
            >
              <Ionicons name="notifications-outline" size={20} color="#FFF" />
              <View style={styles.notificationDot} />
            </Pressable>
            <View style={styles.iconButton}>
              <SettingsBtn />
            </View>
          </View>
        </View>

        <View style={styles.profileHero}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarClip}>
              <UserAvatar username={demoUser.avatarSeed} />
            </View>
            <View style={styles.onlineBadge}>
              <Ionicons name="checkmark" size={12} color={INK} />
            </View>
          </View>

          <Text style={styles.name}>{demoUser.name}</Text>
          <Text style={styles.username}>@{demoUser.username}</Text>

          <Pressable style={styles.editButton}>
            <Ionicons name="pencil" size={13} color="#DCDCDC" />
            <Text style={styles.editText}>Edit profile</Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <Stat icon="flame" value={`${demoUser.streak}`} label="Day streak" />
          <View style={styles.divider} />
          <Stat icon="ribbon" value={`${demoUser.level}`} label="Level" />
          <View style={styles.divider} />
          <Stat
            icon="calendar"
            value={`${demoUser.days}`}
            label="Active days"
          />
        </View>

        <View style={styles.weekCard}>
          <View style={styles.sectionHeading}>
            <View>
              <Text style={styles.sectionTitle}>Your consistency</Text>
              <Text style={styles.sectionSubtitle}>
                4 of 7 daily goals completed
              </Text>
            </View>
            <View style={styles.streakPill}>
              <Ionicons name="flame" size={14} color={INK} />
              <Text style={styles.streakPillText}>{demoUser.streak}</Text>
            </View>
          </View>

          <View style={styles.weekRow}>
            {week.map((item) => (
              <View
                key={item.day}
                style={[styles.day, item.state === "today" && styles.today]}
              >
                <View
                  style={[
                    styles.dayDot,
                    item.state === "done" && styles.doneDot,
                    item.state === "future" && styles.futureDot,
                  ]}
                />
                <Text style={styles.dayName}>{item.day}</Text>
                <Text
                  style={[
                    styles.dayDate,
                    item.state === "today" && styles.todayText,
                  ]}
                >
                  {item.date}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressIcon}>
            <Ionicons name="nutrition" size={28} color={INK} />
          </View>
          <View style={styles.progressCopy}>
            <Text style={styles.cardKicker}>TODAY</Text>
            <Text style={styles.cardTitle}>Keep it balanced!</Text>
            <Text style={styles.cardDescription}>
              You’re only 160 kcal away from today’s goal.
            </Text>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.progressLabel}>
              {demoUser.calories} / 2,000 kcal
            </Text>
          </View>
        </View>

        <Pressable style={styles.challengeCard}>
          <View style={styles.challengeArt}>
            <Ionicons name="trophy" size={38} color={INK} />
          </View>
          <View style={styles.challengeCopy}>
            <Text style={styles.cardKicker}>WEEKLY CHALLENGE</Text>
            <Text style={styles.cardTitle}>Complete five goals</Text>
            <Text style={styles.cardDescription}>
              Finish one more healthy day to earn 250 points.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#777" />
        </Pressable>

        <View style={styles.sectionHeadingBottom}>
          <Text style={styles.sectionTitle}>Quick settings</Text>
          <Text style={styles.seeAll}>View all</Text>
        </View>

        <View style={styles.settingsCard}>
          <SettingRow
            icon="flag-outline"
            title="Nutrition goal"
            value="2,000 kcal"
          />
          <View style={styles.settingDivider} />
          <SettingRow
            icon="body-outline"
            title="Current weight"
            value="72.4 kg"
          />
          <View style={styles.settingDivider} />
          <SettingRow
            icon="notifications-outline"
            title="Meal reminders"
            value="On"
          />
        </View>
      </ScrollView>
      <NotificationModal sheetRef={notificationRef} />
    </SafeAreaView>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value: string;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <View style={styles.statValueRow}>
        <Ionicons name={icon} size={19} color={GREEN} />
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SettingRow({
  icon,
  title,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  value: string;
}) {
  return (
    <Pressable style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={18} color={GREEN} />
      </View>
      <Text style={styles.settingTitle}>{title}</Text>
      <Text style={styles.settingValue}>{value}</Text>
      <Ionicons name="chevron-forward" size={16} color="#555" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: INK },
  content: { paddingHorizontal: 18, paddingBottom: 28 },
  topBar: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyebrow: { color: GREEN, fontSize: 9, fontWeight: "800", letterSpacing: 1.7 },
  pageTitle: { color: "#FFF", fontSize: 23, fontWeight: "800", marginTop: 2 },
  topActions: { flexDirection: "row", gap: 8 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#292929",
  },
  notificationDot: {
    position: "absolute",
    right: 8,
    top: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN,
    borderWidth: 1,
    borderColor: CARD,
  },
  profileHero: { alignItems: "center", paddingTop: 16, paddingBottom: 22 },
  avatarRing: {
    width: 142,
    height: 142,
    borderRadius: 71,
    borderWidth: 2,
    borderColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarClip: { width: 128, height: 128, borderRadius: 64, overflow: "hidden" },
  onlineBadge: {
    position: "absolute",
    right: 3,
    bottom: 15,
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN,
    borderWidth: 3,
    borderColor: INK,
  },
  name: { color: "#FFF", fontSize: 25, fontWeight: "800", marginTop: 15 },
  username: { color: MUTED, fontSize: 12, marginTop: 3 },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#292929",
    paddingHorizontal: 13,
    height: 35,
    marginTop: 14,
  },
  editText: { color: "#DCDCDC", fontSize: 11, fontWeight: "600" },
  statsRow: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#282828",
    marginBottom: 12,
  },
  stat: { flex: 1, alignItems: "center" },
  statValueRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statValue: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  statLabel: { color: MUTED, fontSize: 9, marginTop: 4 },
  divider: { width: 1, height: 30, backgroundColor: "#303030" },
  weekCard: {
    backgroundColor: CARD,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#282828",
    padding: 16,
    marginBottom: 12,
  },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  sectionSubtitle: { color: MUTED, fontSize: 9, marginTop: 4 },
  streakPill: {
    height: 29,
    borderRadius: 10,
    backgroundColor: GREEN,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
  },
  streakPillText: { color: INK, fontSize: 11, fontWeight: "900" },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  day: {
    width: 39,
    height: 65,
    borderRadius: 13,
    alignItems: "center",
    paddingTop: 8,
  },
  today: { borderWidth: 1.5, borderColor: GREEN, backgroundColor: "#20251A" },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#777",
    marginBottom: 7,
  },
  doneDot: { backgroundColor: GREEN },
  futureDot: { backgroundColor: "#383838" },
  dayName: { color: MUTED, fontSize: 9 },
  dayDate: { color: "#EEE", fontSize: 13, fontWeight: "700", marginTop: 5 },
  todayText: { color: GREEN },
  progressCard: {
    minHeight: 145,
    borderRadius: 22,
    backgroundColor: "#20291A",
    borderWidth: 1,
    borderColor: "#344020",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressIcon: {
    width: 67,
    height: 85,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN,
    transform: [{ rotate: "-6deg" }],
  },
  progressCopy: { flex: 1, marginLeft: 17 },
  cardKicker: {
    color: GREEN,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  cardTitle: { color: "#FFF", fontSize: 16, fontWeight: "800", marginTop: 5 },
  cardDescription: {
    color: MUTED,
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 5,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "#39402E",
    marginTop: 12,
  },
  progressFill: {
    width: "92%",
    height: 5,
    borderRadius: 3,
    backgroundColor: GREEN,
  },
  progressLabel: { color: "#A8A8A8", fontSize: 8, marginTop: 6 },
  challengeCard: {
    minHeight: 113,
    borderRadius: 21,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#282828",
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 24,
  },
  challengeArt: {
    width: 72,
    height: 78,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN,
    transform: [{ rotate: "4deg" }],
  },
  challengeCopy: { flex: 1, marginLeft: 15, marginRight: 5 },
  sectionHeadingBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  seeAll: { color: GREEN, fontSize: 10, fontWeight: "700" },
  settingsCard: {
    borderRadius: 20,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#282828",
    overflow: "hidden",
  },
  settingRow: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#252A1D",
    alignItems: "center",
    justifyContent: "center",
  },
  settingTitle: {
    flex: 1,
    color: "#E8E8E8",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 11,
  },
  settingValue: { color: MUTED, fontSize: 10, marginRight: 7 },
  settingDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#292929",
    marginLeft: 58,
  },
});
