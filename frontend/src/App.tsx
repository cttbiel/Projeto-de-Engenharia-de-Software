import React, { type ErrorInfo, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UsuarioProvider } from "./contexts/UsuarioContext";
import { RmProvider } from "./contexts/RmContext";

import Login from "./Login/page";

import TelaPadrao from "./components/TelaPadrao"; // Importe TelaPadrao

import "./App.css";

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<
  { children?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Ocorreu um erro:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Algo deu errado.</h1>;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <UsuarioProvider>
          <RmProvider>
          <Routes>
            {/* Rotas públicas (sem autenticação) */}
            <Route path="/" element={<Navigate to="/Login" replace />} />
            <Route path="/Login" element={<Login />} />

            {/* Rota protegida que usa TelaPadrao como layout */}
            <Route
              path="/*"
              element={
                //<RequireAuth>
                <TelaPadrao />
                //</RequireAuth>
              }
            />
          </Routes>
          </RmProvider>
        </UsuarioProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
