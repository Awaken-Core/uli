import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNutritionStore } from "@/stores/nutrition-store";
import { Text, TextInput } from "@/components/ui/typography";

const GREEN = "#C5FF27",
  INK = "#101010",
  CARD = "#191919",
  MUTED = "#8D8D8D";
const zeroFood = {
  name: "",
  brand: "",
  servingQuantity: "1",
  servingUnit: "serving",
  calories: "",
  protein: "",
  carbs: "",
  fats: "",
};

export default function NutritionSettingsScreen() {
  const router = useRouter();
  const store = useNutritionStore();
  const [tab, setTab] = useState<"goals" | "foods">("goals");
  const targets = store.summary?.summary.target;
  const [goal, setGoal] = useState({
    calories: "2000",
    protein: "120",
    carbs: "220",
    fats: "65",
    fiber: "30",
    sodium: "2300",
    water: "2000",
  });
  const [food, setFood] = useState(zeroFood);

  useEffect(() => {
    void store.loadSummary();
    void store.loadFoods();
  }, [store.loadSummary, store.loadFoods]);
  useEffect(() => {
    if (targets)
      setGoal({
        calories: String(targets.calories),
        protein: String(targets.protein),
        carbs: String(targets.carbohydrates),
        fats: String(targets.fats),
        fiber: String(targets.fiber),
        sodium: String(targets.sodium),
        water: String(targets.water),
      });
  }, [targets]);

  async function saveGoals() {
    await store.saveGoal({
      calorieTarget: Number(goal.calories) || 0,
      proteinGramsTarget: Number(goal.protein) || 0,
      carbohydrateGramsTarget: Number(goal.carbs) || 0,
      fatGramsTarget: Number(goal.fats) || 0,
      fiberGramsTarget: Number(goal.fiber) || 0,
      sodiumMilligramsLimit: Number(goal.sodium) || 0,
      waterMillilitersTarget: Number(goal.water) || 0,
    });
  }
  async function saveFood() {
    if (!food.name.trim()) return;
    const ok = await store.createFood({
      name: food.name.trim(),
      brand: food.brand.trim() || null,
      barcode: null,
      servingQuantity: Number(food.servingQuantity) || 1,
      servingUnit: food.servingUnit.trim() || "serving",
      calories: Number(food.calories) || 0,
      proteinGrams: Number(food.protein) || 0,
      carbohydrateGrams: Number(food.carbs) || 0,
      fatGrams: Number(food.fats) || 0,
      saturatedFatGrams: 0,
      fiberGrams: 0,
      sugarGrams: 0,
      sodiumMilligrams: 0,
    });
    if (ok) setFood(zeroFood);
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.icon}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>NUTRITION SETUP</Text>
            <Text style={styles.title}>Goals & foods</Text>
          </View>
        </View>
        <View style={styles.tabs}>
          <Pressable
            onPress={() => setTab("goals")}
            style={[styles.tab, tab === "goals" && styles.tabActive]}
          >
            <Ionicons
              name="flag-outline"
              size={17}
              color={tab === "goals" ? INK : MUTED}
            />
            <Text
              style={[styles.tabText, tab === "goals" && styles.tabTextActive]}
            >
              Daily goals
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("foods")}
            style={[styles.tab, tab === "foods" && styles.tabActive]}
          >
            <Ionicons
              name="nutrition-outline"
              size={17}
              color={tab === "foods" ? INK : MUTED}
            />
            <Text
              style={[styles.tabText, tab === "foods" && styles.tabTextActive]}
            >
              Saved foods
            </Text>
          </Pressable>
        </View>
        {store.error ? (
          <Pressable onPress={store.clearError} style={styles.error}>
            <Ionicons name="alert-circle-outline" size={18} color="#FF9B9B" />
            <Text style={styles.errorText}>{store.error}</Text>
          </Pressable>
        ) : null}

        {tab === "goals" ? (
          <>
            <View style={styles.hero}>
              <View style={styles.heroIcon}>
                <Ionicons name="flag" size={25} color={INK} />
              </View>
              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>Set realistic targets</Text>
                <Text style={styles.heroText}>
                  These values power progress across Home, Food tracker, and
                  Profile.
                </Text>
              </View>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Energy and macros</Text>
              <Field
                label="CALORIES"
                value={goal.calories}
                onChangeText={(value) => setGoal({ ...goal, calories: value })}
                unit="kcal"
              />
              <View style={styles.row}>
                <View style={styles.column}>
                  <Field
                    label="PROTEIN"
                    value={goal.protein}
                    onChangeText={(value) =>
                      setGoal({ ...goal, protein: value })
                    }
                    unit="g"
                  />
                </View>
                <View style={styles.column}>
                  <Field
                    label="CARBS"
                    value={goal.carbs}
                    onChangeText={(value) => setGoal({ ...goal, carbs: value })}
                    unit="g"
                  />
                </View>
                <View style={styles.column}>
                  <Field
                    label="FATS"
                    value={goal.fats}
                    onChangeText={(value) => setGoal({ ...goal, fats: value })}
                    unit="g"
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Field
                    label="FIBER"
                    value={goal.fiber}
                    onChangeText={(value) => setGoal({ ...goal, fiber: value })}
                    unit="g"
                  />
                </View>
                <View style={styles.column}>
                  <Field
                    label="SODIUM"
                    value={goal.sodium}
                    onChangeText={(value) =>
                      setGoal({ ...goal, sodium: value })
                    }
                    unit="mg"
                  />
                </View>
                <View style={styles.column}>
                  <Field
                    label="WATER"
                    value={goal.water}
                    onChangeText={(value) => setGoal({ ...goal, water: value })}
                    unit="ml"
                  />
                </View>
              </View>
            </View>
            <SaveButton
              loading={store.isMutating}
              label="Save daily goals"
              onPress={() => void saveGoals()}
            />
          </>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Create reusable food</Text>
              <Field
                label="FOOD NAME"
                value={food.name}
                onChangeText={(value) => setFood({ ...food, name: value })}
                placeholder="e.g. Homemade dal"
              />
              <Field
                label="BRAND (OPTIONAL)"
                value={food.brand}
                onChangeText={(value) => setFood({ ...food, brand: value })}
                placeholder="Brand or homemade"
              />
              <View style={styles.row}>
                <View style={styles.column}>
                  <Field
                    label="QUANTITY"
                    keyboard="decimal-pad"
                    value={food.servingQuantity}
                    onChangeText={(value) =>
                      setFood({ ...food, servingQuantity: value })
                    }
                  />
                </View>
                <View style={styles.column}>
                  <Field
                    label="UNIT"
                    value={food.servingUnit}
                    onChangeText={(value) =>
                      setFood({ ...food, servingUnit: value })
                    }
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Field
                    label="CALORIES"
                    value={food.calories}
                    onChangeText={(value) =>
                      setFood({ ...food, calories: value })
                    }
                    keyboard="decimal-pad"
                  />
                </View>
                <View style={styles.column}>
                  <Field
                    label="PROTEIN"
                    value={food.protein}
                    onChangeText={(value) =>
                      setFood({ ...food, protein: value })
                    }
                    keyboard="decimal-pad"
                  />
                </View>
                <View style={styles.column}>
                  <Field
                    label="CARBS"
                    value={food.carbs}
                    onChangeText={(value) => setFood({ ...food, carbs: value })}
                    keyboard="decimal-pad"
                  />
                </View>
                <View style={styles.column}>
                  <Field
                    label="FATS"
                    value={food.fats}
                    onChangeText={(value) => setFood({ ...food, fats: value })}
                    keyboard="decimal-pad"
                  />
                </View>
              </View>
              <SaveButton
                loading={store.isMutating}
                disabled={!food.name.trim()}
                label="Save food"
                onPress={() => void saveFood()}
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your food library</Text>
              <Text style={styles.sectionText}>
                {store.foods.length} saved foods · long press to delete
              </Text>
            </View>
            <View style={styles.foodList}>
              {store.isSearching ? (
                <ActivityIndicator color={GREEN} style={styles.loader} />
              ) : !store.foods.length ? (
                <View style={styles.empty}>
                  <Ionicons name="nutrition-outline" size={26} color={GREEN} />
                  <Text style={styles.emptyTitle}>No saved foods yet</Text>
                  <Text style={styles.emptyText}>
                    Create frequently eaten foods for faster logging.
                  </Text>
                </View>
              ) : (
                store.foods.map((item, index) => (
                  <View key={item.id}>
                    <Pressable
                      onLongPress={() =>
                        Alert.alert("Delete saved food?", item.name, [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Delete",
                            style: "destructive",
                            onPress: () => void store.deleteFood(item.id),
                          },
                        ])
                      }
                      style={styles.foodRow}
                    >
                      <View style={styles.foodIcon}>
                        <Ionicons
                          name="restaurant-outline"
                          size={18}
                          color={GREEN}
                        />
                      </View>
                      <View style={styles.foodCopy}>
                        <Text style={styles.foodName}>{item.name}</Text>
                        <Text style={styles.foodMeta}>
                          {item.servingQuantity} {item.servingUnit}
                          {item.brand ? ` · ${item.brand}` : ""}
                        </Text>
                      </View>
                      <Text style={styles.foodCalories}>
                        {item.calories} kcal
                      </Text>
                    </Pressable>
                    {index < store.foods.length - 1 ? (
                      <View style={styles.divider} />
                    ) : null}
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  unit,
  placeholder,
  keyboard = "default",
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  unit?: string;
  placeholder?: string;
  keyboard?: "decimal-pad" | "default";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboard}
          placeholder={placeholder ?? "0"}
          placeholderTextColor="#626262"
          style={styles.input}
        />
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
    </View>
  );
}
function SaveButton({
  label,
  loading,
  disabled,
  onPress,
}: {
  label: string;
  loading: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={loading || disabled}
      onPress={onPress}
      style={[styles.save, (loading || disabled) && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color={INK} />
      ) : (
        <>
          <Text style={styles.saveText}>{label}</Text>
          <Ionicons name="arrow-forward" size={18} color={INK} />
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: INK },
  content: { paddingHorizontal: 17, paddingBottom: 40 },
  header: { height: 72, flexDirection: "row", alignItems: "center" },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#2B2B2B",
  },
  headerCopy: { marginLeft: 12 },
  eyebrow: { color: GREEN, fontSize: 8, fontWeight: "900", letterSpacing: 1.5 },
  title: { color: "#FFF", fontSize: 24, fontWeight: "800", marginTop: 2 },
  tabs: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 16,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#292929",
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  tabActive: { backgroundColor: GREEN },
  tabText: { color: MUTED, fontSize: 10, fontWeight: "700" },
  tabTextActive: { color: INK, fontWeight: "900" },
  error: {
    minHeight: 46,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    backgroundColor: "#2A1919",
    borderWidth: 1,
    borderColor: "#573030",
    marginBottom: 12,
  },
  errorText: { color: "#FFC1C1", fontSize: 10, flex: 1 },
  hero: {
    minHeight: 105,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: "#1B2118",
    borderWidth: 1,
    borderColor: "#354225",
    marginBottom: 12,
  },
  heroIcon: {
    width: 52,
    height: 62,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN,
  },
  heroCopy: { flex: 1, marginLeft: 14 },
  heroTitle: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  heroText: { color: MUTED, fontSize: 10, lineHeight: 15, marginTop: 5 },
  card: {
    padding: 15,
    borderRadius: 22,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#292929",
  },
  cardTitle: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 3,
  },
  row: { flexDirection: "row", gap: 8 },
  column: { flex: 1 },
  field: { flex: 1 },
  label: {
    color: "#999",
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 7,
  },
  inputWrap: {
    height: 49,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#202020",
    borderWidth: 1,
    borderColor: "#323232",
  },
  input: { flex: 1, color: "#FFF", fontSize: 12 },
  unit: { color: MUTED, fontSize: 9 },
  save: {
    height: 53,
    marginTop: 14,
    borderRadius: 16,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: GREEN,
  },
  saveText: { color: INK, fontSize: 11, fontWeight: "900" },
  disabled: { opacity: 0.45 },
  section: { marginTop: 23, marginBottom: 10 },
  sectionTitle: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  sectionText: { color: MUTED, fontSize: 9, marginTop: 3 },
  foodList: {
    borderRadius: 21,
    overflow: "hidden",
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#292929",
  },
  foodRow: {
    height: 68,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  foodIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#252A1D",
  },
  foodCopy: { flex: 1, marginLeft: 10 },
  foodName: { color: "#EEE", fontSize: 11, fontWeight: "700" },
  foodMeta: { color: MUTED, fontSize: 8, marginTop: 4 },
  foodCalories: { color: "#FFF", fontSize: 11, fontWeight: "800" },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#303030",
    marginLeft: 60,
  },
  loader: { padding: 30 },
  empty: { alignItems: "center", padding: 30 },
  emptyTitle: { color: "#FFF", fontSize: 13, fontWeight: "800", marginTop: 10 },
  emptyText: { color: MUTED, fontSize: 9, marginTop: 4, textAlign: "center" },
});
