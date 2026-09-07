import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import StockChart from './StockChart';
import LoginScreen from './LoginScreen';
import SellerPanel from './SellerPanel';

function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [statistics, setStatistics] = useState({
    total_products: 0,
    total_stock: 0,
    total_value: 0
  });
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editFormData, setEditFormData] = useState({ price: '', stock: '' });
  const [, setError] = useState(null);
  const [serverError, setServerError] = useState(false);
  const [role, setRole] = useState(() => localStorage.getItem('userRole'));

  // CANLI BACKEND API LINKI
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://e-ticaret-backend-7i6u.onrender.com';

  // Backend bağlantı kontrolü
  const isBackendAvailable = !serverError;

  const handleLogin = (selectedRole) => {
    localStorage.setItem('userRole', selectedRole);
    setRole(selectedRole);
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    setRole(null);
  };

  // Arama değiştiğinde otomatik filtrele
  useEffect(() => {
    let filtered = products;
    
    // Arama filtresi
    if (searchQuery.trim() !== '') {
      filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sıralama
    let sorted = [...filtered];
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'stock-asc':
        sorted.sort((a, b) => a.stock - b.stock);
        break;
      case 'name':
      default:
        sorted.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        break;
    }

    setFilteredProducts(sorted);
  }, [searchQuery, products, sortBy]);

  const fetchProducts = useCallback(async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE_URL}/products/`;
      if (query) {
        url += `?ara=${encodeURIComponent(query)}`;
      }
      const response = await axios.get(url);
      setProducts(response.data);
      setFilteredProducts(response.data);
      setServerError(false);
    } catch (error) {
      console.error("Çekme hatası:", error);
      setServerError(true);
      setError("Backend bulut sunucusuna bağlanamıyor. Lütfen Render servisinin aktif olduğundan emin olun.");
      toast.error('❌ Canlı Backend sunucusuna bağlanamadı!', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/statistics/`);
      setStatistics(response.data);
      setServerError(false);
    } catch (error) {
      console.error("İstatistik çekme hatası:", error);
      setServerError(true);
      setError("Backend bulut sunucusuna bağlanamıyor.");
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (role === 'admin') {
      fetchProducts();
      fetchStatistics();
    }
  }, [role, fetchProducts, fetchStatistics]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !price || !stock) {
      toast.warning('⚠️ Lütfen tüm alanları doldurunuz!', { position: 'top-right' });
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/products/`, {
        name: name,
        price: parseFloat(price),
        stock: parseInt(stock),
        description: ""
      });
      
      setName('');
      setPrice('');
      setStock('');
      fetchProducts();
      fetchStatistics();
      toast.success(`✅ "${name}" ürünü başarıyla eklendi!`, { position: 'top-right' });
      setServerError(false);
    } catch (error) {
      console.error("Ekleme hatası:", error);
      setServerError(true);
      toast.error('❌ Ürün eklenirken hata oluştu!', { position: 'top-right' });
      setError("Ürün eklenirken hata oluştu. Canlı sunucuyu kontrol ediniz.");
    }
  };

  const handleDelete = async (productId, productName) => {
    if (window.confirm(`"${productName}" ürününü silmek istediğinize emin misiniz?`)) {
      try {
        await axios.delete(`${API_BASE_URL}/products/${productId}`);
        fetchProducts();
        fetchStatistics();
        toast.success(`✅ "${productName}" ürünü silindi!`, { position: 'top-right' });
        setServerError(false);
      } catch (error) {
        console.error("Silme hatası:", error);
        setServerError(true);
        toast.error('❌ Ürün silinirken hata oluştu!', { position: 'top-right' });
        setError("Ürün silinirken hata oluştu.");
      }
    }
  };

  const handleEditClick = (product) => {
    setEditingProductId(product.id);
    setEditFormData({ price: product.price, stock: product.stock });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editFormData.price || editFormData.stock === '') {
      toast.warning('⚠️ Fiyat ve stok alanlarını doldurunuz!', { position: 'top-right' });
      return;
    }

    try {
      const productName = products.find(p => p.id === editingProductId)?.name;
      await axios.put(`${API_BASE_URL}/products/${editingProductId}`, {
        price: parseFloat(editFormData.price),
        stock: parseInt(editFormData.stock)
      });
      
      setEditingProductId(null);
      setEditFormData({ price: '', stock: '' });
      fetchProducts();
      fetchStatistics();
      toast.success(`✅ "${productName}" ürünü güncellendi!`, { position: 'top-right' });
      setServerError(false);
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      setServerError(true);
      toast.error('❌ Ürün güncellenirken hata oluştu!', { position: 'top-right' });
      setError("Ürün güncellenirken hata oluştu.");
    }
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditFormData({ price: '', stock: '' });
  };

  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      toast.warning('⚠️ Dışa aktarılacak ürün yok!', { position: 'top-right' });
      return;
    }

    // CSV başlığı (Header)
    const headers = ['Ürün Adı', 'Fiyat (TL)', 'Stok (Adet)'];
    
    // CSV verileri
    const rows = filteredProducts.map(p => [
      `"${p.name}"`,
      p.price.toFixed(2),
      p.stock
    ]);

    // CSV içeriği oluştur
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // UTF-8 BOM ekle (Excel'de Türkçe karakterler düzgün açılsın)
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    // Blob oluştur
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });

    // Download linki oluştur
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `urunler_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('✅ Ürünler başarıyla dışa aktarıldı!', { position: 'top-right' });
  };

  if (!role) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (role === 'seller') {
    return <SellerPanel onLogout={handleLogout} />;
  }

  return (
    <div className="app-container">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* BACKEND HATA KARTISI */}
      {!isBackendAvailable && (
        <div className="error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <div className="error-text">
              <h3>Canlı Sunucu Bağlantısı Koptu</h3>
              <p>Bulut sunucusuna şu anda erişilemiyor. Lütfen Render panelinden backend servisinizin (e-ticaret-backend) durumunu kontrol edin.</p>
            </div>
            <button 
              className="btn-retry"
              onClick={() => {
                fetchProducts();
                fetchStatistics();
              }}
            >
              🔄 Yeniden Bağlan
            </button>
          </div>
        </div>
      )}

      <header className="app-header">
        <div className="admin-header-content">
          <h1>📦 E-Ticaret Yönetim Paneli</h1>
          <button type="button" className="logout-button admin-logout" onClick={handleLogout}>Çıkış Yap</button>
        </div>
      </header>

      {/* İSTATİSTİK KARTLARI */}
      <div className="statistics-container">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Toplam Ürün Çeşidi</h3>
            <p className="stat-value">{statistics.total_products}</p>
            <span className="stat-label">Farklı ürün</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Toplam Stok Miktarı</h3>
            <p className="stat-value">{statistics.total_stock}</p>
            <span className="stat-label">Adet</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Depo Değeri (TL)</h3>
            <p className="stat-value">₺{statistics.total_value.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            <span className="stat-label">Toplam değer</span>
          </div>
        </div>
      </div>

      <div className="app-content">
        {/* SOL TARAF - FORM */}
        <div className="form-section">
          <h3>Yeni Ürün Ekle</h3>
          <form onSubmit={handleSubmit} className="product-form">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ürün Adı"
              disabled={!isBackendAvailable}
              required
            />
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="Fiyat (TL)"
              step="0.01"
              disabled={!isBackendAvailable}
              required
            />
            <input
              type="number"
              value={stock}
              onChange={e => setStock(e.target.value)}
              placeholder="Stok Miktarı"
              disabled={!isBackendAvailable}
              required
            />
            <button type="submit" className="btn-submit" disabled={!isBackendAvailable}>
              {loading ? '⏳ Ekleniyor...' : '➕ Ürün Ekle'}
            </button>
          </form>
        </div>

        {/* SAĞ TARAF - ÜRÜN LİSTESİ */}
        <div className="products-section">
          <div className="search-bar-container">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="🔍 Ürün ara... (anlık filteleme)"
              className="search-bar"
              disabled={!isBackendAvailable}
            />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="sort-select"
              disabled={!isBackendAvailable}
            >
              <option value="name">📌 Ad'a Göre</option>
              <option value="price-asc">💰 Fiyata Göre (Artan)</option>
              <option value="price-desc">💰 Fiyata Göre (Azalan)</option>
              <option value="stock-asc">📦 Stoğa Göre (Az)</option>
            </select>
            <button
              onClick={handleExportCSV}
              className="btn-export"
              title="Ürünleri CSV olarak indir"
              disabled={!isBackendAvailable || filteredProducts.length === 0}
            >
              📊 Excel İndir
            </button>
            {searchQuery && (
              <span className="search-info">{filteredProducts.length} sonuç</span>
            )}
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-text">Ürünler yükleniyor...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              {searchQuery ? '❌ Ürün bulunamadı' : '📭 Henüz ürün yok'}
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>Ürün Adı</th>
                  <th>Fiyat (TL)</th>
                  <th>Stok</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p.id} className={`product-row ${p.stock <= 5 ? 'critical-stock' : ''}`}>
                    <td className="product-name">{p.name}</td>
                    <td className="product-price">₺{p.price.toFixed(2)}</td>
                    <td className={`product-stock ${p.stock === 0 ? 'out-of-stock' : ''} ${p.stock > 0 && p.stock <= 5 ? 'low-stock' : ''}`}>
                      {p.stock > 0 && p.stock <= 5 && <span className="critical-badge">⚠️ </span>}
                      {p.stock} {p.stock === 0 && '(Tükendi)'}
                    </td>
                    <td className="product-actions">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="btn-edit"
                        title="Düzenle"
                        disabled={!isBackendAvailable}
                      >
                        ✏️ Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="btn-delete"
                        title="Sil"
                        disabled={!isBackendAvailable}
                      >
                        🗑️ Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* STOK DURUM GRAFİĞİ */}
      <div className="chart-section">
        <StockChart products={filteredProducts} />
      </div>

      {/* DÜZENLE MODAL */}
      {editingProductId && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Ürünü Düzenle</h2>
            <form onSubmit={handleUpdateProduct}>
              <div className="modal-form-group">
                <label>Fiyat (TL):</label>
                <input
                  type="number"
                  value={editFormData.price}
                  onChange={e => setEditFormData({...editFormData, price: e.target.value})}
                  placeholder="Yeni fiyat"
                  step="0.01"
                  required
                />
              </div>
              <div className="modal-form-group">
                <label>Stok (Adet):</label>
                <input
                  type="number"
                  value={editFormData.stock}
                  onChange={e => setEditFormData({...editFormData, stock: e.target.value})}
                  placeholder="Yeni stok"
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-save">✅ Kaydet</button>
                <button type="button" onClick={handleCancelEdit} className="btn-cancel">❌ İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );  
}

export default App;