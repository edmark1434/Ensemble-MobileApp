import { AppTitle } from '@/components/app-title';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useRef, useEffect, useCallback } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View, SafeAreaView, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import FloatingNavBar from '@/components/FloatingNavBar';

type Project = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  progress: number;
  members: string[];
};

type Asset = {
  id: string;
  name: string;
  category: string;
  price: string;
  preview: string;
};

type Gig = {
  id: string;
  title: string;
  detail: string;
  rate: string;
  icon: string;
};

type CommunityPick = {
  id: string;
  name: string;
  tag: string;
  preview: string;
};

const activeProjects: Project[] = [
  {
    id: '1',
    title: 'Cyberpunk Short Film',
    subtitle: 'VFX & compositing stage',
    badge: 'Priority',
    progress: 85,
    members: ['A', 'M', '+12'],
  },
  {
    id: '2',
    title: 'Brand launch reel',
    subtitle: 'Motion design / edit pass',
    badge: 'Review',
    progress: 62,
    members: ['S', 'D', '+6'],
  },
  {
    id: '3',
    title: 'Studio intro package',
    subtitle: '3D scene polish & lighting',
    badge: 'On track',
    progress: 44,
    members: ['K', 'J', '+4'],
  },
];

const trendingAssets: Asset[] = [
  {
    id: '1',
    name: 'Neon City Kit v2',
    category: '4.2 GB • $24.00',
    price: '$24',
    preview:
      'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '2',
    name: 'Liquid Metal Pack',
    category: '1.8 GB • $18.00',
    price: '$18',
    preview:
      'https://images.unsplash.com/photo-1520454974749-611b7248ffdb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '3',
    name: 'Title FX Bundle',
    category: '860 MB • $12.00',
    price: '$12',
    preview:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  },
];

const latestGigs: Gig[] = [
  {
    id: '1',
    title: 'Video Editor Needed',
    detail: 'Short-form social content • 3 clips/day',
    rate: '$45/hr',
    icon: 'movie-edit',
  },
  {
    id: '2',
    title: '3D Environment Artist',
    detail: 'Urban scene look-dev + render passes',
    rate: '$2,500',
    icon: 'view-in-ar',
  },
  {
    id: '3',
    title: 'Motion Graphics Designer',
    detail: 'Brand package for launch campaign',
    rate: '$90/hr',
    icon: 'animation',
  },
];

const communityPicks: CommunityPick[] = [
  {
    id: '1',
    name: 'Node_Graph',
    tag: 'Shader study',
    preview:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '2',
    name: 'Brix_Flow',
    tag: 'Lighting pass',
    preview:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '3',
    name: 'Nova_Frame',
    tag: 'Motion breakdown',
    preview:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  },
];

const quickActions = [
  { id: '1', label: 'Explore Assets', icon: 'search' },
  { id: '2', label: 'Find Gigs', icon: 'work-outline' },
  { id: '3', label: 'New Project', icon: 'add-box' },
];

export default function HomeScreen() {
  const memberColors = useMemo(() => ['#00D1FF', '#F4C95D', '#FF6B6B', '#6BE39A'], []);

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

  // Re-animate when page comes into focus
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
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.glowTopLeft} />
          <View style={styles.glowTopRight} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <AppTitle size="sm" />
              <Text style={styles.greeting}>Creative workbench for your studio flow</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable style={styles.iconButton} onPress={() => router.push('/')}>
                <MaterialIcons name="notifications-none" size={20} color="#E7F2FF" />
              </Pressable>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' }}
                style={styles.avatar}
              />
            </View>
          </View>

          {/* Welcome Banner */}
          <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeCard}
          >
            <Text style={styles.welcomeTitle}>Welcome, User!</Text>
            <Text style={styles.welcomeSubtitle}>Your Complete Video Editing Ecosystem</Text>
            <Text style={styles.welcomeDescription}>
              Find job posts or services, buy assets, collaborate and connect with talented video editors or clients.
            </Text>
            <View style={styles.welcomeDivider} />
            <View style={styles.welcomeDots}>
              <View style={[styles.dot, styles.dotCyan]} />
              <View style={[styles.dot, styles.dotYellow]} />
              <View style={[styles.dot, styles.dotPurple]} />
            </View>
          </LinearGradient>

          <View style={styles.searchRow}>
            {quickActions.map((action) => (
              <Pressable key={action.id} style={styles.searchChip} onPress={() => {}}>
                <MaterialIcons name={action.icon as any} size={16} color="#00D1FF" />
                <Text style={styles.searchChipText}>{action.label}</Text>
              </Pressable>
            ))}
          </View>

          <SectionHeader title="Active Projects" actionLabel="View all" />
          <FlatList
            data={activeProjects}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item, index }) => (
              <View style={styles.projectCard}>
                <View style={styles.projectTopRow}>
                  <View>
                    <Text style={styles.projectTitle}>{item.title}</Text>
                    <Text style={styles.projectSubtitle}>{item.subtitle}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                </View>

                <View style={styles.progressMeta}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressPercent}>{item.progress}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
                </View>

                <View style={styles.membersRow}>
                  {item.members.map((member, memberIndex) => (
                    <View
                      key={`${item.id}-${member}`}
                      style={[
                        styles.memberBubble,
                        { backgroundColor: memberColors[(index + memberIndex) % memberColors.length] },
                      ]}
                    >
                      <Text style={styles.memberText}>{member}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          />

          <SectionHeader title="Trending Assets" actionLabel="Explore" />
          <FlatList
            data={trendingAssets}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <Pressable style={styles.assetCard} onPress={() => {}}>
                <Image source={{ uri: item.preview }} style={styles.assetPreview} />
                <View style={styles.assetBody}>
                  <Text style={styles.assetName}>{item.name}</Text>
                  <Text style={styles.assetMeta}>{item.category}</Text>
                  <Text style={styles.assetPrice}>{item.price}</Text>
                </View>
              </Pressable>
            )}
          />

          <SectionHeader title="Latest Gigs" actionLabel="Browse" />
          <View style={styles.gigsList}>
            {latestGigs.map((gig) => (
              <Pressable key={gig.id} style={styles.gigCard} onPress={() => {}}>
                <View style={styles.gigIconWrap}>
                  <MaterialIcons name={gig.icon as any} size={22} color="#00D1FF" />
                </View>
                <View style={styles.gigBody}>
                  <Text style={styles.gigTitle}>{gig.title}</Text>
                  <Text style={styles.gigDetail}>{gig.detail}</Text>
                </View>
                <Text style={styles.gigRate}>{gig.rate}</Text>
              </Pressable>
            ))}
          </View>

          <SectionHeader title="Community Picks" actionLabel="More" />
          <FlatList
            data={communityPicks}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <Pressable style={styles.communityCard} onPress={() => {}}>
                <Image source={{ uri: item.preview }} style={styles.communityPreview} />
                <View style={styles.communityFooter}>
                  <Text style={styles.communityName}>{item.name}</Text>
                  <Text style={styles.communityTag}>{item.tag}</Text>
                </View>
              </Pressable>
            )}
          />
        </ScrollView>
      </SafeAreaView>

      {/* Floating Navigation Bar */}
      <FloatingNavBar />
    </Animated.View>
  );
}

function SectionHeader({ title, actionLabel }: { title: string; actionLabel: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable>
        <Text style={styles.sectionAction}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#090B10',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  glowTopLeft: {
    position: 'absolute',
    top: -40,
    left: -30,
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: 'rgba(0, 209, 255, 0.08)',
  },
  glowTopRight: {
    position: 'absolute',
    top: 10,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    marginTop: 4,
    color: '#7E8798',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#11151C',
    borderWidth: 1,
    borderColor: '#1B2230',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#131923',
  },
  // Welcome Banner Styles
  welcomeCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  welcomeSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  welcomeDescription: {
    fontSize: 12,
    color: '#7E8798',
    lineHeight: 18,
    marginBottom: 16,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  welcomeDivider: {
    height: 2,
    backgroundColor: 'rgba(0, 209, 255, 0.5)',
    width: 50,
    marginBottom: 10,
    borderRadius: 1,
  },
  welcomeDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotCyan: {
    backgroundColor: '#00D1FF',
  },
  dotYellow: {
    backgroundColor: '#F4C95D',
  },
  dotPurple: {
    backgroundColor: '#A855F7',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  searchChip: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: '#11151C',
    borderWidth: 1,
    borderColor: '#1B2230',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  searchChipText: {
    color: '#DDE6F5',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#F3F7FF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  sectionAction: {
    color: '#00D1FF',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  horizontalList: {
    paddingRight: 4,
  },
  projectCard: {
    width: 250,
    marginRight: 12,
    borderRadius: 18,
    backgroundColor: '#11151C',
    borderWidth: 1,
    borderColor: '#1B2230',
    padding: 14,
  },
  projectTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectTitle: {
    color: '#F4F8FF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  projectSubtitle: {
    color: '#7E8798',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  badge: {
    backgroundColor: '#0D3341',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  badgeText: {
    color: '#63E8FF',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#95A0B3',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  progressPercent: {
    color: '#F4F8FF',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  progressTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: '#1A2130',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#00D1FF',
  },
  membersRow: {
    marginTop: 14,
    flexDirection: 'row',
  },
  memberBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -6,
    borderWidth: 2,
    borderColor: '#11151C',
  },
  memberText: {
    color: '#041117',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  assetCard: {
    width: 170,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#11151C',
    borderWidth: 1,
    borderColor: '#1B2230',
    marginRight: 12,
  },
  assetPreview: {
    width: '100%',
    height: 110,
  },
  assetBody: {
    padding: 12,
  },
  assetName: {
    color: '#F4F8FF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  assetMeta: {
    color: '#7E8798',
    fontSize: 11,
    marginBottom: 10,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  assetPrice: {
    color: '#00D1FF',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  gigsList: {
    gap: 10,
  },
  gigCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#11151C',
    borderWidth: 1,
    borderColor: '#1B2230',
  },
  gigIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#0E1620',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  gigBody: {
    flex: 1,
  },
  gigTitle: {
    color: '#F4F8FF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  gigDetail: {
    color: '#7E8798',
    fontSize: 11,
    lineHeight: 15,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  gigRate: {
    color: '#00D1FF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 12,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  communityCard: {
    width: 170,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#11151C',
    borderWidth: 1,
    borderColor: '#1B2230',
  },
  communityPreview: {
    width: '100%',
    height: 120,
  },
  communityFooter: {
    padding: 12,
  },
  communityName: {
    color: '#F4F8FF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  communityTag: {
    color: '#7E8798',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
});