import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { savedJobsApi, jobsApi } from '@/services/api';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

interface SavedJob {
  id: number;
  job_id: number;
  job?: {
    id: number;
    title: string;
    company: string;
    location: string;
    salary?: string;
    match?: number;
    type?: string;
    posted?: string;
  };
  saved_at?: string;
}

export default function SavedJobsScreen() {
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadSavedJobs();
    }, [])
  );

  const loadSavedJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await savedJobsApi.getAll();
      const jobs = Array.isArray(response) ? response : (response.data || []);
      setSavedJobs(jobs);
    } catch (err: any) {
      console.error('Error loading saved jobs:', err);
      setError(err.message || 'Failed to load saved jobs');
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId: number) => {
    try {
      await savedJobsApi.delete(jobId);
      setSavedJobs(savedJobs.filter(item => (item.job_id || item.id) !== jobId));
    } catch (error) {
      console.error('Error unsaving job:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Jobs</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text style={styles.loadingText}>Loading saved jobs...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.ERROR} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadSavedJobs}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : savedJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={64} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyTitle}>No Saved Jobs</Text>
            <Text style={styles.emptyText}>Jobs you save will appear here</Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push('/jobs')}
            >
              <Text style={styles.exploreButtonText}>Explore Jobs</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.resultsText}>{savedJobs.length} saved jobs</Text>
            {savedJobs.map((item) => {
              const job = item.job || item as any;
              const jobId = job.id || item.job_id || item.id;
              return (
                <TouchableOpacity
                  key={jobId}
                  style={styles.jobCard}
                  onPress={() => {
                    router.push({
                      pathname: '/(jobs)/job-detail' as any,
                      params: {
                        id: jobId.toString(),
                        title: job.title || '',
                        company: job.company || '',
                        location: job.location || '',
                        salary: job.salary || '',
                        match: job.match?.toString() || '0',
                      },
                    });
                  }}
                >
                  <View style={styles.jobHeader}>
                    <View style={styles.jobInfo}>
                      <Text style={styles.jobTitle}>{job.title || 'Job Title'}</Text>
                      <Text style={styles.jobCompany}>{job.company || ''} • {job.location || ''}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.unsaveButton}
                      onPress={() => handleUnsave(jobId)}
                    >
                      <Ionicons name="bookmark" size={24} color={COLORS.PRIMARY} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.jobDetails}>
                    <Text style={styles.jobSalary}>{job.salary || 'Salary not specified'}</Text>
                    {job.match && (
                      <View style={styles.matchBadge}>
                        <Text style={styles.matchText}>{job.match}% Match</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.savedDate}>Saved {formatDate(item.saved_at || job.posted)}</Text>
                </TouchableOpacity>
              );
            })}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: isSmallScreen ? 16 : 24,
    paddingBottom: 24,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
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
    marginBottom: 24,
    textAlign: 'center',
  },
  exploreButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  resultsText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 16,
    marginTop: 16,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  unsaveButton: {
    padding: 4,
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobSalary: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
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
  savedDate: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
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
