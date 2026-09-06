/** Tests for the shared DatePicker — trigger, calendar popover, controlled
 *  "YYYY-MM-DD" onChange contract, clear behavior and min/max bounds. Days are
 *  clicked by their number text within the open month. */
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "./date-picker";

const openCalendar = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /mar 24|pick a date/i }));
  return within(screen.getByRole("dialog", { name: "Choose date" }));
};

describe("DatePicker trigger", () => {
  it("shows the short date when a value is set", () => {
    render(<DatePicker value="2026-03-24" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /mar 24/i })).toBeInTheDocument();
  });

  it("shows the placeholder when empty", () => {
    render(<DatePicker value="" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /pick a date/i })).toBeInTheDocument();
  });

  it("adds the err class with error", () => {
    render(<DatePicker value="" onChange={vi.fn()} error />);
    expect(screen.getByRole("button")).toHaveClass("err");
  });
});

describe("DatePicker popover", () => {
  it("opens on trigger click and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<DatePicker value="2026-03-24" onChange={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: /mar 24/i });

    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "Choose date" })).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on an outside mousedown", async () => {
    const user = userEvent.setup();
    render(<DatePicker value="2026-03-24" onChange={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /mar 24/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("DatePicker selection", () => {
  it("calls onChange with yyyy-mm-dd and closes the popover", async () => {
    const onChange = vi.fn();
    render(<DatePicker value="2026-03-24" onChange={onChange} />);

    const calendar = await openCalendar();
    await userEvent.setup().click(calendar.getByText("15"));

    expect(onChange).toHaveBeenCalledWith("2026-03-15");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("clears when the selected day is clicked again (clearable default)", async () => {
    const onChange = vi.fn();
    render(<DatePicker value="2026-03-24" onChange={onChange} />);

    const calendar = await openCalendar();
    await userEvent.setup().click(calendar.getByText("24"));

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("re-selects the same day instead of clearing when clearable is off", async () => {
    const onChange = vi.fn();
    render(<DatePicker value="2026-03-24" onChange={onChange} clearable={false} />);

    const calendar = await openCalendar();
    await userEvent.setup().click(calendar.getByText("24"));

    expect(onChange).toHaveBeenCalledWith("2026-03-24");
  });
});

describe("DatePicker bounds", () => {
  it("disables days before min and keeps later days selectable", async () => {
    const onChange = vi.fn();
    render(<DatePicker value="" onChange={onChange} min="2026-03-20" />);

    const calendar = await openCalendar();
    expect(calendar.getByText("15").closest("button")).toBeDisabled();

    await userEvent.setup().click(calendar.getByText("25"));
    expect(onChange).toHaveBeenCalledWith("2026-03-25");
  });

  it("disables days after max", async () => {
    render(<DatePicker value="" onChange={vi.fn()} max="2026-03-10" />);

    const calendar = await openCalendar();
    expect(calendar.getByText("15").closest("button")).toBeDisabled();
    expect(calendar.getByText("5").closest("button")).toBeEnabled();
  });
});
