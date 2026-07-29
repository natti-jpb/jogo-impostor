const basePath = '/impostor-game';

/** @type {import('next').NextConfig} */
module.exports = {
  // o app e servido em joaobonatti.com/impostor-game via rewrite
  basePath,
  // exposto ao cliente porque basePath nao alcanca fetch() — ver lib/apiPath.js
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // com basePath ativo a raiz passa a dar 404, quebrando quem tem o link antigo.
  // basePath: false impede o Next de prefixar o source, senao a regra viraria
  // /impostor-game -> /impostor-game e nunca casaria com a raiz.
  async redirects() {
    return [{ source: '/', destination: basePath, permanent: false, basePath: false }];
  },
};
