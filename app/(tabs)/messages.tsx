import { AppTitle } from '@/components/app-title';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, Image, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import FloatingNavBar from '@/components/FloatingNavBar';

type GroupVisibility = 'public' | 'private';

type ForumGroup = {
  id: string;
  title: string;
  description: string;
  previewImage: string;
  visibility: GroupVisibility;
  members: number;
  joined: boolean;
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
    visibility: 'public',
    members: 1280,
    joined: true,
  },
  {
    id: 'g2',
    title: 'LUT Lab',
    description: 'LUT experiments, color matching, and film emulation looks.',
    previewImage: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=400&h=200&q=80',
    visibility: 'public',
    members: 842,
    joined: false,
  },
  {
    id: 'g3',
    title: 'Client Safe Reviews',
    description: 'Private group for feedback rounds, approvals, and delivery notes.',
    previewImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&h=200&q=80',
    visibility: 'private',
    members: 57,
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
  const [groupVisibility, setGroupVisibility] = useState<GroupVisibility>('public');

  const [postInput, setPostInput] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [searchGroup, setSearchGroup] = useState('');

  // Animation values
  const pageFadeAnim = useRef(new Animated.Value(0)).current;
  const pageSlideAnim = useRef(new Animated.Value(50)).current;
  const pageScaleAnim = useRef(new Animated.Value(0.95)).current;

  const selectedGroup = groups.find((group) => group.id === selectedGroupId) ?? groups[0];

  const filteredGroups = useMemo(() => {
    const query = searchGroup.trim().toLowerCase();
    if (!query) return groups;
    return groups.filter(
      (group) =>
        group.title.toLowerCase().includes(query) ||
        group.description.toLowerCase().includes(query) ||
        group.visibility.toLowerCase().includes(query)
    );
  }, [groups, searchGroup]);

  const groupPosts = useMemo(
    () => posts.filter((post) => post.groupId === selectedGroup.id),
    [posts, selectedGroup.id]
  );

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

  const handleCreateGroup = () => {
    if (!groupTitle.trim() || !groupDescription.trim()) return;

    const newGroup: ForumGroup = {
      id: `g-${Date.now()}`,
      title: groupTitle.trim(),
      description: groupDescription.trim(),
      previewImage: groupPreviewImage.trim() || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=400&h=200&q=80',
      visibility: groupVisibility,
      members: 1,
      joined: true,
    };

    setGroups((prev) => [newGroup, ...prev]);
    setSelectedGroupId(newGroup.id);
    setMode('feed');

    setGroupTitle('');
    setGroupDescription('');
    setGroupPreviewImage('');
    setGroupVisibility('public');
  };

  const handleJoinGroup = (groupId: string) => {
    setGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        if (group.joined) return group;
        return { ...group, joined: true, members: group.members + 1 };
      })
    );
    setSelectedGroupId(groupId);
    setMode('feed');
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
      author: 'you',
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
              <Pressable key={group.id} style={styles.groupCard} onPress={() => handleOpenGroup(group.id)}>
                <Image
                  source={{ uri: group.previewImage }}
                  style={styles.groupPreviewImage}
                  // @ts-ignore
                  contentFit="cover"
                />
                <View style={styles.groupBody}>
                  <View style={styles.groupTopRow}>
                    <Text style={styles.groupTitle}>{group.title}</Text>
                    <View style={styles.visibilityPill}>
                      <Text style={styles.visibilityText}>{group.visibility}</Text>
                    </View>
                  </View>
                  <Text style={styles.groupDescription}>{group.description}</Text>
                  <View style={styles.groupBottomRow}>
                    <Text style={styles.groupMembers}>{group.members} members</Text>
                    {group.joined ? (
                      <Pressable style={styles.joinedButton} onPress={() => setMode('feed')}>
                        <Text style={styles.joinedButtonText}>Open feed</Text>
                      </Pressable>
                    ) : (
                      <Pressable style={styles.joinButton} onPress={() => handleJoinGroup(group.id)}>
                        <Text style={styles.joinButtonText}>Join</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </Pressable>
            ))}
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
              style={styles.input}
            />
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

            <Text style={styles.fieldLabel}>Visibility</Text>
            <View style={styles.visibilityRow}>
              <Pressable
                style={[styles.visibilityOption, groupVisibility === 'public' && styles.visibilityOptionActive]}
                onPress={() => setGroupVisibility('public')}
              >
                <Text style={[styles.visibilityOptionText, groupVisibility === 'public' && styles.visibilityOptionTextActive]}>
                  Public
                </Text>
              </Pressable>
              <Pressable
                style={[styles.visibilityOption, groupVisibility === 'private' && styles.visibilityOptionActive]}
                onPress={() => setGroupVisibility('private')}
              >
                <Text style={[styles.visibilityOptionText, groupVisibility === 'private' && styles.visibilityOptionTextActive]}>
                  Private
                </Text>
              </Pressable>
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
                <Text style={styles.feedSub}>{selectedGroup.visibility} • {selectedGroup.members} members</Text>
              </View>
              {!selectedGroup.joined ? (
                <Pressable style={styles.joinButton} onPress={() => handleJoinGroup(selectedGroup.id)}>
                  <Text style={styles.joinButtonText}>Join</Text>
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
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  groupPreviewImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#0E131A',
  },
  groupBody: {
    padding: 12,
  },
  groupTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  groupTitle: {
    color: '#F4F8FF',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
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
  groupDescription: {
    color: '#8A93A3',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  groupBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupMembers: {
    color: '#718099',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  joinButton: {
    backgroundColor: '#15C8FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  joinButtonText: {
    color: '#041117',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  joinedButton: {
    backgroundColor: '#0E2230',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  joinedButtonText: {
    color: '#15C8FF',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
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
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  fieldLabel: {
    color: '#D8E0EE',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 2,
    fontFamily: 'PlusJakartaSans_700Bold',
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
});