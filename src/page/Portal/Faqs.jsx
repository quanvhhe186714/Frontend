import React from "react";
import "./portal.scss";

const Faqs = () => {
  return (
    <div className="portal-page">
      <div className="portal-hero">
        <h2>FAQs</h2>
        <div>Câu hỏi thường gặp</div>
      </div>
      <details>
        <summary>Thời gian kích hoạt Telegram Premium?</summary>
        <p>Thường 5-15 phút sau khi thanh toán, giờ cao điểm có thể lâu hơn.</p>
      </details>
      <details>
        <summary>Tôi cần cung cấp gì?</summary>
        <p>Username Telegram chính xác (ví dụ: @yourhandle).</p>
      </details>
    </div>
  );
};

export default Faqs;


