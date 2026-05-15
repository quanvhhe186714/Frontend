import React from "react";
import ProductCategoryLanding from "./ProductCategoryLanding";

const config = {
  eyebrow: "Bảo mật & hạ tầng",
  title: "VPN, VPS và Proxy riêng",
  subtitle:
    "Danh mục hạ tầng online được seed riêng ở frontend cho nhu cầu bảo mật kết nối, máy chủ riêng và IP vận hành.",
  productsTitle: "Seed VPN/VPS tham khảo",
  productsSubtitle: "Dữ liệu tĩnh riêng cho VPN/VPS, không lấy từ database proxy/sản phẩm",
  heroCards: [
    {
      name: "VPN bảo mật",
      mark: "VP",
      description: "Kết nối riêng tư hơn khi làm việc, truy cập dịch vụ và bảo vệ tài khoản.",
      accent: "#06b6d4",
      features: ["Ẩn IP", "Kết nối an toàn", "Hỗ trợ nhiều khu vực"],
    },
    {
      name: "VPS",
      mark: "VS",
      description: "Máy chủ riêng cho automation, hosting nhẹ, tool marketing và vận hành 24/7.",
      accent: "#818cf8",
      features: ["Chạy ổn định", "Tài nguyên riêng", "Hỗ trợ cấu hình"],
    },
    {
      name: "Proxy Residential",
      mark: "RS",
      description: "IP dân cư phù hợp nuôi tài khoản, kiểm thử và các chiến dịch cần độ tin cậy.",
      accent: "#22c55e",
      features: ["IP sạch", "Đổi IP linh hoạt", "Phù hợp automation"],
    },
    {
      name: "Proxy Datacenter",
      mark: "DC",
      description: "IP tốc độ cao, chi phí tốt cho tác vụ số lượng lớn và kịch bản lặp lại.",
      accent: "#f97316",
      features: ["Tốc độ cao", "Giá tối ưu", "HTTP/SOCKS5"],
    },
  ],
  products: [
    {
      id: "vpn-personal",
      name: "VPN cá nhân",
      mark: "VP",
      icon: "VPN",
      badges: ["Bảo mật", "IP"],
      accent: "#06b6d4",
      description: "Gói VPN cho người dùng cá nhân cần kết nối riêng tư, ổn định và dễ dùng trên nhiều thiết bị.",
      priceLabel: "Theo tháng/năm",
    },
    {
      id: "vpn-business",
      name: "VPN team",
      mark: "BT",
      icon: "BT",
      badges: ["Team", "Secure"],
      accent: "#0ea5e9",
      description: "Gợi ý cho team cần truy cập bảo mật, quản lý người dùng và khu vực kết nối rõ ràng.",
      priceLabel: "Tư vấn theo số user",
    },
    {
      id: "vps-cloud",
      name: "VPS Cloud",
      mark: "VS",
      icon: "☁",
      badges: ["Cloud", "24/7"],
      accent: "#818cf8",
      description: "Máy chủ riêng cho tool chạy 24/7, app nhỏ, automation hoặc môi trường test.",
      priceLabel: "Theo cấu hình",
    },
    {
      id: "vps-windows",
      name: "VPS Windows",
      mark: "WI",
      icon: "⊞",
      badges: ["Windows", "RDP"],
      accent: "#3b82f6",
      description: "Gói VPS có giao diện Windows cho vận hành tool, remote desktop và tác vụ cần GUI.",
      priceLabel: "Liên hệ cấu hình",
    },
    {
      id: "proxy-residential",
      name: "Proxy Residential",
      mark: "RS",
      icon: "IP",
      badges: ["Resident", "Clean"],
      accent: "#22c55e",
      description: "IP dân cư cho nhu cầu độ tin cậy cao, kiểm thử khu vực và vận hành tài khoản.",
      priceLabel: "Theo GB/port",
    },
    {
      id: "proxy-datacenter",
      name: "Proxy Datacenter",
      mark: "DC",
      icon: "DC",
      badges: ["Speed", "Proxy"],
      accent: "#f97316",
      description: "Proxy tốc độ cao, chi phí tốt cho crawl, test, automation và tác vụ số lượng lớn.",
      priceLabel: "Theo port/tháng",
    },
  ],
};

const VpnVps = () => <ProductCategoryLanding config={config} />;

export default VpnVps;
