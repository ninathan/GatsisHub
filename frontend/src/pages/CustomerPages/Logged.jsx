import React from 'react';
import Hero from '../../components/Landing/hero';
import SampleCard from '../../components/Landing/sampleCard';
import AboutUs from '../../components/Landing/AboutUs';
import CustomerRv from '../../components/Landing/CustomerRv';
import ContactUs from '../../components/Landing/ContanctUs'; // corrected typo
import LoggedLanding from '../../components/Landing/LoggedLanding';

const Logged = () => {
  return (
    <div>

      {/* Page Content */}
      <Hero />
      <SampleCard />
      <AboutUs />
      <CustomerRv />
      <ContactUs />
    </div>
  );
};

export default Logged;
