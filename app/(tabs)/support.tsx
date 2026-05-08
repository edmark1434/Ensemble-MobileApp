import { AppTitle } from '@/components/app-title';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const helpCards = [
  { id: '1', title: 'Getting Started', icon: 'rocket-launch' },
  { id: '2', title: 'Billing & Plans', icon: 'payments' },
  { id: '3', title: 'Editor Tools', icon: 'build' },
  { id: '4', title: 'Privacy & Security', icon: 'security' },
];

const faqs = [
  'How do I export in 4K resolution?',
  'Can I collaborate in real-time?',
  'Resetting my workspace layout',
];

export default function SupportScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppTitle size="sm" />
          <MaterialIcons name="notifications-none" size={18} color="#DCE6F4" />
        </View>

        <Text style={styles.title}>Help & Support</Text>
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={18} color="#718099" />
          <TextInput placeholder="Search for help..." placeholderTextColor="#718099" style={styles.searchInput} />
        </View>

        <View style={styles.cardGrid}>
          {helpCards.map((card) => (
            <View key={card.id} style={styles.helpCard}>
              <MaterialIcons name={card.icon as any} size={20} color="#15C8FF" />
              <Text style={styles.helpCardText}>{card.title}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Frequently asked questions</Text>
        <View style={styles.faqList}>
          {faqs.map((faq) => (
            <View key={faq} style={styles.faqItem}>
              <Text style={styles.faqText}>{faq}</Text>
              <MaterialIcons name="expand-more" size={20} color="#718099" />
            </View>
          ))}
        </View>

        <View style={styles.supportCard}>
          <View style={styles.supportMeta}>
            <Text style={styles.supportTitle}>Need more help?</Text>
            <Text style={styles.supportText}>Our team is available 24/7 for technical support and account questions.</Text>
          </View>
          <View style={styles.supportButtons}>
            <Pressable style={styles.primaryButton}><Text style={styles.primaryButtonText}>Chat with support</Text></Pressable>
            <Pressable style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Email us</Text></Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#090B10' },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  title: { color: '#F4F8FF', fontSize: 24, fontWeight: '900', marginBottom: 12 },
  searchWrap: { backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, height: 46, marginBottom: 16 },
  searchInput: { flex: 1, color: '#F4F8FF', fontSize: 13 },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  helpCard: { width: '48%', minHeight: 84, backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', borderRadius: 16, padding: 14, justifyContent: 'space-between' },
  helpCardText: { color: '#F4F8FF', fontSize: 13, fontWeight: '700' },
  sectionTitle: { color: '#F4F8FF', fontSize: 15, fontWeight: '800', marginBottom: 10 },
  faqList: { gap: 10, marginBottom: 18 },
  faqItem: { backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqText: { color: '#F4F8FF', fontSize: 13, fontWeight: '600' },
  supportCard: { backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', borderRadius: 18, padding: 14 },
  supportMeta: { marginBottom: 14 },
  supportTitle: { color: '#F4F8FF', fontSize: 16, fontWeight: '800', marginBottom: 6 },
  supportText: { color: '#8A93A3', fontSize: 12, lineHeight: 18 },
  supportButtons: { gap: 10 },
  primaryButton: { backgroundColor: '#15C8FF', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  primaryButtonText: { color: '#041117', fontWeight: '900', fontSize: 13 },
  secondaryButton: { backgroundColor: '#0E131A', borderWidth: 1, borderColor: '#1B2230', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  secondaryButtonText: { color: '#F4F8FF', fontWeight: '800', fontSize: 13 },
});
