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
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<MainLayout />}>
      <Route path="/" element={<Homepage />} />
      <Route path="/products" element={<Product />} />
      <Route path="/orders" element={<Order />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  ),
  
)

const App = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default App