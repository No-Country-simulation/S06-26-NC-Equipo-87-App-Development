import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { TimelineItem } from '../molecules/TimelineItem';
import designTokens from '../../theme/designTokens.json';

interface TimelineEvent {
  id: string;
  title: string;
  time: string;
  color: string;
}

interface SupervisorTicketTimelineCardProps {
  timeline: TimelineEvent[];
}

export const SupervisorTicketTimelineCard: React.FC<SupervisorTicketTimelineCardProps> = ({
  timeline,
}) => {
  return (
    <Card style={styles.card}>
      <Typography variant="micro" color={designTokens.colors['text-tertiary']} style={styles.sectionTitle}>
        HISTORIAL
      </Typography>
      <View style={styles.timelineContainer}>
        {timeline.map((event, index) => {
          const isLastEvent = index === timeline.length - 1;
          return (
            <TimelineItem
              key={event.id}
              title={event.title}
              time={event.time}
              color={event.color}
              isLast={isLastEvent}
            />
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: parseInt(designTokens.spacing['4']),
    marginBottom: parseInt(designTokens.spacing['4']),
    borderRadius: parseInt(designTokens.rounded.md),
  },
  sectionTitle: {
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  timelineContainer: {
    marginTop: 8,
  },
});
