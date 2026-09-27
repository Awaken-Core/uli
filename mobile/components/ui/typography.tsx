import { forwardRef, type ComponentRef } from "react";
import {
  StyleSheet,
  Text as NativeText,
  TextInput as NativeTextInput,
  type TextInputProps,
  type TextProps,
} from "react-native";

const MEDIUM = "Geist_500Medium";
const SEMIBOLD = "Geist_600SemiBold";
const MINIMUM_TEXT_SIZE = 11;
const MINIMUM_INPUT_SIZE = 13;

function getFontFamily(weight: unknown) {
  const numericWeight = Number(weight);
  return Number.isFinite(numericWeight) && numericWeight >= 600
    ? SEMIBOLD
    : MEDIUM;
}

export const Text = forwardRef<ComponentRef<typeof NativeText>, TextProps>(
  function Text({ style, maxFontSizeMultiplier = 1.5, ...props }, ref) {
    const flattened = StyleSheet.flatten(style) ?? {};
    const fontSize = Math.max(flattened.fontSize ?? 14, MINIMUM_TEXT_SIZE);

    return (
      <NativeText
        ref={ref}
        {...props}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        style={[
          style,
          {
            fontFamily: getFontFamily(flattened.fontWeight),
            fontSize,
            fontWeight: undefined,
          },
        ]}
      />
    );
  },
);

export const TextInput = forwardRef<
  ComponentRef<typeof NativeTextInput>,
  TextInputProps
>(function TextInput({ style, maxFontSizeMultiplier = 1.5, ...props }, ref) {
  const flattened = StyleSheet.flatten(style) ?? {};

  return (
    <NativeTextInput
      ref={ref}
      {...props}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[
        style,
        {
          fontFamily: MEDIUM,
          fontSize: Math.max(
            flattened.fontSize ?? MINIMUM_INPUT_SIZE,
            MINIMUM_INPUT_SIZE,
          ),
          fontWeight: undefined,
        },
      ]}
    />
  );
});
