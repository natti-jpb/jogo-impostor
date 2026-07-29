/**
 * basePath do Next prefixa <Link>, router.push e assets automaticamente,
 * mas NAO prefixa URL montada a mao — nem em fetch(), nem no texto de
 * compartilhar da sala. Sem isto, com o app servido em
 * joaobonatti.com/impostor-game essas URLs apontariam para a raiz do
 * dominio e voltariam 404.
 *
 * O nome diz "api" por historico; hoje serve para qualquer caminho.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const apiPath = (path) => `${BASE}${path}`;
