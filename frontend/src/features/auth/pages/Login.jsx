
import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import "../auth.form.scss";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
    const { loading, handleLogin } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const success = await handleLogin({
                email,
                password,
            });

            // Redirect only if login succeeds.
            if (success) {
                navigate("/");
            } else {
                setError("Login failed. Please check your credentials.");
            }
        } catch (err) {
            setError(
                err?.message || "Something went wrong. Please try again."
            );
        }
    };

    if (loading) {
        return (
            <main>
                <h1>Loading...</h1>
            </main>
        );
    }

    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && (
                        <p role="alert" className="error-message">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="button primary-button"
                        disabled={loading}
                    >
                        Login
                    </button>
                </form>

                <p>
                    Don't have an account?{" "}
                    <Link to="/register">Register</Link>
                </p>
            </div>
        </main>
    );
};

export default Login;
