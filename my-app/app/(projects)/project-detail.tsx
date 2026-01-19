import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

export default function ProjectDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const title = Array.isArray(params.title) ? params.title[0] : (params.title || 'Project Title');
  const client = Array.isArray(params.client) ? params.client[0] : (params.client || 'Client Name');
  const budget = Array.isArray(params.budget) ? params.budget[0] : (params.budget || '₹0');
  const duration = Array.isArray(params.duration) ? params.duration[0] : (params.duration || 'N/A');
  const skills = Array.isArray(params.skills) ? params.skills[0] : (params.skills || '');
  const match = Array.isArray(params.match) ? params.match[0] : (params.match || '0');
  const status = Array.isArray(params.status) ? params.status[0] : (params.status || 'active');

  const skillsList = skills.split(',').filter(s => s.trim());

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Project</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.projectHeader}>
          <Text style={styles.projectTitle}>{title}</Text>
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>{match}% Match</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Project Details</Text>
          <View style={styles.detailsList}>
            <View style={styles.detailItem}>
              <Ionicons name="business-outline" size={20} color={COLORS.PRIMARY} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Client</Text>
                <Text style={styles.detailValue}>{client}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="cash-outline" size={20} color={COLORS.PRIMARY} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Budget</Text>
                <Text style={styles.detailValue}>{budget}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={20} color={COLORS.PRIMARY} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>{duration}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="flag-outline" size={20} color={COLORS.PRIMARY} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={styles.detailValue}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Required Skills</Text>
          <View style={styles.skillsContainer}>
            {skillsList.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill.trim()}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            We are looking for an experienced freelancer to work on this project. The ideal candidate should have strong expertise in the required skills and be able to deliver high-quality work within the specified timeline.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => {
              router.push({
                pathname: '/(jobs)/job-application' as any,
                params: {
                  jobId: Array.isArray(params.id) ? params.id[0] : (params.id || ''),
                  jobTitle: title,
                  company: client,
                },
              });
            }}
          >
            <Ionicons name="send" size={20} color="#ffffff" />
            <Text style={styles.applyButtonText}>Apply for Project</Text>
          </TouchableOpacity>
        </View>
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
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 24,
    marginBottom: 24,
  },
  projectTitle: {
    flex: 1,
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginRight: 12,
  },
  matchBadge: {
    backgroundColor: COLORS.PRIMARY + '30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  matchText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  infoCard: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 16,
    padding: isSmallScreen ? 16 : 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  detailsList: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: COLORS.SECONDARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  skillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  description: {
    fontSize: 15,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: 8,
  },
  applyButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
});
