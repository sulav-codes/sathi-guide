import { Stack } from "expo-router";

export default function GuideLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="booking/[id]/index" options={{ headerShown: false }} />
      <Stack.Screen name="booking/[id]/start" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="booking/[id]/active" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="booking/[id]/completed" options={{ headerShown: false, gestureEnabled: false }} />
    </Stack>
  );
}
