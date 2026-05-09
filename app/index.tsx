import { AppTitle } from '@/components/app-title';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from 'react-native';

const { width, height } = Dimensions.get('window');

const CAROUSEL_IMAGES = [
  'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
];

const CAROUSEL_INTERVAL = 4000;

if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId: process.env.WEB_CLIENT_ID,
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
}

export default function GetStarted() {
  const colorScheme = useColorScheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Floating background animations
  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;
  const blob3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Page entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
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

    // Carousel auto-play
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, CAROUSEL_INTERVAL);

    // Floating background animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(blob1Anim, { toValue: 1, duration: 8000, useNativeDriver: true }),
        Animated.timing(blob1Anim, { toValue: 0, duration: 8000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blob2Anim, { toValue: 1, duration: 10000, useNativeDriver: true }),
        Animated.timing(blob2Anim, { toValue: 0, duration: 10000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blob3Anim, { toValue: 1, duration: 12000, useNativeDriver: true }),
        Animated.timing(blob3Anim, { toValue: 0, duration: 12000, useNativeDriver: true }),
      ])
    ).start();

    return () => clearInterval(interval);
  }, []);

  // Interpolations for floating blobs
  const blob1TranslateX = blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 20] });
  const blob1TranslateY = blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [-30, 30] });
  const blob1Scale = blob1Anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.1, 1] });

  const blob2TranslateX = blob2Anim.interpolate({ inputRange: [0, 1], outputRange: [30, -30] });
  const blob2TranslateY = blob2Anim.interpolate({ inputRange: [0, 1], outputRange: [20, -20] });
  const blob2Scale = blob2Anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.2, 1] });

  const blob3TranslateX = blob3Anim.interpolate({ inputRange: [0, 1], outputRange: [-15, 25] });
  const blob3TranslateY = blob3Anim.interpolate({ inputRange: [0, 1], outputRange: [25, -15] });

  const handleSignUp = () => router.push('/auth/signup');
  const handleLogIn = () => router.push('/auth/login');
  const handleGuest = () => router.push('/(tabs)');

  return (
    <LinearGradient colors={['#080a12', '#0d1117', '#090B10']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={{
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
          }}
        >
          {/* Floating Background Blobs */}
          <Animated.View style={[styles.blob, styles.blob1, { transform: [{ translateX: blob1TranslateX }, { translateY: blob1TranslateY }, { scale: blob1Scale }] }]} />
          <Animated.View style={[styles.blob, styles.blob2, { transform: [{ translateX: blob2TranslateX }, { translateY: blob2TranslateY }, { scale: blob2Scale }] }]} />
          <Animated.View style={[styles.blob, styles.blob3, { transform: [{ translateX: blob3TranslateX }, { translateY: blob3TranslateY }] }]} />

          {/* Header */}
          <View style={styles.header}>
            <AppTitle size="sm" />
            <TouchableOpacity style={styles.helpIcon}>
              <Text style={styles.helpText}>?</Text>
            </TouchableOpacity>
          </View>

          {/* Hero Content */}
          <View style={styles.heroSection}>
            <Text style={styles.tagline}>WELCOME TO ENSEMBLE</Text>
            <Text style={styles.mainHeading}>Collaborative Video Editing & Creative Marketplace</Text>
            <Text style={styles.description}>
              Edit a video with friends or colleagues or hire a skilled editor directly in the platform.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={[styles.button, styles.signUpButton]} onPress={handleSignUp}>
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.logInButton]} onPress={handleLogIn}>
              <Text style={styles.logInButtonText}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleGuest}>
              <Text style={styles.guestText}>Continue as guest</Text>
            </TouchableOpacity>
          </View>

          {/* Carousel Section at Bottom */}
          <View style={styles.carouselSection}>
            <Text style={styles.carouselTitle}>Featured Work</Text>

            <View style={styles.carouselContainer}>
              <Image
                source={{ uri: CAROUSEL_IMAGES[currentSlide] }}
                style={styles.carouselImage}
                resizeMode="cover"
              />
            </View>

            {/* Carousel Indicators */}
            <View style={styles.dotsContainer}>
              {CAROUSEL_IMAGES.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: index === currentSlide ? '#00D1FF' : 'rgba(255,255,255,0.2)',
                      width: index === currentSlide ? 24 : 6,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </Animated.ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  // Floating Blobs
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  blob1: {
    width: 200,
    height: 200,
    backgroundColor: '#00D1FF',
    top: '15%',
    left: '-30%',
  },
  blob2: {
    width: 250,
    height: 250,
    backgroundColor: '#A855F7',
    bottom: '30%',
    right: '-40%',
  },
  blob3: {
    width: 150,
    height: 150,
    backgroundColor: '#F59E0B',
    top: '50%',
    right: '-20%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
    zIndex: 10,
  },
  helpIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  helpText: {
    color: '#7E8798',
    fontSize: 16,
    fontWeight: '600',
  },
  heroSection: {
    marginBottom: 40,
    zIndex: 10,
  },
  tagline: {
    fontSize: 13,
    color: '#00D1FF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  mainHeading: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 42,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  description: {
    fontSize: 15,
    color: '#7E8798',
    lineHeight: 22,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  buttonsContainer: {
    gap: 12,
    marginBottom: 48,
    zIndex: 10,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButton: {
    backgroundColor: '#00D1FF',
    shadowColor: '#00D1FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signUpButtonText: {
    color: '#041117',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  logInButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  logInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  guestText: {
    textAlign: 'center',
    color: '#7E8798',
    fontSize: 14,
    marginTop: 8,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  carouselSection: {
    marginTop: 20,
    zIndex: 10,
  },
  carouselTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  carouselContainer: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    transition: 'width 0.3s ease',
  },
});