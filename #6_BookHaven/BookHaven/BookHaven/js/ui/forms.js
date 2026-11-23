import { CATEGORIAS, TIPOS_MATERIAL, LISTA_STATUS, SALAS } from '../models/book.js';
import { escaparHtml } from '../utils/helpers.js';
import { ROTULO_STATUS, ROTULO_TIPO } from './render.js';

const ROTULO_SALA = Object.fromEntries(SALAS.map((sala) => [sala, `Sala ${sala}`]));

const montarOpcoes = (lista, selecionado, rotulos = {}) =>
  lista
    .map((item) => {
      const marcado = item === selecionado ? 'selected' : '';
      return `<option value="${escaparHtml(item)}" ${marcado}>${escaparHtml(rotulos[item] ?? item)}</option>`;
    })
    .join('');

const atributosAcessiveis = (nome, rotulo) =>
  `aria-describedby="erro-${nome}" ${rotulo.endsWith('*') ? 'aria-required="true"' : ''}`;

const campoTexto = ({ nome, rotulo, valor, ajuda = '', extra = '' }) => `
  <div class="campo" data-campo="${nome}">
    <label for="campo-${nome}">${rotulo}</label>
    <input class="input" id="campo-${nome}" name="${nome}" type="text" value="${escaparHtml(valor)}" ${atributosAcessiveis(nome, rotulo)} ${extra}>
    ${ajuda ? `<span class="ajuda">${ajuda}</span>` : ''}
    <span class="erro" id="erro-${nome}" role="alert"></span>
  </div>`;

const campoLista = ({ nome, rotulo, opcoes }) => `
  <div class="campo" data-campo="${nome}">
    <label for="campo-${nome}">${rotulo}</label>
    <select class="select" id="campo-${nome}" name="${nome}" ${atributosAcessiveis(nome, rotulo)}>${opcoes}</select>
    <span class="erro" id="erro-${nome}" role="alert"></span>
  </div>`;

export const montarFormulario = (livro = {}) => {
  const editando = Boolean(livro.id);

  return `
    <div class="modal-corpo">
      <h2 class="modal-titulo" id="formulario-titulo">${editando ? 'Editar livro' : 'Novo livro'}</h2>

      <fieldset class="grupo">
        <legend>Identificação</legend>
        ${campoTexto({ nome: 'titulo', rotulo: 'Título *', valor: livro.titulo, extra: 'autofocus autocomplete="off"' })}
        ${campoTexto({ nome: 'autor', rotulo: 'Autor *', valor: livro.autor, extra: 'autocomplete="off"' })}
        ${campoTexto({ nome: 'ano', rotulo: 'Ano', valor: livro.ano, extra: 'inputmode="numeric" maxlength="4"' })}
      </fieldset>

      <fieldset class="grupo">
        <legend>Classificação</legend>
        ${campoLista({
          nome: 'categoria',
          rotulo: 'Categoria *',
          opcoes: `<option value="">Escolha…</option>${montarOpcoes(CATEGORIAS, livro.categoria)}`,
        })}
        ${campoLista({
          nome: 'tipoMaterial',
          rotulo: 'Tipo de material *',
          opcoes: montarOpcoes(TIPOS_MATERIAL, livro.tipoMaterial ?? 'livro', ROTULO_TIPO),
        })}
        ${campoTexto({
          nome: 'isbn',
          rotulo: 'ISBN',
          valor: livro.isbn,
          ajuda: 'Opcional (revistas e DVDs não têm).',
          extra: 'inputmode="numeric" autocomplete="off"',
        })}
      </fieldset>

      <fieldset class="grupo">
        <legend>Onde fica</legend>
        ${campoLista({
          nome: 'sala',
          rotulo: 'Sala *',
          opcoes: montarOpcoes(SALAS, livro.sala ?? SALAS[0], ROTULO_SALA),
        })}
        ${campoTexto({ nome: 'estante', rotulo: 'Estante *', valor: livro.estante, extra: 'autocomplete="off"' })}
        ${campoTexto({ nome: 'prateleira', rotulo: 'Prateleira *', valor: livro.prateleira, extra: 'autocomplete="off"' })}
        ${campoLista({
          nome: 'status',
          rotulo: 'Status *',
          opcoes: montarOpcoes(LISTA_STATUS, livro.status ?? 'disponivel', ROTULO_STATUS),
        })}
      </fieldset>

      <fieldset class="grupo grupo-largo">
        <legend>Outras informações</legend>
        <label class="campo-check">
          <input type="checkbox" name="obraRara" ${livro.obraRara ? 'checked' : ''}>
          <span>Obra rara <span class="ajuda">(ganha o selo dourado e só é consultada no balcão)</span></span>
        </label>
        <div class="campo" data-campo="observacoes">
          <label for="campo-observacoes">Observações</label>
          <textarea class="textarea" id="campo-observacoes" name="observacoes">${escaparHtml(livro.observacoes)}</textarea>
        </div>
      </fieldset>
    </div>

    <div class="modal-acoes">
      <!-- O 1º botão de envio é o que o Enter aciona; por isso "Salvar" vem primeiro
           no HTML e o CSS (order) o mostra por último, à direita. -->
      <button class="btn btn-primario" type="submit" value="salvar">${editando ? 'Salvar alterações' : 'Salvar livro'}</button>
      <button class="btn btn-secundario" type="button" data-fechar-modal>Cancelar</button>
      ${editando ? '' : '<button class="btn btn-secundario" type="submit" value="outro">Salvar e adicionar outro</button>'}
    </div>`;
};

export const lerFormulario = (formulario) => ({
  ...Object.fromEntries(new FormData(formulario)),
  obraRara: formulario.elements.obraRara.checked,
});

export const limparErros = (formulario) => {
  formulario.querySelectorAll('.campo.invalido').forEach((campo) => {
    campo.classList.remove('invalido');
    campo.querySelector('input, select, textarea').removeAttribute('aria-invalid');
    campo.querySelector('.erro').textContent = '';
  });
};

export const mostrarErros = (formulario, erros) => {
  let primeiro = null;

  Object.entries(erros).forEach(([nome, mensagem]) => {
    const campo = formulario.querySelector(`[data-campo="${nome}"]`);
    if (!campo) return;

    campo.classList.add('invalido');
    campo.querySelector('input, select, textarea').setAttribute('aria-invalid', 'true');
    campo.querySelector('.erro').textContent = mensagem;
    primeiro ??= campo;
  });

  primeiro?.querySelector('input, select, textarea').focus();
};
