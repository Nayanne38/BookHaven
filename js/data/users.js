export const USUARIOS = Object.freeze([
  { id: 'silvia', nome: 'Silvia', perfil: 'bibliotecaria', rotulo: 'Bibliotecária', senha: 'silvia123' },
  { id: 'thiago', nome: 'Thiago', perfil: 'auxiliar', rotulo: 'Auxiliar', senha: 'thiago123' },
  { id: 'joao', nome: 'Seu João', perfil: 'leitor', rotulo: 'Leitor', senha: 'joao123' },
]);

export const PERFIL_NOVO_CADASTRO = Object.freeze({ perfil: 'leitor', rotulo: 'Leitor' });

export const TELAS_PROTEGIDAS = Object.freeze(['inicio', 'catalogo', 'painel', 'gerenciar']);

export const TELAS_DA_EQUIPE = Object.freeze(['painel', 'gerenciar']);

export const PERFIS_ATRIBUIVEIS = Object.freeze([
  { perfil: 'leitor', rotulo: 'Leitor' },
  { perfil: 'auxiliar', rotulo: 'Auxiliar' },
]);
