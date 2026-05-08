import { AppTitle } from '@/components/app-title';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Animated, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const CAROUSEL_IMAGES = [
    require('@/assets/get_started.png'),
    require('@/assets/get_started.png'),
    require('@/assets/get_started.png'),
];

const CAROUSEL_INTERVAL = 3000;

GoogleSignin.configure({
  webClientId: '87436960116-ne8o4s06rdt35oni873all5s4lanvh1t.apps.googleusercontent.com',
    offlineAccess: true,
    forceCodeForRefreshToken: true,
});
export default function GetStarted() {

    const colorScheme = useColorScheme();
    const [currentSlide, setCurrentSlide] = useState(0);
    const dotAnim = useRef(new Animated.Value(0)).current;
    const router = useRouter();
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
        }, CAROUSEL_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        Animated.timing(dotAnim, {
            toValue: currentSlide,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [currentSlide]);

    const handleSignUp = () => {
        router.push('/auth/signup');
    };

    const handleLogIn = async() => {
        router.push('/auth/login');
    };

    const handleGuest = () => {
        // Continue as guest
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: Colors.dark.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <AppTitle size="sm" />
                    <TouchableOpacity style={styles.helpIcon}>
                        <Text style={styles.helpText}>?</Text>
                    </TouchableOpacity>
                </View>

                {/* Carousel */}
                <View style={styles.carouselContainer}>
                    <Image
                        source={CAROUSEL_IMAGES[currentSlide]}
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
                                    backgroundColor:
                                        index === currentSlide ? Colors.dark.tint : Colors.dark.icon,
                                },
                            ]}
                        />
                    ))}
                </View>

                {/* Content */}
                <View style={styles.contentSection}>
                    <Text style={styles.mainHeading}>Your edit suite, your community.</Text>
                    <Text style={styles.description}>
                        Create breathtaking content with pro-grade AI tools and collaborate with creators worldwide in real-time.
                    </Text>
                </View>

                {/* Buttons */}
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.signUpButton]}
                        onPress={handleSignUp}
                    >
                        <Text style={styles.signUpButtonText}>Sign Up</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.logInButton]}
                        onPress={handleLogIn}
                    >
                        <Text style={styles.logInButtonText}>Log In</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleGuest}>
                        <Text style={styles.guestText}>Continue as guest</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 32,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.dark.text,
    },
    helpIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.dark.icon,
        alignItems: 'center',
        justifyContent: 'center',
    },
    helpText: {
        color: Colors.dark.icon,
        fontSize: 16,
    },
    carouselContainer: {
        height: 280,
        marginBottom: 24,
        borderRadius: 16,
        overflow: 'hidden',
    },
    carouselImage: {
        width: '100%',
        height: '100%',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    contentSection: {
        marginBottom: 32,
    },
    mainHeading: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.dark.text,
        marginBottom: 12,
        lineHeight: 36,
    },
    description: {
        fontSize: 14,
        color: Colors.dark.icon,
        lineHeight: 20,
    },
    buttonsContainer: {
        gap: 12,
        marginBottom: 24,
    },
    button: {
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signUpButton: {
        backgroundColor: Colors.dark.tint,
    },
    signUpButtonText: {
        color: Colors.dark.background,
        fontSize: 16,
        fontWeight: '600',
    },
    logInButton: {
        backgroundColor: '#2A2A32',
        borderWidth: 1,
        borderColor: Colors.dark.icon,
    },
    logInButtonText: {
        color: Colors.dark.text,
        fontSize: 16,
        fontWeight: '600',
    },
    guestText: {
        textAlign: 'center',
        color: Colors.dark.icon,
        fontSize: 14,
        marginTop: 8,
    },
});
