import { 
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom'
import Homepage from './pages/Home'
import Product from './pages/Product'
import Order from './pages/Order'
import Checkout from './pages/Checkout'
import Login from './pages/LoginPage'
import Signup from './pages/SignupPage'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import NotFound from './pages/NotFound'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* Main layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/products" element={<Product />} />
        <Route path="/orders" element={<Order />} />
        <Route path="/checkout" element={<Checkout />} />
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Auth layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />  
        <Route path="/signup" element={<Signup />} />
      </Route>




    </Route>
  ),
  
)

const App = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default App