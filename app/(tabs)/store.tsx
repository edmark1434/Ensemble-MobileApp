import { AppTitle } from '@/components/app-title';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import {useState, useMemo, useRef, useEffect, useCallback} from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  FlatList,
  Animated,
  Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import FloatingNavBar from '@/components/FloatingNavBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AssetType = 'Videos' | 'Images' | 'Sound' | 'Elements' | 'Templates';
type TabType = 'buy' | 'myAssets' | 'purchased' | 'favorites';

interface Comment {
  id: string;
  user: string;
  text: string;
  date: string;
}

interface Asset {
  id: string;
  title: string;
  creator: string;
  category: AssetType;
  price: number;
  image: string;
  description: string;
  downloads: number;
  rating: number;
  comments: Comment[];
  isFavorited: boolean;
  isPurchased: boolean;
  isMyAsset: boolean;
}

const categories: AssetType[] = ['Videos', 'Images', 'Sound', 'Elements', 'Templates'];

const sampleAssets: Asset[] = [
  {
    id: '1',
    title: 'Neon Pulse LUT Pack',
    creator: 'VividNodes',
    category: 'Images',
    price: 24,
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    description: 'Professional LUT pack for cinematic color grading. Includes 50+ presets.',
    downloads: 1240,
    rating: 4.8,
    comments: [
      { id: 'c1', user: 'color_guru', text: 'Amazing colors! Best LUT pack Ive bought.', date: '2024-01-15' },
      { id: 'c2', user: 'filmmaker_joe', text: 'Works great with DaVinci Resolve.', date: '2024-01-20' }
    ],
    isFavorited: false,
    isPurchased: false,
    isMyAsset: false,
  },
  {
    id: '2',
    title: 'Cinematic Grain FX',
    creator: 'StudioFrame',
    category: 'Videos',
    price: 18,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    description: '4K cinematic grain overlays for that authentic film look.',
    downloads: 842,
    rating: 4.6,
    comments: [
      { id: 'c3', user: 'editor_pro', text: 'Adds perfect texture to my videos.', date: '2024-01-10' }
    ],
    isFavorited: true,
    isPurchased: true,
    isMyAsset: false,
  },
  {
    id: '3',
    title: 'Dark Glass Overlay Kit',
    creator: 'OverlayLab',
    category: 'Elements',
    price: 12,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    description: 'Premium glass morphism overlays for modern UI designs.',
    downloads: 2340,
    rating: 4.9,
    comments: [],
    isFavorited: false,
    isPurchased: false,
    isMyAsset: false,
  },
  {
    id: '4',
    title: 'Ambient Soundscapes',
    creator: 'AudioForge',
    category: 'Sound',
    price: 15,
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
    description: 'Atmospheric sound effects for documentaries and films.',
    downloads: 567,
    rating: 4.7,
    comments: [],
    isFavorited: false,
    isPurchased: false,
    isMyAsset: false,
  },
  {
    id: '5',
    title: 'Motion Templates Pack',
    creator: 'MotionMaster',
    category: 'Templates',
    price: 32,
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=800&q=80',
    description: '100+ motion graphics templates for After Effects.',
    downloads: 3120,
    rating: 4.9,
    comments: [],
    isFavorited: true,
    isPurchased: true,
    isMyAsset: false,
  },
  {
    id: '6',
    title: 'VHS Effect Pack',
    creator: 'RetroVibes',
    category: 'Videos',
    price: 9,
    image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=800&q=80',
    description: 'Authentic VHS glitch and distortion effects.',
    downloads: 1890,
    rating: 4.5,
    comments: [],
    isFavorited: false,
    isPurchased: false,
    isMyAsset: false,
  },
  {
    id: '7',
    title: 'My Cinematic LUT Pack',
    creator: 'You',
    category: 'Images',
    price: 29,
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
    description: 'My custom cinematic LUT pack for filmmakers.',
    downloads: 45,
    rating: 5.0,
    comments: [
      { id: 'c4', user: 'buyer123', text: 'Great LUTs, highly recommend!', date: '2024-01-25' }
    ],
    isFavorited: false,
    isPurchased: false,
    isMyAsset: true,
  },
  {
    id: '8',
    title: 'My Motion Graphics Kit',
    creator: 'You',
    category: 'Templates',
    price: 49,
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=800&q=80',
    description: 'Professional motion graphics templates for social media.',
    downloads: 123,
    rating: 4.8,
    comments: [],
    isFavorited: true,
    isPurchased: false,
    isMyAsset: true,
  },
];

export default function StoreScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('buy');
  const [selectedCategory, setSelectedCategory] = useState<AssetType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [assets] = useState<Asset[]>(sampleAssets);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [showAssetModal, setShowAssetModal] = useState(false);

  // Animation values
  const pageFadeAnim = useRef(new Animated.Value(0)).current;
  const pageSlideAnim = useRef(new Animated.Value(50)).current;
  const pageScaleAnim = useRef(new Animated.Value(0.95)).current;

  // Tab content animation
  const contentFadeAnim = useRef(new Animated.Value(1)).current;
  const contentSlideAnim = useRef(new Animated.Value(0)).current;

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
      // Reset and animate when page is focused
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

  // Animate tab switching
  const animateTabChange = (newTab: TabType) => {
    if (newTab === activeTab) return;

    // Get direction based on tab index
    const tabOrder = ['buy', 'myAssets', 'purchased', 'favorites'];
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(newTab);
    const direction = newIndex > currentIndex ? 1 : -1;

    // Fade out and slide
    Animated.parallel([
      Animated.timing(contentFadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(contentSlideAnim, {
        toValue: direction * 20,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Change tab
      setActiveTab(newTab);

      // Reset slide position
      contentSlideAnim.setValue(direction * -20);

      // Fade in and slide from opposite direction
      Animated.parallel([
        Animated.timing(contentFadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(contentSlideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const filteredAssets = useMemo(() => {
    let filtered = assets;

    if (activeTab === 'favorites') {
      filtered = filtered.filter(asset => asset.isFavorited);
    } else if (activeTab === 'purchased') {
      filtered = filtered.filter(asset => asset.isPurchased === true);
    } else if (activeTab === 'myAssets') {
      filtered = filtered.filter(asset => asset.isMyAsset === true);
    } else if (activeTab === 'buy') {
      filtered = filtered.filter(asset => !asset.isMyAsset && !asset.isPurchased);
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(asset => asset.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(asset =>
        asset.title.toLowerCase().includes(query) ||
        asset.creator.toLowerCase().includes(query) ||
        asset.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [assets, activeTab, selectedCategory, searchQuery]);

  const handleTabChange = (tab: TabType) => {
    animateTabChange(tab);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <View style={styles.starsContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <Text key={`full-${i}`} style={styles.starFilled}>★</Text>
        ))}
        {hasHalfStar && <Text style={styles.starHalf}>½</Text>}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Text key={`empty-${i}`} style={styles.starEmpty}>★</Text>
        ))}
        <Text style={styles.ratingText}>{rating}</Text>
      </View>
    );
  };

  const getCategoryColor = (category: AssetType): string => {
    const colors = {
      'Videos': '#3B82F6',
      'Images': '#10B981',
      'Sound': '#8B5CF6',
      'Elements': '#F59E0B',
      'Templates': '#EC4899',
    };
    return colors[category];
  };

  const getTabTitle = (tab: TabType): string => {
    switch(tab) {
      case 'buy': return 'Available for Purchase';
      case 'myAssets': return 'My Created Assets';
      case 'purchased': return 'Assets I Purchased';
      case 'favorites': return 'My Favorites';
      default: return '';
    }
  };

  const toggleFavorite = (assetId: string) => {
    if (selectedAsset?.id === assetId) {
      setSelectedAsset(prev => prev ? { ...prev, isFavorited: !prev.isFavorited } : null);
    }
  };

  const addComment = (assetId: string) => {
    if (!commentInput.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      user: 'you',
      text: commentInput.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    if (selectedAsset?.id === assetId) {
      setSelectedAsset(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : null);
    }

    setCommentInput('');
  };

  const purchaseAsset = (assetId: string) => {
    if (selectedAsset?.id === assetId) {
      setSelectedAsset(prev => prev ? { ...prev, isPurchased: true } : null);
    }
  };

  const renderAssetCard = ({ item }: { item: Asset }) => (
    <Pressable style={styles.assetCard} onPress={() => {
      setSelectedAsset(item);
      setShowAssetModal(true);
    }}>
      <Image source={{ uri: item.image }} style={styles.assetImage} />

      <View style={styles.assetBadgeContainer}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
          <Text style={styles.categoryBadgeText}>{item.category}</Text>
        </View>
        {item.isMyAsset && (
          <View style={styles.myAssetBadge}>
            <Text style={styles.myAssetBadgeText}>Mine</Text>
          </View>
        )}
        {item.isPurchased && !item.isMyAsset && (
          <View style={styles.purchasedBadge}>
            <Text style={styles.purchasedBadgeText}>Owned</Text>
          </View>
        )}
        {item.isFavorited && (
          <MaterialIcons name="favorite" size={16} color="#EF4444" />
        )}
      </View>

      <View style={styles.assetBody}>
        <Text style={styles.assetTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.assetCreator}>By {item.creator}</Text>

        <View style={styles.assetStats}>
          {renderStars(item.rating)}
          <View style={styles.downloadsContainer}>
            <MaterialIcons name="download" size={12} color="#718099" />
            <Text style={styles.downloadsText}>{item.downloads}</Text>
          </View>
        </View>

        <View style={styles.assetFooter}>
          <Text style={styles.assetPrice}>${item.price}</Text>
          <View style={styles.assetActions}>
            <Pressable
              style={styles.favoriteButton}
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite(item.id);
              }}
            >
              <MaterialIcons
                name={item.isFavorited ? 'favorite' : 'favorite-border'}
                size={18}
                color={item.isFavorited ? '#EF4444' : '#718099'}
              />
            </Pressable>
            {!item.isMyAsset && (
              <Pressable
                style={[styles.buyButton, (item.isPurchased || activeTab === 'purchased') && styles.purchasedButton]}
                onPress={(e) => {
                  e.stopPropagation();
                  if (!item.isPurchased && activeTab !== 'purchased') purchaseAsset(item.id);
                }}
              >
                <Text style={styles.buyButtonText}>
                  {item.isPurchased ? 'Owned' : 'Buy'}
                </Text>
              </Pressable>
            )}
            {item.isMyAsset && (
              <Pressable style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Pressable>
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
            <View style={styles.headerActions}>
              <Pressable style={styles.iconButton}>
                <MaterialIcons name="upload" size={18} color="#DCE6F4" />
              </Pressable>
              <Pressable style={styles.iconButton}>
                <MaterialIcons name="notifications-none" size={18} color="#DCE6F4" />
              </Pressable>
            </View>
          </View>

          {/* Page Title */}
          <Text style={styles.title}>Marketplace</Text>

          {/* Search Bar */}
          <View style={styles.searchWrap}>
            <MaterialIcons name="search" size={20} color="#718099" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search assets..."
              placeholderTextColor="#718099"
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={18} color="#718099" />
              </Pressable>
            )}
          </View>

          {/* Category Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            <Pressable
              style={[styles.categoryChip, selectedCategory === 'All' && styles.categoryChipActive]}
              onPress={() => setSelectedCategory('All')}
            >
              <Text style={[styles.categoryText, selectedCategory === 'All' && styles.categoryTextActive]}>All</Text>
            </Pressable>
            {categories.map((category) => (
              <Pressable
                key={category}
                style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>
                  {category}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <Pressable
              style={[styles.tab, activeTab === 'buy' && styles.tabActive]}
              onPress={() => handleTabChange('buy')}
            >
              <Text style={[styles.tabText, activeTab === 'buy' && styles.tabTextActive]}>Buy Assets</Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'myAssets' && styles.tabActive]}
              onPress={() => handleTabChange('myAssets')}
            >
              <Text style={[styles.tabText, activeTab === 'myAssets' && styles.tabTextActive]}>My Assets</Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'purchased' && styles.tabActive]}
              onPress={() => handleTabChange('purchased')}
            >
              <Text style={[styles.tabText, activeTab === 'purchased' && styles.tabTextActive]}>Purchased</Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}
              onPress={() => handleTabChange('favorites')}
            >
              <Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive]}>Favorites</Text>
            </Pressable>
          </View>

          {/* Animated Content */}
          <Animated.View
            style={{
              opacity: contentFadeAnim,
              transform: [{ translateX: contentSlideAnim }],
            }}
          >
            {/* Tab Title */}
            <Text style={styles.tabTitle}>{getTabTitle(activeTab)}</Text>

            {/* Results Count */}
            <Text style={styles.resultsCount}>
              Showing {filteredAssets.length} assets
            </Text>

            {/* Assets Grid - 2 Columns */}
            <FlatList
              data={filteredAssets}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.assetRow}
              scrollEnabled={false}
              renderItem={renderAssetCard}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="inventory" size={48} color="#718099" />
                  <Text style={styles.emptyText}>No assets found</Text>
                </View>
              }
            />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Asset Detail Modal */}
      <Modal
        visible={showAssetModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAssetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedAsset && (
                <>
                  <View style={styles.modalHeader}>
                    <Pressable
                      style={styles.modalCloseButton}
                      onPress={() => setShowAssetModal(false)}
                    >
                      <MaterialIcons name="close" size={24} color="#F4F8FF" />
                    </Pressable>
                    <Pressable
                      style={styles.modalFavoriteButton}
                      onPress={() => toggleFavorite(selectedAsset.id)}
                    >
                      <MaterialIcons
                        name={selectedAsset.isFavorited ? 'favorite' : 'favorite-border'}
                        size={24}
                        color={selectedAsset.isFavorited ? '#EF4444' : '#718099'}
                      />
                    </Pressable>
                  </View>

                  <Image source={{ uri: selectedAsset.image }} style={styles.modalImage} />

                  <View style={styles.modalBody}>
                    <View style={styles.modalTopRow}>
                      <Text style={styles.modalTitle}>{selectedAsset.title}</Text>
                      <View style={[styles.modalCategoryBadge, { backgroundColor: getCategoryColor(selectedAsset.category) }]}>
                        <Text style={styles.modalCategoryText}>{selectedAsset.category}</Text>
                      </View>
                    </View>

                    <Text style={styles.modalCreator}>By {selectedAsset.creator}</Text>

                    {selectedAsset.isMyAsset && (
                      <View style={styles.modalCreatorBadge}>
                        <MaterialIcons name="check-circle" size={14} color="#10B981" />
                        <Text style={styles.modalCreatorBadgeText}>Your Asset</Text>
                      </View>
                    )}

                    {selectedAsset.isPurchased && !selectedAsset.isMyAsset && (
                      <View style={styles.modalPurchasedBadge}>
                        <MaterialIcons name="verified" size={14} color="#15C8FF" />
                        <Text style={styles.modalPurchasedBadgeText}>Purchased</Text>
                      </View>
                    )}

                    <View style={styles.modalStats}>
                      {renderStars(selectedAsset.rating)}
                      <View style={styles.modalDownloads}>
                        <MaterialIcons name="download" size={16} color="#718099" />
                        <Text style={styles.modalDownloadsText}>{selectedAsset.downloads} downloads</Text>
                      </View>
                    </View>

                    <Text style={styles.modalDescription}>{selectedAsset.description}</Text>

                    <View style={styles.modalPriceRow}>
                      <Text style={styles.modalPrice}>${selectedAsset.price}</Text>
                      {!selectedAsset.isMyAsset && (
                        <Pressable
                          style={[styles.modalBuyButton, selectedAsset.isPurchased && styles.purchasedButton]}
                          onPress={() => {
                            if (!selectedAsset.isPurchased) purchaseAsset(selectedAsset.id);
                          }}
                        >
                          <Text style={styles.modalBuyButtonText}>
                            {selectedAsset.isPurchased ? 'Already Purchased' : 'Purchase Now'}
                          </Text>
                        </Pressable>
                      )}
                      {selectedAsset.isMyAsset && (
                        <Pressable style={styles.modalEditButton}>
                          <Text style={styles.modalEditButtonText}>Edit Asset</Text>
                        </Pressable>
                      )}
                    </View>

                    {/* Comments Section */}
                    <View style={styles.commentsSection}>
                      <Text style={styles.commentsTitle}>Comments ({selectedAsset.comments.length})</Text>

                      {selectedAsset.comments.map((comment) => (
                        <View key={comment.id} style={styles.commentItem}>
                          <View style={styles.commentHeader}>
                            <Text style={styles.commentUser}>{comment.user}</Text>
                            <Text style={styles.commentDate}>{comment.date}</Text>
                          </View>
                          <Text style={styles.commentText}>{comment.text}</Text>
                        </View>
                      ))}

                      <View style={styles.addCommentContainer}>
                        <TextInput
                          value={commentInput}
                          onChangeText={setCommentInput}
                          placeholder="Add a comment..."
                          placeholderTextColor="#718099"
                          style={styles.commentInput}
                          multiline
                        />
                        <Pressable
                          style={styles.submitCommentButton}
                          onPress={() => addComment(selectedAsset.id)}
                        >
                          <MaterialIcons name="send" size={18} color="#041117" />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Floating Navigation Bar */}
      <FloatingNavBar />
    </Animated.View>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
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
  title: {
    color: '#F4F8FF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 16,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  searchWrap: {
    backgroundColor: '#11151C',
    borderWidth: 1,
    borderColor: '#1B2230',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#F4F8FF',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  categoryRow: {
    gap: 10,
    paddingBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#11151C',
    borderWidth: 1,
    borderColor: '#1B2230',
  },
  categoryChipActive: {
    backgroundColor: '#15C8FF',
    borderColor: '#15C8FF',
  },
  categoryText: {
    color: '#8A93A3',
    fontWeight: '700',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  categoryTextActive: {
    color: '#041117',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#11151C',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1B2230',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#15C8FF',
  },
  tabText: {
    color: '#8A93A3',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  tabTextActive: {
    color: '#041117',
  },
  tabTitle: {
    color: '#15C8FF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  resultsCount: {
    color: '#718099',
    fontSize: 12,
    marginBottom: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  assetRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  assetCard: {
    width: '48%',
    backgroundColor: '#11151C',
    borderWidth: 1,
    borderColor: '#1B2230',
    borderRadius: 16,
    overflow: 'hidden',
  },
  assetImage: {
    width: '100%',
    height: 120,
  },
  assetBadgeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  myAssetBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  myAssetBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  purchasedBadge: {
    backgroundColor: '#15C8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  purchasedBadgeText: {
    color: '#041117',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  assetBody: {
    padding: 10,
  },
  assetTitle: {
    color: '#F4F8FF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  assetCreator: {
    color: '#8A93A3',
    fontSize: 11,
    marginBottom: 8,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  assetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starFilled: {
    fontSize: 10,
    color: '#FBBF24',
  },
  starHalf: {
    fontSize: 10,
    color: '#FBBF24',
  },
  starEmpty: {
    fontSize: 10,
    color: '#4B5563',
  },
  ratingText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginLeft: 2,
  },
  downloadsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  downloadsText: {
    color: '#718099',
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  assetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1B2230',
    paddingTop: 8,
  },
  assetPrice: {
    color: '#15C8FF',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  assetActions: {
    flexDirection: 'row',
    gap: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  buyButton: {
    backgroundColor: '#15C8FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  purchasedButton: {
    backgroundColor: '#10B981',
  },
  buyButtonText: {
    color: '#041117',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  editButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#041117',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#718099',
    fontSize: 14,
    marginTop: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#090B10',
    marginTop: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFavoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImage: {
    width: '100%',
    height: 250,
  },
  modalBody: {
    padding: 20,
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    color: '#F4F8FF',
    fontSize: 22,
    fontWeight: '900',
    flex: 1,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  modalCategoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalCategoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  modalCreator: {
    color: '#8A93A3',
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  modalCreatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  modalCreatorBadgeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  modalPurchasedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  modalPurchasedBadgeText: {
    color: '#15C8FF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  modalStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  modalDownloads: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalDownloadsText: {
    color: '#718099',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  modalDescription: {
    color: '#D8E0EE',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  modalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1B2230',
  },
  modalPrice: {
    color: '#15C8FF',
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  modalBuyButton: {
    backgroundColor: '#15C8FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalBuyButtonText: {
    color: '#041117',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  modalEditButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalEditButtonText: {
    color: '#041117',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  commentsSection: {
    marginTop: 8,
  },
  commentsTitle: {
    color: '#F4F8FF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  commentItem: {
    backgroundColor: '#11151C',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentUser: {
    color: '#15C8FF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  commentDate: {
    color: '#718099',
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  commentText: {
    color: '#D8E0EE',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#11151C',
    borderWidth: 1,
    borderColor: '#1B2230',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F4F8FF',
    fontSize: 13,
    maxHeight: 80,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  submitCommentButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#15C8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});