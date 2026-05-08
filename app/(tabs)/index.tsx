import { AppTitle } from '@/components/app-title';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.glowTopLeft} />
        <View style={styles.glowTopRight} />

        <View style={styles.header}>
          <View>
            <AppTitle size="sm" />
            <Text style={styles.greeting}>Creative workbench for your studio flow</Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton} onPress={() => router.push('/modal')}>
              <MaterialIcons name="notifications-none" size={20} color="#E7F2FF" />
            </Pressable>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' }}
              style={styles.avatar}
            />
          </View>
        </View>

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
    </View>
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
  content: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 28,
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
  brand: {
    color: '#F3F7FF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  greeting: {
    marginTop: 4,
    color: '#7E8798',
    fontSize: 12,
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
  },
  sectionAction: {
    color: '#00D1FF',
    fontSize: 11,
    fontWeight: '700',
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
  },
  projectSubtitle: {
    color: '#7E8798',
    fontSize: 11,
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
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#95A0B3',
    fontSize: 11,
  },
  progressPercent: {
    color: '#F4F8FF',
    fontSize: 11,
    fontWeight: '700',
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
  },
  assetMeta: {
    color: '#7E8798',
    fontSize: 11,
    marginBottom: 10,
  },
  assetPrice: {
    color: '#00D1FF',
    fontSize: 12,
    fontWeight: '800',
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
  },
  gigDetail: {
    color: '#7E8798',
    fontSize: 11,
    lineHeight: 15,
  },
  gigRate: {
    color: '#00D1FF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 12,
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
  },
  communityTag: {
    color: '#7E8798',
    fontSize: 11,
  },
});
