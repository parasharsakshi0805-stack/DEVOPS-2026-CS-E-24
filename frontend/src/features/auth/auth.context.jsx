import { createContext } from "react";

export const AuthContext = createContext()

export const AuthProvider = ({ children })=> {
    const [user, setUser] =userState(null)
    const [loading, setLoading]= userState(false)
    return (
        <AuthContext.provider value={{ user,setUser,loading,setLoading}} >
        {children}
        </AuthContext.provider>
    )
}