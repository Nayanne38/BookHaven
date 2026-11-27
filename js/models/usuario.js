/**
 * Perfis do sistema. Cada perfil herda as permissões do anterior:
 * Leitor (só consulta) -> Auxiliar (cadastra e confere) -> Bibliotecária (tudo).
 */
export class Leitor {
  static PERFIL = 'leitor';
  static ROTULO = 'Leitor';
  static ACOES = Object.freeze([]);

  constructor({ id, nome }) {
    this.id = id;
    this.nome = nome;
    this.perfil = this.constructor.PERFIL;
    this.rotulo = this.constructor.ROTULO;
    Object.freeze(this);
  }

  get acoes() {
    return this.constructor.ACOES;
  }

  pode(acao) {
    return this.acoes.includes(acao);
  }
}

export class Auxiliar extends Leitor {
  static PERFIL = 'auxiliar';
  static ROTULO = 'Auxiliar';
  static ACOES = Object.freeze([
    ...Leitor.ACOES,
    'gerenciar', 'criar', 'editar', 'alterarStatus', 'marcarPerdido', 'exportar',
  ]);
}

export class Bibliotecaria extends Auxiliar {
  static PERFIL = 'bibliotecaria';
  static ROTULO = 'Bibliotecária';
  static ACOES = Object.freeze([
    ...Auxiliar.ACOES,
    'gerirUsuarios', 'remover', 'importar', 'restaurar',
  ]);
}

const CLASSES_POR_PERFIL = Object.freeze({
  [Leitor.PERFIL]: Leitor,
  [Auxiliar.PERFIL]: Auxiliar,
  [Bibliotecaria.PERFIL]: Bibliotecaria,
});

export const perfilValido = (perfil) => Object.prototype.hasOwnProperty.call(CLASSES_POR_PERFIL, perfil);

/** Monta o usuário da classe certa a partir de uma conta (a senha nunca entra). */
export const criarUsuario = ({ id, nome, perfil }) => {
  const Classe = CLASSES_POR_PERFIL[perfil] ?? Leitor;
  return new Classe({ id, nome });
};
