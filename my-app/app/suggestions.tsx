import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { jobsApi, savedJobsApi } from '@/services/api';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

interface SuggestedJob {
  id: number;
  title: string;
  company: string;
  location: string;
  salary?: string;
  match?: number;
  type?: string;
  posted?: string;
  icon?: string;
  reason?: string;
  skills?: string[];
}

export default function SuggestionsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedJobs, setSuggestedJobs] = useState<SuggestedJob[]>([]);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSuggestions();
    loadSavedJobs();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadSuggestions();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: any = { suggested: true };
      if (searchQuery) filters.search = searchQuery;

      const response = await jobsApi.getAll(filters);
      const jobs = Array.isArray(response) ? response : (response.data || response.suggestions || []);
      setSuggestedJobs(jobs);
    } catch (err: any) {
      console.error('Error loading suggestions:', err);
      setError(err.message || 'Failed to load suggestions');
      setSuggestedJobs([]);
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

  const getJobIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('react') || lowerTitle.includes('frontend')) return 'code';
    if (lowerTitle.includes('backend') || lowerTitle.includes('server')) return 'server';
    if (lowerTitle.includes('design') || lowerTitle.includes('ui/ux')) return 'color-palette';
    if (lowerTitle.includes('full stack') || lowerTitle.includes('fullstack')) return 'layers';
    if (lowerTitle.includes('mobile') || lowerTitle.includes('native')) return 'phone-portrait';
    if (lowerTitle.includes('javascript')) return 'logo-javascript';
    return 'briefcase';
  };

  const filteredJobs = suggestedJobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="sparkles" size={24} color={COLORS.PRIMARY} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>AI Suggestions</Text>
            <Text style={styles.headerSubtitle}>Based on your resume</Text>
          </View>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.TEXT_SECONDARY} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search suggestions..."
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="bulb" size={24} color={COLORS.PRIMARY} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Personalized Job Recommendations</Text>
            <Text style={styles.infoText}>
              These jobs are matched to your resume using AI. The higher the match percentage, the better the fit for your skills and experience.
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text style={styles.loadingText}>Loading suggestions...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.ERROR} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadSuggestions}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.resultsText}>{filteredJobs.length} job suggestions</Text>

            {filteredJobs.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color={COLORS.TEXT_SECONDARY} />
                <Text style={styles.emptyTitle}>No Suggestions Found</Text>
                <Text style={styles.emptyText}>Try adjusting your search</Text>
              </View>
            ) : (
              filteredJobs.map((job) => (
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
                  <View style={styles.cardTop}>
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

                    <View style={styles.matchContainer}>
                      <View style={styles.matchBadge}>
                        <Ionicons name="sparkles" size={16} color={COLORS.PRIMARY} />
                        <Text style={styles.matchText}>{job.match}% Match</Text>
                      </View>
                    </View>
                  </View>

                  {job.reason && (
                    <View style={styles.reasonBox}>
                      <View style={styles.reasonHeader}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.SUCCESS} />
                        <Text style={styles.reasonText}>{job.reason}</Text>
                      </View>
                      {job.skills && job.skills.length > 0 && (
                        <View style={styles.skillsContainer}>
                          {job.skills.map((skill, index) => (
                            <View key={index} style={styles.skillTag}>
                              <Text style={styles.skillText}>{skill}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  <View style={styles.jobDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="cash-outline" size={14} color={COLORS.TEXT_SECONDARY} />
                      <Text style={styles.detailText}>{job.salary}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="time-outline" size={14} color={COLORS.TEXT_SECONDARY} />
                      <Text style={styles.detailText}>{job.type}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="calendar-outline" size={14} color={COLORS.TEXT_SECONDARY} />
                      <Text style={styles.detailText}>{job.posted}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.chatbotButton}
        onPress={() => router.push('/chatbot' as any)}
      >
        <Ionicons name="chatbubbles" size={24} color="#ffffff" />
      </TouchableOpacity>
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
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: isSmallScreen ? 16 : 24,
    paddingTop: 16,
    paddingBottom: 12,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: isSmallScreen ? 16 : 24,
    paddingBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 16,
    padding: isSmallScreen ? 16 : 20,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    gap: 12,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 18,
  },
  resultsText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 16,
    fontWeight: '600',
  },
  jobCard: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 16,
    padding: isSmallScreen ? 16 : 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  cardTop: {
    marginBottom: 12,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  jobIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  jobInfo: {
    flex: 1,
    minWidth: 0,
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
    flexShrink: 0,
  },
  matchContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY + '30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  matchText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  reasonBox: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 18,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  skillTag: {
    backgroundColor: COLORS.SECONDARY,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  skillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  jobDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
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
});
