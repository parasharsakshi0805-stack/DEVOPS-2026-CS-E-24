
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { loading, handleRegister } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Send all three fields to the backend
            await handleRegister({
                username,
                email,
                password
            });

            navigate('/');
        } catch (error) {
            console.error('Registration failed:', error);
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
                <h1>Register</h1>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter email address"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
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
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="button primary-button"
                        disabled={loading}
                    >
                        Register
                    </button>
                </form>

                <p>
                    Already have an account?{' '}
                    <Link to="/login">Login</Link>
                </p>
            </div>
        </main>
    );
};

export default Register;
