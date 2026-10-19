import react, { useState } from 'react'
import { useNavigate,Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'

const Register = () => {

    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email,setEmail]= useState("")
    const [Password, setPassword] = useState("")

    const { loading,handleRegister}=  useAuth()

    const handleSubmit = async(e) => {
        e.preventDefault()
        await handleLogin({email,password})
        navigate('/')
    }
    if(loading){
        return(<main><h1>Loading.......</h1></main>)
    }

    return (
        <main>
            <div className='form-container'>
                <hi>Register</hi>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                        onChange={(e)=>{setUsername(e.target.value)}}
                         
                         
                        type='text' id='username' name='username' placeholder='Enter email address' />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                        onChange={(e)=>{setEmail(e.target.value)}}
                        type='email' id='email' name='email' placeholder='Enter email address' />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                         onChange={(e)=>{setPassword(e.target.value)}}
                        type='password' id='password' name='password' placeholder='Enter Password' />
                    </div>

                    <button className='button primary-button'>Register</button>
                </form>
               <p>Already have an account? <Link to={"/login"} >Login</Link> </p> 
            </div>
        </main>
    )
}

export default Register