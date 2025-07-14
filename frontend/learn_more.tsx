import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  useColorScheme as _useColorScheme,
  Animated,
  Dimensions,
  Easing,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';

// Enhanced type definitions - Added chart-bar for Competitive Analysis
type IconName = 'earth' | 'lightbulb-on' | 'account-group' | 'chart-timeline-variant' | 
               'shield-check' | 'recycle' | 'leaf' | 'heart' | 'target' | 'rocket-launch' | 'account' | 'chart-bar';

interface MissionCard {
  icon: IconName;
  title: string;
  description: string;
  anim: Animated.Value;
  scaleAnim: Animated.Value;
  glowAnim: Animated.Value;
  shimmerAnim: Animated.Value;
  delay: number;
  color: [string, string, ...string[]];
  id: string;
}

interface TimelineItem {
  year: string;
  title: string;
  description: string;
  anim: Animated.Value;
  slideAnim: Animated.Value;
  delay: number;
  id: string;
}

interface ImpactMetric {
  value: string;
  label: string;
  icon: IconName;
  color: [string, string];
  anim: Animated.Value;
  pulseAnim: Animated.Value;
  countAnim: Animated.Value;
  shimmerAnim: Animated.Value;
}

// Enhanced responsive system
const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// Comprehensive breakpoint system
const breakpoints = {
  xs: 0,
  sm: 380,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536
};

const getDeviceType = () => {
  if (width < breakpoints.sm) return 'xs';
  if (width < breakpoints.md) return 'sm';
  if (width < breakpoints.lg) return 'md';
  if (width < breakpoints.xl) return 'lg';
  if (width < breakpoints.xxl) return 'xl';
  return 'xxl';
};

const deviceType = getDeviceType();

// IMPROVED responsive dimensions with better mobile card sizing
const getResponsiveDimensions = () => {
  const baseSpacing = {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 28
  }[deviceType];

  const baseFontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 18,
    xxl: 20
  }[deviceType];

  return {
    containerPadding: baseSpacing,
    cardPadding: baseSpacing + 4,
    sectionSpacing: baseSpacing * 2,
    titleSize: baseFontSize + 16,
    subtitleSize: baseFontSize + 2,
    bodySize: baseFontSize,
    captionSize: baseFontSize - 2,
    iconSize: baseSpacing + 16,
    buttonHeight: baseSpacing * 3,
    // IMPROVED card sizing for mobile
    cardMinHeight: (() => {
      if (deviceType === 'xs') return baseSpacing * 8;
      if (deviceType === 'sm') return baseSpacing * 9;
      return baseSpacing * 10;
    })(),
    cardWidth: (() => {
      // Much better mobile card sizing
      if (deviceType === 'xs') return width - (baseSpacing * 2); // Full width minus padding
      if (deviceType === 'sm') return width - (baseSpacing * 2); // Full width minus padding
      if (deviceType === 'md') return (width - (baseSpacing * 3)) / 2; // Two columns
      return Math.min((width - (baseSpacing * 4)) / 2, 350); // Max width for larger screens
    })(),
    metricWidth: (() => {
      // Better metric card sizing for mobile
      if (deviceType === 'xs') return (width - (baseSpacing * 4)) / 2; // Two columns with proper spacing
      if (deviceType === 'sm') return (width - (baseSpacing * 4)) / 2; // Two columns with proper spacing
      if (deviceType === 'md') return (width - (baseSpacing * 6)) / 4; // Four columns
      return (width - (baseSpacing * 8)) / 4; // Four columns with more spacing
    })(),
    animationDuration: deviceType === 'xs' ? 600 : 800,
    staggerDelay: deviceType === 'xs' ? 50 : 100,
  };
};

// Custom hook for enhanced color scheme management
const useColorScheme = () => {
  const colorScheme = _useColorScheme();
  const [theme, setTheme] = useState(colorScheme || 'light');
  
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);
  
  return { theme, toggleTheme };
};

// Enhanced animation system WITHOUT spinning features
const useAnimations = () => {
  const dimensions = getResponsiveDimensions();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerTranslateY = useRef(new Animated.Value(-50)).current;
  const contentTranslateY = useRef(new Animated.Value(30)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Enhanced parallax effects with multiple layers
  const backgroundTranslateY = scrollY.interpolate({
    inputRange: [0, 400],
    outputRange: [0, -200],
    extrapolate: 'clamp'
  });

  const midgroundTranslateY = scrollY.interpolate({
    inputRange: [0, 400],
    outputRange: [0, -100],
    extrapolate: 'clamp'
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.7],
    extrapolate: 'clamp'
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.95],
    extrapolate: 'clamp'
  });

  // Enhanced floating animations (NO rotation)
  const floatingAnim1 = useRef(new Animated.Value(0)).current;
  const floatingAnim2 = useRef(new Animated.Value(0)).current;
  const floatingAnim3 = useRef(new Animated.Value(0)).current;
  
  // Shimmer effect only
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Multiple floating patterns with different timings
    const floating1 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim1, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim1, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const floating2 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim2, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim2, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const floating3 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim3, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim3, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Shimmer effect
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    floating1.start();
    floating2.start();
    floating3.start();
    shimmer.start();

    return () => {
      floating1.stop();
      floating2.stop();
      floating3.stop();
      shimmer.stop();
    };
  }, [floatingAnim1, floatingAnim2, floatingAnim3, shimmerAnim]);

  const startAnimations = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: dimensions.animationDuration + 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: dimensions.animationDuration + 100,
        delay: 200,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: dimensions.animationDuration + 100,
        delay: 400,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, scaleAnim, headerTranslateY, contentTranslateY, dimensions.animationDuration]);

  const resetAnimations = useCallback(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    headerTranslateY.setValue(-50);
    contentTranslateY.setValue(30);
    scrollY.setValue(0);
  }, [fadeAnim, scaleAnim, headerTranslateY, contentTranslateY, scrollY]);

  return {
    fadeAnim,
    scaleAnim,
    headerTranslateY,
    contentTranslateY,
    scrollY,
    backgroundTranslateY,
    midgroundTranslateY,
    headerOpacity,
    headerScale,
    floatingAnim1,
    floatingAnim2,
    floatingAnim3,
    shimmerAnim,
    startAnimations,
    resetAnimations
  };
};

export default function LearnMoreScreen() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const { theme, toggleTheme } = useColorScheme();
  const isDark = theme === 'dark';
  const dimensions = getResponsiveDimensions();
  const params = useLocalSearchParams();
  const isGuestSession = params.guest === 'true';
  
  const {
    fadeAnim,
    scaleAnim,
    headerTranslateY,
    contentTranslateY,
    scrollY,
    backgroundTranslateY,
    midgroundTranslateY,
    headerOpacity,
    headerScale,
    floatingAnim1,
    floatingAnim2,
    floatingAnim3,
    shimmerAnim,
    startAnimations,
    resetAnimations
  } = useAnimations();

  // Enhanced impact metrics WITHOUT rotation
  const impactMetrics = useMemo<ImpactMetric[]>(() => [
    {
      value: '50%',
      label: 'Waste Reduction Goal',
      icon: 'recycle',
      color: ['#00C9FF', '#92FE9D'],
      anim: new Animated.Value(0),
      pulseAnim: new Animated.Value(1),
      countAnim: new Animated.Value(0),
      shimmerAnim: new Animated.Value(0)
    },
    {
      value: '96+%',
      label: 'AI Classification Accuracy',
      icon: 'target',
      color: ['#667eea', '#764ba2'],
      anim: new Animated.Value(0),
      pulseAnim: new Animated.Value(1),
      countAnim: new Animated.Value(0),
      shimmerAnim: new Animated.Value(0)
    },
    {
      value: '50+',
      label: 'Cities Worldwide',
      icon: 'earth',
      color: ['#f093fb', '#f5576c'],
      anim: new Animated.Value(0),
      pulseAnim: new Animated.Value(1),
      countAnim: new Animated.Value(0),
      shimmerAnim: new Animated.Value(0)
    },
    {
      value: '2030',
      label: 'Zero Waste Vision',
      icon: 'leaf',
      color: ['#4facfe', '#00f2fe'],
      anim: new Animated.Value(0),
      pulseAnim: new Animated.Value(1),
      countAnim: new Animated.Value(0),
      shimmerAnim: new Animated.Value(0)
    }
  ], []);

  // Enhanced mission cards WITHOUT rotation
  const missionCards = useMemo<MissionCard[]>(() => [
    {
      id: 'environmental-impact',
      icon: 'earth',
      title: 'Environmental Impact',
      description: 'Our mission is to reduce global waste by 50% through intelligent recycling solutions and community engagement.',
      anim: new Animated.Value(0),
      scaleAnim: new Animated.Value(1),
      glowAnim: new Animated.Value(0),
      shimmerAnim: new Animated.Value(0),
      delay: 200,
      color: ['#00C9FF', '#92FE9D']
    },
    {
      id: 'innovation-first',
      icon: 'lightbulb-on',
      title: 'Innovation First',
      description: 'We leverage cutting-edge AI and machine learning to revolutionize how the world approaches waste management.',
      anim: new Animated.Value(0),
      scaleAnim: new Animated.Value(1),
      glowAnim: new Animated.Value(0),
      shimmerAnim: new Animated.Value(0),
      delay: 300,
      color: ['#667eea', '#764ba2']
    },
    {
      id: 'community-driven',
      icon: 'account-group',
      title: 'Community Driven',
      description: 'Building a global community of eco-warriors who are passionate about creating a sustainable future for generations.',
      anim: new Animated.Value(0),
      scaleAnim: new Animated.Value(1),
      glowAnim: new Animated.Value(0),
      shimmerAnim: new Animated.Value(0),
      delay: 400,
      color: ['#f093fb', '#f5576c']
    },
    {
      id: 'measurable-results',
      icon: 'chart-timeline-variant',
      title: 'Measurable Results',
      description: 'Every action is tracked and verified, providing transparent impact metrics and blockchain-certified achievements.',
      anim: new Animated.Value(0),
      scaleAnim: new Animated.Value(1),
      glowAnim: new Animated.Value(0),
      shimmerAnim: new Animated.Value(0),
      delay: 500,
      color: ['#4facfe', '#00f2fe']
    }
  ], []);

  // Enhanced timeline WITHOUT rotation
  const timelineItems = useMemo<TimelineItem[]>(() => [
    {
      id: 'launch-2024',
      year: '2024',
      title: 'RecyclAI Launch',
      description: 'Launched our AI-powered waste classification system with 99% accuracy.',
      anim: new Animated.Value(0),
      slideAnim: new Animated.Value(0),
      delay: 600
    },
    {
      id: 'expansion-2025',
      year: '2025',
      title: 'Global Expansion',
      description: 'Expanding to 50+ cities worldwide with localized recycling solutions.',
      anim: new Animated.Value(0),
      slideAnim: new Animated.Value(0),
      delay: 700
    },
    {
      id: 'carbon-neutral-2026',
      year: '2026',
      title: 'Carbon Neutral',
      description: 'Achieving carbon neutrality across all operations and partner networks.',
      anim: new Animated.Value(0),
      slideAnim: new Animated.Value(0),
      delay: 800
    },
    {
      id: 'zero-waste-2030',
      year: '2030',
      title: 'Zero Waste Vision',
      description: 'Our ultimate goal: helping communities achieve zero waste to landfill.',
      anim: new Animated.Value(0),
      slideAnim: new Animated.Value(0),
      delay: 900
    }
  ], []);

  // Enhanced web optimizations
  useEffect(() => {
    if (isWeb && typeof window !== 'undefined') {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.getElementsByTagName('head')[0].appendChild(meta);

      const themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      themeColorMeta.content = isDark ? '#0f0f23' : '#ffffff';
      document.getElementsByTagName('head')[0].appendChild(themeColorMeta);

      document.documentElement.style.scrollBehavior = 'smooth';
      document.documentElement.style.overscrollBehavior = 'none';

      const fontLink = document.createElement('link');
      fontLink.rel = 'preload';
      fontLink.as = 'font';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap';
      document.head.appendChild(fontLink);

      document.body.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
      document.body.style.fontOpticalSizing = 'auto';
      document.body.style.fontFeatureSettings = '"cv02", "cv03", "cv04", "cv11"';
      document.body.style.textRendering = 'optimizeLegibility';

      if (width < breakpoints.md) {
        document.addEventListener('touchstart', () => {}, { passive: true });
      }

      return () => {
        try {
          document.getElementsByTagName('head')[0].removeChild(meta);
          document.getElementsByTagName('head')[0].removeChild(themeColorMeta);
          document.head.removeChild(fontLink);
        } catch (e) {
          // Ignore cleanup errors
        }
      };
    }
  }, [isDark, width]);

  // Enhanced focus effect WITHOUT rotation animations
  useFocusEffect(
    useCallback(() => {
      resetAnimations();
      
      // Reset all animations
      missionCards.forEach(card => {
        card.anim.setValue(0);
        card.scaleAnim.setValue(1);
        card.glowAnim.setValue(0);
        card.shimmerAnim.setValue(0);
      });
      timelineItems.forEach(item => {
        item.anim.setValue(0);
        item.slideAnim.setValue(0);
      });
      impactMetrics.forEach(metric => {
        metric.anim.setValue(0);
        metric.pulseAnim.setValue(1);
        metric.countAnim.setValue(0);
        metric.shimmerAnim.setValue(0);
      });

      const timeout = setTimeout(() => {
        setIsReady(true);
        startAnimations();

        // Enhanced staggered animations for mission cards WITHOUT rotation
        missionCards.forEach((card) => {
          Animated.timing(card.anim, {
            toValue: 1,
            duration: dimensions.animationDuration,
            delay: card.delay,
            easing: Easing.out(Easing.back(1.1)),
            useNativeDriver: true,
          }).start();

          // Enhanced pulse animation with glow effect
          const pulseCard = () => {
            Animated.parallel([
              Animated.sequence([
                Animated.timing(card.scaleAnim, {
                  toValue: 1.05,
                  duration: 1000,
                  easing: Easing.inOut(Easing.ease),
                  useNativeDriver: true,
                }),
                Animated.timing(card.scaleAnim, {
                  toValue: 1,
                  duration: 1000,
                  easing: Easing.inOut(Easing.ease),
                  useNativeDriver: true,
                })
              ]),
              Animated.sequence([
                Animated.timing(card.glowAnim, {
                  toValue: 1,
                  duration: 1000,
                  easing: Easing.inOut(Easing.ease),
                  useNativeDriver: true,
                }),
                Animated.timing(card.glowAnim, {
                  toValue: 0,
                  duration: 1000,
                  easing: Easing.inOut(Easing.ease),
                  useNativeDriver: true,
                })
              ])
            ]).start(() => {
              setTimeout(pulseCard, 3000 + Math.random() * 2000);
            });
          };
          setTimeout(pulseCard, card.delay + 1000);
        });

        // Enhanced timeline animations WITHOUT rotation
        timelineItems.forEach((item, index) => {
          Animated.parallel([
            Animated.timing(item.anim, {
              toValue: 1,
              duration: dimensions.animationDuration - 100,
              delay: item.delay,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(item.slideAnim, {
              toValue: 1,
              duration: dimensions.animationDuration,
              delay: item.delay + 100,
              easing: Easing.out(Easing.back(1.1)),
              useNativeDriver: true,
            })
          ]).start();
        });

        // Enhanced impact metrics WITHOUT rotation
        impactMetrics.forEach((metric, index) => {
          Animated.parallel([
            Animated.timing(metric.anim, {
              toValue: 1,
              duration: dimensions.animationDuration - 200,
              delay: 1000 + (index * dimensions.staggerDelay),
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(metric.countAnim, {
              toValue: 1,
              duration: 2000,
              delay: 1200 + (index * dimensions.staggerDelay),
              easing: Easing.out(Easing.ease),
              useNativeDriver: false,
            })
          ]).start();

          // Start pulse animation for metrics
          const pulseMetric = () => {
            Animated.sequence([
              Animated.timing(metric.pulseAnim, {
                toValue: 1.1,
                duration: 800,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(metric.pulseAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              })
            ]).start(() => {
              setTimeout(pulseMetric, 4000 + Math.random() * 3000);
            });
          };
          setTimeout(pulseMetric, 1500 + (index * 200));
        });

      }, 100);

      return () => {
        clearTimeout(timeout);
        fadeAnim.stopAnimation();
        scaleAnim.stopAnimation();
        headerTranslateY.stopAnimation();
        contentTranslateY.stopAnimation();
        missionCards.forEach(card => {
          card.anim.stopAnimation();
          card.scaleAnim.stopAnimation();
          card.glowAnim.stopAnimation();
          card.shimmerAnim.stopAnimation();
        });
        timelineItems.forEach(item => {
          item.anim.stopAnimation();
          item.slideAnim.stopAnimation();
        });
        impactMetrics.forEach(metric => {
          metric.anim.stopAnimation();
          metric.pulseAnim.stopAnimation();
          metric.countAnim.stopAnimation();
          metric.shimmerAnim.stopAnimation();
        });
      };
    }, [missionCards, timelineItems, impactMetrics, resetAnimations, startAnimations, dimensions])
  );

  // Enhanced navigation handlers
  const handleGetStarted = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(60);
    }
    router.push('/(tabs)/next_page');
  }, [router]);

  const handleGoBack = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: -50,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start(() => {
      router.push({ pathname: '/account', params: { guest: isGuestSession ? 'true' : 'false' } });
    });
  }, [fadeAnim, headerTranslateY, router, isGuestSession]);

  // NEW: Navigation handler for Competitive Analysis
  const handleCompetitiveAnalysis = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }
    router.push('/comp_analysis');
  }, [router]);

  // Enhanced card interaction handlers
  const handleCardPress = useCallback((card: MissionCard) => {
    Animated.sequence([
      Animated.timing(card.scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(card.scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 300,
        useNativeDriver: true,
      })
    ]).start();

    if (Platform.OS !== 'web') {
      Vibration.vibrate(30);
    }
  }, []);

  // Enhanced component renderers
  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.headerSection,
        {
          opacity: headerOpacity,
          transform: [
            { translateY: headerTranslateY },
            { scale: headerScale }
          ]
        }
      ]}
    >
      <Text style={[
        styles.pageTitle,
        isDark && styles.pageTitleDark,
        { 
          fontSize: dimensions.titleSize + 8,
          marginBottom: dimensions.containerPadding
        }
      ]}>
        Our Mission
      </Text>
      
      <Text style={[
        styles.pageSubtitle,
        isDark && styles.pageSubtitleDark,
        { 
          fontSize: dimensions.subtitleSize,
          paddingHorizontal: dimensions.containerPadding,
          lineHeight: dimensions.subtitleSize * 1.5
        }
      ]}>
        Building a sustainable future through intelligent waste management and community-driven environmental action.
      </Text>
    </Animated.View>
  );

  const renderImpactMetrics = () => (
    <View style={[styles.impactMetricsContainer, { marginBottom: dimensions.sectionSpacing }]}>
      <Text style={[
        styles.sectionTitle,
        isDark && styles.sectionTitleDark,
        { 
          fontSize: dimensions.titleSize,
          marginBottom: dimensions.containerPadding + 4
        }
      ]}>
        Our Impact
      </Text>
      
      <View style={[
        styles.metricsGrid,
        { gap: dimensions.containerPadding / 2 }
      ]}>
        {impactMetrics.map((metric, index) => (
          <Animated.View
            key={`metric-${index}`}
            style={[
              styles.metricCard,
              isDark && styles.metricCardDark,
              {
                width: dimensions.metricWidth,
                padding: dimensions.cardPadding - 4,
                minHeight: dimensions.cardMinHeight,
                opacity: metric.anim,
                transform: [
                  { 
                    translateY: metric.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0]
                    }) 
                  },
                  { 
                    scale: metric.pulseAnim
                  }
                ]
              }
            ]}
          >
            <LinearGradient
              colors={metric.color}
              style={[
                styles.metricIconContainer,
                { 
                  width: dimensions.iconSize,
                  height: dimensions.iconSize,
                  borderRadius: dimensions.iconSize / 2,
                  marginBottom: dimensions.containerPadding / 2
                }
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons
                name={metric.icon}
                size={dimensions.iconSize - 16}
                color="#fff"
              />
            </LinearGradient>
            
            <Animated.Text style={[
              styles.metricValue,
              isDark && styles.metricValueDark,
              { 
                fontSize: dimensions.titleSize - 4,
                opacity: metric.countAnim
              }
            ]}>
              {metric.value}
            </Animated.Text>
            
            <Text style={[
              styles.metricLabel,
              isDark && styles.metricLabelDark,
              { 
                fontSize: dimensions.captionSize,
                lineHeight: dimensions.captionSize * 1.3
              }
            ]}>
              {metric.label}
            </Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );

  const renderMissionStatement = () => (
    <Animated.View
      style={[
        styles.missionSection,
        {
          marginBottom: dimensions.sectionSpacing,
          opacity: fadeAnim,
          transform: [{ translateY: contentTranslateY }]
        }
      ]}
    >
      <View style={[
        styles.missionCard,
        isDark && styles.missionCardDark,
        { 
          padding: dimensions.cardPadding,
          marginHorizontal: dimensions.containerPadding / 2
        }
      ]}>
        <LinearGradient
          colors={['#00C9FF', '#92FE9D']}
          style={[
            styles.missionIconContainer,
            { 
              width: dimensions.iconSize + 20,
              height: dimensions.iconSize + 20,
              borderRadius: (dimensions.iconSize + 20) / 2,
              marginBottom: dimensions.containerPadding
            }
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons
            name="heart"
            size={dimensions.iconSize}
            color="#fff"
          />
        </LinearGradient>
        
        <Text style={[
          styles.missionTitle,
          isDark && styles.missionTitleDark,
          { 
            fontSize: dimensions.titleSize,
            marginBottom: dimensions.containerPadding
          }
        ]}>
          Why We Exist
        </Text>
        
        <Text style={[
          styles.missionText,
          isDark && styles.missionTextDark,
          { 
            fontSize: dimensions.bodySize,
            lineHeight: dimensions.bodySize * 1.5
          }
        ]}>
          Every year, billions of tons of waste end up in landfills and oceans, devastating our planet's ecosystems. We believe technology can change this narrative. RecyclAI was born from a simple yet powerful vision: to make recycling so intelligent, accessible, and rewarding that it becomes second nature for everyone.
        </Text>
      </View>
    </Animated.View>
  );

  const renderDeveloperSection = () => (
    <Animated.View
      style={[
        styles.missionSection,
        {
          marginBottom: dimensions.sectionSpacing,
          opacity: fadeAnim,
          transform: [{ translateY: contentTranslateY }]
        }
      ]}
    >
      <View style={[
        styles.missionCard,
        isDark && styles.missionCardDark,
        { 
          padding: dimensions.cardPadding,
          marginHorizontal: dimensions.containerPadding / 2
        }
      ]}>
        <LinearGradient
          colors={["#FFD700", "#FFA500"]}
          style={[
            styles.missionIconContainer,
            { 
              width: dimensions.iconSize + 20,
              height: dimensions.iconSize + 20,
              borderRadius: (dimensions.iconSize + 20) / 2,
              marginBottom: dimensions.containerPadding
            }
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons
            name="account"
            size={dimensions.iconSize}
            color="#fff"
          />
        </LinearGradient>
        
        <Text style={[
          styles.missionTitle,
          isDark && styles.missionTitleDark,
          { 
            fontSize: dimensions.titleSize,
            marginBottom: dimensions.containerPadding
          }
        ]}>
          About the Developer
        </Text>
        
        <Text style={[
          styles.missionText,
          isDark && styles.missionTextDark,
          { 
            fontSize: dimensions.bodySize,
            lineHeight: dimensions.bodySize * 1.5,
            marginBottom: dimensions.containerPadding
          }
        ]}>
          Click here to learn more about the developer of this app, Aarav Rao.
        </Text>
        
        <TouchableOpacity 
          onPress={() => router.push("../developer")}
          style={[
            styles.linkButton,
            { 
              paddingVertical: dimensions.containerPadding / 2,
              paddingHorizontal: dimensions.containerPadding
            }
          ]}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.linkText,
            isDark && styles.linkTextDark,
            { fontSize: dimensions.bodySize }
          ]}>
            Learn More
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // NEW: Competitive Analysis Section
  const renderCompetitiveAnalysisSection = () => (
    <Animated.View
      style={[
        styles.missionSection,
        {
          marginBottom: dimensions.sectionSpacing,
          opacity: fadeAnim,
          transform: [{ translateY: contentTranslateY }]
        }
      ]}
    >
      <View style={[
        styles.missionCard,
        isDark && styles.missionCardDark,
        { 
          padding: dimensions.cardPadding,
          marginHorizontal: dimensions.containerPadding / 2
        }
      ]}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={[
            styles.missionIconContainer,
            { 
              width: dimensions.iconSize + 20,
              height: dimensions.iconSize + 20,
              borderRadius: (dimensions.iconSize + 20) / 2,
              marginBottom: dimensions.containerPadding
            }
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons
            name="chart-bar"
            size={dimensions.iconSize}
            color="#fff"
          />
        </LinearGradient>
        
        <Text style={[
          styles.missionTitle,
          isDark && styles.missionTitleDark,
          { 
            fontSize: dimensions.titleSize,
            marginBottom: dimensions.containerPadding
          }
        ]}>
          Competitive Analysis
        </Text>
        
        <Text style={[
          styles.missionText,
          isDark && styles.missionTextDark,
          { 
            fontSize: dimensions.bodySize,
            lineHeight: dimensions.bodySize * 1.5,
            marginBottom: dimensions.containerPadding
          }
        ]}>
          Explore detailed comparisons of RecyclAI with other waste management solutions and discover how our AI-powered approach stands out in the market.
        </Text>
        
        <TouchableOpacity 
          onPress={handleCompetitiveAnalysis}
          style={[
            styles.linkButton,
            { 
              paddingVertical: dimensions.containerPadding / 2,
              paddingHorizontal: dimensions.containerPadding
            }
          ]}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.linkText,
            isDark && styles.linkTextDark,
            { fontSize: dimensions.bodySize }
          ]}>
            View Analysis
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderValueCards = () => (
    <View style={[styles.missionCardsContainer, { marginBottom: dimensions.sectionSpacing }]}>
      <Text style={[
        styles.sectionTitle,
        isDark && styles.sectionTitleDark,
        { 
          fontSize: dimensions.titleSize,
          marginBottom: dimensions.containerPadding + 4
        }
      ]}>
        Our Core Values
      </Text>
      
      <View style={[
        styles.cardsGrid,
        { 
          gap: dimensions.containerPadding,
          justifyContent: deviceType === 'xs' || deviceType === 'sm' ? 'center' : 'space-between',
          alignItems: 'center'
        }
      ]}>
        {missionCards.map((card) => (
          <TouchableOpacity
            key={card.id}
            onPress={() => handleCardPress(card)}
            activeOpacity={0.9}
            style={{
              width: dimensions.cardWidth,
              alignSelf: 'center'
            }}
          >
            <Animated.View
              style={[
                styles.valueCard,
                isDark && styles.valueCardDark,
                {
                  width: '100%',
                  padding: dimensions.cardPadding,
                  minHeight: dimensions.cardMinHeight + 40,
                  opacity: card.anim,
                  transform: [
                    { 
                      translateY: card.anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0]
                      }) 
                    },
                    { 
                      scale: card.scaleAnim
                    }
                  ]
                }
              ]}
            >
              {/* Glow effect overlay */}
              <Animated.View
                style={[
                  styles.glowOverlay,
                  {
                    opacity: card.glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.4]
                    })
                  }
                ]}
              />
              
              <LinearGradient
                colors={card.color}
                style={[
                  styles.valueIconContainer,
                  { 
                    width: dimensions.iconSize + 16,
                    height: dimensions.iconSize + 16,
                    borderRadius: (dimensions.iconSize + 16) / 2,
                    marginBottom: dimensions.containerPadding
                  }
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons
                  name={card.icon}
                  size={dimensions.iconSize}
                  color="#fff"
                />
              </LinearGradient>
              
              <Text style={[
                styles.valueTitle,
                isDark && styles.valueTitleDark,
                { 
                  fontSize: dimensions.titleSize - 2,
                  marginBottom: dimensions.containerPadding / 2
                }
              ]}>
                {card.title}
              </Text>
              
              <Text style={[
                styles.valueDescription,
                isDark && styles.valueDescriptionDark,
                { 
                  fontSize: dimensions.bodySize,
                  lineHeight: dimensions.bodySize * 1.4
                }
              ]}>
                {card.description}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTimeline = () => (
    <View style={[styles.timelineContainer, { marginBottom: dimensions.sectionSpacing }]}>
      <Text style={[
        styles.sectionTitle,
        isDark && styles.sectionTitleDark,
        { 
          fontSize: dimensions.titleSize,
          marginBottom: dimensions.containerPadding + 4
        }
      ]}>
        Our Journey
      </Text>
      
      <View style={styles.timelineContent}>
        {timelineItems.map((item, index) => (
          <Animated.View
            key={item.id}
            style={[
              styles.timelineItem,
              isDark && styles.timelineItemDark,
              {
                marginBottom: dimensions.containerPadding,
                marginHorizontal: dimensions.containerPadding / 2,
                opacity: item.anim,
                transform: [
                  { 
                    translateX: item.slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [index % 2 === 0 ? -100 : 100, 0]
                    }) 
                  }
                ]
              }
            ]}
          >
            <View style={[
              styles.timelineYear,
              isDark && styles.timelineYearDark,
              { 
                paddingVertical: dimensions.containerPadding / 2,
                paddingHorizontal: dimensions.containerPadding
              }
            ]}>
              <Text style={[
                styles.yearText,
                isDark && styles.yearTextDark,
                { fontSize: dimensions.titleSize - 4 }
              ]}>
                {item.year}
              </Text>
            </View>
            
            <View style={[
              styles.timelineContentInner,
              { padding: dimensions.cardPadding - 8 }
            ]}>
              <Text style={[
                styles.timelineTitle,
                isDark && styles.timelineTitleDark,
                { 
                  fontSize: dimensions.titleSize - 2,
                  marginBottom: dimensions.containerPadding / 2
                }
              ]}>
                {item.title}
              </Text>
              
              <Text style={[
                styles.timelineDescription,
                isDark && styles.timelineDescriptionDark,
                { 
                  fontSize: dimensions.bodySize,
                  lineHeight: dimensions.bodySize * 1.4
                }
              ]}>
                {item.description}
              </Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  );

  const renderActionButton = () => (
    <Animated.View
      style={[
        styles.actionSection,
        {
          marginTop: dimensions.containerPadding,
          marginBottom: dimensions.containerPadding,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.actionButton,
          isDark && styles.actionButtonDark,
          { borderRadius: dimensions.buttonHeight / 2 }
        ]}
        onPress={handleGetStarted}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={[
            styles.actionButtonGradient,
            { 
              paddingVertical: dimensions.containerPadding,
              paddingHorizontal: dimensions.containerPadding * 2
            }
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[
            styles.actionButtonText,
            { 
              fontSize: dimensions.titleSize - 2,
              marginRight: dimensions.containerPadding / 2
            }
          ]}>
            Get Started
          </Text>
          <MaterialCommunityIcons
            name="rocket-launch"
            size={dimensions.iconSize - 8}
            color="#fff"
          />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  // Enhanced floating decorative elements WITHOUT rotation
  const floatingTranslateY1 = floatingAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15]
  });

  const floatingTranslateY2 = floatingAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20]
  });

  const floatingTranslateY3 = floatingAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12]
  });

  return (
    <View style={[
      styles.container,
      isDark && styles.containerDark
    ]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Enhanced Navigation Controls */}
      <Animated.View
        style={[
          styles.backButtonContainer,
          {
            top: Platform.OS === 'ios' ? 60 : 40,
            left: dimensions.containerPadding,
            opacity: fadeAnim,
            transform: [{ translateY: headerTranslateY }]
          }
        ]}
      >
        <TouchableOpacity 
          style={[
            styles.backButton,
            isDark && styles.backButtonDark,
            { 
              width: dimensions.buttonHeight,
              height: dimensions.buttonHeight,
              borderRadius: dimensions.buttonHeight / 2
            }
          ]} 
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={isDark ? "#ffffff" : "#1a202c"} 
          />
        </TouchableOpacity>
      </Animated.View>
      
      <TouchableOpacity 
        style={[
          styles.themeToggle,
          isDark && styles.themeToggleDark,
          {
            top: Platform.OS === 'ios' ? 60 : 40,
            right: dimensions.containerPadding,
            width: dimensions.buttonHeight,
            height: dimensions.buttonHeight,
            borderRadius: dimensions.buttonHeight / 2
          }
        ]} 
        onPress={toggleTheme}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={isDark ? "sunny" : "moon"} 
          size={24} 
          color={isDark ? "#FFD700" : "#667eea"} 
        />
      </TouchableOpacity>
      
      {/* Enhanced Background with multiple parallax layers */}
      <Animated.View 
        style={[
          styles.backgroundContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: backgroundTranslateY }]
          }
        ]}
      >
        <LinearGradient
          colors={isDark 
            ? ['#0f0f23', '#1a1a2e', '#16213e', '#0f3460'] 
            : ['#ffffff', '#f8fafc', '#e6f7ff', '#f0f8f5']}
          style={styles.gradientOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Enhanced floating decorative elements WITHOUT rotation */}
        <Animated.View 
          style={[
            styles.decorativeCircle,
            styles.circle1,
            isDark && styles.decorativeCircleDark,
            { 
              transform: [
                { translateY: floatingTranslateY1 }
              ] 
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.decorativeCircle,
            styles.circle2,
            isDark && styles.decorativeCircleDark,
            { 
              transform: [
                { translateY: floatingTranslateY2 },
                { translateY: midgroundTranslateY }
              ] 
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.decorativeCircle,
            styles.circle3,
            isDark && styles.decorativeCircleDark,
            { 
              transform: [
                { translateY: floatingTranslateY3 },
                { scale: floatingAnim1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1]
                })}
              ] 
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.decorativeCircle,
            styles.circle4,
            isDark && styles.decorativeCircleDark,
            { 
              transform: [
                { translateY: floatingTranslateY1 },
                { translateX: floatingAnim2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 10]
                })}
              ] 
            }
          ]} 
        />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: Platform.OS === 'ios' ? 120 : 100,
            paddingBottom: dimensions.sectionSpacing,
            paddingHorizontal: dimensions.containerPadding
          }
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {renderHeader()}
        {renderImpactMetrics()}
        {renderMissionStatement()}
        {renderDeveloperSection()}
        {renderCompetitiveAnalysisSection()}
        {renderValueCards()}
        {renderTimeline()}
        {renderActionButton()}
      </ScrollView>
    </View>
  );
}

// Enhanced StyleSheet with comprehensive responsive design
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#0f0f23',
  },
  
  // Navigation styles
  backButtonContainer: {
    position: 'absolute',
    zIndex: 1000,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    backdropFilter: 'blur(10px)',
  },
  backButtonDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  themeToggle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
    backdropFilter: 'blur(10px)',
  },
  themeToggleDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Background styles
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  gradientOverlay: {
    flex: 1,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(102, 126, 234, 0.06)',
  },
  decorativeCircleDark: {
    backgroundColor: 'rgba(102, 126, 234, 0.12)',
  },
  circle1: {
    width: deviceType === 'xs' ? 150 : 200,
    height: deviceType === 'xs' ? 150 : 200,
    top: -75,
    right: -75,
  },
  circle2: {
    width: deviceType === 'xs' ? 120 : 150,
    height: deviceType === 'xs' ? 120 : 150,
    top: height * 0.3,
    left: -60,
  },
  circle3: {
    width: deviceType === 'xs' ? 80 : 100,
    height: deviceType === 'xs' ? 80 : 100,
    bottom: height * 0.3,
    right: -40,
  },
  circle4: {
    width: deviceType === 'xs' ? 100 : 120,
    height: deviceType === 'xs' ? 100 : 120,
    bottom: -60,
    left: -60,
  },

  // Scroll styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Header styles
  headerSection: {
    alignItems: 'center',
    marginBottom: getResponsiveDimensions().sectionSpacing,
  },
  pageTitle: {
    fontWeight: '800',
    color: '#1a202c',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  pageTitleDark: {
    color: '#ffffff',
  },
  pageSubtitle: {
    color: '#4a5568',
    textAlign: 'center',
    fontWeight: '400',
  },
  pageSubtitleDark: {
    color: '#a0aec0',
  },

  // Impact metrics styles
  impactMetricsContainer: {
    alignItems: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  metricCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    backdropFilter: 'blur(10px)',
  },
  metricCardDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricValue: {
    fontWeight: '800',
    color: '#1a202c',
    textAlign: 'center',
  },
  metricValueDark: {
    color: '#ffffff',
  },
  metricLabel: {
    color: '#4a5568',
    textAlign: 'center',
    fontWeight: '500',
  },
  metricLabelDark: {
    color: '#a0aec0',
  },

  // Mission section styles
  missionSection: {
    alignItems: 'center',
  },
  missionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    backdropFilter: 'blur(10px)',
  },
  missionCardDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  missionIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  missionTitle: {
    fontWeight: '700',
    color: '#1a202c',
    textAlign: 'center',
  },
  missionTitleDark: {
    color: '#ffffff',
  },
  missionText: {
    color: '#4a5568',
    textAlign: 'center',
    fontWeight: '400',
  },
  missionTextDark: {
    color: '#a0aec0',
  },
  linkButton: {
    borderRadius: 12,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  linkText: {
    color: '#667eea',
    fontWeight: '600',
    textAlign: 'center',
  },
  linkTextDark: {
    color: '#9f7aea',
  },

  // Section title styles
  sectionTitle: {
    fontWeight: '700',
    color: '#1a202c',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  sectionTitleDark: {
    color: '#ffffff',
  },

  // Value cards styles - IMPROVED FOR MOBILE
  missionCardsContainer: {
    alignItems: 'center',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    ...(deviceType === 'xs' || deviceType === 'sm' ? {
      justifyContent: 'center',
      alignItems: 'center',
    } : {
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    })
  },
  valueCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 9,
    backdropFilter: 'blur(10px)',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  valueCardDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    borderRadius: 24,
  },
  valueIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueTitle: {
    fontWeight: '600',
    color: '#1a202c',
    textAlign: 'center',
  },
  valueTitleDark: {
    color: '#ffffff',
  },
  valueDescription: {
    color: '#4a5568',
    textAlign: 'center',
    fontWeight: '400',
  },
  valueDescriptionDark: {
    color: '#a0aec0',
  },

  // Timeline styles
  timelineContainer: {
    alignItems: 'center',
  },
  timelineContent: {
    width: '100%',
  },
  timelineItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    backdropFilter: 'blur(10px)',
  },
  timelineItemDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  timelineYear: {
    backgroundColor: '#667eea',
  },
  timelineYearDark: {
    backgroundColor: '#764ba2',
  },
  yearText: {
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  yearTextDark: {
    color: '#ffffff',
  },
  timelineContentInner: {
    // Additional styles for timeline content
  },
  timelineTitle: {
    fontWeight: '600',
    color: '#1a202c',
  },
  timelineTitleDark: {
    color: '#ffffff',
  },
  timelineDescription: {
    color: '#4a5568',
    fontWeight: '400',
  },
  timelineDescriptionDark: {
    color: '#a0aec0',
  },

  // Action button styles
  actionSection: {
    alignItems: 'center',
  },
  actionButton: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  actionButtonDark: {
    shadowColor: '#667eea',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
});


