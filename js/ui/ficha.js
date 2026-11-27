import { buscarPorId } from '../services/catalog.js';
import { abrirModal } from './modal.js';
import { montarFicha } from './render.js';
import { porId } from '../utils/helpers.js';

const abrirFicha = (id) => {
  const livro = buscarPorId(id);
  if (!livro) return;

  porId('ficha-conteudo').innerHTML = montarFicha(livro);
  abrirModal(porId('modal-ficha'));
};

export const iniciarFicha = () => {
  document.addEventListener('click', (evento) => {
    const livro = evento.target.closest('[data-livro-id]');
    if (livro) abrirFicha(livro.dataset.livroId);
  });
};
