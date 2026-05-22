import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api, Quest } from '../../src/api';
import { theme } from '../../src/theme';

export default function Drop() {
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await api.todaysDrop();
      setQuests(data);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!quests) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={theme.color.accent} />
        {error ? <Text style={s.error}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <FlatList
      data={quests}
      keyExtractor={(q) => q.id}
      contentContainerStyle={{ padding: theme.space(4), paddingBottom: theme.space(10) }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.color.accent} />}
      ListHeaderComponent={
        <View style={{ marginBottom: theme.space(4) }}>
          <Text style={s.dateHint}>{new Date().toDateString().toUpperCase()}</Text>
          <Text style={s.heading}>Pick one. Do it today.</Text>
        </View>
      }
      ItemSeparatorComponent={() => <View style={{ height: theme.space(3) }} />}
      renderItem={({ item, index }) => (
        <Pressable style={s.card} onPress={() => router.push(`/(app)/quest/${item.id}`)}>
          <Image source={{ uri: item.heroImageUrl }} style={s.hero} />
          <View style={s.cardBody}>
            <View style={s.metaRow}>
              <Text style={s.numBadge}>{String(index + 1).padStart(2, '0')}</Text>
              <Text style={s.metaText}>{item.estTimeMin} min · {item.difficulty}</Text>
            </View>
            <Text style={s.title}>{item.title}</Text>
          </View>
        </Pressable>
      )}
      ListEmptyComponent={
        <View style={s.center}>
          <Text style={s.error}>No quests for today yet. Did you run `npm run api:seed`?</Text>
        </View>
      }
    />
  );
}

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.space(6) },
  error: { color: theme.color.danger, marginTop: theme.space(3), textAlign: 'center' },
  dateHint: { color: theme.color.accent, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  heading: { color: theme.color.text, fontSize: 28, fontWeight: '900', marginTop: 4, letterSpacing: -0.5 },
  card: {
    backgroundColor: theme.color.bgElevated,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  hero: { width: '100%', height: 180 },
  cardBody: { padding: theme.space(4) },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.space(2) },
  numBadge: {
    color: theme.color.accentInk,
    backgroundColor: theme.color.accent,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: theme.space(2),
    fontSize: 12,
  },
  metaText: { color: theme.color.textDim, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  title: { color: theme.color.text, fontSize: 20, fontWeight: '700', lineHeight: 26 },
});
