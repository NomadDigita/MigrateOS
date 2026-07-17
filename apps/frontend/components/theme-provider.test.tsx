import { fireEvent, render, screen } from "@testing-library/react";

import { ThemeProvider, useTheme } from "./theme-provider";

function ThemeControl() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme}</button>;
}

describe("ThemeProvider", () => {
  it("persists a selected theme and applies it to the document", () => {
    render(
      <ThemeProvider>
        <ThemeControl />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem("migrateos-theme")).toBe("light");
  });
});
