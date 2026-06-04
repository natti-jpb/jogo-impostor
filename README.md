# Jogo do Impostor 🕵️

Versão online e multiplayer do clássico jogo do impostor — cada jogador entra do seu próprio celular ou computador.

🎮 **Joga aqui:** https://impostor-by-natti.vercel.app

## Como jogar

1. O **host** cria uma sala e recebe um código de 4 letras (ex: `ABCD`).
2. Os outros jogadores abrem o link e entram com o código + um nome.
3. O host escolhe quantos impostores (1–3) e a categoria das palavras (ou aleatório).
4. Cada jogador vê **no seu próprio dispositivo**:
   - A palavra secreta, **ou**
   - "VOCÊ É O IMPOSTOR" (não recebe palavra).
5. Em volta da mesa, cada um dá uma dica sutil sobre a palavra. O impostor finge que sabe.
6. Durante a rodada dá pra **votar clicando no nome** de quem você suspeita — o voto é visual e acumulativo, dá pra mudar a qualquer momento.
7. Quando todos quiserem, o host clica em **Revelar impostores** — mostra a palavra e quem eram.
8. **Nova rodada** mantém os mesmos jogadores e sorteia tudo de novo.

Mínimo 3 jogadores. Salas expiram em 6 horas de inatividade.

## Stack

- **Next.js 15** (App Router) — frontend e API routes
- **Upstash Redis** (via Vercel Marketplace) — estado das salas
- **Vercel** — hosting
- Sincronização por polling a cada 2s (suficiente pro fluxo do jogo)

## Rodar local

```bash
pnpm install
# .env.local com KV_REST_API_URL e KV_REST_API_TOKEN
pnpm dev
```

## Categorias incluídas

Animais, Comidas, Lugares, Profissões, Esportes, Filmes/Séries, Objetos.

---

Inspirado em https://jogodoimpostor.com.br/ — feito pra jogar com amigos sem precisar passar o celular.
