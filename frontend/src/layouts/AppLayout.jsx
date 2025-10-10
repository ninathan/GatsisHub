import { Outlet } from 'react-router-dom';
import Navbar from '../components/Landing/navbar'; // your merged Navbar
import Footer from '../components/Landing/footer';

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
