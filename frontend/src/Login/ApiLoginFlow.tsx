import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUsuario } from "../contexts/UsuarioContext";
import baseUrl from "../Api";

interface UsuarioLogado {
  cpf: string;
  nome: string;
  perfil: string;
  senha: string;
  idtTemSenha: boolean;
}

/**
 * Fluxo original do template: CPF → API → senha / cadastro de senha.
 * Requer back-end em `VITE_API_URL`.
 */
export default function ApiLoginFlow() {
  const [cpf, setCpf] = useState("");
  const [usuarioValido, setUsuarioValido] = useState<UsuarioLogado | null>(
    null
  );
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erro, setErro] = useState("");
  const toggleSenhaVisivel = () => setSenhaVisivel((prev) => !prev);
  const { setUsuario } = useUsuario();
  const navigate = useNavigate();

  const verificarCpf = async (e: React.FormEvent) => {
    e.preventDefault();
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (!baseUrl) {
      setErro("Configure VITE_API_URL no ambiente ou use o modo de autenticação local.");
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/loginAcesso/${cpfLimpo}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        const mensagemBackend = errorData?.mensagem || "Erro na requisição";
        throw new Error(mensagemBackend);
      }

      const resultado = await response.json();

      setUsuarioValido({
        cpf: cpfLimpo,
        nome: "",
        perfil: "",
        senha: "",
        idtTemSenha: resultado?.idtTemSenha ?? true,
      });
      setErro("");
    } catch (err: unknown) {
      console.error("Erro ao verificar CPF:", err);
      const msg =
        err instanceof Error ? err.message : "Erro ao verificar CPF.";
      const redeIndisponivel =
        msg === "Failed to fetch" ||
        (err instanceof TypeError && msg.includes("fetch"));
      if (redeIndisponivel) {
        setErro(
          "Não foi possível conectar à API. Verifique se o back-end está rodando em " +
            (baseUrl || "(VITE_API_URL não definida)") +
            "."
        );
      } else {
        setErro(msg);
      }
      setUsuarioValido(null);
    }
  };

  const verificarSenha = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuarioValido?.cpf) {
      setErro("Nenhum usuário validado. Por favor, verifique o CPF.");
      return;
    }

    const cpfLimpo = usuarioValido.cpf;

    if (!baseUrl) {
      setErro("VITE_API_URL não configurada.");
      return;
    }

    if (!usuarioValido.idtTemSenha) {
      if (senha.length < 4 || confirmarSenha.length < 4) {
        setErro("A senha deve ter no mínimo 4 caracteres.");
        return;
      }

      if (senha !== confirmarSenha) {
        setErro("As senhas digitadas não coincidem.");
        return;
      }

      try {
        const response = await fetch(`${baseUrl}/api/alterarSenha`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            codUsuarioCPF: cpfLimpo,
            desSenha: senha,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.mensagem || "Erro ao salvar senha.");
        }

        const resultado = await response.json();
        if (resultado?.sucesso) {
          alert("Senha cadastrada com sucesso!");
          setErro("");
        } else {
          setErro(resultado?.mensagem || "Falha ao cadastrar senha.");
        }
      } catch (error: unknown) {
        console.error("Erro ao cadastrar senha:", error);
        setErro(
          error instanceof Error ? error.message : "Erro ao cadastrar senha."
        );
      }
    }

    try {
      const response = await fetch(`${baseUrl}/api/loginAcesso`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codUsuarioCPF: cpfLimpo,
          desSenha: senha,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.mensagem || "Erro ao autenticar.");
      }

      const resultado = await response.json();

      if (resultado?.length > 0) {
        const usuario = resultado[0];

        setErro("");
        setUsuario(
          usuario.codUsuarioCPF || "",
          usuario.nomUsuario || "",
          usuario.idtPapel || ""
        );

        if (usuario.idtPapel) {
          navigate("/TelaPadrao");
        } else {
          setErro(resultado?.mensagem || "Nenhum papel atribuido ao usuario");
        }
      } else {
        setErro(resultado?.mensagem || "Falha ao autenticar.");
      }
    } catch (error: unknown) {
      setErro(
        error instanceof Error ? error.message : "Erro ao verificar senha."
      );
    }
  };

  return (
    <>
      <h2 className="text-2xl font-semibold text-center mb-2">
        Acessar Sistema
      </h2>
      <p className="text-center text-sm text-slate-500 mb-6">
        Autenticação via API (back-end obrigatório).
      </p>
      {!usuarioValido && (
        <form className="flex flex-col gap-4" onSubmit={verificarCpf}>
          <input
            type="text"
            placeholder="CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            Avançar
          </button>
        </form>
      )}
      {usuarioValido && (
        <form className="flex flex-col gap-4" onSubmit={verificarSenha}>
          <div className="text-center text-gray-700">
            <span className="text-sm">Usuário:</span>
            <p className="text-lg font-semibold">{usuarioValido.nome}</p>
          </div>

          {!usuarioValido.idtTemSenha ? (
            <>
              <div className="relative">
                <input
                  type={senhaVisivel ? "text" : "password"}
                  placeholder="Criar senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={toggleSenhaVisivel}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {senhaVisivel ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={senhaVisivel ? "text" : "password"}
                  placeholder="Confirmar senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={toggleSenhaVisivel}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {senhaVisivel ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </>
          ) : (
            <div className="relative">
              <input
                type={senhaVisivel ? "text" : "password"}
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={toggleSenhaVisivel}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {senhaVisivel ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          )}
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            Entrar
          </button>
        </form>
      )}
    </>
  );
}
