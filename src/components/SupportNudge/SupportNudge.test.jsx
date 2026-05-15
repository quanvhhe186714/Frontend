import { act, fireEvent, render, screen } from "@testing-library/react";
import SupportNudge from "./SupportNudge";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });

describe("SupportNudge", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-15T12:00:00Z"));
    mockNavigate.mockClear();
    sessionStorage.clear();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test("does not show before the 30 minute reminder interval", () => {
    render(<SupportNudge />);

    expect(screen.queryByText("Bạn iu cần tớ hỗ trợ gì?")).toBeNull();

    act(() => {
      jest.advanceTimersByTime(29 * 60 * 1000);
    });

    expect(screen.queryByText("Bạn iu cần tớ hỗ trợ gì?")).toBeNull();
  });

  test("shows the support prompt after 30 minutes", () => {
    render(<SupportNudge />);

    act(() => {
      jest.advanceTimersByTime(30 * 60 * 1000);
    });

    screen.getByText("Bạn iu cần tớ hỗ trợ gì?");
    screen.getByRole("button", { name: "Cần hỗ trợ" });
    screen.getByRole("button", { name: "Để sau" });
  });

  test("opens the support page when the user asks for help", () => {
    render(<SupportNudge />);

    act(() => {
      jest.advanceTimersByTime(30 * 60 * 1000);
    });

    fireEvent.click(screen.getByRole("button", { name: "Cần hỗ trợ" }));

    expect(mockNavigate).toHaveBeenCalledWith("/ho-tro");
    expect(screen.queryByText("Bạn iu cần tớ hỗ trợ gì?")).toBeNull();
  });
});
