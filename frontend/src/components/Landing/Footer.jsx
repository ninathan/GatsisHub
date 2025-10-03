import logo from '../../images/logo.png'

const Footer = () => {
    return (
        <div>
            <footer className="bg-[#353f94] text-white py-2">
                <img src={logo} alt="GatsisHub Logo" className="mx-auto mb-4 w-15 h-16" />
                <div className="container mx-auto text-center"> 
                    <p className="text-sm">© 2023 GatsisHub. All rights reserved.</p>
                    <p className="text-sm">Made with ❤️ by Gatsis Corporation</p>
                    
                </div>
            </footer>
        </div>
    )
}

export default Footer