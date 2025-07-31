import { Outlet } from "react-router-dom"
import Navbar from "../components/Landing/navbar"
import Footer from "../components/Landing/Footer"

// dito yung navbar, footer, etc.
const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default MainLayout