import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// Responsive breakpoints
const isSmallScreen = width < 380;
const isMediumScreen = width >= 380 && width < 768;
const isLargeScreen = width >= 768;

// Tips for e-waste items
const ewasteTips = [
  {
    title: "Remove Batteries",
    description: "Always remove batteries from devices before recycling. Batteries should be recycled separately at designated collection points.",
    icon: "battery-charging-outline",
    color: "#e74c3c"
  },
  {
    title: "Erase Personal Data",
    description: "Before recycling phones, computers, or storage devices, make sure to back up and securely erase all personal data.",
    icon: "shield-checkmark-outline",
    color: "#3498db"
  },
  {
    title: "Keep Cables Together",
    description: "Bundle cables, chargers, and accessories with their respective devices when possible for more efficient recycling.",
    icon: "git-network-outline",
    color: "#f39c12"
  },
  {
    title: "Don't Break Screens",
    description: "Avoid breaking screens or damaging devices, as they may contain hazardous materials that require special handling.",
    icon: "alert-circle-outline",
    color: "#9b59b6"
  }
];

// Fun facts about e-waste
const funFacts = [
  "Only 17.4% of global e-waste is formally collected and recycled, despite containing valuable recoverable materials.",
  "A ton of cell phones contains more gold than a ton of ore from a gold mine.",
  "Recycling one million laptops saves the energy equivalent to electricity used by 3,657 U.S. homes in a year.",
  "E-waste represents 2% of America's trash in landfills, but equals 70% of overall toxic waste.",
  "The average American household has 24 electronic products that will eventually become e-waste."
];

export default function EWasteDisposal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isGuestSession = params.guest === 'true';
  const itemName = params.item || "this item";
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  
  // For circuit animation effect
  const [showCircuit, setShowCircuit] = useState(true);
  const circuitAnims = useRef(Array(15).fill(0).map(() => ({
    x: new Animated.Value(Math.random() * width),
    y: new Animated.Value(Math.random() * height * 0.3),
    opacity: new Animated.Value(0),
    width: 20 + Math.random() * 60
  }))).current;
  
  // For tip cards animation
  const [visibleTips, setVisibleTips] = useState<number[]>([]);
  const [expandedTip, setExpandedTip] = useState<number | null>(null);
  const tipAnims = useRef(ewasteTips.map(() => new Animated.Value(0))).current;
  const tipExpandAnims = useRef(ewasteTips.map(() => new Animated.Value(0))).current;
  
  // For fun fact rotation
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const factAnim = useRef(new Animated.Value(1)).current;
  const factSwipeAnim = useRef(new Animated.Value(0)).current;
  
  // For button animations
  const mapButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const homeButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const backButtonScaleAnim = useRef(new Animated.Value(1)).current;
  
  // For scroll-based animations
  const scrollY = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Animate header on mount
    Animated.timing(headerFadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true
    }).start();
    
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
    
    // Animate circuit lines
    if (showCircuit) {
      circuitAnims.forEach((anim, i) => {
        const delay = i * 200;
        
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim.opacity, {
            toValue: 0.7,
            duration: 500,
            useNativeDriver: true
          }),
          Animated.timing(anim.opacity, {
            toValue: 0.2,
            duration: 1000,
            useNativeDriver: true
          })
        ]).start(() => {
          // Create pulsing effect
          Animated.loop(
            Animated.sequence([
              Animated.timing(anim.opacity, {
                toValue: 0.7,
                duration: 1500,
                useNativeDriver: true
              }),
              Animated.timing(anim.opacity, {
                toValue: 0.2,
                duration: 1500,
                useNativeDriver: true
              })
            ])
          ).start();
        });
      });
    }
    
    // Staggered animation for tips
    const showTips = () => {
      const animateTip = (index: number) => {
        if (index >= ewasteTips.length) return;
        
        setTimeout(() => {
          setVisibleTips(prev => [...prev, index]);
          
          Animated.spring(tipAnims[index], {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }).start();
          
          animateTip(index + 1);
        }, 200);
      };
      
      animateTip(0);
    };
    
    showTips();
    
    // Rotate fun facts every 8 seconds
    const factInterval = setInterval(() => {
      animateFactChange((currentFactIndex + 1) % funFacts.length);
    }, 8000);
    
    return () => clearInterval(factInterval);
  }, []);
  
  const animateFactChange = (newIndex: number) => {
    // Animate fact change with swipe effect
    Animated.sequence([
      Animated.timing(factSwipeAnim, {
        toValue: -width,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(factSwipeAnim, {
        toValue: width,
        duration: 0,
        useNativeDriver: true,
      })
    ]).start(() => {
      setCurrentFactIndex(newIndex);
      
      Animated.timing(factSwipeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  };
  
  const handleFindDropOff = () => {
    // Provide haptic feedback
    if (isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Animate button press
    Animated.sequence([
      Animated.timing(mapButtonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(mapButtonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
    
    // On web, open in new tab, on mobile open in default maps app
    const searchQuery = "e-waste recycling center near me";
    if (isWeb) {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`);
    } else {
      const mapsUrl = Platform.select({
        ios: `maps://maps.apple.com/?q=${encodeURIComponent(searchQuery)}`,
        android: `geo:0,0?q=${encodeURIComponent(searchQuery)}`,
      });
      if (mapsUrl) Linking.openURL(mapsUrl);
    }
  };
  
  // Enhanced back button handler
  const handleBackPress = () => {
    // Provide haptic feedback
    if (isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Animate button press
    Animated.sequence([
      Animated.timing(backButtonScaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(backButtonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
    
    // Navigate to camera capture page
    router.push('/next_page');
  };
  
  // Home button handler
  const handleHomePress = () => {
    // Provide haptic feedback
    if (isWeb) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Animate button press
    Animated.sequence([
      Animated.timing(homeButtonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(homeButtonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
    
    // Navigate to home page
    router.push({ pathname: '/account', params: { guest: 'true' } });
  };
  
  // Handle tip card expansion
  const handleTipPress = (index: number) => {
    // Provide haptic feedback
    if (isWeb) {
      Haptics.selectionAsync();
    }
    
    if (expandedTip === index) {
      // Collapse the tip
      Animated.timing(tipExpandAnims[index], {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start(() => {
        setExpandedTip(null);
      });
    } else {
      // Collapse any currently expanded tip
      if (expandedTip !== null) {
        Animated.timing(tipExpandAnims[expandedTip], {
          toValue: 0,
          duration: 300,
          useNativeDriver: false
        }).start();
      }
      
      // Expand the selected tip
      setExpandedTip(index);
      Animated.timing(tipExpandAnims[index], {
        toValue: 1,
        duration: 300,
        useNativeDriver: false
      }).start();
    }
  };
  
  // Navigate to previous fact
  const handlePrevFact = () => {
    if (isWeb) {
      Haptics.selectionAsync();
    }
    
    const newIndex = currentFactIndex === 0 ? funFacts.length - 1 : currentFactIndex - 1;
    animateFactChange(newIndex);
  };
  
  // Navigate to next fact
  const handleNextFact = () => {
    if (isWeb) {
      Haptics.selectionAsync();
    }
    
    const newIndex = (currentFactIndex + 1) % funFacts.length;
    animateFactChange(newIndex);
  };
  
  // Calculate header opacity based on scroll position
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp'
  });
  
  // Calculate header shadow based on scroll position
  const headerShadowOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 0.3],
    extrapolate: 'clamp'
  });
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          { 
            opacity: headerFadeAnim,
            shadowOpacity: headerShadowOpacity
          }
        ]}
      >
        <LinearGradient
          colors={['#2c3e50', '#34495e']}
          style={styles.headerGradient}
        >
          <Animated.View
            style={{
              transform: [{ scale: backButtonScaleAnim }]
            }}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
          
          <Text style={styles.headerTitle}>E-Waste Disposal Guide</Text>
          
          {/* Empty view for balanced layout */}
          <View style={styles.headerRightPlaceholder} />
        </LinearGradient>
      </Animated.View>
      
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero section */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Circuit animation effect */}
          {showCircuit && circuitAnims.map((anim, index) => (
            <Animated.View
              key={`circuit-${index}`}
              style={[
                styles.circuitLine,
                {
                  left: anim.x,
                  top: anim.y,
                  width: anim.width,
                  opacity: anim.opacity,
                }
              ]}
            />
          ))}
          
          <LinearGradient
            colors={['#2c3e50', '#34495e']}
            style={styles.heroGradient}
          >
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#e74c3c', '#c0392b']}
                style={styles.iconGradient}
              >
                <Ionicons name="hardware-chip" size={60} color="#fff" />
              </LinearGradient>
            </View>
            
            <Text style={styles.heroTitle}>
              Great job identifying e-waste!
            </Text>
            
            <Text style={styles.heroSubtitle}>
              Follow these tips to ensure {itemName} is properly disposed of and recycled.
            </Text>
          </LinearGradient>
        </Animated.View>
        
        {/* Main warning guidance */}
        <Animated.View
          style={[
            styles.warningGuidance,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['#e74c3c', '#c0392b']}
            style={styles.warningGradient}
          >
            <View style={styles.warningIconContainer}>
              <Ionicons name="desktop-outline" size={36} color="#fff" />
            </View>
            
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningTitle}>Never Throw in Regular Trash</Text>
              <Text style={styles.warningDescription}>
                Electronic waste contains hazardous materials and should always be taken to designated e-waste collection points.
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
        
        {/* E-waste tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>How to Prepare</Text>
          
          {ewasteTips.map((tip, index) => (
            visibleTips.includes(index) && (
              <Animated.View
                key={index}
                style={[
                  styles.tipCard,
                  {
                    opacity: tipAnims[index],
                    transform: [
                      {
                        scale: tipAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1]
                        })
                      },
                    ],
                    // Add shadow based on expanded state
                    shadowOpacity: tipExpandAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.1, 0.2]
                    }),
                    shadowRadius: tipExpandAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [5, 10]
                    }),
                    elevation: tipExpandAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [2, 5]
                    })
                  }
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => handleTipPress(index)}
                  style={styles.tipTouchable}
                >
                  <View style={styles.tipHeader}>
                    <View style={[
                      styles.tipIconContainer,
                      { backgroundColor: `${tip.color}15` } // 15% opacity version of the color
                    ]}>
                      <Ionicons name={tip.icon as keyof typeof Ionicons.glyphMap} size={28} color={tip.color} />
                    </View>
                    
                    <View style={styles.tipTextContainer}>
                      <Text style={styles.tipTitle}>{tip.title}</Text>
                      <Animated.View
                        style={{
                          height: tipExpandAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 80] // Adjust based on content
                          }),
                          overflow: 'hidden'
                        }}
                      >
                        <Text style={styles.tipDescription}>{tip.description}</Text>
                      </Animated.View>
                    </View>
                    
                    <Animated.View
                      style={{
                        transform: [{
                          rotate: tipExpandAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '180deg']
                          })
                        }]
                      }}
                    >
                      <Ionicons 
                        name="chevron-down" 
                        size={20} 
                        color="#95a5a6" 
                      />
                    </Animated.View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            )
          ))}
        </View>
        
        {/* Did you know section */}
        <View style={styles.factSection}>
          <Text style={styles.sectionTitle}>Did You Know?</Text>
          
          <View style={styles.factCardContainer}>
            <TouchableOpacity
              style={styles.factNavButton}
              onPress={handlePrevFact}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="#95a5a6" />
            </TouchableOpacity>
            
            <Animated.View
              style={[
                styles.factCard,
                {
                  transform: [{ translateX: factSwipeAnim }]
                }
              ]}
            >
              <LinearGradient
                colors={['#fff', '#f8f9fa']}
                style={styles.factGradient}
              >
                <Ionicons name="bulb-outline" size={24} color="#f39c12" style={styles.factIcon} />
                <Text style={styles.factText}>{funFacts[currentFactIndex]}</Text>
                
                <View style={styles.factIndicators}>
                  {funFacts.map((_, i) => (
                    <View 
                      key={i} 
                      style={[
                        styles.factIndicator,
                        currentFactIndex === i ? styles.factIndicatorActive : {}
                      ]} 
                    />
                  ))}
                </View>
              </LinearGradient>
            </Animated.View>
            
            <TouchableOpacity
              style={styles.factNavButton}
              onPress={handleNextFact}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={24} color="#95a5a6" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Local drop-off centers */}
        <View style={styles.dropOffSection}>
          <Text style={styles.sectionTitle}>Local Drop-off Centers</Text>
          
          <Animated.View
            style={{
              transform: [{ scale: mapButtonScaleAnim }]
            }}
          >
            <TouchableOpacity
              style={styles.mapButton}
              onPress={handleFindDropOff}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#e74c3c', '#c0392b']}
                style={styles.mapButtonGradient}
              >
                <Ionicons name="location" size={24} color="#fff" style={styles.mapButtonIcon} />
                <Text style={styles.mapButtonText}>Find Nearest E-Waste Center</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          
          <Text style={styles.dropOffNote}>
            Many retailers like Best Buy and Staples also offer free e-waste recycling programs. Check their websites for details.
          </Text>
        </View>
        
        {/* Spacer for bottom bar */}
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
      
      {/* Bottom action button */}
      <View style={styles.bottomBar}>
        <Animated.View
          style={{
            transform: [{ scale: homeButtonScaleAnim }]
          }}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleHomePress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#e74c3c', '#c0392b']}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>Back to Home</Text>
              <Ionicons name="home" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f8fa',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 25 : 50,
    backgroundColor: '#2c3e50',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
    zIndex: 10,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerRightPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    position: 'relative',
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  heroGradient: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  circuitLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#e74c3c',
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  warningGuidance: {
    marginHorizontal: 15,
    marginBottom: 25,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  warningGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  warningIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  warningDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  tipsSection: {
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    overflow: 'hidden',
  },
  tipTouchable: {
    width: '100%',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  tipIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginTop: 5,
  },
  factSection: {
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  factCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  factNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  factCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    overflow: 'hidden',
    marginHorizontal: -20, // Overlap with nav buttons
    zIndex: 1,
  },
  factGradient: {
    padding: 20,
    alignItems: 'center',
  },
  factIcon: {
    marginBottom: 15,
  },
  factText: {
    fontSize: 16,
    color: '#2c3e50',
    fontStyle: 'italic',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 15,
  },
  factIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  factIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  factIndicatorActive: {
    backgroundColor: '#f39c12',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dropOffSection: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  mapButton: {
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  mapButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  mapButtonIcon: {
    marginRight: 10,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dropOffNote: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 80,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: Platform.OS === 'ios' ? 20 : 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
