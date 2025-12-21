/**
 * FoodCameraScanner Component
 *
 * Full-screen camera component for AI food recognition.
 * Features:
 * - Camera preview with overlay guide
 * - Photo capture
 * - Barcode detection
 * - AI food analysis
 * - Results display
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import {
  scanFoodImage,
  lookupBarcode,
  getDemoResult,
  DetectedFood,
  ScanResult,
} from '../services/aiFoodScanner';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const colors = {
  background: '#0D0F0D',
  cardBg: '#151916',
  cardBgElevated: '#1A1D1A',
  primaryGreen: '#4ADE80',
  secondaryGreen: '#22C55E',
  greenMuted: 'rgba(74, 222, 128, 0.15)',
  greenBorder: 'rgba(74, 222, 128, 0.3)',
  greenGlow: 'rgba(74, 222, 128, 0.4)',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  error: '#F87171',
  warning: '#FBBF24',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

// ============================================================================
// TYPES
// ============================================================================
interface FoodCameraScannerProps {
  onClose: () => void;
  onFoodSelected: (foods: DetectedFood[]) => void;
}

type ScanMode = 'camera' | 'scanning' | 'results' | 'error';

// ============================================================================
// COMPONENT
// ============================================================================
export default function FoodCameraScanner({ onClose, onFoodSelected }: FoodCameraScannerProps) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);

  // Permissions
  const [permission, requestPermission] = useCameraPermissions();

  // State
  const [mode, setMode] = useState<ScanMode>('camera');
  const [facing, setFacing] = useState<CameraType>('back');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedFoods, setSelectedFoods] = useState<Set<string>>(new Set());
  const [isBarcodeScan, setIsBarcodeScan] = useState(false);
  const [lastBarcode, setLastBarcode] = useState<string>('');

  // Animations
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Start scan line animation
  useEffect(() => {
    if (mode === 'scanning') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [mode]);

  // Pulse animation for capture button
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Request camera permission on mount
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  // Handle barcode detection
  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (mode !== 'camera' || lastBarcode === result.data) return;

    setLastBarcode(result.data);
    setIsBarcodeScan(true);
    setMode('scanning');

    try {
      const barcodeResult = await lookupBarcode(result.data);

      if (barcodeResult.success && barcodeResult.food) {
        setScanResult({
          success: true,
          title: 'Product Found!',
          items: [barcodeResult.food],
        });
        setMode('results');
      } else {
        setScanResult({
          success: false,
          title: 'Product Not Found',
          items: [],
          error: 'This barcode is not in our database. Try scanning the food instead.',
          errorType: 'no_food',
        });
        setMode('error');
      }
    } catch (error) {
      console.error('Barcode scan error:', error);
      setMode('camera');
    }

    // Reset barcode after 3 seconds to allow re-scanning
    setTimeout(() => setLastBarcode(''), 3000);
  };

  // Capture photo and analyze
  const handleCapture = async () => {
    if (!cameraRef.current || mode !== 'camera') return;

    setIsBarcodeScan(false);
    setMode('scanning');

    try {
      // Capture the photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: true,
      });

      if (!photo?.uri) {
        throw new Error('Failed to capture photo');
      }

      // Analyze with AI
      const result = await scanFoodImage(photo.uri);
      setScanResult(result);
      setMode(result.success ? 'results' : 'error');
    } catch (error) {
      console.error('Capture error:', error);
      setScanResult({
        success: false,
        title: 'Scan Failed',
        items: [],
        error: 'Failed to capture or analyze the image. Please try again.',
        errorType: 'api_error',
      });
      setMode('error');
    }
  };

  // Demo mode - no API keys needed
  const handleDemoScan = () => {
    setMode('scanning');
    setTimeout(() => {
      const demoResult = getDemoResult();
      setScanResult(demoResult);
      setMode('results');
    }, 1500);
  };

  // Toggle food selection
  const toggleFoodSelection = (foodId: string) => {
    setSelectedFoods(prev => {
      const newSet = new Set(prev);
      if (newSet.has(foodId)) {
        newSet.delete(foodId);
      } else {
        newSet.add(foodId);
      }
      return newSet;
    });
  };

  // Select all foods
  const selectAllFoods = () => {
    if (scanResult?.items) {
      setSelectedFoods(new Set(scanResult.items.map(f => f.id)));
    }
  };

  // Add selected foods
  const handleAddSelected = () => {
    if (scanResult?.items && selectedFoods.size > 0) {
      const foods = scanResult.items.filter(f => selectedFoods.has(f.id));
      onFoodSelected(foods);
    }
  };

  // Reset to camera
  const handleRetry = () => {
    setMode('camera');
    setScanResult(null);
    setSelectedFoods(new Set());
  };

  // Permission handling
  if (!permission) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primaryGreen} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionContainer, { paddingTop: insets.top }]}>
        <Ionicons name="camera-outline" size={64} color={colors.textMuted} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          We need camera access to scan and identify your food.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButtonAlt} onPress={onClose}>
          <Text style={styles.closeButtonAltText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render results view
  const renderResults = () => (
    <View style={[styles.resultsContainer, { paddingTop: insets.top + 16 }]}>
      <View style={styles.resultsHeader}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.resultsTitle}>{scanResult?.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {scanResult?.success && (
        <View style={styles.selectAllRow}>
          <Text style={styles.itemCount}>{scanResult.items.length} items detected</Text>
          <TouchableOpacity onPress={selectAllFoods}>
            <Text style={styles.selectAllText}>Select All</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.resultsScroll} showsVerticalScrollIndicator={false}>
        {scanResult?.items.map((food) => (
          <TouchableOpacity
            key={food.id}
            style={[
              styles.foodItem,
              selectedFoods.has(food.id) && styles.foodItemSelected,
            ]}
            onPress={() => toggleFoodSelection(food.id)}
            activeOpacity={0.7}
          >
            <View style={styles.foodItemLeft}>
              <Text style={styles.foodEmoji}>{food.icon}</Text>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodQuantity}>{food.quantity}</Text>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>{food.match}% match</Text>
                </View>
              </View>
            </View>
            <View style={styles.foodItemRight}>
              <Text style={styles.calories}>{food.calories} cal</Text>
              <Text style={styles.protein}>P: {food.protein}g</Text>
            </View>
            <View style={[
              styles.checkbox,
              selectedFoods.has(food.id) && styles.checkboxSelected,
            ]}>
              {selectedFoods.has(food.id) && (
                <Ionicons name="checkmark" size={16} color={colors.background} />
              )}
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Ionicons name="camera" size={20} color={colors.textSecondary} />
          <Text style={styles.retryButtonText}>Scan Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.addButton,
            selectedFoods.size === 0 && styles.addButtonDisabled,
          ]}
          onPress={handleAddSelected}
          disabled={selectedFoods.size === 0}
        >
          <LinearGradient
            colors={selectedFoods.size > 0 ? [colors.primaryGreen, colors.secondaryGreen] : ['#444', '#333']}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={20} color={selectedFoods.size > 0 ? colors.background : colors.textMuted} />
            <Text style={[
              styles.addButtonText,
              selectedFoods.size === 0 && styles.addButtonTextDisabled,
            ]}>
              Add {selectedFoods.size > 0 ? `(${selectedFoods.size})` : 'Selected'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render error view
  const renderError = () => (
    <View style={[styles.errorContainer, { paddingTop: insets.top + 16 }]}>
      <TouchableOpacity onPress={onClose} style={styles.closeButtonError}>
        <Ionicons name="close" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.errorContent}>
        <View style={styles.errorIcon}>
          <Ionicons
            name={scanResult?.errorType === 'blurry' ? 'eye-off' : 'restaurant-outline'}
            size={48}
            color={colors.warning}
          />
        </View>
        <Text style={styles.errorTitle}>{scanResult?.title || 'Scan Failed'}</Text>
        <Text style={styles.errorMessage}>{scanResult?.error}</Text>

        <TouchableOpacity style={styles.retryButtonLarge} onPress={handleRetry}>
          <LinearGradient
            colors={[colors.primaryGreen, colors.secondaryGreen]}
            style={styles.retryButtonGradient}
          >
            <Ionicons name="camera" size={20} color={colors.background} />
            <Text style={styles.retryButtonLargeText}>Try Again</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render scanning overlay
  const renderScanning = () => (
    <View style={styles.scanningOverlay}>
      <ActivityIndicator size="large" color={colors.primaryGreen} />
      <Text style={styles.scanningText}>
        {isBarcodeScan ? 'Looking up product...' : 'Analyzing food...'}
      </Text>
      <Text style={styles.scanningSubtext}>
        {isBarcodeScan ? 'Searching nutrition database' : 'AI is identifying your meal'}
      </Text>
      <Animated.View
        style={[
          styles.scanLine,
          {
            transform: [
              {
                translateY: scanLineAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, 100],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );

  // Main camera view
  return (
    <View style={styles.container}>
      {/* Camera */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={mode === 'camera' ? handleBarcodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
        }}
      >
        {/* Overlay */}
        {mode === 'camera' && (
          <View style={styles.overlay}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
              <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Scan Food</Text>
              <TouchableOpacity
                onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
                style={styles.headerButton}
              >
                <Ionicons name="camera-reverse" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Guide Frame */}
            <View style={styles.guideContainer}>
              <View style={styles.guideFrame}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
              <Text style={styles.guideText}>Align your meal in the frame</Text>
              <Text style={styles.guideSubtext}>Works with plates, bowls, drinks, or barcodes</Text>
            </View>

            {/* Bottom Controls */}
            <View style={[styles.controls, { paddingBottom: insets.bottom + 24 }]}>
              {/* Demo button for testing */}
              <TouchableOpacity style={styles.demoButton} onPress={handleDemoScan}>
                <Ionicons name="flask" size={20} color={colors.textSecondary} />
                <Text style={styles.demoButtonText}>Demo</Text>
              </TouchableOpacity>

              {/* Capture Button */}
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={handleCapture}
                  activeOpacity={0.8}
                >
                  <View style={styles.captureButtonInner}>
                    <Ionicons name="scan" size={32} color={colors.background} />
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {/* Barcode hint */}
              <View style={styles.barcodeHint}>
                <Ionicons name="barcode-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.barcodeHintText}>Auto-detect</Text>
              </View>
            </View>
          </View>
        )}

        {/* Scanning State */}
        {mode === 'scanning' && renderScanning()}
      </CameraView>

      {/* Results Overlay */}
      {mode === 'results' && renderResults()}

      {/* Error Overlay */}
      {mode === 'error' && renderError()}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  guideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: SCREEN_WIDTH - 64,
    height: SCREEN_WIDTH - 64,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.primaryGreen,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12,
  },
  guideText: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  guideSubtext: {
    marginTop: 8,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primaryGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  demoButton: {
    alignItems: 'center',
    gap: 4,
  },
  demoButtonText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  barcodeHint: {
    alignItems: 'center',
    gap: 4,
  },
  barcodeHintText: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Scanning overlay
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningText: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: '600',
    color: colors.primaryGreen,
  },
  scanningSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  scanLine: {
    position: 'absolute',
    width: SCREEN_WIDTH - 100,
    height: 2,
    backgroundColor: colors.primaryGreen,
    shadowColor: colors.primaryGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },

  // Results
  resultsContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryGreen,
  },
  selectAllRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  itemCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryGreen,
  },
  resultsScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  foodItemSelected: {
    borderColor: colors.primaryGreen,
    backgroundColor: colors.greenMuted,
  },
  foodItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  foodEmoji: {
    fontSize: 36,
    marginRight: 12,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  foodQuantity: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  matchBadge: {
    backgroundColor: colors.greenMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  matchText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryGreen,
  },
  foodItemRight: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  calories: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  protein: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primaryGreen,
    borderColor: colors.primaryGreen,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.greenBorder,
    backgroundColor: colors.cardBgElevated,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.greenBorder,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  addButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.background,
  },
  addButtonTextDisabled: {
    color: colors.textMuted,
  },

  // Error
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  closeButtonError: {
    position: 'absolute',
    top: 60,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  retryButtonLarge: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  retryButtonLargeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },

  // Permission
  permissionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 24,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: colors.primaryGreen,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  closeButtonAlt: {
    paddingVertical: 12,
  },
  closeButtonAltText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
});
