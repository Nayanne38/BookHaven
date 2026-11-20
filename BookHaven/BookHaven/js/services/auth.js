import { USUARIOS, PERMISSOES, TELAS_PROTEGIDAS, TELAS_DA_EQUIPE, PERFIL_NOVO_CADASTRO, PERFIS_ATRIBUIVEIS } from '../data/users.js';

const CHAVE_SESSAO = 'bookhaven:sessao';
const CHAVE_CONTAS = 'bookhaven:usuarios';

let idEmMemoria = null;
let contasEmMemoria = [];

const lerIdSalvo = () => {
  try {
    return sessionStorage.getItem(CHAVE_SESSAO);
  } catch {
    return null;
  }
};

const gravarId = (id) => {
  idEmMemoria = id;
  try {
    if (id === null) sessionStorage.removeItem(CHAVE_SESSAO);
    else sessionStorage.setItem(CHAVE_SESSAO, id);
  } catch {
  }
};

const lerContasCadastradas = () => {
  try {
    const bruto = localStorage.getItem(CHAVE_CONTAS);
    if (bruto === null) return contasEmMemoria;
    const lista = JSON.parse(bruto);
    if (Array.isArray(lista)) {
      return lista.filter((c) => c && typeof c.id === 'string' && typeof c.senha === 'string' && c.perfil in PERMISSOES);
    }
  } catch {
  }
  return contasEmMemoria;
};

const gravarContas = (lista) => {
  contasEmMemoria = lista;
  try {
    localStorage.setItem(CHAVE_CONTAS, JSON.stringify(lista));
  } catch {
  }
};

const todasAsContas = () => [...USUARIOS, ...lerContasCadastradas()];

const publico = ({ id, nome, perfil, rotulo }) => ({ id, nome, perfil, rotulo });

export const usuarioAtual = () => {
  const id = idEmMemoria ?? lerIdSalvo();
  const conta = todasAsContas().find((u) => u.id === id);
  return conta ? publico(conta) : null;
};

export const entrar = (login, senha) => {
  const procurado = String(login ?? '').trim().toLowerCase();
  const conta = todasAsContas().find((u) => u.id === procurado && u.senha === senha);

  if (!conta) {
    return { ok: false, erro: 'Usuário ou senha não conferem. Tente de novo.' };
  }
  gravarId(conta.id);
  return { ok: true, usuario: publico(conta) };
};

export const sair = () => gravarId(null);

const REGEX_USUARIO = /^[a-z0-9._-]{3,20}$/;
const MIN_SENHA = 6;

export const cadastrar = ({ nome, usuario, senha, confirmar }) => {
  const nomeLimpo = String(nome ?? '').trim().replace(/\s+/g, ' ');
  const id = String(usuario ?? '').trim().toLowerCase();
  const erros = {};

  if (nomeLimpo.length < 2) erros.nome = 'Ops, faltou o seu nome (pelo menos 2 letras).';
  else if (nomeLimpo.length > 60) erros.nome = 'O nome pode ter no máximo 60 caracteres.';

  if (!REGEX_USUARIO.test(id)) {
    erros.usuario = 'Use de 3 a 20 caracteres: letras sem acento, números, ponto, hífen ou sublinhado.';
  } else if (todasAsContas().some((c) => c.id === id)) {
    erros.usuario = 'Esse usuário já existe. Escolha outro.';
  }

  if (String(senha ?? '').length < MIN_SENHA) erros.senha = `A senha precisa ter pelo menos ${MIN_SENHA} caracteres.`;
  else if (senha !== confirmar) erros.confirmar = 'As senhas não são iguais. Digite de novo.';

  if (Object.keys(erros).length > 0) return { ok: false, erros };

  const conta = { id, nome: nomeLimpo, senha, ...PERFIL_NOVO_CADASTRO };
  gravarContas([...lerContasCadastradas(), conta]);
  return { ok: true, usuario: publico(conta) };
};

export const pode = (acao) => {
  const usuario = usuarioAtual();
  return usuario !== null && PERMISSOES[usuario.perfil].includes(acao);
};

export const exigeLogin = (tela) => TELAS_PROTEGIDAS.includes(tela);

export const podeAcessar = (tela) => {
  if (!exigeLogin(tela)) return true;
  if (usuarioAtual() === null) return false;
  return !TELAS_DA_EQUIPE.includes(tela) || pode('gerenciar');
};

export const listarContas = () => {
  if (!pode('gerirUsuarios')) return [];
  return [
    ...USUARIOS.map((u) => ({ ...publico(u), fixa: true })),
    ...lerContasCadastradas().map((c) => ({ ...publico(c), fixa: false })),
  ];
};

export const alterarPerfilConta = (id, novoPerfil) => {
  if (!pode('gerirUsuarios')) return { ok: false, erro: 'Seu perfil não tem permissão para isso.' };
  const novo = PERFIS_ATRIBUIVEIS.find((p) => p.perfil === novoPerfil);
  if (!novo) return { ok: false, erro: 'Perfil inválido.' };

  const contas = lerContasCadastradas();
  const conta = contas.find((c) => c.id === id);
  if (!conta) return { ok: false, erro: 'Só contas cadastradas podem ser alteradas.' };

  gravarContas(contas.map((c) => (c.id === id ? { ...c, ...novo } : c)));
  return { ok: true, conta: publico({ ...conta, ...novo }) };
};

export const removerConta = (id) => {
  if (!pode('gerirUsuarios')) return { ok: false, erro: 'Seu perfil não tem permissão para isso.' };
  const contas = lerContasCadastradas();
  const conta = contas.find((c) => c.id === id);
  if (!conta) return { ok: false, erro: 'Só contas cadastradas podem ser removidas.' };

  gravarContas(contas.filter((c) => c.id !== id));
  return { ok: true, conta: publico(conta) };
};
