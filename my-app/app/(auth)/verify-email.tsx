import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { authApi } from '@/services/api';

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = Array.isArray(params.token) ? params.token[0] : params.token;
    if (token) {
      verifyEmail(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyEmail = async (token: string) => {
    setLoading(true);
    try {
      await authApi.verifyEmail(token);
      setVerified(true);
    } catch (err: any) {
      setError(err.message || 'Failed to verify email. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const email = Array.isArray(params.email) ? params.email[0] : params.email;
    if (!email) {
      Alert.alert('Error', 'Email not found');
      return;
    }

    try {
      const response = await authApi.resendVerification(email);
      if (response.verificationToken && __DEV__) {
        Alert.alert(
          'Development Mode',
          `Email service not configured.\n\nUse this token to verify:\n${response.verificationToken}\n\nOr configure SMTP in backend/.env`,
          [
            {
              text: 'Verify with Token',
              onPress: () => {
                verifyEmail(response.verificationToken);
              },
            },
            { text: 'OK' },
          ]
        );
      } else {
        Alert.alert('Success', response.message || 'Verification email sent! Please check your inbox.');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('not configured')) {
        Alert.alert(
          'Email Not Configured',
          'Email service is not configured. Please configure SMTP settings in backend/.env file.\n\nSee backend/EMAIL_SETUP.md for instructions.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', err.message || 'Failed to resend verification email');
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Verifying your email...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {verified ? (
          <>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={80} color={COLORS.SUCCESS} />
            </View>
            <Text style={styles.title}>Email Verified!</Text>
            <Text style={styles.subtitle}>
              Your email has been successfully verified. You can now log in to your account.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace('/(auth)/auth')}
            >
              <Text style={styles.buttonText}>Go to Login</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.iconContainer}>
              <Ionicons name="alert-circle" size={80} color={COLORS.ERROR} />
            </View>
            <Text style={styles.title}>Verification Failed</Text>
            <Text style={styles.subtitle}>
              {error || 'The verification link is invalid or has expired.'}
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={handleResend}
            >
              <Text style={styles.buttonText}>Resend Verification Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.replace('/(auth)/auth')}
            >
              <Text style={styles.secondaryButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
});
