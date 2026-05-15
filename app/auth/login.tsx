import ContinueWithGoogle from '@/components/continue-with-google';
import { Colors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { signIn, signInOauth } from '../../function/user';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState({
    email: '',
    password: '',
    general: '',
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateInput = () => {
    let isValid = true;
    if (!email && !password) {
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
      setError(prev => ({ ...prev, password: 'Must be at least 6 characters' }));
      isValid = false;
    } else {
      setError(prev => ({ ...prev, password: '' }));
    }

    return isValid;
  };

  const handleLogin = () => {
    if (!validateInput()) return;

    setLoading(true);
    setError({ email: '', password: '', general: '' });
    setIsSuccess(false);

    signIn(email, password)
      .then((response: any) => {
        if (response.status === 200) {
          setIsSuccess(true);
          setTimeout(() => router.push('/(tabs)'), 1000);
        } else {
          setError({
            email: '',
            password: '',
            general: response.error || 'Invalid email or password',
          });
        }
      })
      .catch(() => {
        setError({ email: '', password: '', general: 'Error logging in' });
      })
      .finally(() => setLoading(false));
  };

  const handleForgot = () => {
    // @ts-ignore
      router.push('/auth/forgot-password');
  };

  const handleGoogleSuccess = (userInfo: any) => {
    setLoading(true);
    setError({ email: '', password: '', general: '' });

    signInOauth(userInfo.data)
      .then((response: any) => {
        if (response.status === 200) {
          setIsSuccess(true);
          setTimeout(() => router.push('/(tabs)'), 1000);
        } else {
          setError({ email: '', password: '', general: response.error || 'Error signing in with Google' });
        }
      })
      .catch(() => {
        setError({ email: '', password: '', general: 'Error signing in with Google' });
      })
      .finally(() => setLoading(false));
  };

  const handleGoogleError = (message: string) => {
    setLoading(false);
    setError({ email: '', password: '', general: message });
  };

  return (
    <LinearGradient colors={['#080a12', '#0d1117', '#090B10']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ],
                }
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                  <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Welcome Back</Text>
                <View style={{ width: 36 }} />
              </View>

              {/* Title Section */}
              <View style={styles.titleSection}>
                <Text style={styles.title}>Log in</Text>
                <Text style={styles.subtitle}>Continue your creative journey</Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputWrapperFocused]}>
                    <MaterialIcons name="mail-outline" size={18} color="#7E8798" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="name@ensemble.com"
                      placeholderTextColor="#6B6F73"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {error.email ? <Text style={styles.fieldError}>{error.email}</Text> : null}
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={[styles.inputWrapper, focusedField === 'password' && styles.inputWrapperFocused]}>
                    <MaterialIcons name="lock-outline" size={18} color="#7E8798" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor="#6B6F73"
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      secureTextEntry={hidePassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setHidePassword(!hidePassword)} style={styles.eyeIcon}>
                      <MaterialIcons name={hidePassword ? 'visibility-off' : 'visibility'} size={18} color="#7E8798" />
                    </TouchableOpacity>
                  </View>
                  {error.password ? <Text style={styles.fieldError}>{error.password}</Text> : null}
                </View>

                {/* Forgot Password */}
                <TouchableOpacity onPress={handleForgot} style={styles.forgotContainer}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>

                {/* Error/Success Message */}
                {error.general ? (
                  <View style={styles.errorBox}>
                    <MaterialIcons name="error-outline" size={18} color="#EF4444" />
                    <Text style={styles.errorMessage}>{error.general}</Text>
                  </View>
                ) : isSuccess ? (
                  <View style={styles.successBox}>
                    <MaterialIcons name="check-circle" size={18} color="#10B981" />
                    <Text style={styles.successMessage}>Login successful!</Text>
                  </View>
                ) : null}

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#041117" />
                  ) : (
                    <Text style={styles.loginButtonText}>LOG IN</Text>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.orRow}>
                  <View style={styles.orLine} />
                  <Text style={styles.orText}>OR</Text>
                  <View style={styles.orLine} />
                </View>

                {/* Google Login */}
                <ContinueWithGoogle
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  disabled={loading}
                />

                {/* Sign Up Link */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    Don&#39;t have an account?{' '}
                    <Text style={styles.signUpText} onPress={() => router.push('/auth/signup')}>
                      Sign Up
                    </Text>
                  </Text>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  content: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  titleSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#7E8798',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#8A93A3',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11151C',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1B2230',
    paddingHorizontal: 14,
  },
  inputWrapperFocused: {
    borderColor: '#00D1FF',
    backgroundColor: '#0D3341',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#F4F8FF',
    fontSize: 15,
    paddingVertical: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  fieldError: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 6,
    marginLeft: 4,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#00D1FF',
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  errorMessage: {
    color: '#EF4444',
    fontSize: 13,
    flex: 1,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  successMessage: {
    color: '#10B981',
    fontSize: 13,
    flex: 1,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  loginButton: {
    backgroundColor: '#00D1FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#00D1FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: '#041117',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1B2230',
  },
  orText: {
    color: '#7E8798',
    marginHorizontal: 12,
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#7E8798',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  signUpText: {
    color: '#00D1FF',
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
});