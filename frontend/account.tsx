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

// Firebase stuff - took me forever to set this up properly
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Icon types - probably overkill but TypeScript was complaining
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

// Screen dimensions - basic responsive stuff
const { width, height } = Dimensions.get('window');
const pixelRatio = PixelRatio.get();
const isWeb = Platform.OS === 'web';

// Breakpoints for different screen sizes
// copied these from Bootstrap lol
const breakpoints = {
  xs: 0,      
  sm: 576,    
  md: 768,    
  lg: 992,    
  xl: 1200,   
  xxl: 1400   
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

// Particle count - had to reduce this because Android was lagging
const PARTICLE_COUNT = isMobile ? 8 : isTablet ? 12 : 20;

// Custom color scheme hook because the default one is kinda basic
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
      // little haptic feedback - feels nice
      if (Platform.OS !== 'web') {
        Vibration.vibrate(50);
      }
      return newTheme;
    });
  }, []);

  return { theme, toggleTheme };
};

// Helper to get just the first name - nobody wants to see "John Michael Smith" everywhere
const getFirstName = (fullName: string): string => {
  if (!fullName) return '';
  return fullName.split(' ')[0];
};

// Fetch user points from Firebase
const fetchUserPoints = async (userId: string): Promise<number> => {
  try {
    // safety check - learned this the hard way when db was undefined
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
    return 0; // fail gracefully
  }
};

// Hamburger menu component - spent way too much time making this smooth
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

    // haptic feedback feels good
    if (Platform.OS !== 'web') {
      Vibration.vibrate(30);
    }

    // parallel animations for smooth effect
    Animated.parallel([
      Animated.timing(menuAnim, {
        toValue,
        duration: 300,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // custom easing curve
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
    // small delay so the menu closes smoothly before navigation
    setTimeout(() => {
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
        {/* Overlay - tap to close */}
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
              elevation: 10, // Android shadow
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


// Welcome section with points display - this was fun to build
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
  // Animation refs - probably overkill but looks cool
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pointsAnim = useRef(new Animated.Value(0)).current;

  // Get first name only or show 'Guest'
  const displayUserName = isGuestSession ? 'Guest' : getFirstName(userName);

  // Entrance animations - took me a while to get the timing right
  useEffect(() => {
    if (displayUserName && !isLoadingUser) {
      // reset everything first
      fadeAnim.setValue(0);
      slideAnim.setValue(-50);
      scaleAnim.setValue(0.8);
      pointsAnim.setValue(0);

      // start the show!
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
          delay: 400, // delay the points animation a bit
          useNativeDriver: true,
        }),
      ]);

      entranceAnimation.start();

      // cleanup function
      return () => {
        fadeAnim.stopAnimation();
        slideAnim.stopAnimation();
        scaleAnim.stopAnimation();
        pointsAnim.stopAnimation();
      };
    }
  }, [displayUserName, isLoadingUser, userPoints]);

  if (!displayUserName || isLoadingUser) {
    return null; // don't show anything while loading
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

      {/* Points Display - only show for logged in users */}
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

// Main home screen component
export default function HomeScreen() {
  const router = useRouter();
  const { guest } = useLocalSearchParams();
  const isGuestSession = guest === 'true';

  const [isReady, setIsReady] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const { theme, toggleTheme } = useColorScheme();
  const isDark = theme === 'dark';

  // User state stuff
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userPoints, setUserPoints] = useState<number>(0);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Animation values - lots of them for smooth effects
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonTranslateY = useRef(new Animated.Value(50)).current;
  const leafRotate = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Particle system state - because why not add some flair
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleAnimations = useRef<Animated.CompositeAnimation[]>([]);

  // Statistics data - these numbers are probably made up lol
  // TODO: connect to real analytics API when we have one
  const [statistics] = useState<Statistic[]>([
    {
      value: '2.5M+',
      label: 'Items Recycled',
      icon: 'recycle',
      anim: new Animated.Value(0),
      color: '#4ecca3',
      description: 'Total waste items processed'
    },
    {
      value: '150K+',
      label: 'Active Users',
      icon: 'account-group',
      anim: new Animated.Value(0),
      color: '#667eea',
      description: 'Community members worldwide'
    },
    {
      value: '89%',
      label: 'Accuracy Rate',
      icon: 'target',
      anim: new Animated.Value(0),
      color: '#f093fb',
      description: 'AI classification precision'
    },
    {
      value: '45+',
      label: 'Countries',
      icon: 'earth',
      anim: new Animated.Value(0),
      color: '#ffeaa7',
      description: 'Global reach and impact'
    }
  ]);

  // Feature cards data
  const [featureCards] = useState<FeatureCard[]>([
    {
      icon: 'camera',
      title: 'Smart Camera',
      description: 'AI-powered waste classification with real-time analysis',
      anim: new Animated.Value(0),
      delay: 0,
      color: ['#667eea', '#764ba2'],
      category: 'camera'
    },
    {
      icon: 'brain',
      title: 'AI Recognition',
      description: 'Advanced machine learning for accurate waste sorting',
      anim: new Animated.Value(0),
      delay: 100,
      color: ['#f093fb', '#f5576c'],
      category: 'ai'
    },
    {
      icon: 'map-marker',
      title: 'Location Finder',
      description: 'Find nearby recycling centers and drop-off points',
      anim: new Animated.Value(0),
      delay: 200,
      color: ['#4ecca3', '#44a08d'],
      category: 'location'
    },
    {
      icon: 'chart-line',
      title: 'Impact Tracking',
      description: 'Monitor your environmental impact and progress',
      anim: new Animated.Value(0),
      delay: 300,
      color: ['#ffeaa7', '#fab1a0'],
      category: 'analytics'
    },
    {
      icon: 'account-group',
      title: 'Community',
      description: 'Connect with eco-conscious users worldwide',
      anim: new Animated.Value(0),
      delay: 400,
      color: ['#a8edea', '#fed6e3'],
      category: 'community'
    }
  ]);

  // Initialize particles on mount
  useEffect(() => {
    initializeParticles();
    return () => {
      // cleanup animations - important to prevent memory leaks
      particleAnimations.current.forEach(anim => anim.stop());
    };
  }, []);

  // Particle initialization - this was fun to code
  // originally had way more particles but it was killing performance on older devices
  const initializeParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const colors = ['#667eea', '#f093fb', '#4ecca3', '#ffeaa7', '#a8edea'];
    const types: ('circle' | 'star' | 'diamond')[] = ['circle', 'star', 'diamond'];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle: Particle = {
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.3 + 0.1,
        direction: Math.random() * Math.PI * 2,
        anim: new Animated.Value(0),
        color: colors[Math.floor(Math.random() * colors.length)],
        type: types[Math.floor(Math.random() * types.length)]
      };
      newParticles.push(particle);
    }

    setParticles(newParticles);
    animateParticles(newParticles);
  }, []);

  // Particle animation loop
  const animateParticles = useCallback((particleArray: Particle[]) => {
    particleArray.forEach((particle, index) => {
      const animateParticle = () => {
        Animated.timing(particle.anim, {
          toValue: 1,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }).start(() => {
          particle.anim.setValue(0);
          animateParticle(); // loop it
        });
      };
      
      // stagger the start times
      setTimeout(() => animateParticle(), index * 100);
    });
  }, []);

  // Auth state listener - Firebase stuff
  useEffect(() => {
    if (isGuestSession) {
      setIsLoadingUser(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setUserName(user.displayName || '');
        
        // fetch user points
        try {
          const points = await fetchUserPoints(user.uid);
          setUserPoints(points);
        } catch (error) {
          console.error('Failed to fetch user points:', error);
        }
      } else {
        setUser(null);
        setUserName('');
        setUserPoints(0);
      }
      setIsLoadingUser(false);
    });

    return () => unsubscribe();
  }, [isGuestSession]);

  // Focus effect for screen transitions
  useFocusEffect(
    useCallback(() => {
      if (!isReady) {
        startEntranceAnimations();
        setIsReady(true);
      }
    }, [isReady])
  );

  // Main entrance animations
  const startEntranceAnimations = useCallback(() => {
    // reset all animations
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    buttonTranslateY.setValue(50);
    
    // reset feature cards
    featureCards.forEach(card => card.anim.setValue(0));
    statistics.forEach(stat => stat.anim.setValue(0));

    // start the entrance sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(100, [
        ...featureCards.map(card =>
          Animated.spring(card.anim, {
            toValue: 1,
            friction: 8,
            tension: 100,
            useNativeDriver: true,
          })
        ),
        Animated.spring(buttonTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(50, 
        statistics.map(stat =>
          Animated.spring(stat.anim, {
            toValue: 1,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();

    // start continuous animations
    startContinuousAnimations();
  }, [featureCards, statistics]);

  // Continuous background animations
  const startContinuousAnimations = useCallback(() => {
    // floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // leaf rotation
    Animated.loop(
      Animated.timing(leafRotate, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Navigation handlers
  const handleCameraPress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50); // haptic feedback
    }
    // could add analytics tracking here later
    // Analytics.track('camera_button_pressed');
    router.push({
      pathname: '/(tabs)/next_page',
      params: { guest: isGuestSession ? 'true' : 'false' }
    });
  }, [router, isGuestSession]);

  const handleLearnMorePress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }
    router.push({
      pathname: '/(tabs)/learn_more',
      params: { guest: isGuestSession ? 'true' : 'false' }
    });
  }, [router, isGuestSession]);

  // Scroll handler for parallax effects
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const currentOffset = event.nativeEvent.contentOffset.y;
        setIsScrolling(currentOffset > 50);
      },
    }
  );

  // Dynamic styles based on scroll position
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f0f23' : '#f8f9fa' }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0f0f23' : '#f8f9fa'}
        translucent={false}
      />

      {/* Hamburger Menu */}
      <HamburgerMenu
        isDark={isDark}
        router={router}
        isGuestSession={isGuestSession}
      />

      {/* Theme Toggle Button */}
      <TouchableOpacity
        style={[
          styles.themeToggle,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          }
        ]}
        onPress={toggleTheme}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name={isDark ? 'weather-sunny' : 'weather-night'}
          size={24}
          color={isDark ? '#ffeaa7' : '#2c3e50'}
        />
      </TouchableOpacity>

      {/* Particle Background */}
      <View style={styles.particleContainer}>
        {particles.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                opacity: particle.opacity,
                transform: [
                  {
                    translateY: particle.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -100],
                    }),
                  },
                  {
                    scale: particle.anim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 1, 0],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header Section */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerOpacity,
              transform: [{ scale: headerScale }],
            },
          ]}
        >
          {/* Welcome Section */}
          <WelcomeSection
            userName={userName}
            userPoints={userPoints}
            isLoadingUser={isLoadingUser}
            isDark={isDark}
            isMobile={isMobile}
            isTablet={isTablet}
            isGuestSession={isGuestSession}
          />

          {/* Main Title */}
          <Animated.View
            style={[
              styles.titleContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.titleRow}>
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: leafRotate.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                }}
              >
                <MaterialCommunityIcons
                  name="leaf"
                  size={isMobile ? 32 : isTablet ? 36 : 40}
                  color={isDark ? '#4ecca3' : '#27ae60'}
                  style={styles.leafIcon}
                />
              </Animated.View>
              <Text style={[
                styles.title,
                {
                  fontSize: isMobile ? 28 : isTablet ? 32 : 36,
                  color: isDark ? '#ffffff' : '#2c3e50',
                }
              ]}>
                RecyclAI
              </Text>
            </View>
            <Text style={[
              styles.subtitle,
              {
                fontSize: isMobile ? 16 : isTablet ? 18 : 20,
                color: isDark ? '#bdc3c7' : '#5a6c7d',
              }
            ]}>
              Smart Waste Classification & Recycling Guide
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Feature Cards Section */}
        <View style={styles.featuresSection}>
          <Text style={[
            styles.sectionTitle,
            {
              fontSize: isMobile ? 22 : isTablet ? 24 : 26,
              color: isDark ? '#ffffff' : '#2c3e50',
            }
          ]}>
            Features
          </Text>
          
          <View style={styles.featureGrid}>
            {featureCards.map((card, index) => (
              <Animated.View
                key={card.title}
                style={[
                  styles.featureCard,
                  {
                    width: isMobile ? '100%' : isTablet ? '48%' : '30%',
                    opacity: card.anim,
                    transform: [
                      {
                        translateY: card.anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        }),
                      },
                      { scale: card.anim },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={card.color}
                  style={styles.featureCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.featureCardContent}>
                    <MaterialCommunityIcons
                      name={card.icon}
                      size={isMobile ? 32 : 36}
                      color="#ffffff"
                      style={styles.featureIcon}
                    />
                    <Text style={[
                      styles.featureTitle,
                      { fontSize: isMobile ? 16 : 18 }
                    ]}>
                      {card.title}
                    </Text>
                    <Text style={[
                      styles.featureDescription,
                      { fontSize: isMobile ? 12 : 14 }
                    ]}>
                      {card.description}
                    </Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.statisticsSection}>
          <Text style={[
            styles.sectionTitle,
            {
              fontSize: isMobile ? 22 : isTablet ? 24 : 26,
              color: isDark ? '#ffffff' : '#2c3e50',
            }
          ]}>
            Our Impact
          </Text>
          
          <View style={styles.statisticsGrid}>
            {statistics.map((stat, index) => (
              <Animated.View
                key={stat.label}
                style={[
                  styles.statisticCard,
                  {
                    width: isMobile ? '48%' : isTablet ? '23%' : '22%',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                    opacity: stat.anim,
                    transform: [
                      {
                        translateY: stat.anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        }),
                      },
                      { scale: stat.anim },
                    ],
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={stat.icon}
                  size={isMobile ? 24 : 28}
                  color={stat.color}
                  style={styles.statisticIcon}
                />
                <Text style={[
                  styles.statisticValue,
                  {
                    fontSize: isMobile ? 18 : 20,
                    color: isDark ? '#ffffff' : '#2c3e50',
                  }
                ]}>
                  {stat.value}
                </Text>
                <Text style={[
                  styles.statisticLabel,
                  {
                    fontSize: isMobile ? 12 : 14,
                    color: isDark ? '#bdc3c7' : '#5a6c7d',
                  }
                ]}>
                  {stat.label}
                </Text>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.actionButtonsContainer,
            {
              transform: [{ translateY: buttonTranslateY }],
            },
          ]}
        >
          {/* Camera Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCameraPress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isDark ? ['#4ecca3', '#44a08d'] : ['#667eea', '#764ba2']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Animated.View
                style={[
                  styles.buttonContent,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="camera"
                  size={isMobile ? 24 : 28}
                  color="#ffffff"
                  style={styles.buttonIcon}
                />
                <Text style={[
                  styles.buttonText,
                  { fontSize: isMobile ? 16 : 18 }
                ]}>
                  Start Scanning
                </Text>
              </Animated.View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Learn More Button */}
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
              }
            ]}
            onPress={handleLearnMorePress}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="book-open"
              size={isMobile ? 20 : 24}
              color={isDark ? '#4ecca3' : '#667eea'}
              style={styles.buttonIcon}
            />
            <Text style={[
              styles.secondaryButtonText,
              {
                fontSize: isMobile ? 14 : 16,
                color: isDark ? '#ffffff' : '#2c3e50',
              }
            ]}>
              Learn More
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}


// Styles - this took way too long to get right
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Hamburger menu styles
  hamburgerButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderWidth: 1,
  },
  
  menuOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  overlayTouchable: {
    flex: 1,
    width: '100%',
  },
  
  menuContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  closeButton: {
    padding: 5,
  },
  
  menuItems: {
    flex: 1,
    paddingTop: 10,
  },
  
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  
  menuItemIcon: {
    width: 40,
    alignItems: 'center',
  },
  
  menuItemContent: {
    flex: 1,
    marginLeft: 15,
  },
  
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  
  menuItemDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  
  menuFooter: {
    padding: 20,
    alignItems: 'center',
  },
  
  menuFooterText: {
    fontSize: 12,
    opacity: 0.6,
  },
  
  // Theme toggle button
  themeToggle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderWidth: 1,
  },
  
  // Particle system
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  
  particle: {
    position: 'absolute',
    borderRadius: 50, // makes it circular
  },
  
  // Main content
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingHorizontal: 20,
  },
  
  // Header section
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  
  welcomeSectionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  
  welcomeTextLeft: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  
  pointsContainer: {
    marginTop: 5,
  },
  
  pointsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  
  pointsIcon: {
    marginRight: 6,
  },
  
  pointsText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  
  titleContainer: {
    alignItems: 'center',
  },
  
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  leafIcon: {
    marginRight: 12,
  },
  
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
  },
  
  // Features section
  featuresSection: {
    marginBottom: 40,
  },
  
  sectionTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  featureCard: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    // shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // elevation for Android
    elevation: 4,
  },
  
  featureCardGradient: {
    padding: 20,
    minHeight: 140,
  },
  
  featureCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  
  featureIcon: {
    marginBottom: 12,
  },
  
  featureTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  featureDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 18,
  },
  
  // Statistics section
  statisticsSection: {
    marginBottom: 40,
  },
  
  statisticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  statisticCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  statisticIcon: {
    marginBottom: 8,
  },
  
  statisticValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  statisticLabel: {
    textAlign: 'center',
    opacity: 0.8,
  },
  
  // Action buttons
  actionButtonsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  
  primaryButton: {
    width: '100%',
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonIcon: {
    marginRight: 10,
  },
  
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  
  secondaryButtonText: {
    fontWeight: '600',
  },
});

// A lot of the other code got deleted for some reason, but I tried to keep it as similar to the original version as possible
