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
import CreateDesign from './pages/CustomerPages/CreateDesign';
import Login from './pages/CustomerPages/LoginPage';
import Signup from './pages/CustomerPages/SignupPage';
import ForgotPassword from './pages/ForgotPassword/fogotpassword';
import ChangePassword from './pages/ForgotPassword/changepassword';
import NotFound from './pages/NotFound';
import Messages from './pages/CustomerPages/messages';
import Profile from './pages/CustomerPages/Logged';
import AccountSetting from './pages/CustomerPages/AccountSetting';
import PaymentPage from './pages/CustomerPages/PaymentPage';
import BankTransferPage from './components/Payment/BankTransferPage';
import AuthLayout from './layouts/AuthLayout';

import SalesAdminLayout from './layouts/SalesAdminLayout';
import AuthSA from './pages/SalesAdminPages/AuthSA';
import AuthOM from './pages/OperationalManagerPages/AuthOM';
import OrderPage from './pages/SalesAdminPages/OrderPage';
import OrderDetail from './pages/SalesAdminPages/OrderDetail';
import OperationalManLayout from './layouts/OperationalManLayout';
import OrderPageOM from './pages/OperationalManagerPages/OrderPageOM';
import Employees from './pages/OperationalManagerPages/Employees';
import EmployeeDetail from './pages/OperationalManagerPages/employeeDetail';  
import CalendarOM from './pages/OperationalManagerPages/CalendarOM';
import MessageSA from './pages/SalesAdminPages/messageSA';
import AppLayout from './layouts/AppLayout';
import Calendar from './pages/SalesAdminPages/Calendar';
import DashboardSA from './pages/SalesAdminPages/Dashboard';
import ProductSA from './pages/SalesAdminPages/ProductSA';
import ProfileSA from './pages/SalesAdminPages/profileSA';
import ProfileOM from './pages/OperationalManagerPages/ProfileOM';
import OrderDetailOM from './pages/OperationalManagerPages/OrderDetailOM';
import CompleteProfile from './pages/CompleteProfile';

import SystemAdminLayout from './layouts/SystemAdminLayout';
import AuthSystemA from './pages/SystemAdminPages/AuthSystemA';
import SystemEmployee from './pages/SystemAdminPages/SystemEmployee';
import SystemAccounts from './pages/SystemAdminPages/SystemAccounts';
import SystemProfile from './pages/SystemAdminPages/SystemProfile';


// ✅ Protect logged-in customer routes
const ProtectedRoute = ({ element }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? element : <Navigate to="/login" replace />;
};

// ✅ Protect Sales Admin routes (Department-based access control)
const ProtectedAdminRoute = ({ element, allowedDepartments = ['Admin'] }) => {
  const employee = JSON.parse(localStorage.getItem('employee'));
  
  if (!employee) {

    return <Navigate to="/authSaleAdmin" replace />;
  }
  
  // Check if employee's department is allowed
  if (!allowedDepartments.includes(employee.assigneddepartment)) {
    return <Navigate to="/authSaleAdmin" replace />;
  }
  
  // Additional role check for Sales Admin
  if (employee.role !== 'Sales Admin') {

    return <Navigate to="/authSaleAdmin" replace />;
  }
  
  return element;
};

// ✅ Protect Operational Manager routes (Department-based access control)
const ProtectedOMRoute = ({ element, allowedDepartments = ['Operational Manager'] }) => {
  const employee = JSON.parse(localStorage.getItem('employee'));
  
  if (!employee) {

    return <Navigate to="/authOM" replace />;
  }
  
  // Check if employee's department is allowed
  if (!allowedDepartments.includes(employee.assigneddepartment)) {
    return <Navigate to="/authOM" replace />;
  }
  
  // Additional role check for Operational Manager
  if (employee.role !== 'Operational Manager') {

    return <Navigate to="/authOM" replace />;
  }
  
  return element;
};

// ✅ Protect Production/Assembly routes (for future use)
const ProtectedProductionRoute = ({ element, allowedDepartments = ['Production', 'Assembly'] }) => {
  const employee = JSON.parse(localStorage.getItem('employee'));
  
  if (!employee) {

    return <Navigate to="/authSaleAdmin" replace />;
  }
  
  // Check if employee's department is allowed
  if (!allowedDepartments.includes(employee.assigneddepartment)) {
    return <Navigate to="/authSaleAdmin" replace />;
  }
  
  return element;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* App layout with Navbar (always visible) */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/products" element={<Product />} />
        <Route path="/create-design" element={<CreateDesign />} />

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

      {/* AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/changepassword" element={<ChangePassword />} />
      </Route>

      {/* Profile Completion (standalone, no layout) */}
      <Route path="/complete-profile" element={<ProtectedRoute element={<CompleteProfile />} />} />

      {/*  Sales Admin layout */}
      <Route element={<SalesAdminLayout />}>
        <Route path="/orderpage" element={<ProtectedAdminRoute element={<OrderPage />} />} />
        <Route path="/orderdetail/:orderid" element={<ProtectedAdminRoute element={<OrderDetail />} />} />
        <Route path="/messageSA" element={<ProtectedAdminRoute element={<MessageSA />} />} />
        <Route path="/calendar" element={<ProtectedAdminRoute element={<Calendar />} />} />
        <Route path="/dashboardSA" element={<ProtectedAdminRoute element={<DashboardSA />} />} />
        <Route path="/productSA" element={<ProtectedAdminRoute element={<ProductSA />} />} />
        <Route path="/profileSA" element={<ProtectedAdminRoute element={<ProfileSA />} />} />
      </Route>

      {/*  Operational Manager layout */}
      <Route element={<OperationalManLayout />}>
        <Route path="/orderpageOM" element={<ProtectedOMRoute element={<OrderPageOM />} />} />
        <Route path="/calendarOM" element={<ProtectedOMRoute element={<CalendarOM />} />} />
        <Route path="/employees" element={<ProtectedOMRoute element={<Employees />} />} />
        <Route path="/employeeDetail" element={<ProtectedOMRoute element={<EmployeeDetail />} />} />
        <Route path="/profileOM" element={<ProtectedOMRoute element={<ProfileOM />} />} />
        <Route path="/orderdetailOM/:orderid" element={<ProtectedOMRoute element={<OrderDetailOM />} />} />
      </Route>

      {/* System Admin layout */}
      <Route element={<SystemAdminLayout />}>
        <Route path="/systememployees" element={<SystemEmployee />} />
        <Route path="/systemaccounts" element={<SystemAccounts />} />
        <Route path="/systemprofile" element={<SystemProfile />} />
      </Route>

      {/* Admin/Manager Auth */}
      <Route path="/authOM" element={<AuthOM />} />
      <Route path="/authSaleAdmin" element={<AuthSA />} />
      <Route path="/authSystemA" element={<AuthSystemA />} />
    </Route>
  )
);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
