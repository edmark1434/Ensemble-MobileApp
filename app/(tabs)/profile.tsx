import { AppTitle } from '@/components/app-title';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useRef, useEffect, useCallback, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
  Modal,
  TextInput,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import FloatingNavBar from '@/components/FloatingNavBar';
import { auth } from '../../firebase';
import { getUserById, updateUser, signOutUser } from '../../function/user';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'portfolio' | 'jobPostings' | 'gigServices' | 'createdAssets' | 'reviews';

type Review = {
  id: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
};

type Badge = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type JobPosting = {
  id: string;
  title: string;
  budget: string;
  proposals: number;
  status: 'active' | 'filled' | 'closed';
};

type GigService = {
  id: string;
  title: string;
  price: string;
  sales: number;
  rating: number;
};

type CreatedAsset = {
  id: string;
  title: string;
  image: string;
  price: string;
  downloads: number;
};

// Sample Data
const userBadges: Badge[] = [
  { id: '1', name: 'Top Creator', icon: 'star', color: '#FBBF24' },
  { id: '2', name: 'Verified', icon: 'verified', color: '#15C8FF' },
  { id: '3', name: '100+ Sales', icon: 'trending-up', color: '#10B981' },
  { id: '4', name: '5 Star', icon: 'grade', color: '#A855F7' },
];

const userReviews: Review[] = [
  {
    id: '1',
    reviewerName: 'Sarah Johnson',
    reviewerAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    rating: 5,
    comment: 'Amazing work! Delivered before deadline and exceeded expectations.',
    date: '2024-01-15',
    service: 'Video Editing'
  },
  {
    id: '2',
    reviewerName: 'Mike Chen',
    reviewerAvatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    rating: 4.5,
    comment: 'Great communication and quality work. Would hire again.',
    date: '2024-01-10',
    service: 'Motion Graphics'
  },
  {
    id: '3',
    reviewerName: 'Emma Davis',
    reviewerAvatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    rating: 5,
    comment: 'Professional and creative. The best freelancer Ive worked with.',
    date: '2024-01-05',
    service: 'Color Grading'
  },
];

const userJobPostings: JobPosting[] = [
  { id: '1', title: 'Looking for Video Editor', budget: '$500', proposals: 8, status: 'active' },
  { id: '2', title: 'Motion Graphics Designer Needed', budget: '$1,000', proposals: 12, status: 'active' },
  { id: '3', title: '3D Animator for Short Film', budget: '$2,000', proposals: 5, status: 'filled' },
];

const userGigServices: GigService[] = [
  { id: '1', title: 'Professional Video Editing', price: '$100', sales: 45, rating: 4.9 },
  { id: '2', title: 'Custom Motion Graphics', price: '$150', sales: 32, rating: 4.8 },
  { id: '3', title: 'Color Grading Service', price: '$80', sales: 28, rating: 5.0 },
];

const userCreatedAssets: CreatedAsset[] = [
  { id: '1', title: 'Neon LUT Pack', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80', price: '$24', downloads: 1240 },
  { id: '2', title: 'Cinematic SFX Pack', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', price: '$18', downloads: 842 },
  { id: '3', title: 'Motion Templates', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80', price: '$32', downloads: 2340 },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('portfolio');
  const [showStats, setShowStats] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [bio, setBio] = useState('');
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [followers, setFollowers] = useState(1240);
  const [following, setFollowing] = useState(342);

  // Animation values
  const pageFadeAnim = useRef(new Animated.Value(0)).current;
  const pageSlideAnim = useRef(new Animated.Value(50)).current;
  const pageScaleAnim = useRef(new Animated.Value(0.95)).current;
  const statsRotateAnim = useRef(new Animated.Value(0)).current;

  // Animate page entrance
  useEffect(() => {
    Animated.parallel([
      Animated.timing(pageFadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(pageSlideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      Animated.spring(pageScaleAnim, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadUserData = async () => {
    if (!auth.currentUser) return;
    try {
      // Check if user signed in with Google
      const providerData = auth.currentUser.providerData;
      const isGoogle = providerData.some((p: any) => p.providerId === 'google.com');
      setIsGoogleUser(isGoogle);

      const response = await getUserById(auth.currentUser.uid);
      if (response.status === 200 && response.user) {
        setFullName(response.user.fullName || '');
        setUsername(response.user.username || '');
        setEmail(response.user.email || '');
        setBio(response.user.bio || '');
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      pageFadeAnim.setValue(0);
      pageSlideAnim.setValue(50);
      pageScaleAnim.setValue(0.95);
      Animated.parallel([
        Animated.timing(pageFadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(pageSlideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        Animated.spring(pageScaleAnim, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }),
      ]).start();
      
      loadUserData();
    }, [])
  );

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      const updates: any = { fullName, username, bio };
      if (!isGoogleUser) updates.email = email;
      const response = await updateUser(auth.currentUser.uid, updates);
      if (response.status === 200) {
        setShowEditModal(false);
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await signOutUser();
      if (res.status === 200) {
        setShowMenu(false);
        router.replace('/auth/login');
      } else {
        Alert.alert('Error', 'Failed to log out');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to log out');
    }
  };

  const toggleStats = () => {
    const toValue = showStats ? 0 : 1;
    Animated.spring(statsRotateAnim, { toValue, tension: 80, friction: 10, useNativeDriver: true }).start();
    setShowStats(!showStats);
  };

  const statsRotation = statsRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      <View style={styles.starsContainer}>
        {[...Array(fullStars)].map((_, i) => <Text key={i} style={styles.starFilled}>★</Text>)}
        {hasHalfStar && <Text style={styles.starHalf}>½</Text>}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => <Text key={i} style={styles.starEmpty}>★</Text>)}
      </View>
    );
  };

  const renderStarsNumber = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingNumber}>{rating}</Text>
        <MaterialIcons name="star" size={14} color="#FBBF24" />
      </View>
    );
  };

  const renderPortfolio = () => (
    <View style={styles.portfolioGrid}>
      {portfolio.map((item) => (
        <View key={item.id} style={styles.portfolioCard}>
          <Image source={{ uri: item.image }} style={styles.portfolioImage} />
          <Text style={styles.portfolioName}>{item.name}</Text>
        </View>
      ))}
    </View>
  );

  const renderJobPostings = () => (
    <View style={styles.listContainer}>
      {userJobPostings.map((job) => (
        <View key={job.id} style={styles.listCard}>
          <View style={styles.listCardHeader}>
            <Text style={styles.listCardTitle}>{job.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: job.status === 'active' ? '#10B981' : '#6B7280' }]}>
              <Text style={styles.statusText}>{job.status}</Text>
            </View>
          </View>
          <Text style={styles.listCardBudget}>Budget: {job.budget}</Text>
          <Text style={styles.listCardMeta}>{job.proposals} proposals received</Text>
        </View>
      ))}
    </View>
  );

  const renderGigServices = () => (
    <View style={styles.listContainer}>
      {userGigServices.map((gig) => (
        <View key={gig.id} style={styles.listCard}>
          <Text style={styles.listCardTitle}>{gig.title}</Text>
          <View style={styles.gigStatsRow}>
            <Text style={styles.gigPrice}>{gig.price}</Text>
            <View style={styles.gigRating}>
              {renderStarsNumber(gig.rating)}
              <Text style={styles.gigSales}>{gig.sales} sales</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderCreatedAssets = () => (
    <View style={styles.assetsGrid}>
      {userCreatedAssets.map((asset) => (
        <View key={asset.id} style={styles.assetCard}>
          <Image source={{ uri: asset.image }} style={styles.assetImage} />
          <View style={styles.assetInfo}>
            <Text style={styles.assetTitle}>{asset.title}</Text>
            <Text style={styles.assetPrice}>{asset.price}</Text>
            <Text style={styles.assetDownloads}>{asset.downloads} downloads</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderReviews = () => (
    <View style={styles.reviewsContainer}>
      {userReviews.map((review) => (
        <View key={review.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewerInfo}>
              <Image source={{ uri: review.reviewerAvatar }} style={styles.reviewerAvatar} />
              <View>
                <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                <Text style={styles.reviewService}>{review.service}</Text>
              </View>
            </View>
            {renderStars(review.rating)}
          </View>
          <Text style={styles.reviewComment}>{review.comment}</Text>
          <Text style={styles.reviewDate}>{review.date}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <Animated.View style={[styles.screen, { opacity: pageFadeAnim, transform: [{ translateY: pageSlideAnim }, { scale: pageScaleAnim }] }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Banner with Profile */}
          <View style={styles.bannerContainer}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80' }} style={styles.bannerImage} />

            {/* Settings and Menu Buttons */}
            <View style={styles.bannerButtons}>
              <Pressable style={styles.bannerIconButton} onPress={() => setShowMenu(true)}>
                <MaterialIcons name="more-vert" size={22} color="#FFFFFF" />
              </Pressable>
              <Pressable style={styles.bannerIconButton}>
                <MaterialIcons name="settings" size={22} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* Profile Avatar */}
            <View style={styles.avatarContainer}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80' }} style={styles.avatar} />
            </View>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#15C8FF" />
            ) : (
              <>
                <Text style={styles.name}>{fullName}</Text>
                <Text style={styles.email}>@{username} • {email}</Text>
                <Text style={styles.bio}>{bio}</Text>
              </>
            )}

            {/* Followers/Following */}
            <View style={styles.followStats}>
              <View style={styles.followStat}>
                <Text style={styles.followStatValue}>{followers}</Text>
                <Text style={styles.followStatLabel}>Followers</Text>
              </View>
              <View style={styles.followDivider} />
              <View style={styles.followStat}>
                <Text style={styles.followStatValue}>{following}</Text>
                <Text style={styles.followStatLabel}>Following</Text>
              </View>
            </View>

            {/* Badges */}
            <View style={styles.badgesContainer}>
              {userBadges.map((badge) => (
                <View key={badge.id} style={[styles.badge, { backgroundColor: `${badge.color}20`, borderColor: badge.color }]}>
                  <MaterialIcons name={badge.icon as any} size={14} color={badge.color} />
                  <Text style={[styles.badgeText, { color: badge.color }]}>{badge.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Stats Dropdown Section */}
          <Pressable style={styles.statsHeader} onPress={toggleStats}>
            <Text style={styles.statsTitle}>Account Statistics</Text>
            <Animated.View style={{ transform: [{ rotate: statsRotation }] }}>
              <MaterialIcons name="expand-more" size={24} color="#F4F8FF" />
            </Animated.View>
          </Pressable>

          {showStats && (
            <View style={styles.statsContent}>
              <View style={styles.statCard}>
                <Text style={styles.statCardTitle}>Merit Score</Text>
                <Text style={styles.statCardValue}>98/100</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '98%' }]} />
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={[styles.statCard, styles.halfStat]}>
                  <Text style={styles.statCardTitle}>Job Rating</Text>
                  <View style={styles.statRating}>{renderStarsNumber(4.8)}</View>
                </View>
                <View style={[styles.statCard, styles.halfStat]}>
                  <Text style={styles.statCardTitle}>Gig Rating</Text>
                  <View style={styles.statRating}>{renderStarsNumber(4.9)}</View>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={[styles.statCard, styles.halfStat]}>
                  <Text style={styles.statCardTitle}>Assets Rating</Text>
                  <View style={styles.statRating}>{renderStarsNumber(4.7)}</View>
                </View>
                <View style={[styles.statCard, styles.halfStat]}>
                  <Text style={styles.statCardTitle}>Overall Rating</Text>
                  <View style={styles.statRating}>{renderStarsNumber(4.85)}</View>
                </View>
              </View>
            </View>
          )}

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
              <Pressable style={[styles.tab, activeTab === 'portfolio' && styles.tabActive]} onPress={() => setActiveTab('portfolio')}>
                <Text style={[styles.tabText, activeTab === 'portfolio' && styles.tabTextActive]}>Portfolio</Text>
              </Pressable>
              <Pressable style={[styles.tab, activeTab === 'jobPostings' && styles.tabActive]} onPress={() => setActiveTab('jobPostings')}>
                <Text style={[styles.tabText, activeTab === 'jobPostings' && styles.tabTextActive]}>Job Posts</Text>
              </Pressable>
              <Pressable style={[styles.tab, activeTab === 'gigServices' && styles.tabActive]} onPress={() => setActiveTab('gigServices')}>
                <Text style={[styles.tabText, activeTab === 'gigServices' && styles.tabTextActive]}>Gig Services</Text>
              </Pressable>
              <Pressable style={[styles.tab, activeTab === 'createdAssets' && styles.tabActive]} onPress={() => setActiveTab('createdAssets')}>
                <Text style={[styles.tabText, activeTab === 'createdAssets' && styles.tabTextActive]}>Assets</Text>
              </Pressable>
              <Pressable style={[styles.tab, activeTab === 'reviews' && styles.tabActive]} onPress={() => setActiveTab('reviews')}>
                <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>Reviews</Text>
              </Pressable>
            </ScrollView>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'portfolio' && renderPortfolio()}
            {activeTab === 'jobPostings' && renderJobPostings()}
            {activeTab === 'gigServices' && renderGigServices()}
            {activeTab === 'createdAssets' && renderCreatedAssets()}
            {activeTab === 'reviews' && renderReviews()}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Menu Modal */}
      <Modal visible={showMenu} animationType="fade" transparent onRequestClose={() => setShowMenu(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowMenu(false)}>
          <View style={styles.menuContainer}>
            <Pressable style={styles.menuItem} onPress={() => { setShowEditModal(true); setShowMenu(false); }}>
              <MaterialIcons name="edit" size={20} color="#F4F8FF" />
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </Pressable>
            <Pressable style={styles.menuItem}>
              <MaterialIcons name="share" size={20} color="#F4F8FF" />
              <Text style={styles.menuItemText}>Share Profile</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
              <MaterialIcons name="logout" size={20} color="#EF4444" />
              <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Pressable onPress={() => setShowEditModal(false)}>
                <MaterialIcons name="close" size={24} color="#F4F8FF" />
              </Pressable>
            </View>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
              placeholderTextColor="#718099"
              style={styles.textInput}
            />

            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Your username"
              placeholderTextColor="#718099"
              style={styles.textInput}
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>
              Email{isGoogleUser ? ' (managed by Google)' : ''}
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Your email"
              placeholderTextColor="#718099"
              style={[styles.textInput, isGoogleUser && styles.textInputDisabled]}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isGoogleUser}
            />

            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Write your bio..."
              placeholderTextColor="#718099"
              style={styles.bioInput}
              multiline
              numberOfLines={4}
            />
            <Pressable style={styles.saveButton} onPress={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator size="small" color="#041117" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      <FloatingNavBar />
    </Animated.View>
  );
}

const portfolio = [
  { id: '1', name: 'Cyber_Corp_UI', image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80' },
  { id: '2', name: 'Arc_Light_Set', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80' },
  { id: '3', name: 'Nebula_Plane', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80' },
  { id: '4', name: 'VFX_Atm_World', image: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=800&q=80' },
];

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#090B10' },
  safeArea: { flex: 1 },
  content: { paddingBottom: 100 },

  // Banner Styles
  bannerContainer: { position: 'relative', height: 180, width: '100%' },
  bannerImage: { width: '100%', height: '100%' },
  bannerButtons: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', gap: 8 },
  bannerIconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  avatarContainer: { position: 'absolute', bottom: -50, left: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#090B10' },

  // User Info
  userInfo: { paddingHorizontal: 16, marginTop: 60, marginBottom: 20 },
  name: { color: '#F4F8FF', fontSize: 24, fontWeight: '900', fontFamily: 'PlusJakartaSans_800ExtraBold' },
  email: { color: '#15C8FF', fontSize: 13, marginTop: 2, fontFamily: 'PlusJakartaSans_400Regular' },
  bio: { color: '#8A93A3', fontSize: 13, lineHeight: 18, marginTop: 10, fontFamily: 'PlusJakartaSans_400Regular' },

  // Follow Stats
  followStats: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  followStat: { flex: 1, alignItems: 'center' },
  followStatValue: { color: '#F4F8FF', fontSize: 18, fontWeight: '800', fontFamily: 'PlusJakartaSans_800ExtraBold' },
  followStatLabel: { color: '#718099', fontSize: 11, marginTop: 2, fontFamily: 'PlusJakartaSans_400Regular' },
  followDivider: { width: 1, height: 30, backgroundColor: '#1B2230' },

  // Badges
  badgesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '600', fontFamily: 'PlusJakartaSans_600SemiBold' },

  // Stats Dropdown
  statsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#11151C', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#1B2230' },
  statsTitle: { color: '#F4F8FF', fontSize: 16, fontWeight: '700', fontFamily: 'PlusJakartaSans_700Bold' },
  statsContent: { padding: 16, backgroundColor: '#0E131A' },
  statCard: { backgroundColor: '#11151C', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#1B2230' },
  statCardTitle: { color: '#8A93A3', fontSize: 12, marginBottom: 6, fontFamily: 'PlusJakartaSans_500Medium' },
  statCardValue: { color: '#15C8FF', fontSize: 28, fontWeight: '900', fontFamily: 'PlusJakartaSans_800ExtraBold' },
  progressBar: { height: 6, backgroundColor: '#1B2230', borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#15C8FF', borderRadius: 3 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  halfStat: { flex: 1 },
  statRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingNumber: { color: '#F4F8FF', fontSize: 20, fontWeight: '800', fontFamily: 'PlusJakartaSans_800ExtraBold' },

  // Tabs
  tabsContainer: { paddingHorizontal: 16, marginTop: 16 },
  tabsScroll: { gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230' },
  tabActive: { backgroundColor: '#15C8FF', borderColor: '#15C8FF' },
  tabText: { color: '#8A93A3', fontSize: 13, fontWeight: '600', fontFamily: 'PlusJakartaSans_600SemiBold' },
  tabTextActive: { color: '#041117' },
  tabContent: { paddingHorizontal: 16, paddingTop: 16 },

  // Portfolio
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  portfolioCard: { width: (SCREEN_WIDTH - 44) / 2, backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', borderRadius: 16, overflow: 'hidden' },
  portfolioImage: { width: '100%', height: 120 },
  portfolioName: { color: '#F4F8FF', fontSize: 12, fontWeight: '700', padding: 10, fontFamily: 'PlusJakartaSans_700Bold' },

  // List Cards (Jobs, Gigs)
  listContainer: { gap: 12 },
  listCard: { backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', borderRadius: 16, padding: 14 },
  listCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  listCardTitle: { color: '#F4F8FF', fontSize: 14, fontWeight: '700', flex: 1, fontFamily: 'PlusJakartaSans_700Bold' },
  listCardBudget: { color: '#00D1FF', fontSize: 13, fontWeight: '600', marginBottom: 4, fontFamily: 'PlusJakartaSans_600SemiBold' },
  listCardMeta: { color: '#718099', fontSize: 11, fontFamily: 'PlusJakartaSans_400Regular' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', fontFamily: 'PlusJakartaSans_700Bold' },

  // Gig Stats
  gigStatsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  gigPrice: { color: '#00D1FF', fontSize: 14, fontWeight: '800', fontFamily: 'PlusJakartaSans_800ExtraBold' },
  gigRating: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gigSales: { color: '#718099', fontSize: 11, fontFamily: 'PlusJakartaSans_400Regular' },

  // Assets Grid
  assetsGrid: { gap: 12 },
  assetCard: { flexDirection: 'row', backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', borderRadius: 16, overflow: 'hidden' },
  assetImage: { width: 80, height: 80 },
  assetInfo: { flex: 1, padding: 10, justifyContent: 'center' },
  assetTitle: { color: '#F4F8FF', fontSize: 13, fontWeight: '700', marginBottom: 2, fontFamily: 'PlusJakartaSans_700Bold' },
  assetPrice: { color: '#00D1FF', fontSize: 12, fontWeight: '800', marginBottom: 2, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  assetDownloads: { color: '#718099', fontSize: 10, fontFamily: 'PlusJakartaSans_400Regular' },

  // Reviews
  reviewsContainer: { gap: 12 },
  reviewCard: { backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', borderRadius: 16, padding: 14 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  reviewerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewerAvatar: { width: 40, height: 40, borderRadius: 20 },
  reviewerName: { color: '#F4F8FF', fontSize: 13, fontWeight: '700', fontFamily: 'PlusJakartaSans_700Bold' },
  reviewService: { color: '#15C8FF', fontSize: 11, fontFamily: 'PlusJakartaSans_400Regular' },
  reviewComment: { color: '#D8E0EE', fontSize: 12, lineHeight: 18, marginBottom: 8, fontFamily: 'PlusJakartaSans_400Regular' },
  reviewDate: { color: '#718099', fontSize: 10, fontFamily: 'PlusJakartaSans_400Regular' },

  // Stars
  starsContainer: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  starFilled: { fontSize: 12, color: '#FBBF24' },
  starHalf: { fontSize: 12, color: '#FBBF24' },
  starEmpty: { fontSize: 12, color: '#4B5563' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  menuContainer: { backgroundColor: '#11151C', borderRadius: 16, width: 200, padding: 8, borderWidth: 1, borderColor: '#1B2230' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8 },
  menuItemText: { color: '#F4F8FF', fontSize: 14, fontFamily: 'PlusJakartaSans_400Regular' },
  menuDivider: { height: 1, backgroundColor: '#1B2230', marginVertical: 4 },
  logoutItem: { marginTop: 4 },
  logoutText: { color: '#EF4444' },

  editModalContent: { backgroundColor: '#11151C', borderRadius: 24, width: '90%', padding: 20, borderWidth: 1, borderColor: '#1B2230' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#F4F8FF', fontSize: 20, fontWeight: '800', fontFamily: 'PlusJakartaSans_800ExtraBold' },
  inputLabel: { color: '#8A93A3', fontSize: 13, marginBottom: 8, fontFamily: 'PlusJakartaSans_500Medium' },
  textInput: { backgroundColor: '#0E1620', borderWidth: 1, borderColor: '#1B2230', borderRadius: 12, padding: 12, color: '#F4F8FF', fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular', marginBottom: 16 },
  textInputDisabled: { opacity: 0.5, color: '#718099' },
  bioInput: { backgroundColor: '#0E1620', borderWidth: 1, borderColor: '#1B2230', borderRadius: 12, padding: 12, color: '#F4F8FF', fontSize: 13, minHeight: 100, textAlignVertical: 'top', fontFamily: 'PlusJakartaSans_400Regular' },
  saveButton: { backgroundColor: '#15C8FF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#041117', fontSize: 14, fontWeight: '800', fontFamily: 'PlusJakartaSans_800ExtraBold' },
});