import { AppTitle } from '@/components/app-title';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useRef, useEffect, useCallback } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import FloatingNavBar from '@/components/FloatingNavBar';

const projects = [
  { id: '1', title: 'Cyberpunk_Teaser_V3', progress: 65, status: 'In Progress', image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80' },
  { id: '2', title: 'Urban_Soul_Music_Video', progress: 90, status: 'Review', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80' },
  { id: '3', title: 'Summer_Festival_Wrap', progress: 100, status: 'Completed', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80' },
];

export default function ProjectsScreen() {
  // Animation values
  const pageFadeAnim = useRef(new Animated.Value(0)).current;
  const pageSlideAnim = useRef(new Animated.Value(50)).current;
  const pageScaleAnim = useRef(new Animated.Value(0.95)).current;

  // Animate page entrance
  useEffect(() => {
    Animated.parallel([
      Animated.timing(pageFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(pageSlideAnim, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(pageScaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Re-animate when page comes into focus (from nav bar)
  useFocusEffect(
    useCallback(() => {
      pageFadeAnim.setValue(0);
      pageSlideAnim.setValue(50);
      pageScaleAnim.setValue(0.95);

      Animated.parallel([
        Animated.timing(pageFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(pageSlideAnim, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(pageScaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }, [])
  );

  return (
    <Animated.View
      style={[
        styles.screen,
        {
          opacity: pageFadeAnim,
          transform: [
            { translateY: pageSlideAnim },
            { scale: pageScaleAnim }
          ],
        }
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <AppTitle size="sm" />
            <Pressable style={styles.newButton}>
              <Text style={styles.newButtonText}>New +</Text>
            </Pressable>
          </View>

          {/* Page Title */}
          <Text style={styles.title}>Projects</Text>

          {/* Tabs */}
          <View style={styles.tabRow}>
            <Text style={[styles.tabText, styles.tabTextActive]}>My Projects</Text>
            <Text style={styles.tabText}>Shared</Text>
            <Text style={styles.tabText}>Archived</Text>
          </View>

          {/* Projects List */}
          {projects.map((project) => (
            <View key={project.id} style={styles.projectCard}>
              <Image source={{ uri: project.image }} style={styles.projectImage} />
              <View style={styles.projectBody}>
                <View style={styles.projectTopRow}>
                  <Text style={styles.projectTitle}>{project.title}</Text>
                  <View style={[styles.statusPill, project.status === 'Completed' && styles.statusPillComplete]}>
                    <Text style={styles.statusText}>{project.status}</Text>
                  </View>
                </View>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressValue}>{project.progress}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
                </View>
                <View style={styles.projectFooter}>
                  <View style={styles.memberRow}>
                    <View style={styles.memberBubble} />
                    <View style={styles.memberBubble} />
                    <View style={styles.memberBubble} />
                  </View>
                  <MaterialIcons name="more-horiz" size={18} color="#718099" />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* Floating Navigation Bar */}
      <FloatingNavBar />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#090B10'
  },
  safeArea: {
    flex: 1
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    color: '#F4F8FF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 16,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  newButton: {
    backgroundColor: '#15C8FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  newButtonText: {
    color: '#041117',
    fontWeight: '900',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_900Black',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16
  },
  tabText: {
    color: '#718099',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  tabTextActive: {
    color: '#15C8FF'
  },
  projectCard: {
    backgroundColor: '#11151C',
    borderWidth: 1,
    borderColor: '#1B2230',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12
  },
  projectImage: {
    width: '100%',
    height: 130
  },
  projectBody: {
    padding: 14
  },
  projectTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10
  },
  projectTitle: {
    color: '#F4F8FF',
    fontSize: 15,
    fontWeight: '900',
    flex: 1,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  statusPill: {
    backgroundColor: '#0E2230',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  statusPillComplete: {
    backgroundColor: '#113126'
  },
  statusText: {
    color: '#15C8FF',
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  progressLabel: {
    color: '#8A93A3',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  progressValue: {
    color: '#F4F8FF',
    fontWeight: '800',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#1B2230',
    borderRadius: 999,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#15C8FF'
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12
  },
  memberRow: {
    flexDirection: 'row'
  },
  memberBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#15C8FF',
    marginLeft: -6,
    borderWidth: 2,
    borderColor: '#11151C'
  },
});