import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
  useColorScheme as _useColorScheme
} from 'react-native';

// Enhanced type definitions with advanced animation properties (removed rotation)
interface SkillItem {
  icon: string;
  title: string;
  description: string;
  anim: Animated.Value;
  scaleAnim: Animated.Value;
  pulseAnim: Animated.Value;
  delay: number;
  color: [string, string];
}

interface AchievementItem {
  icon: string;
  title: string;
  description: string;
  anim: Animated.Value;
  slideAnim: Animated.Value;
  bounceAnim: Animated.Value;
  delay: number;
}

interface StatItem {
  value: string;
  label: string;
  icon: string;
  anim: Animated.Value;
  countAnim: Animated.Value;
  glowAnim: Animated.Value;
  color: [string, string];
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
    profileImageSize: (() => {
      if (deviceType === 'xs') return 100;
      if (deviceType === 'sm') return 120;
      if (deviceType === 'md') return 140;
      return 160;
    })(),
    
    // Grid calculations - phone optimized
    skillCardWidth: (() => {
      if (deviceType === 'xs' || deviceType === 'sm') return width - (baseSpacing * 2);
      if (deviceType === 'md') return (width - (baseSpacing * 3)) / 2;
      return (width - (baseSpacing * 4)) / 2;
    })(),
    
    statCardWidth: (() => {
      if (deviceType === 'xs') return (width - (baseSpacing * 3)) / 2;
      if (deviceType === 'sm') return (width - (baseSpacing * 4)) / 3;
      return (width - (baseSpacing * 5)) / 4;
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

// Advanced animation system with sophisticated effects (removed rotation and breathing)
const useAnimations = () => {
  const dimensions = getResponsiveDimensions();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerTranslateY = useRef(new Animated.Value(-50)).current;
  const contentTranslateY = useRef(new Animated.Value(30)).current;
  const imageScaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonScaleAnim = useRef(new Animated.Value(0.9)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Advanced parallax effects with multiple layers
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

  const foregroundTranslateY = scrollY.interpolate({
    inputRange: [0, 400],
    outputRange: [0, -50],
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
  const floatingAnim4 = useRef(new Animated.Value(0)).current;
  
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

    const floating4 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim4, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim4, {
          toValue: 0,
          duration: 6000,
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
    floating4.start();
    shimmer.start();

    return () => {
      floating1.stop();
      floating2.stop();
      floating3.stop();
      floating4.stop();
      shimmer.stop();
    };
  }, [floatingAnim1, floatingAnim2, floatingAnim3, floatingAnim4, shimmerAnim]);

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
      Animated.spring(imageScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, scaleAnim, headerTranslateY, contentTranslateY, imageScaleAnim, buttonScaleAnim, dimensions.animationDuration]);

  const resetAnimations = useCallback(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    headerTranslateY.setValue(-50);
    contentTranslateY.setValue(30);
    imageScaleAnim.setValue(0.8);
    buttonScaleAnim.setValue(0.9);
    scrollY.setValue(0);
  }, [fadeAnim, scaleAnim, headerTranslateY, contentTranslateY, imageScaleAnim, buttonScaleAnim, scrollY]);

  return {
    fadeAnim,
    scaleAnim,
    headerTranslateY,
    contentTranslateY,
    imageScaleAnim,
    buttonScaleAnim,
    scrollY,
    backgroundTranslateY,
    midgroundTranslateY,
    foregroundTranslateY,
    headerOpacity,
    headerScale,
    floatingAnim1,
    floatingAnim2,
    floatingAnim3,
    floatingAnim4,
    shimmerAnim,
    startAnimations,
    resetAnimations
  };
};

export default function DeveloperScreen() {
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
    imageScaleAnim,
    buttonScaleAnim,
    scrollY,
    backgroundTranslateY,
    midgroundTranslateY,
    foregroundTranslateY,
    headerOpacity,
    headerScale,
    floatingAnim1,
    floatingAnim2,
    floatingAnim3,
    floatingAnim4,
    shimmerAnim,
    startAnimations,
    resetAnimations
  } = useAnimations();

  // Enhanced stats data with same content but advanced animations
  const stats = useMemo<StatItem[]>(() => [
    {
      value: '96+%',
      label: 'AI Accuracy',
      icon: 'target',
      anim: new Animated.Value(0),
      countAnim: new Animated.Value(0),
      glowAnim: new Animated.Value(0),
      color: ['#667eea', '#764ba2']
    },
    {
      value: '1',
      label: 'SmartBin Built',
      icon: 'recycle',
      anim: new Animated.Value(0),
      countAnim: new Animated.Value(0),
      glowAnim: new Animated.Value(0),
      color: ['#00C9FF', '#92FE9D']
    },
    {
      value: '100%',
      label: 'Passion',
      icon: 'heart',
      anim: new Animated.Value(0),
      countAnim: new Animated.Value(0),
      glowAnim: new Animated.Value(0),
      color: ['#f093fb', '#f5576c']
    }
  ], []);

  // Enhanced skills data with advanced animations (removed rotation)
  const skills = useMemo<SkillItem[]>(() => [
    {
      icon: 'brain',
      title: 'Machine Learning',
      description: 'AI-powered waste classification systems',
      anim: new Animated.Value(0),
      scaleAnim: new Animated.Value(1),
      pulseAnim: new Animated.Value(0),
      delay: 200,
      color: ['#667eea', '#764ba2']
    },
    {
      icon: 'code-tags',
      title: 'Mobile Development',
      description: 'React Native & cross-platform apps',
      anim: new Animated.Value(0),
      scaleAnim: new Animated.Value(1),
      pulseAnim: new Animated.Value(0),
      delay: 300,
      color: ['#00C9FF', '#92FE9D']
    },
    {
      icon: 'eye',
      title: 'Computer Vision',
      description: 'Image recognition & classification',
      anim: new Animated.Value(0),
      scaleAnim: new Animated.Value(1),
      pulseAnim: new Animated.Value(0),
      delay: 400,
      color: ['#f093fb', '#f5576c']
    },
    {
      icon: 'earth',
      title: 'Sustainability',
      description: 'Environmental impact & green tech',
      anim: new Animated.Value(0),
      scaleAnim: new Animated.Value(1),
      pulseAnim: new Animated.Value(0),
      delay: 500,
      color: ['#4facfe', '#00f2fe']
    }
  ], []);

  // Enhanced achievements data with advanced animations
  const achievements = useMemo<AchievementItem[]>(() => [
    {
      icon: 'trophy',
      title: 'SmartBin Prototype',
      description: 'Built AI-powered waste classification system',
      anim: new Animated.Value(0),
      slideAnim: new Animated.Value(0),
      bounceAnim: new Animated.Value(0),
      delay: 600
    },
    {
      icon: 'rocket-launch',
      title: 'RecyclAI App',
      description: 'Created mobile app for smart recycling',
      anim: new Animated.Value(0),
      slideAnim: new Animated.Value(0),
      bounceAnim: new Animated.Value(0),
      delay: 700
    },
    {
      icon: 'school',
      title: 'High School Student',
      description: 'Balancing academics with innovation',
      anim: new Animated.Value(0),
      slideAnim: new Animated.Value(0),
      bounceAnim: new Animated.Value(0),
      delay: 800
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
      skills.forEach(skill => {
        skill.anim.setValue(0);
        skill.scaleAnim.setValue(1);
        skill.pulseAnim.setValue(0);
      });
      achievements.forEach(achievement => {
        achievement.anim.setValue(0);
        achievement.slideAnim.setValue(0);
        achievement.bounceAnim.setValue(0);
      });
      stats.forEach(stat => {
        stat.anim.setValue(0);
        stat.countAnim.setValue(0);
        stat.glowAnim.setValue(0);
      });

      const timeout = setTimeout(() => {
        setIsReady(true);
        startAnimations();

        // Advanced staggered animations for skills (removed rotation)
        skills.forEach((skill) => {
          Animated.parallel([
            Animated.timing(skill.anim, {
              toValue: 1,
              duration: dimensions.animationDuration,
              delay: skill.delay,
              easing: Easing.out(Easing.back(1.1)),
              useNativeDriver: true,
            })
          ]).start();

          // Advanced pulse animation for skills (no rotation)
          const pulseSkill = () => {
            Animated.sequence([
              Animated.timing(skill.scaleAnim, {
                toValue: 1.05,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(skill.scaleAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              })
            ]).start(() => {
              setTimeout(pulseSkill, 3000 + Math.random() * 2000);
            });
          };

          // Pulse glow effect
          const pulseGlow = () => {
            Animated.loop(
              Animated.sequence([
                Animated.timing(skill.pulseAnim, {
                  toValue: 1,
                  duration: 1500,
                  easing: Easing.inOut(Easing.ease),
                  useNativeDriver: true,
                }),
                Animated.timing(skill.pulseAnim, {
                  toValue: 0,
                  duration: 1500,
                  easing: Easing.inOut(Easing.ease),
                  useNativeDriver: true,
                })
              ])
            ).start();
          };

          setTimeout(pulseSkill, skill.delay + 1000);
          setTimeout(pulseGlow, skill.delay + 1500);
        });

        // Advanced animations for achievements
        achievements.forEach((achievement, index) => {
          Animated.parallel([
            Animated.timing(achievement.anim, {
              toValue: 1,
              duration: dimensions.animationDuration - 100,
              delay: achievement.delay,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(achievement.slideAnim, {
              toValue: 1,
              duration: dimensions.animationDuration,
              delay: achievement.delay + 100,
              easing: Easing.out(Easing.back(1.1)),
              useNativeDriver: true,
            })
          ]).start();

          // Bounce animation for achievements
          const bounceAchievement = () => {
            Animated.sequence([
              Animated.timing(achievement.bounceAnim, {
                toValue: 1,
                duration: 200,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(achievement.bounceAnim, {
                toValue: 0,
                duration: 200,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
              })
            ]).start(() => {
              setTimeout(bounceAchievement, 8000 + Math.random() * 4000);
            });
          };

          setTimeout(bounceAchievement, achievement.delay + 2000);
        });

        // Advanced animations for stats with counting effect
        stats.forEach((stat, index) => {
          Animated.parallel([
            Animated.timing(stat.anim, {
              toValue: 1,
              duration: dimensions.animationDuration - 200,
              delay: 1000 + (index * dimensions.staggerDelay),
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(stat.countAnim, {
              toValue: 1,
              duration: 2000,
              delay: 1200 + (index * dimensions.staggerDelay),
              easing: Easing.out(Easing.ease),
              useNativeDriver: false, // For interpolation
            })
          ]).start();

          // Glow effect for stats
          const glowStat = () => {
            Animated.loop(
              Animated.sequence([
                Animated.timing(stat.glowAnim, {
                  toValue: 1,
                  duration: 2000,
                  easing: Easing.inOut(Easing.ease),
                  useNativeDriver: true,
                }),
                Animated.timing(stat.glowAnim, {
                  toValue: 0,
                  duration: 2000,
                  easing: Easing.inOut(Easing.ease),
                  useNativeDriver: true,
                })
              ])
            ).start();
          };

          setTimeout(glowStat, 1500 + (index * dimensions.staggerDelay));
        });

      }, 100);

      return () => {
        clearTimeout(timeout);
        fadeAnim.stopAnimation();
        scaleAnim.stopAnimation();
        headerTranslateY.stopAnimation();
        contentTranslateY.stopAnimation();
        imageScaleAnim.stopAnimation();
        buttonScaleAnim.stopAnimation();
        skills.forEach(skill => {
          skill.anim.stopAnimation();
          skill.scaleAnim.stopAnimation();
          skill.pulseAnim.stopAnimation();
        });
        achievements.forEach(achievement => {
          achievement.anim.stopAnimation();
          achievement.slideAnim.stopAnimation();
          achievement.bounceAnim.stopAnimation();
        });
        stats.forEach(stat => {
          stat.anim.stopAnimation();
          stat.countAnim.stopAnimation();
          stat.glowAnim.stopAnimation();
        });
      };
    }, [skills, achievements, stats, resetAnimations, startAnimations, dimensions])
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

  const handleGetStarted = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(60);
    }
    router.push('../next_page');
  }, [router]);

  // Advanced skill card interaction with multiple effects (no rotation)
  const handleSkillPress = useCallback((skill: SkillItem) => {
    Animated.sequence([
      Animated.timing(skill.scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(skill.scaleAnim, {
        toValue: 1.05,
        friction: 8,
        tension: 300,
        useNativeDriver: true,
      }),
      Animated.spring(skill.scaleAnim, {
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
          Meet the Developer
        </Text>
      </Animated.View>
      
      <Text style={[
        styles.pageSubtitle,
        isDark && styles.pageSubtitleDark,
        { 
          fontSize: dimensions.subtitleSize,
          paddingHorizontal: dimensions.containerPadding,
          lineHeight: dimensions.subtitleSize * 1.5
        }
      ]}>
        The story behind RecyclAI and the vision for a smarter, more sustainable future.
      </Text>
    </Animated.View>
  );

  const renderProfileSection = () => (
    <Animated.View 
      style={[
        styles.profileSection,
        {
          marginBottom: dimensions.sectionSpacing,
          transform: [{ translateY: contentTranslateY }]
        }
      ]}
    >
      {/* Profile Image - No breathing animation */}
      <Animated.View
        style={[
          styles.profileImageContainer,
          {
            width: dimensions.profileImageSize,
            height: dimensions.profileImageSize,
            borderRadius: dimensions.profileImageSize / 2,
            marginBottom: dimensions.containerPadding,
            transform: [{ scale: imageScaleAnim }]
          }
        ]}
      >
        
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={[
            styles.profileImageGradient,
            {
              width: dimensions.profileImageSize,
              height: dimensions.profileImageSize,
              borderRadius: dimensions.profileImageSize / 2
            }
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
         <Image
              source={require('@/assets/images/aarav.png')}
              style={[
                styles.profileImage,
                {
                  width: dimensions.profileImageSize - 8,
                  height: dimensions.profileImageSize - 8,
                  borderRadius: (dimensions.profileImageSize - 8) / 2
                }
              ]}
              resizeMode="cover"
          />
        </LinearGradient>
      </Animated.View>

      <Text style={[
        styles.developerName,
        isDark && styles.developerNameDark,
        { 
          fontSize: dimensions.titleSize,
          marginBottom: dimensions.containerPadding / 2
        }
      ]}>
        Aarav Rao
      </Text>
      
      <Text style={[
        styles.developerTitle,
        isDark && styles.developerTitleDark,
        { 
          fontSize: dimensions.subtitleSize,
          marginBottom: dimensions.containerPadding
        }
      ]}>
        AI Developer & Environmental Advocate
      </Text>
      
      <Text style={[
        styles.developerBio,
        isDark && styles.developerBioDark,
        { 
          fontSize: dimensions.bodySize,
          lineHeight: dimensions.bodySize * 1.6,
          paddingHorizontal: dimensions.containerPadding
        }
      ]}>
        Passionate high school student combining artificial intelligence with environmental sustainability. 
        Creator of RecyclAI and the SmartBin prototype, working to make recycling more accessible and effective through technology.
      </Text>
    </Animated.View>
  );

  const renderStats = () => (
    <View style={[styles.statsContainer, { marginBottom: dimensions.sectionSpacing }]}>
      <View style={[
        styles.statsGrid,
        { gap: dimensions.containerPadding / 2 }
      ]}>
        {stats.map((stat, index) => (
          <Animated.View
            key={`stat-${index}`}
            style={[
              styles.statCard,
              isDark && styles.statCardDark,
              {
                width: dimensions.statCardWidth,
                padding: dimensions.cardPadding - (isPhone ? 4 : 8),
                opacity: stat.anim,
                transform: [
                  { 
                    translateY: stat.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    }) 
                  },
                  { 
                    scale: stat.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1]
                    }) 
                  }
                ]
              }
            ]}
          >
            <Animated.View style={{
              transform: [{
                scale: stat.glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1]
                })
              }]
            }}>
              <LinearGradient
                colors={stat.color}
                style={[
                  styles.statIconContainer,
                  {
                    width: dimensions.iconSize - (isPhone ? 4 : 8),
                    height: dimensions.iconSize - (isPhone ? 4 : 8),
                    borderRadius: (dimensions.iconSize - (isPhone ? 4 : 8)) / 2,
                    marginBottom: dimensions.containerPadding / 2
                  }
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons
                  name={stat.icon}
                  size={dimensions.iconSize - (isPhone ? 16 : 20)}
                  color="#fff"
                />
              </LinearGradient>
            </Animated.View>
            
            <Text style={[
              styles.statValue,
              isDark && styles.statValueDark,
              { 
                fontSize: isPhone ? dimensions.subtitleSize : dimensions.titleSize - 4,
                marginBottom: dimensions.containerPadding / 4
              }
            ]}>
              {stat.value}
            </Text>
            
            <Text style={[
              styles.statLabel,
              isDark && styles.statLabelDark,
              { fontSize: isPhone ? dimensions.captionSize : dimensions.bodySize }
            ]}>
              {stat.label}
            </Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );

  const renderSkills = () => (
    <View style={[styles.skillsContainer, { marginBottom: dimensions.sectionSpacing }]}>
      <Text style={[
        styles.sectionTitle,
        isDark && styles.sectionTitleDark,
        { 
          fontSize: dimensions.titleSize,
          marginBottom: dimensions.sectionSpacing / 2,
          paddingHorizontal: dimensions.containerPadding
        }
      ]}>
        Skills & Expertise
      </Text>
      
      <View style={[
        styles.skillsGrid,
        { gap: dimensions.containerPadding }
      ]}>
        {skills.map((skill, index) => (
          <TouchableOpacity
            key={`skill-${index}`}
            onPress={() => handleSkillPress(skill)}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.skillCard,
                isDark && styles.skillCardDark,
                {
                  width: dimensions.skillCardWidth,
                  padding: dimensions.cardPadding,
                  opacity: skill.anim,
                  transform: [
                    { 
                      translateY: skill.anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0]
                      }) 
                    },
                    { 
                      scale: skill.scaleAnim
                    }
                  ]
                }
              ]}
            >
              {/* Removed rotation animation */}
              <LinearGradient
                colors={skill.color}
                style={[
                  styles.skillIconContainer,
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
                  name={skill.icon}
                  size={dimensions.iconSize - (isPhone ? 4 : 8)}
                  color="#fff"
                />
              </LinearGradient>
              
              <Text style={[
                styles.skillTitle,
                isDark && styles.skillTitleDark,
                { 
                  fontSize: dimensions.subtitleSize,
                  marginBottom: dimensions.containerPadding / 2
                }
              ]}>
                {skill.title}
              </Text>
              
              <Text style={[
                styles.skillDescription,
                isDark && styles.skillDescriptionDark,
                { 
                  fontSize: dimensions.bodySize,
                  lineHeight: dimensions.bodySize * 1.4
                }
              ]}>
                {skill.description}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderAchievements = () => (
    <View style={[styles.achievementsContainer, { marginBottom: dimensions.sectionSpacing }]}>
      <Text style={[
        styles.sectionTitle,
        isDark && styles.sectionTitleDark,
        { 
          fontSize: dimensions.titleSize,
          marginBottom: dimensions.sectionSpacing / 2,
          paddingHorizontal: dimensions.containerPadding
        }
      ]}>
        Key Achievements
      </Text>
      
      <View style={[
        styles.achievementsList,
        { gap: dimensions.containerPadding }
      ]}>
        {achievements.map((achievement, index) => (
          <Animated.View
            key={`achievement-${index}`}
            style={[
              styles.achievementCard,
              isDark && styles.achievementCardDark,
              {
                marginHorizontal: dimensions.containerPadding,
                padding: dimensions.cardPadding,
                opacity: achievement.anim,
                transform: [
                  { 
                    translateX: achievement.slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-30, 0]
                    }) 
                  },
                  { 
                    scale: achievement.bounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.02]
                    }) 
                  }
                ]
              }
            ]}
          >
            <View style={styles.achievementContent}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={[
                  styles.achievementIconContainer,
                  {
                    width: dimensions.iconSize,
                    height: dimensions.iconSize,
                    borderRadius: dimensions.iconSize / 2,
                    marginRight: dimensions.containerPadding
                  }
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons
                  name={achievement.icon}
                  size={dimensions.iconSize - (isPhone ? 8 : 12)}
                  color="#fff"
                />
              </LinearGradient>
              
              <View style={styles.achievementText}>
                <Text style={[
                  styles.achievementTitle,
                  isDark && styles.achievementTitleDark,
                  { 
                    fontSize: dimensions.subtitleSize,
                    marginBottom: dimensions.containerPadding / 4
                  }
                ]}>
                  {achievement.title}
                </Text>
                
                <Text style={[
                  styles.achievementDescription,
                  isDark && styles.achievementDescriptionDark,
                  { 
                    fontSize: dimensions.bodySize,
                    lineHeight: dimensions.bodySize * 1.4
                  }
                ]}>
                  {achievement.description}
                </Text>
              </View>
            </View>
          </Animated.View>
        ))}
      </View>
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
        styles.ctaTitle,
        isDark && styles.ctaTitleDark,
        { 
          fontSize: dimensions.titleSize,
          marginBottom: dimensions.containerPadding,
          textAlign: 'center'
        }
      ]}>
        Ready to Make a Difference?
      </Text>
      
      <Text style={[
        styles.ctaSubtitle,
        isDark && styles.ctaSubtitleDark,
        { 
          fontSize: dimensions.bodySize,
          lineHeight: dimensions.bodySize * 1.5,
          marginBottom: dimensions.sectionSpacing / 2,
          textAlign: 'center'
        }
      ]}>
        Join the movement towards smarter recycling and help create a more sustainable future with AI-powered solutions.
      </Text>
      
      <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.ctaButton,
            {
              height: dimensions.buttonHeight,
              borderRadius: dimensions.buttonHeight / 2,
              paddingHorizontal: dimensions.containerPadding * 2
            }
          ]}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={[
              styles.ctaButtonGradient,
              {
                height: dimensions.buttonHeight,
                borderRadius: dimensions.buttonHeight / 2
              }
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[
              styles.ctaButtonText,
              { fontSize: isPhone ? dimensions.bodySize : dimensions.subtitleSize }
            ]}>
              Get Started with RecyclAI
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
      
      <Animated.View
        style={[
          styles.floatingElement,
          {
            top: '60%',
            right: '5%',
            transform: [
              {
                translateY: floatingAnim4.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 12]
                })
              }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={['#4facfe', '#00f2fe']}
          style={[styles.floatingDiamond, { 
            width: isPhone ? 40 : 55, 
            height: isPhone ? 40 : 55, 
            borderRadius: isPhone ? 20 : 27 
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
            name="account-circle"
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
          {renderProfileSection()}
          {renderStats()}
          {renderSkills()}
          {renderAchievements()}
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
  floatingDiamond: {
    borderRadius: 27,
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
  profileSection: {
    alignItems: 'center',
  },
  profileImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  profileImageGradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    backgroundColor: '#f0f0f0',
  },
  developerName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  developerNameDark: {
    color: '#ffffff',
  },
  developerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#667eea',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  developerTitleDark: {
    color: '#92FE9D',
  },
  developerBio: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  developerBioDark: {
    color: '#b0b0b0',
  },
  statsContainer: {
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  statCardDark: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  statValueDark: {
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  statLabelDark: {
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
  skillsContainer: {
    alignItems: 'center',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  skillCard: {
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
  skillCardDark: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  skillIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  skillTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  skillTitleDark: {
    color: '#ffffff',
  },
  skillDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  skillDescriptionDark: {
    color: '#b0b0b0',
  },
  achievementsContainer: {
    alignItems: 'center',
  },
  achievementsList: {
    width: '100%',
  },
  achievementCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  achievementCardDark: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    letterSpacing: -0.2,
  },
  achievementTitleDark: {
    color: '#ffffff',
  },
  achievementDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    letterSpacing: -0.1,
  },
  achievementDescriptionDark: {
    color: '#b0b0b0',
  },
  ctaContainer: {
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    letterSpacing: -0.3,
  },
  ctaTitleDark: {
    color: '#ffffff',
  },
  ctaSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    letterSpacing: -0.1,
  },
  ctaSubtitleDark: {
    color: '#b0b0b0',
  },
  ctaButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
});