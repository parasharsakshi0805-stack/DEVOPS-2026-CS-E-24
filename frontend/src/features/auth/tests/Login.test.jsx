import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router";
import Login from "../pages/Login";

describe("Login Page", () => {


it("renders the Login heading", () => {
    render(
        <MemoryRouter>
            <Login />
        </MemoryRouter>
    );

    expect(
        screen.getByRole("heading", { name: "Login" })
    ).toBeInTheDocument();
});

it("renders email and password fields", () => {
    render(
        <MemoryRouter>
            <Login />
        </MemoryRouter>
    );

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
});

it("renders the Login button", () => {
    render(
        <MemoryRouter>
            <Login />
        </MemoryRouter>
    );

    expect(
        screen.getByRole("button", { name: "Login" })
    ).toBeInTheDocument();
});

it("renders the Register link", () => {
    render(
        <MemoryRouter>
            <Login />
        </MemoryRouter>
    );

    expect(
        screen.getByRole("link", { name: "Register" })
    ).toBeInTheDocument();
});


});
