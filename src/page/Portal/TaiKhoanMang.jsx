import React from "react";
import ProductCategoryLanding from "./ProductCategoryLanding";

const config = {
  eyebrow: "Tài khoản số",
  title: "Tài khoản mạng riêng",
  subtitle:
    "Các gói tài khoản premium được seed riêng cho nhu cầu giải trí, học tập và làm việc. Trang này không lấy dữ liệu từ sản phẩm hoặc dịch vụ backend.",
  productsTitle: "Seed tài khoản tham khảo",
  productsSubtitle: "Dữ liệu tĩnh riêng cho TK mạng, không đọc database",
  heroCards: [
    {
      name: "ChatGPT",
      mark: "AI",
      description: "Tài khoản ChatGPT Plus/Pro/Team cho học tập, làm việc, coding và sáng tạo nội dung.",
      accent: "#10b981",
      features: ["Tư vấn đúng gói", "Hỗ trợ đăng nhập", "Phù hợp cá nhân và team"],
    },
    {
      name: "Netflix",
      mark: "NF",
      description: "Gói xem phim theo nhu cầu cá nhân hoặc gia đình, ưu tiên ổn định và rõ thời hạn.",
      accent: "#ef4444",
      features: ["Gói cá nhân/gia đình", "Gia hạn linh hoạt", "Tư vấn trước khi mua"],
    },
    {
      name: "Spotify",
      mark: "SP",
      description: "Gói nghe nhạc Premium theo tháng, Duo hoặc Family tùy nhu cầu sử dụng.",
      accent: "#22c55e",
      features: ["Nghe nhạc premium", "Hỗ trợ gia hạn", "Tối ưu chi phí"],
    },
    {
      name: "YouTube Premium",
      mark: "YT",
      description: "Trải nghiệm YouTube không quảng cáo, nghe nền và YouTube Music.",
      accent: "#ff0000",
      features: ["Không quảng cáo", "YouTube Music", "Gói cá nhân/gia đình"],
    },
  ],
  products: [
    {
      id: "account-chatgpt-plus",
      name: "ChatGPT Plus",
      mark: "AI",
      icon: "AI",
      badges: ["Tài khoản", "Premium"],
      accent: "#10b981",
      description: "Gói phổ biến cho cá nhân cần AI học tập, viết nội dung, coding và xử lý công việc hằng ngày.",
      priceLabel: "Liên hệ theo thời hạn",
    },
    {
      id: "account-chatgpt-team",
      name: "ChatGPT Team",
      mark: "TM",
      icon: "TM",
      badges: ["Team", "AI"],
      accent: "#14b8a6",
      description: "Gợi ý cho nhóm nhỏ cần workspace riêng, quản lý thành viên và quyền sử dụng rõ ràng.",
      priceLabel: "Tư vấn theo số ghế",
    },
    {
      id: "account-netflix-premium",
      name: "Netflix Premium",
      mark: "NF",
      icon: "▶",
      badges: ["Phim", "Premium"],
      accent: "#ef4444",
      description: "Gói xem phim chất lượng cao, phù hợp người dùng cần trải nghiệm ổn định trên nhiều thiết bị.",
      priceLabel: "Liên hệ theo gói",
    },
    {
      id: "account-spotify-family",
      name: "Spotify Premium",
      mark: "SP",
      icon: "♪",
      badges: ["Music", "Family"],
      accent: "#22c55e",
      description: "Gói nghe nhạc không quảng cáo, hỗ trợ offline và lựa chọn Individual, Duo hoặc Family.",
      priceLabel: "Từ gói tháng",
    },
    {
      id: "account-youtube-premium",
      name: "YouTube Premium",
      mark: "YT",
      icon: "▶",
      badges: ["Video", "Music"],
      accent: "#ff0000",
      description: "Gói xem YouTube không quảng cáo, nghe nền, tải video và dùng kèm YouTube Music.",
      priceLabel: "Liên hệ theo khu vực",
    },
    {
      id: "account-canva-pro",
      name: "Canva Pro",
      mark: "CA",
      icon: "C",
      badges: ["Design", "Pro"],
      accent: "#00c4cc",
      description: "Gói thiết kế nhanh cho creator, shop online và team marketing cần template, brand kit, kho ảnh.",
      priceLabel: "Tư vấn theo team",
    },
  ],
};

const TaiKhoanMang = () => <ProductCategoryLanding config={config} />;

export default TaiKhoanMang;
