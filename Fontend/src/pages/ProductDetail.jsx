
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Breadcrumb } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(response.data.data);
      setSelectedImage(response.data.data.mainImage);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleQuantityChange = (type) => {
    if (type === 'increase' && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Đang tải sản phẩm...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Link to="/products" className="btn btn-primary">
          Quay lại danh sách sản phẩm
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Trang chủ
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/categories" }}>
          Danh mục
        </Breadcrumb.Item>
        {product.category && (
          <Breadcrumb.Item 
            linkAs={Link} 
            linkProps={{ to: `/category/${product.category.slug}` }}
          >
            {product.category.name}
          </Breadcrumb.Item>
        )}
        <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Row>
        {/* Images */}
        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Img 
              variant="top" 
              src={selectedImage}
              style={{ height: '400px', objectFit: 'contain', padding: '20px' }}
            />
          </Card>
          
          {product.images && product.images.length > 0 && (
            <Row className="mt-3 g-2">
              <Col xs={3}>
                <img 
                  src={product.mainImage}
                  className={`img-thumbnail ${selectedImage === product.mainImage ? 'border-primary' : ''}`}
                  style={{ cursor: 'pointer', height: '80px', objectFit: 'cover' }}
                  onClick={() => setSelectedImage(product.mainImage)}
                />
              </Col>
              {product.images.map((img, index) => (
                <Col xs={3} key={index}>
                  <img 
                    src={img}
                    className={`img-thumbnail ${selectedImage === img ? 'border-primary' : ''}`}
                    style={{ cursor: 'pointer', height: '80px', objectFit: 'cover' }}
                    onClick={() => setSelectedImage(img)}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Col>

        {/* Product Info */}
        <Col md={6}>
          <div className="mb-3">
            {product.featured && (
              <Badge bg="warning" text="dark" className="me-2">
                <i className="bi bi-star-fill"></i> Nổi bật
              </Badge>
            )}
            {product.stock > 0 ? (
              <Badge bg="success">Còn hàng</Badge>
            ) : (
              <Badge bg="danger">Hết hàng</Badge>
            )}
          </div>

          <h2 className="mb-3">{product.name}</h2>

          {/* Rating */}
          <div className="mb-3">
            <div className="d-flex align-items-center">
              <span className="text-warning me-2" style={{ fontSize: '1.2rem' }}>
                {'★'.repeat(Math.floor(product.rating))}
                {'☆'.repeat(5 - Math.floor(product.rating))}
              </span>
              <span className="text-muted">
                {product.rating} ({product.numReviews} đánh giá)
              </span>
              <span className="ms-3 text-muted">
                <i className="bi bi-bag-check"></i> Đã bán: {product.sold}
              </span>
            </div>
          </div>

          {/* Price */}
          <Card className="bg-light border-0 mb-3">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h3 className="text-danger mb-0">{formatPrice(product.price)}</h3>
                  {product.originalPrice && (
                    <div>
                      <small className="text-muted text-decoration-line-through me-2">
                        {formatPrice(product.originalPrice)}
                      </small>
                      {product.discount > 0 && (
                        <Badge bg="danger">-{product.discount}%</Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Quantity */}
          <div className="mb-3">
            <label className="form-label fw-bold">Số lượng:</label>
            <div className="d-flex align-items-center">
              <Button 
                variant="outline-secondary" 
                onClick={() => handleQuantityChange('decrease')}
                disabled={quantity <= 1}
              >
                <i className="bi bi-dash"></i>
              </Button>
              <span className="mx-3 fw-bold">{quantity}</span>
              <Button 
                variant="outline-secondary" 
                onClick={() => handleQuantityChange('increase')}
                disabled={quantity >= product.stock}
              >
                <i className="bi bi-plus"></i>
              </Button>
              <span className="ms-3 text-muted">
                {product.stock} sản phẩm có sẵn
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="d-grid gap-2">
            <Button 
              variant="danger" 
              size="lg"
              disabled={product.stock === 0}
            >
              <i className="bi bi-cart-plus"></i> Thêm vào giỏ hàng
            </Button>
            <Button 
              variant="primary" 
              size="lg"
              disabled={product.stock === 0}
            >
              Mua ngay
            </Button>
          </div>

          {/* Category */}
          {product.category && (
            <div className="mt-4">
              <strong>Danh mục: </strong>
              <Link to={`/category/${product.category.slug}`}>
                {product.category.name}
              </Link>
            </div>
          )}
        </Col>
      </Row>

      {/* Description */}
      <Row className="mt-5">
        <Col>
          <Card>
            <Card.Header>
              <h4 className="mb-0">Mô tả sản phẩm</h4>
            </Card.Header>
            <Card.Body>
              <p style={{ whiteSpace: 'pre-line' }}>{product.description}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;