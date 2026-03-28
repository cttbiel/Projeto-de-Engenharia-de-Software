/**
 * Modo sem API: cadastro/login só no navegador (ideal para Vercel sem back-end).
 *
 * - VITE_USE_MOCK_AUTH=true  → força modo local
 * - VITE_USE_MOCK_AUTH=false → força API (precisa de VITE_API_URL)
 * - Se não definido: usa API só se VITE_API_URL estiver preenchida; caso contrário, modo local.
 */
export function isMockAuthMode(): boolean {
  const flag = import.meta.env.VITE_USE_MOCK_AUTH;
  if (flag === "true") return true;
  if (flag === "false") return false;
  const url = import.meta.env.VITE_API_URL?.trim();
  if (!url) return true;
  // Evita build de produção (ex.: Vercel) preso a API local se .env foi commitado com localhost
  if (
    import.meta.env.PROD &&
    /localhost|127\.0\.0\.1/i.test(url)
  ) {
    return true;
  }
  return false;
}
