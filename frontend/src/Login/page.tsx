import { useEffect } from "react";
import TelaSemMenu from "../components/TelaSemMenu";
import { useUsuario } from "../contexts/UsuarioContext";
import { isMockAuthMode } from "../config/authMode";
import ApiLoginFlow from "./ApiLoginFlow";
import MockAuthPanel from "./MockAuthPanel";

export default function Login() {
  const { limparUsuario } = useUsuario();

  useEffect(() => {
    limparUsuario();
  }, [limparUsuario]);

  return (
    <TelaSemMenu titulo="Login">
      <div className="flex flex-col items-center justify-center w-full h-full gap-6">
        <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">
          {isMockAuthMode() ? <MockAuthPanel /> : <ApiLoginFlow />}
        </div>
      </div>
    </TelaSemMenu>
  );
}
