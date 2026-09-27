import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import type { MealType } from "@/lib/constants";
import { getLocalDateKey } from "@/lib/date";
import { useNutritionStore } from "@/stores/nutrition-store";
import { useRouter } from "expo-router";

const GREEN = "#C5FF27",
  INK = "#101010",
  CARD = "#191919",
  MUTED = "#929292";
const MEALS: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export default function FitnessScreen() {
  const store = useNutritionStore();
  const router = useRouter();
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [serving, setServing] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const sheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    void store.loadSummary();
  }, [store.loadSummary]);
  const entries = useMemo(
    () =>
      Object.values(store.summary?.byMeal ?? {}).flatMap(
        (meal) => meal.entries,
      ),
    [store.summary],
  );
  const consumed = store.summary?.summary.consumed;
  const target = store.summary?.summary.target;
  const eaten = consumed?.calories ?? 0;
  const goal = target?.calories ?? 2000;
  const progress = goal > 0 ? Math.min(eaten / goal, 1) : 0;
  const isToday = store.selectedDate === getLocalDateKey();

  const resetForm = useCallback(() => {
    setFoodName("");
    setCalories("");
    setServing("");
    setProtein("");
    setCarbs("");
    setFats("");
    setMealType("breakfast");
  }, []);
  const backdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.7}
      />
    ),
    [],
  );
  const changeDay = (offset: number) => {
    const next = new Date(`${store.selectedDate}T12:00:00`);
    next.setDate(next.getDate() + offset);
    store.setSelectedDate(getLocalDateKey(next));
  };
  const openLog = () => {
    void store.loadFoods();
    sheetRef.current?.present();
  };
  const save = async () => {
    const calorieValue = Number(calories);
    if (!foodName.trim() || calorieValue <= 0) return;
    const ok = await store.addManualEntry({
      foodName: foodName.trim(),
      mealType,
      calories: calorieValue,
      proteinGrams: Number(protein) || 0,
      carbohydrateGrams: Number(carbs) || 0,
      fatGrams: Number(fats) || 0,
      quantityUnit: serving.trim() || "serving",
    });
    if (ok) sheetRef.current?.dismiss();
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={store.isLoading}
            onRefresh={store.loadSummary}
            tintColor={GREEN}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>DAILY NUTRITION</Text>
            <Text style={styles.title}>Food tracker</Text>
          </View>
          <View style={styles.dateControls}>
            <SmallButton
              icon="chevron-back"
              label="Previous day"
              onPress={() => changeDay(-1)}
            />
            <Pressable
              onPress={() => store.setSelectedDate(getLocalDateKey())}
              style={styles.dateButton}
            >
              <Ionicons name="calendar-outline" size={16} color="#FFF" />
              <Text style={styles.dateText}>
                {isToday ? "Today" : store.selectedDate.slice(5)}
              </Text>
            </Pressable>
            <SmallButton
              icon="chevron-forward"
              label="Next day"
              onPress={() => changeDay(1)}
            />
            <Pressable
              accessibilityLabel="Nutrition settings"
              onPress={() => router.push("/nutrition-settings")}
              style={styles.smallButton}
            >
              <Ionicons name="options-outline" size={17} color="#FFF" />
            </Pressable>
          </View>
        </View>

        {store.error ? (
          <Pressable onPress={store.clearError} style={styles.error}>
            <Ionicons name="alert-circle-outline" size={19} color="#FF9B9B" />
            <Text numberOfLines={2} style={styles.errorText}>
              {store.error}
            </Text>
            <Ionicons name="close" size={16} color="#777" />
          </Pressable>
        ) : null}

        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <View style={styles.status}>
                <View style={styles.dot} />
                <Text style={styles.statusText}>
                  {eaten > goal ? "OVER TARGET" : "ON TRACK"}
                </Text>
              </View>
              <Text style={styles.remaining}>
                {Math.max(goal - eaten, 0).toLocaleString()}
              </Text>
              <Text style={styles.muted}>calories remaining</Text>
            </View>
            <ProgressRing progress={progress} consumed={eaten} />
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.legend}>
            <Text style={styles.muted}>{eaten.toLocaleString()} eaten</Text>
            <Text style={styles.muted}>{goal.toLocaleString()} goal</Text>
          </View>
          <View style={styles.macros}>
            <Macro
              label="Protein"
              color="#FFB86B"
              value={consumed?.protein ?? 0}
              target={target?.protein ?? 120}
            />
            <Macro
              label="Carbs"
              color="#76D8FF"
              value={consumed?.carbohydrates ?? 0}
              target={target?.carbohydrates ?? 220}
            />
            <Macro
              label="Fats"
              color="#D49CFF"
              value={consumed?.fats ?? 0}
              target={target?.fats ?? 65}
            />
          </View>
        </View>

        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionTitle}>
              {isToday ? "Today’s food" : "Food log"}
            </Text>
            <Text style={styles.subtitle}>
              {entries.length} entries · {eaten.toLocaleString()} kcal
            </Text>
          </View>
          <Pressable onPress={openLog} style={styles.add}>
            <Ionicons name="add" size={18} color={INK} />
            <Text style={styles.addText}>Add food</Text>
          </Pressable>
        </View>
        <View style={styles.list}>
          {!store.isLoading && entries.length === 0 ? (
            <Pressable onPress={openLog} style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="restaurant-outline" size={25} color={GREEN} />
              </View>
              <Text style={styles.emptyTitle}>Nothing logged yet</Text>
              <Text style={styles.emptyText}>
                Add a meal to start tracking this day’s nutrition.
              </Text>
            </Pressable>
          ) : null}
          {entries.map((entry, index) => (
            <View key={entry.id}>
              <Pressable
                accessibilityHint="Long press to delete"
                onLongPress={() =>
                  Alert.alert("Delete this entry?", entry.foodName, [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => void store.deleteEntry(entry.id),
                    },
                  ])
                }
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              >
                <View style={styles.foodIcon}>
                  <Ionicons
                    name={mealIcon(entry.mealType)}
                    size={19}
                    color={GREEN}
                  />
                </View>
                <View style={styles.foodCopy}>
                  <Text numberOfLines={1} style={styles.foodName}>
                    {entry.foodName}
                  </Text>
                  <Text numberOfLines={1} style={styles.foodMeta}>
                    {/* {entry.quantity} {entry.quantityUnit} ·{" "} */}
                    {entry.mealType ?? "other"}
                  </Text>
                </View>
                <View style={styles.foodCal}>
                  <Text style={styles.foodCalValue}>{entry.calories}</Text>
                  <Text style={styles.foodCalUnit}>kcal</Text>
                </View>
              </Pressable>
              {index < entries.length - 1 ? (
                <View style={styles.divider} />
              ) : null}
            </View>
          ))}
        </View>
        {entries.length ? (
          <View style={styles.hint}>
            <Ionicons
              name="information-circle-outline"
              size={15}
              color="#777"
            />
            <Text style={styles.hintText}>
              Long press an entry to remove it
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={["70%", "92%"]}
        onDismiss={resetForm}
        backdropComponent={backdrop}
        enablePanDownToClose
        enableDynamicSizing={false}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backgroundStyle={styles.sheet}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sheetHead}>
            <View>
              <Text style={styles.sheetTitle}>Log food</Text>
              <Text style={styles.subtitle}>
                Add the essentials now. Refine them later.
              </Text>
            </View>
            <Pressable
              onPress={() => sheetRef.current?.dismiss()}
              style={styles.close}
            >
              <Ionicons name="close" size={20} color="#FFF" />
            </Pressable>
          </View>
          {store.foods.length ? (
            <>
              <Label>SAVED FOODS</Label>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.savedFoods}
              >
                {store.foods.map((item) => (
                  <Pressable
                    key={item.id}
                    disabled={store.isMutating}
                    onPress={async () => {
                      if (await store.addSavedFood(item, mealType))
                        sheetRef.current?.dismiss();
                    }}
                    style={styles.savedFood}
                  >
                    <Text numberOfLines={1} style={styles.savedFoodName}>
                      {item.name}
                    </Text>
                    <Text style={styles.savedFoodMeta}>
                      {item.calories} kcal · {item.servingQuantity}{" "}
                      {item.servingUnit}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <View style={styles.orRow}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>OR ADD MANUALLY</Text>
                <View style={styles.orLine} />
              </View>
            </>
          ) : null}
          <Label>FOOD NAME</Label>
          <TextInput
            autoFocus
            value={foodName}
            onChangeText={setFoodName}
            placeholder="e.g. Paneer rice bowl"
            placeholderTextColor="#626262"
            style={styles.input}
          />
          <Label>MEAL</Label>
          <View style={styles.mealChoices}>
            {MEALS.map((meal) => (
              <Pressable
                key={meal}
                onPress={() => setMealType(meal)}
                style={[styles.meal, mealType === meal && styles.mealActive]}
              >
                <Text
                  style={[
                    styles.mealText,
                    mealType === meal && styles.mealTextActive,
                  ]}
                >
                  {capitalize(meal)}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputColumn}>
              <Label>CALORIES</Label>
              <TextInput
                value={calories}
                onChangeText={setCalories}
                keyboardType="decimal-pad"
                placeholder="0 kcal"
                placeholderTextColor="#626262"
                style={styles.input}
              />
            </View>
            <View style={styles.inputColumn}>
              <Label>SERVING</Label>
              <TextInput
                value={serving}
                onChangeText={setServing}
                placeholder="e.g. bowl"
                placeholderTextColor="#626262"
                style={styles.input}
              />
            </View>
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputColumn}>
              <Label>PROTEIN</Label>
              <TextInput
                value={protein}
                onChangeText={setProtein}
                keyboardType="decimal-pad"
                placeholder="0g"
                placeholderTextColor="#626262"
                style={styles.input}
              />
            </View>
            <View style={styles.inputColumn}>
              <Label>CARBS</Label>
              <TextInput
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="decimal-pad"
                placeholder="0g"
                placeholderTextColor="#626262"
                style={styles.input}
              />
            </View>
            <View style={styles.inputColumn}>
              <Label>FATS</Label>
              <TextInput
                value={fats}
                onChangeText={setFats}
                keyboardType="decimal-pad"
                placeholder="0g"
                placeholderTextColor="#626262"
                style={styles.input}
              />
            </View>
          </View>
          {store.error ? (
            <Text style={styles.formError}>{store.error}</Text>
          ) : null}
          <Pressable
            disabled={
              !foodName.trim() || Number(calories) <= 0 || store.isMutating
            }
            onPress={() => void save()}
            style={({ pressed }) => [
              styles.save,
              (!foodName.trim() || Number(calories) <= 0 || store.isMutating) &&
                styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            {store.isMutating ? (
              <ActivityIndicator color={INK} />
            ) : (
              <>
                <Text style={styles.saveText}>
                  Add to {isToday ? "today" : store.selectedDate.slice(5)}
                </Text>
                <Ionicons name="arrow-forward" size={18} color={INK} />
              </>
            )}
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}

function SmallButton({
  icon,
  label,
  onPress,
}: {
  icon: "chevron-back" | "chevron-forward";
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.smallButton}
    >
      <Ionicons name={icon} size={17} color="#FFF" />
    </Pressable>
  );
}
function Label({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}
function ProgressRing({
  progress,
  consumed,
}: {
  progress: number;
  consumed: number;
}) {
  const size = 102,
    stroke = 10,
    radius = (size - stroke) / 2,
    circumference = 2 * Math.PI * radius;
  return (
    <View style={styles.ring}>
      <Svg width={size} height={size} style={styles.ringSvg}>
        <Circle
          cx={51}
          cy={51}
          r={radius}
          stroke="#34382F"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={51}
          cy={51}
          r={radius}
          stroke={GREEN}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
          rotation="-90"
          origin="51, 51"
        />
      </Svg>
      <Text style={styles.ringValue}>{consumed.toLocaleString()}</Text>
      <Text style={styles.ringLabel}>eaten</Text>
    </View>
  );
}
function Macro({
  label,
  color,
  value,
  target,
}: {
  label: string;
  color: string;
  value: number;
  target: number;
}) {
  const width = target > 0 ? Math.min(value / target, 1) * 100 : 0;
  return (
    <View style={styles.macro}>
      <View style={styles.macroHead}>
        <View style={[styles.macroDot, { backgroundColor: color }]} />
        <Text style={styles.macroLabel}>{label}</Text>
      </View>
      <Text style={styles.macroValue}>
        {value} <Text style={styles.macroTarget}>/ {target}g</Text>
      </Text>
      <View style={styles.macroTrack}>
        <View
          style={[
            styles.macroFill,
            { backgroundColor: color, width: `${width}%` },
          ]}
        />
      </View>
    </View>
  );
}
function mealIcon(
  meal?: MealType | null,
): React.ComponentProps<typeof Ionicons>["name"] {
  if (meal === "breakfast") return "sunny-outline";
  if (meal === "lunch") return "restaurant-outline";
  if (meal === "snack") return "cafe-outline";
  return "moon-outline";
}
const capitalize = (value: string) => value[0].toUpperCase() + value.slice(1);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: INK },
  content: { paddingHorizontal: 17, paddingBottom: 34 },
  header: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyebrow: { color: GREEN, fontSize: 8, fontWeight: "900", letterSpacing: 1.6 },
  title: { color: "#FFF", fontSize: 25, fontWeight: "800", marginTop: 3 },
  dateControls: { flexDirection: "row", alignItems: "center", gap: 5 },
  smallButton: {
    width: 31,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#292929",
  },
  dateButton: {
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    borderRadius: 12,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#292929",
  },
  dateText: { color: "#EEE", fontSize: 9, fontWeight: "700" },
  error: {
    minHeight: 48,
    marginBottom: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderRadius: 14,
    backgroundColor: "#2A1919",
    borderWidth: 1,
    borderColor: "#573030",
  },
  errorText: { flex: 1, color: "#FFC1C1", fontSize: 11, lineHeight: 16 },
  hero: {
    borderRadius: 26,
    padding: 18,
    backgroundColor: "#1B2118",
    borderWidth: 1,
    borderColor: "#354225",
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  status: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 8,
    backgroundColor: "rgba(197,255,39,.1)",
  },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GREEN },
  statusText: {
    color: GREEN,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
  },
  remaining: {
    color: "#FFF",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1.5,
    marginTop: 9,
  },
  muted: { color: MUTED, fontSize: 9 },
  ring: {
    width: 102,
    height: 102,
    alignItems: "center",
    justifyContent: "center",
  },
  ringSvg: { position: "absolute" },
  ringValue: { color: "#FFF", fontSize: 15, fontWeight: "900" },
  ringLabel: { color: MUTED, fontSize: 8 },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#39402E",
    marginTop: 18,
    overflow: "hidden",
  },
  fill: { height: 6, borderRadius: 3, backgroundColor: GREEN },
  legend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 7,
  },
  macros: { flexDirection: "row", gap: 10, marginTop: 21 },
  macro: {
    flex: 1,
    minHeight: 104,
    padding: 13,
    borderRadius: 18,
    backgroundColor: "#22241F",
    justifyContent: "center",
  },
  macroHead: { flexDirection: "row", alignItems: "center", gap: 7 },
  macroDot: { width: 7, height: 7, borderRadius: 4 },
  macroLabel: { color: MUTED, fontSize: 10, fontWeight: "600" },
  macroValue: { color: "#FFF", fontSize: 15, fontWeight: "800", marginTop: 9 },
  macroTarget: { color: "#777", fontSize: 10, fontWeight: "500" },
  macroTrack: {
    height: 7,
    marginTop: 12,
    borderRadius: 4,
    backgroundColor: "#3A3A3A",
    overflow: "hidden",
  },
  macroFill: { height: 7, borderRadius: 4 },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 11,
  },
  sectionTitle: { color: "#FFF", fontSize: 17, fontWeight: "800" },
  subtitle: { color: MUTED, fontSize: 9, marginTop: 3 },
  add: {
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 11,
    borderRadius: 12,
    backgroundColor: GREEN,
  },
  addText: { color: INK, fontSize: 9, fontWeight: "900" },
  list: {
    borderRadius: 22,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#292929",
    overflow: "hidden",
  },
  row: {
    minHeight: 72,
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
  foodCopy: { flex: 1, marginLeft: 11, marginRight: 8 },
  foodName: { color: "#F1F1F1", fontSize: 12, fontWeight: "700" },
  foodMeta: {
    color: MUTED,
    fontSize: 9,
    marginTop: 5,
    textTransform: "capitalize",
  },
  foodCal: { alignItems: "flex-end" },
  foodCalValue: { color: "#FFF", fontSize: 14, fontWeight: "800" },
  foodCalUnit: { color: MUTED, fontSize: 8 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#303030",
    marginLeft: 64,
  },
  empty: { alignItems: "center", paddingVertical: 31, paddingHorizontal: 28 },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#252A1D",
    marginBottom: 12,
  },
  emptyTitle: { color: "#FFF", fontSize: 14, fontWeight: "800" },
  emptyText: {
    color: MUTED,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 5,
  },
  hint: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 12,
  },
  hintText: { color: "#707070", fontSize: 9 },
  pressed: { opacity: 0.75 },
  sheet: {
    backgroundColor: "#171717",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: { backgroundColor: "#505050", width: 38 },
  sheetContent: { paddingHorizontal: 19, paddingBottom: 42 },
  sheetHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  sheetTitle: { color: "#FFF", fontSize: 23, fontWeight: "900" },
  close: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#252525",
  },
  label: {
    color: "#A0A0A0",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 13,
  },
  input: {
    height: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#323232",
    backgroundColor: "#202020",
    color: "#FFF",
    paddingHorizontal: 14,
    fontSize: 13,
  },
  mealChoices: { flexDirection: "row", gap: 7 },
  meal: {
    flex: 1,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#343434",
    backgroundColor: "#202020",
  },
  mealActive: { backgroundColor: GREEN, borderColor: GREEN },
  mealText: { color: "#B5B5B5", fontSize: 9, fontWeight: "700" },
  mealTextActive: { color: INK, fontWeight: "900" },
  inputRow: { flexDirection: "row", gap: 10 },
  inputColumn: { flex: 1 },
  formError: { color: "#FF9B9B", fontSize: 10, marginTop: 12 },
  save: {
    height: 54,
    marginTop: 22,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    backgroundColor: GREEN,
  },
  saveText: { color: INK, fontSize: 12, fontWeight: "900" },
  disabled: { opacity: 0.42 },
  savedFoods: { gap: 8, paddingRight: 12 },
  savedFood: {
    width: 145,
    padding: 11,
    borderRadius: 14,
    backgroundColor: "#22251F",
    borderWidth: 1,
    borderColor: "#354225",
  },
  savedFoodName: { color: "#FFF", fontSize: 10, fontWeight: "800" },
  savedFoodMeta: { color: MUTED, fontSize: 8, marginTop: 5 },
  orRow: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 18 },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#343434",
  },
  orText: { color: "#666", fontSize: 7, fontWeight: "800" },
});
