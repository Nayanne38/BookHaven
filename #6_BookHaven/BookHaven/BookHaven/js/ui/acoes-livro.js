import {
  buscarPorId, criar, atualizar, alterarStatus, marcarComoPerdido, excluir,
  exportarAcervo, importarAcervo, restaurarAcervoDeExemplo,
} from '../services/catalog.js';
import { registrarAtividade } from '../services/activity.js';
import { ErroValidacao } from '../models/book.js';
import { montarFormulario, lerFormulario, limparErros, mostrarErros } from './forms.js';
import { abrirModal, fecharModal, confirmar } from './modal.js';
import { mostrarToast } from './toast.js';
import { ROTULO_STATUS, textoQuantidade } from './render.js';
import { exigir, aposMudanca, atualizarTudo } from './atualizacao.js';
import { porId } from '../utils/helpers.js';

let idEmEdicao = null;

export const abrirFormulario = (id = null, predefinidos = {}) => {
  if (!exigir(id ? 'editar' : 'criar')) return;
  const livro = id ? buscarPorId(id) : predefinidos;
  if (id && !livro) {
    mostrarToast('Não encontramos esse livro. Ele pode ter sido removido.', 'erro');
    return;
  }

  idEmEdicao = id;
  porId('formulario-livro').innerHTML = montarFormulario(livro);
  if (!porId('modal-formulario').open) abrirModal(porId('modal-formulario'));
  porId('formulario-livro').elements.titulo.focus();
};

const salvarFormulario = (acao) => {
  if (!exigir(idEmEdicao ? 'editar' : 'criar')) return;
  const formulario = porId('formulario-livro');
  limparErros(formulario);
  const dados = lerFormulario(formulario);

  try {
    const livro = idEmEdicao ? atualizar(idEmEdicao, dados) : criar(dados);
    mostrarToast(idEmEdicao ? `“${livro.titulo}” foi atualizado.` : `“${livro.titulo}” foi cadastrado no acervo!`);
    registrarAtividade(idEmEdicao ? 'Editou' : 'Cadastrou', `“${livro.titulo}”`);
    aposMudanca();

    if (acao === 'outro' && !idEmEdicao) {
      const { categoria, tipoMaterial, sala, estante, prateleira } = livro;
      abrirFormulario(null, { categoria, tipoMaterial, sala, estante, prateleira });
    } else {
      fecharModal(porId('modal-formulario'));
    }
  } catch (erro) {
    if (!(erro instanceof ErroValidacao)) {
      mostrarToast('Algo deu errado ao salvar. Tente de novo.', 'erro');
      throw erro;
    }
    mostrarErros(formulario, erro.erros);
    mostrarToast('Ops, confira os campos destacados.', 'erro');
  }
};

export const acaoMarcarPerdido = async (id) => {
  if (!exigir('marcarPerdido')) return;
  const livro = buscarPorId(id);
  if (!livro) return;

  const confirmado = await confirmar({
    titulo: 'Marcar como perdido?',
    mensagem: `“${livro.titulo}” passará a constar como perdido e o catálogo avisará os leitores que ele está indisponível. Você pode mudar o status de novo depois.`,
    textoConfirmar: 'Sim, marcar como perdido',
  });
  if (!confirmado) {
    atualizarTudo();
    return;
  }

  marcarComoPerdido(id);
  mostrarToast(`“${livro.titulo}” foi marcado como perdido.`);
  registrarAtividade('Marcou como perdido', `“${livro.titulo}”`);
  aposMudanca();
};

export const acaoRemover = async (id) => {
  if (!exigir('remover')) return;
  const livro = buscarPorId(id);
  if (!livro) return;

  const confirmado = await confirmar({
    titulo: 'Remover este livro da coleção?',
    mensagem: `“${livro.titulo}” será retirado do catálogo. Esta ação é definitiva e não pode ser desfeita.`,
    textoConfirmar: 'Sim, remover',
  });
  if (!confirmado) return;

  excluir(id);
  mostrarToast(`“${livro.titulo}” foi removido da coleção.`);
  registrarAtividade('Removeu da coleção', `“${livro.titulo}”`);
  aposMudanca();
};

const acaoAlterarStatus = (id, novoStatus) => {
  if (!exigir('alterarStatus')) return;
  if (novoStatus === 'perdido') {
    acaoMarcarPerdido(id);
    return;
  }

  const livro = alterarStatus(id, novoStatus);
  mostrarToast(`“${livro.titulo}” agora está ${ROTULO_STATUS[novoStatus].toLowerCase()}.`);
  registrarAtividade(`Alterou o status para ${ROTULO_STATUS[novoStatus].toLowerCase()}:`, `“${livro.titulo}”`);
  aposMudanca();
};

const baixarArquivo = (nome, texto) => {
  const endereco = URL.createObjectURL(new Blob([texto], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = endereco;
  link.download = nome;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(endereco);
};

export const acaoExportar = () => {
  if (!exigir('exportar')) return;
  const dia = new Date().toISOString().slice(0, 10);
  baixarArquivo(`bookhaven-acervo-${dia}.json`, exportarAcervo());
  mostrarToast('Arquivo de backup gerado. Guarde-o em local seguro.');
  registrarAtividade('Exportou o inventário (backup JSON)');
};

const acaoImportar = async (arquivo) => {
  if (!exigir('importar')) return;
  const texto = await arquivo.text();
  const confirmado = await confirmar({
    titulo: 'Importar este arquivo?',
    mensagem: `O arquivo “${arquivo.name}” vai SUBSTITUIR todo o acervo atual. Se quiser guardar o acervo de agora, exporte antes.`,
    textoConfirmar: 'Sim, importar',
  });
  if (!confirmado) return;

  const resultado = importarAcervo(texto);
  if (resultado.ok) {
    mostrarToast(`Importação concluída: ${textoQuantidade(resultado.quantidade)}.`);
    registrarAtividade('Importou um arquivo substituindo o acervo:', textoQuantidade(resultado.quantidade));
    aposMudanca();
  } else {
    mostrarToast(resultado.erro, 'erro');
  }
};

export const acaoRestaurar = async () => {
  if (!exigir('restaurar')) return;
  const confirmado = await confirmar({
    titulo: 'Restaurar dados de exemplo?',
    mensagem: 'Todos os livros atuais serão apagados e substituídos pelo acervo de exemplo. Se quiser guardar o acervo de agora, exporte antes.',
    textoConfirmar: 'Sim, restaurar',
  });
  if (!confirmado) return;

  restaurarAcervoDeExemplo();
  mostrarToast('Dados de exemplo restaurados.');
  registrarAtividade('Restaurou os dados de exemplo');
  aposMudanca();
};

export const iniciarAcoesLivro = () => {
  porId('formulario-livro').addEventListener('submit', (evento) => {
    evento.preventDefault();
    salvarFormulario(evento.submitter?.value);
  });

  const seletor = porId('arquivo-importar');
  seletor.addEventListener('change', () => {
    const [arquivo] = seletor.files;
    if (!arquivo) return;
    acaoImportar(arquivo).finally(() => {
      seletor.value = '';
    });
  });

  document.addEventListener('change', (evento) => {
    const select = evento.target.closest('[data-status-id]');
    if (select) acaoAlterarStatus(select.dataset.statusId, select.value);
  });
};
