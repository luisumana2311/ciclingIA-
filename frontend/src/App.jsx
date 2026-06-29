import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import PerfilPage from "./pages/PerfilPage";
import HistorialPage from "./pages/HistorialPage";
import RegistroPage from "./pages/RegistroPage";
import Navbar from "./components/Navbar";
import EvolucionPage from "./pages/EvolucionPage";
import ActividadesGarminPage from "./pages/ActividadesGarminPage";
import BibliotecaPage from "./pages/BibliotecaPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OnboardingPage from "./pages/OnboardingPage";
import DetalleSesionPage from "./pages/DetalleSesionPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/perfil" element={<PerfilPage />} />
        <Route path="/historial" element={<HistorialPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/evolucion" element={<EvolucionPage />} />
        <Route path="/garmin" element={<ActividadesGarminPage />} />
        <Route path="/biblioteca" element={<BibliotecaPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrarse" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/sesion/:index" element={<DetalleSesionPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
