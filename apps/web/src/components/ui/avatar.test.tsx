/** Tests for the Avatar initials chip and its deterministic color pick. */
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar, colorFor, initials } from "./avatar";

describe("initials", () => {
  it("takes the first letters of the first two words", () => {
    expect(initials("Amin Yusuf")).toBe("AY");
    expect(initials("John Ronald Reuel Tolkien")).toBe("JR");
  });

  it("uses the single word when there is only one", () => {
    expect(initials("single")).toBe("S");
  });

  it("upper-cases lowercase input", () => {
    expect(initials("ada lovelace")).toBe("AL");
  });
});

describe("colorFor", () => {
  it("returns one of the avatar color classes", () => {
    for (const id of ["u1", "u2", "org_x", ""]) {
      expect(colorFor(id)).toMatch(/^[a-f]$/);
    }
  });

  it("is deterministic per id", () => {
    expect(colorFor("user-42")).toBe(colorFor("user-42"));
  });
});

describe("Avatar", () => {
  it("renders the user's initials on their stable color class", () => {
    const { container } = render(<Avatar user={{ id: "u1", name: "Amin Yusuf" }} />);
    const el = container.querySelector(".av")!;
    expect(el).toHaveTextContent("AY");
    expect(el).toHaveClass(colorFor("u1"));
  });

  it("prefers the name prop over the user's name", () => {
    const { container } = render(
      <Avatar user={{ id: "u1", name: "Amin Yusuf" }} name="Guest User" />,
    );
    expect(container.querySelector(".av")).toHaveTextContent("GU");
  });

  it("falls back to '?' on the default color without a user", () => {
    const { container } = render(<Avatar />);
    const el = container.querySelector(".av")!;
    expect(el).toHaveTextContent("?");
    expect(el).toHaveClass("b");
  });
});
