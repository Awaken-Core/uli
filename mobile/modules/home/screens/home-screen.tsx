import UserAvatar from "@/modules/profile/components/profile-icon";
import { NotificationModal } from "@/modules/notifications/components/notification-modal";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

const GREEN = "#C5FF27";
const INK = "#101010";
const CARD = "#191919";
const MUTED = "#858585";

const daily = {
  name: "Mehul",
  consumed: 1360,
  target: 2000,
  protein: { value: 82, target: 120 },
  carbs: { value: 148, target: 220 },
  fats: { value: 46, target: 65 },
};

const meals = [
  {
    icon: "sunny-outline" as const,
    name: "Breakfast",
    detail: "Eggs, toast & chai",
    calories: 410,
    logged: true,
  },
  {
    icon: "restaurant-outline" as const,
    name: "Lunch",
    detail: "Paneer rice bowl",
    calories: 620,
    logged: true,
  },
  {
    icon: "cafe-outline" as const,
    name: "Snack",
    detail: "Banana & almonds",
    calories: 330,
    logged: true,
  },
  {
    icon: "moon-outline" as const,
    name: "Dinner",
    detail: "Not logged yet",
    calories: 0,
    logged: false,
  },
];

export default function HomeScreen() {
  const notificationRef = useRef<BottomSheetModal>(null);
  const remaining = daily.target - daily.consumed;
  const progress = daily.consumed / daily.target;

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.avatarShell}>
            <View style={styles.avatarInner}>
              <UserAvatar username="Mehul Sharma" />
            </View>
          </View>

          <View style={styles.greeting}>
            <Text style={styles.greetingText}>Good morning,</Text>
            <Text style={styles.name}>{daily.name} 👋</Text>
          </View>

          <Pressable
            onPress={() => notificationRef.current?.present()}
            style={styles.headerButton}
          >
            <Ionicons name="notifications-outline" size={21} color="#FFF" />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        <View style={styles.dateRow}>
          <View>
            <Text style={styles.eyebrow}>THURSDAY, AUG 27</Text>
            <Text style={styles.title}>Today’s overview</Text>
          </View>
          <View style={styles.streakPill}>
            <Ionicons name="flame" size={15} color={INK} />
            <Text style={styles.streakText}>12 day streak</Text>
          </View>
        </View>

        <View style={styles.calorieCard}>
          <View style={styles.glowOrbLarge} />
          <View style={styles.glowOrbSmall} />
          <View style={styles.calorieTop}>
            <View>
              <View style={styles.cardLabelRow}>
                <Text style={styles.cardLabel}>DAILY CALORIES</Text>
                <View style={styles.onTrackPill}>
                  <View style={styles.onTrackDot} />
                  <Text style={styles.onTrackText}>ON TRACK</Text>
                </View>
              </View>
              <Text style={styles.calorieHeadline}>
                {remaining.toLocaleString()}
                <Text style={styles.calorieUnit}> kcal left</Text>
              </Text>
              <Text style={styles.calorieSummary}>
                {daily.consumed.toLocaleString()} consumed of{" "}
                {daily.target.toLocaleString()}
              </Text>
            </View>

            <CalorieRing
              progress={progress}
              value={Math.round(progress * 100)}
            />
          </View>

          <View style={styles.macroRow}>
            <Macro
              color="#FFB86B"
              label="Protein"
              value={daily.protein.value}
              target={daily.protein.target}
            />
            <Macro
              color="#76D8FF"
              label="Carbs"
              value={daily.carbs.value}
              target={daily.carbs.target}
            />
            <Macro
              color="#D49CFF"
              label="Fats"
              value={daily.fats.value}
              target={daily.fats.target}
            />
          </View>

          <Pressable style={styles.logFoodButton}>
            <View style={styles.logFoodIcon}>
              <Ionicons name="add" size={17} color={INK} />
            </View>
            <Text style={styles.logFoodText}>Log food</Text>
            <Text style={styles.logFoodHint}>Keep today’s progress moving</Text>
            <Ionicons name="arrow-forward" size={16} color={INK} />
          </Pressable>
        </View>

        <View style={styles.quickRow}>
          <TargetCard
            icon="water"
            label="Water"
            value="5 / 8"
            unit="glasses"
            progress={0.625}
            color="#70D7FF"
          />
          <TargetCard
            icon="leaf"
            label="Fiber"
            value="18 / 30"
            unit="grams"
            progress={0.6}
            color={GREEN}
          />
        </View>

        <View style={styles.activityHeading}>
          <View>
            <Text style={styles.sectionTitle}>Nutrition targets</Text>
            <Text style={styles.sectionSubtitle}>Your daily quality check</Text>
          </View>
          <Text style={styles.viewAll}>View all</Text>
        </View>

        <View style={styles.activityCard}>
          <ActivityItem
            icon="nutrition-outline"
            value="3 / 5"
            label="fruit & veg"
          />
          <View style={styles.activityDivider} />
          <ActivityItem icon="cube-outline" value="24g" label="sugar today" />
          <View style={styles.activityDivider} />
          <ActivityItem
            icon="shield-checkmark-outline"
            value="1.2g"
            label="sodium"
          />
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Today’s meals</Text>
            <Text style={styles.sectionSubtitle}>3 meals logged</Text>
          </View>
          <Pressable style={styles.addMealButton}>
            <Ionicons name="add" size={17} color={INK} />
            <Text style={styles.addMealText}>Add meal</Text>
          </Pressable>
        </View>

        <View style={styles.mealsCard}>
          {meals.map((meal, index) => (
            <View key={meal.name}>
              <Pressable style={styles.mealRow}>
                <View
                  style={[
                    styles.mealIcon,
                    !meal.logged && styles.mealIconEmpty,
                  ]}
                >
                  <Ionicons
                    name={meal.icon}
                    size={19}
                    color={meal.logged ? GREEN : "#696969"}
                  />
                </View>
                <View style={styles.mealCopy}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealDetail}>{meal.detail}</Text>
                </View>
                {meal.logged ? (
                  <View style={styles.calorieValue}>
                    <Text style={styles.mealCalories}>{meal.calories}</Text>
                    <Text style={styles.mealUnit}>kcal</Text>
                  </View>
                ) : (
                  <View style={styles.addCircle}>
                    <Ionicons name="add" size={18} color={GREEN} />
                  </View>
                )}
              </Pressable>
              {index < meals.length - 1 && <View style={styles.mealDivider} />}
            </View>
          ))}
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Ionicons name="sparkles" size={22} color={INK} />
          </View>
          <View style={styles.insightCopy}>
            <Text style={styles.insightKicker}>ULI’S INSIGHT</Text>
            <Text style={styles.insightTitle}>A little more protein</Text>
            <Text style={styles.insightText}>
              Add a protein-rich dinner to get closer to today’s target.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6F765F" />
        </View>
      </ScrollView>
      <NotificationModal sheetRef={notificationRef} />
    </SafeAreaView>
  );
}

function CalorieRing({ progress, value }: { progress: number; value: number }) {
  const size = 100;
  const stroke = 11;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={styles.ringWrap}>
      <Svg width={size} height={size} style={styles.ringSvg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#30332C"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={GREEN}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={styles.ringValue}>{value}%</Text>
      <Text style={styles.ringLabel}>used</Text>
    </View>
  );
}

function Macro({
  color,
  label,
  value,
  target,
}: {
  color: string;
  label: string;
  value: number;
  target: number;
}) {
  return (
    <View style={styles.macro}>
      <View style={styles.macroHeading}>
        <View style={[styles.macroDot, { backgroundColor: color }]} />
        <Text style={styles.macroLabel}>{label}</Text>
      </View>
      <Text style={styles.macroValue}>
        {value}g <Text style={styles.macroTarget}>/ {target}g</Text>
      </Text>
      <View style={styles.macroTrack}>
        <View
          style={[
            styles.macroFill,
            {
              width: `${Math.min(value / target, 1) * 100}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

function TargetCard({
  icon,
  label,
  value,
  unit,
  progress,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  unit: string;
  progress: number;
  color: string;
}) {
  return (
    <Pressable style={styles.targetCard}>
      <View style={styles.targetTop}>
        <View style={[styles.targetIcon, { backgroundColor: `${color}18` }]}>
          <Ionicons name={icon} size={19} color={color} />
        </View>
        <View style={styles.targetAdd}>
          <Ionicons name="add" size={15} color="#8A8A8A" />
        </View>
      </View>
      <Text style={styles.targetLabel}>{label}</Text>
      <Text style={styles.targetValue}>{value}</Text>
      <Text style={styles.targetUnit}>{unit}</Text>
      <View style={styles.targetTrack}>
        <View
          style={[
            styles.targetFill,
            { width: `${progress * 100}%`, backgroundColor: color },
          ]}
        />
      </View>
    </Pressable>
  );
}

function ActivityItem({
  icon,
  value,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value: string;
  label: string;
}) {
  return (
    <View style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <Ionicons name={icon} size={16} color={GREEN} />
      </View>
      <Text style={styles.activityValue}>{value}</Text>
      <Text style={styles.activityLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: INK },
  content: { paddingHorizontal: 17, paddingBottom: 28 },
  header: { height: 72, flexDirection: "row", alignItems: "center" },
  avatarShell: {
    width: 45,
    height: 45,
    borderRadius: 23,
    padding: 2,
    backgroundColor: GREEN,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 21,
    padding: 2,
    overflow: "hidden",
    backgroundColor: INK,
  },
  greeting: { flex: 1, marginLeft: 11 },
  greetingText: { color: MUTED, fontSize: 10 },
  name: { color: "#FFF", fontSize: 16, fontWeight: "800", marginTop: 2 },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#292929",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN,
    borderWidth: 1,
    borderColor: CARD,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 17,
  },
  eyebrow: { color: GREEN, fontSize: 8, fontWeight: "800", letterSpacing: 1.4 },
  title: { color: "#FFF", fontSize: 25, fontWeight: "800", marginTop: 4 },
  streakPill: {
    height: 31,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    backgroundColor: GREEN,
  },
  streakText: { color: INK, fontSize: 9, fontWeight: "900" },
  calorieCard: {
    borderRadius: 26,
    padding: 18,
    backgroundColor: "#1B2118",
    borderWidth: 1,
    borderColor: "#354225",
    overflow: "hidden",
  },
  glowOrbLarge: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    right: -95,
    top: -105,
    backgroundColor: "rgba(197,255,39,0.08)",
  },
  glowOrbSmall: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    left: -45,
    bottom: -48,
    backgroundColor: "rgba(197,255,39,0.05)",
  },
  calorieTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabelRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  cardLabel: {
    color: GREEN,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  onTrackPill: {
    height: 20,
    borderRadius: 7,
    paddingHorizontal: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(197,255,39,.1)",
  },
  onTrackDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: GREEN },
  onTrackText: {
    color: GREEN,
    fontSize: 6.5,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  calorieHeadline: {
    color: "#FFF",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -1,
    marginTop: 7,
  },
  calorieUnit: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0,
  },
  calorieSummary: { color: MUTED, fontSize: 9, marginTop: 5 },
  ringWrap: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  ringSvg: { position: "absolute" },
  ringValue: { color: "#FFF", fontSize: 18, fontWeight: "900" },
  ringLabel: { color: MUTED, fontSize: 8, marginTop: 1 },
  macroRow: { flexDirection: "row", gap: 9, marginTop: 20 },
  macro: { flex: 1, borderRadius: 15, backgroundColor: "#212121", padding: 10 },
  macroHeading: { flexDirection: "row", alignItems: "center", gap: 5 },
  macroDot: { width: 5, height: 5, borderRadius: 3 },
  macroLabel: { color: MUTED, fontSize: 8 },
  macroValue: { color: "#FFF", fontSize: 11, fontWeight: "800", marginTop: 7 },
  macroTarget: { color: "#666", fontSize: 8, fontWeight: "500" },
  macroTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "#343434",
    marginTop: 10,
    overflow: "hidden",
  },
  macroFill: { height: 7, borderRadius: 4 },
  logFoodButton: {
    height: 48,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    marginTop: 13,
    backgroundColor: GREEN,
  },
  logFoodIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16,16,16,.1)",
  },
  logFoodText: { color: INK, fontSize: 11, fontWeight: "900", marginLeft: 9 },
  logFoodHint: {
    flex: 1,
    color: "rgba(16,16,16,.58)",
    fontSize: 7.5,
    marginLeft: 7,
  },
  quickRow: { flexDirection: "row", gap: 11, marginTop: 12 },
  targetCard: {
    flex: 1,
    minHeight: 151,
    borderRadius: 21,
    padding: 14,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#292929",
  },
  targetTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  targetIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  targetAdd: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#242424",
  },
  targetLabel: { color: MUTED, fontSize: 9, marginTop: 12 },
  targetValue: { color: "#FFF", fontSize: 18, fontWeight: "800", marginTop: 3 },
  targetUnit: { color: "#666", fontSize: 8, marginTop: 2 },
  targetTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#353535",
    marginTop: 12,
    overflow: "hidden",
  },
  targetFill: { height: 8, borderRadius: 4 },
  activityHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 11,
    paddingHorizontal: 2,
  },
  viewAll: { color: GREEN, fontSize: 9, fontWeight: "800" },
  activityCard: {
    height: 103,
    borderRadius: 21,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#292929",
  },
  activityItem: { flex: 1, alignItems: "center" },
  activityIcon: {
    width: 29,
    height: 29,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#252A1D",
    marginBottom: 7,
  },
  activityValue: { color: "#FFF", fontSize: 12, fontWeight: "800" },
  activityLabel: { color: MUTED, fontSize: 7.5, marginTop: 3 },
  activityDivider: {
    width: StyleSheet.hairlineWidth,
    height: 47,
    backgroundColor: "#303030",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 25,
    marginBottom: 11,
  },
  sectionTitle: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  sectionSubtitle: { color: MUTED, fontSize: 9, marginTop: 3 },
  addMealButton: {
    height: 34,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    backgroundColor: GREEN,
  },
  addMealText: { color: INK, fontSize: 9, fontWeight: "900" },
  mealsCard: {
    borderRadius: 22,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#292929",
    overflow: "hidden",
  },
  mealRow: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },
  mealIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#252A1D",
  },
  mealIconEmpty: { backgroundColor: "#232323" },
  mealCopy: { flex: 1, marginLeft: 11 },
  mealName: { color: "#F1F1F1", fontSize: 12, fontWeight: "700" },
  mealDetail: { color: MUTED, fontSize: 9, marginTop: 4 },
  calorieValue: { alignItems: "flex-end" },
  mealCalories: { color: "#FFF", fontSize: 13, fontWeight: "800" },
  mealUnit: { color: MUTED, fontSize: 8, marginTop: 2 },
  addCircle: {
    width: 31,
    height: 31,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#252A1D",
  },
  mealDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#292929",
    marginLeft: 63,
  },
  insightCard: {
    minHeight: 101,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginTop: 12,
    backgroundColor: "#20291A",
    borderWidth: 1,
    borderColor: "#344020",
  },
  insightIcon: {
    width: 53,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN,
    transform: [{ rotate: "-5deg" }],
  },
  insightCopy: { flex: 1, marginLeft: 14, marginRight: 5 },
  insightKicker: {
    color: GREEN,
    fontSize: 7.5,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  insightTitle: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
  },
  insightText: { color: MUTED, fontSize: 9, lineHeight: 14, marginTop: 4 },
});
