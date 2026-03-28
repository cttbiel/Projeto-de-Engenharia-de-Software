/**
 * Contas de demonstração persistidas em localStorage (apenas protótipo — não é segurança real).
 */

export type IdtPapel = "A" | "F" | "G";

export interface ContaLocal {
  id: string;
  cpf: string;
  nome: string;
  senha: string;
  idtPapel: IdtPapel;
  criadoEm: string;
}

const STORAGE_KEY = "mock_auth_contas_v1";

function ler(): ContaLocal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as ContaLocal[];
  } catch {
    return [];
  }
}

function gravar(contas: ContaLocal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contas));
}

export function listarContas(): ContaLocal[] {
  return ler();
}

export function normalizarCpf(input: string): string {
  return input.replace(/\D/g, "").slice(0, 11);
}

export function cadastrarConta(params: {
  nome: string;
  cpf: string;
  senha: string;
  idtPapel: IdtPapel;
}): { ok: true } | { ok: false; erro: string } {
  const nome = params.nome.trim();
  const cpf = normalizarCpf(params.cpf);
  if (nome.length < 2) return { ok: false, erro: "Informe um nome válido." };
  if (cpf.length !== 11) return { ok: false, erro: "CPF deve ter 11 dígitos." };
  if (params.senha.length < 4)
    return { ok: false, erro: "Senha com no mínimo 4 caracteres." };

  const contas = ler();
  if (contas.some((c) => c.cpf === cpf)) {
    return { ok: false, erro: "Já existe conta com este CPF neste navegador." };
  }

  const nova: ContaLocal = {
    id: crypto.randomUUID(),
    cpf,
    nome,
    senha: params.senha,
    idtPapel: params.idtPapel,
    criadoEm: new Date().toISOString(),
  };
  contas.push(nova);
  gravar(contas);
  return { ok: true };
}

export function autenticar(
  cpf: string,
  senha: string
): { ok: true; conta: ContaLocal } | { ok: false; erro: string } {
  const c = normalizarCpf(cpf);
  if (c.length !== 11) return { ok: false, erro: "CPF inválido." };
  const contas = ler();
  const conta = contas.find((x) => x.cpf === c);
  if (!conta) return { ok: false, erro: "CPF não cadastrado neste navegador." };
  if (conta.senha !== senha) return { ok: false, erro: "Senha incorreta." };
  return { ok: true, conta };
}
