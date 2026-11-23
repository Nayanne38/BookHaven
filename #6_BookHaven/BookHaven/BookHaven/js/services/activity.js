import { usuarioAtual } from './auth.js';

const CHAVE = 'bookhaven:atividades';
const MAX_REGISTROS = 200;

let emMemoria = [];

const lerTodos = () => {
  try {
    const lista = JSON.parse(localStorage.getItem(CHAVE));
    if (Array.isArray(lista)) return lista;
  } catch {
  }
  return emMemoria;
};

export const registrarAtividade = (acao, detalhe = '') => {
  const usuario = usuarioAtual();
  const registro = {
    quando: new Date().toISOString(),
    usuario: usuario?.nome ?? 'Alguém',
    perfil: usuario?.rotulo ?? '',
    acao,
    detalhe,
  };

  emMemoria = [registro, ...lerTodos()].slice(0, MAX_REGISTROS);
  try {
    localStorage.setItem(CHAVE, JSON.stringify(emMemoria));
  } catch {
  }
  return registro;
};

export const listarAtividades = (limite = 12) => lerTodos().slice(0, limite);
