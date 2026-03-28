import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface UsuarioContextData {
  codUsuarioCPF: string;
  nomUsuario: string;
  idtPapel: string;
  tituloPagina: string;

  setUsuario: (
    codUsuarioCPF: string,
    nomUsuario: string,
    idtPapel: string //Adm,Funcionario, Gestor
  ) => void;

  setIDtPapel: (idtPapel: string) => void;
  limparUsuario: () => void;
  setTituloPagina: (titulo: string) => void;
}

// 2. Criação do contexto
const UsuarioContext = createContext<UsuarioContextData | undefined>(undefined);

// 3. Props do Provider
interface UsuarioProviderProps {
  children: ReactNode;
}

// 4. Provider
export const UsuarioProvider = ({ children }: UsuarioProviderProps) => {
  const [codUsuarioCPF, setCodUsuarioCPF] = useState(
    () => localStorage.getItem("codUsuarioCPF") || ""
  );
  const [nomUsuario, setNomUsuario] = useState(
    () => localStorage.getItem("nomUsuario") || ""
  );
  const [idtPapel, setIdtPapel] = useState(
    () => localStorage.getItem("idtPapel") || ""
  );
  const [tituloPagina, setTituloPagina] = useState("Título Padrão"); // Estado para o título

  const setUsuario = (
    codUsuarioCPF: string,
    nomUsuario: string,
    idtPapel: string
  ) => {
    setCodUsuarioCPF(codUsuarioCPF);
    setNomUsuario(nomUsuario);
    setIdtPapel(idtPapel);
    localStorage.setItem("codUsuarioCPF", codUsuarioCPF);
    localStorage.setItem("nomUsuario", nomUsuario);
    localStorage.setItem("idtPapel", idtPapel);
  };

  const setIDtPapel = (idtPapel: string) => {
    setIdtPapel(idtPapel);
    localStorage.setItem("idtPapel", idtPapel);
  };

  /** Encerra sessão sem apagar contas mock / outros dados do app (ex.: authLocalStorage). */
  const limparUsuario = useCallback(() => {
    localStorage.removeItem("codUsuarioCPF");
    localStorage.removeItem("nomUsuario");
    localStorage.removeItem("idtPapel");
    setCodUsuarioCPF("");
    setNomUsuario("");
    setIdtPapel("");
  }, []);

  return (
    <UsuarioContext.Provider
      value={{
        codUsuarioCPF,
        nomUsuario,
        idtPapel,
        tituloPagina,
        setUsuario,
        limparUsuario,
        setIDtPapel,
        setTituloPagina,
      }}
    >
      {children}
    </UsuarioContext.Provider>
  );
};

// 5. Hook customizado para facilitar o uso do contexto
export const useUsuario = () => {
  const context = useContext(UsuarioContext);
  if (!context) {
    throw new Error("useUsuario deve ser usado dentro de um UsuarioProvider");
  }
  return context;
};
