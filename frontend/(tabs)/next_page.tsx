// This page is the camera capture and prediction page. After the image is captured, it gets sent to the Flask backend which is on an EC2 instance for prediction with the TFLite model. 
// Side note: the barcode functionality is not fully integrated yet, so if you can, delete all instances of it
import { Ionicons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { config } from '../../config';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// Detect mobile browser
const isMobileBrowser = () => {
  if (!isWeb) return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
};

const isMobile = isMobileBrowser();

// Responsive breakpoints
const isSmallScreen = width < 380;
const isMediumScreen = width >= 380 && width < 768;
const isLargeScreen = width >= 768;

// Prediction category colors and icons
const categoryConfig = {
  'EWaste': {
    color: '#e74c3c',
    gradientColors: ['#e74c3c', '#c0392b'],
    icon: 'hardware-chip-outline',
    description: 'Electronic waste should be recycled at designated e-waste centers.'
  },
  'Organic': {
    color: '#27ae60',
    gradientColors: ['#2ecc71', '#27ae60'],
    icon: 'leaf-outline',
    description: 'Organic waste can be composted to create nutrient-rich soil.'
  },
  'Recyclable': {
    color: '#3498db',
    gradientColors: ['#3498db', '#2980b9'],
    icon: 'refresh-outline',
    description: 'This item can be processed and reused to make new products.'
  },
  'NonRecyclable': {
    color: '#9b59b6',
    gradientColors: ['#9b59b6', '#8e44ad'],
    icon: 'trash-outline',
    description: 'This item cannot be recycled and should be disposed of as general waste.'
  },
  'StoreDropOff': {
    color: '#f39c12',
    gradientColors: ['#f39c12', '#e67e22'],
    icon: 'storefront-outline',
    description: 'This item requires special handling. Please take it to a participating retail store for proper recycling.',
    actionText: 'Find Store Locations',
    specialHandling: true
  }
};

export default function NextPage() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{ label: string; confidence: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const [showTip, setShowTip] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [flashMode, setFlashMode] = useState<boolean>(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  
  // Barcode scanning states
  const [barcodePermission, setBarcodePermission] = useState<boolean | null>(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState<boolean>(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [barcodeResult, setBarcodeResult] = useState<{ label: string; confidence: number; productName?: string } | null>(null);
  const [isBarcodeLoading, setIsBarcodeLoading] = useState<boolean>(false);
  
  // Add state to track if we should show the "Learn More" button
  const [showLearnMore, setShowLearnMore] = useState<boolean>(false);
  
  // Add state to track if camera needs user interaction to start
  const [needsUserInteraction, setNeedsUserInteraction] = useState<boolean>(isMobile);
  
  // Add state for UI animations
  const [showCaptureEffect, setShowCaptureEffect] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const cameraFadeAnim = useRef(new Animated.Value(0)).current;
  const tipFadeAnim = useRef(new Animated.Value(0)).current;
  const captureButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const barcodeButtonScaleAnim = useRef(new Animated.Value(1)).current;
  
  // Add a dependency to trigger webcam restart
  const [webcamActive, setWebcamActive] = useState(false);

  // Add viewport meta tag for mobile web
  useEffect(() => {
    if (isWeb) {
      // Add viewport meta tag for responsive design on web
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.getElementsByTagName('head')[0].appendChild(meta);
      
      // Set webcamActive to false initially on mobile to require user interaction
      if (isMobile) {
        setWebcamActive(false);
        setNeedsUserInteraction(true);
      } else {
        // On desktop, start camera automatically
        setWebcamActive(true);
      }
      
      // Animate header on mount
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }).start();
    }
  }, []);

  // Request barcode scanner permissions (will not appear as it is not fully implemented)
  useEffect(() => {
    const requestBarcodePermissions = async () => {
      if (!isWeb) {

        setBarcodePermission(true); // Temporary fallback
      } else {
        // For web, we'll use the same camera stream for barcode scanning (although barcode is not fully integrated yet)
        setBarcodePermission(true);
      }
    };

    requestBarcodePermissions();
  }, []);

  // Animation for prediction result
  useEffect(() => {
    if (prediction || barcodeResult) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true
        })
      ]).start();
      
      // If the prediction is "Recyclable", "EWaste", "Organic", "NonRecyclable", or "StoreDropOff", show the Learn More button
      const result = prediction || barcodeResult;
      if (result && (result.label === 'Recyclable' || result.label === 'EWaste' || 
          result.label === 'Organic' || result.label === 'NonRecyclable' || result.label === 'StoreDropOff')) {
        setShowLearnMore(true);
      } else {
        setShowLearnMore(false);
      }
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
      setShowLearnMore(false);
    }
  }, [prediction, barcodeResult]);

  // Show camera tip for 5 seconds with animation
  useEffect(() => {
    if (showTip && cameraReady) {
      // Animate tip appearance
      Animated.sequence([
        Animated.timing(tipFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.delay(4000),
        Animated.timing(tipFadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true
        })
      ]).start(() => {
        setShowTip(false);
      });
    }
  }, [showTip, cameraReady]);

  // Animate camera appearance when ready
  useEffect(() => {
    if (cameraReady) {
      Animated.timing(cameraFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start();
    } else {
      cameraFadeAnim.setValue(0);
    }
  }, [cameraReady]);

  // Camera initialization
  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        // Use different constraints for mobile vs desktop (dynamically adjust based on screen size)
        const constraints = isMobile 
          ? { 
              video: { 
                facingMode: 'environment',
                width: { ideal: 640 },  // Lower resolution for mobile
                height: { ideal: 480 }
              } 
            }
          : { 
              video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },  // Reduced from 1920 for better compatibility
                height: { ideal: 720 }   // Reduced from 1080
              } 
            };
            
        console.debug('[DEBUG] Requesting camera with constraints:', constraints);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setCameraPermission(true);
        return stream;
      } catch (err: any) {
        console.error('[ERROR] Camera permission denied:', err);
        
        // More detailed error handling
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera access in your browser settings.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on your device.');
        } else if (err.name === 'NotReadableError') {
          setError('Camera is already in use by another application.');
        } else if (err.name === 'OverconstrainedError') {
          // Try again with more relaxed constraints
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
              video: true  // Most basic constraint
            });
            setCameraPermission(true);
            return fallbackStream;
          } catch (fallbackErr) {
            setError('Your camera does not support the required features.');
            setCameraPermission(false);
            return null;
          }
        } else {
          setError(`Camera error: ${err.message || 'Unknown error'}`);
        }
        
        setCameraPermission(false);
        return null;
      }
    };

    const startWebcam = async () => {
      console.debug('[DEBUG] Starting webcam...');
      setIsLoading(true);
      
      try {
        // Stop any existing tracks first
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
        
        const stream = await requestCameraPermission();
        if (!stream) {
          setIsLoading(false);
          return;
        }
        
        console.debug('[DEBUG] Webcam stream obtained:', stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setCameraReady(true);
            setIsLoading(false);
            
            // Attempt to play the video (needed for some mobile browsers)
            videoRef.current?.play().catch(playErr => {
              console.error('[ERROR] Error playing video:', playErr);
              if (playErr.name === 'NotAllowedError') {
                setError('Video playback was denied. Please ensure autoplay is enabled.');
              }
            });
          };
          console.debug('[DEBUG] Video element srcObject set');
        } else {
          console.warn('[WARN] videoRef.current is null');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[ERROR] Error accessing webcam:', error);
        setError('Unable to access camera. Please check permissions.');
        setIsLoading(false);
      }
    };

    // Only start webcam if it should be active
    if (webcamActive) {
      startWebcam();
    } else {
      setIsLoading(false);
    }

    return () => {
      console.debug('[DEBUG] Cleaning up webcam stream...');
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        console.debug('[DEBUG] Stopped all webcam tracks');
      }
    };
  }, [webcamActive]); // Add webcamActive as dependency to restart when needed

  // Function to start camera with user interaction (for mobile)
  const startCamera = () => {
    setNeedsUserInteraction(false);
    setWebcamActive(true);
    
    // Provide haptic feedback
    if (isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Barcode scanning functions
  const handleBarcodeScanned = async ({ type, data }: { type: string; data: string }) => {
    console.debug('[DEBUG] Barcode scanned:', { type, data });
    setScannedBarcode(data);
    setShowBarcodeScanner(false);
    setIsBarcodeLoading(true);
    
    try {
      // Call API to classify the barcode (remove this cause barcode is not fully implemented yet with Expo)
      const serverUrl = `${config.apiUrl}/classify-barcode`;
      console.debug('[DEBUG] Sending barcode to:', serverUrl);
      
      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          barcode: data,
          type: type 
        }),
      });

      console.debug('[DEBUG] Barcode API response:', response);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.debug('[DEBUG] Barcode classification result:', result);
      setBarcodeResult(result);
      
    } catch (error) {
      console.error('[ERROR] Barcode classification error:', error);
      setError('Barcode analysis failed. Please try again.');
    } finally {
      setIsBarcodeLoading(false);
    }
  };

  const startBarcodeScanning = () => {
    if (isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Animate barcode button press (remove this as barcode is not fully implemented)
    Animated.sequence([
      Animated.timing(barcodeButtonScaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(barcodeButtonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
    
    setShowBarcodeScanner(true);
  };

  const handleCapture = async () => {
    if (isWeb) {
      // Provide haptic feedback on mobile devices
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Animate capture button press
    Animated.sequence([
      Animated.timing(captureButtonScaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(captureButtonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
    
    // Show capture effect
    setShowCaptureEffect(true);
    setTimeout(() => setShowCaptureEffect(false), 300);
    
    console.debug('[DEBUG] Capture button clicked');
    setIsLoading(true);
    setError(null);

    try {
      if (!videoRef.current) throw new Error('videoRef.current is null');
      if (videoRef.current.readyState < 2)
        throw new Error('Video not ready, readyState=' + videoRef.current.readyState);

      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      console.debug(`[DEBUG] Video dimensions: width=${videoWidth}, height=${videoHeight}`);

      const canvas = document.createElement('canvas');
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
      console.debug('[DEBUG] Drawn video frame to canvas');

      let photoBlob: Blob;

      try {
        photoBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            console.debug('[DEBUG] canvas.toBlob callback:', blob);
            if (blob) resolve(blob);
            else reject(new Error('canvas.toBlob returned null'));
          }, 'image/jpeg', 0.95); // Higher quality JPEG
        });
      } catch (error) {
        console.warn('[WARN] canvas.toBlob failed:', error);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        console.debug('[DEBUG] Generated data URL fallback:', dataUrl.substring(0, 100) + '...');
        const fallbackResponse = await fetch(dataUrl);
        photoBlob = await fallbackResponse.blob();
      }

      const imageUrl = URL.createObjectURL(photoBlob);
      
      const formData = new FormData();
      const file = new File([photoBlob], 'photo.jpg', { type: 'image/jpeg' });
      formData.append('image', file);
      console.debug('[DEBUG] FormData appended with image Blob');

      // Construct the full prediction API URL and send a POST request with the image file as FormData.
      // Expects a JSON response containing the predicted label and confidence score.
      const serverUrl = `${config.apiUrl}/predict`;
      console.debug('[DEBUG] Sending fetch POST to:', serverUrl);

      const response = await fetch(serverUrl, {
        method: 'POST',
        body: formData,
      });

      console.debug('[DEBUG] Fetch response received:', response);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.debug('[DEBUG] Parsed JSON response:', result);
      setPrediction(result);
      setImageUri(imageUrl);
      
      // Deactivate webcam when showing captured image
      setWebcamActive(false);
    } catch (error) {
      console.error('[ERROR] Prediction error:', error);
      setError('Analysis failed. Please reload app.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetake = () => {
    if (isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    console.debug('[DEBUG] Retake button clicked');
    
    // Clean up old image URL to prevent memory leaks
    if (imageUri) {
      URL.revokeObjectURL(imageUri);
    }
    
    // Reset states
    setImageUri(null);
    setPrediction(null);
    setBarcodeResult(null);
    setScannedBarcode(null);
    setError(null);
    setShowTip(true);
    
    // Reactivate webcam
    setWebcamActive(true);
  };

  const toggleFlash = () => {
    if (isWeb) {
      Haptics.selectionAsync();
    }
    
    setFlashMode(!flashMode);
    
    // Apply flash mode to active track if available (on mobile it will work, but not on computer)
    if (videoRef.current && videoRef.current.srcObject) {
      const videoTrack = (videoRef.current.srcObject as MediaStream)
        .getVideoTracks()[0];
      
      if (videoTrack && videoTrack.getCapabilities && videoTrack.getCapabilities().torch) {
        videoTrack.applyConstraints({
          advanced: [{ torch: !flashMode }]
        }).catch(e => console.error('Flash not supported:', e));
      }
    }
  };

  // Navigate to the appropriate disposal guide based on prediction
  const handleLearnMore = () => {
    if (isWeb) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    const result = prediction || barcodeResult;
    if (result) {
      if (result.label === 'Recyclable') {
        // Navigate to recyclable disposal page with item info
        router.push({
          pathname: '/(tabs)/recyclable_disposal',
          params: { item: 'this item' } // You could pass more specific item info here
        });
      } else if (result.label === 'Organic') {
        // Navigate to organic disposal page with item info
        router.push({
          pathname: '/(tabs)/organic_disposal',
          params: { item: 'this item' } // You could pass more specific item info here
        });
      } else if (result.label === 'EWaste') {
        // Navigate to e-waste disposal page with item info
        router.push({
          pathname: '/(tabs)/ewaste_disposal',
          params: { item: 'this item' } // You could pass more specific item info here
        });
      } else if (result.label === 'NonRecyclable') {
        // Navigate to non-recyclable disposal page with item info
        router.push({
          pathname: '/(tabs)/nonrec_disposal' as any,
          params: { item: 'this item' } // You could pass more specific item info here
        });
      } else if (result.label === 'StoreDropOff') {
        // Navigate to store drop-off disposal page with item info
        router.push({
          pathname: '/(tabs)/store_disposal' as any,
          params: { item: 'this item' } // You could pass more specific item info here
        });
      }
    }
  };

  // Get prediction category config or default
  const getPredictionConfig = () => {
    const result = prediction || barcodeResult;
    if (!result) return null;
    return categoryConfig[result.label as keyof typeof categoryConfig] || {
      color: '#7f8c8d',
      gradientColors: ['#95a5a6', '#7f8c8d'],
      icon: 'help-circle-outline',
      description: 'Please check local guidelines for disposal.'
    };
  };
  
  const predConfig = getPredictionConfig();
  const currentResult = prediction || barcodeResult;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          { opacity: headerFadeAnim }
        ]}
      >
        <LinearGradient
          colors={['#34495e', '#2c3e50']}
          style={styles.headerGradient}
        >
          <Ionicons name="camera" size={24} color="#fff" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Smart Waste Analyzer</Text>
        </LinearGradient>
      </Animated.View>
      
      {imageUri ? (
        <View style={styles.resultContainer}>
          {/* Result View */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.capturedImage} />
            
            {/* Prediction Overlay */}
            {currentResult && predConfig && (
              <Animated.View 
                style={[
                  styles.predictionOverlay,
                  { 
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                  }
                ]}
              >
                <LinearGradient
                  colors={['transparent', `${predConfig.color}99`, predConfig.color]}
                  style={styles.predictionGradient}
                >
                  <View style={styles.predictionContent}>
                    <View style={[
                      styles.predictionIconContainer, 
                      { 
                        backgroundColor: predConfig.color,
                        // Add special styling for StoreDropOff
                        ...(currentResult.label === 'StoreDropOff' && {
                          borderWidth: 2,
                          borderColor: '#fff',
                          shadowColor: predConfig.color,
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.4,
                          shadowRadius: 8,
                          elevation: 8,
                        })
                      }
                    ]}>
                      <Ionicons name={predConfig.icon as keyof typeof Ionicons.glyphMap} size={32} color="#fff" />
                    </View>
                    
                    <View style={styles.predictionTextContainer}>
                      <Text style={[
                        styles.predictionLabel,
                        // Add special styling for StoreDropOff label
                        currentResult.label === 'StoreDropOff' && {
                          fontSize: 26,
                          fontWeight: '800',
                          letterSpacing: 0.5,
                        }
                      ]}>
                        {currentResult.label === 'StoreDropOff' ? 'Store Drop-Off' : currentResult.label}
                      </Text>
                      {currentResult.confidence > 0 && (
                        <Text style={styles.predictionConfidence}>
                          {(currentResult.confidence * 100).toFixed(1)}% Confidence
                        </Text>
                      )}
                      <Text style={[
                        styles.predictionDescription,
                        // Add special styling for StoreDropOff description
                        currentResult.label === 'StoreDropOff' && {
                          fontSize: 15,
                          fontWeight: '500',
                          lineHeight: 22,
                        }
                      ]}>
                        {predConfig.description}
                      </Text>
                      {/* Add product name for barcode results (not in use right now, you can comment this section out) */}
                      {barcodeResult && barcodeResult.productName && (
                        <Text style={styles.productName}>
                          Product: {barcodeResult.productName}
                        </Text>
                      )}
                    </View>
                  </View>
                </LinearGradient>
              </Animated.View>
            )}
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleRetake}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-reverse-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Retake</Text>
            </TouchableOpacity>
            
            {showLearnMore && (
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  styles.primaryButton,
                  // Special styling for StoreDropOff button
                  currentResult?.label === 'StoreDropOff' && {
                    backgroundColor: predConfig?.color,
                    shadowColor: predConfig?.color,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 6,
                  }
                ]}
                onPress={handleLearnMore}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={currentResult?.label === 'StoreDropOff' ? "location-outline" : "information-circle-outline"} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.actionButtonText}>
                  {currentResult?.label === 'StoreDropOff' ? 'Find Stores' : 'Learn More'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          {/* Camera View */}
          {cameraPermission === false ? (
            <View style={styles.permissionContainer}>
              <LinearGradient
                colors={['#2c3e50', '#34495e']}
                style={styles.permissionGradient}
              >
                <Ionicons name="camera-outline" size={64} color="#fff" />
                <Text style={styles.permissionText}>Camera access denied</Text>
                <Text style={styles.permissionSubtext}>
                  Please enable camera permissions in your browser settings
                </Text>
                <TouchableOpacity 
                  style={styles.permissionButton}
                  onPress={() => setWebcamActive(true)}
                >
                  <Text style={styles.permissionButtonText}>Try Again</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ) : needsUserInteraction ? (
            // Show camera start button for mobile devices
            <View style={styles.permissionContainer}>
              <LinearGradient
                colors={['#2c3e50', '#34495e']}
                style={styles.permissionGradient}
              >
                <Ionicons name="camera-outline" size={64} color="#fff" />
                <Text style={styles.permissionText}>Camera Access Required</Text>
                <Text style={styles.permissionSubtext}>
                  Tap the button below to start your camera
                </Text>
                <TouchableOpacity 
                  style={styles.permissionButton}
                  onPress={startCamera}
                >
                  <Text style={styles.permissionButtonText}>Start Camera</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ) : (
            <>
              <View style={styles.videoContainer}>
                {isLoading && !cameraReady && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Starting camera...</Text>
                  </View>
                )}
                
                {isWeb && (
                  <Animated.View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      opacity: cameraFadeAnim
                    }}
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    
                    {/* Camera frame overlay */}
                    <View style={styles.cameraFrameOverlay}>
                      <View style={styles.cameraFrameCorner} />
                      <View style={[styles.cameraFrameCorner, styles.topRight]} />
                      <View style={[styles.cameraFrameCorner, styles.bottomLeft]} />
                      <View style={[styles.cameraFrameCorner, styles.bottomRight]} />
                    </View>
                    
                    {/* Capture effect overlay */}
                    {showCaptureEffect && (
                      <View style={styles.captureEffectOverlay} />
                    )}
                  </Animated.View>
                )}
                
                {/* Camera UI Overlay */}
                {cameraReady && (
                  <View style={styles.cameraOverlay}>
                    {/* Flash toggle button */}
                    <TouchableOpacity
                      style={styles.flashButton}
                      onPress={toggleFlash}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={flashMode ? "flash" : "flash-off"} 
                        size={24} 
                        color="#fff" 
                      />
                    </TouchableOpacity>
                    
                    {/* Camera tip */}
                    {showTip && (
                      <Animated.View 
                        style={[
                          styles.tipContainer,
                          { opacity: tipFadeAnim }
                        ]}
                      >
                        <Ionicons name="information-circle-outline" size={16} color="#fff" style={styles.tipIcon} />
                        <Text style={styles.tipText}>
                          Point camera at waste item
                        </Text>
                      </Animated.View>
                    )}
                    
                    {/* Capture and Barcode buttons */}
                    <View style={styles.bottomButtonsContainer}>
                      {/* Barcode scanner button */}
                      <Animated.View
                        style={{
                          transform: [{ scale: barcodeButtonScaleAnim }]
                        }}
                      >
                        <TouchableOpacity
                          style={styles.barcodeButton}
                          onPress={startBarcodeScanning}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="barcode-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                      </Animated.View>
                      
                      {/* Capture button */}
                      <Animated.View
                        style={{
                          transform: [{ scale: captureButtonScaleAnim }]
                        }}
                      >
                        <TouchableOpacity
                          style={styles.captureButton}
                          onPress={handleCapture}
                          activeOpacity={0.7}
                        >
                          <View style={styles.captureButtonInner} />
                        </TouchableOpacity>
                      </Animated.View>
                      
                      {/* Placeholder for symmetry */}
                      <View style={styles.barcodeButton} />
                    </View>
                  </View>
                )}
                
                {/* Error message */}
                {error && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={40} color="#e74c3c" style={styles.errorIcon} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                      style={styles.errorButton}
                      onPress={() => {
                        setError(null);
                        setWebcamActive(true);
                      }}
                    >
                      <Text style={styles.errorButtonText}>Try Again</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      )}
      
      {/* Barcode Scanner Modal (unecessary right now as it is not being used)*/}
      <Modal
        visible={showBarcodeScanner}
        animationType="slide"
        onRequestClose={() => setShowBarcodeScanner(false)}
      >
        <View style={styles.barcodeModalContainer}>
          <View style={styles.barcodeHeader}>
            <TouchableOpacity
              style={styles.barcodeCloseButton}
              onPress={() => setShowBarcodeScanner(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.barcodeHeaderText}>Scan Barcode</Text>
          </View>
          
          {!isWeb && barcodePermission && (
            <BarCodeScanner
              onBarCodeScanned={handleBarcodeScanned}
              style={StyleSheet.absoluteFillObject}
            />
          )}
          
          {isWeb && (
            <View style={styles.webBarcodeContainer}>
              <Text style={styles.webBarcodeText}>
                Web barcode scanning coming soon!
              </Text>
              <Text style={styles.webBarcodeSubtext}>
                For now, please use the camera to capture the item directly.
              </Text>
            </View>
          )}
          
          {isBarcodeLoading && (
            <View style={styles.barcodeLoadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.barcodeLoadingText}>Analyzing barcode...</Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingTop: isSmallScreen ? 40 : 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: isLargeScreen ? 12 : 0,
    margin: isLargeScreen ? 20 : 0,
  },
  cameraFrameOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  cameraFrameCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: 'rgba(255,255,255,0.7)',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    top: 20,
    left: 20,
  },
  topRight: {
    right: 20,
    left: undefined,
    borderLeftWidth: 0,
    borderRightWidth: 2,
  },
  bottomLeft: {
    bottom: 20,
    top: undefined,
    borderTopWidth: 0,
    borderBottomWidth: 2,
  },
  bottomRight: {
    bottom: 20,
    right: 20,
    top: undefined,
    left: undefined,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  captureEffectOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 10,
  },
  loadingText: {
    color: '#fff',
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  flashButton: {
    alignSelf: 'flex-end',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  tipIcon: {
    marginRight: 6,
  },
  tipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  barcodeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionGradient: {
    width: '100%',
    maxWidth: 400,
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  permissionSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 30,
    textAlign: 'center',
    maxWidth: 300,
  },
  permissionButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  capturedImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  predictionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  predictionGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  predictionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  predictionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  predictionTextContainer: {
    flex: 1,
  },
  predictionLabel: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  predictionConfidence: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  predictionDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  productName: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    fontStyle: 'italic',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#121212',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: '#3498db',
  },
  secondaryButton: {
    backgroundColor: '#7f8c8d',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    marginBottom: 15,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 300,
  },
  errorButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Barcode scanner modal styles
  barcodeModalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  barcodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 10,
  },
  barcodeCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  barcodeHeaderText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  webBarcodeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  webBarcodeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },
  webBarcodeSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  barcodeLoadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  barcodeLoadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 15,
  },
});
