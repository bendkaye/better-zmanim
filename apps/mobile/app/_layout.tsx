import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#1e3a5f" },
        headerTintColor: "#ffffff",
        headerTitle: "Better Zmanim",
      }}
    />
  );
}
