import ContinueWithGoogle from '@/components/continue-with-google';
import { Colors } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { signIn, signInOauth } from '../function/user';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/firebase';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    email: '',
    password: '',
    general: '',
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  

  const validatationInput = () => {
    let isValid = true;
    if(!email && !password) {
      setError({
        email: 'Email is required',
        password: 'Password is required',
        general: '',
      });
      return false;
    }
    if (!email) {
      setError(prev => ({ ...prev, email: 'Email is required' }));
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError(prev => ({ ...prev, email: 'Email is invalid' }));
      isValid = false;
    } else {
      setError(prev => ({ ...prev, email: '' }));
    }

    if (!password) {
      setError(prev => ({ ...prev, password: 'Password is required' }));
      isValid = false;
    } else if (password.length < 6) {
      setError(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      isValid = false;
    } else {
      setError(prev => ({ ...prev, password: '' }));
    }

    return isValid;
  };

  const handleLogin = () => {
    if (!validatationInput()) {
      return;
    }
    try {
      setLoading(true);
      setError({
        email: '',
        password: '',
        general: '',
      });
      setIsSuccess(false);
      signIn(email, password)
        .then((response:any) => {
          console.log('Email login response:', response);
          if (response.status === 200) {
            setIsSuccess(true);
            router.push('/(tabs)');
          } else {
            setIsSuccess(false);
            setError({
              email: '',
              password: '',
              general: response.error || 'Error logging in',
            });
          }
        })
    }catch (error) {
      setIsSuccess(false);
      setError({
        email: '',
        password: '',
        general: 'Error logging in',
      });
    }
    finally {
      setLoading(false);
    }
  };

  const handleForgot = () => {
    // TODO: forgot password flow
  };

  const handleGoogleSuccess = (userInfo: any) => {
    try {
      setLoading(true);
      setError({
        email: '',
        password: '',
        general: '',
      });
      console.log('Google sign-in success:', userInfo);
      setIsSuccess(false);
    } catch (error) {
      setIsSuccess(false);
      setError({
        email: '',
        password: '',
        general: 'Error signing in with Google',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (message: string) => {
    setLoading(false);
    setError({
      email: '',
      password: '',
      general: message,
    });
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.subheading}>Log in to Ensemble</Text>

        <Text style={styles.label}>EMAIL</Text>
        <TextInput
          style={styles.input}
          placeholder="name@domain.com"
          placeholderTextColor="#6B6F73"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {error.email ? (
          <Text style={[styles.errorMessage, styles.errorText]}>{error.email}</Text>
        ) : null}

        <View>
          <Text style={styles.label}>PASSWORD</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor="#6B6F73"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={hidePassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setHidePassword(!hidePassword)} style={styles.eyeIconButton}>
              <MaterialIcons 
                name={hidePassword ? 'visibility-off' : 'visibility'} 
                size={20} 
                color={Colors.dark.tint}
              />
            </TouchableOpacity>
          </View>
          {error.password ? (
            <Text style={[styles.errorMessage, styles.errorText]}>{error.password}</Text>
          ) : null}
        <TouchableOpacity onPress={handleForgot} style={styles.forgotWrapInline} activeOpacity={0.6}>
            <Text style={styles.forgot}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {error.general ? (
          <Text style={[styles.errorMessage, styles.errorText]}>{error.general}</Text>
        ) : isSuccess ? (
          <Text style={[styles.errorMessage, styles.successText]}>Login successful!</Text>
        ) : null}

        <TouchableOpacity style={[styles.loginButton, loading && styles.loginButtonDisabled]} onPress={handleLogin} activeOpacity={0.8} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color="#111113" /> : null}
          <Text style={[styles.loginButtonText, loading ? { marginLeft: 8 } : null]}>{loading ? 'Logging in...' : 'Log In'}</Text>
        </TouchableOpacity>

        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR CONTINUE WITH</Text>
          <View style={styles.orLine} />
        </View>

        <ContinueWithGoogle 
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          disabled={loading}
        />

        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {"Don't have an account? "}
            <Text style={styles.signUp} onPress={() => router.push('/auth/signup')} suppressHighlighting={false}>
              Sign Up
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111113',
    paddingHorizontal: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  content: {
    marginTop: 24,
    paddingBottom: 24,
  },
  heading: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  subheading: {
    color: Colors.dark.icon,
    marginBottom: 20,
  },
  label: {
    color: Colors.dark.icon,
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#131315',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: Colors.dark.text,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#2A2A2C',
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131315',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#2A2A2C',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    color: Colors.dark.text,
    fontSize: 16,
  },
  eyeIconButton: {
    padding: 8,
    marginLeft: 8,
  },
  forgotWrapInline: {
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  forgot: {
    color: Colors.dark.tint,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: Colors.dark.tint,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: '#111113',
    fontWeight: '700',
    fontSize: 16,
  },
  loginButtonDisabled: {
    opacity: 0.85,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1F1F21',
  },
  orText: {
    color: Colors.dark.icon,
    marginHorizontal: 12,
    fontSize: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151515',
    paddingVertical: 12,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#2A2A2C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    resizeMode: 'contain',
  },
  socialText: {
    color: Colors.dark.text,
    fontWeight: '600',
    fontSize: 15,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    color: Colors.dark.icon,
  },
  signUp: {
    color: Colors.dark.tint,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  errorMessage: {
    fontSize: 13,
    marginBottom: 12,
    marginTop: -8,
    fontWeight: '500',
  },
  errorText: {
    color: '#FF6B6B',
  },
  successText: {
    color: '#51CF66',
  },
});