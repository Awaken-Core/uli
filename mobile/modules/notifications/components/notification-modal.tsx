import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { RefObject, useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GREEN = "#C5FF27";
const INK = "#101010";

const notifications = [
  {
    id: "1",
    icon: "restaurant-outline" as const,
    title: "Time to log dinner",
    message: "You have 640 kcal remaining for today.",
    time: "Just now",
    unread: true,
  },
  {
    id: "2",
    icon: "water-outline" as const,
    title: "Hydration check",
    message: "Three more glasses will complete your water goal.",
    time: "28 min ago",
    unread: true,
  },
  {
    id: "3",
    icon: "flame-outline" as const,
    title: "12 day streak!",
    message: "You’ve logged your meals consistently for twelve days.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "4",
    icon: "leaf-outline" as const,
    title: "Fiber goal is close",
    message: "Add fruit or vegetables to get the last 12g today.",
    time: "Yesterday",
    unread: false,
  },
];

export function NotificationModal({
  sheetRef,
}: {
  sheetRef: RefObject<BottomSheetModal | null>;
}) {
  const snapPoints = useMemo(() => ["58%", "84%"], []);
  const insets = useSafeAreaInsets();

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

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      enableDynamicSizing={false}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={styles.sheetBackground}
      handleStyle={styles.handleArea}
      handleIndicatorStyle={styles.handle}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>UPDATES</Text>
          <Text style={styles.title}>Notifications</Text>
        </View>
        <Pressable
          onPress={() => sheetRef.current?.dismiss()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={20} color="#FFF" />
        </Pressable>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryIcon}>
          <Ionicons name="sparkles" size={17} color={INK} />
        </View>
        <Text style={styles.summaryText}>You have 3 new updates</Text>
        <Pressable>
          <Text style={styles.readAll}>Mark all read</Text>
        </Pressable>
      </View>

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <Text style={styles.sectionLabel}>TODAY</Text>
        {notifications.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.item, item.unread && styles.itemUnread]}
          >
            <View style={styles.itemIcon}>
              <Ionicons name={item.icon} size={19} color={GREEN} />
            </View>
            <View style={styles.itemCopy}>
              <View style={styles.itemHeading}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.unread && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </Pressable>
        ))}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "#303030",
  },
  handleArea: { paddingTop: 10, paddingBottom: 5 },
  handle: { width: 42, height: 5, borderRadius: 3, backgroundColor: "#555" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 15,
  },
  eyebrow: { color: GREEN, fontSize: 8, fontWeight: "900", letterSpacing: 1.5 },
  title: { color: "#FFF", fontSize: 22, fontWeight: "800", marginTop: 3 },
  closeButton: {
    width: 39,
    height: 39,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#242424",
  },
  summary: {
    height: 51,
    marginHorizontal: 18,
    borderRadius: 15,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#20291A",
    borderWidth: 1,
    borderColor: "#344020",
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN,
  },
  summaryText: {
    flex: 1,
    color: "#DDD",
    fontSize: 9.5,
    fontWeight: "600",
    marginLeft: 9,
  },
  readAll: { color: GREEN, fontSize: 8, fontWeight: "800" },
  list: { paddingHorizontal: 18, paddingTop: 19 },
  sectionLabel: {
    color: "#666",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.3,
    marginBottom: 8,
    marginLeft: 3,
  },
  item: {
    minHeight: 86,
    borderRadius: 18,
    flexDirection: "row",
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#1C1C1C",
    borderWidth: 1,
    borderColor: "#282828",
  },
  itemUnread: { backgroundColor: "#20251C", borderColor: "#344020" },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#292F22",
  },
  itemCopy: { flex: 1, marginLeft: 11 },
  itemHeading: { flexDirection: "row", alignItems: "center" },
  itemTitle: { flex: 1, color: "#F2F2F2", fontSize: 11.5, fontWeight: "700" },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN,
    marginLeft: 8,
  },
  message: { color: "#8C8C8C", fontSize: 9, lineHeight: 14, marginTop: 5 },
  time: { color: "#5F5F5F", fontSize: 7.5, marginTop: 6 },
});
