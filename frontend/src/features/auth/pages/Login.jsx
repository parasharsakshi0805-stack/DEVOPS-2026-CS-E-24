import react,{useState} from 'react'
import { useNavigate,Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import e from 'express'


const Login = () => {
    const {loading,handleLogin}= useAuth()
    const [email,setEmail]= useState("")
    const [password,setPassword] = useState("")


    const handleSubmit = async(e) => {
        e.preventDefault()
        handleLogin({email,password})
    }

    if(loading){
        return (<main><h1>Loading.......</h1></main>)
    }


    return (
        <main>
            <div className='form-container'>
                <hi>Login</hi>

                <form onSubmit={handleSubmit}>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                        onChange={(e)=>{setEmail(e.target.value)}}
                        type='email' id='email' name='email' placeholder='Enter email address'/>
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input 
                         onChange={(e)=>{setPassword(e.target.value)}}
                        type='password' id='password' name='password' placeholder='Enter Password'/>
                    </div>

                    <button className='button primary-button'>Login</button>
                </form>
                <p>Don't have an account? <Link to={"/register"} >Register</Link> </p>
            </div>
        </main>
    )
}

export default Login