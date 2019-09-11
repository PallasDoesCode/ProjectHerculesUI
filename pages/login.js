import React from 'react'
import Head from 'next/head'

const Login = () => (
  <div>
    <Head>
      <title>Login</title>
    </Head>

    <div className='hero'>
      <h1 className='title'>Welcome to the login screen.</h1>
      <p className='description'>
        To get started, edit <code>pages/login.js</code> and save to reload.
      </p>
      <br/>
      <a href="/login/twitter/">Sign-in with Twitter</a>
    </div>
  </div>
)

export default Login
