import { AppTitle } from '@/components/app-title';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
  Modal,
  FlatList,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import FloatingNavBar from '@/components/FloatingNavBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'jobs' | 'gigs';

// Job Types
type JobPost = {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  budget: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance';
  postedBy: string;
  postedByAvatar: string;
  postedDate: string;
  bannerImage: string;
  proposals: number;
  isMyPost: boolean;
};

type Proposal = {
  id: string;
  jobId: string;
  freelancerName: string;
  freelancerAvatar: string;
  coverLetter: string;
  bidAmount: string;
  status: 'pending' | 'accepted' | 'rejected';
};

// Gig Types
type GigTier = {
  id: string;
  name: string;
  price: string;
  description: string;
  deliveryDays: number;
};

type GigPost = {
  id: string;
  title: string;
  description: string;
  category: string;
  sellerName: string;
  sellerAvatar: string;
  rating: number;
  totalSales: number;
  bannerImage: string;
  tiers: GigTier[];
  isMyGig: boolean;
};

type Request = {
  id: string;
  gigId: string;
  buyerName: string;
  buyerAvatar: string;
  message: string;
  selectedTier: string;
  status: 'pending' | 'accepted' | 'completed';
};

// Sample Job Data
const jobPosts: JobPost[] = [
  {
    id: '1',
    title: 'Senior Motion Designer Needed',
    description: 'Looking for an experienced motion designer to create stunning explainer videos for our product launch.',
    company: 'Creative Studio Inc.',
    location: 'Remote',
    budget: '$5,000 - $8,000',
    type: 'Full-time',
    postedBy: 'Sarah Chen',
    postedByAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    postedDate: '2024-01-15',
    bannerImage: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=800&q=80',
    proposals: 12,
    isMyPost: false,
  },
  {
    id: '2',
    title: 'Video Editor for YouTube Channel',
    description: 'Need a talented video editor for weekly YouTube content. Must be proficient with Premiere Pro.',
    company: 'Digital Creators',
    location: 'Remote',
    budget: '$2,000 - $3,000/month',
    type: 'Contract',
    postedBy: 'Mike Johnson',
    postedByAvatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    postedDate: '2024-01-14',
    bannerImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    proposals: 8,
    isMyPost: false,
  },
  {
    id: '3',
    title: '3D Animator for Game Trailer',
    description: 'Seeking a skilled 3D animator to create an epic game trailer. Experience with Blender or Maya required.',
    company: 'GameWorks Studio',
    location: 'Hybrid',
    budget: '$3,000 - $5,000',
    type: 'Contract',
    postedBy: 'Alex Rodriguez',
    postedByAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    postedDate: '2024-01-13',
    bannerImage: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80',
    proposals: 5,
    isMyPost: false,
  },
  {
    id: '4',
    title: 'My Job Post - Looking for Editor',
    description: 'Hiring a freelance video editor for short-form social media content.',
    company: 'My Studio',
    location: 'Remote',
    budget: '$500 - $1,000',
    type: 'Freelance',
    postedBy: 'You',
    postedByAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    postedDate: '2024-01-12',
    bannerImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    proposals: 3,
    isMyPost: true,
  },
];

// Sample Gig Data
const gigPosts: GigPost[] = [
  {
    id: '1',
    title: 'Professional Video Editing',
    description: 'I will edit your videos with professional transitions, color grading, and sound design.',
    category: 'Video Editing',
    sellerName: 'Emma Watson',
    sellerAvatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    rating: 4.9,
    totalSales: 127,
    bannerImage: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80',
    tiers: [
      { id: 't1', name: 'Basic', price: '$50', description: '5-10 min video, basic transitions', deliveryDays: 2 },
      { id: 't2', name: 'Standard', price: '$100', description: '10-20 min video, advanced effects', deliveryDays: 3 },
      { id: 't3', name: 'Premium', price: '$200', description: '30+ min video, full production', deliveryDays: 5 },
    ],
    isMyGig: false,
  },
  {
    id: '2',
    title: 'Motion Graphics Animation',
    description: 'Custom motion graphics for explainer videos, intros, and social media content.',
    category: 'Motion Graphics',
    sellerName: 'David Kim',
    sellerAvatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    rating: 4.8,
    totalSales: 89,
    bannerImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    tiers: [
      { id: 't1', name: 'Basic', price: '$80', description: '30 sec animation, simple graphics', deliveryDays: 3 },
      { id: 't2', name: 'Standard', price: '$150', description: '1 min animation, custom graphics', deliveryDays: 5 },
      { id: 't3', name: 'Premium', price: '$300', description: '3 min animation, full studio quality', deliveryDays: 7 },
    ],
    isMyGig: false,
  },
  {
    id: '3',
    title: 'Color Grading Service',
    description: 'Professional color grading for films, commercials, and music videos.',
    category: 'Color Grading',
    sellerName: 'Lisa Wong',
    sellerAvatar: 'https://randomuser.me/api/portraits/women/6.jpg',
    rating: 5.0,
    totalSales: 234,
    bannerImage: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80',
    tiers: [
      { id: 't1', name: 'Basic', price: '$120', description: 'Color correction only', deliveryDays: 2 },
      { id: 't2', name: 'Standard', price: '$250', description: 'Color grading + LUTs', deliveryDays: 4 },
      { id: 't3', name: 'Premium', price: '$500', description: 'Full cinematic grade', deliveryDays: 6 },
    ],
    isMyGig: false,
  },
  {
    id: '4',
    title: 'My Gig - Logo Animation',
    description: 'Custom logo animation for your brand identity.',
    category: 'Animation',
    sellerName: 'You',
    sellerAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    rating: 5.0,
    totalSales: 15,
    bannerImage: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80',
    tiers: [
      { id: 't1', name: 'Basic', price: '$30', description: 'Simple reveal animation', deliveryDays: 1 },
      { id: 't2', name: 'Standard', price: '$60', description: 'Custom animated logo', deliveryDays: 2 },
      { id: 't3', name: 'Premium', price: '$120', description: '3D revealed logo animation', deliveryDays: 3 },
    ],
    isMyGig: true,
  },
];

export default function JobsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('jobs');
  const [activeJobSubTab, setActiveJobSubTab] = useState<'all' | 'myPosts' | 'proposals'>('all');
  const [activeGigSubTab, setActiveGigSubTab] = useState<'all' | 'myGigs' | 'requests'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [selectedGig, setSelectedGig] = useState<GigPost | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showGigModal, setShowGigModal] = useState(false);
  const [proposalText, setProposalText] = useState('');
  const [proposalBid, setProposalBid] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [selectedTier, setSelectedTier] = useState<GigTier | null>(null);
  const [expandedGigId, setExpandedGigId] = useState<string | null>(null);

  // Animation values
  const pageFadeAnim = useRef(new Animated.Value(0)).current;
  const pageSlideAnim = useRef(new Animated.Value(50)).current;
  const pageScaleAnim = useRef(new Animated.Value(0.95)).current;

  // Filter jobs based on search and sub-tab
  const filteredJobs = useMemo(() => {
    let filtered = jobPosts;

    if (activeJobSubTab === 'myPosts') {
      filtered = filtered.filter(job => job.isMyPost);
    } else if (activeJobSubTab === 'proposals') {
      // In a real app, this would show jobs where user submitted proposals
      filtered = filtered.filter(job => job.id === '1');
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [jobPosts, activeJobSubTab, searchQuery]);

  // Filter gigs based on search and sub-tab
  const filteredGigs = useMemo(() => {
    let filtered = gigPosts;

    if (activeGigSubTab === 'myGigs') {
      filtered = filtered.filter(gig => gig.isMyGig);
    } else if (activeGigSubTab === 'requests') {
      // In a real app, this would show requests made to user's gigs
      filtered = filtered.filter(gig => gig.id === '1');
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(gig =>
        gig.title.toLowerCase().includes(query) ||
        gig.sellerName.toLowerCase().includes(query) ||
        gig.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [gigPosts, activeGigSubTab, searchQuery]);

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
    }, [])
  );

  const handleSendProposal = () => {
    if (!proposalText.trim() || !proposalBid.trim()) return;
    alert(`Proposal sent!\nBid: ${proposalBid}\nMessage: ${proposalText}`);
    setShowJobModal(false);
    setProposalText('');
    setProposalBid('');
  };

  const handleSendRequest = () => {
    if (!requestMessage.trim() || !selectedTier) return;
    alert(`Request sent for ${selectedTier.name} tier!\nMessage: ${requestMessage}`);
    setShowGigModal(false);
    setRequestMessage('');
    setSelectedTier(null);
    setExpandedGigId(null);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    return (
      <View style={styles.starsContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <Text key={i} style={styles.starFilled}>★</Text>
        ))}
        {[...Array(5 - fullStars)].map((_, i) => (
          <Text key={i} style={styles.starEmpty}>★</Text>
        ))}
        <Text style={styles.ratingText}>{rating}</Text>
      </View>
    );
  };

  const renderJobCard = ({ item }: { item: JobPost }) => (
    <Pressable style={styles.jobCard} onPress={() => {
      setSelectedJob(item);
      setShowJobModal(true);
    }}>
      <Image source={{ uri: item.bannerImage }} style={styles.jobCardImage} />
      <View style={styles.jobCardContent}>
        <View style={styles.jobCardHeader}>
          <Text style={styles.jobCardTitle} numberOfLines={1}>{item.title}</Text>
          {item.isMyPost && <View style={styles.myBadge}><Text style={styles.myBadgeText}>My Post</Text></View>}
        </View>
        <Text style={styles.jobCardCompany}>{item.company} • {item.location}</Text>
        <Text style={styles.jobCardDescription} numberOfLines={2}>{item.description}</Text>
        <View style={styles.jobCardFooter}>
          <Text style={styles.jobCardBudget}>{item.budget}</Text>
          <View style={styles.jobCardPoster}>
            <Image source={{ uri: item.postedByAvatar }} style={styles.posterAvatar} />
            <Text style={styles.posterName}>{item.postedBy}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const renderGigCard = ({ item }: { item: GigPost }) => (
    <View style={styles.gigCard}>
      <Pressable onPress={() => {
        if (expandedGigId === item.id) {
          setExpandedGigId(null);
        } else {
          setExpandedGigId(item.id);
          setSelectedGig(item);
        }
      }}>
        <Image source={{ uri: item.bannerImage }} style={styles.gigCardImage} />
        <View style={styles.gigCardContent}>
          <View style={styles.gigCardHeader}>
            <Text style={styles.gigCardTitle} numberOfLines={1}>{item.title}</Text>
            {item.isMyGig && <View style={styles.myBadge}><Text style={styles.myBadgeText}>My Gig</Text></View>}
          </View>
          <Text style={styles.gigCardCategory}>{item.category}</Text>
          <View style={styles.gigCardStats}>
            {renderStars(item.rating)}
            <Text style={styles.gigCardSales}>{item.totalSales} sales</Text>
          </View>
          <Text style={styles.gigCardDescription} numberOfLines={expandedGigId === item.id ? undefined : 2}>
            {item.description}
          </Text>

          {/* Price Tiers */}
          <View style={styles.tiersContainer}>
            {item.tiers.map((tier) => (
              <View key={tier.id} style={styles.tierItem}>
                <Text style={styles.tierName}>{tier.name}</Text>
                <Text style={styles.tierPrice}>{tier.price}</Text>
              </View>
            ))}
          </View>

          {expandedGigId === item.id && (
            <View style={styles.expandedContent}>
              <View style={styles.sellerInfo}>
                <Image source={{ uri: item.sellerAvatar }} style={styles.sellerAvatar} />
                <View>
                  <Text style={styles.sellerName}>{item.sellerName}</Text>
                  <Text style={styles.sellerStats}>{item.totalSales} sales • {item.rating}★</Text>
                </View>
              </View>

              <Text style={styles.expandedDescription}>{item.description}</Text>

              <Text style={styles.tiersTitle}>Service Tiers:</Text>
              {item.tiers.map((tier) => (
                <Pressable
                  key={tier.id}
                  style={[styles.tierCard, selectedTier?.id === tier.id && styles.selectedTierCard]}
                  onPress={() => setSelectedTier(tier)}
                >
                  <View style={styles.tierCardHeader}>
                    <Text style={styles.tierCardName}>{tier.name}</Text>
                    <Text style={styles.tierCardPrice}>{tier.price}</Text>
                  </View>
                  <Text style={styles.tierCardDescription}>{tier.description}</Text>
                  <Text style={styles.tierCardDelivery}>Delivery: {tier.deliveryDays} days</Text>
                </Pressable>
              ))}

              <Pressable
                style={styles.requestButton}
                onPress={() => setShowGigModal(true)}
              >
                <Text style={styles.requestButtonText}>Send Request</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );

  // @ts-ignore
    let view = <><Animated.View style={[styles.screen, {
        opacity: pageFadeAnim,
        transform: [{translateY: pageSlideAnim}, {scale: pageScaleAnim}]
    }]}>
        <SafeAreaView style={styles.safeArea}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <AppTitle size="sm"/>
                    <Pressable style={styles.iconButton}>
                        <MaterialIcons name="filter-list" size={18} color="#DCE6F4"/>
                    </Pressable>
                </View>

                {/* Page Title */}
                <Text style={styles.title}>Postings</Text>

                {/* Main Tabs */}
                <View style={styles.mainTabs}>
                    <Pressable style={[styles.mainTab, activeTab === 'jobs' && styles.mainTabActive]}
                               onPress={() => setActiveTab('jobs')}>
                        <Text style={[styles.mainTabText, activeTab === 'jobs' && styles.mainTabTextActive]}>Jobs</Text>
                    </Pressable>
                    <Pressable style={[styles.mainTab, activeTab === 'gigs' && styles.mainTabActive]}
                               onPress={() => setActiveTab('gigs')}>
                        <Text style={[styles.mainTabText, activeTab === 'gigs' && styles.mainTabTextActive]}>Gigs</Text>
                    </Pressable>
                </View>

                {/* Search Bar */}
                <View style={styles.searchWrap}>
                    <MaterialIcons name="search" size={18} color="#718099"/>
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder={`Search ${activeTab === 'jobs' ? 'jobs' : 'gigs'}...`}
                        placeholderTextColor="#718099"
                        style={styles.searchInput}
                    />
                </View>

                {/* Sub Tabs */}
                {activeTab === 'jobs' ? (
                    <View style={styles.subTabs}>
                        <Pressable style={[styles.subTab, activeJobSubTab === 'all' && styles.subTabActive]}
                                   onPress={() => setActiveJobSubTab('all')}>
                            <Text style={[styles.subTabText, activeJobSubTab === 'all' && styles.subTabTextActive]}>All
                                Jobs</Text>
                        </Pressable>
                        <Pressable style={[styles.subTab, activeJobSubTab === 'myPosts' && styles.subTabActive]}
                                   onPress={() => setActiveJobSubTab('myPosts')}>
                            <Text style={[styles.subTabText, activeJobSubTab === 'myPosts' && styles.subTabTextActive]}>My
                                Posts</Text>
                        </Pressable>
                        <Pressable style={[styles.subTab, activeJobSubTab === 'proposals' && styles.subTabActive]}
                                   onPress={() => setActiveJobSubTab('proposals')}>
                            <Text
                                style={[styles.subTabText, activeJobSubTab === 'proposals' && styles.subTabTextActive]}>My
                                Proposals</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.subTabs}>
                        <Pressable style={[styles.subTab, activeGigSubTab === 'all' && styles.subTabActive]}
                                   onPress={() => setActiveGigSubTab('all')}>
                            <Text style={[styles.subTabText, activeGigSubTab === 'all' && styles.subTabTextActive]}>All
                                Gigs</Text>
                        </Pressable>
                        <Pressable style={[styles.subTab, activeGigSubTab === 'myGigs' && styles.subTabActive]}
                                   onPress={() => setActiveGigSubTab('myGigs')}>
                            <Text style={[styles.subTabText, activeGigSubTab === 'myGigs' && styles.subTabTextActive]}>My
                                Gigs</Text>
                        </Pressable>
                        <Pressable style={[styles.subTab, activeGigSubTab === 'requests' && styles.subTabActive]}
                                   onPress={() => setActiveGigSubTab('requests')}>
                            <Text
                                style={[styles.subTabText, activeGigSubTab === 'requests' && styles.subTabTextActive]}>My
                                Requests</Text>
                        </Pressable>
                    </View>
                )}

                {/* Results Count */}
                <Text style={styles.resultsCount}>
                    Showing {activeTab === 'jobs' ? filteredJobs.length : filteredGigs.length} results
                </Text>

                {/* 2-Column Grid */}
                <FlatList
                    data={activeTab === 'jobs' ? filteredJobs : filteredGigs}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.gridRow}
                    scrollEnabled={false}
                    renderItem={activeTab === 'jobs' ? renderJobCard : renderGigCard}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="inbox" size={48} color="#718099"/>
                            <Text style={styles.emptyText}>No {activeTab === 'jobs' ? 'jobs' : 'gigs'} found</Text>
                        </View>
                    }
                />
            </ScrollView>
        </SafeAreaView>

        {/* Job Modal - Send Proposal */}
        <Modal visible={showJobModal} animationType="slide" transparent onRequestClose={() => setShowJobModal(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <ScrollView>
                        {selectedJob && (
                            <>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Send Proposal</Text>
                                    <Pressable onPress={() => setShowJobModal(false)}>
                                        <MaterialIcons name="close" size={24} color="#F4F8FF"/>
                                    </Pressable>
                                </View>
                                <Text style={styles.modalJobTitle}>{selectedJob.title}</Text>
                                <Text style={styles.modalJobBudget}>Budget: {selectedJob.budget}</Text>

                                <Text style={styles.modalLabel}>Your Bid Amount</Text>
                                <TextInput
                                    value={proposalBid}
                                    onChangeText={setProposalBid}
                                    placeholder="e.g., $2,500"
                                    placeholderTextColor="#718099"
                                    style={styles.modalInput}
                                />

                                <Text style={styles.modalLabel}>Cover Letter</Text>
                                <TextInput
                                    value={proposalText}
                                    onChangeText={setProposalText}
                                    placeholder="Explain why you're the best fit for this job..."
                                    placeholderTextColor="#718099"
                                    style={[styles.modalInput, styles.modalTextArea]}
                                    multiline
                                    numberOfLines={6}
                                />

                                <Pressable style={styles.sendButton} onPress={handleSendProposal}>
                                    <Text style={styles.sendButtonText}>Send Proposal</Text>
                                </Pressable>
                            </>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>

        {/* Gig Modal - Send Request */}
        <Modal visible={showGigModal} animationType="slide" transparent onRequestClose={() => setShowGigModal(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <ScrollView>
                        {selectedGig && (
                            <>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Request Service</Text>
                                    <Pressable onPress={() => setShowGigModal(false)}>
                                        <MaterialIcons name="close" size={24} color="#F4F8FF"/>
                                    </Pressable>
                                </View>
                                <Text style={styles.modalJobTitle}>{selectedGig.title}</Text>
                                <Text style={styles.modalJobBudget}>Seller: {selectedGig.sellerName}</Text>

                                {selectedTier && (
                                    <View style={styles.selectedTierInfo}>
                                        <Text style={styles.selectedTierName}>Selected Tier: {selectedTier.name}</Text>
                                        <Text style={styles.selectedTierPrice}>{selectedTier.price}</Text>
                                    </View>
                                )}

                                <Text style={styles.modalLabel}>Your Message</Text>
                                <TextInput
                                    value={requestMessage}
                                    onChangeText={setRequestMessage}
                                    placeholder="Describe your project requirements..."
                                    placeholderTextColor="#718099"
                                    style={[styles.modalInput, styles.modalTextArea]}
                                    multiline
                                    numberOfLines={6}
                                />

                                <Pressable style={styles.sendButton} onPress={handleSendRequest}>
                                    <Text style={styles.sendButtonText}>Send Request</Text>
                                </Pressable>
                            </>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>

        <FloatingNavBar/>
    </Animated.View></>;
    return view;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#090B10' },
  safeArea: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { color: '#F4F8FF', fontSize: 28, fontWeight: '900', marginBottom: 16, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  iconButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', alignItems: 'center', justifyContent: 'center' },

  mainTabs: { flexDirection: 'row', backgroundColor: '#11151C', borderRadius: 14, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: '#1B2230' },
  mainTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  mainTabActive: { backgroundColor: '#15C8FF' },
  mainTabText: { color: '#8A93A3', fontSize: 14, fontWeight: '700', fontFamily: 'PlusJakartaSans_700Bold' },
  mainTabTextActive: { color: '#041117' },

  subTabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  subTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 20, backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230' },
  subTabActive: { backgroundColor: '#00D1FF', borderColor: '#00D1FF' },
  subTabText: { color: '#8A93A3', fontSize: 12, fontWeight: '600', fontFamily: 'PlusJakartaSans_600SemiBold' },
  subTabTextActive: { color: '#041117' },

  searchWrap: { backgroundColor: '#11151C', borderRadius: 14, borderWidth: 1, borderColor: '#1B2230', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, height: 46, marginBottom: 12 },
  searchInput: { flex: 1, color: '#F4F8FF', fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular' },
  resultsCount: { color: '#718099', fontSize: 12, marginBottom: 12, fontFamily: 'PlusJakartaSans_400Regular' },

  gridRow: { justifyContent: 'space-between', marginBottom: 12, gap: 12 },

  // Job Card Styles
  jobCard: { width: (SCREEN_WIDTH - 44) / 2, backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', borderRadius: 16, overflow: 'hidden' },
  jobCardImage: { width: '100%', height: 100 },
  jobCardContent: { padding: 10 },
  jobCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  jobCardTitle: { color: '#F4F8FF', fontSize: 13, fontWeight: '700', flex: 1, fontFamily: 'PlusJakartaSans_700Bold' },
  jobCardCompany: { color: '#8A93A3', fontSize: 10, marginBottom: 8, fontFamily: 'PlusJakartaSans_400Regular' },
  jobCardDescription: { color: '#D8E0EE', fontSize: 11, lineHeight: 15, marginBottom: 10, fontFamily: 'PlusJakartaSans_400Regular' },
  jobCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jobCardBudget: { color: '#00D1FF', fontSize: 12, fontWeight: '800', fontFamily: 'PlusJakartaSans_800ExtraBold' },
  jobCardPoster: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  posterAvatar: { width: 18, height: 18, borderRadius: 9 },
  posterName: { color: '#718099', fontSize: 9, fontFamily: 'PlusJakartaSans_400Regular' },

  // Gig Card Styles
  gigCard: { width: (SCREEN_WIDTH - 44) / 2, backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', borderRadius: 16, overflow: 'hidden', marginBottom: 0 },
  gigCardImage: { width: '100%', height: 100 },
  gigCardContent: { padding: 10 },
  gigCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  gigCardTitle: { color: '#F4F8FF', fontSize: 13, fontWeight: '700', flex: 1, fontFamily: 'PlusJakartaSans_700Bold' },
  gigCardCategory: { color: '#15C8FF', fontSize: 10, fontWeight: '600', marginBottom: 6, fontFamily: 'PlusJakartaSans_600SemiBold' },
  gigCardStats: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  gigCardSales: { color: '#718099', fontSize: 10, fontFamily: 'PlusJakartaSans_400Regular' },
  gigCardDescription: { color: '#D8E0EE', fontSize: 11, lineHeight: 15, marginBottom: 10, fontFamily: 'PlusJakartaSans_400Regular' },

  tiersContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginBottom: 8 },
  tierItem: { flex: 1, backgroundColor: '#0E1620', borderRadius: 8, padding: 6, alignItems: 'center' },
  tierName: { color: '#8A93A3', fontSize: 9, fontFamily: 'PlusJakartaSans_500Medium' },
  tierPrice: { color: '#00D1FF', fontSize: 10, fontWeight: '700', fontFamily: 'PlusJakartaSans_700Bold' },

  expandedContent: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1B2230' },
  sellerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sellerAvatar: { width: 40, height: 40, borderRadius: 20 },
  sellerName: { color: '#F4F8FF', fontSize: 13, fontWeight: '700', fontFamily: 'PlusJakartaSans_700Bold' },
  sellerStats: { color: '#718099', fontSize: 11, fontFamily: 'PlusJakartaSans_400Regular' },
  expandedDescription: { color: '#D8E0EE', fontSize: 12, lineHeight: 18, marginBottom: 12, fontFamily: 'PlusJakartaSans_400Regular' },
  tiersTitle: { color: '#F4F8FF', fontSize: 12, fontWeight: '700', marginBottom: 8, fontFamily: 'PlusJakartaSans_700Bold' },
  tierCard: { backgroundColor: '#0E1620', borderRadius: 12, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#1B2230' },
  selectedTierCard: { borderColor: '#00D1FF', backgroundColor: '#0D3341' },
  tierCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  tierCardName: { color: '#F4F8FF', fontSize: 12, fontWeight: '700', fontFamily: 'PlusJakartaSans_700Bold' },
  tierCardPrice: { color: '#00D1FF', fontSize: 12, fontWeight: '800', fontFamily: 'PlusJakartaSans_800ExtraBold' },
  tierCardDescription: { color: '#8A93A3', fontSize: 11, marginBottom: 6, fontFamily: 'PlusJakartaSans_400Regular' },
  tierCardDelivery: { color: '#718099', fontSize: 10, fontFamily: 'PlusJakartaSans_400Regular' },

  requestButton: { backgroundColor: '#00D1FF', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  requestButtonText: { color: '#041117', fontSize: 13, fontWeight: '800', fontFamily: 'PlusJakartaSans_800ExtraBold' },

  starsContainer: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  starFilled: { fontSize: 10, color: '#FBBF24' },
  starEmpty: { fontSize: 10, color: '#4B5563' },
  ratingText: { fontSize: 10, color: '#9CA3AF', marginLeft: 2 },

  myBadge: { backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  myBadgeText: { color: '#FFFFFF', fontSize: 8, fontWeight: '700', fontFamily: 'PlusJakartaSans_700Bold' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { color: '#718099', fontSize: 14, marginTop: 12, fontFamily: 'PlusJakartaSans_400Regular' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#11151C', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: '#F4F8FF', fontSize: 20, fontWeight: '800', fontFamily: 'PlusJakartaSans_800ExtraBold' },
  modalJobTitle: { color: '#F4F8FF', fontSize: 16, fontWeight: '700', marginBottom: 4, fontFamily: 'PlusJakartaSans_700Bold' },
  modalJobBudget: { color: '#00D1FF', fontSize: 14, marginBottom: 16, fontFamily: 'PlusJakartaSans_600SemiBold' },
  modalLabel: { color: '#8A93A3', fontSize: 12, fontWeight: '600', marginBottom: 8, fontFamily: 'PlusJakartaSans_600SemiBold' },
  modalInput: { backgroundColor: '#0E1620', borderWidth: 1, borderColor: '#1B2230', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#F4F8FF', fontSize: 13, marginBottom: 16, fontFamily: 'PlusJakartaSans_400Regular' },
  modalTextArea: { minHeight: 100, textAlignVertical: 'top' },
  sendButton: { backgroundColor: '#00D1FF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  sendButtonText: { color: '#041117', fontSize: 14, fontWeight: '800', fontFamily: 'PlusJakartaSans_800ExtraBold' },
  selectedTierInfo: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#0D3341', borderRadius: 12, padding: 12, marginBottom: 16 },
  selectedTierName: { color: '#F4F8FF', fontSize: 13, fontWeight: '700', fontFamily: 'PlusJakartaSans_700Bold' },
  selectedTierPrice: { color: '#00D1FF', fontSize: 13, fontWeight: '800', fontFamily: 'PlusJakartaSans_800ExtraBold' },
});