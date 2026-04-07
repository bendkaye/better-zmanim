import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-bold text-slate-900">Better Zmanim</Text>
      <Text className="mt-2 text-slate-600">
        Jewish prayer times, done right.
      </Text>
    </View>
  );
}
