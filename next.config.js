const basePath = '/impostor-game';

/** @type {import('next').NextConfig} */
module.exports = {
  // o app e servido em joaobonatti.com/impostor-game via rewrite
  basePath,
  // exposto ao cliente porque basePath nao alcanca fetch() — ver lib/apiPath.js
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};
