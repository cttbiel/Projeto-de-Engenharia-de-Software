import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUsuario } from "../contexts/UsuarioContext";
import {
  autenticar,
  cadastrarConta,
  listarContas,
  normalizarCpf,
  type IdtPapel,
} from "../services/authLocalStorage";

const PAPEIS: { value: IdtPapel; label: string }[] = [
  { value: "A", label: "Administrador (menu completo + RM)" },
  { value: "F", label: "Funcionário" },
  { value: "G", label: "Gestor" },
];

type Aba = "entrar" | "cadastrar";

/**
 * Login e cadastro só no navegador (localStorage). Adequado para deploy estático (Vercel).
 */
export default function MockAuthPanel() {
  const navigate = useNavigate();
  const { setUsuario } = useUsuario();
  const [aba, setAba] = useState<Aba>("entrar");
  const [erro, setErro] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const contas = useMemo(() => listarContas(), [aba]);

  const [cpfEntrar, setCpfEntrar] = useState("");
  const [senhaEntrar, setSenhaEntrar] = useState("");

  const [nomeCad, setNomeCad] = useState("");
  const [cpfCad, setCpfCad] = useState("");
  const [senhaCad, setSenhaCad] = useState("");
  const [senhaCad2, setSenhaCad2] = useState("");
  const [papelCad, setPapelCad] = useState<IdtPapel>("A");

  const entrar = (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    const r = autenticar(cpfEntrar, senhaEntrar);
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    setUsuario(r.conta.cpf, r.conta.nome, r.conta.idtPapel);
    navigate("/TelaPadrao");
  };

  const cadastrar = (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    if (senhaCad !== senhaCad2) {
      setErro("As senhas não coincidem.");
      return;
    }
    const r = cadastrarConta({
      nome: nomeCad,
      cpf: cpfCad,
      senha: senhaCad,
      idtPapel: papelCad,
    });
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    setAba("entrar");
    setCpfEntrar(normalizarCpf(cpfCad));
    setSenhaEntrar(senhaCad);
    setNomeCad("");
    setCpfCad("");
    setSenhaCad("");
    setSenhaCad2("");
    setErro("");
    alert("Conta criada neste navegador. Faça o login com CPF e senha.");
  };

  /** Perfil aleatório para demonstração rápida (professor vê menus diferentes). */
  const visitanteAleatorio = () => {
    setErro("");
    const papeis: IdtPapel[] = ["A", "F", "G"];
    const idtPapel = papeis[Math.floor(Math.random() * papeis.length)];
    const n = Math.floor(10000000000 + Math.random() * 89999999999).toString();
    setUsuario(n, "Visitante (demo)", idtPapel);
    navigate("/TelaPadrao");
  };

  return (
    <>
      <h2 className="text-2xl font-semibold text-center mb-2">
        Acessar Sistema
      </h2>
      <p className="text-center text-sm text-slate-600 mb-4 px-2">
        Modo <strong>sem servidor</strong>: contas ficam só neste navegador
        (localStorage). Ideal para Vercel e para o professor testar o fluxo
        completo.
      </p>

      <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
        <button
          type="button"
          onClick={() => {
            setAba("entrar");
            setErro("");
          }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            aba === "entrar"
              ? "bg-white shadow text-slate-900"
              : "text-slate-600"
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => {
            setAba("cadastrar");
            setErro("");
          }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            aba === "cadastrar"
              ? "bg-white shadow text-slate-900"
              : "text-slate-600"
          }`}
        >
          Cadastrar
        </button>
      </div>

      {aba === "entrar" && (
        <form className="flex flex-col gap-4" onSubmit={entrar}>
          <label className="text-left text-sm font-medium text-slate-700">
            CPF (somente números)
            <input
              type="text"
              inputMode="numeric"
              autoComplete="username"
              placeholder="00000000000"
              value={cpfEntrar}
              onChange={(e) => setCpfEntrar(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="text-left text-sm font-medium text-slate-700">
            Senha
            <div className="relative mt-1">
              <input
                type={senhaVisivel ? "text" : "password"}
                autoComplete="current-password"
                value={senhaEntrar}
                onChange={(e) => setSenhaEntrar(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-12 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setSenhaVisivel((v) => !v)}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {senhaVisivel ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>
          {contas.length > 0 && (
            <p className="text-xs text-slate-500 text-left">
              Contas salvas neste aparelho:{" "}
              {contas.map((c) => c.nome).join(", ")}
            </p>
          )}
          {erro && <p className="text-red-600 text-sm text-left">{erro}</p>}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            Entrar
          </button>
        </form>
      )}

      {aba === "cadastrar" && (
        <form className="flex flex-col gap-4" onSubmit={cadastrar}>
          <label className="text-left text-sm font-medium text-slate-700">
            Nome completo
            <input
              type="text"
              value={nomeCad}
              onChange={(e) => setNomeCad(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="text-left text-sm font-medium text-slate-700">
            CPF (11 dígitos)
            <input
              type="text"
              inputMode="numeric"
              placeholder="00000000000"
              value={cpfCad}
              onChange={(e) => setCpfCad(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="text-left text-sm font-medium text-slate-700">
            Perfil (define o menu lateral)
            <select
              value={papelCad}
              onChange={(e) => setPapelCad(e.target.value as IdtPapel)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PAPEIS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-left text-sm font-medium text-slate-700">
            Senha (mín. 4 caracteres)
            <input
              type="password"
              value={senhaCad}
              onChange={(e) => setSenhaCad(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="text-left text-sm font-medium text-slate-700">
            Confirmar senha
            <input
              type="password"
              value={senhaCad2}
              onChange={(e) => setSenhaCad2(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          {erro && <p className="text-red-600 text-sm text-left">{erro}</p>}
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            Criar conta local
          </button>
        </form>
      )}

      <div className="mt-6 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={visitanteAleatorio}
          className="w-full rounded-lg border border-dashed border-violet-400 px-4 py-3 text-sm text-violet-800 hover:bg-violet-50"
        >
          Entrar como visitante (perfil aleatório — só para demonstração)
        </button>
      </div>
    </>
  );
}
