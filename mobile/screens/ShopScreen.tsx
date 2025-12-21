/**
 * Shop Screen
 *
 * Main product catalog with AI recommendations, search, and filters
 * Features: Category filtering, search, featured products, recommendations
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import shopService from '../services/shopService';
import ProductCard from '../components/molecules/ProductCard';
import {
  Product,
  ProductCategory,
  RecommendedProduct,
  getCategoryIcon,
  getCategoryLabel,
} from '../types/shop';

const ShopScreen: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [showOnSale, setShowOnSale] = useState(false);

  // Data
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);

  const categories = Object.values(ProductCategory);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, showOnSale, page]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load recommendations and featured products in parallel
      const [recommendationsRes, featuredRes] = await Promise.all([
        shopService.recommendations.getRecommendations({ limit: 5 }),
        shopService.products.getFeaturedProducts(6),
      ]);

      setRecommendedProducts(recommendationsRes.recommendations);
      setFeaturedProducts(featuredRes.products);

      // Load main products
      await loadProducts();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const filters: any = {};

      if (selectedCategory) {
        filters.category = selectedCategory;
      }

      if (showOnSale) {
        filters.is_on_sale = true;
      }

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const response = await shopService.products.getProducts(page, 20, filters);

      if (page === 1) {
        setProducts(response.products);
      } else {
        setProducts((prev) => [...prev, ...response.products]);
      }

      setTotalProducts(response.total);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await loadInitialData();
    setRefreshing(false);
  }, []);

  const handleSearch = () => {
    setPage(1);
    loadProducts();
  };

  const handleCategorySelect = (category: ProductCategory) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
    setPage(1);
  };

  const handleLoadMore = () => {
    if (products.length < totalProducts) {
      setPage((prev) => prev + 1);
    }
  };

  const renderCategoryChip = (category: ProductCategory) => {
    const isSelected = selectedCategory === category;

    return (
      <TouchableOpacity
        key={category}
        style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
        onPress={() => handleCategorySelect(category)}
      >
        <Ionicons
          name={getCategoryIcon(category) as any}
          size={16}
          color={isSelected ? '#FFF' : '#9CA3AF'}
        />
        <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
          {getCategoryLabel(category)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRecommendedProduct = ({ item }: { item: RecommendedProduct }) => (
    <View style={styles.recommendedCard}>
      <ProductCard product={item} variant="grid" showRecommendation={true} />
    </View>
  );

  const renderFeaturedProduct = ({ item }: { item: Product }) => (
    <View style={styles.featuredCard}>
      <ProductCard product={item} variant="grid" />
    </View>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <ProductCard product={item} variant="list" />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading shop...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Shop</Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push('/shop/cart')}
        >
          <Ionicons name="cart-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                setPage(1);
                loadProducts();
              }}>
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterChip, showOnSale && styles.filterChipActive]}
              onPress={() => {
                setShowOnSale(!showOnSale);
                setPage(1);
              }}
            >
              <Ionicons name="pricetag" size={16} color={showOnSale ? '#FFF' : '#9CA3AF'} />
              <Text style={[styles.filterText, showOnSale && styles.filterTextActive]}>
                On Sale
              </Text>
            </TouchableOpacity>

            {categories.map(renderCategoryChip)}
          </ScrollView>
        </View>

        {/* AI Recommendations */}
        {recommendedProducts.length > 0 && !searchQuery && !selectedCategory && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles" size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Recommended for You</Text>
            </View>
            <FlatList
              data={recommendedProducts}
              renderItem={renderRecommendedProduct}
              keyExtractor={(item) => item.product.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && !searchQuery && !selectedCategory && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Featured Products</Text>
            </View>
            <FlatList
              data={featuredProducts}
              renderItem={renderFeaturedProduct}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* All Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory
                ? getCategoryLabel(selectedCategory)
                : showOnSale
                ? 'Sale Items'
                : searchQuery
                ? 'Search Results'
                : 'All Products'}
            </Text>
            <Text style={styles.productCount}>
              {totalProducts} {totalProducts === 1 ? 'item' : 'items'}
            </Text>
          </View>

          {products.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={64} color="#6B7280" />
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.productsList}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
              />
              {products.length < totalProducts && (
                <ActivityIndicator
                  size="small"
                  color="#8B5CF6"
                  style={styles.loadMoreIndicator}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 12,
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  filterChipActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  filterText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFF',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  categoryChipSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  categoryText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: '#FFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  productCount: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  recommendedCard: {
    width: 180,
    marginRight: 12,
  },
  featuredCard: {
    width: 180,
    marginRight: 12,
  },
  productsList: {
    paddingHorizontal: 20,
  },
  productCard: {
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
  },
  loadMoreIndicator: {
    marginVertical: 20,
  },
});

export default ShopScreen;
