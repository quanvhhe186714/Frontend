import React from "react";
import "./PaymentTable.scss";

const formatAmount = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

const formatDate = (date) =>
  new Date(date).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const getStatusClass = (status) => {
  const statusMap = {
    pending: "status-pending",
    success: "status-success",
    failed: "status-failed",
  };
  return statusMap[status] || "";
};

const getStatusText = (status) => {
  const statusMap = {
    pending: "Chờ xác nhận",
    success: "Thành công",
    failed: "Thất bại",
  };
  return statusMap[status] || status;
};

const PaymentTable = ({ data = [], title = "", isBankFeed = false }) => {
  if (!data || data.length === 0) {
    return (
      <div className="payment-table">
        {title ? <h3>{title}</h3> : null}
        <div className="empty-state">
          <p>Chưa có giao dịch nào.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-table">
      {title ? <h3>{title}</h3> : null}
      <div className="table-wrap">
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
            {data.map((tx, idx) => (
              <tr key={tx._id || `${tx.referenceCode || "feed"}-${tx.createdAt}-${idx}`}
              >
                <td>{formatDate(tx.createdAt)}</td>
                <td
                  className={`amount ${tx.amount > 0 ? "positive" : "negative"}`}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {formatAmount(tx.amount)}
                </td>
                <td>{tx.note || tx.referenceCode || "-"}</td>

                {!isBankFeed && (
                  <>
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
                  </>
                )}

                {isBankFeed && (
                  <>
                    <td>
                      <span className={`status-badge ${tx.amount > 0 ? "status-success" : "status-failed"}`}>
                        {tx.amount > 0 ? "Nhận" : "Chi"}
                      </span>
                    </td>
                    <td>
                      <span className="qr-linked no">-</span>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentTable;

