import { useState, useRef, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions, BackHandler, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS } from '@/constants/colors';
import * as DocumentPicker from 'expo-document-picker';
import { resumesApi } from '@/services/api';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

export default function ProfileSetupScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputLayouts = useRef<{ [key: string]: number }>({});
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    experience: '',
    currentPosition: '',
    skills: '',
    education: '',
    languages: '',
    linkedin: '',
    portfolio: '',
    jobType: '',
    salaryExpectation: '',
    availability: '',
    workLocation: '',
    workAuthorization: '',
    resume: null as string | null,
    resumeFile: null as { uri: string; name: string; size: number; mimeType: string } | null,
  });
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const { signIn } = useAuth();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (loading) return true;

      if (currentStep > 1) {
        setCurrentStep((prev) => prev - 1);
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }, 100);
        return true;
      } else {
        router.back();
        return true;
      }
    });

    return () => {
      backHandler.remove();
    };
  }, [currentStep, loading, router]);

  const steps = [
    { number: 1, title: 'PERSONAL INFO', icon: 'person' },
    { number: 2, title: 'EXPERIENCE', icon: 'briefcase' },
    { number: 3, title: 'PREFERENCES', icon: 'settings' },
    { number: 4, title: 'RESUME', icon: 'document-text' },
  ];

  const handleNext = () => {
    if (loading) return;

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (loading) return;

    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      router.back();
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (loading) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setLoading(true);

    try {
      if (formData.resumeFile) {
        await resumesApi.upload(
          formData.resumeFile.uri,
          formData.resumeFile.name,
          formData.resumeFile.mimeType
        );
      }

      signIn();

      timeoutRef.current = setTimeout(() => {
        setLoading(false);
        router.replace('/dashboard');
        timeoutRef.current = null;
      }, 1500);
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Error', err.message || 'Failed to upload resume. Please try again.');
    }
  };

  const handleResumeUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];

      if (file.size && file.size > 5 * 1024 * 1024) {
        Alert.alert('Error', 'File size must be less than 5MB');
        return;
      }

      setFormData({
        ...formData,
        resume: file.name,
        resumeFile: {
          uri: file.uri,
          name: file.name,
          size: file.size || 0,
          mimeType: file.mimeType || 'application/pdf',
        },
      });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to pick document');
    }
  };

  const handleInputFocus = (inputKey: string) => {
    setTimeout(() => {
      const y = inputLayouts.current[inputKey];
      if (y !== undefined && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: Math.max(0, y - 150), animated: true });
      }
    }, 100);
  };

  const handleInputLayout = (inputKey: string, event: any) => {
    inputLayouts.current[inputKey] = event.nativeEvent.layout.y;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <View style={styles.titleSection}>
              <View style={styles.titleIconContainer}>
                <Ionicons name="person" size={32} color={COLORS.PRIMARY} />
              </View>
              <Text style={[styles.stepTitle, isSmallScreen && styles.stepTitleSmall]}>
                PERSONAL INFORMATION
              </Text>
              <Text style={[styles.stepDescription, isSmallScreen && styles.stepDescriptionSmall]}>
                Let's start with the basics
              </Text>
            </View>

            <View style={styles.formSection}>
              <View
                style={[styles.inputWrapper, isSmallScreen && styles.inputWrapperSmall]}
                onLayout={(e) => handleInputLayout('fullName', e)}
              >
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}>
                  <Ionicons name="person-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, isSmallScreen && styles.inputSmall]}
                    placeholder="Enter your full name"
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    value={formData.fullName}
                    onChangeText={(value) => setFormData({ ...formData, fullName: value })}
                    autoCapitalize="words"
                    editable={!loading}
                    onFocus={() => handleInputFocus('fullName')}
                  />
                </View>
              </View>

              <View
                style={[styles.inputWrapper, isSmallScreen && styles.inputWrapperSmall]}
                onLayout={(e) => handleInputLayout('phone', e)}
              >
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}>
                  <Ionicons name="call-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, isSmallScreen && styles.inputSmall]}
                    placeholder="Enter your phone number"
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    value={formData.phone}
                    onChangeText={(value) => setFormData({ ...formData, phone: value })}
                    keyboardType="phone-pad"
                    editable={!loading}
                    onFocus={() => handleInputFocus('phone')}
                  />
                </View>
              </View>

              <View
                style={[styles.inputWrapper, isSmallScreen && styles.inputWrapperSmall]}
                onLayout={(e) => handleInputLayout('location', e)}
              >
                <Text style={styles.inputLabel}>Location</Text>
                <View style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}>
                  <Ionicons name="location-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, isSmallScreen && styles.inputSmall]}
                    placeholder="City, Country"
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    value={formData.location}
                    onChangeText={(value) => setFormData({ ...formData, location: value })}
                    editable={!loading}
                    onFocus={() => handleInputFocus('location')}
                  />
                </View>
              </View>

              <View
                style={[styles.inputWrapper, isSmallScreen && styles.inputWrapperSmall]}
                onLayout={(e) => handleInputLayout('languages', e)}
              >
                <Text style={styles.inputLabel}>Languages</Text>
                <View style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}>
                  <Ionicons name="language-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, isSmallScreen && styles.inputSmall]}
                    placeholder="English, Spanish, French..."
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    value={formData.languages}
                    onChangeText={(value) => setFormData({ ...formData, languages: value })}
                    editable={!loading}
                    onFocus={() => handleInputFocus('languages')}
                  />
                </View>
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <View style={styles.titleSection}>
              <View style={styles.titleIconContainer}>
                <Ionicons name="briefcase" size={32} color={COLORS.PRIMARY} />
              </View>
              <Text style={[styles.stepTitle, isSmallScreen && styles.stepTitleSmall]}>
                EXPERIENCE & SKILLS
              </Text>
              <Text style={[styles.stepDescription, isSmallScreen && styles.stepDescriptionSmall]}>
                Showcase your professional background
              </Text>
            </View>

            <View style={styles.formSection}>
              <View
                style={[styles.inputWrapper, isSmallScreen && styles.inputWrapperSmall]}
                onLayout={(e) => handleInputLayout('experience', e)}
              >
                <Text style={styles.inputLabel}>Years of Experience</Text>
                <View style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}>
                  <Ionicons name="time-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, isSmallScreen && styles.inputSmall]}
                    placeholder="e.g., 5"
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    value={formData.experience}
                    onChangeText={(value) => setFormData({ ...formData, experience: value })}
                    keyboardType="number-pad"
                    editable={!loading}
                    onFocus={() => handleInputFocus('experience')}
                  />
                </View>
              </View>

              <View
                style={[styles.inputWrapper, isSmallScreen && styles.inputWrapperSmall]}
                onLayout={(e) => handleInputLayout('currentPosition', e)}
              >
                <Text style={styles.inputLabel}>Current Position</Text>
                <View style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}>
                  <Ionicons name="briefcase-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, isSmallScreen && styles.inputSmall]}
                    placeholder="Your current job title"
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    value={formData.currentPosition}
                    onChangeText={(value) => setFormData({ ...formData, currentPosition: value })}
                    editable={!loading}
                    onFocus={() => handleInputFocus('currentPosition')}
                  />
                </View>
              </View>

              <View
                style={[styles.inputWrapper, isSmallScreen && styles.inputWrapperSmall]}
                onLayout={(e) => handleInputLayout('skills', e)}
              >
                <Text style={styles.inputLabel}>Skills</Text>
                <View style={[styles.textAreaContainer, isSmallScreen && styles.textAreaContainerSmall]}>
                  <Ionicons name="code-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textArea, isSmallScreen && styles.textAreaSmall]}
                    placeholder="React, Node.js, Python, JavaScript..."
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    value={formData.skills}
                    onChangeText={(value) => setFormData({ ...formData, skills: value })}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!loading}
                    onFocus={() => handleInputFocus('skills')}
                  />
                </View>
              </View>

              <View
                style={[styles.inputWrapper, isSmallScreen && styles.inputWrapperSmall]}
                onLayout={(e) => handleInputLayout('education', e)}
              >
                <Text style={styles.inputLabel}>Education</Text>
                <View style={[styles.textAreaContainer, isSmallScreen && styles.textAreaContainerSmall]}>
                  <Ionicons name="school-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textArea, isSmallScreen && styles.textAreaSmall]}
                    placeholder="Degree, University, Year"
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    value={formData.education}
                    onChangeText={(value) => setFormData({ ...formData, education: value })}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    editable={!loading}
                    onFocus={() => handleInputFocus('education')}
                  />
                </View>
              </View>

              <View
                style={[styles.inputWrapper, isSmallScreen && styles.inputWrapperSmall]}
                onLayout={(e) => handleInputLayout('linkedin', e)}
              >
                <Text style={styles.inputLabel}>LinkedIn Profile <Text style={styles.optionalText}>(Optional)</Text></Text>
                <View style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}>
                  <Ionicons name="logo-linkedin" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, isSmallScreen && styles.inputSmall]}
                    placeholder="linkedin.com/in/yourprofile"
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    value={formData.linkedin}
                    onChangeText={(value) => setFormData({ ...formData, linkedin: value })}
                    keyboardType="url"
                    autoCapitalize="none"
                    editable={!loading}
                    onFocus={() => handleInputFocus('linkedin')}
                  />
                </View>
              </View>

              <View
                style={[styles.inputWrapper, isSmallScreen && styles.inputWrapperSmall]}
                onLayout={(e) => handleInputLayout('portfolio', e)}
              >
                <Text style={styles.inputLabel}>Portfolio/Website <Text style={styles.optionalText}>(Optional)</Text></Text>
                <View style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}>
                  <Ionicons name="globe-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, isSmallScreen && styles.inputSmall]}
                    placeholder="yourwebsite.com"
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    value={formData.portfolio}
                    onChangeText={(value) => setFormData({ ...formData, portfolio: value })}
                    keyboardType="url"
                    autoCapitalize="none"
                    editable={!loading}
                    onFocus={() => handleInputFocus('portfolio')}
                  />
                </View>
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <View style={styles.titleSection}>
              <View style={styles.titleIconContainer}>
                <Ionicons name="settings" size={32} color={COLORS.PRIMARY} />
              </View>
              <Text style={[styles.stepTitle, isSmallScreen && styles.stepTitleSmall]}>
                JOB PREFERENCES
              </Text>
              <Text style={[styles.stepDescription, isSmallScreen && styles.stepDescriptionSmall]}>
                What are you looking for?
              </Text>
            </View>

            <View style={styles.formSection}>
              <View
                style={[styles.inputWrapper, isSmallScreen && styles.inputWrapperSmall]}
                onLayout={(e) => handleInputLayout('jobType', e)}
              >
                <Text style={styles.inputLabel}>Job Type</Text>
                <View style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}>
                  <Ionicons name="briefcase-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, isSmallScreen && styles.inputSmall]}
                    placeholder="Full-time, Part-time, Contract, Freelance"
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    value={formData.jobType}
                    onChangeText={(value) => setFormData({ ...formData, jobType: value })}
                    editable={!loading}
                    onFocus={() => handleInputFocus('jobType')}
                  />
                </View>
              </View>

              <View
                style={[styles.inputWrapper, isSmallScreen && styles.inputWrapperSmall]}
                onLayout={(e) => handleInputLayout('salaryExpectation', e)}
              >
                <Text style={styles.inputLabel}>Salary Expectation</Text>
                <View style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}>
                  <Ionicons name="cash-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, isSmallScreen && styles.inputSmall]}
                    placeholder="₹4L - ₹5.5L or Negotiable"
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    value={formData.salaryExpectation}
                    onChangeText={(value) => setFormData({ ...formData, salaryExpectation: value })}
                    editable={!loading}
                    onFocus={() => handleInputFocus('salaryExpectation')}
                  />
                </View>
              </View>

              <View
                style={[styles.inputWrapper, isSmallScreen && styles.inputWrapperSmall]}
                onLayout={(e) => handleInputLayout('availability', e)}
              >
                <Text style={styles.inputLabel}>Availability</Text>
                <View style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}>
                  <Ionicons name="calendar-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, isSmallScreen && styles.inputSmall]}
                    placeholder="Immediately, 2 weeks, 1 month"
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    value={formData.availability}
                    onChangeText={(value) => setFormData({ ...formData, availability: value })}
                    editable={!loading}
                    onFocus={() => handleInputFocus('availability')}
                  />
                </View>
              </View>

              <View
                style={[styles.inputWrapper, isSmallScreen && styles.inputWrapperSmall]}
                onLayout={(e) => handleInputLayout('workLocation', e)}
              >
                <Text style={styles.inputLabel}>Work Location</Text>
                <View style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}>
                  <Ionicons name="location-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, isSmallScreen && styles.inputSmall]}
                    placeholder="Remote, Hybrid, On-site"
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    value={formData.workLocation}
                    onChangeText={(value) => setFormData({ ...formData, workLocation: value })}
                    editable={!loading}
                    onFocus={() => handleInputFocus('workLocation')}
                  />
                </View>
              </View>

              <View
                style={[styles.inputWrapper, isSmallScreen && styles.inputWrapperSmall]}
                onLayout={(e) => handleInputLayout('workAuthorization', e)}
              >
                <Text style={styles.inputLabel}>Work Authorization</Text>
                <View style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}>
                  <Ionicons name="document-text-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, isSmallScreen && styles.inputSmall]}
                    placeholder="US Citizen, H1B, OPT, etc."
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    value={formData.workAuthorization}
                    onChangeText={(value) => setFormData({ ...formData, workAuthorization: value })}
                    editable={!loading}
                    onFocus={() => handleInputFocus('workAuthorization')}
                  />
                </View>
              </View>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <View style={styles.titleSection}>
              <View style={styles.titleIconContainer}>
                <Ionicons name="document-text" size={32} color={COLORS.PRIMARY} />
              </View>
              <Text style={[styles.stepTitle, isSmallScreen && styles.stepTitleSmall]}>
                UPLOAD RESUME
              </Text>
              <Text style={[styles.stepDescription, isSmallScreen && styles.stepDescriptionSmall]}>
                Upload your resume for better job matches
              </Text>
            </View>

            <View style={styles.formSection}>
              <Pressable
                style={[styles.resumeUploadContainer, isSmallScreen && styles.resumeUploadContainerSmall]}
                onPress={handleResumeUpload}
                disabled={loading}
              >
                {formData.resume ? (
                  <View style={styles.resumeUploaded}>
                    <View style={styles.resumeIconContainer}>
                      <Ionicons name="checkmark-circle" size={48} color={COLORS.PRIMARY} />
                    </View>
                    <Text style={[styles.resumeText, isSmallScreen && styles.resumeTextSmall]}>
                      {formData.resume}
                    </Text>
                    <Text style={[styles.resumeSubtext, isSmallScreen && styles.resumeSubtextSmall]}>
                      Tap to change file
                    </Text>
                  </View>
                ) : (
                  <View style={styles.resumeUploadEmpty}>
                    <View style={styles.resumeIconContainer}>
                      <Ionicons name="cloud-upload-outline" size={48} color={COLORS.PRIMARY} />
                    </View>
                    <Text style={[styles.resumeText, isSmallScreen && styles.resumeTextSmall]}>
                      TAP TO UPLOAD RESUME
                    </Text>
                    <Text style={[styles.resumeSubtext, isSmallScreen && styles.resumeSubtextSmall]}>
                      PDF, DOC, DOCX (Max 5MB)
                    </Text>
                    <View style={styles.uploadHint}>
                      <Ionicons name="information-circle-outline" size={16} color={COLORS.TEXT_SECONDARY} />
                      <Text style={styles.uploadHintText}>Your resume helps us match you with better opportunities</Text>
                    </View>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              disabled={loading || currentStep === 1}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={loading || currentStep === 1 ? '#cbd5e0' : COLORS.PRIMARY}
              />
            </TouchableOpacity>

            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Step {currentStep} of {steps.length}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(currentStep / steps.length) * 100}%` }
                  ]}
                />
              </View>
            </View>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.stepsIndicator}>
            {steps.map((step, index) => (
              <View key={step.number} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    currentStep >= step.number && styles.stepCircleActive,
                    currentStep === step.number && styles.stepCircleCurrent,
                  ]}
                >
                  {currentStep > step.number ? (
                    <Ionicons name="checkmark" size={18} color="#ffffff" />
                  ) : (
                    <Ionicons
                      name={step.icon as any}
                      size={currentStep === step.number ? 18 : 16}
                      color={currentStep >= step.number ? '#ffffff' : COLORS.TEXT_SECONDARY}
                    />
                  )}
                </View>
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.stepConnector,
                      currentStep > step.number && styles.stepConnectorActive,
                    ]}
                  />
                )}
              </View>
            ))}
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.content}>
            {renderStepContent()}

            <View style={styles.buttonContainer}>
              {currentStep > 1 && (
                <Pressable
                  style={[styles.backButtonStyle, isSmallScreen && styles.backButtonStyleSmall]}
                  onPress={handleBack}
                  disabled={loading}
                >
                  <Ionicons name="arrow-back" size={18} color={COLORS.PRIMARY} />
                  <Text style={[styles.backButtonText, isSmallScreen && styles.backButtonTextSmall]}>
                    BACK
                  </Text>
                </Pressable>
              )}
              <Pressable
                style={[
                  styles.nextButton,
                  loading && styles.nextButtonDisabled,
                  isSmallScreen && styles.nextButtonSmall,
                ]}
                onPress={handleNext}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.TEXT_PRIMARY} size="small" />
                ) : (
                  <>
                    <Text style={[styles.nextButtonText, isSmallScreen && styles.nextButtonTextSmall]}>
                      {currentStep === 4 ? 'COMPLETE SETUP' : 'CONTINUE'}
                    </Text>
                    <Ionicons
                      name={currentStep === 4 ? 'checkmark-circle' : 'arrow-forward'}
                      size={isSmallScreen ? 18 : 20}
                      color="#ffffff"
                    />
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },
  header: {
    backgroundColor: COLORS.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    paddingTop: isSmallScreen ? 12 : 16,
    paddingBottom: isSmallScreen ? 16 : 20,
    paddingHorizontal: isSmallScreen ? 16 : 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isSmallScreen ? 12 : 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.SECONDARY,
  },
  progressContainer: {
    flex: 1,
    paddingHorizontal: isSmallScreen ? 12 : 16,
  },
  progressText: {
    fontSize: isSmallScreen ? 11 : 12,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  progressBar: {
    height: 4,
    borderColor: COLORS.BORDER,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 2,
  },
  headerSpacer: {
    width: 40,
  },
  stepsIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isSmallScreen ? 8 : 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: isSmallScreen ? 36 : 40,
    height: isSmallScreen ? 36 : 40,
    borderRadius: isSmallScreen ? 18 : 20,
    backgroundColor: COLORS.SECONDARY,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  stepCircleCurrent: {
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  stepConnector: {
    width: isSmallScreen ? 24 : 32,
    height: 2,
    borderColor: COLORS.BORDER,
    marginHorizontal: isSmallScreen ? 4 : 6,
  },
  stepConnectorActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: isSmallScreen ? 80 : 100,
  },
  content: {
    flex: 1,
    paddingHorizontal: isSmallScreen ? 16 : 20,
    paddingTop: isSmallScreen ? 24 : 32,
  },
  stepContent: {
    width: '100%',
  },
  titleSection: {
    marginBottom: isSmallScreen ? 28 : 32,
    alignItems: 'center',
  },
  titleIconContainer: {
    width: isSmallScreen ? 64 : 72,
    height: isSmallScreen ? 64 : 72,
    borderRadius: isSmallScreen ? 32 : 36,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 16 : 20,
  },
  stepTitle: {
    fontSize: isSmallScreen ? 26 : 30,
    fontWeight: '900',
    color: COLORS.PRIMARY,
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  stepTitleSmall: {
    fontSize: 24,
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: isSmallScreen ? 15 : 16,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
    lineHeight: isSmallScreen ? 20 : 22,
    textAlign: 'center',
    paddingHorizontal: isSmallScreen ? 8 : 16,
  },
  stepDescriptionSmall: {
    fontSize: 14,
    lineHeight: 20,
  },
  formSection: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: isSmallScreen ? 20 : 24,
    width: '100%',
  },
  inputWrapperSmall: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: isSmallScreen ? 13 : 14,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    marginBottom: isSmallScreen ? 8 : 10,
    letterSpacing: 0.3,
  },
  optionalText: {
    fontSize: isSmallScreen ? 12 : 13,
    fontWeight: '500',
    color: '#718096',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    marginBottom: 0,
    paddingLeft: isSmallScreen ? 16 : 18,
    paddingRight: isSmallScreen ? 16 : 18,
    height: isSmallScreen ? 54 : 58,
    minHeight: isSmallScreen ? 54 : 58,
    width: '100%',
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  inputContainerSmall: {
    height: 52,
    minHeight: 52,
    paddingLeft: 14,
    paddingRight: 14,
  },
  inputIcon: {
    marginRight: isSmallScreen ? 10 : 12,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: isSmallScreen ? 15 : 16,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
    padding: 0,
    margin: 0,
    paddingLeft: 0,
    paddingRight: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  inputSmall: {
    fontSize: 14,
  },
  textAreaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    marginBottom: 0,
    paddingLeft: isSmallScreen ? 16 : 18,
    paddingRight: isSmallScreen ? 16 : 18,
    paddingTop: isSmallScreen ? 16 : 18,
    paddingBottom: isSmallScreen ? 16 : 18,
    minHeight: isSmallScreen ? 110 : 120,
    width: '100%',
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  textAreaContainerSmall: {
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 14,
    paddingBottom: 14,
    minHeight: 100,
  },
  textArea: {
    flex: 1,
    fontSize: isSmallScreen ? 15 : 16,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
    minHeight: isSmallScreen ? 80 : 90,
    padding: 0,
    margin: 0,
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    includeFontPadding: false,
  },
  textAreaSmall: {
    fontSize: 14,
    minHeight: 70,
  },
  resumeUploadContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    borderStyle: 'dashed',
    padding: isSmallScreen ? 32 : 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: isSmallScreen ? 8 : 12,
    minHeight: isSmallScreen ? 240 : 280,
    width: '100%',
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  resumeUploadContainerSmall: {
    padding: 28,
    minHeight: 220,
  },
  resumeUploaded: {
    alignItems: 'center',
    width: '100%',
  },
  resumeUploadEmpty: {
    alignItems: 'center',
    width: '100%',
  },
  resumeIconContainer: {
    width: isSmallScreen ? 88 : 100,
    height: isSmallScreen ? 88 : 100,
    borderRadius: isSmallScreen ? 44 : 50,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 20 : 24,
  },
  resumeText: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    marginBottom: isSmallScreen ? 8 : 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  resumeTextSmall: {
    fontSize: 16,
    marginBottom: 8,
  },
  resumeSubtext: {
    fontSize: isSmallScreen ? 13 : 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    fontWeight: '500',
  },
  resumeSubtextSmall: {
    fontSize: 12,
  },
  uploadHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: isSmallScreen ? 16 : 20,
    paddingHorizontal: isSmallScreen ? 12 : 16,
    paddingVertical: isSmallScreen ? 10 : 12,
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 10,
    maxWidth: '90%',
  },
  uploadHintText: {
    fontSize: isSmallScreen ? 11 : 12,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 8,
    fontWeight: '500',
    lineHeight: isSmallScreen ? 16 : 18,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: isSmallScreen ? 10 : 12,
    marginTop: isSmallScreen ? 32 : 40,
    marginBottom: isSmallScreen ? 24 : 32,
    width: '100%',
  },
  backButtonStyle: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    paddingVertical: isSmallScreen ? 16 : 18,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isSmallScreen ? 52 : 56,
    maxWidth: '100%',
    flexDirection: 'row',
    gap: 6,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonStyleSmall: {
    paddingVertical: 14,
    minHeight: 50,
  },
  backButtonText: {
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    letterSpacing: 0.8,
  },
  backButtonTextSmall: {
    fontSize: 14,
    letterSpacing: 0.5,
  },
  nextButton: {
    flex: 2,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: isSmallScreen ? 16 : 18,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isSmallScreen ? 52 : 56,
    maxWidth: '100%',
    gap: 8,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonSmall: {
    paddingVertical: 14,
    minHeight: 50,
    gap: 6,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  nextButtonTextSmall: {
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
