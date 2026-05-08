import { AppTitle } from '@/components/app-title';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type Job = {
  id: string;
  role: string;
  company: string;
  type: string;
  location: string;
  rate: string;
  tag: string;
  featured?: boolean;
};

const jobs: Job[] = [
  { id: '1', role: 'Lead Motion Designer', company: 'Ensemble Creative Studio', type: 'Full-time', location: 'Remote', rate: '$6k - $8k', tag: 'Featured', featured: true },
  { id: '2', role: 'Senior UI/UX Architect', company: 'Creative Lab', type: 'Remote', location: 'London, UK', rate: '$110/hr', tag: 'Remote' },
  { id: '3', role: 'VFX Compositor', company: 'Visual Media', type: 'Contract', location: 'NYC / Hybrid', rate: '$1.8k/project', tag: 'Contract' },
  { id: '4', role: 'Brand Story Editor', company: 'Launch House', type: 'Freelance', location: 'Anywhere', rate: '$85/hr', tag: 'Freelance' },
];

const filters = ['All', 'Jobs', 'Gigs', 'Freelance', 'Remote'];

export default function JobsScreen() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesFilter = activeFilter === 'All' || job.type.toLowerCase().includes(activeFilter.toLowerCase()) || job.tag.toLowerCase().includes(activeFilter.toLowerCase());
      const matchesSearch = !q || [job.role, job.company, job.location, job.type].some((value) => value.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, query]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <AppTitle size="sm" />
            <Text style={styles.subtitle}>Jobs & gigs</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton}><MaterialIcons name="filter-list" size={18} color="#DCE6F4" /></Pressable>
            <Pressable style={styles.iconButton}><MaterialIcons name="bookmark-border" size={18} color="#DCE6F4" /></Pressable>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={18} color="#718099" />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search jobs or gigs" placeholderTextColor="#718099" style={styles.searchInput} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filters.map((filter) => {
            const active = activeFilter === filter;
            return (
              <Pressable key={filter} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => setActiveFilter(filter)}>
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{filter}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Showing {filteredJobs.length} open roles</Text>
          <Text style={styles.sectionMeta}>Newest</Text>
        </View>

        <View style={styles.jobsList}>
          {filteredJobs.map((job) => (
            <View key={job.id} style={[styles.jobCard, job.featured && styles.featuredCard]}>
              <View style={styles.jobTopRow}>
                <View style={styles.jobAvatar}><Text style={styles.jobAvatarText}>{job.role.slice(0, 2).toUpperCase()}</Text></View>
                <Pressable><MaterialIcons name="bookmark-border" size={18} color="#718099" /></Pressable>
              </View>
              <Text style={styles.jobRole}>{job.role}</Text>
              <Text style={styles.jobCompany}>{job.company}</Text>
              <Text style={styles.jobDescription}>We’re looking for a creator with strong taste, fast execution, and polished delivery across studio workflows.</Text>
              <View style={styles.jobMetaRow}>
                <Text style={styles.jobMeta}>{job.type}</Text>
                <Text style={styles.jobMeta}>{job.location}</Text>
                <Text style={styles.jobMeta}>{job.rate}</Text>
              </View>
              <View style={styles.jobBottomRow}>
                <View style={styles.badge}><Text style={styles.badgeText}>{job.tag}</Text></View>
                <Pressable style={styles.applyButton}><Text style={styles.applyButtonText}>Apply</Text></Pressable>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  subtitle: { color: '#718099', fontSize: 12, marginTop: 6, letterSpacing: 1.1, textTransform: 'uppercase' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', alignItems: 'center', justifyContent: 'center' },
  searchWrap: { backgroundColor: '#11151C', borderRadius: 14, borderWidth: 1, borderColor: '#1B2230', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, height: 46, marginBottom: 12 },
  searchInput: { flex: 1, color: '#F4F8FF', fontSize: 13 },
  filterRow: { gap: 10, paddingBottom: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230' },
  filterChipActive: { backgroundColor: '#15C8FF', borderColor: '#15C8FF' },
  filterText: { color: '#8A93A3', fontSize: 12, fontWeight: '700' },
  filterTextActive: { color: '#041117' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#F4F8FF', fontSize: 15, fontWeight: '800' },
  sectionMeta: { color: '#718099', fontSize: 12 },
  jobsList: { gap: 12 },
  jobCard: { backgroundColor: '#11151C', borderWidth: 1, borderColor: '#1B2230', borderRadius: 18, padding: 14 },
  featuredCard: { borderColor: '#15C8FF' },
  jobTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  jobAvatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#0E2230', alignItems: 'center', justifyContent: 'center' },
  jobAvatarText: { color: '#15C8FF', fontWeight: '800' },
  jobRole: { color: '#F4F8FF', fontSize: 15, fontWeight: '800', marginBottom: 4 },
  jobCompany: { color: '#8A93A3', fontSize: 12, marginBottom: 10 },
  jobDescription: { color: '#D8E0EE', fontSize: 12, lineHeight: 18, marginBottom: 12 },
  jobMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  jobMeta: { color: '#D8E0EE', fontSize: 11, backgroundColor: '#0E131A', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  jobBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { backgroundColor: '#0E2230', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  badgeText: { color: '#15C8FF', fontSize: 11, fontWeight: '800' },
  applyButton: { backgroundColor: '#15C8FF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  applyButtonText: { color: '#041117', fontSize: 12, fontWeight: '800' },
});
