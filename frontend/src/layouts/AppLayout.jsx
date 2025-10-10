import { Outlet } from 'react-router-dom';
import Navbar from '../components/Landing/navbar'; // your merged Navbar

const AppLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default AppLayout;
