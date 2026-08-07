// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";
import type { IconSymbolName } from "@/types";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  heart: "favorite-outline",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  calendar: "calendar-month",
  "message.fill": "message",
  "person.fill": "person",
  "line.3.horizontal": "menu",
  "bell.fill": "notifications-none",
  magnifyingglass: "search",
  "building.columns.fill": "temple-hindu",
  "figure.walk": "hiking",
  "fork.knife": "restaurant",
  "photo.on.rectangle.angled.fill": "landscape",
  "figure.outdoor.cycle.circle.fill": "directions-bike",
  envelope: "email",
  "lock.fill": "lock",
  eye: "visibility",
  "eye.slash": "visibility-off",
  "exclamationmark.triangle.fill": "warning",
  globe: "public",
  applelogo: "laptop-mac",
  "phone.fill": "phone",
  "suitcase.fill": "work",
  "map.fill": "location-pin",
  "location.fill": "location-pin",
  "location.slash": "location-off",
  "mountain.2.fill": "terrain",
  "checkmark.circle.fill": "check-circle",
  circle: "radio-button-unchecked",
  checkmark: "check",
  "star.fill": "star",
  "shield.fill": "security",
  trash: "delete",
  plus: "add",
  "arrow.left": "arrow-back",
  share: "share",
  clock: "schedule",
  "person.3.fill": "groups",
  tag: "local-offer",
  "xmark.circle.fill": "cancel",
  xmark: "close",
  "checkmark.seal.fill": "verified",
  "xmark.seal.fill": "error",
  "shield.lefthalf.filled": "security",
  "person.text.rectangle": "badge",
  "doc.text.fill": "description",
  "leaf.fill": "eco",
  "museum.fill": "museum",
  "camera.fill": "photo-camera",
  "bell.slash.fill": "notifications-off",
  "envelope.fill": "email",
  "square.and.arrow.up": "ios-share",
  "cross.case.fill": "medical-services",
  "moon.fill": "dark-mode",
  "person.crop.circle": "account-circle",
  "person.crop.circle.badge.checkmark": "how-to-reg",
  "clock.fill": "schedule",
  "checkmark.shield.fill": "verified-user",
  "mappin.and.ellipse": "pin-drop",
  "stop.fill": "stop",
  photo: "photo",
  safari: "explore",
  "person.2.fill": "people",
  "flag.fill": "flag",
  "info.circle.fill": "info",
  "play.fill": "play-arrow",
} as const satisfies Record<IconSymbolName, MaterialIconName>;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
