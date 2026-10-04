import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useJoinedRooms } from '@/hooks/use-joined-rooms';
import { useTheme } from '@/hooks/use-theme';
import type { JoinedRoom } from '@/utils/room-storage';

function formatRelativeTime(ts: number) {
  if (!ts) return '';
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { rooms, loading, deleteRoom, clearAll } = useJoinedRooms();

  const topInset = Math.max(insets.top, 16) + Spacing.two;
  const tabOffset = Platform.OS === 'ios' ? 70 : 80;
  const bottomInset = Math.max(insets.bottom, 16) + tabOffset;

  const handleOpenRoom = (roomItem: JoinedRoom) => {
    router.push({
      pathname: '/explore',
      params: {
        url: roomItem.url,
        room: roomItem.room,
        username: roomItem.username,
      },
    });
  };

  const handleJoinNew = () => {
    router.push('/explore');
  };

  return (
    <ThemedView style={styles.container}>
      {/* Top Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topInset,
            backgroundColor: theme.card,
            borderBottomColor: theme.border,
          },
        ]}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIconCircle, { backgroundColor: theme.primary + '18' }]}>
            <ThemedText style={styles.headerEmoji}>💬</ThemedText>
          </View>
          <View style={styles.headerTitleGroup}>
            <ThemedText type="subtitle" style={styles.headerTitle}>
              My Chat Rooms
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} joined
            </ThemedText>
          </View>
        </View>

        <Pressable
          onPress={handleJoinNew}
          style={({ pressed }) => [
            styles.joinNewButton,
            { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 },
          ]}>
          <ThemedText style={[styles.joinNewText, { color: theme.primaryText }]}>
            + Join
          </ThemedText>
        </Pressable>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : rooms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconBadge, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText style={styles.emptyEmoji}>💬</ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            No Joined Rooms Yet
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.emptySubtitle}>
            Join your first WebSocket chat room to start messaging in real-time.
          </ThemedText>

          <Pressable
            onPress={handleJoinNew}
            style={({ pressed }) => [
              styles.emptyButton,
              { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 },
            ]}>
            <ThemedText style={[styles.emptyButtonText, { color: theme.primaryText }]}>
              Join a Chat Room
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: bottomInset }]}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            rooms.length > 0 ? (
              <Pressable onPress={clearAll} style={styles.clearButton}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.clearText}>
                  Clear History
                </ThemedText>
              </Pressable>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleOpenRoom(item)}
              style={({ pressed }) => [
                styles.roomCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}>
              <View style={styles.cardMain}>
                <View style={[styles.roomBadge, { backgroundColor: theme.backgroundElement }]}>
                  <ThemedText style={styles.roomBadgeText} themeColor="primary">
                    #
                  </ThemedText>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.cardHeaderRow}>
                    <ThemedText type="smallBold" style={styles.roomName}>
                      {item.room}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.timeText}>
                      {formatRelativeTime(item.lastJoinedAt)}
                    </ThemedText>
                  </View>

                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={styles.serverText}>
                    {item.url}
                  </ThemedText>

                  <View style={styles.cardMetaRow}>
                    <View style={[styles.userChip, { backgroundColor: theme.backgroundElement }]}>
                      <ThemedText type="small" themeColor="textSecondary">
                        👤 @{item.username}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => handleOpenRoom(item)}
                  style={({ pressed }) => [
                    styles.openButton,
                    { backgroundColor: theme.primary + '15', opacity: pressed ? 0.7 : 1 },
                  ]}>
                  <ThemedText type="smallBold" themeColor="primary">
                    Open
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={() => deleteRoom(item.id)}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.deleteButton,
                    { opacity: pressed ? 0.5 : 1 },
                  ]}>
                  <ThemedText type="small" themeColor="textSecondary">
                    ✕
                  </ThemedText>
                </Pressable>
              </View>
            </Pressable>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEmoji: {
    fontSize: 22,
  },
  headerTitleGroup: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
  },
  joinNewButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two - 2,
    borderRadius: 20,
  },
  joinNewText: {
    fontSize: 14,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  emptyIconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    maxWidth: 280,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.two,
  },
  emptyButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 16,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  roomCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardMain: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
  roomBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomBadgeText: {
    fontSize: 20,
    fontWeight: '800',
  },
  cardDetails: {
    flex: 1,
    gap: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomName: {
    fontSize: 17,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
  },
  serverText: {
    fontSize: 13,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  userChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150,150,150,0.15)',
  },
  openButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 12,
  },
  deleteButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    marginTop: Spacing.two,
  },
  clearText: {
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
