import React from "react";
import ProductCategoryLanding from "./ProductCategoryLanding";

const config = {
  eyebrow: "AI productivity",
  title: "AI Tools riêng",
  subtitle:
    "Danh mục AI coding và AI làm việc được seed riêng ở frontend, tham khảo các công cụ phổ biến hiện nay và không đọc từ database sản phẩm.",
  productsTitle: "Seed AI tools tham khảo",
  productsSubtitle: "Dữ liệu tĩnh riêng cho AI Tools, không lấy từ sản phẩm/dịch vụ",
  heroCards: [
    {
      name: "Cursor",
      mark: "CU",
      description: "IDE AI cho lập trình nhanh hơn với autocomplete, chat và refactor thông minh.",
      accent: "#60a5fa",
      features: ["Hỗ trợ coding", "Tối ưu workflow", "Phù hợp dev cá nhân"],
    },
    {
      name: "Codex",
      mark: "CX",
      description: "Trợ lý lập trình xử lý task code, review và tự động hóa thay đổi trong repo.",
      accent: "#22d3ee",
      features: ["Tác vụ code phức tạp", "Hỗ trợ refactor", "Phù hợp dự án thật"],
    },
    {
      name: "Claude Code",
      mark: "CL",
      description: "Agent coding dùng terminal, mạnh cho phân tích codebase và chỉnh sửa đa file.",
      accent: "#f59e0b",
      features: ["Context dài", "Làm việc theo task", "Hỗ trợ phân tích"],
    },
    {
      name: "GitHub Copilot",
      mark: "GH",
      description: "Công cụ AI coding quen thuộc cho autocomplete, chat và hỗ trợ trong IDE.",
      accent: "#a855f7",
      features: ["Tích hợp IDE", "Gợi ý code", "Phù hợp team dev"],
    },
  ],
  products: [
    {
      id: "ai-cursor-pro",
      name: "Cursor Pro",
      mark: "CU",
      icon: "⌘",
      badges: ["IDE", "AI"],
      accent: "#60a5fa",
      description: "Gói AI IDE cho dev cần chat theo codebase, chỉnh sửa nhiều file và tăng tốc daily coding.",
      priceLabel: "Liên hệ theo tháng",
    },
    {
      id: "ai-codex",
      name: "OpenAI Codex",
      mark: "CX",
      icon: "{ }",
      badges: ["Code", "Agent"],
      accent: "#22d3ee",
      description: "Gợi ý cho người cần agent coding xử lý issue, sửa lỗi, review và tự động hóa trong repo.",
      priceLabel: "Tư vấn theo nhu cầu",
    },
    {
      id: "ai-claude-code",
      name: "Claude Code",
      mark: "CL",
      icon: "CLI",
      badges: ["Terminal", "AI"],
      accent: "#f59e0b",
      description: "Phù hợp task codebase lớn, refactor, phân tích lỗi và workflow terminal cho kỹ thuật.",
      priceLabel: "Liên hệ gói phù hợp",
    },
    {
      id: "ai-github-copilot",
      name: "GitHub Copilot",
      mark: "GH",
      icon: "GH",
      badges: ["IDE", "Team"],
      accent: "#a855f7",
      description: "Gói AI coding ổn định cho cá nhân hoặc team dùng VS Code, JetBrains và GitHub workflow.",
      priceLabel: "Theo seat/tháng",
    },
    {
      id: "ai-windsurf",
      name: "Windsurf",
      mark: "WS",
      icon: "WS",
      badges: ["Editor", "Agent"],
      accent: "#38bdf8",
      description: "AI editor có agent hỗ trợ viết tính năng, hiểu project và thao tác theo ngữ cảnh.",
      priceLabel: "Tư vấn trước khi mua",
    },
    {
      id: "ai-augment",
      name: "Augment Code",
      mark: "AG",
      icon: "AG",
      badges: ["Codebase", "Team"],
      accent: "#8b5cf6",
      description: "Công cụ AI coding tập trung hiểu codebase, tìm ngữ cảnh và hỗ trợ team kỹ thuật.",
      priceLabel: "Liên hệ theo team",
    },
  ],
};

const AiTools = () => <ProductCategoryLanding config={config} />;

export default AiTools;
