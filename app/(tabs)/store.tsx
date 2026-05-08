import { AppTitle } from '@/components/app-title';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const categories = ['All', 'LUTs', 'SFX', 'Overlays', 'Templates'];

const assets = [
  { id: '1', title: 'Neon Pulse LUT Pack', creator: 'VividNodes', badge: 'LUT', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80' },
  { id: '2', title: 'Cinematic Grain FX', creator: 'StudioFrame', badge: 'SFX', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80' },
  { id: '3', title: 'Dark Glass Overlay Kit', creator: 'OverlayLab', badge: 'Overlay', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80' },
];

export default function StoreScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppTitle size="sm" />
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton}><MaterialIcons name="shopping-cart" size={18} color="#DCE6F4" /></Pressable>
            <Pressable style={styles.iconButton}><MaterialIcons name="notifications-none" size={18} color="#DCE6F4" /></Pressable>
          </View>
        </View>

        <Text style={styles.title}>Marketplace</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {categories.map((category, index) => (
            <Pressable key={category} style={[styles.categoryChip, index === 0 && styles.categoryChipActive]}>
              <Text style={[styles.categoryText, index === 0 && styles.categoryTextActive]}>{category}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.featuredCard}>
          <Image source={{ uri: assets[0].image }} style={styles.featuredImage} />
          <View style={styles.featuredOverlay}>
            <Text style={styles.badge}>{assets[0].badge}</Text>
            <Text style={styles.featuredTitle}>{assets[0].title}</Text>
            <Text style={styles.featuredText}>Creator: {assets[0].creator} • v2.1</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Trending Assets</Text>
        <View style={styles.assetGrid}>
          {assets.slice(1).map((asset) => (
            <View key={asset.id} style={styles.assetCard}>
              <Image source={{ uri: asset.image }} style={styles.assetImage} />
              <View style={styles.assetBody}>
                <Text style={styles.assetTitle}>{asset.title}</Text>
                <Text style={styles.assetCreator}>{asset.creator}</Text>
                <Text style={styles.assetBadge}>{asset.badge}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#090B10' },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#F4F8FF', fontSize: 24, fontWeight: '900', marginBottom: 14 },
  categoryRow: { gap: 10, paddingBottom: 16 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230' },
  categoryChipActive: { backgroundColor: '#15C8FF', borderColor: '#15C8FF' },
  categoryText: { color: '#8A93A3', fontWeight: '800', fontSize: 12 },
  categoryTextActive: { color: '#041117' },
  featuredCard: { backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', borderRadius: 22, overflow: 'hidden', marginBottom: 16 },
  featuredImage: { width: '100%', height: 190 },
  featuredOverlay: { padding: 14 },
  badge: { color: '#15C8FF', fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  featuredTitle: { color: '#F4F8FF', fontSize: 20, fontWeight: '900', marginBottom: 6 },
  featuredText: { color: '#8A93A3', fontSize: 12 },
  sectionTitle: { color: '#F4F8FF', fontSize: 15, fontWeight: '800', marginBottom: 12 },
  assetGrid: { gap: 12 },
  assetCard: { backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', borderRadius: 18, overflow: 'hidden' },
  assetImage: { width: '100%', height: 130 },
  assetBody: { padding: 12 },
  assetTitle: { color: '#F4F8FF', fontSize: 14, fontWeight: '800', marginBottom: 4 },
  assetCreator: { color: '#8A93A3', fontSize: 12, marginBottom: 6 },
  assetBadge: { color: '#15C8FF', fontSize: 11, fontWeight: '800' },
});
