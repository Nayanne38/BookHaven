const LIVROS_BASE = [
  { titulo: 'Dom Casmurro', autor: 'Machado de Assis', ano: 1899, categoria: 'Romance', isbn: '9788535911664', estante: '12', prateleira: 'B', status: 'emprestado' },
  { titulo: 'Senhora', autor: 'José de Alencar', ano: 1875, categoria: 'Romance', isbn: '9788508040018', estante: '12', prateleira: 'B', status: 'perdido', observacoes: 'Não foi encontrado no inventário de outubro.' },
  { titulo: 'A Moreninha', autor: 'Joaquim Manuel de Macedo', ano: 1844, categoria: 'Romance', isbn: '9788508134311', estante: '12', prateleira: 'A', status: 'disponivel' },
  { titulo: 'Orgulho e Preconceito', autor: 'Jane Austen', ano: 1813, categoria: 'Romance', isbn: '9788544001820', estante: '12', prateleira: 'C', status: 'emprestado' },
  { titulo: 'Jane Eyre', autor: 'Charlotte Brontë', ano: 1847, categoria: 'Romance', isbn: '9788594318602', estante: '12', prateleira: 'C', status: 'disponivel' },
  { titulo: 'Capitães da Areia', autor: 'Jorge Amado', ano: 1937, categoria: 'Romance', isbn: '9788535914061', estante: '12', prateleira: 'D', status: 'disponivel' },
  { titulo: 'Gabriela, Cravo e Canela', autor: 'Jorge Amado', ano: 1958, categoria: 'Romance', isbn: '9788535914092', estante: '12', prateleira: 'D', status: 'disponivel' },
  { titulo: 'A Hora da Estrela', autor: 'Clarice Lispector', ano: 1977, categoria: 'Romance', isbn: '9788532511010', estante: '12', prateleira: 'A', status: 'disponivel' },
  { titulo: 'O Alquimista', autor: 'Paulo Coelho', ano: 1988, categoria: 'Romance', isbn: '9788576657804', estante: '12', prateleira: 'E', status: 'disponivel' },

  { titulo: 'O Cortiço', autor: 'Aluísio Azevedo', ano: 1890, categoria: 'Clássicos brasileiros', isbn: '9788508128174', estante: '10', prateleira: 'A', status: 'disponivel' },
  { titulo: 'Vidas Secas', autor: 'Graciliano Ramos', ano: 1938, categoria: 'Clássicos brasileiros', isbn: '9788501019257', estante: '10', prateleira: 'B', status: 'perdido', observacoes: 'Emprestado em 2023 e nunca devolvido.' },
  { titulo: 'Grande Sertão: Veredas', autor: 'João Guimarães Rosa', ano: 1956, categoria: 'Clássicos brasileiros', isbn: '9788525056047', estante: '10', prateleira: 'C', status: 'disponivel' },
  { titulo: 'Auto da Compadecida', autor: 'Ariano Suassuna', ano: 1955, categoria: 'Clássicos brasileiros', isbn: '9788520932063', estante: '10', prateleira: 'C', status: 'disponivel' },

  { titulo: 'Dom Quixote de la Mancha', autor: 'Miguel de Cervantes', ano: 1605, categoria: 'Clássicos universais', isbn: '9788573262421', estante: '11', prateleira: 'A', status: 'perdido', observacoes: 'Volume 1 sumiu da estante.' },
  { titulo: 'Cem Anos de Solidão', autor: 'Gabriel García Márquez', ano: 1967, categoria: 'Clássicos universais', isbn: '9788501012067', estante: '11', prateleira: 'B', status: 'perdido' },

  { titulo: 'O Pequeno Príncipe', autor: 'Antoine de Saint-Exupéry', ano: 1943, categoria: 'Infantil', isbn: '9788522031450', estante: '3', prateleira: 'A', status: 'emprestado' },
  { titulo: 'Reinações de Narizinho', autor: 'Monteiro Lobato', ano: 1931, categoria: 'Infantil', isbn: '9788525056511', estante: '3', prateleira: 'A', status: 'disponivel' },
  { titulo: 'Alice no País das Maravilhas', autor: 'Lewis Carroll', ano: 1865, categoria: 'Infantil', isbn: '9788537815113', estante: '3', prateleira: 'B', status: 'disponivel' },
  { titulo: 'O Menino Maluquinho', autor: 'Ziraldo', ano: 1980, categoria: 'Infantil', isbn: '9788506058480', estante: '3', prateleira: 'B', status: 'disponivel' },

  { titulo: 'Fundamentos de Matemática Elementar, Vol. 1', autor: 'Gelson Iezzi e Carlos Murakami', ano: 1977, categoria: 'Didático', isbn: '9788535716801', estante: '5', prateleira: 'A', status: 'disponivel' },
  { titulo: 'Novíssima Gramática da Língua Portuguesa', autor: 'Domingos Paschoal Cegalla', ano: 1964, categoria: 'Didático', isbn: '9788504018523', estante: '5', prateleira: 'B', status: 'disponivel' },
  { titulo: 'Atlas Geográfico Escolar', autor: 'IBGE', ano: 2018, categoria: 'Didático', isbn: '9788524043376', tipoMaterial: 'mapa', estante: '5', prateleira: 'C', status: 'disponivel' },
  { titulo: 'Ciência Hoje, nº 300', autor: 'Sociedade Brasileira para o Progresso da Ciência', ano: 2013, categoria: 'Didático', tipoMaterial: 'revista', estante: 'P1', prateleira: 'A', status: 'perdido', observacoes: 'Edição comemorativa; procurar na sala de leitura 2.' },

  { titulo: 'Olga', autor: 'Fernando Morais', ano: 1985, categoria: 'Biografia', isbn: '9788535920086', estante: '15', prateleira: 'A', status: 'emprestado' },
  { titulo: 'O Diário de Anne Frank', autor: 'Anne Frank', ano: 1947, categoria: 'Biografia', isbn: '9788501061102', estante: '15', prateleira: 'A', status: 'disponivel' },
  { titulo: 'Longa Caminhada até a Liberdade', autor: 'Nelson Mandela', ano: 1994, categoria: 'Biografia', isbn: '9788535917581', estante: '15', prateleira: 'B', status: 'disponivel' },

  { titulo: 'Sentimento do Mundo', autor: 'Carlos Drummond de Andrade', ano: 1940, categoria: 'Poesia', isbn: '9788535911800', estante: '14', prateleira: 'A', status: 'disponivel' },

  { titulo: 'Central do Brasil', autor: 'Walter Salles', ano: 1998, categoria: 'Cinema e artes', tipoMaterial: 'dvd', estante: 'M1', prateleira: 'A', status: 'emprestado' },

  { titulo: 'Memórias Póstumas de Brás Cubas (edição histórica)', autor: 'Machado de Assis', ano: 1881, categoria: 'Clássicos brasileiros', estante: 'R1', prateleira: 'A', status: 'disponivel', obraRara: true, observacoes: 'Doação da família Albuquerque. Manusear com luvas.' },
  { titulo: 'Os Sertões (primeira edição)', autor: 'Euclides da Cunha', ano: 1902, categoria: 'Clássicos brasileiros', estante: 'R1', prateleira: 'A', status: 'disponivel', obraRara: true, observacoes: 'Capa original restaurada em 2009.' },
  { titulo: 'Casa-Grande & Senzala (primeira edição)', autor: 'Gilberto Freyre', ano: 1933, categoria: 'História e ensaios', estante: 'R1', prateleira: 'B', status: 'disponivel', obraRara: true, observacoes: 'Autor pernambucano; peça de destaque do acervo.' },
  { titulo: 'O Guarani (edição em folhetim)', autor: 'José de Alencar', ano: 1857, categoria: 'Clássicos brasileiros', estante: 'R1', prateleira: 'B', status: 'disponivel', obraRara: true },
];

const DATA_BASE = Date.parse('2025-03-01T09:00:00.000Z');
const UM_MINUTO = 60 * 1000;

const SALA_2 = ['3', '5', 'P1', 'M1'];

export const LIVROS_SEED = LIVROS_BASE.map((livro, indice) => ({
  ...livro,
  sala: SALA_2.includes(livro.estante) ? '2' : '1',
  id: `livro-${String(indice + 1).padStart(3, '0')}`,
  criadoEm: new Date(DATA_BASE + indice * UM_MINUTO).toISOString(),
}));
