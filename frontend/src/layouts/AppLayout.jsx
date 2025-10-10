import { Outlet } from 'react-router-dom';
import Navbar from '../components/Landing/navbar.jsx'; // your merged Navbar
import Footer from '../components/Landing/Footer.jsx';

const AppLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default AppLayout;
