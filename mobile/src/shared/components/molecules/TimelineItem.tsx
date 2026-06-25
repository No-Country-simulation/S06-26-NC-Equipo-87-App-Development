import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../atoms/Typography';
import designTokens from '../../theme/designTokens.json';

interface TimelineItemProps {
  title: string;
  time: string;
  color: string;
  isLast?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  time,
  color,
  isLast = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.indicatorContainer}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        {!isLast && <View style={styles.line} />}
      </View>
      <View style={styles.content}>
        <Typography variant="body" color={designTokens.colors['text-primary']}>
          {title}
        </Typography>
      </View>
      <Typography variant="mono" color={designTokens.colors['text-secondary']} style={styles.time}>
        {time}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 48,
  },
  indicatorContainer: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  line: {
    width: 1.5,
    backgroundColor: '#E0DDD4',
    position: 'absolute',
    top: 14,
    bottom: 0,
  },
  content: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 16,
    paddingBottom: 16,
  },
  time: {
    fontSize: 12,
  },
});
