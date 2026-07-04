import { Stack } from "expo-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function GuideLayout() {
  return (
    <ProtectedRoute allowedRoles={["GUIDE"]} requireAuth>
      <Stack screenOptions={{ headerShown: false }} />
    </ProtectedRoute>
  );
}
