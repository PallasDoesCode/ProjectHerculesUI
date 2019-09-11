import React from 'react'
import Link from 'next/link'
import Head from 'next/head'

const Dashboard = () => (
  <div>
    <Head>
      <title>Dashboard</title>
    </Head>

    <div className='hero'>
      <h1 className='title'>Welcome to the dashboard screen.</h1>
      <p className='description'>
        To get started, edit <code>pages/dashboard.js</code> and save to reload.
      </p>
    </div>
  </div>
)

export default Dashboard
