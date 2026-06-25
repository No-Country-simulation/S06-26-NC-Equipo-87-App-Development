import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Typography } from '../atoms/Typography';
import designTokens from '../../theme/designTokens.json';

export interface TabRoute {
  key: string;
  title: string;
  badgeCount?: number;
  badgeBgColor?: string;
  badgeTextColor?: string;
}

interface TabViewProps {
  navigationState: {
    index: number;
    routes: TabRoute[];
  };
  onIndexChange: (index: number) => void;
  renderScene: (scene: { route: TabRoute }) => React.ReactNode;
}

export const TabView: React.FC<TabViewProps> = ({
  navigationState,
  onIndexChange,
  renderScene,
}) => {
  const { index, routes } = navigationState;
  const activeRoute = routes[index];

  const [scrollX, setScrollX] = React.useState(0);
  const [contentWidth, setContentWidth] = React.useState(0);
  const [scrollViewWidth, setScrollViewWidth] = React.useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollX(event.nativeEvent.contentOffset.x);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarScroll}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={(width) => setContentWidth(width)}
          onLayout={(event) => setScrollViewWidth(event.nativeEvent.layout.width)}
        >
          {routes.map((route, idx) => {
            const isActive = idx === index;
            const hasBadge = route.badgeCount !== undefined && route.badgeCount >= 0;
            
            const badgeBgColor = route.badgeBgColor || designTokens.colors['text-secondary'];
            const badgeTextColor = route.badgeTextColor || '#FFFFFF';

            return (
              <TouchableOpacity
                key={route.key}
                activeOpacity={0.7}
                onPress={() => onIndexChange(idx)}
                style={styles.tabItem}
              >
                <View style={styles.tabContent}>
                  <Typography
                    variant="label"
                    color={isActive ? designTokens.colors['text-primary'] : designTokens.colors['text-secondary']}
                    style={styles.tabLabel}
                  >
                    {route.title}
                  </Typography>
                  
                  {hasBadge && (
                    <View style={[styles.badgeContainer, { backgroundColor: badgeBgColor }]}>
                      <Typography
                        variant="caption"
                        color={badgeTextColor}
                        style={styles.badgeText}
                      >
                        {route.badgeCount}
                      </Typography>
                    </View>
                  )}
                </View>

                {/* Active Indicator Line */}
                <View
                  style={[
                    styles.indicator,
                    isActive ? styles.activeIndicator : styles.inactiveIndicator,
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {scrollX > 2 && (
          <View style={styles.leftGradientOverlay} pointerEvents="none">
            <Svg height="100%" width="100%">
              <Defs>
                <LinearGradient id="gradLeft" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={designTokens.colors['surface-card']} stopOpacity="1" />
                  <Stop offset="1" stopColor={designTokens.colors['surface-card']} stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#gradLeft)" />
            </Svg>
          </View>
        )}
        {contentWidth > scrollViewWidth && scrollX < contentWidth - scrollViewWidth - 2 && (
          <View style={styles.rightGradientOverlay} pointerEvents="none">
            <Svg height="100%" width="100%">
              <Defs>
                <LinearGradient id="gradRight" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={designTokens.colors['surface-card']} stopOpacity="0" />
                  <Stop offset="1" stopColor={designTokens.colors['surface-card']} stopOpacity="1" />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#gradRight)" />
            </Svg>
          </View>
        )}
      </View>

      <View style={styles.sceneContainer}>
        {renderScene({ route: activeRoute })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0DDD4',
    height: 48,
  },
  tabBarScroll: {
    flexDirection: 'row',
    alignItems: 'stretch',
    flexGrow: 1,
  },
  tabItem: {
    flexGrow: 1,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  tabLabel: {
    textAlign: 'center',
  },
  badgeContainer: {
    marginLeft: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  indicator: {
    height: 3,
    width: '100%',
  },
  activeIndicator: {
    backgroundColor: designTokens.colors['text-primary'],
  },
  inactiveIndicator: {
    backgroundColor: 'transparent',
  },
  sceneContainer: {
    flex: 1,
  },
  leftGradientOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 24,
  },
  rightGradientOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 24,
  },
});
