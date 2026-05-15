import ContinueWithGoogle from '@/components/continue-with-google';
import { Colors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { signInOauth, signUp, createUser, getUserByUsername, getUserByEmail } from '../../function/user';

export default function SignUp() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

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

  const validateForm = async () => {
    const nextErrors = {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (!fullName.trim()) nextErrors.fullName = 'Full name is required';
    if (!username.trim()) {
      nextErrors.username = 'Username is required';
    } else {
      const user = await getUserByUsername(username);
      if (user.status === 200) {
        nextErrors.username = 'Username is already taken';
      }
    }
    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = 'Email is invalid';
    } else {
      const user = await getUserByEmail(email);
      if (user.status === 200) {
        nextErrors.email = 'Email is already registered';
      }
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 6) {
      nextErrors.password = 'Must be at least 6 characters';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return !Object.values(nextErrors).some((value) => value);
  };

  const handleCreateAccount = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      setLoading(true);
      setMessage('');
      setIsSuccess(false);

      const response = await signUp(email, password);

      if (response.user) {
        await createUser({
          uid: response.user.uid,
          email: response.user.email,
          fullName,
          username,
        });

        setIsSuccess(true);
        setMessage('Account created successfully!');
        setTimeout(() => router.push('/auth/login'), 1500);
      }
    } catch (error) {
      console.log(error);
      setIsSuccess(false);
      setMessage('Error creating account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (userInfo: any) => {
    try {
      setLoading(true);
      setMessage('');
      setIsSuccess(false);
      signInOauth(userInfo.data)
        .then((response: any) => {
          if (response.status === 200) {
            setIsSuccess(true);
            setMessage('Signed in successfully!');
            setTimeout(() => router.push('/(tabs)'), 1000);
          } else {
            setIsSuccess(false);
            setMessage(response.error || 'Error signing in with Google');
          }
        })
        .catch(() => {
          setIsSuccess(false);
          setMessage('Error signing in with Google');
        })
        .finally(() => setLoading(false));
    } catch (error) {
      setIsSuccess(false);
      setMessage('Error signing in with Google');
      setLoading(false);
    }
  };

  const handleGoogleError = (message: string) => {
    setLoading(false);
    setIsSuccess(false);
    setMessage(message);
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
                <Text style={styles.headerTitle}>Join Ensemble</Text>
                <View style={{ width: 36 }} />
              </View>

              {/* Title Section */}
              <View style={styles.titleSection}>
                <Text style={styles.title}>Sign Up</Text>
                <Text style={styles.subtitle}>Start your creative journey</Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <View style={[styles.inputWrapper, focusedField === 'fullName' && styles.inputWrapperFocused]}>
                    <MaterialIcons name="person-outline" size={18} color="#7E8798" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      placeholderTextColor="#6B6F73"
                      value={fullName}
                      onChangeText={(text) => {
                        setFullName(text);
                        setErrors((prev) => ({ ...prev, fullName: '' }));
                      }}
                      onFocus={() => setFocusedField('fullName')}
                      onBlur={() => setFocusedField(null)}
                      autoCapitalize="words"
                    />
                  </View>
                  {errors.fullName ? <Text style={styles.fieldError}>{errors.fullName}</Text> : null}
                </View>

                {/* Username */}
                <View style={styles.inputGroup}>
                  <View style={[styles.inputWrapper, focusedField === 'username' && styles.inputWrapperFocused]}>
                    <MaterialIcons name="alternate-email" size={18} color="#7E8798" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Username"
                      placeholderTextColor="#6B6F73"
                      value={username}
                      onChangeText={(text) => {
                        setUsername(text);
                        setErrors((prev) => ({ ...prev, username: '' }));
                      }}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      autoCapitalize="none"
                    />
                  </View>
                  {errors.username ? <Text style={styles.fieldError}>{errors.username}</Text> : null}
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputWrapperFocused]}>
                    <MaterialIcons name="mail-outline" size={18} color="#7E8798" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="#6B6F73"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <View style={[styles.inputWrapper, focusedField === 'password' && styles.inputWrapperFocused]}>
                    <MaterialIcons name="lock-outline" size={18} color="#7E8798" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#6B6F73"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        setErrors((prev) => ({ ...prev, password: '' }));
                      }}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      secureTextEntry={hidePassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setHidePassword(!hidePassword)} style={styles.eyeIcon}>
                      <MaterialIcons name={hidePassword ? 'visibility-off' : 'visibility'} size={18} color="#7E8798" />
                    </TouchableOpacity>
                  </View>
                  {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <View style={[styles.inputWrapper, focusedField === 'confirmPassword' && styles.inputWrapperFocused]}>
                    <MaterialIcons name="lock-outline" size={18} color="#7E8798" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm Password"
                      placeholderTextColor="#6B6F73"
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                      }}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      secureTextEntry={hideConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setHideConfirmPassword(!hideConfirmPassword)} style={styles.eyeIcon}>
                      <MaterialIcons name={hideConfirmPassword ? 'visibility-off' : 'visibility'} size={18} color="#7E8798" />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword ? <Text style={styles.fieldError}>{errors.confirmPassword}</Text> : null}
                </View>

                {/* Message */}
                {message ? (
                  <View style={[styles.messageBox, isSuccess ? styles.successBox : styles.errorBox]}>
                    <MaterialIcons name={isSuccess ? 'check-circle' : 'error-outline'} size={16} color={isSuccess ? '#10B981' : '#EF4444'} />
                    <Text style={[styles.messageText, isSuccess ? styles.successText : styles.errorText]}>{message}</Text>
                  </View>
                ) : null}

                {/* Create Button */}
                <TouchableOpacity
                  style={[styles.createButton, loading && styles.disabledButton]}
                  onPress={handleCreateAccount}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#041117" />
                  ) : (
                    <Text style={styles.createButtonText}>SIGN UP</Text>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.orRow}>
                  <View style={styles.orLine} />
                  <Text style={styles.orText}>OR</Text>
                  <View style={styles.orLine} />
                </View>

                {/* Google Sign Up */}
                <ContinueWithGoogle
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  disabled={loading}
                />

                {/* Sign In Link */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    Already have an account?{' '}
                    <Text style={styles.signInText} onPress={() => router.push('/auth/login')}>
                      Sign In
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
    paddingVertical: 16,
  },
  content: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    marginBottom: 6,
  },
  subtitle: {
    color: '#7E8798',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 12,
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
    fontSize: 14,
    paddingVertical: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  fieldError: {
    color: '#EF4444',
    fontSize: 10,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  messageText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  successText: {
    color: '#10B981',
  },
  errorText: {
    color: '#EF4444',
  },
  createButton: {
    backgroundColor: '#00D1FF',
    paddingVertical: 12,
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
  createButtonText: {
    color: '#041117',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 1,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
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
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#7E8798',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  signInText: {
    color: '#00D1FF',
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  securityCard: {
    marginTop: 16,
    backgroundColor: '#11151C',
    borderWidth: 1,
    borderColor: '#1B2230',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    gap: 10,
  },
  shieldWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 209, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTextWrap: {
    flex: 1,
  },
  securityTitle: {
    color: '#00D1FF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  securityText: {
    color: '#8A93A3',
    fontSize: 10,
    lineHeight: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
});