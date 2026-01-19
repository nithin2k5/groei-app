import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const quickReplies = [
  'How do I apply for a job?',
  'How does AI matching work?',
  'How to update my profile?',
  'View saved jobs',
];

const botResponses: { [key: string]: string } = {
  'hello': 'Hello! I\'m Chilli. How can I help you today?',
  'hi': 'Hi there! I\'m Chilli, here to help you with jobs, applications, and more. What would you like to know?',
  'help': 'I can help you with:\n• Finding and applying for jobs\n• Understanding AI matching\n• Managing your profile\n• Saved jobs and applications\n• General questions about GROEI\n\nWhat would you like to know?',
  'how do i apply for a job?': 'To apply for a job:\n1. Browse jobs from the Jobs section\n2. Click on a job you\'re interested in\n3. Review the job details\n4. Click "Apply Now" button\n5. Fill out the application form\n6. Submit your application\n\nYou can track your applications in the Applications section!',
  'how does ai matching work?': 'Our AI matching works by:\n1. Analyzing your uploaded resume\n2. Extracting your skills and experience\n3. Matching them with job requirements\n4. Calculating a match percentage\n5. Recommending the best opportunities\n\nThe higher the match percentage, the better the fit!',
  'how to update my profile?': 'To update your profile:\n1. Go to Dashboard\n2. Click on Settings\n3. Select "Edit Profile"\n4. Update your information\n5. Save changes\n\nYou can also manage your resume from Settings > Manage Resume.',
  'view saved jobs': 'To view your saved jobs:\n1. Go to Dashboard\n2. Click on "Saved Jobs" in the menu\n3. Browse your saved opportunities\n\nYou can also access it from the Jobs section.',
  'default': 'I understand you\'re asking about that. Let me help you:\n\n• For job applications, go to the Jobs section\n• For profile updates, check Settings\n• For help, visit Help Center\n• For support, use Contact Us\n\nIs there something specific I can help with?',
};

export default function ChatbotScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m GROEI Assistant. I can help you with jobs, applications, profile management, and more. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase().trim();

    for (const [key, response] of Object.entries(botResponses)) {
      if (lowerMessage.includes(key.toLowerCase())) {
        return response;
      }
    }

    if (lowerMessage.includes('apply') || lowerMessage.includes('application')) {
      return botResponses['how do i apply for a job?'];
    }
    if (lowerMessage.includes('match') || lowerMessage.includes('ai')) {
      return botResponses['how does ai matching work?'];
    }
    if (lowerMessage.includes('profile') || lowerMessage.includes('update')) {
      return botResponses['how to update my profile?'];
    }
    if (lowerMessage.includes('saved') || lowerMessage.includes('bookmark')) {
      return botResponses['view saved jobs'];
    }

    return botResponses['default'];
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(userMessage.text),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickReply = (reply: string) => {
    setInputText(reply);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.botAvatar}>
            <Ionicons name="chatbubbles" size={20} color={COLORS.PRIMARY} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Chilli</Text>
            <Text style={styles.headerSubtitle}>Online • Usually replies instantly</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={COLORS.TEXT_SECONDARY} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.sender === 'user' ? styles.userMessageWrapper : styles.botMessageWrapper,
              ]}
            >
              {message.sender === 'bot' && (
                <View style={styles.botAvatarSmall}>
                  <Ionicons name="chatbubbles" size={16} color={COLORS.PRIMARY} />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.sender === 'user' ? styles.userBubble : styles.botBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.sender === 'user' ? styles.userMessageText : styles.botMessageText,
                  ]}
                >
                  {message.text}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    message.sender === 'user' ? styles.userMessageTime : styles.botMessageTime,
                  ]}
                >
                  {formatTime(message.timestamp)}
                </Text>
              </View>
              {message.sender === 'user' && (
                <View style={styles.userAvatar}>
                  <Ionicons name="person" size={16} color={COLORS.TEXT_PRIMARY} />
                </View>
              )}
            </View>
          ))}
          {isTyping && (
            <View style={[styles.messageWrapper, styles.botMessageWrapper]}>
              <View style={styles.botAvatarSmall}>
                <Ionicons name="chatbubbles" size={16} color={COLORS.PRIMARY} />
              </View>
              <View style={[styles.messageBubble, styles.botBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {messages.length === 1 && (
          <View style={styles.quickRepliesContainer}>
            <Text style={styles.quickRepliesTitle}>Quick replies:</Text>
            <View style={styles.quickReplies}>
              {quickReplies.map((reply, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickReplyButton}
                  onPress={() => handleQuickReply(reply)}
                >
                  <Text style={styles.quickReplyText}>{reply}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? '#ffffff' : COLORS.TEXT_SECONDARY}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  botAvatar: {
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
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: isSmallScreen ? 16 : 24,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  botMessageWrapper: {
    justifyContent: 'flex-start',
  },
  botAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: COLORS.PRIMARY,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: COLORS.TEXT_PRIMARY,
  },
  botMessageText: {
    color: COLORS.TEXT_PRIMARY,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userMessageTime: {
    color: COLORS.TEXT_PRIMARY + 'CC',
    textAlign: 'right',
  },
  botMessageTime: {
    color: COLORS.TEXT_SECONDARY,
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.TEXT_SECONDARY,
  },
  quickRepliesContainer: {
    paddingHorizontal: isSmallScreen ? 16 : 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  quickRepliesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  quickReplies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickReplyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  quickReplyText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  inputContainer: {
    paddingHorizontal: isSmallScreen ? 16 : 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    padding: 0,
    maxHeight: 100,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.SECONDARY,
  },
});
