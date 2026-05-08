import { auth } from '@/firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'; // ✅ popup
import React, { useCallback, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props = {
  onSuccess?: (data: any) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
};

const isWeb = Platform.OS === 'web';

export default function ContinueWithGoogle({ onSuccess, onError, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  const provider = useMemo(() => new GoogleAuthProvider(), []);

  const signIn = useCallback(async () => {
    try {
      setLoading(true);

      if (isWeb) {
        const result = await signInWithPopup(auth, provider);
        // ✅ Minimal payload for faster processing
        onSuccess?.({
          data: {
            user: {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
            }
          }
        });
        return;
      }

      // Native (Android/iOS)
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      onSuccess?.(userInfo);

    } catch (error: any) {
      onError?.(error.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError, provider]);

  return (
    <TouchableOpacity
      style={[styles.button, (disabled || loading) && styles.disabled]}
      onPress={signIn}
      disabled={disabled || loading}
    >
      <Text style={styles.text}>
        {loading ? 'Signing in...' : 'Continue with Google'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#151515',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2C',
  },
  disabled: { opacity: 0.6 },
  text: { color: 'white', fontWeight: '600' },
});