import { fireEvent, render, screen } from "@testing-library/react";
import ProductCategoryLanding from "./ProductCategoryLanding";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });

const config = {
  title: "Tài khoản mạng riêng",
  subtitle: "Dữ liệu seed riêng, không lấy từ backend.",
  eyebrow: "Tài khoản số",
  productsTitle: "Seed tài khoản tham khảo",
  productsSubtitle: "Dữ liệu tĩnh riêng cho TK mạng",
  heroCards: [
    {
      name: "ChatGPT",
      description: "Tài khoản ChatGPT Plus.",
      accent: "#10b981",
      features: ["Kích hoạt nhanh"],
    },
  ],
  products: [
    {
      id: "chatgpt-plus",
      name: "ChatGPT Plus",
      mark: "AI",
      description: "Gói AI cá nhân.",
      priceLabel: "Liên hệ theo thời hạn",
    },
  ],
};

beforeEach(() => {
  mockNavigate.mockClear();
});

test("renders only the category seed data without backend products", () => {
  render(<ProductCategoryLanding config={config} />);

  screen.getByText("Tài khoản mạng riêng");
  screen.getByText("ChatGPT");
  screen.getByText("Seed tài khoản tham khảo");
  expect(screen.getAllByText("ChatGPT Plus")).toHaveLength(2);
  screen.getByRole("img", { name: "Ảnh minh họa ChatGPT Plus" });
  screen.getByText("Liên hệ theo thời hạn");
});

test("sends category actions to support instead of product detail pages", () => {
  render(<ProductCategoryLanding config={config} />);

  fireEvent.click(screen.getByRole("button", { name: "Tư vấn gói này" }));

  expect(mockNavigate).toHaveBeenCalledWith("/ho-tro");
});
