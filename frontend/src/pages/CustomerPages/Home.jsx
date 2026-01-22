import Hero from '../../components/Landing/hero'
import SampleCard from '../../components/Landing/sampleCard'
import AboutUs from '../../components/Landing/AboutUs'
import CustomerRv from '../../components/Landing/CustomerRv'
import ContanctUs from '../../components/Landing/ContanctUs'

const Home = () => {
    return (
        <div className="bg-white">
            <Hero />
            <SampleCard />
            <AboutUs />
            <CustomerRv />
            <ContanctUs />
        </div>
    )
}

export default Home