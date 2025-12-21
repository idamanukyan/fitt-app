/**
 * GIFPlayer - Video/GIF player component with play/pause controls
 * For exercise demonstration media
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, radius } from '../../../design/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GIFPlayerProps {
  gifUrl?: string | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  exerciseName: string;
  height?: number;
  autoPlay?: boolean;
  showControls?: boolean;
  showFullscreenButton?: boolean;
  style?: object;
}

export const GIFPlayer: React.FC<GIFPlayerProps> = ({
  gifUrl,
  videoUrl,
  thumbnailUrl,
  exerciseName,
  height = 280,
  autoPlay = true,
  showControls = true,
  showFullscreenButton = true,
  style,
}) => {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mediaUrl = videoUrl || gifUrl;
  const isVideo = Boolean(videoUrl);

  const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setIsPlaying(status.isPlaying);
    }
  }, []);

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const renderMedia = (fullscreen = false) => {
    const containerHeight = fullscreen ? SCREEN_HEIGHT * 0.6 : height;
    const containerWidth = fullscreen ? SCREEN_WIDTH : '100%';

    if (!mediaUrl && !thumbnailUrl) {
      return (
        <View style={[styles.placeholder, { height: containerHeight }]}>
          <Ionicons name="barbell" size={64} color={colors.textMuted} />
          <Text style={styles.placeholderText}>No preview available</Text>
        </View>
      );
    }

    if (hasError) {
      return (
        <View style={[styles.placeholder, { height: containerHeight }]}>
          <Ionicons name="image-outline" size={48} color={colors.textMuted} />
          <Text style={styles.placeholderText}>Failed to load</Text>
          <TouchableOpacity
            onPress={() => {
              setHasError(false);
              setIsLoading(true);
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isVideo && mediaUrl) {
      return (
        <View style={{ height: containerHeight, width: containerWidth }}>
          <Video
            ref={videoRef}
            source={{ uri: mediaUrl }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            isLooping
            shouldPlay={autoPlay && !fullscreen}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            onError={() => setHasError(true)}
          />
          {isLoading && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        </View>
      );
    }

    // For GIFs or static images
    const imageSource = mediaUrl || thumbnailUrl;
    return (
      <View style={{ height: containerHeight, width: containerWidth }}>
        <Image
          source={{ uri: imageSource! }}
          style={[styles.image, { height: containerHeight }]}
          resizeMode="cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        {isLoading && (
          <View style={styles.loaderOverlay}>
            <View style={styles.skeleton} />
          </View>
        )}
      </View>
    );
  };

  const renderControls = () => {
    if (!showControls || !isVideo) return null;

    return (
      <View style={styles.controlsOverlay}>
        <TouchableOpacity
          onPress={togglePlayPause}
          style={styles.playButton}
          activeOpacity={0.8}
        >
          <View style={styles.playButtonBg}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color={colors.textInverse}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { height }, style]}>
      {renderMedia()}

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(15,15,35,0.6)', 'rgba(15,15,35,0.9)']}
        style={styles.gradientOverlay}
      />

      {/* Play/Pause Controls */}
      {renderControls()}

      {/* Fullscreen Button */}
      {showFullscreenButton && (
        <TouchableOpacity
          style={styles.fullscreenButton}
          onPress={() => setIsFullscreen(true)}
          activeOpacity={0.8}
        >
          <View style={styles.fullscreenButtonBg}>
            <Ionicons name="expand" size={18} color={colors.textPrimary} />
          </View>
        </TouchableOpacity>
      )}

      {/* Fullscreen Modal */}
      <Modal
        visible={isFullscreen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsFullscreen(false)}
      >
        <View style={styles.fullscreenContainer}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
            style={StyleSheet.absoluteFillObject}
          />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsFullscreen(false)}
          >
            <View style={styles.closeButtonBg}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </View>
          </TouchableOpacity>

          <View style={styles.fullscreenMediaContainer}>
            {renderMedia(true)}
          </View>

          <Text style={styles.fullscreenTitle}>{exerciseName}</Text>

          {isVideo && (
            <TouchableOpacity
              onPress={togglePlayPause}
              style={styles.fullscreenPlayButton}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.fullscreenPlayGradient}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={28}
                  color={colors.textInverse}
                />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.bgCard,
  },
  image: {
    width: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  retryButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.glass,
    borderRadius: radius.md,
  },
  retryText: {
    fontSize: typography.size.sm,
    color: colors.primary,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
  },
  skeleton: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.glass,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    opacity: 0.9,
  },
  playButtonBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  fullscreenButtonBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: spacing.xl,
    zIndex: 10,
  },
  closeButtonBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  fullscreenMediaContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginTop: spacing['2xl'],
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  fullscreenPlayButton: {
    marginTop: spacing['2xl'],
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fullscreenPlayGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GIFPlayer;
