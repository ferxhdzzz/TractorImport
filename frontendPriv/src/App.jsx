import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import RecuperacionContra from './pages/RecuperacionContra'; 
import CambiarCont from './pages/CambiarCont';
import VerificarCodigo from './pages/VerificarCodigo';             
import Dashboard from './pages/Dashboard';
import Ajustes from './pages/Ajustes';
import Customers from './pages/Customers';
import Gastos from './pages/Gastos';
import Lands from './pages/Lands';
import ProductPriv from './pages/Products-Private';
import AddProduct from './pages/AgregarProducto';
// Componente para proteger rutas
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
        {/* Rutas PÚBLICAS */}
        <Route path="/" element={<Home />} />


        {/* Auth Admin */}
        <Route path="/login" element={<Login />} />
        <Route path="/recuperacion" element={<RecuperacionContra />} />
        <Route path="/cambiar" element={<CambiarCont />} />
        <Route path="/verificar-codigo" element={<VerificarCodigo />} />
        <Route path="/cambiar" element={<CambiarCont />} />


        {/* Rutas PRIVADAS */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ajustes"
          element={
            <ProtectedRoute>
              <Ajustes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/productPriv"
          element={
            <ProtectedRoute>
              <ProductPriv />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AddProduct"
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          }
        />
       
       <Route
          path="/Gastos"
          element={
            <ProtectedRoute>
              <Gastos />
            </ProtectedRoute>
          }
        />
       
        
        <Route
          path="/Lands"
          element={
            <ProtectedRoute>
              <Lands />
            </ProtectedRoute>
          }
        />
         
      </Routes>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;
