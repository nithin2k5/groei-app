import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, TextInput, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { jobsApi, savedJobsApi } from '@/services/api';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary?: string;
  match?: number;
  type?: string;
  posted?: string;
  icon?: string;
  status?: string;
}

export default function JobsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
    loadSavedJobs();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadJobs();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, filter]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: any = {};
      if (searchQuery) filters.search = searchQuery;
      if (filter === 'remote') filters.location = 'Remote';
      if (filter === 'hybrid') filters.location = 'Hybrid';
      if (filter === 'onsite') filters.location = 'On-site';

      const response = await jobsApi.getAll(filters);
      setJobs(Array.isArray(response) ? response : (response.data || response.jobs || []));
    } catch (err: any) {
      console.error('Error loading jobs:', err);
      setError(err.message || 'Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedJobs = async () => {
    try {
      const response = await savedJobsApi.getAll();
      const savedJobIds = Array.isArray(response)
        ? response.map((item: any) => item.job_id || item.id)
        : (response.data || []).map((item: any) => item.job_id || item.id);
      setSavedJobs(savedJobIds);
    } catch (error) {
      console.error('Error loading saved jobs:', error);
    }
  };

  const handleSaveJob = async (jobId: number) => {
    try {
      const isSaved = savedJobs.includes(jobId);

      if (isSaved) {
        await savedJobsApi.delete(jobId);
        setSavedJobs(savedJobs.filter(id => id !== jobId));
      } else {
        await savedJobsApi.save(jobId);
        setSavedJobs([...savedJobs, jobId]);
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const formatSalary = (salary?: string) => {
    if (!salary) return 'Salary not specified';
    return salary;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    return dateString;
  };

  const getJobIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('react') || lowerTitle.includes('frontend')) return 'code';
    if (lowerTitle.includes('backend') || lowerTitle.includes('server')) return 'server';
    if (lowerTitle.includes('design') || lowerTitle.includes('ui/ux')) return 'brush';
    if (lowerTitle.includes('full stack') || lowerTitle.includes('fullstack')) return 'layers';
    return 'briefcase';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jobs</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.TEXT_SECONDARY} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs..."
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.filterContainer}>
          {['all', 'remote', 'hybrid', 'onsite'].map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              style={[styles.filterChip, filter === filterOption && styles.filterChipActive]}
              onPress={() => setFilter(filterOption)}
            >
              <Text style={[styles.filterChipText, filter === filterOption && styles.filterChipTextActive]}>
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text style={styles.loadingText}>Loading jobs...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.ERROR} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadJobs}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.resultsText}>{jobs.length} jobs found</Text>
            {jobs.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="briefcase-outline" size={64} color={COLORS.TEXT_SECONDARY} />
                <Text style={styles.emptyText}>No jobs found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
              </View>
            ) : (
              jobs.map((job) => (
                <TouchableOpacity
                  key={job.id}
                  style={styles.jobCard}
                  onPress={() => {
                    router.push({
                      pathname: '/(jobs)/job-detail' as any,
                      params: {
                        id: job.id.toString(),
                        title: job.title,
                        company: job.company,
                        location: job.location,
                        salary: job.salary || '',
                        match: job.match?.toString() || '0',
                        type: job.type || '',
                        posted: job.posted || '',
                        icon: job.icon || getJobIcon(job.title),
                      },
                    });
                  }}
                >
                  <View style={styles.jobHeader}>
                    <View style={styles.jobIconContainer}>
                      <Ionicons name={getJobIcon(job.title) as any} size={24} color={COLORS.PRIMARY} />
                    </View>
                    <View style={styles.jobInfo}>
                      <Text style={styles.jobTitle}>{job.title}</Text>
                      <Text style={styles.jobCompany}>{job.company} • {job.location}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleSaveJob(job.id);
                      }}
                      style={styles.bookmarkButton}
                    >
                      <Ionicons
                        name={savedJobs.includes(job.id) ? 'bookmark' : 'bookmark-outline'}
                        size={24}
                        color={savedJobs.includes(job.id) ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY}
                      />
                    </TouchableOpacity>
                  </View>
                  {job.match && (
                    <View style={styles.matchBadgeContainer}>
                      <View style={styles.matchBadge}>
                        <Text style={styles.matchText}>{job.match}% Match</Text>
                      </View>
                    </View>
                  )}
                  <View style={styles.jobDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="cash-outline" size={14} color={COLORS.TEXT_SECONDARY} />
                      <Text style={styles.detailText}>{formatSalary(job.salary)}</Text>
                    </View>
                    {job.type && (
                      <View style={styles.detailItem}>
                        <Ionicons name="time-outline" size={14} color={COLORS.TEXT_SECONDARY} />
                        <Text style={styles.detailText}>{job.type}</Text>
                      </View>
                    )}
                    <View style={styles.detailItem}>
                      <Ionicons name="calendar-outline" size={14} color={COLORS.TEXT_SECONDARY} />
                      <Text style={styles.detailText}>{formatDate(job.posted)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isSmallScreen ? 16 : 24,
    paddingVertical: isSmallScreen ? 12 : 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: isSmallScreen ? 16 : 24,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    padding: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.SECONDARY,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  filterChipActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: isSmallScreen ? 16 : 24,
    paddingBottom: 24,
  },
  resultsText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 16,
    marginTop: 8,
  },
  jobCard: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 16,
    padding: isSmallScreen ? 16 : 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  bookmarkButton: {
    padding: 4,
    marginLeft: 8,
  },
  matchBadgeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  matchBadge: {
    backgroundColor: COLORS.PRIMARY + '30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  jobDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
  },
  chatbotButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.ERROR,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
});
