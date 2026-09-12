import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Style } from "@dicebear/core";
import definition from "@dicebear/styles/waves.json";
import { SvgXml } from "react-native-svg";

const style = new Style(definition);

export default function UserAvatar({ username = "Suzi" }) {
  const svgString = useMemo(() => {
    const avatar = new Avatar(style, {
      seed: username,
      size: 128,
    });

    return avatar.toString();
  }, [username]);

  return (
    <View style={styles.container}>
      <SvgXml xml={svgString} width="100%" height="100%" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    overflow: "hidden",
  },
});
