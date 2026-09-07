import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Colors
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Colors
);

const StockChart = ({ products }) => {
  const chartRef = useRef(null);
  const [chartType, setChartType] = React.useState('bar');

  // Stok durumuna göre renk belirleme
  const getBarColor = (stock) => {
    if (stock === 0) return '#ef4444'; // Kırmızı - Tükendi
    if (stock <= 5) return '#f97316'; // Turuncu - Kritik stok
    if (stock <= 20) return '#eab308'; // Sarı - Düşük stok
    return '#22c55e'; // Yeşil - Normal stok
  };

  // Grafik verileri
  const chartData = {
    labels: products.map(p => p.name.length > 20 ? p.name.substring(0, 17) + '...' : p.name),
    datasets: [
      {
        label: 'Stok Miktarı (Adet)',
        data: products.map(p => p.stock),
        backgroundColor: products.map(p => getBarColor(p.stock)),
        borderColor: products.map(p => getBarColor(p.stock)),
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  // Pasta Grafik Verileri
  const pieChartData = {
    labels: products.map(p => p.name),
    datasets: [
      {
        data: products.map(p => p.stock),
        backgroundColor: [
          '#ef4444',
          '#f97316',
          '#eab308',
          '#22c55e',
          '#3b82f6',
          '#8b5cf6',
          '#ec4899',
          '#14b8a6',
          '#f59e0b',
          '#10b981'
        ],
        borderColor: '#fff',
        borderWidth: 2,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#333',
          font: {
            size: 13,
            weight: 'bold'
          },
          padding: 20
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(30, 60, 114, 0.95)',
        borderColor: '#667eea',
        borderWidth: 2,
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return 'Stok: ' + context.parsed.y + ' adet';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Stok Miktarı (Adet)',
          color: '#666',
          font: {
            size: 13,
            weight: 'bold'
          }
        },
        ticks: {
          color: '#666',
          stepSize: 5
        },
        grid: {
          color: '#e5e7eb'
        }
      },
      x: {
        ticks: {
          color: '#666',
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          display: false
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#333',
          font: {
            size: 12,
            weight: 'normal'
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 60, 114, 0.95)',
        borderColor: '#667eea',
        borderWidth: 2,
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return label + ': ' + value + ' adet (' + percentage + '%)';
          }
        }
      }
    }
  };

  return (
    <div className="stock-chart-container">
      <div className="chart-header">
        <h2 className="chart-title">📊 Ürün Stok Durumu</h2>
        <p className="chart-subtitle">Ürünlerin mevcut stok miktarları</p>
        
        {products.length > 0 && (
          <div className="chart-type-selector">
            <button 
              className={`chart-btn ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
              title="Çubuk Grafik"
            >
              📊 Çubuk Grafik
            </button>
            <button 
              className={`chart-btn ${chartType === 'pie' ? 'active' : ''}`}
              onClick={() => setChartType('pie')}
              title="Pasta Grafik"
            >
              🥧 Pasta Grafik
            </button>
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <div className="empty-chart">
          <p>📭 Grafik göstermek için ürün eklemeniz gerekiyor</p>
        </div>
      ) : (
        <div className="chart-wrapper">
          {chartType === 'bar' ? (
            <Bar ref={chartRef} data={chartData} options={barOptions} />
          ) : (
            <Pie ref={chartRef} data={pieChartData} options={pieOptions} />
          )}
        </div>
      )}

      {/* Stok Durumu Açıklaması */}
      <div className="stock-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#22c55e' }}></div>
          <span>Normal Stok (&gt; 20 adet)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#eab308' }}></div>
          <span>Düşük Stok (6-20 adet)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#f97316' }}></div>
          <span>Kritik Stok (1-5 adet)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
          <span>Tükendi (0 adet)</span>
        </div>
      </div>
    </div>
  );
};

export default StockChart;
