import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type JoinChatFormProps = {
  onJoin: (url: string, room: string, username: string) => void;
};

export function JoinChatForm({ onJoin }: JoinChatFormProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [url, setUrl] = useState(Platform.OS === 'android' ? 'ws://10.0.2.2:8080' : 'ws://localhost:8080');
  const [room, setRoom] = useState('general');
  const [username, setUsername] = useState('');

  const canJoin = url.trim() && room.trim() && username.trim();

  const handlePreset = (presetUrl: string) => {
    setUrl(presetUrl);
  };

  const topInset = Math.max(insets.top, 24);
  const tabOffset = Platform.OS === 'ios' ? 70 : 80;
  const bottomInset = Math.max(insets.bottom, 16) + tabOffset;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: topInset + Spacing.four, paddingBottom: bottomInset },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          {/* Header Graphic/Icon */}
          <View style={styles.headerSection}>
            <View style={[styles.iconCircle, { backgroundColor: theme.primary + '18' }]}>
              <ThemedText style={styles.iconEmoji}>💬</ThemedText>
            </View>
            <ThemedText type="title" style={styles.title}>
              Join Chat
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
              Connect to a WebSocket room to start messaging in real-time
            </ThemedText>
          </View>

          {/* Form Card */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {/* Server URL Input */}
            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold" style={styles.label}>
                Server URL
              </ThemedText>
              <View style={[styles.inputBox, { backgroundColor: theme.backgroundElement }]}>
                <TextInput
                  value={url}
                  onChangeText={setUrl}
                  placeholder="ws://localhost:8080"
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  style={[styles.input, { color: theme.text }]}
                />
              </View>

              {/* Server Presets */}
              <View style={styles.presetContainer}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.presetLabel}>
                  Presets:
                </ThemedText>
                <Pressable
                  onPress={() => handlePreset('ws://localhost:8080')}
                  style={[styles.presetChip, { backgroundColor: theme.backgroundElement }]}>
                  <ThemedText type="small" themeColor="primary">iOS Local</ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => handlePreset('ws://10.0.2.2:8080')}
                  style={[styles.presetChip, { backgroundColor: theme.backgroundElement }]}>
                  <ThemedText type="small" themeColor="primary">Android Local</ThemedText>
                </Pressable>
              </View>
            </View>

            {/* Room Input */}
            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold" style={styles.label}>
                Room Name
              </ThemedText>
              <View style={[styles.inputBox, { backgroundColor: theme.backgroundElement }]}>
                <TextInput
                  value={room}
                  onChangeText={setRoom}
                  placeholder="e.g. general"
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.input, { color: theme.text }]}
                />
              </View>
            </View>

            {/* Username Input */}
            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold" style={styles.label}>
                Username
              </ThemedText>
              <View style={[styles.inputBox, { backgroundColor: theme.backgroundElement }]}>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your handle"
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.input, { color: theme.text }]}
                />
              </View>
            </View>

            {/* Submit Button */}
            <Pressable
              disabled={!canJoin}
              onPress={() => onJoin(url.trim(), room.trim(), username.trim())}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: canJoin ? theme.primary : theme.backgroundSelected,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <ThemedText
                style={{
                  color: canJoin ? theme.primaryText : theme.textSecondary,
                  fontSize: 16,
                  fontWeight: '700',
                }}>
                Join Room
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    alignItems: 'stretch',
    gap: Spacing.four,
  },
  headerSection: {
    alignItems: 'center',
    gap: Spacing.two,
    marginVertical: Spacing.two,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  iconEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 280,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    marginLeft: 2,
  },
  inputBox: {
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.OS === 'ios' ? Spacing.two : Spacing.one,
  },
  input: {
    fontSize: 16,
  },
  presetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.one,
    marginTop: 4,
  },
  presetLabel: {
    fontSize: 12,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: Spacing.three,
    marginTop: Spacing.two,
  },
});
