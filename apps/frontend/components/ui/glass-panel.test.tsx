import { render, screen } from "@testing-library/react";

import { GlassPanel } from "./glass-panel";

describe("GlassPanel", () => {
  it("renders its content with the shared glass surface", () => {
    render(<GlassPanel>Signal preserved</GlassPanel>);
    expect(screen.getByText("Signal preserved")).toBeInTheDocument();
    expect(screen.getByText("Signal preserved").closest("section")).toHaveClass("glass-grain");
  });
});
