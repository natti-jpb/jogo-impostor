/**
 * basePath do Next prefixa <Link>, router.push e assets automaticamente,
 * mas NAO prefixa fetch() escrito a mao. Sem isto, com o app servido em
 * joaobonatti.com/impostor-game as chamadas iriam para /api/rooms na raiz
 * do dominio e voltariam 404.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const apiPath = (path) => `${BASE}${path}`;
