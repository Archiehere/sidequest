import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getToken } from '../src/api';
import { theme } from '../src/theme';

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const token = await getToken();
      router.replace(token ? '/(app)/drop' : '/onboarding');
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.bg, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color={theme.color.accent} />
    </View>
  );
}
