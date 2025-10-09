import { 
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom'
import Homepage from './pages/CustomerPages/Home'
import Product from './pages/CustomerPages/Product'
import Order from './pages/CustomerPages/Order'
import Checkout from './pages/CustomerPages/Checkout'
import Login from './pages/CustomerPages/LoginPage'
import Signup from './pages/CustomerPages/SignupPage'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import LoggedLayout from './layouts/LoggedLayout'
import NotFound from './pages/NotFound'
import Messages from './pages/CustomerPages/messages'
import Profile from './pages/CustomerPages/Logged'
import AccountSetting from './pages/CustomerPages/AccountSetting'
import PaymentPage from './pages/CustomerPages/PaymentPage'
import BankTransferPage from './components/Payment/BankTransferPage'


import SalesAdminLayout from './layouts/SalesAdminLayout'
import AuthSA from './pages/SalesAdminPages/AuthSA'
import AuthOM from './pages/OperationalManagerPages/AuthOM'
import OrderPage from './pages/SalesAdminPages/OrderPage'
import OrderDetail from './pages/SalesAdminPages/OrderDetail'
import OperationalManLayout from './layouts/OperationalManLayout'
import OrderPageOM from './pages/OperationalManagerPages/OrderPageOM'
import Employees from './pages/OperationalManagerPages/Employees'
//import employeeDetail from './pages/OperationalManagerPages/employeeDetail'
import MessageSA from './pages/SalesAdminPages/messageSA'


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* Main layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Homepage />} />
        
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Auth layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />  
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Logged in layout */}
      <Route element={<LoggedLayout />}>
        <Route path="Logged" element={<Profile />} />
        <Route path="products" element={<Product />} />
        <Route path="orders" element={<Order />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="messages" element={<Messages />} />
        <Route path="accountsetting" element={<AccountSetting />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="banktransfer" element={<BankTransferPage />} />
      </Route>

      {/* Sales Admin */}
      <Route element={<SalesAdminLayout />}>
        <Route path='/orderpage' element={<OrderPage />} />
        <Route path='/orderdetail' element={<OrderDetail />} />
        <Route path='/messageSA' element={<MessageSA />} />
      </Route>

      {/* Operational Manager */}
      <Route element={<OperationalManLayout />}>
        <Route path='/orderpageOM' element={<OrderPageOM />} />
        <Route path='/employees' element={<Employees />} />
        <Route path='/employeeDetail' element={<employeeDetail />} />
      </Route>


      <Route path='/authOM' element={<AuthOM />} />
      <Route path='/authSaleAdmin' element={<AuthSA />} />

    </Route>
  ),
  
)

const App = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default App