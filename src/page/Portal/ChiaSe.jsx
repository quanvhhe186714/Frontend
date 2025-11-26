import React, { useState } from "react";
import "./portal.scss";

const ChiaSe = () => {
  const [expandedArticle, setExpandedArticle] = useState(null);

  const articles = [
    {
      id: 1,
      title: "Buff MXH là gì? Hiểu đúng để tránh mất tài khoản",
      summary: "Trong thời đại mạng xã hội bùng nổ, ai cũng muốn bài viết mình có nhiều like, comment, follow. Từ đó xuất hiện khái niệm 'buff MXH'.",
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=400&fit=crop",
      imageAlt: "Social media engagement và tương tác",
      content: (
        <>
          <p>
            Trong thời đại mạng xã hội bùng nổ, ai cũng muốn bài viết mình có nhiều like, comment, follow. 
            Từ đó xuất hiện khái niệm <strong>"buff MXH"</strong>.
          </p>
          
          <p>
            Tuy nhiên, nhiều người hiểu sai rằng buff = dùng tài khoản ảo, bot spam. 
            Đây là nguyên nhân khiến:
          </p>
          
          <ul className="article-list">
            <li>❌ Tài khoản bị hạn chế tương tác</li>
            <li>❌ Tụt tương tác mạnh sau vài ngày</li>
            <li>❌ Bị khóa tính năng, checkpoint</li>
            <li>❌ Mất luôn fanpage hoặc kênh</li>
          </ul>
          
          <p><strong>Buff MXH đúng cách là:</strong></p>
          
          <ul className="article-list positive">
            <li>✅ Quảng bá nội dung đến người thật</li>
            <li>✅ Chạy chiến dịch tương tác tự nhiên</li>
            <li>✅ Tối ưu nội dung để tăng reach</li>
            <li>✅ Seeding cộng đồng thật</li>
          </ul>
          
          <p className="conclusion">
            <strong>Kết luận:</strong> Buff không xấu, nhưng phải làm đúng và an toàn.
          </p>
        </>
      )
    },
    {
      id: 2,
      title: "5 rủi ro khi buff like ảo bạn cần biết",
      summary: "Rất nhiều dịch vụ giá rẻ quảng cáo '1000 like chỉ 10k' - những dịch vụ này thường dùng bot hoặc tài khoản rác, gây hậu quả nghiêm trọng.",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop",
      imageAlt: "Cảnh báo rủi ro khi sử dụng dịch vụ buff không uy tín",
      content: (
        <>
          <p>
            Rất nhiều dịch vụ giá rẻ quảng cáo:
          </p>
          
          <ul className="article-list">
            <li>"1000 like chỉ 10k"</li>
            <li>"Follow tăng trong 1 phút"</li>
          </ul>
          
          <p>
            Những dịch vụ này thường dùng bot hoặc tài khoản rác, gây hậu quả:
          </p>
          
          <ul className="article-list negative">
            <li>❌ Tụt like hàng loạt</li>
            <li>❌ Facebook/TikTok đánh giá gian lận</li>
            <li>❌ Giảm reach tự nhiên</li>
            <li>❌ Mất uy tín với khách hàng</li>
            <li>❌ Khóa trang hoặc tài khoản</li>
          </ul>
          
          <p><strong>Nếu muốn buff, hãy chọn:</strong></p>
          
          <ul className="article-list positive">
            <li>✅ Nguồn người thật</li>
            <li>✅ Tăng chậm tự nhiên</li>
            <li>✅ Không yêu cầu mật khẩu</li>
            <li>✅ Chính sách bảo hành minh bạch</li>
          </ul>
        </>
      )
    },
    {
      id: 3,
      title: "Buff MXH có thật sự giúp bán hàng tốt hơn?",
      summary: "Câu trả lời: Có – nếu đúng cách. Người mua thường tin tưởng hơn khi thấy fanpage nhiều follow, video nhiều view, bài viết có tương tác.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
      imageAlt: "E-commerce và social media marketing",
      content: (
        <>
          <p className="answer">
            <strong>Câu trả lời: Có – nếu đúng cách</strong>
          </p>
          
          <p>
            Người mua thường tin tưởng hơn khi thấy:
          </p>
          
          <ul className="article-list">
            <li>• Fanpage nhiều follow</li>
            <li>• Video nhiều view</li>
            <li>• Bài viết có tương tác</li>
          </ul>
          
          <p>
            Nhưng để chuyển đổi thành đơn hàng, bạn cần:
          </p>
          
          <ul className="article-list positive">
            <li>✅ Nội dung giá trị</li>
            <li>✅ Hình ảnh/video chuyên nghiệp</li>
            <li>✅ Tương tác thật từ khách mục tiêu</li>
            <li>✅ Feedback uy tín</li>
          </ul>
          
          <p className="conclusion">
            <strong>Buff chỉ là bước đầu tạo niềm tin, không phải yếu tố quyết định.</strong>
          </p>
        </>
      )
    },
    {
      id: 4,
      title: "Cách buff Facebook an toàn không bị khóa",
      summary: "3 nguyên tắc vàng: Không buff đột biến, không dùng bot/tài khoản ảo, không chia sẻ mật khẩu cho bất kỳ ai.",
      image: "https://images.unsplash.com/photo-1611162616305-c69b3c7b459d?w=800&h=400&fit=crop",
      imageAlt: "Bảo mật và an toàn tài khoản Facebook",
      content: (
        <>
          <p><strong>3 nguyên tắc vàng:</strong></p>
          
          <ul className="article-list positive">
            <li>✅ Không buff đột biến (tăng 1000 like trong 1 phút)</li>
            <li>✅ Không dùng bot / tài khoản ảo</li>
            <li>✅ Không chia sẻ mật khẩu cho bất kỳ ai</li>
          </ul>
          
          <p><strong>Các phương pháp an toàn:</strong></p>
          
          <ul className="article-list">
            <li>• Seeding cộng đồng cùng lĩnh vực</li>
            <li>• Chạy quảng cáo nhỏ tăng tương tác</li>
            <li>• Hợp tác KOL/Influencer</li>
            <li>• Tối ưu nội dung theo thuật toán</li>
          </ul>
        </>
      )
    },
    {
      id: 5,
      title: "Dấu hiệu dịch vụ buff MXH lừa đảo",
      summary: "Nếu gặp dịch vụ yêu cầu mật khẩu, cam kết tăng siêu nhanh, không rõ nguồn tương tác - hãy tránh xa!",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop",
      imageAlt: "Cảnh báo lừa đảo và dịch vụ không uy tín",
      content: (
        <>
          <p>
            Nếu gặp dịch vụ có các dấu hiệu sau, hãy tránh:
          </p>
          
          <ul className="article-list negative">
            <li>❌ Yêu cầu mật khẩu</li>
            <li>❌ Cam kết tăng siêu nhanh không rủi ro</li>
            <li>❌ Không rõ nguồn tương tác</li>
            <li>❌ Không bảo hành</li>
            <li>❌ Giá quá rẻ bất thường</li>
          </ul>
          
          <p><strong>Dịch vụ uy tín thường:</strong></p>
          
          <ul className="article-list positive">
            <li>✅ Minh bạch nguồn tương tác</li>
            <li>✅ Hỗ trợ khách hàng</li>
            <li>✅ Bảo hành tụt</li>
            <li>✅ Tư vấn phù hợp mục tiêu</li>
          </ul>
        </>
      )
    }
  ];

  const toggleArticle = (id) => {
    setExpandedArticle(expandedArticle === id ? null : id);
  };

  return (
    <div className="portal-page">
      <div className="portal-hero">
        <h2>Chia sẻ</h2>
        <p>Kiến thức và kinh nghiệm về Buff MXH</p>
      </div>

      <div className="articles-container">
        {articles.map((article) => (
          <article key={article.id} className="article-card">
            <div 
              className="article-header"
              onClick={() => toggleArticle(article.id)}
            >
              <h3>{article.title}</h3>
              <span className="expand-icon">
                {expandedArticle === article.id ? "▼" : "▶"}
              </span>
            </div>
            
            {/* Hình ảnh hiển thị khi mở bài viết */}
            {expandedArticle === article.id && article.image && (
              <div className="article-image-container">
                <img 
                  src={article.image} 
                  alt={article.imageAlt || article.title}
                  className="article-image"
                  loading="lazy"
                />
              </div>
            )}
            
            {expandedArticle === article.id && (
              <div className="article-content">
                <p className="article-summary">{article.summary}</p>
                <div className="article-body">
                  {article.content}
                </div>
              </div>
            )}
            
            {expandedArticle !== article.id && (
              <div className="article-preview-section">
                {article.image && (
                  <div className="article-thumbnail">
                    <img 
                      src={article.image} 
                      alt={article.imageAlt || article.title}
                      className="article-thumbnail-img"
                      loading="lazy"
                    />
                  </div>
                )}
                <p className="article-preview">{article.summary}</p>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};

export default ChiaSe;
