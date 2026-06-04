export const CATEGORIES = {
  "Animais": ["Cachorro","Gato","Elefante","Tigre","Leão","Girafa","Cavalo","Coelho","Tartaruga","Tubarão","Polvo","Pinguim","Crocodilo","Águia","Macaco","Urso","Lobo","Raposa","Coruja","Golfinho"],
  "Comidas": ["Pizza","Hambúrguer","Sushi","Lasanha","Feijoada","Brigadeiro","Coxinha","Pão de queijo","Açaí","Tapioca","Pastel","Churrasco","Risoto","Sorvete","Hot dog","Cuscuz","Mousse","Pudim","Salada","Macarrão"],
  "Lugares": ["Praia","Montanha","Escola","Hospital","Aeroporto","Shopping","Praça","Floresta","Deserto","Caverna","Estádio","Igreja","Museu","Cinema","Restaurante","Padaria","Academia","Biblioteca","Zoológico","Parque"],
  "Profissões": ["Médico","Professor","Engenheiro","Advogado","Bombeiro","Policial","Padeiro","Piloto","Dentista","Ator","Cantor","Pintor","Encanador","Eletricista","Jardineiro","Cozinheiro","Veterinário","Jornalista","Programador","Arquiteto"],
  "Esportes": ["Futebol","Vôlei","Basquete","Tênis","Natação","Boxe","Surfe","Skate","Ciclismo","Corrida","Xadrez","Judô","Ginástica","Handebol","Beisebol","Golfe","Esgrima","Rugby","Hipismo","Automobilismo"],
  "Filmes/Séries": ["Titanic","Vingadores","Matrix","Senhor dos Anéis","Harry Potter","Star Wars","Frozen","Toy Story","Stranger Things","Breaking Bad","Game of Thrones","La Casa de Papel","The Office","Friends","Round 6","Avatar","Coringa","Pantera Negra","Shrek","Procurando Nemo"],
  "Objetos": ["Celular","Computador","Televisão","Geladeira","Cadeira","Mesa","Cama","Espelho","Relógio","Caneta","Livro","Mochila","Óculos","Chave","Carteira","Ventilador","Lâmpada","Travesseiro","Escova","Sapato"]
};

export const CATEGORY_NAMES = Object.keys(CATEGORIES);

export function pickWord(category) {
  let cat = category;
  if (!cat || cat === 'Aleatório' || !CATEGORIES[cat]) {
    cat = CATEGORY_NAMES[Math.floor(Math.random() * CATEGORY_NAMES.length)];
  }
  const list = CATEGORIES[cat];
  const word = list[Math.floor(Math.random() * list.length)];
  return { category: cat, word };
}
