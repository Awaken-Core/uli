import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

const GREEN = "#C5FF27";
const INK = "#101010";
const CARD = "#191919";
const MUTED = "#858585";

type MealType = "Breakfast" | "Lunch" | "Snack" | "Dinner";
type FoodEntry = {
  id: string;
  food: string;
  meal: MealType;
  calories: number;
  serving: string;
  time: string;
};

const initialFoods: FoodEntry[] = [
  {
    id: "1",
    food: "Eggs & sourdough toast",
    meal: "Breakfast",
    calories: 410,
    serving: "2 eggs · 2 slices",
    time: "9:12 AM",
  },
  {
    id: "2",
    food: "Paneer rice bowl",
    meal: "Lunch",
    calories: 620,
    serving: "1 medium bowl",
    time: "1:34 PM",
  },
  {
    id: "3",
    food: "Banana & almonds",
    meal: "Snack",
    calories: 330,
    serving: "1 banana · 20g nuts",
    time: "4:20 PM",
  },
];

const week = [
  { day: "M", percent: 92 },
  { day: "T", percent: 76 },
  { day: "W", percent: 100 },
  { day: "T", percent: 68, today: true },
  { day: "F", percent: 0 },
  { day: "S", percent: 0 },
  { day: "S", percent: 0 },
];

export default function FitnessScreen() {
  const [foods, setFoods] = useState(initialFoods);
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");
  const [serving, setServing] = useState("");
  const [meal, setMeal] = useState<MealType>("Breakfast");
  const sheetRef = useRef<BottomSheetModal>(null);
  const sheetSnapPoints = useMemo(() => ["72%", "94%"], []);

  const consumed = useMemo(
    () => foods.reduce((sum, item) => sum + item.calories, 0),
    [foods],
  );
  const target = 2000;
  const progress = Math.min(consumed / target, 1);

  function openModal() {
    sheetRef.current?.present();
  }

  function closeModal() {
    sheetRef.current?.dismiss();
  }

  const resetForm = useCallback(() => {
    setFood("");
    setCalories("");
    setServing("");
    setMeal("Breakfast");
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.68}
        pressBehavior="close"
      />
    ),
    [],
  );

  function addFood() {
    const calorieValue = Number(calories);
    if (!food.trim() || !calorieValue || calorieValue < 1) return;

    setFoods((current) => [
      ...current,
      {
        id: Date.now().toString(),
        food: food.trim(),
        meal,
        calories: calorieValue,
        serving: serving.trim() || "1 serving",
        time: new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
      },
    ]);
    closeModal();
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>DAILY NUTRITION</Text>
            <Text style={styles.pageTitle}>Food tracker</Text>
          </View>
          <Pressable style={styles.calendarButton}>
            <Ionicons name="calendar-outline" size={19} color="#FFF" />
            <Text style={styles.calendarText}>Today</Text>
          </Pressable>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>ON TRACK</Text>
              </View>
              <Text style={styles.remainingValue}>
                {Math.max(target - consumed, 0)}
              </Text>
              <Text style={styles.remainingLabel}>calories remaining</Text>
            </View>
            <ProgressRing progress={progress} consumed={consumed} />
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <View style={styles.progressLegend}>
            <Text style={styles.legendText}>
              {consumed.toLocaleString()} eaten
            </Text>
            <Text style={styles.legendText}>
              {target.toLocaleString()} goal
            </Text>
          </View>

          <View style={styles.macroRow}>
            <Macro
              label="Protein"
              value="82 / 120g"
              progress={0.68}
              color="#FFB86B"
            />
            <Macro
              label="Carbs"
              value="148 / 220g"
              progress={0.67}
              color="#76D8FF"
            />
            <Macro
              label="Fats"
              value="46 / 65g"
              progress={0.71}
              color="#D49CFF"
            />
          </View>
        </View>

        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <View style={styles.streakTitleRow}>
              <View style={styles.streakIcon}>
                <Ionicons name="flame" size={19} color={INK} />
              </View>
              <View>
                <Text style={styles.sectionTitle}>12 day streak</Text>
                <Text style={styles.sectionSubtitle}>
                  Keep showing up every day
                </Text>
              </View>
            </View>
            <Text style={styles.bestText}>Best: 18</Text>
          </View>
          <View style={styles.weekRow}>
            {week.map((item, index) => (
              <View key={`${item.day}-${index}`} style={styles.weekDay}>
                <View
                  style={[
                    styles.weekCircle,
                    item.percent > 0 && styles.weekCircleDone,
                    item.today && styles.weekCircleToday,
                  ]}
                >
                  {item.percent > 0 ? (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={item.today ? INK : GREEN}
                    />
                  ) : (
                    <View style={styles.emptyDot} />
                  )}
                </View>
                <Text
                  style={[
                    styles.weekLabel,
                    item.today && styles.weekLabelToday,
                  ]}
                >
                  {item.day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Today’s food</Text>
            <Text style={styles.sectionSubtitle}>
              {foods.length} entries · {consumed.toLocaleString()} kcal
            </Text>
          </View>
          <Pressable onPress={openModal} style={styles.addButton}>
            <Ionicons name="add" size={18} color={INK} />
            <Text style={styles.addButtonText}>Add calories</Text>
          </Pressable>
        </View>

        <View style={styles.foodList}>
          {foods.map((item, index) => (
            <View key={item.id}>
              <View style={styles.foodRow}>
                <View style={styles.foodIcon}>
                  <Ionicons
                    name={mealIcon(item.meal)}
                    size={19}
                    color={GREEN}
                  />
                </View>
                <View style={styles.foodCopy}>
                  <View style={styles.foodHeading}>
                    <Text numberOfLines={1} style={styles.foodName}>
                      {item.food}
                    </Text>
                    <View style={styles.mealPill}>
                      <Text style={styles.mealPillText}>{item.meal}</Text>
                    </View>
                  </View>
                  <Text numberOfLines={1} style={styles.foodMeta}>
                    {item.serving} · {item.time}
                  </Text>
                </View>
                <View style={styles.foodCalories}>
                  <Text style={styles.foodCaloriesValue}>{item.calories}</Text>
                  <Text style={styles.foodCaloriesUnit}>kcal</Text>
                </View>
              </View>
              {index < foods.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <Pressable onPress={openModal} style={styles.manualCard}>
          <View style={styles.manualIcon}>
            <Ionicons name="create-outline" size={23} color={INK} />
          </View>
          <View style={styles.manualCopy}>
            <Text style={styles.manualTitle}>Add food manually</Text>
            <Text style={styles.manualText}>
              Enter calories and serving details yourself
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6F765F" />
        </Pressable>
      </ScrollView>

      <BottomSheetModal
        ref={sheetRef}
        index={0}
        snapPoints={sheetSnapPoints}
        onDismiss={resetForm}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        enableDynamicSizing={false}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backgroundStyle={styles.sheetBackground}
        handleStyle={styles.handleArea}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.sheetContent}
        >
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Add food</Text>
              <Text style={styles.sheetSubtitle}>
                Log calories with useful details
              </Text>
            </View>
            <Pressable onPress={closeModal} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#FFF" />
            </Pressable>
          </View>

          <Text style={styles.inputLabel}>FOOD NAME</Text>
          <TextInput
            value={food}
            onChangeText={setFood}
            placeholder="e.g. Grilled paneer wrap"
            placeholderTextColor="#626262"
            style={styles.input}
            autoFocus
          />

          <Text style={styles.inputLabel}>MEAL</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mealChoices}
          >
            {(["Breakfast", "Lunch", "Snack", "Dinner"] as MealType[]).map(
              (option) => (
                <Pressable
                  key={option}
                  onPress={() => setMeal(option)}
                  style={[
                    styles.mealChoice,
                    meal === option && styles.mealChoiceActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.mealChoiceText,
                      meal === option && styles.mealChoiceTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              ),
            )}
          </ScrollView>

          <View style={styles.inputRow}>
            <View style={styles.inputColumn}>
              <Text style={styles.inputLabel}>CALORIES</Text>
              <View style={styles.inputWithUnit}>
                <TextInput
                  value={calories}
                  onChangeText={setCalories}
                  placeholder="0"
                  placeholderTextColor="#626262"
                  keyboardType="number-pad"
                  style={styles.unitInput}
                />
                <Text style={styles.unitText}>kcal</Text>
              </View>
            </View>
            <View style={styles.inputColumn}>
              <Text style={styles.inputLabel}>SERVING</Text>
              <TextInput
                value={serving}
                onChangeText={setServing}
                placeholder="1 bowl"
                placeholderTextColor="#626262"
                style={styles.input}
              />
            </View>
          </View>

          <Pressable
            disabled={!food.trim() || !Number(calories)}
            onPress={addFood}
            style={[
              styles.saveButton,
              (!food.trim() || !Number(calories)) && styles.saveButtonDisabled,
            ]}
          >
            <Text style={styles.saveButtonText}>Add to today</Text>
            <Ionicons name="arrow-forward" size={18} color={INK} />
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}

function ProgressRing({
  progress,
  consumed,
}: {
  progress: number;
  consumed: number;
}) {
  const size = 104,
    stroke = 11,
    radius = (size - stroke) / 2,
    circumference = 2 * Math.PI * radius;
  return (
    <View style={styles.ring}>
      <Svg width={size} height={size} style={styles.ringSvg}>
        <Circle
          cx={52}
          cy={52}
          r={radius}
          stroke="#34382F"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={52}
          cy={52}
          r={radius}
          stroke={GREEN}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
          rotation="-90"
          origin="52, 52"
        />
      </Svg>
      <Text style={styles.ringValue}>{consumed.toLocaleString()}</Text>
      <Text style={styles.ringLabel}>eaten</Text>
    </View>
  );
}

function Macro({
  label,
  value,
  progress,
  color,
}: {
  label: string;
  value: string;
  progress: number;
  color: string;
}) {
  return (
    <View style={styles.macro}>
      <View style={styles.macroTop}>
        <View style={[styles.macroDot, { backgroundColor: color }]} />
        <Text style={styles.macroLabel}>{label}</Text>
      </View>
      <Text style={styles.macroValue}>{value}</Text>
      <View style={styles.macroTrack}>
        <View
          style={[
            styles.macroFill,
            { width: `${progress * 100}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

function mealIcon(
  meal: MealType,
): React.ComponentProps<typeof Ionicons>["name"] {
  if (meal === "Breakfast") return "sunny-outline";
  if (meal === "Lunch") return "restaurant-outline";
  if (meal === "Snack") return "cafe-outline";
  return "moon-outline";
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: INK },
  content: { paddingHorizontal: 17, paddingBottom: 28 },
  header: {
    height: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyebrow: { color: GREEN, fontSize: 8, fontWeight: "900", letterSpacing: 1.5 },
  pageTitle: { color: "#FFF", fontSize: 24, fontWeight: "800", marginTop: 3 },
  calendarButton: {
    height: 40,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#2B2B2B",
  },
  calendarText: { color: "#DDD", fontSize: 10, fontWeight: "700" },
  progressCard: {
    borderRadius: 25,
    padding: 18,
    backgroundColor: "#1B2118",
    borderWidth: 1,
    borderColor: "#354225",
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusPill: {
    alignSelf: "flex-start",
    height: 22,
    borderRadius: 8,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(197,255,39,.1)",
  },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GREEN },
  statusText: {
    color: GREEN,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
  },
  remainingValue: {
    color: "#FFF",
    fontSize: 37,
    fontWeight: "900",
    letterSpacing: -1,
    marginTop: 10,
  },
  remainingLabel: { color: MUTED, fontSize: 10, marginTop: 2 },
  ring: {
    width: 104,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
  },
  ringSvg: { position: "absolute" },
  ringValue: { color: "#FFF", fontSize: 16, fontWeight: "900" },
  ringLabel: { color: MUTED, fontSize: 8, marginTop: 2 },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#34382F",
    overflow: "hidden",
    marginTop: 18,
  },
  progressFill: { height: 10, borderRadius: 5, backgroundColor: GREEN },
  progressLegend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 7,
  },
  legendText: { color: MUTED, fontSize: 8 },
  macroRow: { flexDirection: "row", gap: 8, marginTop: 18 },
  macro: {
    flex: 1,
    borderRadius: 14,
    padding: 10,
    backgroundColor: "rgba(255,255,255,.045)",
  },
  macroTop: { flexDirection: "row", alignItems: "center", gap: 5 },
  macroDot: { width: 5, height: 5, borderRadius: 3 },
  macroLabel: { color: MUTED, fontSize: 8 },
  macroValue: { color: "#FFF", fontSize: 9.5, fontWeight: "700", marginTop: 7 },
  macroTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "#343434",
    overflow: "hidden",
    marginTop: 9,
  },
  macroFill: { height: 7, borderRadius: 4 },
  streakCard: {
    borderRadius: 22,
    padding: 15,
    marginTop: 12,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  streakTitleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  streakIcon: {
    width: 37,
    height: 37,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN,
  },
  sectionTitle: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  sectionSubtitle: { color: MUTED, fontSize: 8.5, marginTop: 3 },
  bestText: { color: GREEN, fontSize: 9, fontWeight: "700" },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 17,
  },
  weekDay: { alignItems: "center", gap: 6 },
  weekCircle: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222",
  },
  weekCircleDone: {
    backgroundColor: "#252A1D",
    borderWidth: 1,
    borderColor: "#3D4A27",
  },
  weekCircleToday: { backgroundColor: GREEN, borderColor: GREEN },
  emptyDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#494949",
  },
  weekLabel: { color: "#666", fontSize: 8 },
  weekLabelToday: { color: GREEN, fontWeight: "800" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 25,
    marginBottom: 11,
  },
  addButton: {
    height: 35,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    backgroundColor: GREEN,
  },
  addButtonText: { color: INK, fontSize: 9, fontWeight: "900" },
  foodList: {
    borderRadius: 22,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#292929",
    overflow: "hidden",
  },
  foodRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },
  foodIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#252A1D",
  },
  foodCopy: { flex: 1, minWidth: 0, marginLeft: 11 },
  foodHeading: { flexDirection: "row", alignItems: "center", gap: 6 },
  foodName: {
    color: "#F0F0F0",
    fontSize: 11.5,
    fontWeight: "700",
    flexShrink: 1,
  },
  mealPill: {
    borderRadius: 6,
    backgroundColor: "#262626",
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  mealPillText: { color: MUTED, fontSize: 6.5 },
  foodMeta: { color: MUTED, fontSize: 8.5, marginTop: 5 },
  foodCalories: { alignItems: "flex-end", marginLeft: 8 },
  foodCaloriesValue: { color: "#FFF", fontSize: 14, fontWeight: "900" },
  foodCaloriesUnit: { color: MUTED, fontSize: 7.5, marginTop: 2 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#292929",
    marginLeft: 64,
  },
  manualCard: {
    minHeight: 88,
    borderRadius: 21,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginTop: 12,
    backgroundColor: "#20291A",
    borderWidth: 1,
    borderColor: "#344020",
  },
  manualIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN,
  },
  manualCopy: { flex: 1, marginLeft: 13 },
  manualTitle: { color: "#FFF", fontSize: 13, fontWeight: "800" },
  manualText: { color: MUTED, fontSize: 8.5, marginTop: 4 },
  sheetBackground: {
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#303030",
  },
  sheetContent: {
    paddingHorizontal: 18,
    paddingBottom: 28,
  },
  handleArea: { paddingTop: 10, paddingBottom: 5 },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#555",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 20,
  },
  sheetTitle: { color: "#FFF", fontSize: 21, fontWeight: "800" },
  sheetSubtitle: { color: MUTED, fontSize: 9, marginTop: 3 },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#242424",
  },
  inputLabel: {
    color: "#777",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 7,
  },
  input: {
    height: 49,
    borderRadius: 15,
    backgroundColor: "#212121",
    borderWidth: 1,
    borderColor: "#303030",
    color: "#FFF",
    fontSize: 12,
    paddingHorizontal: 13,
    marginBottom: 16,
  },
  mealChoices: { gap: 7, marginBottom: 17 },
  mealChoice: {
    height: 35,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 13,
    backgroundColor: "#222",
    borderWidth: 1,
    borderColor: "#303030",
  },
  mealChoiceActive: { backgroundColor: GREEN, borderColor: GREEN },
  mealChoiceText: { color: "#999", fontSize: 9, fontWeight: "700" },
  mealChoiceTextActive: { color: INK },
  inputRow: { flexDirection: "row", gap: 10 },
  inputColumn: { flex: 1 },
  inputWithUnit: {
    height: 49,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#212121",
    borderWidth: 1,
    borderColor: "#303030",
    paddingRight: 12,
  },
  unitInput: {
    flex: 1,
    height: 49,
    color: "#FFF",
    fontSize: 12,
    paddingHorizontal: 13,
  },
  unitText: { color: MUTED, fontSize: 9 },
  saveButton: {
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: GREEN,
    marginTop: 5,
    marginBottom: 6,
  },
  saveButtonDisabled: { opacity: 0.35 },
  saveButtonText: { color: INK, fontSize: 12, fontWeight: "900" },
});
