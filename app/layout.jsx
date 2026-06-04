import './globals.css';

export const metadata = {
  title: 'Jogo do Impostor',
  description: 'Jogo do impostor online — cada jogador no seu celular',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
