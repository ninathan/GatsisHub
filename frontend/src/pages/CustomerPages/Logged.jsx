import React from 'react'
import { Link } from 'react-router-dom'
import Hero from '../../components/Landing/hero'
import SampleCard from '../../components/Landing/sampleCard'
import AboutUs from '../../components/Landing/AboutUs'
import CustomerRv from '../../components/Landing/CustomerRv'
import ContanctUs from '../../components/Landing/ContanctUs'
import Checkout from './Checkout'


const Logged = () => {
  return (
    <div>
        <Hero />
        <SampleCard />
        <AboutUs />
        <CustomerRv />
        <ContanctUs />
    </div>
  )
}

export default Logged