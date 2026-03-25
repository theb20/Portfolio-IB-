import { BrowserRouter, Routes, Route } from "react-router-dom"
import RootLayout from "../layouts/RootLayout.jsx"
import AboutPage from "../pages/AboutPage.jsx"
import ContactPage from "../pages/ContactPage.jsx"
import HomePage from "../pages/HomePage.jsx"
import NotFoundPage from "../pages/NotFoundPage.jsx"
import ProjectPage from "../pages/ProjectPage.jsx"
import ProjectsPage from "../pages/ProjectsPage.jsx"

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
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
</BrowserRouter>
  )
}

