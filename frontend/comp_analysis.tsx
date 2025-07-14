import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
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
  View,
  useColorScheme as _useColorScheme
} from 'react-native';

// Enhanced type definitions with advanced animation properties
interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  anim: Animated.Value;
  scaleAnim: Animated.Value;
  pulseAnim: Animated.Value;
  delay: number;
  color: [string, string];
}

interface ComparisonItem {
  feature: string;
  recyclai: boolean;
  others: boolean;
  anim: Animated.Value;
  slideAnim: Animated.Value;
  delay: number;
}

// Enhanced responsive system with better calculations
const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isPhone = width < 768; // Better phone detection

// Comprehensive breakpoint system optimized for phones
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

// Enhanced responsive dimensions with phone-first approach
const getResponsiveDimensions = () => {
  const baseSpacing = {
    xs: 10,
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
    // Layout dimensions - phone optimized
    containerPadding: baseSpacing,
    cardPadding: baseSpacing + 2,
    sectionSpacing: baseSpacing * 1.5,
    
    // Typography scale - phone optimized
    titleSize: isPhone ? baseFontSize + 8 : baseFontSize + 16,
    subtitleSize: baseFontSize + 2,
    bodySize: baseFontSize,
    captionSize: baseFontSize - 2,
    
    // Component sizes - smaller for phones
    iconSize: isPhone ? baseSpacing + 8 : baseSpacing + 16,
    buttonHeight: isPhone ? baseSpacing * 2.5 : baseSpacing * 3,
    smallButtonSize: isPhone ? 32 : 40, // New smaller button size
    
    // Grid calculations - phone optimized
    featureCardWidth: (() => {
      if (deviceType === 'xs' || deviceType === 'sm') return width - (baseSpacing * 2);
      if (deviceType === 'md') return (width - (baseSpacing * 3)) / 2;
      return (width - (baseSpacing * 4)) / 2;
    })(),
    
    // Animation values
    animationDuration: deviceType === 'xs' ? 500 : 600,
    staggerDelay: deviceType === 'xs' ? 40 : 80,
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

// Advanced animation system with sophisticated effects
const useAnimations = () => {
  const dimensions = getResponsiveDimensions();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerTranslateY = useRef(new Animated.Value(-50)).current;
  const contentTranslateY = useRef(new Animated.Value(30)).current;
  const buttonScaleAnim = useRef(new Animated.Value(0.9)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Advanced parallax effects with multiple layers
  const backgroundTranslateY = scrollY.interpolate({
    inputRange: [0, 400],
    outputRange: [0, -200],
    extrapolate: 'clamp'
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.8],
    extrapolate: 'clamp'
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.95],
    extrapolate: 'clamp'
  });

  // Advanced floating animations with multiple patterns
  const floatingAnim1 = useRef(new Animated.Value(0)).current;
  const floatingAnim2 = useRef(new Animated.Value(0)).current;
  const floatingAnim3 = useRef(new Animated.Value(0)).current;
  
  // Shimmer effect animation
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Multiple sophisticated floating patterns
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
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
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
        duration: dimensions.animationDuration + 200,
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
      }),
      Animated.spring(buttonScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, scaleAnim, headerTranslateY, contentTranslateY, buttonScaleAnim, dimensions.animationDuration]);

  const resetAnimations = useCallback(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    headerTranslateY.setValue(-50);
    contentTranslateY.setValue(30);
    buttonScaleAnim.setValue(0.9);
    scrollY.setValue(0);
  }, [fadeAnim, scaleAnim, headerTranslateY, contentTranslateY, buttonScaleAnim, scrollY]);

  return {
    fadeAnim,
    scaleAnim,
    headerTranslateY,
    contentTranslateY,
    buttonScaleAnim,
    scrollY,
    backgroundTranslateY,
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

export default function CompAnalysisScreen() {
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
    buttonScaleAnim,
    scrollY,
    backgroundTranslateY,
    headerOpacity,
    headerScale,
    floatingAnim1,
    floatingAnim2,
    floatingAnim3,
    shimmerAnim,
    startAnimations,
    resetAnimations
  } = useAnimations();

  // Enhanced features data with advanced animations (removed rotation)
  const features = useMemo<FeatureItem[]>(() => [
    {
      icon: 'camera',
      title: 'Photo-Based Sorting',
      description: 'Just snap a pic to classify your waste.',
      anim: new Animated.Value(0),
      scaleAnim: new Animated.Value(1),
      pulseAnim: new Animated.Value(0),
      delay: 200,
      color: ['#667eea', '#764ba2']
    },
    {
      icon: 'brain',
      title: 'AI-Powered',
      description: 'Uses deep learning for 5-way waste recognition.',
      anim: new Animated.Value(0),
      scaleAnim: new Animated.Value(1),
      pulseAnim: new Animated.Value(0),
      delay: 300,
      color: ['#00C9FF', '#92FE9D']
    },
    {
      icon: 'map-marker',
      title: 'StoreDropOff Guidance',
      description: 'The only app that guides users to store-based recycling for items like plastic bags.',
      anim: new Animated.Value(0),
      scaleAnim: new Animated.Value(1),
      pulseAnim: new Animated.Value(0),
      delay: 400,
      color: ['#f093fb', '#f5576c']
    },
    {
      icon: 'leaf',
      title: 'Organic & E-Waste Support',
      description: 'Goes beyond basic recycling.',
      anim: new Animated.Value(0),
      scaleAnim: new Animated.Value(1),
      pulseAnim: new Animated.Value(0),
      delay: 500,
      color: ['#4facfe', '#00f2fe']
    },
    {
      icon: 'cellphone-android',
      title: 'TFLite-Powered',
      description: 'Runs offline, optimized for low-end devices.',
      anim: new Animated.Value(0),
      scaleAnim: new Animated.Value(1),
      pulseAnim: new Animated.Value(0),
      delay: 600,
      color: ['#a8edea', '#fed6e3']
    }
  ], []);

  // Comparison data with animations
  const comparisons = useMemo<ComparisonItem[]>(() => [
    {
      feature: 'Photo-Based Sorting',
      recyclai: true,
      others: false,
      anim: new Animated.Value(0),
      slideAnim: new Animated.Value(0),
      delay: 700
    },
    {
      feature: '5-Class Classification',
      recyclai: true,
      others: false,
      anim: new Animated.Value(0),
      slideAnim: new Animated.Value(0),
      delay: 800
    },
    {
      feature: 'StoreDropOff Locations',
      recyclai: true,
      others: false,
      anim: new Animated.Value(0),
      slideAnim: new Animated.Value(0),
      delay: 900
    },
    {
      feature: 'AI + Offline Ready',
      recyclai: true,
      others: false,
      anim: new Animated.Value(0),
      slideAnim: new Animated.Value(0),
      delay: 1000
    },
    {
      feature: 'Works Globally',
      recyclai: true,
      others: false,
      anim: new Animated.Value(0),
      slideAnim: new Animated.Value(0),
      delay: 1100
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

  // Advanced focus effect with sophisticated animations (removed rotation)
  useFocusEffect(
    useCallback(() => {
      resetAnimations();
      
      // Reset all animations
      features.forEach(feature => {
        feature.anim.setValue(0);
        feature.scaleAnim.setValue(1);
        feature.pulseAnim.setValue(0);
      });
      comparisons.forEach(comparison => {
        comparison.anim.setValue(0);
        comparison.slideAnim.setValue(0);
      });

      const timeout = setTimeout(() => {
        setIsReady(true);
        startAnimations();

        // Advanced staggered animations for features
        features.forEach((feature) => {
          Animated.parallel([
            Animated.timing(feature.anim, {
              toValue: 1,
              duration: dimensions.animationDuration,
              delay: feature.delay,
              easing: Easing.out(Easing.back(1.1)),
              useNativeDriver: true,
            })
          ]).start();

          // Advanced pulse animation for features (no rotation)
          const pulseFeature = () => {
            Animated.sequence([
              Animated.timing(feature.scaleAnim, {
                toValue: 1.05,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(feature.scaleAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              })
            ]).start(() => {
              setTimeout(pulseFeature, 3000 + Math.random() * 2000);
            });
          };

          // Pulse glow effect
          const pulseGlow = () => {
            Animated.loop(
              Animated.sequence([
                Animated.timing(feature.pulseAnim, {
                  toValue: 1,
                  duration: 1500,
                  easing: Easing.inOut(Easing.ease),
                  useNativeDriver: true,
                }),
                Animated.timing(feature.pulseAnim, {
                  toValue: 0,
                  duration: 1500,
                  easing: Easing.inOut(Easing.ease),
                  useNativeDriver: true,
                })
              ])
            ).start();
          };

          setTimeout(pulseFeature, feature.delay + 1000);
          setTimeout(pulseGlow, feature.delay + 1500);
        });

        // Advanced animations for comparisons
        comparisons.forEach((comparison) => {
          Animated.parallel([
            Animated.timing(comparison.anim, {
              toValue: 1,
              duration: dimensions.animationDuration - 100,
              delay: comparison.delay,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(comparison.slideAnim, {
              toValue: 1,
              duration: dimensions.animationDuration,
              delay: comparison.delay + 100,
              easing: Easing.out(Easing.back(1.1)),
              useNativeDriver: true,
            })
          ]).start();
        });

      }, 100);

      return () => {
        clearTimeout(timeout);
        fadeAnim.stopAnimation();
        scaleAnim.stopAnimation();
        headerTranslateY.stopAnimation();
        contentTranslateY.stopAnimation();
        buttonScaleAnim.stopAnimation();
        features.forEach(feature => {
          feature.anim.stopAnimation();
          feature.scaleAnim.stopAnimation();
          feature.pulseAnim.stopAnimation();
        });
        comparisons.forEach(comparison => {
          comparison.anim.stopAnimation();
          comparison.slideAnim.stopAnimation();
        });
      };
    }, [features, comparisons, resetAnimations, startAnimations, dimensions])
  );

  // Enhanced navigation handlers
  const handleGoBack = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(60);
    }
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
      router.push({ pathname: '/account', params: { guest: 'true' } });
    });
  }, [fadeAnim, headerTranslateY, router]);

  const handleTryRecyclAI = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(60);
    }
    router.push('../next_page');
  }, [router]);

  const handleDownloadPDF = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(60);
    }
    // Open the Google Doc link
    if (isWeb) {
      window.open('https://docs.google.com/document/d/15-Y0uCplJTqlD288zARYCfjrAUOxUTbEpN0Zf2hTf_M/edit?tab=t.0', '_blank');
    }
  }, []);

  // Advanced feature card interaction with multiple effects (no rotation)
  const handleFeaturePress = useCallback((feature: FeatureItem) => {
    Animated.sequence([
      Animated.timing(feature.scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(feature.scaleAnim, {
        toValue: 1.05,
        friction: 8,
        tension: 300,
        useNativeDriver: true,
      }),
      Animated.spring(feature.scaleAnim, {
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

  // Enhanced component renderers with advanced animations
  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.headerSection,
        {
          marginBottom: dimensions.sectionSpacing,
          opacity: headerOpacity,
          transform: [
            { translateY: headerTranslateY },
            { scale: headerScale }
          ]
        }
      ]}
    >
      <Animated.View style={{
        transform: [{
          translateY: shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -5]
          })
        }]
      }}>
        <Text style={[
          styles.pageTitle,
          isDark && styles.pageTitleDark,
          { 
            fontSize: dimensions.titleSize + (isPhone ? 4 : 8),
            marginBottom: dimensions.containerPadding
          }
        ]}>
          Why RecyclAI Stands Out
        </Text>
      </Animated.View>
      
      <Text style={[
        styles.heroTitle,
        isDark && styles.heroTitleDark,
        { 
          fontSize: dimensions.titleSize + (isPhone ? 0 : 4),
          marginBottom: dimensions.containerPadding / 2,
          paddingHorizontal: dimensions.containerPadding
        }
      ]}>
        Built to Make Recycling Smarter — and Simpler.
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
        RecyclAI isn't just another recycling app. It's a visual-first, AI-powered tool that helps people make the right disposal decisions in seconds — including what to drop off at stores.
      </Text>
    </Animated.View>
  );

  const renderFeatures = () => (
    <View style={[styles.featuresContainer, { marginBottom: dimensions.sectionSpacing }]}>
      <Text style={[
        styles.sectionTitle,
        isDark && styles.sectionTitleDark,
        { 
          fontSize: dimensions.titleSize,
          marginBottom: dimensions.sectionSpacing / 2,
          paddingHorizontal: dimensions.containerPadding
        }
      ]}>
        Unique Features
      </Text>
      
      <View style={[
        styles.featuresGrid,
        { gap: dimensions.containerPadding }
      ]}>
        {features.map((feature, index) => (
          <TouchableOpacity
            key={`feature-${index}`}
            onPress={() => handleFeaturePress(feature)}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.featureCard,
                isDark && styles.featureCardDark,
                {
                  width: dimensions.featureCardWidth,
                  padding: dimensions.cardPadding,
                  opacity: feature.anim,
                  transform: [
                    { 
                      translateY: feature.anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0]
                      }) 
                    },
                    { 
                      scale: feature.scaleAnim
                    }
                  ]
                }
              ]}
            >
              {/* Removed rotation animation */}
              <LinearGradient
                colors={feature.color}
                style={[
                  styles.featureIconContainer,
                  {
                    width: dimensions.iconSize + (isPhone ? 4 : 8),
                    height: dimensions.iconSize + (isPhone ? 4 : 8),
                    borderRadius: (dimensions.iconSize + (isPhone ? 4 : 8)) / 2,
                    marginBottom: dimensions.containerPadding
                  }
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons
                  name={feature.icon}
                  size={dimensions.iconSize - (isPhone ? 4 : 8)}
                  color="#fff"
                />
              </LinearGradient>
              
              <Text style={[
                styles.featureTitle,
                isDark && styles.featureTitleDark,
                { 
                  fontSize: dimensions.subtitleSize,
                  marginBottom: dimensions.containerPadding / 2
                }
              ]}>
                {feature.title}
              </Text>
              
              <Text style={[
                styles.featureDescription,
                isDark && styles.featureDescriptionDark,
                { 
                  fontSize: dimensions.bodySize,
                  lineHeight: dimensions.bodySize * 1.4
                }
              ]}>
                {feature.description}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Improved comparison table for mobile
  const renderComparison = () => (
    <View style={[styles.comparisonContainer, { marginBottom: dimensions.sectionSpacing }]}>
      <Text style={[
        styles.sectionTitle,
        isDark && styles.sectionTitleDark,
        { 
          fontSize: dimensions.titleSize,
          marginBottom: dimensions.sectionSpacing / 2,
          paddingHorizontal: dimensions.containerPadding
        }
      ]}>
        Competitive Advantage
      </Text>
      
      {isPhone ? (
        // Mobile-optimized card layout
        <View style={[
          styles.comparisonMobileContainer,
          { 
            marginHorizontal: dimensions.containerPadding,
            gap: dimensions.containerPadding / 2
          }
        ]}>
          {comparisons.map((comparison, index) => (
            <Animated.View
              key={`comparison-${index}`}
              style={[
                styles.comparisonMobileCard,
                isDark && styles.comparisonMobileCardDark,
                {
                  padding: dimensions.cardPadding,
                  borderRadius: dimensions.containerPadding,
                  opacity: comparison.anim,
                  transform: [
                    { 
                      translateX: comparison.slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0]
                      }) 
                    }
                  ]
                }
              ]}
            >
              <View style={styles.comparisonMobileHeader}>
                <Text style={[
                  styles.comparisonMobileFeature,
                  isDark && styles.comparisonMobileFeatureDark,
                  { fontSize: dimensions.bodySize }
                ]}>
                  {comparison.feature}
                </Text>
              </View>
              
              <View style={styles.comparisonMobileRow}>
                <View style={styles.comparisonMobileItem}>
                  <Text style={[
                    styles.comparisonMobileLabel,
                    isDark && styles.comparisonMobileLabelDark,
                    { fontSize: dimensions.captionSize }
                  ]}>
                    RecyclAI
                  </Text>
                  <MaterialCommunityIcons
                    name={comparison.recyclai ? 'check-circle' : 'close-circle'}
                    size={dimensions.iconSize - 8}
                    color={comparison.recyclai ? '#4CAF50' : '#F44336'}
                  />
                </View>
                
                <View style={styles.comparisonMobileItem}>
                  <Text style={[
                    styles.comparisonMobileLabel,
                    isDark && styles.comparisonMobileLabelDark,
                    { fontSize: dimensions.captionSize }
                  ]}>
                    Others
                  </Text>
                  <MaterialCommunityIcons
                    name={comparison.others ? 'check-circle' : 'close-circle'}
                    size={dimensions.iconSize - 8}
                    color={comparison.others ? '#4CAF50' : '#F44336'}
                  />
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      ) : (
        // Desktop table layout
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={[
            styles.comparisonTableContainer,
            { marginHorizontal: dimensions.containerPadding }
          ]}
        >
          <View style={[
            styles.comparisonTable,
            isDark && styles.comparisonTableDark,
            { 
              borderRadius: dimensions.containerPadding,
              minWidth: width - (dimensions.containerPadding * 2)
            }
          ]}>
            {/* Table Header */}
            <View style={[styles.comparisonHeader, { padding: dimensions.cardPadding }]}>
              <View style={[styles.comparisonHeaderCell, { minWidth: 200 }]}>
                <Text style={[
                  styles.comparisonHeaderText,
                  isDark && styles.comparisonHeaderTextDark,
                  { fontSize: dimensions.subtitleSize }
                ]}>
                  Feature
                </Text>
              </View>
              <View style={[styles.comparisonHeaderCell, { minWidth: 120 }]}>
                <Text style={[
                  styles.comparisonHeaderText,
                  isDark && styles.comparisonHeaderTextDark,
                  { fontSize: dimensions.subtitleSize }
                ]}>
                  RecyclAI ✅
                </Text>
              </View>
              <View style={[styles.comparisonHeaderCell, { minWidth: 120 }]}>
                <Text style={[
                  styles.comparisonHeaderText,
                  isDark && styles.comparisonHeaderTextDark,
                  { fontSize: dimensions.subtitleSize }
                ]}>
                  Others ❌
                </Text>
              </View>
            </View>
            
            {/* Table Rows */}
            {comparisons.map((comparison, index) => (
              <Animated.View
                key={`comparison-${index}`}
                style={[
                  styles.comparisonRow,
                  isDark && styles.comparisonRowDark,
                  index === comparisons.length - 1 && styles.comparisonRowLast,
                  {
                    padding: dimensions.cardPadding,
                    opacity: comparison.anim,
                    transform: [
                      { 
                        translateX: comparison.slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-20, 0]
                        }) 
                      }
                    ]
                  }
                ]}
              >
                <View style={[styles.comparisonCell, { minWidth: 200 }]}>
                  <Text style={[
                    styles.comparisonFeature,
                    isDark && styles.comparisonFeatureDark,
                    { fontSize: dimensions.bodySize }
                  ]}>
                    {comparison.feature}
                  </Text>
                </View>
                <View style={[styles.comparisonCell, styles.comparisonCheck, { minWidth: 120 }]}>
                  <MaterialCommunityIcons
                    name={comparison.recyclai ? 'check-circle' : 'close-circle'}
                    size={dimensions.iconSize - 8}
                    color={comparison.recyclai ? '#4CAF50' : '#F44336'}
                  />
                </View>
                <View style={[styles.comparisonCell, styles.comparisonCheck, { minWidth: 120 }]}>
                  <MaterialCommunityIcons
                    name={comparison.others ? 'check-circle' : 'close-circle'}
                    size={dimensions.iconSize - 8}
                    color={comparison.others ? '#4CAF50' : '#F44336'}
                  />
                </View>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );

  const renderCallToAction = () => (
    <Animated.View 
      style={[
        styles.ctaContainer,
        {
          marginBottom: dimensions.sectionSpacing,
          paddingHorizontal: dimensions.containerPadding,
          transform: [{ translateY: contentTranslateY }]
        }
      ]}
    >
      <Text style={[
        styles.sectionTitle,
        isDark && styles.sectionTitleDark,
        { 
          fontSize: dimensions.titleSize,
          marginBottom: dimensions.sectionSpacing / 2,
          textAlign: 'center'
        }
      ]}>
        Ready to Experience the Difference?
      </Text>
      
      <View style={[
        styles.ctaButtons,
        { gap: dimensions.containerPadding }
      ]}>
        <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                height: dimensions.buttonHeight,
                borderRadius: dimensions.buttonHeight / 2,
                paddingHorizontal: dimensions.containerPadding * 2
              }
            ]}
            onPress={handleTryRecyclAI}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={[
                styles.buttonGradient,
                {
                  height: dimensions.buttonHeight,
                  borderRadius: dimensions.buttonHeight / 2
                }
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[
                styles.primaryButtonText,
                { fontSize: isPhone ? dimensions.bodySize : dimensions.subtitleSize }
              ]}>
                Try RecyclAI Now
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={isPhone ? dimensions.iconSize - 12 : dimensions.iconSize - 8}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              isDark && styles.secondaryButtonDark,
              {
                height: dimensions.buttonHeight,
                borderRadius: dimensions.buttonHeight / 2,
                paddingHorizontal: dimensions.containerPadding * 2
              }
            ]}
            onPress={handleDownloadPDF}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.secondaryButtonText,
              isDark && styles.secondaryButtonTextDark,
              { fontSize: isPhone ? dimensions.bodySize : dimensions.subtitleSize }
            ]}>
              Download Full Analysis PDF
            </Text>
            <MaterialCommunityIcons
              name="download"
              size={isPhone ? dimensions.iconSize - 12 : dimensions.iconSize - 8}
              color={isDark ? '#fff' : '#667eea'}
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );

  // Enhanced background with floating elements
  const renderBackground = () => (
    <View style={styles.backgroundContainer}>
      <Animated.View
        style={[
          styles.floatingElement,
          {
            top: '10%',
            left: '5%',
            transform: [
              {
                translateY: floatingAnim1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20]
                })
              }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={[styles.floatingCircle, { 
            width: isPhone ? 60 : 80, 
            height: isPhone ? 60 : 80, 
            borderRadius: isPhone ? 30 : 40 
          }]}
        />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.floatingElement,
          {
            top: '30%',
            right: '10%',
            transform: [
              {
                translateY: floatingAnim2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 15]
                })
              }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={['#00C9FF', '#92FE9D']}
          style={[styles.floatingSquare, { 
            width: isPhone ? 45 : 60, 
            height: isPhone ? 45 : 60 
          }]}
        />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.floatingElement,
          {
            bottom: '20%',
            left: '15%',
            transform: [
              {
                translateY: floatingAnim3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10]
                })
              }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={['#f093fb', '#f5576c']}
          style={[styles.floatingTriangle, { 
            width: isPhone ? 50 : 70, 
            height: isPhone ? 50 : 70, 
            borderRadius: isPhone ? 25 : 35 
          }]}
        />
      </Animated.View>
    </View>
  );

  if (!isReady) {
    return (
      <View style={[styles.loadingContainer, isDark && styles.loadingContainerDark]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <Animated.View style={{ opacity: fadeAnim }}>
          <MaterialCommunityIcons
            name="recycle"
            size={isPhone ? 50 : 60}
            color={isDark ? '#fff' : '#667eea'}
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      {renderBackground()}
      
      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: dimensions.sectionSpacing }
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Back Button - Smaller */}
        <TouchableOpacity
          style={[
            styles.backButton,
            isDark && styles.backButtonDark,
            {
              top: Platform.OS === 'ios' ? 50 : 30,
              left: dimensions.containerPadding,
              width: dimensions.smallButtonSize,
              height: dimensions.smallButtonSize,
              borderRadius: dimensions.smallButtonSize / 2
            }
          ]}
          onPress={handleGoBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={isPhone ? 16 : 20}
            color={isDark ? '#fff' : '#333'}
          />
        </TouchableOpacity>

        {/* Theme Toggle - Smaller */}
        <TouchableOpacity
          style={[
            styles.themeButton,
            isDark && styles.themeButtonDark,
            {
              top: Platform.OS === 'ios' ? 50 : 30,
              right: dimensions.containerPadding,
              width: dimensions.smallButtonSize,
              height: dimensions.smallButtonSize,
              borderRadius: dimensions.smallButtonSize / 2
            }
          ]}
          onPress={toggleTheme}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={isDark ? 'weather-sunny' : 'weather-night'}
            size={isPhone ? 16 : 20}
            color={isDark ? '#fff' : '#333'}
          />
        </TouchableOpacity>

        <View style={{ paddingTop: Platform.OS === 'ios' ? 100 : 80 }}>
          {renderHeader()}
          {renderFeatures()}
          {renderComparison()}
          {renderCallToAction()}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#0f0f23',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingContainerDark: {
    backgroundColor: '#0f0f23',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  floatingElement: {
    position: 'absolute',
    opacity: 0.1,
  },
  floatingCircle: {
    borderRadius: 40,
  },
  floatingSquare: {
    borderRadius: 12,
  },
  floatingTriangle: {
    borderRadius: 35,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButtonDark: {
    backgroundColor: 'rgba(15, 15, 35, 0.9)',
  },
  themeButton: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  themeButtonDark: {
    backgroundColor: 'rgba(15, 15, 35, 0.9)',
  },
  headerSection: {
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  pageTitleDark: {
    color: '#ffffff',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#667eea',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  heroTitleDark: {
    color: '#92FE9D',
  },
  pageSubtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#666',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  pageSubtitleDark: {
    color: '#b0b0b0',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  sectionTitleDark: {
    color: '#ffffff',
  },
  featuresContainer: {
    alignItems: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  featureCardDark: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  featureTitleDark: {
    color: '#ffffff',
  },
  featureDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  featureDescriptionDark: {
    color: '#b0b0b0',
  },
  comparisonContainer: {
    alignItems: 'center',
  },
  // Mobile-optimized comparison styles
  comparisonMobileContainer: {
    width: '100%',
  },
  comparisonMobileCard: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  comparisonMobileCardDark: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  comparisonMobileHeader: {
    marginBottom: 12,
  },
  comparisonMobileFeature: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  comparisonMobileFeatureDark: {
    color: '#ffffff',
  },
  comparisonMobileRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  comparisonMobileItem: {
    alignItems: 'center',
    flex: 1,
  },
  comparisonMobileLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  comparisonMobileLabelDark: {
    color: '#b0b0b0',
  },
  // Desktop table styles
  comparisonTableContainer: {
    flex: 1,
  },
  comparisonTable: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
    overflow: 'hidden',
  },
  comparisonTableDark: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  comparisonHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(102, 126, 234, 0.2)',
  },
  comparisonHeaderCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  comparisonHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  comparisonHeaderTextDark: {
    color: '#ffffff',
  },
  comparisonRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(102, 126, 234, 0.1)',
  },
  comparisonRowDark: {
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  comparisonRowLast: {
    borderBottomWidth: 0,
  },
  comparisonCell: {
    justifyContent: 'center',
    paddingVertical: 8,
  },
  comparisonFeature: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a2e',
  },
  comparisonFeatureDark: {
    color: '#ffffff',
  },
  comparisonCheck: {
    alignItems: 'center',
  },
  ctaContainer: {
    alignItems: 'center',
  },
  ctaButtons: {
    alignItems: 'center',
    width: '100%',
  },
  primaryButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  secondaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#667eea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButtonDark: {
    backgroundColor: '#1a1a2e',
    borderColor: '#92FE9D',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
    letterSpacing: -0.2,
  },
  secondaryButtonTextDark: {
    color: '#92FE9D',
  },
});