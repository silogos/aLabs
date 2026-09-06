/** Tests for ConfirmDialog — open/close behavior, the typed-name gate, busy
 *  locking and the danger variant. */
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "./confirm-dialog";

const scrim = () => document.querySelector(".scrim")!;

describe("ConfirmDialog visibility", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <ConfirmDialog open={false} title="Delete" onConfirm={vi.fn()} onClose={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows title, description and both actions when open", () => {
    render(
      <ConfirmDialog
        open
        title="Delete project?"
        description="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Delete project?")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });
});

describe("ConfirmDialog confirming", () => {
  it("confirm calls onConfirm without closing", async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Leave?"
        confirmLabel="Leave"
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    await userEvent.setup().click(screen.getByRole("button", { name: "Leave" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("styles the confirm button as danger when requested", () => {
    render(
      <ConfirmDialog
        open
        title="T"
        danger
        confirmLabel="Delete"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass("danger");
  });

  it("styles the confirm button as primary by default", () => {
    render(
      <ConfirmDialog open title="T" confirmLabel="Save" onConfirm={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: "Save" })).toHaveClass("primary");
  });
});

describe("ConfirmDialog closing", () => {
  it("Escape and the header close button call onClose", () => {
    const onClose = vi.fn();
    render(<ConfirmDialog open title="T" onConfirm={vi.fn()} onClose={onClose} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("clicking the scrim calls onClose", () => {
    const onClose = vi.fn();
    render(<ConfirmDialog open title="T" onConfirm={vi.fn()} onClose={onClose} />);
    fireEvent.click(scrim());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("ConfirmDialog typed-name gate", () => {
  it("keeps confirm disabled until requireText is typed exactly", async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Delete org"
        requireText="acme"
        onConfirm={onConfirm}
        onClose={vi.fn()}
      />,
    );
    const input = screen.getByPlaceholderText("acme");
    const confirm = screen.getByRole("button", { name: "Confirm" });
    expect(confirm).toBeDisabled();

    const user = userEvent.setup();
    await user.type(input, "wrong");
    expect(confirm).toBeDisabled();

    await user.clear(input);
    await user.type(input, "acme");
    expect(confirm).toBeEnabled();

    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("resets the typed text when the dialog reopens", async () => {
    const props = {
      open: true,
      title: "Delete org",
      requireText: "acme",
      onConfirm: vi.fn(),
      onClose: vi.fn(),
    };
    const { rerender } = render(<ConfirmDialog {...props} />);
    await userEvent.setup().type(screen.getByPlaceholderText("acme"), "acme");
    expect(screen.getByRole("button", { name: "Confirm" })).toBeEnabled();

    rerender(<ConfirmDialog {...props} open={false} />);
    rerender(<ConfirmDialog {...props} />);

    expect(screen.getByPlaceholderText("acme")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();
  });
});

describe("ConfirmDialog busy state", () => {
  it("disables both actions, shows the busy label and blocks closing", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Delete org"
        busy
        busyLabel="Deleting…"
        confirmLabel="Delete"
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole("button", { name: "Deleting…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.click(scrim());
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
