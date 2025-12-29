import React, { useState, useEffect } from 'react';
import { getMyTransactions } from '../../services/wallet';
import './shop.scss';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await getMyTransactions();
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Không thể tải lịch sử giao dịch. Vui lòng đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClass = (status) => {
    const statusMap = {
      pending: 'status-pending',
      success: 'status-success',
      failed: 'status-failed',
    };
    return statusMap[status] || '';
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Chờ xác nhận',
      success: 'Thành công',
      failed: 'Thất bại',
    };
    return statusMap[status] || status;
  };

  // Separate transactions into incoming and outgoing
  const incomingTransactions = transactions.filter(
    (tx) => tx.status === 'success' && tx.amount > 0
  );
  const outgoingTransactions = transactions.filter(
    (tx) => tx.amount < 0 || tx.method === 'withdrawal'
  );
  const pendingTransactions = transactions.filter(
    (tx) => tx.status === 'pending'
  );

  if (loading) {
    return (
      <div className="transaction-history-page">
        <div className="transaction-history-container">
          <div className="loading-spinner">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transaction-history-page">
        <div className="transaction-history-container">
          <div className="error-message">
            {error}
            <button onClick={fetchTransactions} className="retry-btn">
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-history-page">
      <div className="transaction-history-container">
        <div className="transaction-history-header">
          <h1>Lịch sử giao dịch</h1>
          <button onClick={fetchTransactions} className="refresh-btn">
            Làm mới
          </button>
        </div>

        {/* Summary Cards */}
        <div className="transaction-summary">
          <div className="summary-card incoming">
            <div className="summary-label">Giao dịch nhận vào</div>
            <div className="summary-value">
              {formatAmount(
                incomingTransactions.reduce((sum, tx) => sum + tx.amount, 0)
              )}
            </div>
            <div className="summary-count">
              {incomingTransactions.length} giao dịch
            </div>
          </div>
          {outgoingTransactions.length > 0 && (
            <div className="summary-card outgoing">
              <div className="summary-label">Giao dịch chi ra</div>
              <div className="summary-value">
                {formatAmount(
                  Math.abs(
                    outgoingTransactions.reduce(
                      (sum, tx) => sum + Math.abs(tx.amount),
                      0
                    )
                  )
                )}
              </div>
              <div className="summary-count">
                {outgoingTransactions.length} giao dịch
              </div>
            </div>
          )}
          {pendingTransactions.length > 0 && (
            <div className="summary-card pending">
              <div className="summary-label">Đang chờ xác nhận</div>
              <div className="summary-value">
                {formatAmount(
                  pendingTransactions.reduce((sum, tx) => sum + tx.amount, 0)
                )}
              </div>
              <div className="summary-count">
                {pendingTransactions.length} giao dịch
              </div>
            </div>
          )}
        </div>

        {/* Transaction List */}
        <div className="transaction-list">
          <h2>Tất cả giao dịch</h2>
          {transactions.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có giao dịch nào.</p>
            </div>
          ) : (
            <div className="transaction-table">
              <table>
                <thead>
                  <tr>
                    <th>Ngày giờ</th>
                    <th>Số tiền</th>
                    <th>Nội dung</th>
                    <th>Trạng thái</th>
                    <th>QR Code</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td>{formatDate(tx.createdAt)}</td>
                      <td className={`amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                        {tx.amount > 0 ? '+' : ''}
                        {formatAmount(tx.amount)}
                      </td>
                      <td>{tx.note || tx.referenceCode || '-'}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(tx.status)}`}>
                          {getStatusText(tx.status)}
                        </span>
                      </td>
                      <td>
                        {tx.customQRId ? (
                          <span className="qr-linked">Có</span>
                        ) : (
                          <span className="qr-linked no">Không</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;

