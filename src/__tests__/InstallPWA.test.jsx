import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import InstallPWA from "../components/InstallPWA";

test("opens the browser install guide in a viewport-bounded dialog", () => {
  render(<InstallPWA />);
  fireEvent.click(screen.getByRole("button", { name: "Install / Open" }));

  const dialog = screen.getByRole("dialog", { name: "Install CineBook" });
  expect(dialog.parentElement.parentElement).toBe(document.body);
  expect(dialog).toHaveClass("overflow-y-auto");
  expect(dialog).toHaveClass("max-h-[calc(100dvh-2rem)]");
  expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  expect(screen.getByRole("link", { name: "Open CineBook" })).toHaveAttribute(
    "href",
    "/Movie-Booking/",
  );
  expect(screen.getByText(/browser's menu/i)).toBeInTheDocument();
});

test("closes the install guide with Escape and restores focus to its trigger", () => {
  render(<InstallPWA />);
  const trigger = screen.getByRole("button", { name: "Install / Open" });
  fireEvent.click(trigger);
  fireEvent.keyDown(document, { key: "Escape" });

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

test("uses the native install prompt and shows Open App after an accepted install", async () => {
  render(<InstallPWA />);
  const promptEvent = new Event("beforeinstallprompt", { cancelable: true });
  promptEvent.prompt = jest.fn().mockResolvedValue(undefined);
  promptEvent.userChoice = Promise.resolve({ outcome: "accepted" });

  await act(async () => {
    window.dispatchEvent(promptEvent);
  });

  expect(promptEvent.defaultPrevented).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Install App" }));

  await waitFor(() => {
    expect(screen.getByRole("link", { name: "Open App" })).toHaveAttribute(
      "href",
      "/Movie-Booking/",
    );
  });
  expect(promptEvent.prompt).toHaveBeenCalledTimes(1);
});

test("reacts to the browser's appinstalled event", () => {
  render(<InstallPWA />);

  act(() => {
    window.dispatchEvent(new Event("appinstalled"));
  });

  expect(screen.getByRole("link", { name: "Open App" })).toHaveAttribute(
    "href",
    "/Movie-Booking/",
  );
});
