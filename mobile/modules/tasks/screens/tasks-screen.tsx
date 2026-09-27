import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getLocalDateKey } from "@/lib/date";
import {
  TASK_PRIORITY,
  TASK_STATUS,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/constants";
import type { TaskItem } from "@/lib/api";
import { useTasksStore } from "@/stores/tasks-store";

const GREEN = "#C5FF27",
  INK = "#101010",
  CARD = "#191919",
  MUTED = "#8D8D8D";
const PRIORITIES = Object.values(TASK_PRIORITY);
type Filter = "all" | TaskStatus;

export default function TasksScreen() {
  const router = useRouter();
  const store = useTasksStore();
  const editorRef = useRef<BottomSheetModal>(null);
  const categoryRef = useRef<BottomSheetModal>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<TaskItem | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [categoryId, setCategoryId] = useState("");
  const [scheduledDate, setScheduledDate] = useState(getLocalDateKey());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [minutes, setMinutes] = useState("30");
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#C5FF27");

  useEffect(() => {
    void store.load();
  }, [store.load]);
  const tasks = useMemo(
    () =>
      store.tasks
        .filter((task) => filter === "all" || task.status === filter)
        .filter(
          (task) =>
            !query.trim() ||
            `${task.title} ${task.description ?? ""}`
              .toLowerCase()
              .includes(query.trim().toLowerCase()),
        )
        .sort(
          (a, b) =>
            Number(a.status === "completed") -
              Number(b.status === "completed") ||
            (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
        ),
    [store.tasks, filter, query],
  );
  const completed = store.tasks.filter(
    (task) => task.status === "completed",
  ).length;
  const today = getLocalDateKey();
  const todayCount = store.tasks.filter(
    (task) => task.scheduledDate === today && task.status !== "completed",
  ).length;

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
  function openCreate() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setStatus("todo");
    setCategoryId("");
    setScheduledDate(today);
    setShowDatePicker(false);
    setMinutes("30");
    editorRef.current?.present();
  }
  function openEdit(task: TaskItem) {
    setEditing(task);
    setTitle(task.title);
    setDescription(task.description ?? "");
    setPriority(task.priority);
    setStatus(task.status);
    setCategoryId(task.categoryId ?? "");
    setScheduledDate(task.scheduledDate ?? "");
    setShowDatePicker(false);
    setMinutes(task.estimatedMinutes ? String(task.estimatedMinutes) : "");
    editorRef.current?.present();
  }
  async function saveTask() {
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status,
      categoryId: categoryId || undefined,
      scheduledDate: scheduledDate.trim() || undefined,
      estimatedMinutes: minutes ? Number(minutes) : undefined,
    };
    const ok = editing
      ? await store.updateTask(editing.id, payload)
      : await store.createTask(payload);
    if (ok) editorRef.current?.dismiss();
  }

  function getPickerDate() {
    if (!scheduledDate) return new Date();
    const date = new Date(`${scheduledDate}T12:00:00`);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  function handleDateChange(_event: DateTimePickerEvent, date?: Date) {
    if (date) setScheduledDate(getLocalDateKey(date));
  }

  function openDatePicker() {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: getPickerDate(),
        mode: "date",
        onChange: handleDateChange,
      });
      return;
    }
    setShowDatePicker(true);
  }
  async function saveCategory() {
    if (!categoryName.trim()) return;
    if (
      await store.createCategory({
        name: categoryName.trim(),
        color: categoryColor,
      })
    ) {
      setCategoryName("");
      categoryRef.current?.dismiss();
    }
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={store.isLoading}
            onRefresh={store.load}
            tintColor={GREEN}
          />
        }
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>PLAN YOUR DAY</Text>
            <Text style={styles.pageTitle}>Tasks</Text>
          </View>
          <Pressable
            accessibilityLabel="Manage categories"
            onPress={() => categoryRef.current?.present()}
            style={styles.iconButton}
          >
            <Ionicons name="pricetags-outline" size={20} color="#FFF" />
          </Pressable>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryLabel}>YOUR MOMENTUM</Text>
            <Text style={styles.summaryTitle}>
              {store.tasks.length
                ? `${completed} of ${store.tasks.length} complete`
                : "Start with one clear task"}
            </Text>
            <Text style={styles.summaryText}>
              {todayCount
                ? `${todayCount} still planned for today`
                : "Your schedule is clear for today"}
            </Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressValue}>
              {store.tasks.length
                ? Math.round((completed / store.tasks.length) * 100)
                : 0}
              %
            </Text>
            <Text style={styles.progressLabel}>done</Text>
          </View>
        </View>

        {store.error ? (
          <Pressable onPress={store.clearError} style={styles.error}>
            <Ionicons name="alert-circle-outline" size={18} color="#FF9B9B" />
            <Text numberOfLines={2} style={styles.errorText}>
              {store.error}
            </Text>
            <Ionicons name="close" size={16} color="#777" />
          </Pressable>
        ) : null}

        <View style={styles.search}>
          <Ionicons name="search" size={18} color="#777" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search tasks"
            placeholderTextColor="#686868"
            style={styles.searchInput}
          />
          {query ? (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color="#666" />
            </Pressable>
          ) : null}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {(["all", "todo", "inProgress", "completed"] as Filter[]).map(
            (item) => (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
                style={[styles.filter, filter === item && styles.filterActive]}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === item && styles.filterTextActive,
                  ]}
                >
                  {filterLabel(item)}
                </Text>
              </Pressable>
            ),
          )}
        </ScrollView>

        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionTitle}>
              {filter === "all" ? "All tasks" : filterLabel(filter)}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
            </Text>
          </View>
          <Pressable onPress={openCreate} style={styles.addButton}>
            <Ionicons name="add" size={18} color={INK} />
            <Text style={styles.addText}>New task</Text>
          </Pressable>
        </View>
        <View style={styles.list}>
          {!store.isLoading && !tasks.length ? (
            <Pressable onPress={openCreate} style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="checkmark-done-outline"
                  size={26}
                  color={GREEN}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {query ? "No matching tasks" : "Your list is clear"}
              </Text>
              <Text style={styles.emptyText}>
                {query
                  ? "Try a different search or filter."
                  : "Create a task and give today a little structure."}
              </Text>
            </Pressable>
          ) : null}
          {tasks.map((task, index) => {
            const category = store.categories.find(
              (item) => item.id === task.categoryId,
            );
            return (
              <View key={task.id}>
                <Pressable
                  onPress={() => openEdit(task)}
                  onLongPress={() =>
                    Alert.alert("Delete task?", task.title, [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => void store.deleteTask(task.id),
                      },
                    ])
                  }
                  style={({ pressed }) => [
                    styles.taskRow,
                    pressed && styles.pressed,
                  ]}
                >
                  <Pressable
                    accessibilityLabel={
                      task.status === "completed"
                        ? "Mark incomplete"
                        : "Mark complete"
                    }
                    hitSlop={10}
                    onPress={() => void store.toggleTask(task)}
                    style={[
                      styles.checkbox,
                      task.status === "completed" && styles.checkboxDone,
                    ]}
                  >
                    {task.status === "completed" ? (
                      <Ionicons name="checkmark" size={15} color={INK} />
                    ) : null}
                  </Pressable>
                  <View style={styles.taskCopy}>
                    <Text
                      numberOfLines={2}
                      style={[
                        styles.taskTitle,
                        task.status === "completed" && styles.taskDone,
                      ]}
                    >
                      {task.title}
                    </Text>
                    <View style={styles.meta}>
                      {category ? (
                        <View style={styles.category}>
                          <View
                            style={[
                              styles.categoryDot,
                              { backgroundColor: category.color || GREEN },
                            ]}
                          />
                          <Text style={styles.categoryText}>
                            {category.name}
                          </Text>
                        </View>
                      ) : null}
                      {task.scheduledDate ? (
                        <Text style={styles.metaText}>
                          {task.scheduledDate === today
                            ? "Today"
                            : task.scheduledDate.slice(5)}
                        </Text>
                      ) : null}
                      {task.estimatedMinutes ? (
                        <Text style={styles.metaText}>
                          {task.estimatedMinutes} min
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <View
                    style={[
                      styles.priority,
                      { backgroundColor: priorityColor(task.priority) },
                    ]}
                  />
                </Pressable>
                {index < tasks.length - 1 ? (
                  <View style={styles.divider} />
                ) : null}
              </View>
            );
          })}
        </View>
        {tasks.length ? (
          <Text style={styles.hint}>Tap to edit · long press to delete</Text>
        ) : null}
      </ScrollView>

      <BottomSheetModal
        ref={editorRef}
        snapPoints={["88%"]}
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
              <Text style={styles.sheetTitle}>
                {editing ? "Edit task" : "New task"}
              </Text>
              <Text style={styles.sectionSubtitle}>
                Keep it clear, specific, and doable.
              </Text>
            </View>
            <Pressable
              onPress={() => editorRef.current?.dismiss()}
              style={styles.iconButton}
            >
              <Ionicons name="close" size={20} color="#FFF" />
            </Pressable>
          </View>
          <Label>TITLE</Label>
          <TextInput
            autoFocus
            value={title}
            onChangeText={setTitle}
            placeholder="What needs to happen?"
            placeholderTextColor="#626262"
            style={styles.input}
          />
          <Label>NOTES</Label>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Optional details"
            placeholderTextColor="#626262"
            multiline
            style={[styles.input, styles.notes]}
          />
          <Label>PRIORITY</Label>
          <View style={styles.choiceRow}>
            {PRIORITIES.map((item) => (
              <Pressable
                key={item}
                onPress={() => setPriority(item)}
                style={[
                  styles.choice,
                  priority === item && styles.choiceActive,
                ]}
              >
                <View
                  style={[
                    styles.priorityDot,
                    { backgroundColor: priorityColor(item) },
                  ]}
                />
                <Text
                  style={[
                    styles.choiceText,
                    priority === item && styles.choiceTextActive,
                  ]}
                >
                  {capitalize(item)}
                </Text>
              </Pressable>
            ))}
          </View>
          <Label>CATEGORY</Label>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryChoices}
          >
            <Pressable
              onPress={() => setCategoryId("")}
              style={[
                styles.categoryChoice,
                !categoryId && styles.categoryChoiceActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryChoiceText,
                  !categoryId && styles.categoryChoiceTextActive,
                ]}
              >
                None
              </Text>
            </Pressable>
            {store.categories.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setCategoryId(item.id)}
                style={[
                  styles.categoryChoice,
                  categoryId === item.id && styles.categoryChoiceActive,
                ]}
              >
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: item.color || GREEN },
                  ]}
                />
                <Text
                  style={[
                    styles.categoryChoiceText,
                    categoryId === item.id && styles.categoryChoiceTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <Label>DATE</Label>
              <Pressable onPress={openDatePicker} style={styles.dateInput}>
                <Ionicons name="calendar-outline" size={17} color={GREEN} />
                <Text
                  style={[
                    styles.dateInputText,
                    !scheduledDate && styles.datePlaceholder,
                  ]}
                >
                  {scheduledDate
                    ? getPickerDate().toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "No date"}
                </Text>
                {scheduledDate ? (
                  <Pressable
                    accessibilityLabel="Clear scheduled date"
                    hitSlop={8}
                    onPress={(event) => {
                      event.stopPropagation();
                      setScheduledDate("");
                    }}
                  >
                    <Ionicons name="close-circle" size={17} color="#707070" />
                  </Pressable>
                ) : (
                  <Ionicons name="chevron-down" size={16} color="#707070" />
                )}
              </Pressable>
            </View>
            <View style={styles.formColumn}>
              <Label>ESTIMATE</Label>
              <TextInput
                value={minutes}
                onChangeText={setMinutes}
                keyboardType="number-pad"
                placeholder="Minutes"
                placeholderTextColor="#626262"
                style={styles.input}
              />
            </View>
          </View>
          {showDatePicker && Platform.OS === "ios" ? (
            <View style={styles.iosPickerCard}>
              <DateTimePicker
                display="inline"
                mode="date"
                onChange={handleDateChange}
                themeVariant="dark"
                value={getPickerDate()}
              />
              <Pressable
                onPress={() => setShowDatePicker(false)}
                style={styles.pickerDone}
              >
                <Text style={styles.pickerDoneText}>Done</Text>
              </Pressable>
            </View>
          ) : null}
          {editing ? (
            <>
              <Label>STATUS</Label>
              <View style={styles.choiceRow}>
                {Object.values(TASK_STATUS).map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setStatus(item)}
                    style={[
                      styles.choice,
                      status === item && styles.choiceActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.choiceText,
                        status === item && styles.choiceTextActive,
                      ]}
                    >
                      {filterLabel(item)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}
          <Pressable
            disabled={!title.trim() || store.isMutating}
            onPress={() => void saveTask()}
            style={[
              styles.save,
              (!title.trim() || store.isMutating) && styles.disabled,
            ]}
          >
            {store.isMutating ? (
              <ActivityIndicator color={INK} />
            ) : (
              <>
                <Text style={styles.saveText}>
                  {editing ? "Save changes" : "Create task"}
                </Text>
                <Ionicons name="arrow-forward" size={18} color={INK} />
              </>
            )}
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>

      <BottomSheetModal
        ref={categoryRef}
        snapPoints={["90%"]}
        backdropComponent={backdrop}
        enablePanDownToClose
        enableDynamicSizing={false}
        keyboardBehavior="extend"
        backgroundStyle={styles.sheet}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sheetHead}>
            <View>
              <Text style={styles.sheetTitle}>Categories</Text>
              <Text style={styles.sectionSubtitle}>
                Group related work for faster scanning.
              </Text>
            </View>
            <Pressable
              onPress={() => categoryRef.current?.dismiss()}
              style={styles.iconButton}
            >
              <Ionicons name="close" size={20} color="#FFF" />
            </Pressable>
          </View>
          <Label>NEW CATEGORY</Label>
          <TextInput
            value={categoryName}
            onChangeText={setCategoryName}
            placeholder="e.g. Health"
            placeholderTextColor="#626262"
            style={styles.input}
          />
          <View style={styles.colors}>
            {[
              "#C5FF27",
              "#76D8FF",
              "#FFB86B",
              "#D49CFF",
              "#FF7474",
              "#5EE0A0",
            ].map((color) => (
              <Pressable
                accessibilityLabel={`Use color ${color}`}
                key={color}
                onPress={() => setCategoryColor(color)}
                style={[
                  styles.color,
                  { backgroundColor: color },
                  categoryColor === color && styles.colorActive,
                ]}
              />
            ))}
          </View>
          <Pressable
            disabled={!categoryName.trim() || store.isMutating}
            onPress={() => void saveCategory()}
            style={[
              styles.save,
              styles.categorySave,
              (!categoryName.trim() || store.isMutating) && styles.disabled,
            ]}
          >
            <Text style={styles.saveText}>Add category</Text>
            <Ionicons name="add" size={19} color={INK} />
          </Pressable>
          <Label>YOUR CATEGORIES</Label>
          <View style={styles.categoryList}>
            {store.categories.map((item) => (
              <Pressable
                key={item.id}
                onLongPress={() =>
                  Alert.alert("Delete category?", item.name, [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => void store.deleteCategory(item.id),
                    },
                  ])
                }
                style={styles.categoryRow}
              >
                <View
                  style={[
                    styles.categorySwatch,
                    { backgroundColor: item.color || GREEN },
                  ]}
                />
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryCount}>
                  {
                    store.tasks.filter((task) => task.categoryId === item.id)
                      .length
                  }{" "}
                  tasks
                </Text>
              </Pressable>
            ))}
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}

function Label({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}
function filterLabel(value: Filter) {
  return value === "all"
    ? "All"
    : value === "inProgress"
      ? "In progress"
      : capitalize(value);
}
function capitalize(value: string) {
  return value[0].toUpperCase() + value.slice(1);
}
function priorityColor(priority: TaskPriority) {
  return priority === "urgent"
    ? "#FF5C5C"
    : priority === "high"
      ? "#FFB86B"
      : priority === "medium"
        ? "#76D8FF"
        : "#8A8A8A";
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: INK },
  content: { paddingHorizontal: 17, paddingBottom: 34 },
  header: { minHeight: 72, flexDirection: "row", alignItems: "center" },
  headerCopy: { flex: 1, marginLeft: 12 },
  eyebrow: { color: GREEN, fontSize: 8, fontWeight: "900", letterSpacing: 1.5 },
  pageTitle: { color: "#FFF", fontSize: 24, fontWeight: "800", marginTop: 2 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#2B2B2B",
  },
  summary: {
    minHeight: 132,
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B2118",
    borderWidth: 1,
    borderColor: "#354225",
  },
  summaryCopy: { flex: 1 },
  summaryLabel: {
    color: GREEN,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  summaryTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 8,
  },
  summaryText: { color: MUTED, fontSize: 10, marginTop: 6 },
  progressCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN,
  },
  progressValue: { color: INK, fontSize: 18, fontWeight: "900" },
  progressLabel: { color: "#43520F", fontSize: 8, fontWeight: "700" },
  error: {
    minHeight: 48,
    marginTop: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderRadius: 14,
    backgroundColor: "#2A1919",
    borderWidth: 1,
    borderColor: "#573030",
  },
  errorText: { flex: 1, color: "#FFC1C1", fontSize: 11 },
  search: {
    height: 48,
    marginTop: 13,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderRadius: 15,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#292929",
  },
  searchInput: { flex: 1, color: "#FFF", fontSize: 12 },
  filters: { gap: 7, paddingVertical: 11 },
  filter: {
    height: 34,
    justifyContent: "center",
    paddingHorizontal: 13,
    borderRadius: 11,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#292929",
  },
  filterActive: { backgroundColor: GREEN, borderColor: GREEN },
  filterText: { color: "#AAA", fontSize: 9, fontWeight: "700" },
  filterTextActive: { color: INK, fontWeight: "900" },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 11,
  },
  sectionTitle: { color: "#FFF", fontSize: 17, fontWeight: "800" },
  sectionSubtitle: { color: MUTED, fontSize: 9, marginTop: 3 },
  addButton: {
    height: 36,
    paddingHorizontal: 11,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  taskRow: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#555",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: { backgroundColor: GREEN, borderColor: GREEN },
  taskCopy: { flex: 1, marginHorizontal: 11 },
  taskTitle: {
    color: "#F0F0F0",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
  taskDone: { color: "#777", textDecorationLine: "line-through" },
  meta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  category: { flexDirection: "row", alignItems: "center", gap: 4 },
  categoryDot: { width: 6, height: 6, borderRadius: 3 },
  categoryText: { color: MUTED, fontSize: 8 },
  metaText: { color: "#707070", fontSize: 8 },
  priority: { width: 5, height: 26, borderRadius: 3 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#303030",
    marginLeft: 48,
  },
  empty: { alignItems: "center", paddingVertical: 34, paddingHorizontal: 28 },
  emptyIcon: {
    width: 50,
    height: 50,
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
  hint: { color: "#666", fontSize: 9, textAlign: "center", marginTop: 12 },
  pressed: { opacity: 0.72 },
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
    marginBottom: 18,
  },
  sheetTitle: { color: "#FFF", fontSize: 23, fontWeight: "900" },
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
  notes: { height: 82, paddingTop: 14, textAlignVertical: "top" },
  choiceRow: { flexDirection: "row", gap: 6 },
  choice: {
    flex: 1,
    minHeight: 38,
    paddingHorizontal: 6,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#343434",
    backgroundColor: "#202020",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },
  choiceActive: { borderColor: GREEN, backgroundColor: "#252A1D" },
  choiceText: {
    color: "#999",
    fontSize: 8,
    fontWeight: "700",
    textAlign: "center",
  },
  choiceTextActive: { color: GREEN },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },
  categoryChoices: { gap: 7 },
  categoryChoice: {
    height: 38,
    paddingHorizontal: 11,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#343434",
    backgroundColor: "#202020",
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  categoryChoiceActive: { borderColor: GREEN, backgroundColor: "#252A1D" },
  categoryChoiceText: { color: "#999", fontSize: 9, fontWeight: "700" },
  categoryChoiceTextActive: { color: GREEN },
  formRow: { flexDirection: "row", gap: 10 },
  formColumn: { flex: 1 },
  dateInput: {
    height: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#323232",
    backgroundColor: "#202020",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateInputText: {
    flex: 1,
    color: "#FFF",
    fontSize: 11,
    fontWeight: "600",
  },
  datePlaceholder: { color: "#6F6F6F", fontWeight: "500" },
  iosPickerCard: {
    marginTop: 12,
    padding: 10,
    borderRadius: 18,
    backgroundColor: "#202020",
    borderWidth: 1,
    borderColor: "#323232",
  },
  pickerDone: {
    alignSelf: "flex-end",
    height: 36,
    paddingHorizontal: 15,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN,
  },
  pickerDoneText: { color: INK, fontSize: 10, fontWeight: "900" },
  save: {
    height: 54,
    marginTop: 23,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: GREEN,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  saveText: { color: INK, fontSize: 12, fontWeight: "900" },
  disabled: { opacity: 0.42 },
  colors: { flexDirection: "row", gap: 12, marginTop: 14 },
  color: { width: 34, height: 34, borderRadius: 11 },
  colorActive: { borderWidth: 3, borderColor: "#FFF" },
  categorySave: { marginTop: 16 },
  categoryList: { gap: 7 },
  categoryRow: {
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#202020",
    borderWidth: 1,
    borderColor: "#303030",
  },
  categorySwatch: { width: 10, height: 10, borderRadius: 4 },
  categoryName: {
    flex: 1,
    color: "#EEE",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 10,
  },
  categoryCount: { color: MUTED, fontSize: 9 },
});
