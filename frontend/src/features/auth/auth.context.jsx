
import { createContext, useState, useEffect } from "react";
import { getMe, login as loginApi } from "./services/auth.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check whether a user is already logged in.
    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await getMe();
                setUser(currentUser);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, []);

    // Handle login.
    const handleLogin = async (credentials) => {
        setLoading(true);

        try {
            const loggedInUser = await loginApi(credentials);

            setUser(loggedInUser);
            return true;
        } catch (error) {
            setUser(null);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                setLoading,
                handleLogin,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
