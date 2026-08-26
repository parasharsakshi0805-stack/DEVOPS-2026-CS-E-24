import react from 'react'
import "../auth.form.scss"
const Login = () => {



    const handleSubmit = (e) => {
        e.preventDefault()
    }


    return (
        <main>
            <div className='form-container'>
                <hi>Login</hi>

                <form onSubmit={handleSubmit}>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input type='email' id='email' placeholder='Enter email address'/>
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input type='password' id='password' placeholder='Enter Password'/>
                    </div>

                    <button className='button primary-button'>Login</button>
                </form>
            </div>
        </main>
    )
}

export default Login