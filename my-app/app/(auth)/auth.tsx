import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { authApi } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const inputLayouts = useRef<{ [key: string]: number }>({});

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (loading) return;

    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const response = await authApi.login(email, password);

        if (response.token) {
          await AsyncStorage.setItem('authToken', response.token);
          signIn();
          router.replace('/dashboard');
        }
      } else {
        const response = await authApi.register({
          name,
          email,
          password,
        });

        const alertMessage = response.warning
          ? `${response.message}\n\n${response.warning}`
          : response.message || 'Please check your email for the 6-digit verification code.';

        Alert.alert(
          'Verification Required',
          alertMessage,
          [
            {
              text: 'OK',
              onPress: () => {
                router.push({
                  pathname: '/(auth)/otp-verification',
                  params: { email },
                });
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          <View style={styles.content}>
            <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
              <View style={[styles.logoContainer, isSmallScreen && styles.logoContainerSmall]}>
                <Ionicons name="briefcase" size={isSmallScreen ? 24 : 28} color={COLORS.PRIMARY} />
              </View>
              <Text style={[styles.logoText, isSmallScreen && styles.logoTextSmall]}>GROEI</Text>
            </View>

            <View style={[styles.authContainer, isSmallScreen && styles.authContainerSmall]}>
              <View style={styles.toggleContainer}>
                <Pressable
                  style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
                  onPress={() => setIsLogin(true)}
                  disabled={loading}
                >
                  <Text style={[styles.toggleText, isLogin && styles.toggleTextActive, isSmallScreen && styles.toggleTextSmall]}>
                    LOGIN
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
                  onPress={() => setIsLogin(false)}
                  disabled={loading}
                >
                  <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive, isSmallScreen && styles.toggleTextSmall]}>
                    SIGN UP
                  </Text>
                </Pressable>
              </View>

              <View style={styles.formContainer}>
                <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
                  {isLogin ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
                </Text>
                <Text style={[styles.subtitle, isSmallScreen && styles.subtitleSmall]}>
                  {isLogin
                    ? 'Sign in to continue to your account'
                    : 'Join thousands of professionals using GROEI'}
                </Text>

                {!isLogin && (
                  <View
                    style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}
                    onLayout={(e) => {
                      inputLayouts.current['name'] = e.nativeEvent.layout.y;
                    }}
                  >
                    <Ionicons name="person-outline" size={isSmallScreen ? 18 : 20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                    <TextInput
                      ref={nameInputRef}
                      style={[styles.input, isSmallScreen && styles.inputSmall]}
                      placeholder="Full Name"
                      placeholderTextColor="#a0aec0"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      editable={!loading}
                      onFocus={() => {
                        setTimeout(() => {
                          const y = inputLayouts.current['name'];
                          if (y !== undefined && scrollViewRef.current) {
                            scrollViewRef.current.scrollTo({ y: Math.max(0, y - 150), animated: true });
                          }
                        }, 100);
                      }}
                    />
                  </View>
                )}

                <View
                  style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}
                  onLayout={(e) => {
                    inputLayouts.current['email'] = e.nativeEvent.layout.y;
                  }}
                >
                  <Ionicons name="mail-outline" size={isSmallScreen ? 18 : 20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                  <TextInput
                    ref={emailInputRef}
                    style={[styles.input, isSmallScreen && styles.inputSmall]}
                    placeholder="Email Address"
                    placeholderTextColor="#a0aec0"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    onFocus={() => {
                      setTimeout(() => {
                        const y = inputLayouts.current['email'];
                        if (y !== undefined && scrollViewRef.current) {
                          scrollViewRef.current.scrollTo({ y: Math.max(0, y - 150), animated: true });
                        }
                      }, 100);
                    }}
                  />
                </View>

                <View
                  style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}
                  onLayout={(e) => {
                    inputLayouts.current['password'] = e.nativeEvent.layout.y;
                  }}
                >
                  <Ionicons name="lock-closed-outline" size={isSmallScreen ? 18 : 20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                  <TextInput
                    ref={passwordInputRef}
                    style={[styles.input, isSmallScreen && styles.inputSmall]}
                    placeholder="Password"
                    placeholderTextColor="#a0aec0"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!loading}
                    onFocus={() => {
                      setTimeout(() => {
                        const y = inputLayouts.current['password'];
                        if (y !== undefined && scrollViewRef.current) {
                          scrollViewRef.current.scrollTo({ y: Math.max(0, y - 150), animated: true });
                        }
                      }, 100);
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                    disabled={loading}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={isSmallScreen ? 18 : 20}
                      color={COLORS.TEXT_SECONDARY}
                    />
                  </TouchableOpacity>
                </View>

                {isLogin && (
                  <TouchableOpacity
                    style={styles.forgotPassword}
                    disabled={loading}
                    onPress={() => router.push('/(auth)/forgot-password')}
                  >
                    <Text style={[styles.forgotPasswordText, isSmallScreen && styles.forgotPasswordTextSmall]}>FORGOT PASSWORD?</Text>
                  </TouchableOpacity>
                )}

                <Pressable
                  style={[styles.submitButton, loading && styles.submitButtonDisabled, isSmallScreen && styles.submitButtonSmall]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.TEXT_PRIMARY} size="small" />
                  ) : (
                    <>
                      <Text style={[styles.submitButtonText, isSmallScreen && styles.submitButtonTextSmall]}>
                        {isLogin ? 'LOGIN' : 'CREATE ACCOUNT'}
                      </Text>
                      <Ionicons name="arrow-forward" size={isSmallScreen ? 18 : 20} color="#ffffff" />
                    </>
                  )}
                </Pressable>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={[styles.dividerText, isSmallScreen && styles.dividerTextSmall]}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialContainer}>
                  <Pressable style={[styles.socialButton, loading && styles.socialButtonDisabled, isSmallScreen && styles.socialButtonSmall]} disabled={loading}>
                    <Ionicons name="logo-google" size={isSmallScreen ? 20 : 24} color={COLORS.PRIMARY} />
                    <Text style={[styles.socialButtonText, isSmallScreen && styles.socialButtonTextSmall]}>CONTINUE WITH GOOGLE</Text>
                  </Pressable>
                </View>

                <View style={styles.footer}>
                  <Text style={[styles.footerText, isSmallScreen && styles.footerTextSmall]}>
                    {isLogin ? "DON'T HAVE AN ACCOUNT? " : 'ALREADY HAVE AN ACCOUNT? '}
                  </Text>
                  <TouchableOpacity onPress={() => setIsLogin(!isLogin)} disabled={loading}>
                    <Text style={[styles.footerLink, isSmallScreen && styles.footerLinkSmall]}>
                      {isLogin ? 'SIGN UP' : 'LOGIN'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
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
    backgroundColor: COLORS.BACKGROUND,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerSmall: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoContainerSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.PRIMARY,
    letterSpacing: 2,
  },
  logoTextSmall: {
    fontSize: 24,
    letterSpacing: 1.5,
  },
  authContainer: {
    flex: 1,
    paddingHorizontal: isSmallScreen ? 16 : 24,
    justifyContent: 'center',
  },
  authContainerSmall: {
    paddingHorizontal: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1,
  },
  toggleTextSmall: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  toggleTextActive: {
    color: COLORS.TEXT_PRIMARY,
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.PRIMARY,
    marginBottom: 6,
    letterSpacing: 1,
    textAlign: 'center',
  },
  titleSmall: {
    fontSize: 24,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  subtitleSmall: {
    fontSize: 13,
    marginBottom: 20,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
    height: 52,
    minHeight: 52,
    width: '100%',
  },
  inputContainerSmall: {
    height: 48,
    minHeight: 48,
    paddingLeft: 14,
    paddingRight: 14,
    marginBottom: 10,
  },
  inputIcon: {
    marginRight: 12,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: 15,
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
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    letterSpacing: 0.5,
  },
  forgotPasswordTextSmall: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
  submitButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 52,
  },
  submitButtonSmall: {
    paddingVertical: 14,
    minHeight: 48,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginRight: 8,
    letterSpacing: 1,
  },
  submitButtonTextSmall: {
    fontSize: 15,
    marginRight: 6,
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    borderColor: COLORS.BORDER,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: '700',
    color: '#718096',
    letterSpacing: 1,
  },
  dividerTextSmall: {
    fontSize: 11,
    marginHorizontal: 12,
    letterSpacing: 0.5,
  },
  socialContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  socialButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    minHeight: 48,
  },
  socialButtonSmall: {
    paddingVertical: 10,
    gap: 6,
    minHeight: 44,
  },
  socialButtonDisabled: {
    opacity: 0.5,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    letterSpacing: 0.5,
  },
  socialButtonTextSmall: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  footerTextSmall: {
    fontSize: 12,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    letterSpacing: 0.5,
  },
  footerLinkSmall: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
});
