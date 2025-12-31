import React, { useEffect, useMemo, useState } from "react";
import PaymentTable from "../../components/PaymentTable/PaymentTable";
import { getBankFeedHistory } from "../../services/public";
import "./shop.scss";

const PaymentHistory = () => {
  const [feeds, setFeeds] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeeds(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchFeeds = async (p = 1) => {
    try {
      setLoading(true);
      const { data } = await getBankFeedHistory(p, 200);
      setFeeds(data.data || []);
      setTotalPages(data.pages || 1);
    } catch (e) {
      console.error("Error fetching bank feed history:", e);
    } finally {
      setLoading(false);
    }
  };

  // hiển thị tối đa 9 trang giống: 1,2,3,...,9 (có ... khi nhiều hơn)
  const pageItems = useMemo(() => {
    if (totalPages <= 1) return [1];

    const MAX_VISIBLE = 9;
    const half = Math.floor(MAX_VISIBLE / 2);

    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + MAX_VISIBLE - 1);

    // kéo start lại nếu end chạm trần
    start = Math.max(1, end - MAX_VISIBLE + 1);

    const items = [];

    // nếu không bắt đầu từ 1 thì thêm 1 và ...
    if (start > 1) {
      items.push(1);
      if (start > 2) items.push("...");
    }

    for (let p = start; p <= end; p += 1) items.push(p);

    // nếu không kết thúc ở totalPages thì thêm ... và totalPages
    if (end < totalPages) {
      if (end < totalPages - 1) items.push("...");
      items.push(totalPages);
    }

    return items;
  }, [page, totalPages]);

  return (
    <div className="payment-history-page">
      <div className="payment-history-container">
        <h1>Lịch sử thanh toán</h1>
        {loading ? (
          <div className="loading-spinner">Đang tải...</div>
        ) : (
          <>
            <PaymentTable data={feeds} isBankFeed />

            <div className="pagination">
              <button
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Trang trước
              </button>

              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {pageItems.map((it, idx) =>
                  it === "..." ? (
                    <span key={`dots-${idx}`} style={{ padding: "0 6px" }}>
                      ...
                    </span>
                  ) : (
                    <button
                      key={it}
                      onClick={() => setPage(Number(it))}
                      disabled={Number(it) === page}
                      style={{
                        minWidth: 32,
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        background: Number(it) === page ? "#eaeaea" : "white",
                        cursor: Number(it) === page ? "default" : "pointer",
                      }}
                    >
                      {it}
                    </button>
                  )
                )}
              </div>

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
