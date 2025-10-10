import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Navigate,
} from 'react-router-dom';

import Homepage from './pages/CustomerPages/Home';
import Product from './pages/CustomerPages/Product';
import Order from './pages/CustomerPages/Order';
import Checkout from './pages/CustomerPages/Checkout';
import Login from './pages/CustomerPages/LoginPage';
import Signup from './pages/CustomerPages/SignupPage';
import NotFound from './pages/NotFound';
import Messages from './pages/CustomerPages/messages';
import Profile from './pages/CustomerPages/Logged';
import AccountSetting from './pages/CustomerPages/AccountSetting';
import PaymentPage from './pages/CustomerPages/PaymentPage';
import BankTransferPage from './components/Payment/BankTransferPage';

import SalesAdminLayout from './layouts/SalesAdminLayout';
import AuthSA from './pages/SalesAdminPages/AuthSA';
import AuthOM from './pages/OperationalManagerPages/AuthOM';
import OrderPage from './pages/SalesAdminPages/OrderPage';
import OrderDetail from './pages/SalesAdminPages/OrderDetail';
import OperationalManLayout from './layouts/OperationalManLayout';
import OrderPageOM from './pages/OperationalManagerPages/OrderPageOM';
import Employees from './pages/OperationalManagerPages/Employees';
import MessageSA from './pages/SalesAdminPages/messageSA';
import AppLayout from './layouts/AppLayout';


// ✅ Protect logged-in routes
const ProtectedRoute = ({ element }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? element : <Navigate to="/login" replace />;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* App layout with Navbar (always visible) */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/products" element={<Product />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected user routes */}
        <Route path="/logged" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/orders" element={<ProtectedRoute element={<Order />} />} />
        <Route path="/checkout" element={<ProtectedRoute element={<Checkout />} />} />
        <Route path="/messages" element={<ProtectedRoute element={<Messages />} />} />
        <Route path="/accountsetting" element={<ProtectedRoute element={<AccountSetting />} />} />
        <Route path="/payment" element={<ProtectedRoute element={<PaymentPage />} />} />
        <Route path="/banktransfer" element={<ProtectedRoute element={<BankTransferPage />} />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/*  Sales Admin layout */}
      <Route element={<SalesAdminLayout />}>
        <Route path="/orderpage" element={<OrderPage />} />
        <Route path="/orderdetail" element={<OrderDetail />} />
        <Route path="/messageSA" element={<MessageSA />} />
      </Route>

      {/*  Operational Manager layout */}
      <Route element={<OperationalManLayout />}>
        <Route path="/orderpageOM" element={<OrderPageOM />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/employeeDetail" element={<Employees />} /> {/* placeholder */}
      </Route>

      {/* Admin/Manager Auth */}
      <Route path="/authOM" element={<AuthOM />} />
      <Route path="/authSaleAdmin" element={<AuthSA />} />
    </Route>
  )
);

const App = () => {
  return<RouterProvider router={router} />;
  
};

export default App;
