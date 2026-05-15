import { AppTitle } from '@/components/app-title';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState, useRef, useCallback } from 'react';
import {
  Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput,
  View, Animated, Modal, FlatList, Dimensions, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import FloatingNavBar from '@/components/FloatingNavBar';
import { auth } from '../../firebase';
import { createJobPost, getAllJobs, getMyJobs, createGigPost, getAllGigs, getMyGigs } from '../../function/posts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const JOB_TYPES = ['Full-time','Part-time','Contract','Freelance'] as const;

export default function JobsScreen() {
  const uid = auth.currentUser?.uid ?? null;
  const [activeTab, setActiveTab] = useState<'jobs'|'gigs'>('jobs');
  const [activeJobSubTab, setActiveJobSubTab] = useState<'all'|'myPosts'>('all');
  const [activeGigSubTab, setActiveGigSubTab] = useState<'all'|'myGigs'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [allGigs, setAllGigs] = useState<any[]>([]);
  const [myGigs, setMyGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedGigId, setExpandedGigId] = useState<string|null>(null);
  const [selectedJob, setSelectedJob] = useState<any|null>(null);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [selectedGig, setSelectedGig] = useState<any|null>(null);
  const [showGigDetail, setShowGigDetail] = useState(false);

  // Post Job modal
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobBudget, setJobBudget] = useState('');
  const [jobType, setJobType] = useState<typeof JOB_TYPES[number]>('Freelance');
  const [jobBannerUri, setJobBannerUri] = useState<string>('');
  const [postingJob, setPostingJob] = useState(false);

  // Post Gig modal
  const [showPostGigModal, setShowPostGigModal] = useState(false);
  const [gigTitle, setGigTitle] = useState('');
  const [gigDescription, setGigDescription] = useState('');
  const [gigCategory, setGigCategory] = useState('');
  const [gigBasicPrice, setGigBasicPrice] = useState('');
  const [gigStandardPrice, setGigStandardPrice] = useState('');
  const [gigPremiumPrice, setGigPremiumPrice] = useState('');
  const [gigBannerUri, setGigBannerUri] = useState<string>('');
  const [postingGig, setPostingGig] = useState(false);

  // Edit Job modal
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<any|null>(null);
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editJobDescription, setEditJobDescription] = useState('');
  const [editJobCompany, setEditJobCompany] = useState('');
  const [editJobLocation, setEditJobLocation] = useState('');
  const [editJobBudget, setEditJobBudget] = useState('');
  const [editJobType, setEditJobType] = useState<typeof JOB_TYPES[number]>('Freelance');
  const [editJobBannerUri, setEditJobBannerUri] = useState<string>('');
  const [savingJob, setSavingJob] = useState(false);

  // Edit Gig modal
  const [showEditGigModal, setShowEditGigModal] = useState(false);
  const [editingGig, setEditingGig] = useState<any|null>(null);
  const [editGigTitle, setEditGigTitle] = useState('');
  const [editGigDescription, setEditGigDescription] = useState('');
  const [editGigCategory, setEditGigCategory] = useState('');
  const [editGigBannerUri, setEditGigBannerUri] = useState<string>('');
  const [savingGig, setSavingGig] = useState(false);

  // Filter
  const [filterType, setFilterType] = useState<string>('All');

  const pickImage = async (onPick: (uri: string) => void) => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to your photo library.');
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onPick(result.assets[0].uri);
    }
  };

  const pageFadeAnim = useRef(new Animated.Value(0)).current;
  const pageSlideAnim = useRef(new Animated.Value(50)).current;
  const pageScaleAnim = useRef(new Animated.Value(0.95)).current;

  const loadData = useCallback(async () => {
    setLoading(true);
    const [aj, ag] = await Promise.all([getAllJobs(), getAllGigs()]);
    if (aj.status === 200) setAllJobs(aj.jobs ?? []);
    if (ag.status === 200) setAllGigs(ag.gigs ?? []);
    if (uid) {
      const [mj, mg] = await Promise.all([getMyJobs(uid), getMyGigs(uid)]);
      if (mj.status === 200) setMyJobs(mj.jobs ?? []);
      if (mg.status === 200) setMyGigs(mg.gigs ?? []);
    }
    setLoading(false);
  }, [uid]);

  useFocusEffect(useCallback(() => {
    pageFadeAnim.setValue(0); pageSlideAnim.setValue(50); pageScaleAnim.setValue(0.95);
    Animated.parallel([
      Animated.timing(pageFadeAnim, { toValue:1, duration:500, useNativeDriver:true }),
      Animated.spring(pageSlideAnim, { toValue:0, tension:80, friction:10, useNativeDriver:true }),
      Animated.spring(pageScaleAnim, { toValue:1, tension:80, friction:10, useNativeDriver:true }),
    ]).start();
    loadData();
  }, [loadData]));

  const jobsSource = activeJobSubTab === 'myPosts' ? myJobs : allJobs;
  const gigsSource = activeGigSubTab === 'myGigs' ? myGigs : allGigs;

  const filteredJobs = useMemo(() => {
    let list = jobsSource;
    if (filterType !== 'All') list = list.filter(j => j.type === filterType);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(j => j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q) || j.description?.toLowerCase().includes(q));
  }, [jobsSource, searchQuery, filterType]);

  const filteredGigs = useMemo(() => {
    let list = gigsSource;
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(g => g.title?.toLowerCase().includes(q) || g.category?.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q));
  }, [gigsSource, searchQuery]);

  const handlePostJob = async () => {
    if (!jobTitle.trim() || !jobDescription.trim() || !jobBudget.trim()) {
      Alert.alert('Error','Please fill in title, description, and budget'); return;
    }
    if (!uid) { Alert.alert('Error','You must be logged in'); return; }
    setPostingJob(true);
    const user = auth.currentUser;
    const res = await createJobPost({
      title: jobTitle, description: jobDescription, company: jobCompany || 'My Studio',
      location: jobLocation || 'Remote', budget: jobBudget, type: jobType,
      postedByUid: uid, postedBy: user?.displayName || 'You',
      bannerImage: jobBannerUri || '',
    });
    if (res.status === 200) {
      setShowPostJobModal(false);
      setJobTitle(''); setJobDescription(''); setJobCompany(''); setJobLocation(''); setJobBudget(''); setJobBannerUri('');
      await loadData();
    } else Alert.alert('Error','Failed to post job');
    setPostingJob(false);
  };

  const handlePostGig = async () => {
    if (!gigTitle.trim() || !gigDescription.trim() || !gigBasicPrice.trim()) {
      Alert.alert('Error','Please fill in title, description, and at least the Basic price'); return;
    }
    if (!uid) { Alert.alert('Error','You must be logged in'); return; }
    setPostingGig(true);
    const user = auth.currentUser;
    const res = await createGigPost({
      title: gigTitle, description: gigDescription, category: gigCategory || 'General',
      sellerUid: uid, sellerName: user?.displayName || 'You',
      bannerImage: gigBannerUri || '',
      tiers: [
        { id:'t1', name:'Basic', price: gigBasicPrice, description:'Basic package', deliveryDays:3 },
        ...(gigStandardPrice ? [{ id:'t2', name:'Standard', price: gigStandardPrice, description:'Standard package', deliveryDays:5 }] : []),
        ...(gigPremiumPrice ? [{ id:'t3', name:'Premium', price: gigPremiumPrice, description:'Premium package', deliveryDays:7 }] : []),
      ],
    });
    if (res.status === 200) {
      setShowPostGigModal(false);
      setGigTitle(''); setGigDescription(''); setGigCategory(''); setGigBasicPrice(''); setGigStandardPrice(''); setGigPremiumPrice(''); setGigBannerUri('');
      await loadData();
    } else Alert.alert('Error','Failed to post gig');
    setPostingGig(false);
  };

  const openEditJob = (item: any) => {
    setEditingJob(item);
    setEditJobTitle(item.title);
    setEditJobDescription(item.description);
    setEditJobCompany(item.company);
    setEditJobLocation(item.location);
    setEditJobBudget(item.budget);
    setEditJobType(item.type);
    setEditJobBannerUri(item.bannerImage || '');
    setShowEditJobModal(true);
  };

  const handleSaveJob = async () => {
    if (!editingJob) return;
    setSavingJob(true);
    const { updateJobPost } = await import('../../function/posts');
    await updateJobPost(editingJob.id, { title: editJobTitle, description: editJobDescription, company: editJobCompany, location: editJobLocation, budget: editJobBudget, type: editJobType, bannerImage: editJobBannerUri });
    setShowEditJobModal(false);
    setSavingJob(false);
    await loadData();
  };

  const handleArchiveJob = (item: any) => {
    Alert.alert('Archive Job', `Archive "${item.title}"? It will no longer be visible to others.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Archive', style: 'destructive', onPress: async () => {
        const { archivePost } = await import('../../function/posts');
        await archivePost('jobs', item.id);
        await loadData();
      }},
    ]);
  };

  const openEditGig = (item: any) => {
    setEditingGig(item);
    setEditGigTitle(item.title);
    setEditGigDescription(item.description);
    setEditGigCategory(item.category);
    setEditGigBannerUri(item.bannerImage || '');
    setShowEditGigModal(true);
  };

  const handleSaveGig = async () => {
    if (!editingGig) return;
    setSavingGig(true);
    const { updateGigPost } = await import('../../function/posts');
    await updateGigPost(editingGig.id, { title: editGigTitle, description: editGigDescription, category: editGigCategory, bannerImage: editGigBannerUri });
    setShowEditGigModal(false);
    setSavingGig(false);
    await loadData();
  };

  const handleArchiveGig = (item: any) => {
    Alert.alert('Archive Gig', `Archive "${item.title}"? It will no longer be visible to others.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Archive', style: 'destructive', onPress: async () => {
        const { archivePost } = await import('../../function/posts');
        await archivePost('gigs', item.id);
        await loadData();
      }},
    ]);
  };

  const renderJobCard = ({ item }: { item: any }) => {
    const isOwn = item.postedByUid === uid && activeJobSubTab === 'myPosts';
    return (
      <Pressable style={styles.jobCard} onPress={() => { setSelectedJob(item); setShowJobDetail(true); }}>
        {item.bannerImage ? <Image source={{ uri: item.bannerImage }} style={styles.jobCardImage} /> : null}
        <View style={styles.jobCardContent}>
          <View style={styles.jobCardHeader}>
            <Text style={styles.jobCardTitle} numberOfLines={1}>{item.title}</Text>
            {item.postedByUid === uid && <View style={styles.myBadge}><Text style={styles.myBadgeText}>Mine</Text></View>}
          </View>
          <Text style={styles.jobCardCompany}>{item.company} • {item.location}</Text>
          <Text style={styles.jobCardDescription} numberOfLines={2}>{item.description}</Text>
          <View style={styles.jobCardFooter}>
            <Text style={styles.jobCardBudget}>{item.budget}</Text>
            <View style={styles.typeBadge}><Text style={styles.typeBadgeText}>{item.type}</Text></View>
          </View>
          {isOwn && (
            <View style={styles.cardActions}>
              <Pressable style={styles.editBtn} onPress={(e) => { e.stopPropagation?.(); openEditJob(item); }}>
                <MaterialIcons name="edit" size={13} color="#15C8FF"/>
                <Text style={styles.editBtnText}>Edit</Text>
              </Pressable>
              <Pressable style={styles.archiveBtn} onPress={(e) => { e.stopPropagation?.(); handleArchiveJob(item); }}>
                <MaterialIcons name="archive" size={13} color="#EF4444"/>
                <Text style={styles.archiveBtnText}>Archive</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  const renderGigCard = ({ item }: { item: any }) => {
    const isOwn = item.sellerUid === uid && activeGigSubTab === 'myGigs';
    return (
      <Pressable style={styles.gigCard} onPress={() => { setSelectedGig(item); setShowGigDetail(true); }}>
        {item.bannerImage ? <Image source={{ uri: item.bannerImage }} style={styles.gigCardImage} /> : null}
        <View style={styles.gigCardContent}>
          <View style={styles.gigCardHeader}>
            <Text style={styles.gigCardTitle} numberOfLines={1}>{item.title}</Text>
            {item.sellerUid === uid && <View style={styles.myBadge}><Text style={styles.myBadgeText}>Mine</Text></View>}
          </View>
          <Text style={styles.gigCardCategory}>{item.category}</Text>
          <Text style={styles.gigCardDescription} numberOfLines={2}>{item.description}</Text>
          {(item.tiers ?? []).length > 0 && (
            <View style={styles.tiersContainer}>
              {(item.tiers as any[]).map((t: any) => (
                <View key={t.id} style={styles.tierItem}>
                  <Text style={styles.tierName}>{t.name}</Text>
                  <Text style={styles.tierPrice}>{t.price}</Text>
                </View>
              ))}
            </View>
          )}
          {isOwn && (
            <View style={styles.cardActions}>
              <Pressable style={styles.editBtn} onPress={(e) => { e.stopPropagation?.(); openEditGig(item); }}>
                <MaterialIcons name="edit" size={13} color="#15C8FF"/>
                <Text style={styles.editBtnText}>Edit</Text>
              </Pressable>
              <Pressable style={styles.archiveBtn} onPress={(e) => { e.stopPropagation?.(); handleArchiveGig(item); }}>
                <MaterialIcons name="archive" size={13} color="#EF4444"/>
                <Text style={styles.archiveBtnText}>Archive</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <Animated.View style={[styles.screen, { opacity: pageFadeAnim, transform:[{translateY:pageSlideAnim},{scale:pageScaleAnim}] }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <AppTitle size="sm"/>
          </View>

          <Text style={styles.title}>Postings</Text>

          <View style={styles.mainTabs}>
            <Pressable style={[styles.mainTab, activeTab==='jobs' && styles.mainTabActive]} onPress={() => setActiveTab('jobs')}>
              <Text style={[styles.mainTabText, activeTab==='jobs' && styles.mainTabTextActive]}>Jobs</Text>
            </Pressable>
            <Pressable style={[styles.mainTab, activeTab==='gigs' && styles.mainTabActive]} onPress={() => setActiveTab('gigs')}>
              <Text style={[styles.mainTabText, activeTab==='gigs' && styles.mainTabTextActive]}>Gigs</Text>
            </Pressable>
          </View>

          <View style={styles.searchWrap}>
            <MaterialIcons name="search" size={18} color="#718099"/>
            <TextInput value={searchQuery} onChangeText={setSearchQuery}
              placeholder={`Search ${activeTab}...`} placeholderTextColor="#718099" style={styles.searchInput}/>
          </View>

          {activeTab === 'jobs' ? (
            <View style={styles.subTabs}>
              <Pressable style={[styles.subTab, activeJobSubTab==='all' && styles.subTabActive]} onPress={() => setActiveJobSubTab('all')}>
                <Text style={[styles.subTabText, activeJobSubTab==='all' && styles.subTabTextActive]}>All Jobs</Text>
              </Pressable>
              <Pressable style={[styles.subTab, activeJobSubTab==='myPosts' && styles.subTabActive]} onPress={() => setActiveJobSubTab('myPosts')}>
                <Text style={[styles.subTabText, activeJobSubTab==='myPosts' && styles.subTabTextActive]}>My Posts</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.subTabs}>
              <Pressable style={[styles.subTab, activeGigSubTab==='all' && styles.subTabActive]} onPress={() => setActiveGigSubTab('all')}>
                <Text style={[styles.subTabText, activeGigSubTab==='all' && styles.subTabTextActive]}>All Gigs</Text>
              </Pressable>
              <Pressable style={[styles.subTab, activeGigSubTab==='myGigs' && styles.subTabActive]} onPress={() => setActiveGigSubTab('myGigs')}>
                <Text style={[styles.subTabText, activeGigSubTab==='myGigs' && styles.subTabTextActive]}>My Gigs</Text>
              </Pressable>
            </View>
          )}

          {/* Filter chips — jobs only */}
          {activeTab === 'jobs' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
              {['All', ...JOB_TYPES].map(t => (
                <Pressable key={t} style={[styles.filterChip, filterType === t && styles.filterChipActive]} onPress={() => setFilterType(t)}>
                  <Text style={[styles.filterChipText, filterType === t && styles.filterChipTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <View style={styles.postButtonRow}>
            <Pressable style={styles.postButton} onPress={() => activeTab==='jobs' ? setShowPostJobModal(true) : setShowPostGigModal(true)}>
              <MaterialIcons name="add-circle-outline" size={18} color="#041117"/>
              <Text style={styles.postButtonText}>Post {activeTab === 'jobs' ? 'a Job' : 'a Gig'}</Text>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#15C8FF" style={{ marginTop: 40 }}/>
          ) : (
            <FlatList
              data={activeTab==='jobs' ? filteredJobs : filteredGigs}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              scrollEnabled={false}
              renderItem={activeTab==='jobs' ? renderJobCard : renderGigCard}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="inbox" size={48} color="#718099"/>
                  <Text style={styles.emptyText}>No {activeTab} yet. Be the first to post!</Text>
                </View>
              }
            />
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Post Job Modal */}
      <Modal visible={showPostJobModal} animationType="slide" transparent onRequestClose={() => setShowPostJobModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Post a Job</Text>
              <Pressable onPress={() => setShowPostJobModal(false)}>
                <MaterialIcons name="close" size={24} color="#F4F8FF"/>
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Job Title *</Text>
              <TextInput value={jobTitle} onChangeText={setJobTitle} placeholder="e.g. Senior Video Editor" placeholderTextColor="#718099" style={styles.modalInput}/>
              <Text style={styles.modalLabel}>Description *</Text>
              <TextInput value={jobDescription} onChangeText={setJobDescription} placeholder="Describe the role..." placeholderTextColor="#718099" style={[styles.modalInput, styles.modalTextArea]} multiline numberOfLines={4}/>
              <Text style={styles.modalLabel}>Company</Text>
              <TextInput value={jobCompany} onChangeText={setJobCompany} placeholder="Your company or studio" placeholderTextColor="#718099" style={styles.modalInput}/>
              <Text style={styles.modalLabel}>Location</Text>
              <TextInput value={jobLocation} onChangeText={setJobLocation} placeholder="Remote / On-site / Hybrid" placeholderTextColor="#718099" style={styles.modalInput}/>
              <Text style={styles.modalLabel}>Budget *</Text>
              <TextInput value={jobBudget} onChangeText={setJobBudget} placeholder="e.g. $500 - $1,000" placeholderTextColor="#718099" style={styles.modalInput}/>
              <Text style={styles.modalLabel}>Job Type</Text>
              <View style={styles.typeRow}>
                {JOB_TYPES.map(t => (
                  <Pressable key={t} style={[styles.typeChip, jobType===t && styles.typeChipActive]} onPress={() => setJobType(t)}>
                    <Text style={[styles.typeChipText, jobType===t && styles.typeChipTextActive]}>{t}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.modalLabel}>Banner Image (optional)</Text>
              <Pressable style={styles.imagePicker} onPress={() => pickImage(setJobBannerUri)}>
                {jobBannerUri ? (
                  <Image source={{ uri: jobBannerUri }} style={styles.imagePickerPreview}/>
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <MaterialIcons name="add-photo-alternate" size={28} color="#718099"/>
                    <Text style={styles.imagePickerText}>Tap to upload banner</Text>
                  </View>
                )}
              </Pressable>
              <Pressable style={[styles.sendButton, postingJob && {opacity:0.6}]} onPress={handlePostJob} disabled={postingJob}>
                {postingJob ? <ActivityIndicator size="small" color="#041117"/> : <Text style={styles.sendButtonText}>Post Job</Text>}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Post Gig Modal */}
      <Modal visible={showPostGigModal} animationType="slide" transparent onRequestClose={() => setShowPostGigModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Post a Gig</Text>
              <Pressable onPress={() => setShowPostGigModal(false)}>
                <MaterialIcons name="close" size={24} color="#F4F8FF"/>
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Gig Title *</Text>
              <TextInput value={gigTitle} onChangeText={setGigTitle} placeholder="e.g. I will edit your video professionally" placeholderTextColor="#718099" style={styles.modalInput}/>
              <Text style={styles.modalLabel}>Description *</Text>
              <TextInput value={gigDescription} onChangeText={setGigDescription} placeholder="Describe your service..." placeholderTextColor="#718099" style={[styles.modalInput, styles.modalTextArea]} multiline numberOfLines={4}/>
              <Text style={styles.modalLabel}>Category</Text>
              <TextInput value={gigCategory} onChangeText={setGigCategory} placeholder="e.g. Video Editing, Motion Graphics" placeholderTextColor="#718099" style={styles.modalInput}/>
              <Text style={styles.modalLabel}>Basic Price *</Text>
              <TextInput value={gigBasicPrice} onChangeText={setGigBasicPrice} placeholder="e.g. $50" placeholderTextColor="#718099" style={styles.modalInput}/>
              <Text style={styles.modalLabel}>Standard Price (optional)</Text>
              <TextInput value={gigStandardPrice} onChangeText={setGigStandardPrice} placeholder="e.g. $100" placeholderTextColor="#718099" style={styles.modalInput}/>
              <Text style={styles.modalLabel}>Premium Price (optional)</Text>
              <TextInput value={gigPremiumPrice} onChangeText={setGigPremiumPrice} placeholder="e.g. $200" placeholderTextColor="#718099" style={styles.modalInput}/>
              <Text style={styles.modalLabel}>Banner Image (optional)</Text>
              <Pressable style={styles.imagePicker} onPress={() => pickImage(setGigBannerUri)}>
                {gigBannerUri ? (
                  <Image source={{ uri: gigBannerUri }} style={styles.imagePickerPreview}/>
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <MaterialIcons name="add-photo-alternate" size={28} color="#718099"/>
                    <Text style={styles.imagePickerText}>Tap to upload banner</Text>
                  </View>
                )}
              </Pressable>
              <Pressable style={[styles.sendButton, postingGig && {opacity:0.6}]} onPress={handlePostGig} disabled={postingGig}>
                {postingGig ? <ActivityIndicator size="small" color="#041117"/> : <Text style={styles.sendButtonText}>Post Gig</Text>}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Job Modal */}
      <Modal visible={showEditJobModal} animationType="slide" transparent onRequestClose={() => setShowEditJobModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Job</Text>
              <Pressable onPress={() => setShowEditJobModal(false)}>
                <MaterialIcons name="close" size={24} color="#F4F8FF"/>
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Job Title</Text>
              <TextInput value={editJobTitle} onChangeText={setEditJobTitle} placeholderTextColor="#718099" style={styles.modalInput}/>
              <Text style={styles.modalLabel}>Description</Text>
              <TextInput value={editJobDescription} onChangeText={setEditJobDescription} placeholderTextColor="#718099" style={[styles.modalInput, styles.modalTextArea]} multiline numberOfLines={4}/>
              <Text style={styles.modalLabel}>Company</Text>
              <TextInput value={editJobCompany} onChangeText={setEditJobCompany} placeholderTextColor="#718099" style={styles.modalInput}/>
              <Text style={styles.modalLabel}>Location</Text>
              <TextInput value={editJobLocation} onChangeText={setEditJobLocation} placeholderTextColor="#718099" style={styles.modalInput}/>
              <Text style={styles.modalLabel}>Budget</Text>
              <TextInput value={editJobBudget} onChangeText={setEditJobBudget} placeholderTextColor="#718099" style={styles.modalInput}/>
              <Text style={styles.modalLabel}>Job Type</Text>
              <View style={styles.typeRow}>
                {JOB_TYPES.map(t => (
                  <Pressable key={t} style={[styles.typeChip, editJobType===t && styles.typeChipActive]} onPress={() => setEditJobType(t)}>
                    <Text style={[styles.typeChipText, editJobType===t && styles.typeChipTextActive]}>{t}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.modalLabel}>Banner Image</Text>
              <Pressable style={styles.imagePicker} onPress={() => pickImage(setEditJobBannerUri)}>
                {editJobBannerUri ? (
                  <Image source={{ uri: editJobBannerUri }} style={styles.imagePickerPreview}/>
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <MaterialIcons name="add-photo-alternate" size={28} color="#718099"/>
                    <Text style={styles.imagePickerText}>Tap to change banner</Text>
                  </View>
                )}
              </Pressable>
              <Pressable style={[styles.sendButton, savingJob && {opacity:0.6}]} onPress={handleSaveJob} disabled={savingJob}>
                {savingJob ? <ActivityIndicator size="small" color="#041117"/> : <Text style={styles.sendButtonText}>Save Changes</Text>}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Gig Modal */}
      <Modal visible={showEditGigModal} animationType="slide" transparent onRequestClose={() => setShowEditGigModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Gig</Text>
              <Pressable onPress={() => setShowEditGigModal(false)}>
                <MaterialIcons name="close" size={24} color="#F4F8FF"/>
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Gig Title</Text>
              <TextInput value={editGigTitle} onChangeText={setEditGigTitle} placeholderTextColor="#718099" style={styles.modalInput}/>
              <Text style={styles.modalLabel}>Description</Text>
              <TextInput value={editGigDescription} onChangeText={setEditGigDescription} placeholderTextColor="#718099" style={[styles.modalInput, styles.modalTextArea]} multiline numberOfLines={4}/>
              <Text style={styles.modalLabel}>Category</Text>
              <TextInput value={editGigCategory} onChangeText={setEditGigCategory} placeholderTextColor="#718099" style={styles.modalInput}/>
              <Text style={styles.modalLabel}>Banner Image</Text>
              <Pressable style={styles.imagePicker} onPress={() => pickImage(setEditGigBannerUri)}>
                {editGigBannerUri ? (
                  <Image source={{ uri: editGigBannerUri }} style={styles.imagePickerPreview}/>
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <MaterialIcons name="add-photo-alternate" size={28} color="#718099"/>
                    <Text style={styles.imagePickerText}>Tap to change banner</Text>
                  </View>
                )}
              </Pressable>
              <Pressable style={[styles.sendButton, savingGig && {opacity:0.6}]} onPress={handleSaveGig} disabled={savingGig}>
                {savingGig ? <ActivityIndicator size="small" color="#041117"/> : <Text style={styles.sendButtonText}>Save Changes</Text>}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Job Detail Modal */}
      <Modal visible={showJobDetail} animationType="slide" transparent onRequestClose={() => setShowJobDetail(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.detailModal}>
            {selectedJob && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {selectedJob.bannerImage && (
                  <Image source={{ uri: selectedJob.bannerImage }} style={styles.detailBanner}/>
                )}
                <View style={styles.detailBody}>
                  <View style={styles.detailHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailTitle}>{selectedJob.title}</Text>
                      <Text style={styles.detailSub}>{selectedJob.company} • {selectedJob.location}</Text>
                    </View>
                    <Pressable onPress={() => setShowJobDetail(false)} style={styles.detailCloseBtn}>
                      <MaterialIcons name="close" size={22} color="#F4F8FF"/>
                    </Pressable>
                  </View>

                  <View style={styles.detailTagRow}>
                    <View style={styles.typeBadgeLg}><Text style={styles.typeBadgeTextLg}>{selectedJob.type}</Text></View>
                    <Text style={styles.detailBudgetLg}>{selectedJob.budget}</Text>
                  </View>

                  <Text style={styles.detailSectionLabel}>About this role</Text>
                  <Text style={styles.detailDescription}>{selectedJob.description}</Text>

                  <View style={styles.detailMetaRow}>
                    <MaterialIcons name="person-outline" size={16} color="#718099"/>
                    <Text style={styles.detailMeta}>Posted by {selectedJob.postedBy}</Text>
                  </View>
                  {selectedJob.proposals != null && (
                    <View style={styles.detailMetaRow}>
                      <MaterialIcons name="description" size={16} color="#718099"/>
                      <Text style={styles.detailMeta}>{selectedJob.proposals} proposals so far</Text>
                    </View>
                  )}

                  {selectedJob.postedByUid !== uid && (
                    <Pressable style={styles.applyButton}>
                      <MaterialIcons name="send" size={16} color="#041117"/>
                      <Text style={styles.applyButtonText}>Send Proposal</Text>
                    </Pressable>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Gig Detail Modal */}
      <Modal visible={showGigDetail} animationType="slide" transparent onRequestClose={() => setShowGigDetail(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.detailModal}>
            {selectedGig && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {selectedGig.bannerImage && (
                  <Image source={{ uri: selectedGig.bannerImage }} style={styles.detailBanner}/>
                )}
                <View style={styles.detailBody}>
                  <View style={styles.detailHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailTitle}>{selectedGig.title}</Text>
                      <Text style={styles.detailSub}>{selectedGig.category}</Text>
                    </View>
                    <Pressable onPress={() => setShowGigDetail(false)} style={styles.detailCloseBtn}>
                      <MaterialIcons name="close" size={22} color="#F4F8FF"/>
                    </Pressable>
                  </View>

                  <View style={styles.sellerRow}>
                    <MaterialIcons name="storefront" size={18} color="#15C8FF"/>
                    <Text style={styles.sellerName}>{selectedGig.sellerName}</Text>
                    {selectedGig.rating > 0 && (
                      <Text style={styles.sellerRating}>★ {selectedGig.rating}</Text>
                    )}
                    {selectedGig.totalSales > 0 && (
                      <Text style={styles.sellerSales}>• {selectedGig.totalSales} sales</Text>
                    )}
                  </View>

                  <Text style={styles.detailSectionLabel}>About this gig</Text>
                  <Text style={styles.detailDescription}>{selectedGig.description}</Text>

                  {(selectedGig.tiers ?? []).length > 0 && (
                    <>
                      <Text style={styles.detailSectionLabel}>Pricing Tiers</Text>
                      {(selectedGig.tiers as any[]).map((t: any) => (
                        <View key={t.id} style={styles.tierDetailCard}>
                          <View style={styles.tierDetailHeader}>
                            <Text style={styles.tierDetailName}>{t.name}</Text>
                            <Text style={styles.tierDetailPrice}>{t.price}</Text>
                          </View>
                          <Text style={styles.tierDetailDesc}>{t.description}</Text>
                          <Text style={styles.tierDetailDelivery}>⏱ Delivery: {t.deliveryDays} days</Text>
                        </View>
                      ))}
                    </>
                  )}

                  {selectedGig.sellerUid !== uid && (
                    <Pressable style={styles.applyButton}>
                      <MaterialIcons name="shopping-cart" size={16} color="#041117"/>
                      <Text style={styles.applyButtonText}>Send Request</Text>
                    </Pressable>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <FloatingNavBar/>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex:1, backgroundColor:'#090B10' },
  safeArea: { flex:1 },
  content: { paddingHorizontal:16, paddingTop:12, paddingBottom:100 },
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:14 },
  title: { color:'#F4F8FF', fontSize:28, fontWeight:'900', marginBottom:16, fontFamily:'PlusJakartaSans_800ExtraBold' },
  iconButton: { width:36, height:36, borderRadius:12, backgroundColor:'#11151C', borderWidth:1, borderColor:'#15C8FF', alignItems:'center', justifyContent:'center' },
  mainTabs: { flexDirection:'row', backgroundColor:'#11151C', borderRadius:14, padding:4, marginBottom:16, borderWidth:1, borderColor:'#1B2230' },
  mainTab: { flex:1, paddingVertical:10, alignItems:'center', borderRadius:10 },
  mainTabActive: { backgroundColor:'#15C8FF' },
  mainTabText: { color:'#8A93A3', fontSize:14, fontWeight:'700', fontFamily:'PlusJakartaSans_700Bold' },
  mainTabTextActive: { color:'#041117' },
  subTabs: { flexDirection:'row', gap:8, marginBottom:12 },
  subTab: { flex:1, paddingVertical:8, alignItems:'center', borderRadius:20, backgroundColor:'#11151C', borderWidth:1, borderColor:'#1B2230' },
  subTabActive: { backgroundColor:'#00D1FF', borderColor:'#00D1FF' },
  subTabText: { color:'#8A93A3', fontSize:12, fontWeight:'600', fontFamily:'PlusJakartaSans_600SemiBold' },
  subTabTextActive: { color:'#041117' },
  searchWrap: { backgroundColor:'#11151C', borderRadius:14, borderWidth:1, borderColor:'#1B2230', flexDirection:'row', alignItems:'center', gap:10, paddingHorizontal:12, height:46, marginBottom:12 },
  searchInput: { flex:1, color:'#F4F8FF', fontSize:13, fontFamily:'PlusJakartaSans_400Regular' },
  postButtonRow: { marginBottom:16 },
  postButton: { backgroundColor:'#15C8FF', borderRadius:12, paddingVertical:12, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8 },
  postButtonText: { color:'#041117', fontSize:14, fontWeight:'800', fontFamily:'PlusJakartaSans_800ExtraBold' },
  gridRow: { justifyContent:'space-between', marginBottom:12, gap:12 },
  jobCard: { width:(SCREEN_WIDTH-44)/2, backgroundColor:'#11151C', borderWidth:1, borderColor:'#1B2230', borderRadius:16, overflow:'hidden' },
  jobCardImage: { width:'100%', height:100 },
  jobCardContent: { padding:10 },
  jobCardHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:4 },
  jobCardTitle: { color:'#F4F8FF', fontSize:13, fontWeight:'700', flex:1, fontFamily:'PlusJakartaSans_700Bold' },
  jobCardCompany: { color:'#8A93A3', fontSize:10, marginBottom:8, fontFamily:'PlusJakartaSans_400Regular' },
  jobCardDescription: { color:'#D8E0EE', fontSize:11, lineHeight:15, marginBottom:10, fontFamily:'PlusJakartaSans_400Regular' },
  jobCardFooter: { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  jobCardBudget: { color:'#00D1FF', fontSize:12, fontWeight:'800', fontFamily:'PlusJakartaSans_800ExtraBold' },
  typeBadge: { backgroundColor:'rgba(21,200,255,0.15)', paddingHorizontal:6, paddingVertical:2, borderRadius:6 },
  typeBadgeText: { color:'#15C8FF', fontSize:9, fontWeight:'700', fontFamily:'PlusJakartaSans_700Bold' },
  gigCard: { width:(SCREEN_WIDTH-44)/2, backgroundColor:'#11151C', borderWidth:1, borderColor:'#1B2230', borderRadius:16, overflow:'hidden' },
  gigCardImage: { width:'100%', height:100 },
  gigCardContent: { padding:10 },
  gigCardHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:4 },
  gigCardTitle: { color:'#F4F8FF', fontSize:13, fontWeight:'700', flex:1, fontFamily:'PlusJakartaSans_700Bold' },
  gigCardCategory: { color:'#15C8FF', fontSize:10, fontWeight:'600', marginBottom:6, fontFamily:'PlusJakartaSans_600SemiBold' },
  gigCardDescription: { color:'#D8E0EE', fontSize:11, lineHeight:15, marginBottom:10, fontFamily:'PlusJakartaSans_400Regular' },
  tiersContainer: { flexDirection:'row', justifyContent:'space-between', gap:6 },
  tierItem: { flex:1, backgroundColor:'#0E1620', borderRadius:8, padding:6, alignItems:'center' },
  tierName: { color:'#8A93A3', fontSize:9, fontFamily:'PlusJakartaSans_500Medium' },
  tierPrice: { color:'#00D1FF', fontSize:10, fontWeight:'700', fontFamily:'PlusJakartaSans_700Bold' },
  myBadge: { backgroundColor:'#10B981', paddingHorizontal:6, paddingVertical:2, borderRadius:4, marginLeft:4 },
  myBadgeText: { color:'#FFFFFF', fontSize:8, fontWeight:'700', fontFamily:'PlusJakartaSans_700Bold' },
  emptyContainer: { alignItems:'center', justifyContent:'center', paddingVertical:60 },
  emptyText: { color:'#718099', fontSize:14, marginTop:12, textAlign:'center', fontFamily:'PlusJakartaSans_400Regular' },
  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.9)', justifyContent:'flex-end' },
  modalContent: { backgroundColor:'#11151C', borderTopLeftRadius:24, borderTopRightRadius:24, padding:20, maxHeight:'90%' },
  modalHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  modalTitle: { color:'#F4F8FF', fontSize:20, fontWeight:'800', fontFamily:'PlusJakartaSans_800ExtraBold' },
  modalLabel: { color:'#8A93A3', fontSize:12, fontWeight:'600', marginBottom:8, fontFamily:'PlusJakartaSans_600SemiBold' },
  modalInput: { backgroundColor:'#0E1620', borderWidth:1, borderColor:'#1B2230', borderRadius:12, paddingHorizontal:12, paddingVertical:10, color:'#F4F8FF', fontSize:13, marginBottom:16, fontFamily:'PlusJakartaSans_400Regular' },
  modalTextArea: { minHeight:100, textAlignVertical:'top' },
  sendButton: { backgroundColor:'#00D1FF', borderRadius:12, paddingVertical:14, alignItems:'center', marginTop:8, marginBottom:20 },
  sendButtonText: { color:'#041117', fontSize:14, fontWeight:'800', fontFamily:'PlusJakartaSans_800ExtraBold' },
  typeRow: { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:16 },
  typeChip: { paddingHorizontal:14, paddingVertical:8, borderRadius:20, backgroundColor:'#11151C', borderWidth:1, borderColor:'#1B2230' },
  typeChipActive: { backgroundColor:'#15C8FF', borderColor:'#15C8FF' },
  typeChipText: { color:'#8A93A3', fontSize:12, fontFamily:'PlusJakartaSans_600SemiBold' },
  typeChipTextActive: { color:'#041117' },

  // Detail modal styles
  detailModal: { backgroundColor:'#0E1116', borderTopLeftRadius:28, borderTopRightRadius:28, maxHeight:'92%', overflow:'hidden' },
  detailBanner: { width:'100%', height:200 },
  detailBody: { padding:20 },
  detailHeaderRow: { flexDirection:'row', alignItems:'flex-start', marginBottom:14 },
  detailTitle: { color:'#F4F8FF', fontSize:20, fontWeight:'900', fontFamily:'PlusJakartaSans_800ExtraBold', marginBottom:4 },
  detailSub: { color:'#8A93A3', fontSize:13, fontFamily:'PlusJakartaSans_400Regular' },
  detailCloseBtn: { width:34, height:34, borderRadius:17, backgroundColor:'#1B2230', alignItems:'center', justifyContent:'center', marginLeft:10, flexShrink:0 },
  detailTagRow: { flexDirection:'row', alignItems:'center', gap:12, marginBottom:16 },
  typeBadgeLg: { backgroundColor:'rgba(21,200,255,0.15)', paddingHorizontal:12, paddingVertical:5, borderRadius:10 },
  typeBadgeTextLg: { color:'#15C8FF', fontSize:12, fontWeight:'700', fontFamily:'PlusJakartaSans_700Bold' },
  detailBudgetLg: { color:'#00D1FF', fontSize:18, fontWeight:'900', fontFamily:'PlusJakartaSans_800ExtraBold' },
  detailSectionLabel: { color:'#8A93A3', fontSize:12, fontWeight:'700', letterSpacing:0.5, textTransform:'uppercase', marginBottom:8, marginTop:16, fontFamily:'PlusJakartaSans_700Bold' },
  detailDescription: { color:'#D8E0EE', fontSize:14, lineHeight:22, fontFamily:'PlusJakartaSans_400Regular' },
  detailMetaRow: { flexDirection:'row', alignItems:'center', gap:8, marginTop:12 },
  detailMeta: { color:'#718099', fontSize:13, fontFamily:'PlusJakartaSans_400Regular' },
  applyButton: { backgroundColor:'#15C8FF', borderRadius:14, paddingVertical:14, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, marginTop:24, marginBottom:12 },
  applyButtonText: { color:'#041117', fontSize:15, fontWeight:'800', fontFamily:'PlusJakartaSans_800ExtraBold' },
  sellerRow: { flexDirection:'row', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' },
  sellerName: { color:'#F4F8FF', fontSize:14, fontWeight:'700', fontFamily:'PlusJakartaSans_700Bold' },
  sellerRating: { color:'#FBBF24', fontSize:13, fontWeight:'700', fontFamily:'PlusJakartaSans_700Bold' },
  sellerSales: { color:'#718099', fontSize:12, fontFamily:'PlusJakartaSans_400Regular' },
  tierDetailCard: { backgroundColor:'#11151C', borderWidth:1, borderColor:'#1B2230', borderRadius:14, padding:14, marginBottom:10 },
  tierDetailHeader: { flexDirection:'row', justifyContent:'space-between', marginBottom:6 },
  tierDetailName: { color:'#F4F8FF', fontSize:14, fontWeight:'700', fontFamily:'PlusJakartaSans_700Bold' },
  tierDetailPrice: { color:'#00D1FF', fontSize:14, fontWeight:'900', fontFamily:'PlusJakartaSans_800ExtraBold' },
  tierDetailDesc: { color:'#8A93A3', fontSize:12, marginBottom:6, fontFamily:'PlusJakartaSans_400Regular' },
  tierDetailDelivery: { color:'#718099', fontSize:11, fontFamily:'PlusJakartaSans_400Regular' },

  // Filter chips
  filterChip: { paddingHorizontal:14, paddingVertical:7, borderRadius:20, backgroundColor:'#11151C', borderWidth:1, borderColor:'#1B2230' },
  filterChipActive: { backgroundColor:'#15C8FF', borderColor:'#15C8FF' },
  filterChipText: { color:'#8A93A3', fontSize:12, fontFamily:'PlusJakartaSans_600SemiBold' },
  filterChipTextActive: { color:'#041117' },

  // Card action row (edit / archive)
  cardActions: { flexDirection:'row', gap:6, marginTop:10, paddingTop:10, borderTopWidth:1, borderTopColor:'#1B2230' },
  editBtn: { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:4, paddingVertical:6, borderRadius:8, backgroundColor:'rgba(21,200,255,0.1)', borderWidth:1, borderColor:'#15C8FF' },
  editBtnText: { color:'#15C8FF', fontSize:11, fontWeight:'700', fontFamily:'PlusJakartaSans_700Bold' },
  archiveBtn: { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:4, paddingVertical:6, borderRadius:8, backgroundColor:'rgba(239,68,68,0.1)', borderWidth:1, borderColor:'#EF4444' },
  archiveBtnText: { color:'#EF4444', fontSize:11, fontWeight:'700', fontFamily:'PlusJakartaSans_700Bold' },

  // Image picker
  imagePicker: { borderWidth:1, borderColor:'#1B2230', borderRadius:14, marginBottom:16, overflow:'hidden', height:130 },
  imagePickerPreview: { width:'100%', height:'100%' },
  imagePickerPlaceholder: { flex:1, alignItems:'center', justifyContent:'center', gap:8, backgroundColor:'#0E1620' },
  imagePickerText: { color:'#718099', fontSize:12, fontFamily:'PlusJakartaSans_400Regular' },
});