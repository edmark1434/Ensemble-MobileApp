import { AppTitle } from '@/components/app-title';
import FloatingNavBar from '@/components/FloatingNavBar';
import { addMemberToGroup, createForumGroup, deleteForumGroup, getAllForumGroups, updateForumGroup } from '@/function/forumGroup';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
type ForumGroup = {
  id: string;
  title: string;
  description: string;
  previewImage: string;
  tags: string[];
  members: { uid: string; role: string }[];
  joined: boolean;
  previewBlob?: Blob | null;
};

type ForumComment = {
  id: string;
  author: string;
  text: string;
};

type ForumPost = {
  id: string;
  groupId: string;
  author: string;
  content: string;
  likes: number;
  likedByMe: boolean;
  comments: ForumComment[];
};

const seedGroups: ForumGroup[] = [
  {
    id: 'g1',
    title: 'Editing Tips',
    description: 'Share export workflows, timeline tricks, and client delivery best practices.',
    previewImage: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=400&h=200&q=80',
    tags: ['editing', 'workflow', 'tips'],
    members: [
      { uid: 'pixel_ninja', role: 'admin' },
      { uid: 'frame_boss', role: 'member' },
    ],
    joined: true,
  },
  {
    id: 'g2',
    title: 'LUT Lab',
    description: 'LUT experiments, color matching, and film emulation looks.',
    previewImage: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=400&h=200&q=80',
    tags: ['color', 'lut', 'grading'],
    members: [
      { uid: 'luna_vis', role: 'admin' },
      { uid: 'edit_oryx', role: 'member' },
    ],
    joined: false,
  },
  {
    id: 'g3',
    title: 'Client Safe Reviews',
    description: 'Private group for feedback rounds, approvals, and delivery notes.',
    previewImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&h=200&q=80',
    tags: ['feedback', 'approval', 'delivery'],
    members: [
      { uid: 'you', role: 'admin' },
    ],
    joined: false,
  },
];

const seedPosts: ForumPost[] = [
  {
    id: 'p1',
    groupId: 'g1',
    author: 'pixel_ninja',
    content: 'Best bitrate settings for 4K HDR uploads without muddy shadows?',
    likes: 42,
    likedByMe: false,
    comments: [
      { id: 'c1', author: 'luna_vis', text: 'Try mezzanine ProRes + platform transcode.' },
      { id: 'c2', author: 'edit_oryx', text: 'Keep grain after color, not before.' },
    ],
  },
  {
    id: 'p2',
    groupId: 'g1',
    author: 'frame_boss',
    content: 'Anyone has a reliable workflow for matching DJI and Sony S-Log3 shots?',
    likes: 19,
    likedByMe: true,
    comments: [{ id: 'c3', author: 'you', text: 'Use a shared neutral baseline and adjust WB first.' }],
  },
  {
    id: 'p3',
    groupId: 'g2',
    author: 'luna_vis',
    content: 'New neon LUT pack uploaded. Works well for low-key urban scenes.',
    likes: 66,
    likedByMe: false,
    comments: [],
  },
];

type ScreenMode = 'groups' | 'create' | 'feed';

export default function MessagesScreen() {
  const [mode, setMode] = useState<ScreenMode>('groups');
  const [groups, setGroups] = useState<ForumGroup[]>(seedGroups);
  const [posts, setPosts] = useState<ForumPost[]>(seedPosts);
  const [selectedGroupId, setSelectedGroupId] = useState(seedGroups[0].id);

  const [groupTitle, setGroupTitle] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupPreviewImage, setGroupPreviewImage] = useState('');
  const [groupTags, setGroupTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [postInput, setPostInput] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [searchGroup, setSearchGroup] = useState('');
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const [openedMenuGroupId, setOpenedMenuGroupId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [showDeleteConfirmId, setShowDeleteConfirmId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPreviewImage, setEditPreviewImage] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [hoveredMenuItem, setHoveredMenuItem] = useState<string | null>(null);

  // Animation values
  const pageFadeAnim = useRef(new Animated.Value(0)).current;
  const pageSlideAnim = useRef(new Animated.Value(50)).current;
  const pageScaleAnim = useRef(new Animated.Value(0.95)).current;

  const selectedGroup = groups.find((group) => group.id === selectedGroupId) ?? groups[0];
  const auth = getAuth();
  useEffect(() => {
    const fetchAllGroups = async () => {
      try {
        const result = await getAllForumGroups();
        if (result.status === 200 && result.data) {
          const currentUid = auth?.currentUser?.uid ?? null;
          const mappedGroups: ForumGroup[] = result.data.map((group: any) => ({
            id: group.id,
            title: group.title,
            description: group.description,
            previewImage: group.previewImage || '',
            tags: group.tags || [],
            members: group.members || [],
            joined: Array.isArray(group.members) && currentUid
              ? group.members.some((m: any) => m && m.uid === currentUid)
              : !!group.joined || false,
            previewBlob: null,
          }));
          console.log('Fetched forum groups:', mappedGroups);
          setGroups(mappedGroups);
          if (mappedGroups.length > 0) {
            setSelectedGroupId(mappedGroups[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch forum groups:', error);
        setGroups(seedGroups);
      }
    };

    fetchAllGroups();
  }, []);
  const filteredGroups = useMemo(() => {
    const query = searchGroup.trim().toLowerCase();
    if (!query) return groups;
    return groups.filter(
      (group) =>
        group.title.toLowerCase().includes(query) ||
        group.description.toLowerCase().includes(query)
    );
  }, [groups, searchGroup]);

  // Handlers for edit modal save
  const handleSaveEdit = async () => {
    if (!editingGroupId) return;
    setIsSavingEdit(true);
    const data: any = {
      title: editTitle,
      description: editDescription,
      previewImage: editPreviewImage,
      tags: editTags,
    };

    try {
      await updateForumGroup(editingGroupId, data);
      setGroups((prev) => prev.map((g) => (g.id === editingGroupId ? { ...g, ...data } : g)));
      setShowEditModal(false);
      setEditingGroupId(null);
    } catch (err) {
      console.error('Failed to update group:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async (groupId: string) => {
    try {
      await deleteForumGroup(groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      setShowDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete group:', err);
    }
  };

  const groupPosts = useMemo(
    () => posts.filter((post) => post.groupId === selectedGroup.id),
    [posts, selectedGroup.id]
  );

  const addTagsFromInput = (value: string) => {
    const nextTags = value
      .split(',')
      .map((tag) => tag.trim().replace(/^#/, ''))
      .filter(Boolean);

    if (!nextTags.length) return;

    setGroupTags((prev) => {
      const merged = new Set(prev.map((tag) => tag.toLowerCase()));
      const updated = [...prev];
      const MAX_TAGS = 3;

      nextTags.forEach((tag) => {
        if (updated.length >= MAX_TAGS) return;
        const normalized = tag.toLowerCase();
        if (!merged.has(normalized)) {
          merged.add(normalized);
          updated.push(tag);
        }
      });

      return updated;
    });
  };

  const handleTagChange = (value: string) => {
    if (value.includes(',')) {
      const parts = value.split(',');
      const nextInput = parts.pop() ?? '';
      addTagsFromInput(parts.join(','));
      setTagInput(nextInput);
      return;
    }

    setTagInput(value);
  };

  const handleTagSubmit = () => {
    addTagsFromInput(tagInput);
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setGroupTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const removeEditTag = (tagToRemove: string) => {
    setEditTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const addEditTag = (tags: string) => {
    const MAX_TAGS = 3;
    const normalized = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !editTags.includes(t));
    setEditTags((prev) => {
      const remaining = Math.max(0, MAX_TAGS - prev.length);
      return [...prev, ...normalized.slice(0, remaining)];
    });
  };

  const handleEditTagChange = (value: string) => {
    if (value.includes(',')) {
      const parts = value.split(',');
      const nextInput = parts.pop() ?? '';
      addEditTag(parts.join(','));
      setEditTagInput(nextInput);
      return;
    }
    setEditTagInput(value);
  };

  const handleEditTagSubmit = () => {
    addEditTag(editTagInput);
    setEditTagInput('');
  };

  const handlePickEditPreviewImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
      aspect: [16, 9],
    });

    if (!result.canceled && result.assets[0]?.uri) {
      const filePath = result.assets[0].uri;
      console.log('Edit image file path:', filePath);
      setEditPreviewImage(filePath);
    }
  };

  const handlePickPreviewImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
      aspect: [16, 9],
    });

    if (!result.canceled && result.assets[0]?.uri) {
      const filePath = result.assets[0].uri;
      console.log('Image file path:', filePath); // Send this string to your backend
      setGroupPreviewImage(filePath);
    }
  };

  const handlePreviewDrop = (event: any) => {
    if (Platform.OS !== 'web') return;

    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : '';
      if (value) {
        setGroupPreviewImage(value);
      }
    };
    reader.readAsDataURL(file);
  };

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

  const handleCreateGroup = async () => {
    const title = groupTitle.trim();
    const description = groupDescription.trim();
    const currentUid: string = auth.currentUser?.uid ?? '';

    if (!title || !description || !currentUid) return;

    // Normalize tags (remove duplicates, trim, preserve original casing for display)
    const normalizedTags: string[] = [];
    const seen = new Set<string>();
    groupTags.forEach((t) => {
      const clean = t.trim();
      const key = clean.toLowerCase();
      if (!clean) return;
      if (seen.has(key)) return;
      seen.add(key);
      normalizedTags.push(clean);
    });

    // Get the image file path to send to backend
    const imageFilePath = groupPreviewImage.trim();
    console.log('Image file path to send to backend:', imageFilePath);

    // Keep preview image as provided (can be remote URL, data URI, or empty). Use fallback if empty.
    const preview = (typeof groupPreviewImage === 'string' && groupPreviewImage.trim())
      ? groupPreviewImage
      : 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=400&h=200&q=80';

    // If you need to upload the actual image file, fetch it as a blob
    let previewBlob: Blob | null = null;
    try {
      // On web and modern RN runtimes, fetch(uri).then(r => r.blob()) works for data URIs and remote URLs.
      const resp = await fetch(preview);
      previewBlob = await resp.blob();
    } catch (err) {
      // If fetching as blob fails, leave previewBlob null but still create the group with the preview URL.
      console.warn('Failed to fetch preview image as blob', err);
      previewBlob = null;
    }

    // Log the blob for debugging / to use for Cloudinary upload.
    console.log('createGroup previewBlob:', previewBlob);

    const newGroup: ForumGroup = {
      id: `g-${Date.now()}`,
      title,
      description,
      previewImage: preview,
      previewBlob,
      tags: normalizedTags,
      members: [{ uid: currentUid, role: 'admin' }],
      joined: true,
    };
    

    // Send group data to Firebase
    try {
      const groupData = {
        title,
        description,
        previewImage: preview,
        imageFilePath,
        tags: normalizedTags,
        members: [{ uid: currentUid, role: 'admin' }],
        createdAt: new Date(),
      };
      await createForumGroup(groupData);
      console.log('Group saved to Firebase successfully');
    } catch (error) {
      console.error('Failed to save group to Firebase:', error);
      return;
    }

    setGroups((prev) => [newGroup, ...prev]);
    setSelectedGroupId(newGroup.id);
    setMode('feed');

    // reset form
    setGroupTitle('');
    setGroupDescription('');
    setGroupPreviewImage('');
    setGroupTags([]);
    setTagInput('');
  };

  const handleJoinGroup = async (groupId: string) => {
    const currentUid = getAuth()?.currentUser?.uid ?? null;
    if (!currentUid) {
      console.warn('User not signed in - cannot join group');
      return;
    }

    // prevent duplicate requests
    if (joiningGroupId === groupId) return;

    const member = { uid: currentUid, role: 'member' };

    setJoiningGroupId(groupId);
    try {
      await addMemberToGroup(groupId, member);

      setGroups((prev) =>
        prev.map((group) => {
          if (group.id !== groupId) return group;
          if (group.joined) return group;
          return { ...group, joined: true, members: [...group.members, member] };
        })
      );

      setSelectedGroupId(groupId);
      setMode('feed');
    } catch (err) {
      console.error('Failed to add member to group in backend:', err);
    } finally {
      setJoiningGroupId(null);
    }
  };

  const handleOpenGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    const group = groups.find((item) => item.id === groupId);
    if (group?.joined) {
      setMode('feed');
    }
  };

  const handleCreatePost = () => {
    const content = postInput.trim();
    if (!content || !selectedGroup.joined) return;

    const newPost: ForumPost = {
      id: `p-${Date.now()}`,
      groupId: selectedGroup.id,
      author: 'L7X5vOYx8SM4WR1HsNPzVDngb7m1',
      content,
      likes: 0,
      likedByMe: false,
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);
    setPostInput('');
  };

  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          likedByMe: !post.likedByMe,
          likes: post.likedByMe ? Math.max(0, post.likes - 1) : post.likes + 1,
        };
      })
    );
  };

  const handleAddComment = (postId: string) => {
    const draft = (commentDrafts[postId] ?? '').trim();
    if (!draft) return;

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments: [...post.comments, { id: `c-${Date.now()}`, author: 'you', text: draft }],
        };
      })
    );

    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
  };

  // @ts-ignore
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
        <View style={styles.header}>
          <View>
            <AppTitle size="sm" />
          </View>
          <View style={styles.headerActions}>
            {mode !== 'groups' ? (
              <Pressable style={styles.iconButton} onPress={() => setMode('groups')}>
                <MaterialIcons name="arrow-back" size={18} color="#DCE6F4" />
              </Pressable>
            ) : null}
            <Pressable style={styles.iconButton} onPress={() => setMode('create')}>
              <MaterialIcons name="add" size={18} color="#DCE6F4" />
            </Pressable>
          </View>
        </View>

        {/* Page Title */}
        <Text style={styles.title}>Forums</Text>

        {mode === 'groups' ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={styles.sectionTitle}>Group Forums</Text>
            <View style={styles.searchWrap}>
              <MaterialIcons name="search" size={18} color="#718099" />
              <TextInput
                value={searchGroup}
                onChangeText={setSearchGroup}
                placeholder="Search groups"
                placeholderTextColor="#718099"
                style={styles.searchInput}
              />
            </View>

            {filteredGroups.map((group) => (
              <View key={group.id} style={styles.groupCard}>
                <Pressable style={styles.groupOpenArea} onPress={() => handleOpenGroup(group.id)}>
                  <Image
                    source={{ uri: group.previewImage }}
                    style={styles.groupPreviewImage}
                    resizeMode={Platform.OS === 'web' ? 'cover' : 'contain'}
                  />
                  <View style={styles.groupBody}>
                    <View style={styles.groupTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.groupTitle}>{group.title}</Text>
                        <Text style={styles.groupCreator}>{group.description}</Text>
                      </View>
                      <Pressable
                        style={({ pressed }) => [styles.menuTrigger, pressed && { opacity: 0.7 }]}
                        onPress={(e: any) => {
                          e?.stopPropagation?.();
                          console.log('group options trigger pressed', group.id);
                          setOpenedMenuGroupId(openedMenuGroupId === group.id ? null : group.id);
                        }}
                      >
                        <MaterialIcons name="more-vert" size={22} color="#718099" />
                      </Pressable>
                    </View>
                    {group.tags.length ? (
                      <View style={styles.tagList}>
                        {group.tags.slice(0, 3).map((tag) => (
                          <View key={tag} style={styles.tagChip}>
                            <Text style={styles.tagChipText}>#{tag}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                </Pressable>

                {/* Card Menu Dropdown */}
                {openedMenuGroupId === group.id && (
                  <View style={styles.cardDropdownMenu}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.dropdownItem,
                        pressed && styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        console.log('edit group pressed', group.id);
                        setOpenedMenuGroupId(null);
                        setEditingGroupId(group.id);
                        setEditTitle(group.title);
                        setEditDescription(group.description);
                        setEditPreviewImage(group.previewImage || '');
                        setEditTags(group.tags || []);
                        setShowEditModal(true);
                      }}
                    >
                      <MaterialIcons name="edit" size={18} color="#15C8FF" />
                      <Text style={styles.dropdownItemText}>Edit</Text>
                    </Pressable>
                    <View style={styles.divider} />
                    <Pressable
                      style={({ pressed }) => [
                        styles.dropdownItem,
                        pressed && styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        console.log('delete group pressed', group.id);
                        setOpenedMenuGroupId(null);
                        setShowDeleteConfirmId(group.id);
                      }}
                    >
                      <MaterialIcons name="delete-outline" size={18} color="#FF5252" />
                      <Text style={[styles.dropdownItemText, { color: '#FF5252' }]}>Delete</Text>
                    </Pressable>
                  </View>
                )}

                <View style={styles.groupBottomRow}>
                  <View style={styles.memberBadge}>
                    <MaterialIcons name="people" size={14} color="#718099" />
                    <Text style={styles.groupMembers}>{group.members.length}</Text>
                  </View>
                  {group.joined ? (
                    <Pressable style={styles.joinedButton} onPress={() => setMode('feed')}>
                      <Text style={styles.joinedButtonText}>Open feed</Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      style={styles.joinButton}
                      onPress={() => handleJoinGroup(group.id)}
                      disabled={joiningGroupId === group.id}
                    >
                      {joiningGroupId === group.id ? (
                        <ActivityIndicator size="small" color="#041117" />
                      ) : (
                        <Text style={styles.joinButtonText}>Join</Text>
                      )}
                    </Pressable>
                  )}
                </View>
              </View>
            ))}

            {/* Edit Modal */}
            <Modal visible={showEditModal} animationType="fade" transparent onRequestClose={() => setShowEditModal(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.editModalContent}>
                  <View style={styles.modalHeader}>
                    <View>
                      <Text style={styles.modalTitle}>Edit Group</Text>
                      <Text style={styles.modalSubtitle}>Update your group details</Text>
                    </View>
                    <Pressable onPress={() => setShowEditModal(false)} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
                      <MaterialIcons name="close" size={24} color="#718099" />
                    </Pressable>
                  </View>
                  <ScrollView 
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false} 
                    bounces={false}
                    keyboardShouldPersistTaps="handled"
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                  >
                    <View style={styles.modalBody}>
                      <View style={styles.fieldSection}>
                        <Text style={styles.fieldLabel}>Group Name</Text>
                        <TextInput value={editTitle} onChangeText={setEditTitle} placeholder="Enter group name" placeholderTextColor="#718099" style={styles.input} />
                      </View>
                      <View style={styles.fieldSection}>
                        <Text style={styles.fieldLabel}>Description</Text>
                        <TextInput value={editDescription} onChangeText={setEditDescription} placeholder="Describe your group" placeholderTextColor="#718099" style={[styles.input, styles.textArea]} multiline />
                      </View>
                      <View style={styles.fieldSection}>
                        <Text style={styles.fieldLabel}>Preview Image</Text>
                        <Pressable style={styles.imagePickerButton} onPress={handlePickEditPreviewImage}>
                          <MaterialIcons name="image" size={20} color="#15C8FF" />
                          <Text style={styles.imagePickerButtonText}>{editPreviewImage ? 'Change image' : 'Pick from library'}</Text>
                        </Pressable>
                        {editPreviewImage ? (
                          <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: editPreviewImage }} style={styles.previewThumbnail} resizeMode="cover" />
                            <Pressable style={styles.removeImageButton} onPress={() => setEditPreviewImage('')}>
                              <MaterialIcons name="close" size={18} color="#fff" />
                            </Pressable>
                          </View>
                        ) : null}
                      </View>
                      <View style={styles.fieldSection}>
                        <Text style={styles.fieldLabel}>Tags</Text>
                        <View style={styles.tagsInputRow}>
                          <TextInput
                            value={editTagInput}
                            onChangeText={handleEditTagChange}
                            onSubmitEditing={handleEditTagSubmit}
                            onBlur={handleEditTagSubmit}
                            placeholder="Add tags (comma separated)"
                            placeholderTextColor="#718099"
                            style={[styles.tagsInput, { flex: 1 }]}
                            returnKeyType="done"
                            blurOnSubmit={false}
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={editTags.length < 3}
                          />
                          <Pressable 
                            style={[styles.addTagButton, editTags.length >= 3 && { opacity: 0.5 }]} 
                            onPress={handleEditTagSubmit}
                            disabled={editTags.length >= 3}
                          >
                            <MaterialIcons name="add" size={18} color="#041117" />
                          </Pressable>
                        </View>
                        {editTags.length ? (
                          <>
                            <View style={styles.tagList}>
                              {editTags.map((tag) => (
                                <Pressable key={tag} style={styles.editTagChip} onPress={() => removeEditTag(tag)}>
                                  <Text style={styles.tagChipText}>#{tag}</Text>
                                  <Text style={styles.tagRemove}>×</Text>
                                </Pressable>
                              ))}
                            </View>
                            <Text style={styles.tagsHint}>{editTags.length}/3 tags added</Text>
                          </>
                        ) : (
                          <Text style={styles.tagsHint}>Add up to 3 tags to categorize your group</Text>
                        )}
                      </View>
                    </View>
                  </ScrollView>
                  <View style={styles.modalFooter}>
                    <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowEditModal(false)} disabled={isSavingEdit}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                    <Pressable 
                      style={[styles.modalButton, styles.saveButton, isSavingEdit && { opacity: 0.7 }]} 
                      onPress={handleSaveEdit}
                      disabled={isSavingEdit}
                    >
                      {isSavingEdit ? (
                        <ActivityIndicator size="small" color="#041117" />
                      ) : (
                        <>
                          <MaterialIcons name="check" size={16} color="#041117" style={{ marginRight: 6 }} />
                          <Text style={styles.saveButtonText}>Save Changes</Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal visible={!!showDeleteConfirmId} animationType="fade" transparent onRequestClose={() => setShowDeleteConfirmId(null)}>
              <View style={styles.modalOverlay}>
                <View style={styles.confirmModalContent}>
                  <View style={styles.deleteIconContainer}>
                    <MaterialIcons name="delete-outline" size={40} color="#FF5252" />
                  </View>
                  <Text style={styles.confirmTitle}>Delete Group?</Text>
                  <Text style={styles.confirmMessage}>Are you sure you want to delete this group? This action cannot be undone and all associated posts will be permanently removed.</Text>
                  <View style={styles.modalFooter}>
                    <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowDeleteConfirmId(null)}>
                      <Text style={styles.cancelButtonText}>Keep Group</Text>
                    </Pressable>
                    <Pressable style={[styles.modalButton, styles.deleteButton]} onPress={() => showDeleteConfirmId && handleConfirmDelete(showDeleteConfirmId)}>
                      <MaterialIcons name="delete" size={16} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
          </ScrollView>
        ) : null}

        {mode === 'create' ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={styles.sectionTitle}>Create Group Forum</Text>

            <TextInput
              value={groupPreviewImage}
              onChangeText={setGroupPreviewImage}
              placeholder="Preview image URL (optional)"
              placeholderTextColor="#718099"
              style={styles.hiddenPreviewInput}
            />
            <View
              style={styles.uploadCard}
              {...(Platform.OS === 'web'
                ? {
                    onDragOver: (event: any) => event.preventDefault(),
                    onDrop: handlePreviewDrop,
                  }
                : {})}
            >
              {groupPreviewImage ? (
                <View style={styles.uploadPreviewWrap}>
                  <Image source={{ uri: groupPreviewImage }} style={styles.uploadPreview} resizeMode={Platform.OS === 'web' ? 'cover' : 'contain'} />
                  <View style={styles.uploadOverlay}>
                    <Text style={styles.uploadOverlayText}>Preview selected</Text>
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.uploadIconWrap}>
                    <MaterialIcons name="cloud-upload" size={22} color="#15C8FF" />
                  </View>
                  <Text style={styles.uploadTitle}>Drop an image here or upload a file</Text>
                  <Text style={styles.uploadSubtitle}>PNG, JPG, and WEBP work best for group previews.</Text>
                </>
              )}

              <View style={styles.uploadActions}>
                <Pressable style={styles.uploadButton} onPress={handlePickPreviewImage}>
                  <Text style={styles.uploadButtonText}>{groupPreviewImage ? 'Replace file' : 'Upload file'}</Text>
                </Pressable>
                {groupPreviewImage ? (
                  <Pressable style={styles.clearButton} onPress={() => setGroupPreviewImage('')}>
                    <Text style={styles.clearButtonText}>Clear</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
            <TextInput
              value={groupTitle}
              onChangeText={setGroupTitle}
              placeholder="Title"
              placeholderTextColor="#718099"
              style={styles.input}
            />
            <TextInput
              value={groupDescription}
              onChangeText={setGroupDescription}
              placeholder="Description"
              placeholderTextColor="#718099"
              style={[styles.input, styles.textArea]}
              multiline
            />

            <View style={styles.tagsSection}>
              <Text style={styles.fieldLabel}>Tags</Text>
              <View style={styles.tagsInputRow}>
                <TextInput
                  value={tagInput}
                  onChangeText={handleTagChange}
                  onSubmitEditing={handleTagSubmit}
                  onBlur={handleTagSubmit}
                  placeholder="Enter tags, separated by commas"
                  placeholderTextColor="#718099"
                  style={styles.tagsInput}
                  returnKeyType="done"
                  blurOnSubmit={false}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={groupTags.length < 3}
                />
                <Pressable 
                  style={[styles.addTagButton, groupTags.length >= 3 && { opacity: 0.5 }]} 
                  onPress={handleTagSubmit}
                  disabled={groupTags.length >= 3}
                >
                  <Text style={styles.addTagButtonText}>Add</Text>
                </Pressable>
              </View>

              {groupTags.length ? (
                <>
                  <View style={styles.tagList}>
                    {groupTags.map((tag) => (
                      <Pressable key={tag} style={styles.tagChip} onPress={() => removeTag(tag)}>
                        <Text style={styles.tagChipText}>#{tag}</Text>
                        <Text style={styles.tagRemove}>×</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={styles.tagsHint}>{groupTags.length}/3 tags added</Text>
                </>
              ) : (
                <Text style={styles.tagsHint}>Add up to 3 tags to help others find your group</Text>
              )}
            </View>

            <Pressable style={styles.primaryButton} onPress={handleCreateGroup}>
              <Text style={styles.primaryButtonText}>Create forum</Text>
            </Pressable>
          </ScrollView>
        ) : null}

        {mode === 'feed' ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.feedHeader}>
              <View>
                <Text style={styles.sectionTitle}>{selectedGroup.title}</Text>
                <Text style={styles.feedSub}>{selectedGroup.members.length} members</Text>

              </View>
              {!selectedGroup.joined ? (
                <Pressable
                  style={styles.joinButton}
                  onPress={() => handleJoinGroup(selectedGroup.id)}
                  disabled={joiningGroupId === selectedGroup.id}
                >
                  {joiningGroupId === selectedGroup.id ? (
                    <ActivityIndicator size="small" color="#041117" />
                  ) : (
                    <Text style={styles.joinButtonText}>Join</Text>
                  )}
                </Pressable>
              ) : null}
            </View>

            {selectedGroup.joined ? (
              <View style={styles.postComposer}>
                <TextInput
                  value={postInput}
                  onChangeText={setPostInput}
                  placeholder="Write a post to this forum..."
                  placeholderTextColor="#718099"
                  style={[styles.input, styles.textArea]}
                  multiline
                />
                <Pressable style={styles.primaryButton} onPress={handleCreatePost}>
                  <Text style={styles.primaryButtonText}>Post</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.lockedBox}>
                <MaterialIcons name="lock-outline" size={18} color="#15C8FF" />
                <Text style={styles.lockedText}>Join this forum to create posts and comments.</Text>
              </View>
            )}

            {groupPosts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <Text style={styles.postAuthor}>{post.author}</Text>
                <Text style={styles.postContent}>{post.content}</Text>

                <View style={styles.postActions}>
                  <Pressable style={styles.actionBtn} onPress={() => handleToggleLike(post.id)}>
                    <MaterialIcons
                      name={post.likedByMe ? 'favorite' : 'favorite-border'}
                      size={16}
                      color={post.likedByMe ? '#15C8FF' : '#8A93A3'}
                    />
                    <Text style={styles.actionText}>{post.likes}</Text>
                  </Pressable>

                  <View style={styles.actionBtn}>
                    <MaterialIcons name="chat-bubble-outline" size={16} color="#8A93A3" />
                    <Text style={styles.actionText}>{post.comments.length}</Text>
                  </View>
                </View>

                {post.comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <Text style={styles.commentAuthor}>{comment.author}</Text>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                ))}

                {selectedGroup.joined ? (
                  <View style={styles.commentComposer}>
                    <TextInput
                      value={commentDrafts[post.id] ?? ''}
                      onChangeText={(value) => setCommentDrafts((prev) => ({ ...prev, [post.id]: value }))}
                      placeholder="Add a comment"
                      placeholderTextColor="#718099"
                      style={styles.commentInput}
                    />
                    <Pressable style={styles.commentSendBtn} onPress={() => handleAddComment(post.id)}>
                      <MaterialIcons name="send" size={14} color="#041117" />
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ))}
          </ScrollView>
        ) : null}
      </SafeAreaView>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    color: '#F4F8FF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 16,
    paddingHorizontal: 16,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#11151C',
    borderWidth: 1,
    borderColor: '#1B2230',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#F4F8FF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  searchWrap: {
    backgroundColor: '#11151C',
    borderWidth: 1,
    borderColor: '#1B2230',
    borderRadius: 14,
    height: 46,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#F4F8FF',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  groupCard: {
    backgroundColor: '#11151C',
    borderWidth: 1,
    borderColor: '#1B2230',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  groupOpenArea: {
    width: '100%',
  },
  groupPreviewImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#0E131A',
  },
  groupBody: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  groupTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  groupTitle: {
    color: '#F4F8FF',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    marginBottom: 4,
  },
  groupCreator: {
    color: '#718099',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  visibilityPill: {
    backgroundColor: '#0E2230',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  visibilityText: {
    color: '#15C8FF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    backgroundColor: '#0E2230',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  tagChipText: {
    color: '#15C8FF',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  tagRemove: {
    color: '#8A93A3',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 14,
  },
  groupBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#0E131A',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupMembers: {
    color: '#718099',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  joinButton: {
    backgroundColor: '#15C8FF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    minWidth: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#041117',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  joinedButton: {
    backgroundColor: '#0E2230',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1B2230',
    paddingHorizontal: 14,
    paddingVertical: 9,
    minWidth: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinedButtonText: {
    color: '#15C8FF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  menuTrigger: {
    padding: 8,
    marginTop: -8,
    marginRight: -8,
  },
  cardDropdownMenu: {
    backgroundColor: '#0E131A',
    borderTopWidth: 1,
    borderTopColor: '#0E131A',
    paddingVertical: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dropdownItemActive: {
    backgroundColor: '#151a20',
  },
  dropdownItemText: {
    color: '#DCE6F4',
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  divider: {
    height: 1,
    backgroundColor: '#0E131A',
    marginHorizontal: 14,
  },
  input: {
    backgroundColor: '#11151C',
    borderWidth: 1,
    borderColor: '#1B2230',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#F4F8FF',
    fontSize: 13,
    marginBottom: 10,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  hiddenPreviewInput: {
    height: 0,
    opacity: 0,
    marginBottom: 0,
    padding: 0,
    borderWidth: 0,
  },
  uploadCard: {
    backgroundColor: '#11151C',
    borderWidth: 1,
    borderColor: '#1B2230',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#0E2230',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    color: '#F4F8FF',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  uploadSubtitle: {
    color: '#718099',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  uploadPreviewWrap: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  uploadPreview: {
    width: '100%',
    height: 160,
    backgroundColor: '#0E131A',
  },
  uploadOverlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(4,17,23,0.72)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  uploadOverlayText: {
    color: '#DCE6F4',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4,17,23,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  editModalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: '#11151C',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1B2230',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    display: 'flex',
    flexDirection: 'column',
  },
  confirmModalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#11151C',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1B2230',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0E131A',
  },
  modalTitle: {
    color: '#F4F8FF',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#718099',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  fieldSection: {
    marginBottom: 18,
  },
  fieldLabel: {
    color: '#D8E0EE',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  imagePreview: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#0E131A',
  },
  previewThumbnail: {
    width: '100%',
    height: 100,
  },
  previewText: {
    color: '#718099',
    fontSize: 11,
    paddingVertical: 6,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#0E131A',
  },
  modalButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#0E2230',
    borderWidth: 1,
    borderColor: '#1B2230',
  },
  cancelButtonText: {
    color: '#DCE6F4',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  saveButton: {
    backgroundColor: '#15C8FF',
  },
  saveButtonText: {
    color: '#041117',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  deleteButton: {
    backgroundColor: '#FF5252',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  deleteIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    color: '#F4F8FF',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    marginBottom: 8,
  },
  confirmMessage: {
    color: '#8A93A3',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'PlusJakartaSans_400Regular',
  },

  uploadActions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#15C8FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  uploadButtonText: {
    color: '#041117',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  clearButton: {
    backgroundColor: '#0E2230',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#1B2230',
  },
  clearButtonText: {
    color: '#DCE6F4',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  tagsSection: {
    marginBottom: 10,
  },
  tagsInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tagsInput: {
    flex: 1,
    backgroundColor: '#11151C',
    borderWidth: 1,
    borderColor: '#1B2230',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#F4F8FF',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  addTagButton: {
    backgroundColor: '#15C8FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  addTagButtonText: {
    color: '#041117',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  tagsHint: {
    color: '#718099',
    fontSize: 11,
    marginTop: 8,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  visibilityRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  visibilityOption: {
    flex: 1,
    backgroundColor: '#11151C',
    borderWidth: 1,
    borderColor: '#1B2230',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  visibilityOptionActive: {
    borderColor: '#15C8FF',
    backgroundColor: '#0E2230',
  },
  visibilityOptionText: {
    color: '#8A93A3',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  visibilityOptionTextActive: {
    color: '#15C8FF',
  },
  primaryButton: {
    backgroundColor: '#15C8FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#041117',
    fontWeight: '800',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  feedSub: {
    color: '#8A93A3',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  postComposer: {
    marginBottom: 12,
  },
  lockedBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: '#11151C',
    borderWidth: 1,
    borderColor: '#1B2230',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  lockedText: {
    color: '#8A93A3',
    fontSize: 12,
    flex: 1,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  postCard: {
    backgroundColor: '#11151C',
    borderWidth: 1,
    borderColor: '#1B2230',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  postAuthor: {
    color: '#15C8FF',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  postContent: {
    color: '#F4F8FF',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  postActions: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: '#8A93A3',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  commentItem: {
    backgroundColor: '#0E131A',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  commentAuthor: {
    color: '#15C8FF',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  commentText: {
    color: '#D8E0EE',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  commentComposer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#0E131A',
    borderWidth: 1,
    borderColor: '#1B2230',
    borderRadius: 10,
    color: '#F4F8FF',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  commentSendBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#15C8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0E2230',
    borderWidth: 1,
    borderColor: '#1B2230',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  imagePickerButtonText: {
    color: '#15C8FF',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#0E131A',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 82, 82, 0.9)',
    borderRadius: 999,
    padding: 6,
  },
  editTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0E2230',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },});