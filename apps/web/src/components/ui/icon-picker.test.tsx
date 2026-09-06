/** Tests for IconPicker — tile display, popover grid, picking an icon and
 *  the "Use initial" (null) option. */
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { IconPicker, PROJECT_ICONS } from "./icon-picker";

describe("IconPicker tile", () => {
  it("shows the current emoji", () => {
    render(<IconPicker value="🚀" fallback="A" color="#123456" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "🚀" })).toBeInTheDocument();
  });

  it("shows the fallback initial when no icon is set", () => {
    render(<IconPicker fallback="A" color="#123456" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "A" })).toBeInTheDocument();
  });

  it("does not open when disabled", async () => {
    render(<IconPicker fallback="A" color="#123456" disabled onChange={vi.fn()} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "A" }));
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });
});

describe("IconPicker popover", () => {
  it("opens the grid with every project icon", async () => {
    render(<IconPicker fallback="A" color="#123456" onChange={vi.fn()} />);
    const tile = screen.getByRole("button", { name: "A" });
    await userEvent.setup().click(tile);

    const grid = screen.getByRole("grid", { name: "Choose an icon" });
    for (const icon of PROJECT_ICONS) {
      expect(screen.getByRole("button", { name: `Icon ${icon}` })).toBeInTheDocument();
    }
    expect(tile).toHaveAttribute("aria-expanded", "true");
    expect(grid).toBeInTheDocument();
  });

  it("closes on Escape and outside mousedown", async () => {
    render(<IconPicker fallback="A" color="#123456" onChange={vi.fn()} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "A" }));
    expect(screen.getByRole("grid")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole("button", { name: "A" }));
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });
});

describe("IconPicker picking", () => {
  it("calls onChange with the picked icon and closes", async () => {
    const onChange = vi.fn();
    render(<IconPicker fallback="A" color="#123456" onChange={onChange} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "A" }));
    await userEvent.setup().click(screen.getByRole("button", { name: "Icon 🎯" }));

    expect(onChange).toHaveBeenCalledWith("🎯");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("marks the current value as selected", async () => {
    render(<IconPicker value="🚀" fallback="A" color="#123456" onChange={vi.fn()} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "🚀" }));
    expect(screen.getByRole("button", { name: "Icon 🚀" })).toHaveClass("on");
  });

  it("'Use initial' calls onChange with null", async () => {
    const onChange = vi.fn();
    render(<IconPicker value="🚀" fallback="A" color="#123456" onChange={onChange} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "🚀" }));
    await userEvent.setup().click(screen.getByRole("button", { name: "Use initial" }));

    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });
});
