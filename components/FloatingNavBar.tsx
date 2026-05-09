// components/FloatingNavBar.tsx
import { router, usePathname } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  Dimensions,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

interface NavItem {
  id: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: string;
  color: string;
}

const navItems: NavItem[] = [
  { id: '1', label: 'Home', icon: 'home', route: '/', color: '#00D1FF' },
  { id: '2', label: 'Market', icon: 'store', route: '/store', color: '#A855F7' },
  { id: '3', label: 'Postings', icon: 'work', route: '/jobs', color: '#F59E0B' },
  { id: '4', label: 'Projects', icon: 'folder', route: '/projects', color: '#10B981' },
  { id: '5', label: 'Forums', icon: 'forum', route: '/messages', color: '#EF4444' },
  { id: '6', label: 'Profile', icon: 'person', route: '/profile', color: '#EC4899' },
];

export default function FloatingNavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const pathname = usePathname();

  // Get current active item
  const getActiveItem = (): NavItem => {
    const activeItem = navItems.find(item => {
      if (item.route === '/') {
        return pathname === '/';
      }
      return pathname.startsWith(item.route);
    });
    return activeItem || navItems[0]; // Default to Home if none found
  };

  const activeItem = getActiveItem();

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(animation, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 6,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1.1,
          useNativeDriver: true,
          tension: 80,
          friction: 4,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(animation, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 6,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 4,
        }),
      ]).start();
    }
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    if (isOpen) setIsOpen(false);
  };

  const navigateTo = (route: string) => {
    setIsOpen(false);
    setTimeout(() => {
      router.push(route as any);
    }, 150);
  };

  const menuRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '135deg'],
  });

  const getPosition = (index: number, total: number) => {
    const startAngle = -180;
    const endAngle = 0;
    const angleStep = (endAngle - startAngle) / (total - 1);
    const angleDeg = startAngle + angleStep * index;
    const angleRad = angleDeg * (Math.PI / 180);

    const radius = 130;
    const x = Math.cos(angleRad) * radius;
    const y = Math.sin(angleRad) * radius;

    return { x, y, angleDeg };
  };

  const isActiveRoute = (route: string) => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  };

  const useButtonAnimation = () => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    const onPressIn = () => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.92,
          useNativeDriver: true,
          tension: 200,
          friction: 5,
        }),
        Animated.spring(glowAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 5,
        }),
      ]).start();
    };

    const onPressOut = () => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 5,
        }),
        Animated.spring(glowAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 200,
          friction: 5,
        }),
      ]).start();
    };

    return { scaleAnim, glowAnim, onPressIn, onPressOut };
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <TouchableWithoutFeedback onPress={closeMenu}>
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity: fadeAnim,
              },
            ]}
          />
        </TouchableWithoutFeedback>
      )}

      {/* Menu Items - Circular Buttons */}
      {navItems.map((item, index) => {
        const { x, y } = getPosition(index, navItems.length);
        const { scaleAnim, glowAnim, onPressIn, onPressOut } = useButtonAnimation();
        const active = isActiveRoute(item.route);

        const translateX = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, x],
        });
        const translateY = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, y],
        });
        const scale = animation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0.5, 1],
        });
        const opacity = animation.interpolate({
          inputRange: [0, 0.6, 1],
          outputRange: [0, 0.5, 1],
        });

        const glowOpacity = glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.4],
        });

        return (
          <Animated.View
            key={item.id}
            style={[
              styles.menuItem,
              {
                transform: [{ translateX }, { translateY }, { scale }],
                opacity,
              },
            ]}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Pressable
                onPress={() => navigateTo(item.route)}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                style={({ pressed }) => [
                  styles.menuButton,
                  { backgroundColor: active ? item.color : 'rgba(30, 35, 50, 0.95)' },
                  active && styles.activeButton,
                  pressed && styles.pressedButton,
                ]}
              >
                <Animated.View
                  style={[
                    styles.buttonGlow,
                    {
                      opacity: glowOpacity,
                      backgroundColor: item.color,
                    },
                  ]}
                />
                <MaterialIcons
                  name={item.icon}
                  size={active ? 28 : 24}
                  color={active ? '#FFFFFF' : item.color}
                />
                <Text
                  style={[
                    styles.menuLabel,
                    active && styles.activeLabel,
                    { color: active ? '#FFFFFF' : item.color },
                  ]}
                >
                  {item.label}
                </Text>
                {active && <View style={[styles.activeIndicator, { backgroundColor: item.color }]} />}
              </Pressable>
            </Animated.View>
          </Animated.View>
        );
      })}

      {/* Center FAB Button - Shows active icon with clean circular design */}
      <View style={styles.fabContainer}>
        <Pressable
          onPress={toggleMenu}
          style={({ pressed }) => [
            styles.fabPressable,
            pressed && styles.fabPressed,
          ]}
        >
          <Animated.View
            style={[
              styles.fabButton,
              {
                backgroundColor: activeItem.color,
                transform: [{ rotate: menuRotation }, { scale: buttonScale }],
              },
            ]}
          >
            {!isOpen ? (
              <MaterialIcons name={activeItem.icon} size={32} color="#FFFFFF" />
            ) : (
              <MaterialIcons name="close" size={32} color="#FFFFFF" />
            )}
          </Animated.View>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 998,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    zIndex: 1000,
  },
  fabPressable: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden', // This ensures no square edges show
  },
  fabPressed: {
    opacity: 0.9,
  },
  fabButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    zIndex: 999,
  },
  menuButton: {
    position: 'relative',
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 35,
  },
  pressedButton: {
    transform: [{ scale: 0.96 }],
  },
  activeButton: {
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  menuLabel: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textAlign: 'center',
    marginTop: 2,
  },
  activeLabel: {
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 8,
    width: 24,
    height: 3,
    borderRadius: 1.5,
  },
});