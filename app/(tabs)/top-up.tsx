import { AppTitle } from '@/components/app-title';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

type Pack = { id: string; amount: string; price: string; bonus?: string; bestValue?: boolean };

const packs: Pack[] = [
  { id: '1', amount: '500 EC', price: '$4.99' },
  { id: '2', amount: '1,200 EC', price: '$9.99', bonus: '+10% bonus', bestValue: true },
  { id: '3', amount: '3,500 EC', price: '$24.99', bonus: '+25% bonus' },
  { id: '4', amount: '8,000 EC', price: '$49.99', bonus: '+40% bonus' },
];

export default function TopUpScreen() {
  const [selectedId, setSelectedId] = useState('2');
  const selected = packs.find((pack) => pack.id === selectedId) ?? packs[1];

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppTitle size="sm" />
          <Pressable style={styles.iconButton}><MaterialIcons name="notifications-none" size={18} color="#DCE6F4" /></Pressable>
        </View>

        <Text style={styles.title}>Top Up</Text>
        <Text style={styles.subtitle}>Get credits to unlock premium tools and assets.</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your balance</Text>
          <Text style={styles.balanceValue}>1,240 EC</Text>
          <Pressable style={styles.balanceCopy}><MaterialIcons name="content-copy" size={16} color="#15C8FF" /></Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select pack</Text>
          <Text style={styles.sectionMeta}>Best value</Text>
        </View>

        <View style={styles.packGrid}>
          {packs.map((pack) => {
            const active = selectedId === pack.id;
            return (
              <Pressable key={pack.id} onPress={() => setSelectedId(pack.id)} style={[styles.packCard, active && styles.packCardActive]}>
                {pack.bestValue ? <Text style={styles.bestValue}>{pack.bonus}</Text> : null}
                <Text style={styles.packAmount}>{pack.amount}</Text>
                <Text style={styles.packPrice}>{pack.price}</Text>
                {active ? <MaterialIcons name="check-circle" size={16} color="#15C8FF" style={styles.check} /> : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Payment method</Text>
        <View style={styles.paymentCard}>
          {['Apple Pay', 'Google Pay', 'Ending in ••42'].map((method, index) => {
            const active = index === 2;
            return (
              <View key={method} style={styles.paymentRow}>
                <View style={styles.paymentLeft}>
                  <View style={[styles.paymentIcon, active && styles.paymentIconActive]}>
                    <Text style={styles.paymentIconText}>{index === 0 ? '' : index === 1 ? 'G' : '••'}</Text>
                  </View>
                  <Text style={styles.paymentText}>{method}</Text>
                </View>
                <View style={[styles.radio, active && styles.radioActive]} />
              </View>
            );
          })}
        </View>

        <Pressable style={styles.topUpButton}>
          <Text style={styles.topUpButtonText}>Top Up Now</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#090B10' },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  iconButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#F4F8FF', fontSize: 24, fontWeight: '900', marginBottom: 6 },
  subtitle: { color: '#718099', fontSize: 13, marginBottom: 18 },
  balanceCard: { backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', borderRadius: 18, padding: 16, marginBottom: 18, position: 'relative' },
  balanceLabel: { color: '#8A93A3', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  balanceValue: { color: '#F4F8FF', fontSize: 34, fontWeight: '900', marginTop: 6 },
  balanceCopy: { position: 'absolute', right: 14, top: 14, width: 34, height: 34, borderRadius: 10, backgroundColor: '#0E2230', alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: '#F4F8FF', fontSize: 15, fontWeight: '800', marginBottom: 10 },
  sectionMeta: { color: '#15C8FF', fontSize: 11, fontWeight: '800' },
  packGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  packCard: { width: '48%', backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', borderRadius: 16, padding: 14, minHeight: 120 },
  packCardActive: { borderColor: '#15C8FF', backgroundColor: '#101C25' },
  bestValue: { color: '#15C8FF', fontSize: 10, fontWeight: '800', marginBottom: 10, textTransform: 'uppercase' },
  packAmount: { color: '#F4F8FF', fontSize: 18, fontWeight: '900', marginBottom: 8 },
  packPrice: { color: '#15C8FF', fontSize: 14, fontWeight: '800' },
  check: { position: 'absolute', right: 12, bottom: 12 },
  paymentCard: { backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', borderRadius: 18, padding: 12, marginBottom: 18 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  paymentLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  paymentIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#0E131A', alignItems: 'center', justifyContent: 'center' },
  paymentIconActive: { backgroundColor: '#0E2230' },
  paymentIconText: { color: '#F4F8FF', fontSize: 14, fontWeight: '800' },
  paymentText: { color: '#F4F8FF', fontSize: 13, fontWeight: '700' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#4D5668' },
  radioActive: { borderColor: '#15C8FF', backgroundColor: '#15C8FF' },
  topUpButton: { backgroundColor: '#15C8FF', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  topUpButtonText: { color: '#041117', fontSize: 14, fontWeight: '900' },
});
