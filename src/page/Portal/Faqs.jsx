import React from "react";
import "./portal.scss";

const Faqs = () => {
  return (
    <div className="portal-page">
      <div className="portal-hero">
        <h2>FAQs</h2>
        <div>Câu hỏi thường gặp</div>
      </div>

      <div className="faqs-container">
        <details>
          <summary>1. Dịch vụ của bên bạn là gì?</summary>
          <p>
            Chúng tôi cung cấp giải pháp tăng trưởng mạng xã hội như tăng like, follow, view, comment, share cho các nền tảng Facebook, TikTok, YouTube, Instagram, Twitter. 
            Dịch vụ của chúng tôi tập trung vào quảng bá nội dung đến người dùng thật, tối ưu tiếp cận và tương tác tự nhiên, hợp pháp theo chính sách của từng nền tảng.
          </p>
        </details>

        <details>
          <summary>2. Lượt tương tác có phải người thật không?</summary>
          <p>
            <strong>• Tỉ lệ tài khoản thật:</strong> Dịch vụ của chúng tôi sử dụng tài khoản người dùng thật với tỉ lệ cao, đảm bảo tương tác tự nhiên và chất lượng.<br/><br/>
            <strong>• Nguồn người dùng:</strong> Người dùng đến từ nhiều nguồn khác nhau, được tuyển chọn kỹ lưỡng để đảm bảo tính xác thực.<br/><br/>
            <strong>• Hoạt động tự nhiên:</strong> Tất cả tương tác được thực hiện theo cách tự nhiên, không spam, không bot, đảm bảo an toàn cho tài khoản của bạn.<br/><br/>
            <strong>• Tuân thủ chính sách:</strong> Chúng tôi cam kết tuân thủ nghiêm ngặt các chính sách của Facebook, TikTok, Instagram và các nền tảng khác.
          </p>
        </details>

        <details>
          <summary>3. Dịch vụ có an toàn cho tài khoản không?</summary>
          <p>
            <strong>• Không yêu cầu mật khẩu:</strong> Chúng tôi KHÔNG BAO GIỜ yêu cầu bạn cung cấp mật khẩu tài khoản.<br/><br/>
            <strong>• Không yêu cầu quyền quản trị:</strong> Bạn chỉ cần cung cấp link bài viết, fanpage, hoặc video cần tăng tương tác.<br/><br/>
            <strong>• Không dùng bot spam:</strong> Chúng tôi không sử dụng bot hay phần mềm tự động spam, tất cả đều là tương tác thật từ người dùng.<br/><br/>
            <strong>• Cam kết hạn chế rủi ro:</strong> Chúng tôi áp dụng các biện pháp bảo mật và quy trình an toàn để hạn chế tối đa rủi ro cho tài khoản của bạn.
          </p>
        </details>

        <details>
          <summary>4. Có bị tụt tương tác sau khi sử dụng không?</summary>
          <p>
            <strong>• Lý do có thể tụt:</strong> Một số nền tảng có thể tự động dọn dẹp tài khoản không hoạt động hoặc spam. Tuy nhiên, với dịch vụ của chúng tôi sử dụng tài khoản thật, tỉ lệ tụt rất thấp.<br/><br/>
            <strong>• Cách hạn chế:</strong> Chúng tôi tăng tương tác với tốc độ tự nhiên, không đột biến, và sử dụng tài khoản chất lượng để giảm thiểu khả năng bị tụt.<br/><br/>
            <strong>• Chính sách bảo hành:</strong> Nếu tương tác bị tụt quá nhiều trong thời gian bảo hành, chúng tôi sẽ bổ sung lại miễn phí (xem chi tiết ở câu hỏi 6).
          </p>
        </details>

        <details>
          <summary>5. Thời gian hoàn thành là bao lâu?</summary>
          <p>
            <strong>• Theo từng gói dịch vụ:</strong> Thời gian hoàn thành khác nhau tùy theo loại dịch vụ và số lượng bạn đặt mua. Thông thường từ 5 phút đến vài giờ cho các dịch vụ nhỏ, và có thể lên đến 24-48 giờ cho các gói lớn.<br/><br/>
            <strong>• Tốc độ tự nhiên:</strong> Chúng tôi tăng tương tác với tốc độ tự nhiên, không đẩy đột biến để tránh gây nghi ngờ từ hệ thống nền tảng. Điều này đảm bảo an toàn và hiệu quả lâu dài cho tài khoản của bạn.
          </p>
        </details>

        <details>
          <summary>6. Chính sách bảo hành như thế nào?</summary>
          <p>
            <strong>• Bảo hành tụt:</strong> Chúng tôi có chính sách bảo hành tụt tương tác trong vòng 30 ngày kể từ khi hoàn thành dịch vụ. Nếu tương tác bị tụt quá 20%, chúng tôi sẽ bổ sung lại miễn phí.<br/><br/>
            <strong>• Điều kiện áp dụng:</strong> Bảo hành chỉ áp dụng khi bạn không thay đổi nội dung, không xóa bài viết/video, và không vi phạm chính sách của nền tảng.<br/><br/>
            <strong>• Trường hợp từ chối bảo hành:</strong> Chúng tôi sẽ từ chối bảo hành nếu tài khoản của bạn bị khóa/vi phạm chính sách, hoặc bạn tự ý xóa/thay đổi nội dung đã được tăng tương tác.
          </p>
        </details>

        <details>
          <summary>7. Có cần cung cấp mật khẩu không?</summary>
          <p>
            <strong>KHÔNG!</strong> Chúng tôi tuyệt đối không yêu cầu và không bao giờ yêu cầu bạn cung cấp mật khẩu tài khoản. Bạn chỉ cần cung cấp link công khai của bài viết, fanpage, video, hoặc nội dung cần tăng tương tác. Đây là cách an toàn nhất để bảo vệ tài khoản của bạn.
          </p>
        </details>

        <details>
          <summary>8. Phương thức thanh toán?</summary>
          <p>
            <strong>• Chuyển khoản ngân hàng:</strong> Chúng tôi hỗ trợ thanh toán qua VietinBank. Bạn có thể thanh toán trực tiếp trên website sau khi đặt hàng.<br/><br/>
            <strong>• Ví điện tử trong hệ thống:</strong> Bạn có thể nạp tiền vào ví trong hệ thống và sử dụng để thanh toán các dịch vụ. Số dư ví sẽ được hiển thị trong phần Profile của bạn.
          </p>
        </details>

        <details>
          <summary>9. Có hoàn tiền không?</summary>
          <p>
            <strong>• Khi dịch vụ không hoàn thành:</strong> Nếu dịch vụ không thể hoàn thành do lỗi từ phía chúng tôi, bạn sẽ được hoàn tiền 100% hoặc chuyển đổi sang dịch vụ khác tương đương.<br/><br/>
            <strong>• Chính sách thời gian xử lý:</strong> Yêu cầu hoàn tiền sẽ được xử lý trong vòng 3-5 ngày làm việc sau khi được xác nhận. Nếu bạn có bất kỳ vấn đề gì, vui lòng liên hệ bộ phận hỗ trợ qua chat hoặc email.
          </p>
        </details>

        <details>
          <summary>10. Dịch vụ có vi phạm chính sách MXH không?</summary>
          <p>
            Dịch vụ của chúng tôi tập trung vào quảng bá nội dung đến người dùng thật, không khuyến khích spam, không can thiệp trái phép vào hệ thống nền tảng. 
            Chúng tôi sử dụng các phương pháp hợp pháp và tuân thủ nghiêm ngặt các chính sách của từng nền tảng. 
            Tuy nhiên, chúng tôi khuyến cáo bạn nên sử dụng dịch vụ một cách hợp lý và không lạm dụng để tránh các rủi ro không mong muốn.
          </p>
        </details>

        <details>
          <summary>11. Có hỗ trợ fanpage / TikTok shop / kênh bán hàng không?</summary>
          <p>
            <strong>• Mức độ hỗ trợ:</strong> Có, chúng tôi hỗ trợ tăng tương tác cho fanpage Facebook, TikTok shop, kênh YouTube bán hàng, và các kênh thương mại khác. 
            Chúng tôi có các gói dịch vụ chuyên biệt cho mục đích kinh doanh.<br/><br/>
            <strong>• Gói phù hợp:</strong> Tùy theo mục tiêu của bạn (tăng uy tín, tăng tiếp cận, đẩy bán hàng, xây thương hiệu), chúng tôi sẽ tư vấn gói dịch vụ phù hợp nhất. 
            Vui lòng liên hệ bộ phận hỗ trợ để được tư vấn chi tiết.
          </p>
        </details>

        <details>
          <summary>12. Tôi nên chọn gói nào?</summary>
          <p>
            Việc chọn gói phụ thuộc vào mục tiêu của bạn:<br/><br/>
            <strong>• Tăng uy tín:</strong> Chọn các gói tăng like, follow với số lượng vừa phải, tăng đều đặn để tạo uy tín tự nhiên.<br/><br/>
            <strong>• Tăng tiếp cận:</strong> Chọn các gói tăng view, share để tăng độ phủ sóng và tiếp cận của nội dung.<br/><br/>
            <strong>• Đẩy bán hàng:</strong> Chọn các gói tăng tương tác cho sản phẩm, video quảng cáo, hoặc livestream bán hàng.<br/><br/>
            <strong>• Xây thương hiệu:</strong> Chọn các gói tổng hợp (like + follow + view + comment) để xây dựng thương hiệu một cách toàn diện.<br/><br/>
            Nếu bạn chưa chắc chắn, hãy liên hệ bộ phận hỗ trợ để được tư vấn miễn phí!
          </p>
        </details>
      </div>
    </div>
  );
};

export default Faqs;


