import React from "react";
import "./PriceTable.scss";

const PriceTable = ({ priceTable, unit, unitLabel, onQuantitySelect }) => {
  if (!priceTable || priceTable.length === 0) {
    return null;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatQuantity = (qty) => {
    if (qty >= 1000000) {
      return `${(qty / 1000000).toFixed(1)}M`;
    } else if (qty >= 1000) {
      return `${(qty / 1000).toFixed(0)}K`;
    }
    return qty.toString();
  };

  return (
    <div className="price-table-container">
      <h3 className="price-table-title">Bảng giá tham khảo</h3>
      <div className="price-table">
        <div className="price-table-header">
          <div className="price-table-col">Số lượng</div>
          <div className="price-table-col">Giá</div>
          <div className="price-table-col">Thao tác</div>
        </div>
        {priceTable.map((item, index) => (
          <div key={index} className="price-table-row">
            <div className="price-table-col">
              <strong>{formatQuantity(item.quantity)}</strong> {unitLabel}
            </div>
            <div className="price-table-col">
              <strong className="price-value">{formatPrice(item.price)} ₫</strong>
            </div>
            <div className="price-table-col">
              {onQuantitySelect && (
                <button
                  className="price-table-select-btn"
                  onClick={() => onQuantitySelect(item.quantity)}
                >
                  Chọn
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="price-table-note">
        * Giá có thể thay đổi tùy theo số lượng thực tế
      </p>
    </div>
  );
};

export default PriceTable;

