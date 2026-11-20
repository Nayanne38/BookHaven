const MINIMO = 16;
const MAXIMO = 28;
const PASSO = 2;
const PADRAO = 18;
const CHAVE = 'bookhaven:tamanho-fonte';

const lerSalvo = () => {
  try {
    const salvo = Number(localStorage.getItem(CHAVE));
    return salvo >= MINIMO && salvo <= MAXIMO ? salvo : PADRAO;
  } catch {
    return PADRAO;
  }
};

const salvar = (tamanho) => {
  try {
    localStorage.setItem(CHAVE, String(tamanho));
  } catch {
  }
};

let tamanhoAtual = lerSalvo();

const botaoAumentar = () => document.querySelector('[data-fonte="aumentar"]');
const botaoDiminuir = () => document.querySelector('[data-fonte="diminuir"]');

const aplicar = (tamanho) => {
  tamanhoAtual = Math.min(MAXIMO, Math.max(MINIMO, tamanho));
  document.documentElement.style.setProperty('--tamanho-base', `${tamanhoAtual}px`);
  salvar(tamanhoAtual);

  const aumentar = botaoAumentar();
  const diminuir = botaoDiminuir();
  if (aumentar) aumentar.disabled = tamanhoAtual >= MAXIMO;
  if (diminuir) diminuir.disabled = tamanhoAtual <= MINIMO;
};

export const iniciarTamanhoFonte = () => {
  aplicar(tamanhoAtual);
  botaoAumentar()?.addEventListener('click', () => aplicar(tamanhoAtual + PASSO));
  botaoDiminuir()?.addEventListener('click', () => aplicar(tamanhoAtual - PASSO));
};
