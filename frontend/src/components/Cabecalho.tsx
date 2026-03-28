import Botao from "./Botao";
import { useNavigate } from "react-router-dom";
import { useUsuario } from "../contexts/UsuarioContext";

interface CabecalhoProps {
  logado: boolean;
}

function obterNomePapel(idtPapel: "A" | "F" | "G"): string {
  switch (idtPapel) {
    case "A":
      return "Administrador";
    case "F":
      return "Funcionário";
    case "G":
      return "Gestor";
    default:
      return " ";
  }
}

const Cabecalho = ({ logado }: CabecalhoProps) => {
  const navigate = useNavigate();
  const { nomUsuario, idtPapel, limparUsuario } = useUsuario();
  const desPapel = idtPapel ? obterNomePapel(idtPapel as "A" | "F" | "G") : "";
  const onClickBotaoSair = () => {
    limparUsuario();
    navigate("/Login");
  };

  return (
    <header className="flex items-center justify-between text-gray-600 bg-gray-200 p-4 shadow-md">
      {/* Logo à esquerda */}
      {/*O logo é um jpg na pasta public*/}
      <div className="flex items-center">
        <img src="/SeapaLogo.jpg" alt="Logo SEAPA" className="h-16 w-36 mr-4" />
      </div>

      {/* Texto Central */}
      <div className="flex flex-col text-center text-gray-600 border-4 border-cyan-600 500 border-opacity-50 p-4">
        <h1 className="text-lg font-bold">
          Sistema de Gestão de Modelo
        </h1>
      </div>

      {logado && (
        <>
          {/* Perfil e Usuário */}
          <div className="flex flex-col text-left mr-4 p-4">
            <span>
              {nomUsuario}-{desPapel}
            </span>
          </div>
        </>
      )}
      {/* Botão Sair */}
      <div>
        <Botao titulo="Sair" onClick={onClickBotaoSair} />
      </div>
    </header>
  );
};

export default Cabecalho;
