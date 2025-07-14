import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  useColorScheme as _useColorScheme,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Modal,
  PixelRatio,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';

// Firebase imports for user authentication
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

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
  | 'gamepad-variant';

interface FeatureCard {
  icon: IconName;
  title: string;
  description: string;
  anim: Animated.Value;
  delay: number;
  color: [string, string, ...string[]];
  category: 'ai' | 'camera' | 'location' | 'analytics' | 'community';
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

interface Statistic {
  value: string;
  label: string;
  icon: IconName;
  anim: Animated.Value;
  color: string;
  description: string;
}

interface MenuItem {
  title: string;
  route: string;
  icon: string;
  description: string;
}

// Enhanced responsive system
const { width, height } = Dimensions.get('window');
const pixelRatio = PixelRatio.get();
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
  if (width < breakpoints.xl) return 'xl';
  if (width < breakpoints.xxl) return 'xxl';
  return 'xxl';
};

const deviceType = getDeviceType();
const isMobile = deviceType === 'xs' || deviceType === 'sm';
const isTablet = deviceType === 'md';
const isDesktop = deviceType === 'xl' || deviceType === 'xxl';

// Performance-optimized particle count
const PARTICLE_COUNT = isMobile ? 12 : isTablet ? 20 : 35;

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

// Helper function to extract first name only
const getFirstName = (fullName: string): string => {
  if (!fullName) return '';
  return fullName.split(' ')[0];
};

// Function to fetch user points from Firebase
const fetchUserPoints = async (userId: string): Promise<number> => {
  try {
    // Ensure db is initialized before use
    if (!db) {
      console.error("Firestore database is not initialized.");
      return 0;
    }
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.points || 0;
    } else {
      return 0;
    }
  } catch (error) {
    console.error("Error fetching user points:", error);
    return 0;
  }
};

// Professional Hamburger Menu Component
const HamburgerMenu = ({
  isDark,
  router,
  isGuestSession
}: {
  isDark: boolean;
  router: any;
  isGuestSession: boolean;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-300)).current;

  const menuItems: MenuItem[] = [
    {
      title: 'Image Capture',
      route: '/(tabs)/next_page',
      icon: 'camera',
      description: 'Capture and analyze waste items'
    },
    {
      title: 'Learn More',
      route: '/(tabs)/learn_more',
      icon: 'book-open-page-variant',
      description: 'Discover recycling tips and guides'
    },
    {
      title: 'Back to Login',
      route: '/',
      icon: 'login',
      description: 'Return to login screen'
    },
    {
      title: 'About the Developer',
      route: '/(tabs)/developer',
      icon: 'face-man-profile',
      description: 'Learn more about the developer of this app, Aarav Rao'
    }
  ];

  const toggleMenu = useCallback(() => {
    const toValue = isMenuOpen ? 0 : 1;
    const slideToValue = isMenuOpen ? -300 : 0;

    if (Platform.OS !== 'web') {
      Vibration.vibrate(30);
    }

    Animated.parallel([
      Animated.timing(menuAnim, {
        toValue,
        duration: 300,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: false,
      }),
      Animated.timing(overlayAnim, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.spring(slideAnim, {
        toValue: slideToValue,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen, menuAnim, overlayAnim, slideAnim]);

  const handleMenuItemPress = useCallback((item: MenuItem) => {
    toggleMenu();
    setTimeout(() => {
      // Pass the guest status when navigating from the menu
      router.push({ pathname: item.route, params: { guest: isGuestSession ? 'true' : 'false' } });
    }, 150);
  }, [router, toggleMenu, isGuestSession]);

  const hamburgerRotation = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <>
      {/* Hamburger Button */}
      <TouchableOpacity
        style={[
          styles.hamburgerButton,
          {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.05)',
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.2)'
              : 'rgba(0, 0, 0, 0.1)',
          }
        ]}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <Animated.View
          style={{
            transform: [{ rotate: hamburgerRotation }],
          }}
        >
          <MaterialCommunityIcons
            name="menu"
            size={24}
            color={isDark ? '#ffffff' : '#2c3e50'}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="none"
        onRequestClose={toggleMenu}
      >
        {/* Overlay */}
        <Animated.View
          style={[
            styles.menuOverlay,
            {
              backgroundColor: `rgba(0, 0, 0, ${overlayAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              })})`,
            }
          ]}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            onPress={toggleMenu}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Menu Content */}
        <Animated.View
          style={[
            styles.menuContainer,
            {
              backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
              transform: [{ translateX: slideAnim }],
              shadowColor: isDark ? '#000' : '#000',
              shadowOffset: { width: 2, height: 0 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 10,
              elevation: 10,
            }
          ]}
        >
          {/* Menu Header */}
          <View style={styles.menuHeader}>
            <Text style={[
              styles.menuTitle,
              { color: isDark ? '#ffffff' : '#2c3e50' }
            ]}>
              Navigation
            </Text>
            <TouchableOpacity
              onPress={toggleMenu}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={isDark ? '#ffffff' : '#2c3e50'}
              />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.menuItems}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.route}
                style={[
                  styles.menuItem,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.02)',
                    borderBottomColor: isDark
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.05)',
                  }
                ]}
                onPress={() => handleMenuItemPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemIcon}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={22}
                    color={isDark ? '#4ecca3' : '#667eea'}
                  />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={[
                    styles.menuItemTitle,
                    { color: isDark ? '#ffffff' : '#2c3e50' }
                  ]}>
                    {item.title}
                  </Text>
                  <Text style={[
                    styles.menuItemDescription,
                    { color: isDark ? '#bdc3c7' : '#5a6c7d' }
                  ]}>
                    {item.description}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={isDark ? '#7f8c8d' : '#95a5a6'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Menu Footer */}
          <View style={styles.menuFooter}>
            <Text style={[
              styles.menuFooterText,
              { color: isDark ? '#7f8c8d' : '#95a5a6' }
            ]}>
              RecyclAI • v1.0
            </Text>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
};

// Enhanced Welcome Section Component with Points Display
const WelcomeSection = ({
  userName,
  userPoints,
  isLoadingUser,
  isDark,
  isMobile,
  isTablet,
  isGuestSession
}: {
  userName: string;
  userPoints: number;
  isLoadingUser: boolean;
  isDark: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isGuestSession: boolean;
}) => {
  // Animation values for enhanced effects
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pointsAnim = useRef(new Animated.Value(0)).current;

  // Get only the first name or 'Guest'
  const displayUserName = isGuestSession ? 'Guest' : getFirstName(userName);

  // Enhanced animation sequence
  useEffect(() => {
    if (displayUserName && !isLoadingUser) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(-50);
      scaleAnim.setValue(0.8);
      pointsAnim.setValue(0);

      // Start entrance animations
      const entranceAnimation = Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(pointsAnim, {
          toValue: 1,
          duration: 1000,
          delay: 400,
          useNativeDriver: true,
        }),
      ]);

      entranceAnimation.start();

      return () => {
        fadeAnim.stopAnimation();
        slideAnim.stopAnimation();
        scaleAnim.stopAnimation();
        pointsAnim.stopAnimation();
      };
    }
  }, [displayUserName, isLoadingUser, userPoints]);

  if (!displayUserName || isLoadingUser) {
    return null;
  }

  return (
    <View style={styles.welcomeSectionContainer}>
      <Animated.Text
        style={[
          styles.welcomeTextLeft,
          {
            fontSize: isMobile ? 18 : isTablet ? 20 : 22,
            color: isDark ? '#ffffff' : '#2c3e50',
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          }
        ]}
      >
        Welcome, {displayUserName}
      </Animated.Text>

      {/* Points Display (conditionally rendered) */}
      {!isGuestSession && (
        <Animated.View
          style={[
            styles.pointsContainer,
            {
              opacity: pointsAnim,
              transform: [
                {
                  translateY: pointsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                },
                { scale: pointsAnim }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={isDark
              ? ['#4ecca3', '#44a08d']
              : ['#00C9FF', '#92FE9D']}
            style={styles.pointsGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons
              name="star"
              size={isMobile ? 16 : 18}
              color="#ffffff"
              style={styles.pointsIcon}
            />
            <Text style={[
              styles.pointsText,
              { fontSize: isMobile ? 14 : 16 }
            ]}>
              {userPoints} Points
            </Text>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { guest } = useLocalSearchParams();
  const isGuestSession = guest === 'true';

  const [isReady, setIsReady] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const { theme, toggleTheme } = useColorScheme();
  const isDark = theme === 'dark';

  // User state for welcome message and points
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userPoints, setUserPoints] = useState<number>(0);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Enhanced animation values with better performance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonTranslateY = useRef(new Animated.Value(50)).current;
  const leafRotate = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current; // This will track scroll position
  const ctaAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Enhanced feature cards with better categorization
  const [featureCards] = useState<FeatureCard[]>([
    {
      icon: 'brain',
      title: 'AI-Powered Recognition',
      description: 'Advanced neural networks instantly identify and classify waste materials with more than 96% accuracy across 1000+ material types using computer vision.',
      anim: new Animated.Value(0),
      delay: 200,
      color: ['#667eea', '#764ba2', '#f093fb'],
      category: 'ai'
    },
    {
      icon: 'camera',
      title: 'Smart Camera Integration',
      description: 'Real-time image processing with augmented reality overlays provides instant feedback and sorting guidance through your device camera.',
      anim: new Animated.Value(0),
      delay: 300,
      color: ['#f093fb', '#f5576c', '#fa709a'],
      category: 'camera'
    },
    {
      icon: 'map-marker',
      title: 'Location Intelligence',
      description: 'Find nearby recycling centers, drop-off points, and collection schedules with real-time availability and route optimization.',
      anim: new Animated.Value(0),
      delay: 400,
      color: ['#00C9FF', '#92FE9D', '#4ecca3'],
      category: 'location'
    },
    {
      icon: 'trending-up',
      title: 'Progress Analytics',
      description: 'Monitor your environmental impact with detailed analytics, carbon footprint calculations, and sustainability goal tracking.',
      anim: new Animated.Value(0),
      delay: 500,
      color: ['#a8edea', '#fed6e3', '#fee140'],
      category: 'analytics'
    },
    {
      icon: 'account-group',
      title: 'Community Hub',
      description: 'Connect with eco-warriors worldwide, share achievements, participate in challenges, and collaborate on sustainability initiatives.',
      anim: new Animated.Value(0),
      delay: 600,
      color: ['#4facfe', '#00f2fe', '#667eea'],
      category: 'community'
    },
    {
      icon: 'sparkles',
      title: 'Smart Rewards',
      description: 'Earn points, badges, and real rewards for your recycling efforts. Gamification makes sustainability engaging and fun.',
      anim: new Animated.Value(0),
      delay: 700,
      color: ['#fa709a', '#fee140', '#f093fb'],
      category: 'community'
    }
  ]);

  // Enhanced statistics with better data
  const [statistics] = useState<Statistic[]>([
    {
      value: '500+',
      label: 'Items Recycled',
      icon: 'recycle',
      anim: new Animated.Value(0),
      color: '#2ecc71',
      description: 'Successfully processed'
    },
    {
      value: '80+',
      label: 'Active Users',
      icon: 'account-group',
      anim: new Animated.Value(0),
      color: '#3498db',
      description: 'Worldwide community'
    },
    {
      value: '96+%'
      ,label: 'Accuracy Rate',
      icon: 'target',
      anim: new Animated.Value(0),
      color: '#e74c3c',
      description: 'AI recognition precision'
    },
    {
      value: '1000+',
      label: 'Material Types',
      icon: 'eye',
      anim: new Animated.Value(0),
      color: '#f39c12',
      description: 'Recognized categories'
    },
    {
      value: '5',
      label: 'CO₂ Saved',
      icon: 'leaf',
      anim: new Animated.Value(0),
      color: '#27ae60',
      description: 'Tons of emissions reduced'
    },
    {
      value: '24/7',
      label: 'Support',
      icon: 'clock-fast',
      anim: new Animated.Value(0),
      color: '#9b59b6',
      description: 'Always available'
    }
  ]);

  // Enhanced particle system with different shapes
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

  // Enhanced user authentication effect with points fetching
  useEffect(() => {
    if (isGuestSession) {
      setUser(null);
      setUserName('Guest');
      setUserPoints(0);
      setIsLoadingUser(false);
      return; // Skip Firebase auth for guest sessions
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setIsLoadingUser(true);

      if (user) {
        try {
          // Try to get display name from auth first
          if (user.displayName) {
            setUserName(user.displayName);
          } else {
            // Fallback to Firestore document
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserName(userData.name || 'User');
            } else {
              setUserName('User');
            }
          }

          // Fetch user points
          const points = await fetchUserPoints(user.uid);
          setUserPoints(points);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserName('User');
          setUserPoints(0);
        }
      } else {
        setUserName('');
        setUserPoints(0);
      }

      setIsLoadingUser(false);
    });

    return () => unsubscribe();
  }, [isGuestSession]);

  // Function to refresh user points (can be called when returning from other screens)
  const refreshUserPoints = useCallback(async () => {
    if (user && !isGuestSession) {
      try {
        const points = await fetchUserPoints(user.uid);
        setUserPoints(points);
      } catch (error) {
        console.error('Error refreshing user points:', error);
      }
    }
  }, [user, isGuestSession]);

  // Refresh points when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshUserPoints();
    }, [refreshUserPoints])
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

  const animateStatistics = useCallback(() => {
    setTimeout(() => {
      Animated.timing(statsAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      statistics.forEach((stat, index) => {
        setTimeout(() => {
          Animated.spring(stat.anim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }, index * 150);
      });
    }, 1000);
  }, [statistics, statsAnim]);

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
  useFocusEffect(
    useCallback(() => {
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
          animateStatistics();
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
        // Cleanup animations on unfocus
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
        statsAnim.stopAnimation();

        particles.forEach(particle => particle.anim.stopAnimation());
        featureCards.forEach(card => card.anim.stopAnimation());
        statistics.forEach(stat => stat.anim.stopAnimation());
      };
    }, [])
  );

  // Animated value for header background opacity
  const headerBackgroundOpacity = scrollY.interpolate({
    inputRange: [0, 50], // Adjust 50 as needed for scroll threshold
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
  const handleGetStarted = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }
    router.push('/(tabs)/next_page');
  }, [router]);

  const handleLearnMore = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(30);
    }
    // Pass the guest status when navigating to learn_more
    router.push({ pathname: '/(tabs)/learn_more', params: { guest: isGuestSession ? 'true' : 'false' } });
  }, [router, isGuestSession]);

  const handlePlayGame = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(40);
    }
    router.push('/(tabs)/game');
  }, [router]);

  const handleViewStats = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(35);
    }
    router.push('/(tabs)/stats');
  }, [router]);

  const handleFeaturePress = useCallback((feature: FeatureCard) => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(30);
    }
    Alert.alert(
      feature.title,
      feature.description,
      [{ text: 'Got it!', style: 'default' }]
    );
  }, []);

  const handleSignInSignUp = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }
    router.push('/'); // Assuming '/' is your login.tsx route
  }, [router]);

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
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={isDark ? "#0f0f23" : "#ffffff"}
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
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0f0f23" : "#ffffff"}
        translucent={false}
      />

      {/* Top Bar with Welcome on Left, Theme Toggle and Hamburger on Right */}
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
        {/* Welcome Text on Left */}
        <View style={styles.leftSection}>
          <WelcomeSection
            userName={userName}
            userPoints={userPoints}
            isLoadingUser={isLoadingUser}
            isDark={isDark}
            isMobile={isMobile}
            isTablet={isTablet}
            isGuestSession={isGuestSession}
          />
        </View>

        {/* Right Section with Theme Toggle and Hamburger */}
        <View style={styles.rightSection}>
          {/* Theme Toggle Button to the left of hamburger */}
          <TouchableOpacity
            style={[
              styles.themeToggleButtonRight,
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

          {/* Hamburger Menu */}
          <HamburgerMenu isDark={isDark} router={router} isGuestSession={isGuestSession} />
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
          // Adjust paddingTop based on the height of your topBar
          // Assuming topBar height is around 100-120 (50-70 for top + padding)
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
        {/* The rest of your scrollable content goes here */}
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
                  width: isMobile ? 120 : isTablet ? 150 : 180,
                  height: isMobile ? 120 : isTablet ? 150 : 180
                }
              ]}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Enhanced subtitle with better typography */}
          <Animated.Text
            style={[
              styles.subtitle,
              isDark && styles.subtitleDark,
              {
                opacity: fadeAnim,
                fontSize: isMobile ? 18 : isTablet ? 20 : 22,
                lineHeight: isMobile ? 26 : isTablet ? 30 : 36
              }
            ]}
          >
            Revolutionizing Recycling with Next-Generation AI Technology
          </Animated.Text>

          {/* Enhanced description with better readability */}
          <Animated.Text
            style={[
              styles.description,
              isDark && styles.descriptionDark,
              {
                opacity: fadeAnim,
                fontSize: isMobile ? 14 : isTablet ? 15 : 17,
                lineHeight: isMobile ? 22 : isTablet ? 24 : 28
              }
            ]}
          >
            Experience the future of sustainable living with our advanced AI-powered platform.
            Smart recognition and real-time guidance
            make recycling effortless and rewarding for everyone.
          </Animated.Text>

          {/* Enhanced action buttons with better responsive design */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                transform: [{ translateY: buttonTranslateY }],
                flexDirection: isMobile ? 'column' : 'row',
                flexWrap: isMobile ? 'nowrap' : 'wrap',
                gap: isMobile ? 16 : 20,
                justifyContent: 'center',
                alignItems: 'center'
              }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.primaryButton,
                isDark && styles.primaryButtonDark,
                isMobile && styles.primaryButtonMobile
              ]}
              onPress={handleGetStarted}
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
                    { fontSize: isMobile ? 15 : 17 }
                  ]}>
                    Get Started
                  </Text>
                  <MaterialCommunityIcons
                    name="rocket-launch"
                    size={isMobile ? 18 : 20}
                    color={isDark ? "#0f0f23" : "#ffffff"}
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
              onPress={handleLearnMore}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.secondaryButtonText,
                isDark && styles.secondaryButtonTextDark,
                { fontSize: isMobile ? 15 : 17 }
              ]}>
                Learn More
              </Text>
            </TouchableOpacity>

            {/* Conditionally render the Play Game button */}
            {!isGuestSession && (
              <TouchableOpacity
                style={[
                  styles.gameButton,
                  isDark && styles.gameButtonDark,
                  isMobile && styles.gameButtonMobile
                ]}
                onPress={handlePlayGame}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isDark
                    ? ['#9b59b6', '#8e44ad', '#e74c3c']
                    : ['#e74c3c', '#f39c12', '#9b59b6']}
                  style={[
                    styles.gameButtonGradient,
                    isMobile && styles.gameButtonGradientMobile
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={[
                    styles.gameButtonText,
                    isDark && styles.gameButtonTextDark,
                    { fontSize: isMobile ? 15 : 17 }
                  ]}>
                    Play Game
                  </Text>
                  <MaterialCommunityIcons
                    name="gamepad-variant"
                    size={isMobile ? 18 : 20}
                    color="#ffffff"
                    style={styles.buttonIcon}
                  />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Conditionally render the View Stats button */}
            {!isGuestSession && (
              <TouchableOpacity
                style={[
                  styles.statsButton,
                  isDark && styles.statsButtonDark,
                  isMobile && styles.statsButtonMobile
                ]}
                onPress={handleViewStats}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isDark
                    ? ['#667eea', '#764ba2', '#f093fb']
                    : ['#667eea', '#764ba2', '#f093fb']}
                  style={[
                    styles.statsButtonGradient,
                    isMobile && styles.statsButtonGradientMobile
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={[
                    styles.statsButtonText,
                    isDark && styles.statsButtonTextDark,
                    { fontSize: isMobile ? 15 : 17 }
                  ]}>
                    View Stats
                  </Text>
                  <MaterialCommunityIcons
                    name="chart-line"
                    size={isMobile ? 18 : 20}
                    color="#ffffff"
                    style={styles.buttonIcon}
                  />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* New: Want more features? section */}
          {isGuestSession && (
            <Animated.View
              style={[
                styles.moreFeaturesSection,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })
                    }
                  ]
                }
              ]}
            >
              <Text style={[
                styles.moreFeaturesText,
                isDark && styles.moreFeaturesTextDark
              ]}>
                Want more features?
              </Text>
              <TouchableOpacity
                style={[
                  styles.signInSignUpButton,
                  isDark && styles.signInSignUpButtonDark
                ]}
                onPress={handleSignInSignUp}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isDark
                    ? ['#4ecca3', '#44a08d']
                    : ['#00C9FF', '#92FE9D']}
                  style={styles.signInSignUpButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={[
                    styles.signInSignUpButtonText,
                    isDark && styles.signInSignUpButtonTextDark
                  ]}>
                    Sign In / Sign Up
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>

        {/* Enhanced statistics section with better grid layout */}
        <Animated.View
          style={[
            styles.statisticsSection,
            {
              opacity: statsAnim,
              transform: [
                {
                  translateY: statsAnim.interpolate({
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
            Trusted by Eco-Warriors Nationwide
          </Text>
          <Text style={[
            styles.sectionSubtitle,
            isDark && styles.sectionSubtitleDark,
            { fontSize: isMobile ? 15 : isTablet ? 16 : 18 }
          ]}>
            Join the global movement towards sustainable living
          </Text>

          <View style={[
            styles.statisticsGrid,
            {
              flexDirection: isMobile ? 'column' : 'row',
              flexWrap: isMobile ? 'nowrap' : 'wrap'
            }
          ]}>
            {statistics.map((stat, index) => (
              <Animated.View
                key={`stat-${index}`}
                style={[
                  styles.statisticCard,
                  isDark && styles.statisticCardDark,
                  {
                    width: isMobile ? '100%' : isTablet ? '48%' : '31%',
                    marginBottom: isMobile ? 16 : 20,
                    opacity: stat.anim,
                    transform: [
                      {
                        scale: stat.anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.7, 1]
                        })
                      },
                      {
                        translateY: stat.anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0]
                        })
                      }
                    ]
                  }
                ]}
              >
                <MaterialCommunityIcons
                  name={stat.icon as any}
                  size={isMobile ? 28 : isTablet ? 32 : 36}
                  color={stat.color}
                  style={styles.statisticIcon}
                />
                <Text style={[
                  styles.statisticValue,
                  isDark && styles.statisticValueDark,
                  { fontSize: isMobile ? 22 : isTablet ? 26 : 28 }
                ]}>
                  {stat.value}
                </Text>
                <Text style={[
                  styles.statisticLabel,
                  isDark && styles.statisticLabelDark,
                  { fontSize: isMobile ? 12 : 13 }
                ]}>
                  {stat.label}
                </Text>
                <Text style={[
                  styles.statisticDescription,
                  isDark && styles.statisticDescriptionDark,
                  { fontSize: isMobile ? 10 : 11 }
                ]}>
                  {stat.description}
                </Text>
              </Animated.View>
            ))}
          </View>
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
            Powerful AI Features for Smart Recycling
          </Text>
          <Text style={[
            styles.sectionSubtitle,
            isDark && styles.sectionSubtitleDark,
            { fontSize: isMobile ? 15 : isTablet ? 16 : 18 }
          ]}>
            Discover how our cutting-edge technology makes recycling effortless, intelligent, and rewarding
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
                <TouchableOpacity
                  onPress={() => handleFeaturePress(feature)}
                  activeOpacity={0.8}
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

                  {/* Removed the arrow icon from here */}
                  {/*
                  <View style={[
                    styles.featureArrow,
                    isDark && styles.featureArrowDark,
                    {
                      width: isMobile ? 32 : 36,
                      height: isMobile ? 32 : 36,
                      borderRadius: isMobile ? 16 : 18
                    }
                  ]}>
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={isMobile ? 16 : 18}
                      color={isDark ? "#4ecca3" : "#667eea"}
                    />
                  </View>
                  */}
                </TouchableOpacity>
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
              name="earth"
              size={isMobile ? 44 : isTablet ? 50 : 56}
              color={isDark ? "#4ecca3" : "#2ecc71"}
              style={styles.ctaIcon}
            />

            <Text style={[
              styles.ctaTitle,
              isDark && styles.ctaTitleDark,
              { fontSize: isMobile ? 22 : isTablet ? 28 : 32 }
            ]}>
              Ready to Transform Your Impact?
            </Text>

            <Text style={[
              styles.ctaDescription,
              isDark && styles.ctaDescriptionDark,
              { fontSize: isMobile ? 15 : isTablet ? 16 : 17 }
            ]}>
              Join millions of eco-warriors worldwide and start your journey towards a more sustainable future today.
              Every action counts, every choice matters.
            </Text>

            <TouchableOpacity
              style={[
                styles.ctaButton,
                isDark && styles.ctaButtonDark,
                isMobile && styles.ctaButtonMobile
              ]}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isDark
                  ? ['#4ecca3', '#44a08d', '#667eea']
                  : ['#00C9FF', '#92FE9D', '#667eea']}
                style={[
                  styles.ctaButtonGradient,
                  isMobile && styles.ctaButtonGradientMobile
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[
                  styles.ctaButtonText,
                  isDark && styles.ctaButtonTextDark,
                  { fontSize: isMobile ? 16 : 18 }
                ]}>
                  Start Your Journey
                </Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={isMobile ? 20 : 22}
                  color={isDark ? "#0f0f23" : "#ffffff"}
                  style={styles.buttonIcon}
                />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// Main styles (keeping existing styles and adding new ones for repositioned layout)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#0f0f23',
  },
  topBar: {
    position: 'absolute', // Keep absolute for fixed positioning relative to parent View
    top: 0, // Align to the very top
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30, // Adjust this based on safe area/status bar
    paddingBottom: 10, // Add some padding at the bottom of the header
    // backgroundColor will be animated
    zIndex: 1000,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  welcomeSectionContainer: {
    alignItems: 'flex-start',
  },
  welcomeTextLeft: {
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'left',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pointsContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pointsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pointsIcon: {
    marginRight: 6,
  },
  pointsText: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  themeToggleButtonRight: {
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
  hamburgerButton: {
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
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 20,
  },
  welcomeText: {
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  themeToggleContainer: {
    alignItems: 'center',
  },
  themeToggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTouchable: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItems: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 13,
    opacity: 0.7,
  },
  menuFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuFooterText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.6,
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
    borderRadius: isMobile ? 60 : isTablet ? 75 : 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
  darkModeLogo: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4ecca3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: isMobile ? 60 : isTablet ? 75 : 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: isMobile ? 16 : 20,
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
    borderRadius: isMobile ? 16 : 20,
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
    maxWidth: 280,
  },
  buttonGradient: {
    paddingVertical: isMobile ? 16 : 18,
    paddingHorizontal: isMobile ? 32 : 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonGradientMobile: {
    paddingVertical: 18,
  },
  primaryButtonText: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  primaryButtonTextDark: {
    color: '#0f0f23',
  },
  secondaryButton: {
    borderRadius: isMobile ? 16 : 20,
    borderWidth: 2,
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingVertical: isMobile ? 14 : 16,
    paddingHorizontal: isMobile ? 28 : 36,
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
    maxWidth: 280,
  },
  secondaryButtonText: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: '600',
    color: '#667eea',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  secondaryButtonTextDark: {
    color: '#4ecca3',
  },
  gameButton: {
    borderRadius: isMobile ? 16 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  gameButtonDark: {
    shadowColor: '#9b59b6',
    shadowOpacity: 0.3,
  },
  gameButtonMobile: {
    width: '100%',
    maxWidth: 280,
  },
  gameButtonGradient: {
    paddingVertical: isMobile ? 16 : 18,
    paddingHorizontal: isMobile ? 32 : 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  gameButtonGradientMobile: {
    paddingVertical: 18,
  },
  gameButtonText: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  gameButtonTextDark: {
    color: '#ffffff',
  },
  statsButton: {
    borderRadius: isMobile ? 16 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  statsButtonDark: {
    shadowColor: '#667eea',
    shadowOpacity: 0.3,
  },
  statsButtonMobile: {
    width: '100%',
    maxWidth: 280,
  },
  statsButtonGradient: {
    paddingVertical: isMobile ? 16 : 18,
    paddingHorizontal: isMobile ? 32 : 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  statsButtonGradientMobile: {
    paddingVertical: 18,
  },
  statsButtonText: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  statsButtonTextDark: {
    color: '#ffffff',
  },
  buttonIcon: {
    marginLeft: 4,
  },
  moreFeaturesSection: {
    marginTop: isMobile ? 30 : 40,
    marginBottom: isMobile ? 30 : 40,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: isMobile ? 20 : 0,
  },
  moreFeaturesText: {
    fontSize: isMobile ? 18 : 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  moreFeaturesTextDark: {
    color: '#ffffff',
  },
  signInSignUpButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: isMobile ? '100%' : 250,
    maxWidth: 280,
  },
  signInSignUpButtonDark: {
    shadowColor: '#4ecca3',
    shadowOpacity: 0.2,
  },
  signInSignUpButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInSignUpButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  signInSignUpButtonTextDark: {
    color: '#0f0f23',
  },
  statisticsSection: {
    paddingHorizontal: isMobile ? 20 : isTablet ? 40 : 60,
    marginBottom: isMobile ? 50 : 70,
  },
  sectionTitle: {
    fontWeight: '800',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: isMobile ? 12 : 16,
    letterSpacing: 0.5,
  },
  sectionTitleDark: {
    color: '#ffffff',
  },
  sectionSubtitle: {
    fontWeight: '400',
    color: '#5a6c7d',
    textAlign: 'center',
    marginBottom: isMobile ? 32 : 40,
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  sectionSubtitleDark: {
    color: '#bdc3c7',
  },
  statisticsGrid: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statisticCard: {
    backgroundColor: '#ffffff',
    borderRadius: isMobile ? 16 : 20,
    padding: isMobile ? 20 : 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  statisticCardDark: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(78, 204, 163, 0.2)',
  },
  statisticIcon: {
    marginBottom: isMobile ? 12 : 16,
  },
  statisticValue: {
    fontWeight: '800',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: isMobile ? 6 : 8,
    letterSpacing: 0.5,
  },
  statisticValueDark: {
    color: '#ffffff',
  },
  statisticLabel: {
    fontWeight: '600',
    color: '#667eea',
    textAlign: 'center',
    marginBottom: isMobile ? 4 : 6,
    letterSpacing: 0.3,
  },
  statisticLabelDark: {
    color: '#4ecca3',
  },
  statisticDescription: {
    fontWeight: '400',
    color: '#7f8c8d',
    textAlign: 'center',
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  statisticDescriptionDark: {
    color: '#95a5a6',
  },
  featuresSection: {
    paddingHorizontal: isMobile ? 20 : isTablet ? 40 : 60,
    marginBottom: isMobile ? 50 : 70,
  },
  featuresGrid: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: isMobile ? 20 : 24,
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
    marginBottom: isMobile ? 16 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  featureTitle: {
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: isMobile ? 12 : 16,
    letterSpacing: 0.3,
  },
  featureTitleDark: {
    color: '#ffffff',
  },
  featureDescription: {
    fontWeight: '400',
    color: '#5a6c7d',
    lineHeight: isMobile ? 20 : 22,
    marginBottom: isMobile ? 16 : 20,
    letterSpacing: 0.2,
    opacity: 0.9,
  },
  featureDescriptionDark: {
    color: '#bdc3c7',
  },
  featureArrow: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  featureArrowDark: {
    backgroundColor: 'rgba(78, 204, 163, 0.2)',
  },
  ctaSection: {
    paddingHorizontal: isMobile ? 20 : isTablet ? 40 : 60,
    marginBottom: isMobile ? 40 : 60,
  },
  ctaContainer: {
    borderRadius: isMobile ? 24 : 32,
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
    marginBottom: isMobile ? 20 : 24,
  },
  ctaTitle: {
    fontWeight: '800',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: isMobile ? 16 : 20,
    letterSpacing: 0.5,
  },
  ctaTitleDark: {
    color: '#ffffff',
  },
  ctaDescription: {
    fontWeight: '400',
    color: '#5a6c7d',
    textAlign: 'center',
    lineHeight: isMobile ? 24 : 26,
    marginBottom: isMobile ? 28 : 32,
    letterSpacing: 0.3,
    opacity: 0.9,
  },
  ctaDescriptionDark: {
    color: '#bdc3c7',
  },
  ctaButton: {
    borderRadius: isMobile ? 18 : 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  ctaButtonDark: {
    shadowColor: '#4ecca3',
    shadowOpacity: 0.3,
  },
  ctaButtonMobile: {
    width: '100%',
    maxWidth: 300,
  },
  ctaButtonGradient: {
    paddingVertical: isMobile ? 18 : 20,
    paddingHorizontal: isMobile ? 36 : 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  ctaButtonGradientMobile: {
    paddingVertical: 18,
  },
  ctaButtonText: {
    fontSize: isMobile ? 17 : 19,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  ctaButtonTextDark: {
    color: '#0f0f23',
  },
});