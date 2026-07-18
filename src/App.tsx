import { Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "./admin/layouts/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import Login from "./admin/pages/Login";
import NewReservation from "./admin/pages/NewReservation";
import Reservations from "./admin/pages/Reservations";
import Settings from "./admin/pages/Settings";
import ProtectedRoute from "./admin/routes/ProtectedRoute";

import PublicLayout from "./components/layouts/PublicLayout";
import ApartmentDetail from "./components/pages/ApartmentDetail";
import Availability from "./components/pages/Availability";
import Home from "./components/pages/Home";
import ReservationSuccess from "./components/pages/ReservationSuccess";

function App() {
  return (
    <Routes>
      {/* Sitio público */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />

        <Route
          path="/apartamentos"
          element={<Navigate to="/#apartamentos" replace />}
        />

        <Route path="/apartamentos/:id" element={<ApartmentDetail />} />
        <Route path="/disponibilidad" element={<Availability />} />
        <Route path="/reserva-exitosa" element={<ReservationSuccess />} />
      </Route>

      {/* Login administrador */}
      <Route path="/admin/login" element={<Login />} />

      {/* Rutas protegidas del administrador */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/reservas" element={<Reservations />} />
          <Route path="/admin/nueva-reserva" element={<NewReservation />} />
          <Route path="/admin/configuracion" element={<Settings />} />
        </Route>
      </Route>

      {/* Ruta no encontrada */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
