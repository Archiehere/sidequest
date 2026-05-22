import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { api, Quest } from '../../../src/api';
import { theme } from '../../../src/theme';

const rupees = (paise: number) => `₹${(paise / 100).toFixed(0)}`;

export default function QuestDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getQuest(id).then(setQuest).catch((e) => Alert.alert('Failed to load', e.message));
  }, [id]);

  if (!quest) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={theme.color.accent} />
      </View>
    );
  }

  const onOrder = async () => {
    setOrdering(true);
    try {
      const { checkoutUrl, basket } = await api.checkout(quest.id);
      Alert.alert(
        'Basket ready',
        `Total ${rupees(basket.totalPaise)}\n\nTap continue to finish on Swiggy.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => WebBrowser.openBrowserAsync(checkoutUrl) },
        ],
      );
    } catch (e: any) {
      Alert.alert('Could not create basket', e.message);
    } finally {
      setOrdering(false);
    }
  };

  const onShare = async () => {
    await Share.share({
      message: `Today's SideQuest: ${quest.title} — sidequest.in/q/${quest.id}`,
    });
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: theme.space(10) }}>
      <Image source={{ uri: quest.heroImageUrl }} style={s.hero} />
      <View style={{ padding: theme.space(5) }}>
        <Text style={s.meta}>
          {quest.estTimeMin} MIN · {quest.difficulty.toUpperCase()}
        </Text>
        <Text style={s.title}>{quest.title}</Text>
        <Text style={s.desc}>{quest.description}</Text>

        <View style={s.divider} />

        <Text style={s.sectionLabel}>You'll need</Text>
        {quest.materials.map((m) => (
          <View key={m.id} style={s.matRow}>
            {m.product?.imageUrl ? (
              <Image source={{ uri: m.product.imageUrl }} style={s.matImg} />
            ) : (
              <View style={[s.matImg, { backgroundColor: theme.color.border }]} />
            )}
            <View style={{ flex: 1, marginLeft: theme.space(3) }}>
              <Text style={s.matName}>
                {m.productName}
                {m.optional ? <Text style={s.matOptional}>  optional</Text> : null}
              </Text>
              <Text style={s.matMeta}>
                {m.product ? `${m.product.unit} · ${rupees(m.product.pricePaise)}` : 'unavailable'} × {m.qty}
              </Text>
            </View>
          </View>
        ))}

        {quest.subtotalPaise !== undefined ? (
          <Text style={s.subtotal}>Basket subtotal: {rupees(quest.subtotalPaise)}</Text>
        ) : null}

        <Pressable style={[s.cta, ordering && { opacity: 0.6 }]} onPress={onOrder} disabled={ordering}>
          <Text style={s.ctaText}>{ordering ? 'building basket…' : 'order supplies'}</Text>
        </Pressable>

        <Pressable style={s.ctaSecondary} onPress={onShare}>
          <Text style={s.ctaSecondaryText}>I'm doing this — share</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { width: '100%', height: 280 },
  meta: { color: theme.color.accent, fontSize: 12, fontWeight: '800', letterSpacing: 2, marginBottom: 6 },
  title: { color: theme.color.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.5, lineHeight: 34 },
  desc: { color: theme.color.text, fontSize: 16, lineHeight: 24, marginTop: theme.space(3), opacity: 0.85 },
  divider: { height: 1, backgroundColor: theme.color.border, marginVertical: theme.space(5) },
  sectionLabel: { color: theme.color.textDim, fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: theme.space(3) },
  matRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.space(3) },
  matImg: { width: 56, height: 56, borderRadius: theme.radius.md, backgroundColor: theme.color.bgElevated },
  matName: { color: theme.color.text, fontSize: 15, fontWeight: '600' },
  matOptional: { color: theme.color.textDim, fontSize: 12, fontWeight: '500' },
  matMeta: { color: theme.color.textDim, fontSize: 13, marginTop: 2 },
  subtotal: { color: theme.color.text, fontSize: 16, fontWeight: '700', marginTop: theme.space(4) },
  cta: {
    backgroundColor: theme.color.accent,
    padding: theme.space(4),
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.space(5),
  },
  ctaText: { color: theme.color.accentInk, fontSize: 17, fontWeight: '800' },
  ctaSecondary: {
    padding: theme.space(4),
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.space(2),
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  ctaSecondaryText: { color: theme.color.text, fontSize: 15, fontWeight: '600' },
});
