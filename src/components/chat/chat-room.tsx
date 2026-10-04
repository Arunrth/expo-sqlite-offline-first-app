import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ChatConnectionStatus, ChatMessage } from '@/types/chat';

type ChatRoomProps = {
  room: string;
  status: ChatConnectionStatus;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onLeave: () => void;
};

function formatTime(ts: number) {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getAvatarColor(name: string = 'U') {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function ChatRoom({ room, status, messages, onSend, onLeave }: ChatRoomProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');

  const handleSend = () => {
    if (!draft.trim() || status !== 'connected') return;
    onSend(draft.trim());
    setDraft('');
  };

  const statusColor =
    status === 'connected'
      ? theme.statusConnected
      : status === 'connecting'
      ? theme.statusConnecting
      : theme.statusError;

  // Bottom inset offset for native tab bar navigation
  const tabOffset = Platform.OS === 'ios' ? 64 : 72;
  const bottomInsetPadding = Math.max(insets.bottom, 8) + tabOffset;
  const topInsetPadding = Math.max(insets.top, 16) + Spacing.one;

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: topInsetPadding,
              backgroundColor: theme.card,
              borderBottomColor: theme.border,
            },
          ]}>
          <View style={styles.headerLeft}>
            <View style={[styles.roomIconBadge, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText style={styles.roomIconText} themeColor="primary">
                #
              </ThemedText>
            </View>
            <View style={styles.headerTextGroup}>
              <ThemedText type="smallBold" style={styles.roomTitle}>
                {room}
              </ThemedText>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <ThemedText type="small" themeColor="textSecondary" style={styles.statusText}>
                  {status}
                </ThemedText>
              </View>
            </View>
          </View>

          <Pressable
            onPress={onLeave}
            hitSlop={Spacing.two}
            style={({ pressed }) => [
              styles.leaveButton,
              { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
            ]}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Leave
            </ThemedText>
          </Pressable>
        </View>

        {/* Message List */}
        <FlatList
          data={messages}
          inverted
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            if (item.system) {
              return (
                <View style={styles.systemMessageContainer}>
                  <View style={[styles.systemBadge, { backgroundColor: theme.backgroundElement }]}>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.systemText}>
                      {item.text}
                    </ThemedText>
                  </View>
                </View>
              );
            }

            if (item.mine) {
              return (
                <View style={[styles.bubbleWrapper, styles.bubbleMineWrapper]}>
                  <View
                    style={[
                      styles.bubble,
                      styles.bubbleMine,
                      { backgroundColor: theme.bubbleMine },
                    ]}>
                    <ThemedText style={{ color: theme.bubbleMineText, fontSize: 15, lineHeight: 21 }}>
                      {item.text}
                    </ThemedText>
                    {item.ts ? (
                      <ThemedText
                        style={[
                          styles.timestampText,
                          { color: 'rgba(255,255,255,0.7)', alignSelf: 'flex-end' },
                        ]}>
                        {formatTime(item.ts)}
                      </ThemedText>
                    ) : null}
                  </View>
                </View>
              );
            }

            const avatarBg = getAvatarColor(item.username);
            const initial = (item.username || '?')[0].toUpperCase();

            return (
              <View style={[styles.bubbleWrapper, styles.bubbleOtherWrapper]}>
                <View style={[styles.avatarCircle, { backgroundColor: avatarBg }]}>
                  <ThemedText style={styles.avatarText}>{initial}</ThemedText>
                </View>
                <View style={styles.otherContent}>
                  {item.username ? (
                    <ThemedText type="smallBold" themeColor="textSecondary" style={styles.senderName}>
                      {item.username}
                    </ThemedText>
                  ) : null}
                  <View
                    style={[
                      styles.bubble,
                      styles.bubbleOther,
                      { backgroundColor: theme.bubbleOther },
                    ]}>
                    <ThemedText style={{ color: theme.bubbleOtherText, fontSize: 15, lineHeight: 21 }}>
                      {item.text}
                    </ThemedText>
                    {item.ts ? (
                      <ThemedText
                        style={[
                          styles.timestampText,
                          { color: theme.textSecondary, alignSelf: 'flex-start' },
                        ]}>
                        {formatTime(item.ts)}
                      </ThemedText>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          }}
        />

        {/* Input Bar */}
        <View
          style={[
            styles.composerContainer,
            {
              paddingBottom: bottomInsetPadding,
              backgroundColor: theme.card,
              borderTopColor: theme.border,
            },
          ]}>
          <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundElement }]}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Type a message..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text }]}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline={false}
            />
            <Pressable
              onPress={handleSend}
              disabled={status !== 'connected' || !draft.trim()}
              style={({ pressed }) => [
                styles.sendButton,
                {
                  backgroundColor:
                    status === 'connected' && draft.trim() ? theme.primary : theme.backgroundSelected,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <ThemedText
                style={[
                  styles.sendButtonText,
                  {
                    color:
                      status === 'connected' && draft.trim() ? theme.primaryText : theme.textSecondary,
                  },
                ]}>
                ↑
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  roomIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomIconText: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerTextGroup: {
    gap: 2,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  leaveButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: 16,
  },
  list: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: Spacing.one,
  },
  systemBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 14,
  },
  systemText: {
    fontSize: 12,
    textAlign: 'center',
  },
  bubbleWrapper: {
    marginVertical: 2,
  },
  bubbleMineWrapper: {
    alignSelf: 'flex-end',
    maxWidth: '82%',
  },
  bubbleOtherWrapper: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    maxWidth: '85%',
    gap: Spacing.two,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  otherContent: {
    flex: 1,
    gap: 2,
  },
  senderName: {
    fontSize: 12,
    marginLeft: 4,
  },
  bubble: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: 4,
  },
  bubbleMine: {
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  timestampText: {
    fontSize: 10,
    marginTop: 2,
  },
  composerContainer: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.OS === 'ios' ? Spacing.one : 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.two,
    maxHeight: 100,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.two,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
});
