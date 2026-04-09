import { BrowserRouter, Routes, Route } from "react-router-dom"
import RootLayout from "../layouts/RootLayout.jsx"
import AboutPage from "../pages/AboutPage.jsx"
import ContactPage from "../pages/ContactPage.jsx"
import HomePage from "../pages/HomePage.jsx"
import NotFoundPage from "../pages/NotFoundPage.jsx"
import AccountPage from "../pages/AccountPage.jsx"
import CartPage from "../pages/CartPage.jsx"
import CheckoutPage from "../pages/CheckoutPage.jsx"
import OrderPage from "../pages/OrderPage.jsx"
import ProjectPage from "../pages/ProjectPage.jsx"
import ProjectsPage from "../pages/ProjectsPage.jsx"
import ProductPage from "../pages/ProductPage.jsx"
import ShopPage from "../pages/ShopPage.jsx"
import OrderSuccessPage from "../pages/OrderSuccessPage.jsx"
import LegalPage from "../pages/LegalPage.jsx"

export default function AppRouter() {
  return (
     <BrowserRouter>
  <Routes>
    <Route path="/" element={<RootLayout />}>
      <Route index element={<HomePage />} />
      <Route path="projects" element={<ProjectsPage />} />
      <Route path="projects/:slug" element={<ProjectPage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="contact" element={<ContactPage />} />
      <Route path="order" element={<OrderPage />} />
      <Route path="shop" element={<ShopPage />} />
      <Route path="shop/:id" element={<ProductPage />} />
      <Route path="cart" element={<CartPage />} />
      <Route path="checkout" element={<CheckoutPage />} />
      <Route path="account" element={<AccountPage />} />
      <Route path="order-success" element={<OrderSuccessPage />} />
      <Route path="terms" element={<LegalPage />} />
      <Route path="privacy" element={<LegalPage />} />
      <Route path="cookies" element={<LegalPage />} />
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
</BrowserRouter>
  )
}
