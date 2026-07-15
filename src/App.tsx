import { Navigate, Route, Routes } from "react-router-dom";

import PublicLayout from "./components/layouts/PublicLayout";
import Home from "./components/pages/Home";
import ApartmentDetail from "./components/pages/ApartmentDetail";

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />

        <Route
          path="/apartamentos"
          element={<Navigate to="/#apartamentos" replace />}
        />

        <Route path="/apartamentos/:id" element={<ApartmentDetail />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
