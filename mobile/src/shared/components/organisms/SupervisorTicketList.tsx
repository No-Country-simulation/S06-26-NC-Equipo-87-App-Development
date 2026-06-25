import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SupervisorTicketCard, SupervisorTicket } from '../molecules/SupervisorTicketCard';
import { Typography } from '../atoms/Typography';
import { ClipboardCheckIcon } from '../atoms/Icons/ClipboardCheckIcon';
import designTokens from '../../theme/designTokens.json';

interface SupervisorTicketListProps {
  tickets: SupervisorTicket[];
  onTicketPress?: (ticketId: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  emptyLabel?: string;
}

export const SupervisorTicketList: React.FC<SupervisorTicketListProps> = ({
  tickets,
  onTicketPress,
  refreshing = false,
  onRefresh,
}) => {
  const renderTicketItem = useCallback(
    ({ item }: { item: SupervisorTicket }) => (
      <View style={styles.cardWrapper}>
        <SupervisorTicketCard
          ticket={item}
          onPress={() => onTicketPress?.(item.id)}
        />
      </View>
    ),
    [onTicketPress],
  );

  const keyExtractor = useCallback((item: SupervisorTicket) => item.id, []);

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <ClipboardCheckIcon color="#C8C6BC" style={styles.emptyIcon} />
      <Typography
        variant="heading"
        color={designTokens.colors['text-primary']}
        style={styles.emptyTitle}
      >
        Todo bajo control
      </Typography>
      <Typography
        variant="body"
        color={designTokens.colors['text-secondary']}
        style={styles.emptySubtitle}
      >
        No hay tickets activos asignados a tu zona.
      </Typography>
    </View>
  );

  const listIsEmpty = tickets.length === 0;

  return (
    <FlatList
      data={tickets}
      renderItem={renderTicketItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={[
        styles.listContent,
        listIsEmpty && styles.listContentEmpty,
      ]}
      ListEmptyComponent={renderEmptyState}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: parseInt(designTokens.spacing['4']),
    paddingBottom: parseInt(designTokens.spacing['6']),
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80, // offset for visual balance
  },
  cardWrapper: {
    marginBottom: parseInt(designTokens.spacing['3']),
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: designTokens.colors['text-secondary'],
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
});
