import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { api, setSession } from '../src/api';
import { theme } from '../src/theme';

export default function Onboarding() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [handle, setHandle] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (phone.length < 10) return Alert.alert('Enter a valid phone number');
    setLoading(true);
    try {
      const { devOtp } = await api.requestOtp(phone);
      setStep('otp');
      Alert.alert('Dev OTP', `Use ${devOtp} (demo mode — hardcoded)`);
    } catch (e: any) {
      Alert.alert('Could not send OTP', e.message);
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setLoading(true);
    try {
      const { token, user } = await api.verifyOtp(phone, otp, handle || undefined);
      await setSession(token, user);
      router.replace('/(app)/drop');
    } catch (e: any) {
      Alert.alert('Verification failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={s.brand}>SideQuest</Text>
      <Text style={s.tagline}>5 things worth doing today.</Text>

      {step === 'phone' ? (
        <>
          <TextInput
            style={s.input}
            placeholder="phone number"
            placeholderTextColor={theme.color.textDim}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Pressable style={s.cta} onPress={sendOtp} disabled={loading}>
            <Text style={s.ctaText}>{loading ? '…' : 'send code'}</Text>
          </Pressable>
        </>
      ) : (
        <>
          <TextInput
            style={s.input}
            placeholder="6-digit code"
            placeholderTextColor={theme.color.textDim}
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
          />
          <TextInput
            style={s.input}
            placeholder="pick a handle (shows on your shares)"
            placeholderTextColor={theme.color.textDim}
            autoCapitalize="none"
            value={handle}
            onChangeText={setHandle}
          />
          <Pressable style={s.cta} onPress={verify} disabled={loading}>
            <Text style={s.ctaText}>{loading ? '…' : "let's go"}</Text>
          </Pressable>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, padding: theme.space(6), backgroundColor: theme.color.bg, justifyContent: 'center' },
  brand: { color: theme.color.accent, fontSize: 44, fontWeight: '900', letterSpacing: -1, marginBottom: 8 },
  tagline: { color: theme.color.text, fontSize: 18, marginBottom: theme.space(8) },
  input: {
    backgroundColor: theme.color.bgElevated,
    color: theme.color.text,
    fontSize: 18,
    padding: theme.space(4),
    borderRadius: theme.radius.md,
    marginBottom: theme.space(3),
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  cta: {
    backgroundColor: theme.color.accent,
    padding: theme.space(4),
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.space(2),
  },
  ctaText: { color: theme.color.accentInk, fontSize: 18, fontWeight: '800' },
});
