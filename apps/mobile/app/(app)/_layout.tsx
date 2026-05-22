import { Stack } from 'expo-router';
import { theme } from '../../src/theme';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.color.bg },
        headerTintColor: theme.color.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.color.bg },
      }}
    >
      <Stack.Screen name="drop" options={{ title: "Today's Drop" }} />
      <Stack.Screen name="quest/[id]" options={{ title: '' }} />
    </Stack>
  );
}
