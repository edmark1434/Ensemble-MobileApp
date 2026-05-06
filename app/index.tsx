import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useRef } from 'react';
import { Animated, ImageBackground, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function App() {
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const loadingWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(loadingWidth, {
                    toValue: 100,
                    duration: 2000,
                    useNativeDriver: false,
                }),
                Animated.timing(loadingWidth, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: false,
                }),
            ])
        ).start();
    }, []);

    return (
        <ImageBackground
            source={require('@/assets/camera.png')}
            style={styles.backgroundImage}
        >
            <SafeAreaView style={[styles.container, { backgroundColor: 'rgba(26, 26, 30, 0.85)' }]}>
                <View style={styles.content}>
                    <Text style={styles.title}>Ensemble</Text>
                    <Text style={styles.subtitle}>WHERE EDITORS COLLABORATE</Text>
                </View>

                <View style={styles.loadingContainer}>
                    <Animated.View
                        style={[
                            styles.loadingBar,
                            {
                                width: loadingWidth.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: ['0%', '100%'],
                                }),
                            },
                        ]}
                    />
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        backgroundColor: 'rgba(26, 26, 30, 0.85)',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 60,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 48,
        fontWeight: '700',
        color: Colors.dark.text,
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 12,
        color: Colors.dark.icon,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    loadingContainer: {
        width: '30%',
        height: 3,
        backgroundColor: Colors.dark.icon,
        borderRadius: 2,
        overflow: 'hidden',
    },
    loadingBar: {
        height: '100%',
        backgroundColor: Colors.dark.tint,
        borderRadius: 2,
    },
});