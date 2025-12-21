/**
 * Product Card Component
 *
 * Reusable product card with grid and list variants
 * Supports sale badges, ratings, premium brands, and AI recommendations
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Product,
  RecommendedProduct,
  formatPrice,
  getStarRating,
  isPremiumBrand,
} from '../../types/shop';

interface ProductCardProps {
  product: Product | RecommendedProduct;
  variant?: 'grid' | 'list';
  showRecommendation?: boolean;
  onPress?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'grid',
  showRecommendation = false,
  onPress,
}) => {
  const router = useRouter();

  // Check if product is a recommended product
  const isRecommended = 'confidence_score' in product;
  const productData: Product = isRecommended
    ? (product as RecommendedProduct).product
    : (product as Product);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/shop/product/${productData.id}`);
    }
  };

  if (variant === 'list') {
    return (
      <TouchableOpacity style={styles.listContainer} onPress={handlePress}>
        <View style={styles.listImageContainer}>
          {productData.thumbnail_url ? (
            <Image
              source={{ uri: productData.thumbnail_url }}
              style={styles.listImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.listImage, styles.placeholderImage]}>
              <Ionicons name="cube-outline" size={32} color="#6B7280" />
            </View>
          )}

          {productData.is_on_sale && productData.discount_percentage > 0 && (
            <View style={styles.listSaleBadge}>
              <Text style={styles.saleBadgeText}>-{productData.discount_percentage}%</Text>
            </View>
          )}
        </View>

        <View style={styles.listContent}>
          <View style={styles.listHeader}>
            <Text style={styles.listBrand} numberOfLines={1}>
              {productData.brand || 'No Brand'}
              {isPremiumBrand(productData.brand) && (
                <Text style={styles.premiumBadge}> ★</Text>
              )}
            </Text>
            {!productData.is_in_stock && (
              <Text style={styles.outOfStockBadge}>OUT OF STOCK</Text>
            )}
          </View>

          <Text style={styles.listName} numberOfLines={2}>
            {productData.name}
          </Text>

          {isRecommended && showRecommendation && (
            <View style={styles.recommendationBadge}>
              <Ionicons name="sparkles" size={12} color="#8B5CF6" />
              <Text style={styles.recommendationText}>
                {Math.round((product as RecommendedProduct).confidence_score * 100)}% Match
              </Text>
            </View>
          )}

          <View style={styles.listFooter}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingStars}>
                {getStarRating(productData.average_rating).substring(0, 1)}
              </Text>
              <Text style={styles.ratingText}>
                {productData.average_rating.toFixed(1)}
              </Text>
              <Text style={styles.ratingCount}>({productData.rating_count})</Text>
            </View>

            <View style={styles.priceContainer}>
              {productData.is_on_sale && productData.compare_at_price && (
                <Text style={styles.comparePrice}>
                  {formatPrice(productData.compare_at_price)}
                </Text>
              )}
              <Text style={styles.listPrice}>{formatPrice(productData.price)}</Text>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
      </TouchableOpacity>
    );
  }

  // Grid variant (default)
  return (
    <TouchableOpacity style={styles.gridContainer} onPress={handlePress}>
      <View style={styles.imageContainer}>
        {productData.thumbnail_url ? (
          <Image
            source={{ uri: productData.thumbnail_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Ionicons name="cube-outline" size={48} color="#6B7280" />
          </View>
        )}

        {productData.is_on_sale && productData.discount_percentage > 0 && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>-{productData.discount_percentage}%</Text>
          </View>
        )}

        {productData.is_featured && !productData.is_on_sale && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={14} color="#FFF" />
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}

        {!productData.is_in_stock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.brandRow}>
          <Text style={styles.brand} numberOfLines={1}>
            {productData.brand || 'No Brand'}
          </Text>
          {isPremiumBrand(productData.brand) && (
            <View style={styles.premiumIcon}>
              <Ionicons name="shield-checkmark" size={12} color="#F59E0B" />
            </View>
          )}
        </View>

        <Text style={styles.name} numberOfLines={2}>
          {productData.name}
        </Text>

        {isRecommended && showRecommendation && (
          <View style={styles.aiRecommendation}>
            <Ionicons name="sparkles" size={10} color="#8B5CF6" />
            <Text style={styles.aiText} numberOfLines={1}>
              {(product as RecommendedProduct).recommendation_reason}
            </Text>
          </View>
        )}

        <View style={styles.rating}>
          <Text style={styles.ratingStars}>
            {getStarRating(productData.average_rating).substring(0, 1)}
          </Text>
          <Text style={styles.ratingText}>{productData.average_rating.toFixed(1)}</Text>
          <Text style={styles.ratingCount}>({productData.rating_count})</Text>
        </View>

        <View style={styles.priceRow}>
          {productData.is_on_sale && productData.compare_at_price && (
            <Text style={styles.comparePrice}>
              {formatPrice(productData.compare_at_price)}
            </Text>
          )}
          <Text style={styles.price}>{formatPrice(productData.price)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Grid styles
  gridContainer: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#2D2D2D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saleBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saleBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  outOfStockOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 8,
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  brand: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    flex: 1,
  },
  premiumIcon: {
    marginLeft: 4,
  },
  name: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 18,
  },
  aiRecommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 8,
  },
  aiText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingStars: {
    color: '#F59E0B',
    fontSize: 12,
  },
  ratingText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  ratingCount: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  comparePrice: {
    color: '#9CA3AF',
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  price: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: '700',
  },

  // List styles
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  listImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  listSaleBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  listContent: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listBrand: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    flex: 1,
  },
  premiumBadge: {
    color: '#F59E0B',
  },
  outOfStockBadge: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '700',
  },
  listName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 18,
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  recommendationText: {
    color: '#8B5CF6',
    fontSize: 11,
    fontWeight: '600',
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listPrice: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProductCard;
