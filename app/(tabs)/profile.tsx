import { AppTitle } from '@/components/app-title';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const portfolio = [
  { id: '1', name: 'Cyber_Corp_UI', image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80' },
  { id: '2', name: 'Arc_Light_Set', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80' },
  { id: '3', name: 'Nebula_Plane', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80' },
  { id: '4', name: 'VFX_Atm_World', image: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=1200&q=80' },
];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppTitle size="sm" />
          <MaterialIcons name="notifications-none" size={18} color="#DCE6F4" />
        </View>

        <View style={styles.profileCard}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80' }} style={styles.avatar} />
          <Text style={styles.name}>Kaelen Vance</Text>
          <Text style={styles.handle}>@kaelen_vance</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}><Text style={styles.statValue}>124</Text><Text style={styles.statLabel}>Projects</Text></View>
            <View style={styles.stat}><Text style={styles.statValue}>842</Text><Text style={styles.statLabel}>Assets Sold</Text></View>
            <View style={styles.stat}><Text style={styles.statValue}>98.2%</Text><Text style={styles.statLabel}>Reputation</Text></View>
          </View>
          <View style={styles.buttonRow}>
            <Pressable style={styles.primaryButton}><Text style={styles.primaryButtonText}>Edit Profile</Text></Pressable>
            <Pressable style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Share Profile</Text></Pressable>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Portfolio</Text>
        <View style={styles.portfolioGrid}>
          {portfolio.map((item) => (
            <View key={item.id} style={styles.portfolioCard}>
              <Image source={{ uri: item.image }} style={styles.portfolioImage} />
              <Text style={styles.portfolioName}>{item.name}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsCard}>
          {['Account Information', 'Privacy & Security', 'Billing & Plans', 'Support & Feedback'].map((item) => (
            <View key={item} style={styles.settingRow}>
              <Text style={styles.settingText}>{item}</Text>
              <MaterialIcons name="chevron-right" size={18} color="#718099" />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  profileCard: { backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', borderRadius: 20, padding: 16, alignItems: 'center', marginBottom: 18 },
  avatar: { width: 80, height: 80, borderRadius: 28, marginBottom: 10 },
  name: { color: '#F4F8FF', fontSize: 20, fontWeight: '900' },
  handle: { color: '#15C8FF', fontSize: 12, fontWeight: '700', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 14 },
  stat: { flex: 1, backgroundColor: '#0E131A', borderRadius: 16, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#1B2230' },
  statValue: { color: '#F4F8FF', fontSize: 18, fontWeight: '900' },
  statLabel: { color: '#718099', fontSize: 11, marginTop: 4 },
  buttonRow: { flexDirection: 'row', gap: 10, width: '100%' },
  primaryButton: { flex: 1, backgroundColor: '#15C8FF', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  primaryButtonText: { color: '#041117', fontWeight: '900', fontSize: 13 },
  secondaryButton: { flex: 1, backgroundColor: '#0E131A', borderRadius: 14, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#1B2230' },
  secondaryButtonText: { color: '#F4F8FF', fontWeight: '800', fontSize: 13 },
  sectionTitle: { color: '#F4F8FF', fontSize: 15, fontWeight: '800', marginBottom: 10 },
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  portfolioCard: { width: '48%', backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', borderRadius: 16, overflow: 'hidden' },
  portfolioImage: { width: '100%', height: 120 },
  portfolioName: { color: '#F4F8FF', fontSize: 12, fontWeight: '700', padding: 10 },
  settingsCard: { backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', borderRadius: 18, overflow: 'hidden' },
  settingRow: { paddingHorizontal: 14, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1B2230' },
  settingText: { color: '#F4F8FF', fontSize: 13, fontWeight: '700' },
});
