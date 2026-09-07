import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://e-ticaret-backend-7i6u.onrender.com';

const SellerPanel = ({ onLogout }) => {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [sellingId, setSellingId] = useState(null);
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      setError('');
      const response = await axios.get(`${API_BASE_URL}/products/`);
      setProducts(response.data.filter((product) => product.stock > 0));
    } catch (requestError) {
      setError('Ürünler yüklenemedi. Backend bağlantısını kontrol edin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSale = async (product) => {
    const quantity = Number(quantities[product.id]);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) {
      toast.warning(`1 ile ${product.stock} arasında bir adet girin.`);
      return;
    }

    try {
      setSellingId(product.id);
      await axios.post(`${API_BASE_URL}/products/${product.id}/sale`, { quantity });
      setQuantities((current) => ({ ...current, [product.id]: '' }));
      await fetchProducts();
      toast.success(`${quantity} adet ${product.name} stoktan düşüldü.`);
    } catch (requestError) {
      toast.error(requestError.response?.data?.detail || 'Satış işlemi gerçekleştirilemedi.');
      await fetchProducts();
    } finally {
      setSellingId(null);
    }
  };

  return (
    <div className="seller-container">
      <header className="seller-header">
        <div>
          <span className="seller-eyebrow">Satıcı Paneli</span>
          <h1>Güncel Ürün Stokları</h1>
          <p>Satış yaptığınız ürünün adedini stoktan düşürün.</p>
        </div>
        <button type="button" className="logout-button" onClick={onLogout}>Çıkış Yap</button>
      </header>
      <main className="seller-content">
        {loading && <div className="seller-message">Ürünler yükleniyor...</div>}
        {!loading && error && <div className="seller-message seller-error">{error}</div>}
        {!loading && !error && products.length === 0 && (
          <div className="seller-message">Şu anda stokta olan ürün bulunmuyor.</div>
        )}
        {!loading && !error && products.length > 0 && (
          <div className="seller-product-list">
            {products.map((product) => (
              <article className="seller-product" key={product.id}>
                <div>
                  <h2>{product.name}</h2>
                  <p>₺{product.price.toFixed(2)}</p>
                </div>
                <div className="seller-stock">
                  <strong>{product.stock}</strong>
                  <span>adet mevcut</span>
                </div>
                <div className="sale-controls">
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantities[product.id] || ''}
                    onChange={(event) => setQuantities((current) => ({ ...current, [product.id]: event.target.value }))}
                    placeholder="Adet"
                    aria-label={`${product.name} satış adedi`}
                  />
                  <button
                    type="button"
                    onClick={() => handleSale(product)}
                    disabled={sellingId === product.id}
                  >
                    {sellingId === product.id ? 'İşleniyor...' : 'Satış Yap'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SellerPanel;
