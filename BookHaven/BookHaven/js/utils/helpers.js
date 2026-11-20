export const gerarId = (prefixo = 'livro') => {
  const momento = Date.now().toString(36);
  const sorteio = Math.random().toString(36).slice(2, 8);
  return `${prefixo}-${momento}-${sorteio}`;
};

export const normalizarTexto = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

const SUBSTITUICOES_HTML = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escaparHtml = (texto) =>
  String(texto ?? '').replace(/[&<>"']/g, (caractere) => SUBSTITUICOES_HTML[caractere]);

export const formatarLocalizacao = ({ estante, prateleira }) =>
  `Estante ${estante}, prateleira ${prateleira}`;

export const debounce = (funcao, espera = 250) => {
  let temporizador;
  return (...argumentos) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => funcao(...argumentos), espera);
  };
};

export const porId = (id) => document.getElementById(id);
