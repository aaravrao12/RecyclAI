import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  useColorScheme as _useColorScheme,
  Animated,
  Dimensions,
  Easing,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';

// Enhanced types for better TypeScript support
type IconName =
  | 'recycle'
  | 'leaf'
  | 'map-marker'
  | 'bottle-soda'
  | 'newspaper-variant'
  | 'medal'
  | 'earth'
  | 'trophy'
  | 'chart-line'
  | 'shield-check'
  | 'star'
  | 'heart'
  | 'lightning-bolt'
  | 'account-group'
  | 'brain'
  | 'robot'
  | 'camera'
  | 'qrcode-scan'
  | 'gift'
  | 'trending-up'
  | 'security'
  | 'clock-fast'
  | 'handshake'
  | 'school'
  | 'book-open'
  | 'video-outline'
  | 'microphone'
  | 'headphones'
  | 'play-circle'
  | 'rocket-launch'
  | 'sparkles'
  | 'eye'
  | 'target'
  | 'flash'
  | 'weather-sunny'
  | 'weather-partly-cloudy'
  | 'weather-sunset'
  | 'weather-night'
  | 'head-question'
  | 'quiz'
  | 'coin'
  | 'gamepad-variant'
  | 'login'
  | 'account-plus'
  | 'office-building'
  | 'city'
  | 'factory'
  | 'domain'
  | 'briefcase'
  | 'bank';

interface FeatureCard {
  icon: IconName;
  title: string;
  description: string;
  anim: Animated.Value;
  delay: number;
  color: [string, string, ...string[]];
  category: 'corporate' | 'municipal' | 'technology' | 'sustainability';
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  direction: number;
  anim: Animated.Value;
  color: string;
  type: 'circle' | 'star' | 'diamond';
}

interface Partnership {
  title: string;
  description: string;
  icon: IconName;
  anim: Animated.Value;
  color: string;
  benefits: string[];
}

// Enhanced responsive system
const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// Enhanced breakpoint system
const breakpoints = {
  xs: 0,      // Extra small devices (phones, 0px and up)
  sm: 576,    // Small devices (landscape phones, 576px and up)
  md: 768,    // Medium devices (tablets, 768px and up)
  lg: 992,    // Large devices (desktops, 992px and up)
  xl: 1200,   // Extra large devices (large desktops, 1200px and up)
  xxl: 1400   // Extra extra large devices (larger desktops, 1400px and up)
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
const isMobile = deviceType === 'xs' || deviceType === 'sm';
const isTablet = deviceType === 'md';
const isDesktop = deviceType === 'lg' || deviceType === 'xl' || deviceType === 'xxl';

// Performance-optimized particle count
const PARTICLE_COUNT = isMobile ? 15 : isTablet ? 25 : 40;

// Enhanced color scheme hook with system detection
const useColorScheme = () => {
  const systemColorScheme = _useColorScheme();
  const [theme, setTheme] = useState(systemColorScheme || 'light');

  useEffect(() => {
    if (systemColorScheme) {
      setTheme(systemColorScheme);
    }
  }, [systemColorScheme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      if (Platform.OS !== 'web') {
        Vibration.vibrate(50);
      }
      return newTheme;
    });
  }, []);

  return { theme, toggleTheme };
};

export default function LandingScreen() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const { theme, toggleTheme } = useColorScheme();
  const isDark = theme === 'dark';

  // Enhanced animation values with better performance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonTranslateY = useRef(new Animated.Value(50)).current;
  const leafRotate = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;
  const partnershipsAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Enhanced feature cards focused on technology and innovation
  const [featureCards] = useState<FeatureCard[]>([
    {
      icon: 'brain',
      title: 'Advanced AI Technology',
      description: 'Cutting-edge machine learning algorithms that continuously improve waste recognition accuracy and provide intelligent sorting recommendations.',
      anim: new Animated.Value(0),
      delay: 200,
      color: ['#667eea', '#764ba2', '#f093fb'],
      category: 'technology'
    },
    {
      icon: 'factory',
      title: 'Enterprise Integration',
      description: 'Seamless integration with existing corporate waste management systems, providing real-time analytics and compliance reporting.',
      anim: new Animated.Value(0),
      delay: 300,
      color: ['#f093fb', '#f5576c', '#fa709a'],
      category: 'corporate'
    },
    {
      icon: 'city',
      title: 'Municipal Solutions',
      description: 'Comprehensive waste management solutions designed for cities and municipalities, including citizen engagement and public education tools.',
      anim: new Animated.Value(0),
      delay: 400,
      color: ['#00C9FF', '#92FE9D', '#4ecca3'],
      category: 'municipal'
    },
    {
      icon: 'leaf',
      title: 'Sustainability Impact',
      description: 'Measurable environmental impact tracking with detailed carbon footprint analysis and sustainability goal monitoring for organizations.',
      anim: new Animated.Value(0),
      delay: 500,
      color: ['#a8edea', '#fed6e3', '#fee140'],
      category: 'sustainability'
    }
  ]);

  // Partnership opportunities
  const [partnerships] = useState<Partnership[]>([
    {
      title: 'Corporate Partnerships',
      description: 'Transform your organization\'s waste management with AI-powered solutions',
      icon: 'office-building',
      anim: new Animated.Value(0),
      color: '#3498db',
      benefits: [
        'Reduce waste management costs by up to 40%',
        'Improve sustainability reporting and compliance',
        'Enhance employee engagement in green initiatives',
        'Real-time analytics and performance tracking'
      ]
    },
    {
      title: 'Municipal Partnerships',
      description: 'Empower your community with smart recycling infrastructure',
      icon: 'city',
      anim: new Animated.Value(0),
      color: '#2ecc71',
      benefits: [
        'Increase recycling rates across your municipality',
        'Reduce contamination in recycling streams',
        'Educate citizens through interactive technology',
        'Lower waste collection and processing costs'
      ]
    },
    {
      title: 'Technology Integration',
      description: 'Seamless integration with existing systems and infrastructure',
      icon: 'brain',
      anim: new Animated.Value(0),
      color: '#9b59b6',
      benefits: [
        'API integration with current waste management systems',
        'Custom dashboard and reporting solutions',
        'Scalable cloud-based infrastructure',
        'Ongoing technical support and updates'
      ]
    }
  ]);

  // Enhanced particle system
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 3 + Math.random() * 4,
      speed: 0.5 + Math.random() * 1.5,
      opacity: 0.1 + Math.random() * 0.3,
      direction: Math.random() * Math.PI * 2,
      anim: new Animated.Value(0),
      color: ['#4ecca3', '#667eea', '#f093fb', '#00C9FF', '#fee140'][Math.floor(Math.random() * 5)],
      type: ['circle', 'star', 'diamond'][Math.floor(Math.random() * 3)] as 'circle' | 'star' | 'diamond'
    }))
  );

  // Enhanced animation functions
  const startFloatingAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  const startPulsingAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const startWaveAnimation = useCallback(() => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      })
    ).start();
  }, [waveAnim]);

  const startShimmerAnimation = useCallback(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);

  const startGlowAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  const startParticleAnimations = useCallback(() => {
    particles.forEach((particle, index) => {
      const animateParticle = () => {
        particle.anim.setValue(0);
        Animated.timing(particle.anim, {
          toValue: 1,
          duration: 4000 + Math.random() * 6000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          setTimeout(animateParticle, Math.random() * 2000);
        });
      };

      setTimeout(animateParticle, index * 200);
    });
  }, [particles]);

  const animateFeatureCards = useCallback(() => {
    featureCards.forEach((card, index) => {
      setTimeout(() => {
        Animated.spring(card.anim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
      }, card.delay);
    });
  }, [featureCards]);

  const animatePartnerships = useCallback(() => {
    setTimeout(() => {
      Animated.timing(partnershipsAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      partnerships.forEach((partnership, index) => {
        setTimeout(() => {
          Animated.spring(partnership.anim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }, index * 150);
      });
    }, 1000);
  }, [partnerships, partnershipsAnim]);

  const animateCallToAction = useCallback(() => {
    setTimeout(() => {
      Animated.spring(ctaAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }, 1500);
  }, [ctaAnim]);

  // Enhanced focus effect with better performance
  useEffect(() => {
    if (!isReady) {
      // Initial setup animations
      const setupAnimations = Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(buttonTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]);

      setupAnimations.start(() => {
        setIsReady(true);

        // Start continuous animations
        startFloatingAnimation();
        startPulsingAnimation();
        startWaveAnimation();
        startShimmerAnimation();
        startGlowAnimation();
        startParticleAnimations();

        // Start timed animations
        animateFeatureCards();
        animatePartnerships();
        animateCallToAction();
      });

      // Start leaf rotation immediately
      Animated.loop(
        Animated.timing(leafRotate, {
          toValue: 1,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }

    return () => {
      // Cleanup animations on unmount
      fadeAnim.stopAnimation();
      scaleAnim.stopAnimation();
      buttonTranslateY.stopAnimation();
      leafRotate.stopAnimation();
      floatAnim.stopAnimation();
      pulseAnim.stopAnimation();
      waveAnim.stopAnimation();
      shimmerAnim.stopAnimation();
      glowAnim.stopAnimation();
      ctaAnim.stopAnimation();
      partnershipsAnim.stopAnimation();

      particles.forEach(particle => particle.anim.stopAnimation());
      featureCards.forEach(card => card.anim.stopAnimation());
      partnerships.forEach(partnership => partnership.anim.stopAnimation());
    };
  }, []);

  // Animated value for header background opacity
  const headerBackgroundOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Enhanced scroll handlers
  const handleScrollBeginDrag = useCallback(() => {
    setIsScrolling(true);
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    setTimeout(() => setIsScrolling(false), 100);
  }, []);

  // Enhanced interaction handlers
  const handleSignInSignUp = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }
    router.push('/login');
  }, [router]);

  const handleContinueAsGuest = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(30);
    }
    router.push({ pathname: '/account', params: { guest: 'true' } });
  }, [router]);

  const handleCorporatePartnership = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }
    Linking.openURL('https://forms.gle/ffH4iRvhL1jABWho6');
  }, []);

  const handleMunicipalityPartnership = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }
    Linking.openURL('https://forms.gle/3E2nacLeVXxJhX977');
  }, []);

  // Enhanced computed values for animations
  const leafRotation = leafRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const logoTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const waveTranslateX = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.6],
  });

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width * 2],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  if (!isReady) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? '#0f0f23' : '#ffffff'}
          translucent={false}
        />
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      isDark && styles.containerDark
    ]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0f0f23' : '#ffffff'}
        translucent={false}
      />

      {/* Top Bar with Theme Toggle */}
      <Animated.View
        style={[
          styles.topBar,
          {
            backgroundColor: headerBackgroundOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: isDark ? ['rgba(15, 15, 35, 0)', 'rgba(15, 15, 35, 0.9)'] : ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.9)'],
            }),
            shadowColor: isDark ? '#000' : '#000',
            shadowOffset: { width: 0, height: headerBackgroundOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 4] }) },
            shadowOpacity: headerBackgroundOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.2] }),
            shadowRadius: headerBackgroundOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 5] }),
            elevation: headerBackgroundOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }),
          }
        ]}
      >
        <View style={styles.topBarContent}>
          <Text style={[
            styles.appName,
            isDark && styles.appNameDark,
            { fontSize: isMobile ? 20 : 24 }
          ]}>
            RecyclAI
          </Text>
          
          <TouchableOpacity
            style={[
              styles.themeToggleButton,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.05)',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(0, 0, 0, 0.1)',
              }
            ]}
            onPress={toggleTheme}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={isDark ? 'weather-sunny' : 'weather-night'}
              size={24}
              color={isDark ? '#ffd700' : '#2c3e50'}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Enhanced animated background with glassmorphism */}
      <Animated.View
        style={[
          styles.backgroundContainer,
          { opacity: fadeAnim }
        ]}
      >
        {/* Enhanced gradient overlay with more stops */}
        <LinearGradient
          colors={isDark
            ? ['#0f0f23', '#1a1a2e', '#16213e', '#0f3460', '#1a1a2e', '#0f0f23']
            : ['#ffffff', '#f8fafc', '#e6f7ff', '#f0f8f5', '#fafafa', '#ffffff']}
          style={styles.gradientOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Enhanced animated wave backgrounds with glassmorphism */}
        <Animated.View
          style={[
            styles.waveBackground,
            {
              transform: [{ translateX: waveTranslateX }],
              opacity: isDark ? 0.06 : 0.08
            }
          ]}
        />

        <Animated.View
          style={[
            styles.waveBackground2,
            {
              transform: [{ translateX: waveTranslateX.interpolate({
                inputRange: [0, width * 0.6],
                outputRange: [width * 0.3, -width * 0.3]
              }) }],
              opacity: isDark ? 0.05 : 0.07
            }
          ]}
        />

        {/* Enhanced animated leaf background */}
        <Animated.Image
          source={require('@/assets/images/faint-leaf.png')}
          style={[
            styles.backgroundLeaf,
            {
              opacity: isDark ? 0.08 : 0.1,
              transform: [
                { rotate: leafRotation },
                { scale: isMobile ? 1.2 : 1.6 }
              ],
              tintColor: isDark ? '#4ecca3' : '#2ecc71'
            }
          ]}
          resizeMode="contain"
          fadeDuration={0}
        />

        {/* Enhanced secondary decorative leaf */}
        <Animated.Image
          source={require('@/assets/images/faint-leaf.png')}
          style={[
            styles.secondaryLeaf,
            {
              opacity: isDark ? 0.06 : 0.08,
              transform: [
                { rotate: '-60deg' },
                { scale: isMobile ? 1 : 1.3 }
              ],
              tintColor: isDark ? '#667eea' : '#3498db'
            }
          ]}
          resizeMode="contain"
          fadeDuration={0}
        />

        {/* Enhanced particle system with different shapes */}
        {particles.map((particle, index) => (
          <Animated.View
            key={`particle-${index}`}
            style={[
              styles.particle,
              {
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                opacity: particle.anim.interpolate({
                  inputRange: [0, 0.6, 1],
                  outputRange: [0, particle.opacity * 0.8, particle.opacity]
                }),
                transform: [
                  {
                    translateY: particle.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -50 * particle.speed]
                    })
                  },
                  {
                    translateX: particle.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 25 * Math.sin(particle.direction)]
                    })
                  },
                  {
                    scale: particle.anim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.2, 1.6, 1]
                    })
                  },
                  {
                    rotate: particle.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', particle.type === 'star' ? '720deg' : '360deg']
                    })
                  }
                ],
                backgroundColor: particle.color,
                borderRadius: particle.type === 'circle' ? particle.size / 2 :
                              particle.type === 'star' ? 0 : particle.size / 4
              }
            ]}
          />
        ))}

        {/* Enhanced shimmer effect */}
        <Animated.View
          style={[
            styles.shimmerOverlay,
            {
              transform: [{ translateX: shimmerTranslateX }],
              opacity: isDark ? 0.12 : 0.18
            }
          ]}
        />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Platform.OS === 'ios' ? 120 : 100 }
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Enhanced header section with better responsive design */}
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              paddingTop: Platform.OS === 'ios'
                ? (isMobile ? 40 : 60)
                : (isMobile ? 20 : 40)
            }
          ]}
        >
          {/* Enhanced logo container with glassmorphism */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [
                  { scale: scaleAnim },
                  { translateY: logoTranslateY }
                ]
              }
            ]}
          >
            <Animated.Image
              source={require('@/assets/images/logo.png')}
              style={[
                styles.logoImage,
                {
                  opacity: fadeAnim,
                  width: isMobile ? 140 : isTablet ? 170 : 200,
                  height: isMobile ? 140 : isTablet ? 170 : 200
                }
              ]}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Enhanced title with better typography */}
          <Animated.Text
            style={[
              styles.title,
              isDark && styles.titleDark,
              {
                opacity: fadeAnim,
                fontSize: isMobile ? 32 : isTablet ? 40 : 48,
                lineHeight: isMobile ? 40 : isTablet ? 48 : 56
              }
            ]}
          >
            The Future of Waste Management
          </Animated.Text>

          {/* Enhanced subtitle with better typography */}
          <Animated.Text
            style={[
              styles.subtitle,
              isDark && styles.subtitleDark,
              {
                opacity: fadeAnim,
                fontSize: isMobile ? 18 : isTablet ? 22 : 26,
                lineHeight: isMobile ? 26 : isTablet ? 30 : 36
              }
            ]}
          >
            Pioneering AI-Powered Recycling Solutions{'\n'}for Organizations and Communities
          </Animated.Text>

          {/* Enhanced description with better readability */}
          <Animated.Text
            style={[
              styles.description,
              isDark && styles.descriptionDark,
              {
                opacity: fadeAnim,
                fontSize: isMobile ? 16 : isTablet ? 17 : 19,
                lineHeight: isMobile ? 24 : isTablet ? 26 : 30
              }
            ]}
          >
            We are building the next generation of intelligent waste management technology.{'\n'}
            Our innovative platform combines artificial intelligence with sustainable practices{'\n'}
            to create measurable environmental impact for businesses and municipalities.
          </Animated.Text>
        </Animated.View>

        {/* Partnership Opportunities Section */}
        <Animated.View
          style={[
            styles.partnershipsSection,
            {
              opacity: partnershipsAnim,
              transform: [
                {
                  translateY: partnershipsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [60, 0]
                  })
                }
              ]
            }
          ]}
        >
          <Text style={[
            styles.sectionTitle,
            isDark && styles.sectionTitleDark,
            { fontSize: isMobile ? 24 : isTablet ? 30 : 36 }
          ]}>
            Seeking Strategic Partnerships
          </Text>
          <Text style={[
            styles.sectionSubtitle,
            isDark && styles.sectionSubtitleDark,
            { fontSize: isMobile ? 15 : isTablet ? 16 : 18 }
          ]}>
            We are actively seeking partnerships with forward-thinking organizations
          </Text>

          <View style={[
            styles.partnershipsGrid,
            {
              flexDirection: isMobile ? 'column' : 'row',
              flexWrap: isMobile ? 'nowrap' : 'wrap'
            }
          ]}>
            {partnerships.map((partnership, index) => (
              <Animated.View
                key={`partnership-${index}`}
                style={[
                  styles.partnershipCard,
                  isDark && styles.partnershipCardDark,
                  {
                    width: isMobile ? '100%' : isTablet ? '48%' : '31%',
                    marginBottom: isMobile ? 20 : 24,
                    opacity: partnership.anim,
                    transform: [
                      {
                        scale: partnership.anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.7, 1]
                        })
                      },
                      {
                        translateY: partnership.anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0]
                        })
                      }
                    ]
                  }
                ]}
              >
                <MaterialCommunityIcons
                  name={partnership.icon as any}
                  size={isMobile ? 32 : isTablet ? 36 : 40}
                  color={partnership.color}
                  style={styles.partnershipIcon}
                />
                <Text style={[
                  styles.partnershipTitle,
                  isDark && styles.partnershipTitleDark,
                  { fontSize: isMobile ? 18 : isTablet ? 20 : 22 }
                ]}>
                  {partnership.title}
                </Text>
                <Text style={[
                  styles.partnershipDescription,
                  isDark && styles.partnershipDescriptionDark,
                  { fontSize: isMobile ? 14 : 15 }
                ]}>
                  {partnership.description}
                </Text>
                
                <View style={styles.benefitsList}>
                  {partnership.benefits.map((benefit, benefitIndex) => (
                    <View key={benefitIndex} style={styles.benefitItem}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={16}
                        color={partnership.color}
                        style={styles.benefitIcon}
                      />
                      <Text style={[
                        styles.benefitText,
                        isDark && styles.benefitTextDark,
                        { fontSize: isMobile ? 12 : 13 }
                      ]}>
                        {benefit}
                      </Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            ))}
          </View>

          {/* Partnership Form Links Container */}
          <Animated.View
            style={[
              styles.partnershipFormLinksContainer,
              {
                opacity: partnershipsAnim,
                transform: [
                  {
                    translateY: partnershipsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0]
                    })
                  }
                ]
              }
            ]}
          >
            {/* Corporate Partnership Form Link */}
            <TouchableOpacity
              style={[
                styles.corporateFormButton,
                isDark && styles.corporateFormButtonDark,
                { marginRight: isMobile ? 0 : 10, marginBottom: isMobile ? 10 : 0 } // Add margin for spacing
              ]}
              onPress={handleCorporatePartnership}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isDark
                  ? ['#3498db', '#2980b9']
                  : ['#3498db', '#2980b9']}
                style={styles.corporateFormGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons
                  name="form-select"
                  size={isMobile ? 20 : 24}
                  color="#ffffff"
                  style={styles.corporateFormIcon}
                />
                <Text style={[
                  styles.corporateFormText,
                  { fontSize: isMobile ? 16 : 18 }
                ]}>
                  Fill this out for Corporate Partnerships
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Municipality Partnership Form Link */}
            <TouchableOpacity
              style={[
                styles.corporateFormButton,
                isDark && styles.corporateFormButtonDark,
                { marginLeft: isMobile ? 0 : 10 } // Add margin for spacing
              ]}
              onPress={handleMunicipalityPartnership}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isDark
                  ? ['#2ecc71', '#27ae60']
                  : ['#2ecc71', '#27ae60']}
                style={styles.corporateFormGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons
                  name="city"
                  size={isMobile ? 20 : 24}
                  color="#ffffff"
                  style={styles.corporateFormIcon}
                />
                <Text style={[
                  styles.corporateFormText,
                  { fontSize: isMobile ? 16 : 18 }
                ]}>
                  Fill this out for Municipality Partnerships
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Enhanced features section with better card layout */}
        <Animated.View
          style={[
            styles.featuresSection,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={[
            styles.sectionTitle,
            isDark && styles.sectionTitleDark,
            { fontSize: isMobile ? 24 : isTablet ? 30 : 36 }
          ]}>
            Our Technology Platform
          </Text>
          <Text style={[
            styles.sectionSubtitle,
            isDark && styles.sectionSubtitleDark,
            { fontSize: isMobile ? 15 : isTablet ? 16 : 18 }
          ]}>
            Cutting-edge solutions designed for scalability and impact
          </Text>

          <View style={[
            styles.featuresGrid,
            {
              flexDirection: isMobile ? 'column' : 'row',
              flexWrap: isMobile ? 'nowrap' : 'wrap'
            }
          ]}>
            {featureCards.map((feature, index) => (
              <Animated.View
                key={`feature-${index}`}
                style={[
                  styles.featureCard,
                  isDark && styles.featureCardDark,
                  {
                    width: isMobile ? '100%' : isTablet ? '48%' : '48%',
                    marginBottom: isMobile ? 20 : 24,
                    opacity: feature.anim,
                    transform: [
                      {
                        scale: feature.anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.7, 1]
                        })
                      },
                      {
                        translateY: feature.anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [40, 0]
                        })
                      }
                    ]
                  }
                ]}
              >
                <View
                  style={[
                    styles.featureCardContent,
                    { padding: isMobile ? 20 : isTablet ? 24 : 28 }
                  ]}
                >
                  <LinearGradient
                    colors={feature.color}
                    style={[
                      styles.featureIconContainer,
                      {
                        width: isMobile ? 56 : isTablet ? 64 : 70,
                        height: isMobile ? 56 : isTablet ? 64 : 70,
                        borderRadius: isMobile ? 18 : isTablet ? 20 : 24
                      }
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons
                      name={feature.icon as any}
                      size={isMobile ? 24 : isTablet ? 28 : 32}
                      color="#ffffff"
                    />
                  </LinearGradient>

                  <Text style={[
                    styles.featureTitle,
                    isDark && styles.featureTitleDark,
                    { fontSize: isMobile ? 16 : isTablet ? 18 : 20 }
                  ]}>
                    {feature.title}
                  </Text>

                  <Text style={[
                    styles.featureDescription,
                    isDark && styles.featureDescriptionDark,
                    { fontSize: isMobile ? 13 : isTablet ? 14 : 15 }
                  ]}>
                    {feature.description}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Enhanced call-to-action section with glassmorphism */}
        <Animated.View
          style={[
            styles.ctaSection,
            {
              opacity: ctaAnim,
              transform: [
                {
                  translateY: ctaAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [60, 0]
                  })
                }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={isDark
              ? ['#1a1a2e', '#16213e', '#0f3460', '#1a1a2e']
              : ['#f8fafc', '#e6f7ff', '#f0f8f5', '#fafafa']}
            style={[
              styles.ctaContainer,
              isDark && styles.ctaContainerDark,
              { padding: isMobile ? 32 : isTablet ? 40 : 48 }
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons
              name="handshake"
              size={isMobile ? 44 : isTablet ? 50 : 56}
              color={isDark ? '#4ecca3' : '#2ecc71'}
              style={styles.ctaIcon}
            />

            <Text style={[
              styles.ctaTitle,
              isDark && styles.ctaTitleDark,
              { fontSize: isMobile ? 22 : isTablet ? 28 : 32 }
            ]}>
              Ready to Partner with Us?
            </Text>

            <Text style={[
              styles.ctaDescription,
              isDark && styles.ctaDescriptionDark,
              { fontSize: isMobile ? 15 : isTablet ? 16 : 17 }
            ]}>
              Join us in revolutionizing waste management and creating a sustainable future.
              Experience our technology firsthand and discover the possibilities.
            </Text>

            {/* Enhanced action buttons with better responsive design */}
            <Animated.View
              style={[
                styles.buttonContainer,
                {
                  transform: [{ translateY: buttonTranslateY }],
                  flexDirection: isMobile ? 'column' : 'row',
                  flexWrap: 'nowrap',
                  gap: isMobile ? 16 : 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: isMobile ? 24 : 32
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  isDark && styles.primaryButtonDark,
                  isMobile && styles.primaryButtonMobile
                ]}
                onPress={handleSignInSignUp}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isDark
                    ? ['#4ecca3', '#44a08d', '#667eea']
                    : ['#00C9FF', '#92FE9D', '#667eea']}
                  style={[
                    styles.buttonGradient,
                    isMobile && styles.buttonGradientMobile
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Animated.View
                    style={{
                      transform: [{ scale: pulseAnim }],
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    <Text style={[
                      styles.primaryButtonText,
                      isDark && styles.primaryButtonTextDark,
                      { fontSize: isMobile ? 16 : 18 }
                    ]}>
                      Sign In / Sign Up
                    </Text>
                    <MaterialCommunityIcons
                      name="login"
                      size={isMobile ? 20 : 22}
                      color={isDark ? '#0f0f23' : '#ffffff'}
                      style={styles.buttonIcon}
                    />
                  </Animated.View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  isDark && styles.secondaryButtonDark,
                  isMobile && styles.secondaryButtonMobile
                ]}
                onPress={handleContinueAsGuest}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.secondaryButtonText,
                  isDark && styles.secondaryButtonTextDark,
                  { fontSize: isMobile ? 16 : 18 }
                ]}>
                  Try Demo
                </Text>
                <MaterialCommunityIcons
                  name="eye"
                  size={isMobile ? 20 : 22}
                  color={isDark ? '#4ecca3' : '#667eea'}
                  style={styles.buttonIcon}
                />
              </TouchableOpacity>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// Main styles (keeping existing styles and adding new ones for landing page)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#0f0f23',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 10,
    zIndex: 1000,
  },
  topBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontWeight: '800',
    color: '#2c3e50',
    letterSpacing: 0.5,
  },
  appNameDark: {
    color: '#ffffff',
  },
  themeToggleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  waveBackground: {
    position: 'absolute',
    top: height * 0.1,
    left: -width * 0.5,
    width: width * 2,
    height: height * 0.3,
    backgroundColor: '#4ecca3',
    borderRadius: width,
  },
  waveBackground2: {
    position: 'absolute',
    top: height * 0.6,
    right: -width * 0.5,
    width: width * 1.8,
    height: height * 0.25,
    backgroundColor: '#667eea',
    borderRadius: width,
  },
  backgroundLeaf: {
    position: 'absolute',
    top: height * 0.15,
    right: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
  },
  secondaryLeaf: {
    position: 'absolute',
    bottom: height * 0.1,
    left: -width * 0.3,
    width: width * 0.6,
    height: width * 0.6,
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: -width,
    width: width * 0.3,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ skewX: '-20deg' }],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: isMobile ? 40 : 60,
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: isMobile ? 20 : isTablet ? 40 : 60,
    marginBottom: isMobile ? 40 : 60,
  },
  logoContainer: {
    marginBottom: isMobile ? 24 : 32,
    alignItems: 'center',
  },
  logoImage: {
    borderRadius: isMobile ? 70 : isTablet ? 85 : 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
  title: {
    fontWeight: '900',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  titleDark: {
    color: '#ffffff',
  },
  subtitle: {
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  subtitleDark: {
    color: '#ffffff',
  },
  description: {
    fontWeight: '400',
    color: '#5a6c7d',
    textAlign: 'center',
    marginBottom: isMobile ? 32 : 40,
    letterSpacing: 0.3,
    opacity: 0.9,
  },
  descriptionDark: {
    color: '#bdc3c7',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryButton: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  primaryButtonDark: {
    shadowColor: '#4ecca3',
    shadowOpacity: 0.3,
  },
  primaryButtonMobile: {
    width: '100%',
    maxWidth: 300,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonGradientMobile: {
    paddingVertical: 18,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  primaryButtonTextDark: {
    color: '#0f0f23',
  },
  secondaryButton: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButtonDark: {
    borderColor: '#4ecca3',
    backgroundColor: 'rgba(78, 204, 163, 0.1)',
    shadowColor: '#4ecca3',
  },
  secondaryButtonMobile: {
    width: '100%',
    maxWidth: 300,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  secondaryButtonTextDark: {
    color: '#4ecca3',
  },
  buttonIcon: {
    marginLeft: 4,
  },
  partnershipsSection: {
    paddingHorizontal: 20,
    marginBottom: 50,
  },
  sectionTitle: {
    fontWeight: '800',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionTitleDark: {
    color: '#ffffff',
  },
  sectionSubtitle: {
    fontWeight: '400',
    color: '#5a6c7d',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  sectionSubtitleDark: {
    color: '#bdc3c7',
  },
  partnershipsGrid: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  partnershipCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  partnershipCardDark: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(78, 204, 163, 0.2)',
  },
  partnershipIcon: {
    marginBottom: 12,
  },
  partnershipTitle: {
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'left',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  partnershipTitleDark: {
    color: '#ffffff',
  },
  partnershipDescription: {
    fontWeight: '400',
    color: '#5a6c7d',
    textAlign: 'left',
    marginBottom: 16,
    letterSpacing: 0.2,
    opacity: 0.9,
    lineHeight: 20,
  },
  partnershipDescriptionDark: {
    color: '#bdc3c7',
  },
  benefitsList: {
    width: '100%',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  benefitIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    fontWeight: '400',
    color: '#7f8c8d',
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  benefitTextDark: {
    color: '#95a5a6',
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 50,
  },
  featuresGrid: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
    overflow: 'hidden',
  },
  featureCardDark: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(78, 204, 163, 0.2)',
  },
  featureCardContent: {
    alignItems: 'flex-start',
  },
  featureIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  featureTitle: {
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  featureTitleDark: {
    color: '#ffffff',
  },
  featureDescription: {
    fontWeight: '400',
    color: '#5a6c7d',
    lineHeight: 20,
    letterSpacing: 0.2,
    opacity: 0.9,
  },
  featureDescriptionDark: {
    color: '#bdc3c7',
  },
  ctaSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  ctaContainer: {
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  ctaContainerDark: {
    borderColor: 'rgba(78, 204, 163, 0.2)',
  },
  ctaIcon: {
    marginBottom: 20,
  },
  ctaTitle: {
    fontWeight: '800',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  ctaTitleDark: {
    color: '#ffffff',
  },
  ctaDescription: {
    fontWeight: '400',
    color: '#5a6c7d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    letterSpacing: 0.3,
    opacity: 0.9,
  },
  ctaDescriptionDark: {
    color: '#bdc3c7',
  },
  partnershipFormLinksContainer: {
    marginTop: 24,
    alignItems: 'center',
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'center',
    width: '100%',
  },
  corporateFormButton: {
    borderRadius: 16,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
    width: isMobile ? '100%' : 'auto',
  },
  corporateFormButtonDark: {
    shadowColor: '#3498db',
    shadowOpacity: 0.3,
  },
  corporateFormGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corporateFormIcon: {
    marginRight: 8,
  },
  corporateFormText: {
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});