import logo from '../../images/logo.png'

const Footer = () => {
    return (
        <div>
            <footer className="bg-[#191716] text-white py-2">
                <img src={logo} alt="GatsisHub Logo" className="mx-auto mb-4 w-15 h-16" />
                <div className="container mx-auto text-center"> 
                    <p className="text-sm">© 2025 GatsisHub. All rights reserved.</p>
                    
                </div>
            </footer>
        </div>
    )
}

export default Footer