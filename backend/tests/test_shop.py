"""
Shop API Tests

Tests for products, cart, orders, and reviews.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.shop import (
    Product, ProductCategory, Order, OrderStatus,
    OrderItem, ShoppingCart, CartItem, ProductReview,
)


@pytest.fixture
def sample_product(test_db: Session) -> Product:
    """Create a sample product."""
    product = Product(
        name="Whey Protein",
        slug="whey-protein",
        description="High quality whey protein powder",
        short_description="Premium whey protein",
        category=ProductCategory.SUPPLEMENTS,
        brand="Optimum Nutrition",
        price=49.99,
        compare_at_price=59.99,
        sku="WP-001",
        stock_quantity=100,
        is_active=True,
        is_featured=True,
        is_on_sale=True,
    )
    test_db.add(product)
    test_db.commit()
    test_db.refresh(product)
    return product


@pytest.fixture
def sample_product_2(test_db: Session) -> Product:
    """Create a second sample product."""
    product = Product(
        name="Resistance Bands",
        slug="resistance-bands",
        description="Set of 5 resistance bands",
        category=ProductCategory.EQUIPMENT,
        brand="FitGear",
        price=24.99,
        sku="RB-001",
        stock_quantity=50,
        is_active=True,
    )
    test_db.add(product)
    test_db.commit()
    test_db.refresh(product)
    return product


@pytest.fixture
def out_of_stock_product(test_db: Session) -> Product:
    """Create an out-of-stock product."""
    product = Product(
        name="Limited Edition Shaker",
        slug="limited-shaker",
        category=ProductCategory.ACCESSORIES,
        brand="BlenderBottle",
        price=19.99,
        sku="LS-001",
        stock_quantity=0,
        is_active=True,
    )
    test_db.add(product)
    test_db.commit()
    test_db.refresh(product)
    return product


class TestProductList:
    """Tests for product listing endpoint."""

    def test_list_products(self, client: TestClient, sample_product):
        """Test listing products."""
        response = client.get("/api/v1/shop/products")
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        assert data["total"] >= 1

    def test_list_products_no_auth_required(self, client: TestClient):
        """Test listing products doesn't require auth."""
        response = client.get("/api/v1/shop/products")
        assert response.status_code == 200

    def test_list_products_filter_category(
        self, client: TestClient, sample_product, sample_product_2
    ):
        """Test filtering products by category."""
        response = client.get("/api/v1/shop/products?category=supplements")
        assert response.status_code == 200
        data = response.json()
        for product in data["products"]:
            assert product["category"] == "supplements"

    def test_list_products_filter_featured(self, client: TestClient, sample_product):
        """Test filtering featured products."""
        response = client.get("/api/v1/shop/products?is_featured=true")
        assert response.status_code == 200
        data = response.json()
        for product in data["products"]:
            assert product["is_featured"] is True

    def test_list_products_filter_on_sale(self, client: TestClient, sample_product):
        """Test filtering products on sale."""
        response = client.get("/api/v1/shop/products?is_on_sale=true")
        assert response.status_code == 200

    def test_list_products_search(
        self, client: TestClient, sample_product, sample_product_2
    ):
        """Test searching products."""
        response = client.get("/api/v1/shop/products?search=whey")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    def test_list_products_price_range(self, client: TestClient, sample_product):
        """Test filtering by price range."""
        response = client.get(
            "/api/v1/shop/products?min_price=40&max_price=60"
        )
        assert response.status_code == 200

    def test_list_products_in_stock_only(
        self, client: TestClient, sample_product, out_of_stock_product
    ):
        """Test in_stock_only filter (default: true)."""
        response = client.get("/api/v1/shop/products?in_stock_only=true")
        assert response.status_code == 200
        data = response.json()
        for product in data["products"]:
            assert product["is_in_stock"] is True

    def test_list_products_pagination(self, client: TestClient, sample_product):
        """Test product pagination."""
        response = client.get("/api/v1/shop/products?page=1&page_size=5")
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert data["page_size"] == 5


class TestProductDetail:
    """Tests for product detail endpoints."""

    def test_get_product_by_id(self, client: TestClient, sample_product):
        """Test getting product by ID."""
        response = client.get(f"/api/v1/shop/products/{sample_product.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Whey Protein"
        assert data["price"] == 49.99

    def test_get_product_by_slug(self, client: TestClient, sample_product):
        """Test getting product by slug."""
        response = client.get("/api/v1/shop/products/slug/whey-protein")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Whey Protein"

    def test_get_nonexistent_product(self, client: TestClient):
        """Test getting non-existent product returns 404."""
        response = client.get("/api/v1/shop/products/99999")
        assert response.status_code == 404

    def test_get_nonexistent_product_slug(self, client: TestClient):
        """Test getting non-existent slug returns 404."""
        response = client.get("/api/v1/shop/products/slug/nonexistent")
        assert response.status_code == 404


class TestProductAdmin:
    """Tests for admin product management."""

    def test_create_product_as_admin(self, client: TestClient, admin_auth_headers):
        """Test admin can create products."""
        response = client.post(
            "/api/v1/shop/products",
            json={
                "name": "New Supplement",
                "category": "supplements",
                "price": 34.99,
                "description": "A new supplement product",
                "stock_quantity": 200,
            },
            headers=admin_auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "New Supplement"

    def test_create_product_as_user_forbidden(self, client: TestClient, auth_headers):
        """Test regular user cannot create products."""
        response = client.post(
            "/api/v1/shop/products",
            json={
                "name": "Unauthorized Product",
                "category": "supplements",
                "price": 10.0,
            },
            headers=auth_headers,
        )
        assert response.status_code == 403

    def test_create_product_unauthenticated(self, client: TestClient):
        """Test unauthenticated cannot create products."""
        response = client.post(
            "/api/v1/shop/products",
            json={
                "name": "No Auth Product",
                "category": "supplements",
                "price": 10.0,
            },
        )
        assert response.status_code == 403

    def test_update_product_as_admin(
        self, client: TestClient, admin_auth_headers, sample_product
    ):
        """Test admin can update products."""
        response = client.put(
            f"/api/v1/shop/products/{sample_product.id}",
            json={"name": "Updated Whey Protein", "price": 44.99},
            headers=admin_auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Whey Protein"

    def test_update_product_as_user_forbidden(
        self, client: TestClient, auth_headers, sample_product
    ):
        """Test regular user cannot update products."""
        response = client.put(
            f"/api/v1/shop/products/{sample_product.id}",
            json={"name": "Hacked"},
            headers=auth_headers,
        )
        assert response.status_code == 403

    def test_delete_product_as_admin(
        self, client: TestClient, admin_auth_headers, sample_product
    ):
        """Test admin can delete products."""
        response = client.delete(
            f"/api/v1/shop/products/{sample_product.id}",
            headers=admin_auth_headers,
        )
        assert response.status_code == 204

    def test_delete_product_as_user_forbidden(
        self, client: TestClient, auth_headers, sample_product
    ):
        """Test regular user cannot delete products."""
        response = client.delete(
            f"/api/v1/shop/products/{sample_product.id}",
            headers=auth_headers,
        )
        assert response.status_code == 403


class TestShoppingCart:
    """Tests for shopping cart endpoints."""

    def test_get_cart_unauthenticated(self, client: TestClient):
        """Test getting cart requires auth."""
        response = client.get("/api/v1/shop/cart")
        assert response.status_code == 403

    def test_remove_nonexistent_cart_item(self, client: TestClient, auth_headers):
        """Test removing non-existent cart item returns 404."""
        response = client.delete(
            "/api/v1/shop/cart/items/99999",
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_clear_cart(self, client: TestClient, auth_headers):
        """Test clearing cart."""
        response = client.delete("/api/v1/shop/cart", headers=auth_headers)
        assert response.status_code == 204


class TestOrders:
    """Tests for order endpoints."""

    def test_create_order(
        self, client: TestClient, auth_headers, sample_product
    ):
        """Test creating an order."""
        response = client.post(
            "/api/v1/shop/orders",
            json={
                "items": [
                    {"product_id": sample_product.id, "quantity": 1}
                ],
                "shipping_address": {
                    "name": "John Doe",
                    "email": "john@example.com",
                    "address_line1": "123 Main St",
                    "city": "New York",
                    "state": "NY",
                    "zip": "10001",
                    "country": "US",
                },
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "pending"
        assert "order_number" in data

    def test_create_order_unauthenticated(self, client: TestClient):
        """Test creating order requires auth."""
        response = client.post(
            "/api/v1/shop/orders",
            json={
                "items": [{"product_id": 1, "quantity": 1}],
                "shipping_address": {
                    "name": "Test",
                    "email": "test@test.com",
                    "address_line1": "123 St",
                    "city": "City",
                    "state": "ST",
                    "zip": "00000",
                    "country": "US",
                },
            },
        )
        assert response.status_code == 403

    def test_get_orders(self, client: TestClient, auth_headers):
        """Test getting user's orders."""
        response = client.get("/api/v1/shop/orders", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "orders" in data

    def test_get_order_detail(
        self, client: TestClient, auth_headers, test_db, test_user, sample_product
    ):
        """Test getting a specific order."""
        order = Order(
            order_number="ORD-TEST-001",
            user_id=test_user.id,
            status=OrderStatus.PENDING,
            subtotal=49.99,
            tax=4.00,
            shipping_cost=5.99,
            discount=0.0,
            total=59.98,
            shipping_name="John Doe",
            shipping_email="john@example.com",
            shipping_address_line1="123 Main St",
            shipping_city="New York",
            shipping_state="NY",
            shipping_zip="10001",
            shipping_country="US",
        )
        test_db.add(order)
        test_db.commit()
        test_db.refresh(order)

        response = client.get(
            f"/api/v1/shop/orders/{order.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["order_number"] == "ORD-TEST-001"

    def test_get_other_user_order(
        self, client: TestClient, coach_auth_headers, test_db, test_user
    ):
        """Test user cannot access another user's order."""
        order = Order(
            order_number="ORD-TEST-002",
            user_id=test_user.id,
            status=OrderStatus.PENDING,
            subtotal=10.0,
            total=10.0,
            shipping_name="Test",
            shipping_email="t@t.com",
            shipping_address_line1="123 St",
            shipping_city="City",
            shipping_state="ST",
            shipping_zip="00000",
            shipping_country="US",
        )
        test_db.add(order)
        test_db.commit()
        test_db.refresh(order)

        response = client.get(
            f"/api/v1/shop/orders/{order.id}",
            headers=coach_auth_headers,
        )
        assert response.status_code == 404

    def test_update_order_status_as_admin(
        self, client: TestClient, admin_auth_headers, test_db, test_user
    ):
        """Test admin can update order status."""
        order = Order(
            order_number="ORD-TEST-003",
            user_id=test_user.id,
            status=OrderStatus.PENDING,
            subtotal=50.0,
            total=55.0,
            shipping_name="Test",
            shipping_email="t@t.com",
            shipping_address_line1="123 St",
            shipping_city="City",
            shipping_state="ST",
            shipping_zip="00000",
            shipping_country="US",
        )
        test_db.add(order)
        test_db.commit()
        test_db.refresh(order)

        response = client.put(
            f"/api/v1/shop/orders/{order.id}",
            json={"status": "shipped", "tracking_number": "TRACK123"},
            headers=admin_auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "shipped"

    def test_update_order_as_user_forbidden(
        self, client: TestClient, auth_headers, test_db, test_user
    ):
        """Test regular user cannot update order status."""
        order = Order(
            order_number="ORD-TEST-004",
            user_id=test_user.id,
            status=OrderStatus.PENDING,
            subtotal=10.0,
            total=10.0,
            shipping_name="Test",
            shipping_email="t@t.com",
            shipping_address_line1="123 St",
            shipping_city="City",
            shipping_state="ST",
            shipping_zip="00000",
            shipping_country="US",
        )
        test_db.add(order)
        test_db.commit()
        test_db.refresh(order)

        response = client.put(
            f"/api/v1/shop/orders/{order.id}",
            json={"status": "shipped"},
            headers=auth_headers,
        )
        assert response.status_code == 403


class TestProductReviews:
    """Tests for product review endpoints."""

    def test_get_product_reviews(
        self, client: TestClient, test_db, sample_product, test_user
    ):
        """Test getting product reviews."""
        review = ProductReview(
            product_id=sample_product.id,
            user_id=test_user.id,
            rating=5,
            title="Great product",
            comment="Love it!",
            is_approved=True,
        )
        test_db.add(review)
        test_db.commit()

        response = client.get(
            f"/api/v1/shop/products/{sample_product.id}/reviews"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert "average_rating" in data

    def test_create_review(
        self, client: TestClient, auth_headers, sample_product
    ):
        """Test creating a product review."""
        response = client.post(
            "/api/v1/shop/reviews",
            json={
                "product_id": sample_product.id,
                "rating": 4,
                "title": "Good product",
                "comment": "Solid quality",
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["rating"] == 4
        assert data["title"] == "Good product"

    def test_create_duplicate_review(
        self, client: TestClient, auth_headers, sample_product
    ):
        """Test user cannot review same product twice."""
        # First review
        client.post(
            "/api/v1/shop/reviews",
            json={
                "product_id": sample_product.id,
                "rating": 5,
                "title": "First review",
            },
            headers=auth_headers,
        )
        # Second review should fail
        response = client.post(
            "/api/v1/shop/reviews",
            json={
                "product_id": sample_product.id,
                "rating": 3,
                "title": "Second review",
            },
            headers=auth_headers,
        )
        assert response.status_code == 400

    def test_update_review(
        self, client: TestClient, auth_headers, test_db, test_user, sample_product
    ):
        """Test updating a review."""
        review = ProductReview(
            product_id=sample_product.id,
            user_id=test_user.id,
            rating=3,
            title="OK product",
            is_approved=True,
        )
        test_db.add(review)
        test_db.commit()
        test_db.refresh(review)

        response = client.put(
            f"/api/v1/shop/reviews/{review.id}",
            json={"rating": 5, "title": "Actually great"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["rating"] == 5

    def test_delete_review(
        self, client: TestClient, auth_headers, test_db, test_user, sample_product
    ):
        """Test deleting a review."""
        review = ProductReview(
            product_id=sample_product.id,
            user_id=test_user.id,
            rating=4,
            is_approved=True,
        )
        test_db.add(review)
        test_db.commit()
        test_db.refresh(review)

        response = client.delete(
            f"/api/v1/shop/reviews/{review.id}",
            headers=auth_headers,
        )
        assert response.status_code == 204

    def test_create_review_unauthenticated(self, client: TestClient, sample_product):
        """Test creating review requires auth."""
        response = client.post(
            "/api/v1/shop/reviews",
            json={
                "product_id": sample_product.id,
                "rating": 5,
            },
        )
        assert response.status_code == 403

    def test_update_other_user_review(
        self, client: TestClient, coach_auth_headers, test_db, test_user, sample_product
    ):
        """Test user cannot update another user's review."""
        review = ProductReview(
            product_id=sample_product.id,
            user_id=test_user.id,
            rating=4,
            is_approved=True,
        )
        test_db.add(review)
        test_db.commit()
        test_db.refresh(review)

        response = client.put(
            f"/api/v1/shop/reviews/{review.id}",
            json={"rating": 1},
            headers=coach_auth_headers,
        )
        assert response.status_code == 404
