import React, { useEffect, useState } from "react";
import PaymentTable from "../../components/PaymentTable/PaymentTable";
import { getAllPayments } from "../../services/paymentHistory";
import "./shop.scss";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchPayments = async (p = 1) => {
    try {
      setLoading(true);
      const { data } = await getAllPayments(p, 50);
      setPayments(data.data || []);
      setTotalPages(data.pages || 1);
    } catch (e) {
      console.error("Error fetching payment history:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-history-page">
      <div className="payment-history-container">
        <h1>Lịch sử thanh toán</h1>
        {loading ? (
          <div className="loading-spinner">Đang tải...</div>
        ) : (
          <>
            <PaymentTable data={payments} />
            <div className="pagination">
              <button
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Trang trước
              </button>
              <span>
                {page}/{totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Trang sau
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;

