const memoria = new Map();
globalThis.localStorage = {
  getItem: (chave) => (memoria.has(chave) ? memoria.get(chave) : null),
  setItem: (chave, valor) => memoria.set(chave, String(valor)),
  removeItem: (chave) => memoria.delete(chave),
};

const sessao = new Map();
globalThis.sessionStorage = {
  getItem: (chave) => (sessao.has(chave) ? sessao.get(chave) : null),
  setItem: (chave, valor) => sessao.set(chave, String(valor)),
  removeItem: (chave) => sessao.delete(chave),
};

const catalogo = await import('../js/services/catalog.js');
const { ErroValidacao, criarLivro, Livro } = await import('../js/models/book.js');
const { Leitor, Auxiliar, Bibliotecaria, criarUsuario } = await import('../js/models/usuario.js');
const { formatarLocalizacao, normalizarTexto, escaparHtml } = await import('../js/utils/helpers.js');

let passou = 0;
let falhou = 0;

const verificar = (descricao, condicao, detalhe = '') => {
  if (condicao) {
    passou += 1;
    console.log(`  ✔ ${descricao}`);
  } else {
    falhou += 1;
    console.log(`  ✘ ${descricao} ${detalhe}`);
  }
};

const lancaErroEm = (funcao, campo) => {
  try {
    funcao();
    return false;
  } catch (erro) {
    return erro instanceof ErroValidacao && campo in erro.erros;
  }
};

console.log('\n1) Seed e resumo');
const todos = catalogo.listar();
const resumo = catalogo.getResumo();
console.log('   Resumo:', resumo);
verificar('seed tem cerca de 30 livros', todos.length >= 30 && todos.length <= 35, `(${todos.length})`);
verificar('4 obras raras', todos.filter((l) => l.obraRara).length === 4);
verificar('5 perdidos', resumo.perdidos === 5, `(${resumo.perdidos})`);
verificar('alguns emprestados', resumo.emprestados >= 3, `(${resumo.emprestados})`);
verificar('total = soma dos status', resumo.total === resumo.disponiveis + resumo.emprestados + resumo.perdidos);
verificar('ISBNs do seed são únicos', new Set(todos.map((l) => l.isbn).filter(Boolean)).size === todos.filter((l) => l.isbn).length);
verificar('seed ficou gravado no localStorage', memoria.has('bookhaven:livros'));

console.log('\n2) Helpers');
verificar('formatarLocalizacao', formatarLocalizacao({ estante: '12', prateleira: 'B' }) === 'Estante 12, prateleira B');
verificar('normalizarTexto tira acento e caixa', normalizarTexto('  Os SERTÕES ') === 'os sertoes');
verificar('escaparHtml neutraliza <script>', escaparHtml('<script>alert("x")</script>') === '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');

console.log('\n3) Busca por texto');
verificar('"sertoes" (sem acento) acha Os Sertões', catalogo.buscarPorTexto('sertoes').some((l) => l.titulo.startsWith('Os Sertões')));
verificar('"MACHADO" acha 2 obras', catalogo.buscarPorTexto('MACHADO').length === 2);
verificar('"machado casmurro" (2 palavras)', catalogo.buscarPorTexto('machado casmurro').length === 1);
verificar('busca por ISBN com hífen', catalogo.buscarPorTexto('978-85-359-1166-4').length === 1 || catalogo.buscarPorTexto('978-85-359-1166').length === 1);
verificar('busca vazia devolve tudo', catalogo.buscarPorTexto('  ').length === todos.length);
verificar('"12" não vira busca de ISBN', catalogo.buscarPorTexto('12').length === 0);
verificar('busca sem resultado', catalogo.buscarPorTexto('xyzabc').length === 0);

console.log('\n4) Filtrar e ordenar');
const romances = catalogo.filtrar(todos, { categoria: 'Romance' });
console.log('   Romances:', romances.map((l) => l.titulo).join(' | '));
verificar('filtra por categoria', romances.length > 0 && romances.every((l) => l.categoria === 'Romance'));
verificar('filtra por status', catalogo.filtrar(todos, { status: 'perdido' }).length === 5);
verificar('categoria + status juntos', catalogo.filtrar(todos, { categoria: 'Romance', status: 'emprestado' }).length === 2);
const porTitulo = catalogo.ordenar(todos, 'titulo');
console.log('   Primeiros por título:', porTitulo.slice(0, 3).map((l) => l.titulo).join(' | '));
verificar('ordena por título (A primeiro)', porTitulo[0].titulo.startsWith('A '));
verificar('ordena por ano decrescente', catalogo.ordenar(todos, 'ano', 'desc')[0].ano === 2018);
verificar('ordenar não altera a lista original', todos[0].titulo === 'Dom Casmurro');

console.log('\n5) Criar (com validação e ISBN duplicado)');
const novo = catalogo.criar({ titulo: 'O Cortiço Ilustrado', autor: 'Aluísio Azevedo', ano: '1890', categoria: 'Clássicos brasileiros', isbn: '978-85-00-00000-1', estante: '10', prateleira: 'a' });
console.log('   Criado:', novo.id, '|', formatarLocalizacao(novo), '| status:', novo.status);
verificar('criou e gerou id', Boolean(novo.id) && catalogo.listar().length === todos.length + 1);
verificar('prateleira "a" virou "A"', novo.prateleira === 'A');
verificar('ISBN duplicado é bloqueado', lancaErroEm(() => catalogo.criar({ titulo: 'Outro', autor: 'Alguém', categoria: 'Romance', isbn: '9788500000001', estante: '1', prateleira: 'A' }), 'isbn'));
verificar('título vazio é bloqueado', lancaErroEm(() => catalogo.criar({ titulo: '  ', autor: 'X', categoria: 'Romance', estante: '1', prateleira: 'A' }), 'titulo'));
verificar('categoria fora da lista é bloqueada', lancaErroEm(() => catalogo.criar({ titulo: 'T', autor: 'X', categoria: 'Culinária', estante: '1', prateleira: 'A' }), 'categoria'));
verificar('ano absurdo é bloqueado', lancaErroEm(() => criarLivro({ titulo: 'T', autor: 'X', categoria: 'Romance', estante: '1', prateleira: 'A', ano: 12 }), 'ano'));
verificar('ISBN malformado é bloqueado', lancaErroEm(() => criarLivro({ titulo: 'T', autor: 'X', categoria: 'Romance', estante: '1', prateleira: 'A', isbn: '123' }), 'isbn'));
verificar('revista sem ISBN é aceita', Boolean(catalogo.criar({ titulo: 'Revista Teste', autor: 'Editora', categoria: 'Didático', tipoMaterial: 'revista', estante: 'P1', prateleira: 'B' }).id));

console.log('\n6) Atualizar, status, perdido');
const atualizado = catalogo.atualizar(novo.id, { estante: '13', observacoes: 'Mudou de corredor' });
verificar('atualiza só o que foi enviado', atualizado.estante === '13' && atualizado.titulo === novo.titulo);
verificar('id e criadoEm não mudam', atualizado.id === novo.id && atualizado.criadoEm === novo.criadoEm);
verificar('atualizar valida (título vazio falha)', lancaErroEm(() => catalogo.atualizar(novo.id, { titulo: '' }), 'titulo'));
verificar('atualizar não aceita ISBN de outro livro', lancaErroEm(() => catalogo.atualizar(novo.id, { isbn: '9788535911664' }), 'isbn'));
verificar('manter o próprio ISBN é permitido', catalogo.atualizar(novo.id, { isbn: novo.isbn }).isbn === novo.isbn);
verificar('alterarStatus -> emprestado', catalogo.alterarStatus(novo.id, 'emprestado').status === 'emprestado');
verificar('status inválido é bloqueado', lancaErroEm(() => catalogo.alterarStatus(novo.id, 'sumiu'), 'status'));
const antes = catalogo.getResumo();
catalogo.marcarComoPerdido('livro-001');
const depois = catalogo.getResumo();
verificar('marcarComoPerdido atualiza o resumo', depois.perdidos === antes.perdidos + 1 && depois.emprestados === antes.emprestados - 1);
verificar('atualizar id inexistente lança erro', (() => { try { catalogo.atualizar('nao-existe', {}); return false; } catch { return true; } })());

console.log('\n7) Excluir');
const totalAntes = catalogo.listar().length;
const removido = catalogo.excluir(novo.id);
verificar('excluir devolve o livro removido', removido.id === novo.id);
verificar('livro sumiu do catálogo', catalogo.buscarPorId(novo.id) === null && catalogo.listar().length === totalAntes - 1);

console.log('\n8) Persistência, exportar e importar');
const texto = catalogo.exportarAcervo();
verificar('exportar gera JSON com { versao, livros }', JSON.parse(texto).livros.length === catalogo.listar().length);
verificar('dados estão no localStorage', JSON.parse(memoria.get('bookhaven:livros')).length === catalogo.listar().length);
verificar('importar JSON inválido é recusado', catalogo.importarAcervo('{ isto não é json').ok === false);
verificar('importar sem lista é recusado', catalogo.importarAcervo('{"a":1}').ok === false);
const ruim = JSON.stringify({ livros: [JSON.parse(texto).livros[0], { titulo: '', autor: 'x' }] });
const resRuim = catalogo.importarAcervo(ruim);
console.log('   Erro amigável:', resRuim.erro);
verificar('um livro inválido cancela a importação toda (tudo ou nada)', resRuim.ok === false && catalogo.listar().length === totalAntes - 1);
const repetido = JSON.stringify({ livros: [JSON.parse(texto).livros[0], JSON.parse(texto).livros[0]] });
verificar('ids repetidos são recusados', catalogo.importarAcervo(repetido).ok === false);
verificar('importar o próprio export funciona', catalogo.importarAcervo(texto).ok === true);
catalogo.excluir('livro-002');
verificar('restaurarAcervoDeExemplo volta ao seed', (catalogo.restaurarAcervoDeExemplo(), catalogo.listar().length === todos.length));

console.log('\n9) Armazenamento estragado');
memoria.set('bookhaven:livros', '{{{ lixo');
const catalogo2 = await import('../js/services/catalog.js?novo');
const storage2 = await import('../js/services/storage.js?novo');
verificar('texto corrompido cai no seed', storage2.carregarLivros().length === todos.length);
verificar('o texto ruim foi guardado como backup', memoria.get('bookhaven:livros:corrompido') === '{{{ lixo');
verificar('(módulo novo) catálogo continua operando', catalogo2.getResumo().total === todos.length);

console.log('\n10) Navegador sem espaço para gravar');
const setItemOriginal = globalThis.localStorage.setItem;
verificar('gravação normal: salvamentoOk() = true', catalogo2.salvamentoOk() === true);
globalThis.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
const criadoSemEspaco = catalogo2.criar({ titulo: 'Sem espaço', autor: 'X', categoria: 'Poesia', estante: '1', prateleira: 'A' });
verificar('com a cota esgotada o livro continua existindo na sessão', catalogo2.buscarPorId(criadoSemEspaco.id) !== null);
verificar('...e salvamentoOk() avisa que NÃO foi gravado', catalogo2.salvamentoOk() === false);
globalThis.localStorage.setItem = setItemOriginal;
catalogo2.excluir(criadoSemEspaco.id);
verificar('voltando o espaço, salvamentoOk() volta a true', catalogo2.salvamentoOk() === true);

console.log('\n11) Login simulado e permissões');
const auth = await import('../js/services/auth.js');
verificar('ninguém logado no começo', auth.usuarioAtual() === null);
verificar('sem login: não pode nada', auth.pode('criar') === false && auth.pode('remover') === false);
verificar('Início, Catálogo e Gerenciar exigem login; Entrar e Cadastro não', ['inicio','catalogo','gerenciar'].every(auth.exigeLogin) && !auth.exigeLogin('entrar') && !auth.exigeLogin('cadastro'));
verificar('sem login, não acessa Início, Catálogo nem Gerenciar', ['inicio','catalogo','gerenciar'].every((x) => auth.podeAcessar(x) === false) && auth.podeAcessar('entrar') && auth.podeAcessar('cadastro'));

const erroSenha = auth.entrar('silvia', 'senha-errada');
verificar('senha errada é recusada com mensagem gentil', erroSenha.ok === false && erroSenha.erro.includes('não conferem'));
verificar('usuário inexistente dá a MESMA mensagem (não revela quem existe)', auth.entrar('ninguem', 'x').erro === erroSenha.erro);
verificar('falha de login não cria sessão', auth.usuarioAtual() === null && !sessao.has('bookhaven:sessao'));

const entrouSilvia = auth.entrar('  SILVIA ', 'silvia123');
verificar('login da Silvia (ignora espaços e maiúsculas no usuário)', entrouSilvia.ok === true && entrouSilvia.usuario.nome === 'Silvia');
verificar('o usuário devolvido NÃO contém a senha', !('senha' in entrouSilvia.usuario) && !('senha' in auth.usuarioAtual()));
verificar('sessão guardada só com o id (sem senha)', sessao.get('bookhaven:sessao') === 'silvia');
verificar('bibliotecária pode remover, importar e restaurar', ['remover', 'importar', 'restaurar', 'criar', 'marcarPerdido'].every((a) => auth.pode(a)));
verificar('com login, podeAcessar("gerenciar") é true', auth.podeAcessar('gerenciar') === true);

auth.sair();
verificar('sair encerra a sessão', auth.usuarioAtual() === null && !sessao.has('bookhaven:sessao'));

const entrouThiago = auth.entrar('thiago', 'thiago123');
verificar('login do Thiago (auxiliar)', entrouThiago.ok === true && entrouThiago.usuario.perfil === 'auxiliar');
verificar('auxiliar pode cadastrar, editar e marcar perdido', ['criar', 'editar', 'alterarStatus', 'marcarPerdido', 'exportar'].every((a) => auth.pode(a)));
verificar('auxiliar NÃO pode remover, importar nem restaurar', ['remover', 'importar', 'restaurar'].every((a) => auth.pode(a) === false));
verificar('senha de um usuário não vale para o outro', auth.entrar('thiago', 'silvia123').ok === false);
auth.sair();

console.log('\n12) Cadastro de novas contas');
const ok1 = auth.cadastrar({ nome: '  Maria   Souza ', usuario: ' Maria.S ', senha: 'segredo1', confirmar: 'segredo1' });
verificar('cadastro válido cria conta de leitor', ok1.ok === true && ok1.usuario.id === 'maria.s' && ok1.usuario.perfil === 'leitor' && ok1.usuario.nome === 'Maria Souza');
verificar('cadastro NÃO inicia sessão (vai para o login)', auth.usuarioAtual() === null && !sessao.has('bookhaven:sessao'));
verificar('conta fica guardada (sem expor senha no retorno)', !('senha' in ok1.usuario) && JSON.parse(localStorage.getItem('bookhaven:usuarios')).length === 1);
verificar('nome e usuário vazios são recusados', Object.keys(auth.cadastrar({ nome: '', usuario: '', senha: '123456', confirmar: '123456' }).erros).join() === 'nome,usuario');
verificar('usuário repetido é recusado (até com maiúsculas)', auth.cadastrar({ nome: 'Outra', usuario: 'MARIA.S', senha: '123456', confirmar: '123456' }).erros?.usuario?.includes('já existe'));
verificar('não dá para tomar o lugar da Silvia', auth.cadastrar({ nome: 'Falsa', usuario: 'silvia', senha: '123456', confirmar: '123456' }).ok === false);
verificar('senha curta é recusada', auth.cadastrar({ nome: 'Ana', usuario: 'ana01', senha: '123', confirmar: '123' }).erros?.senha?.includes('pelo menos'));
verificar('confirmação diferente é recusada', auth.cadastrar({ nome: 'Ana', usuario: 'ana01', senha: '123456', confirmar: '123457' }).erros?.confirmar?.includes('não são iguais'));
verificar('usuário com acento, espaço ou curto demais é recusado', ['jo', 'joão', 'a b c', 'x'.repeat(21)].every((u) => auth.cadastrar({ nome: 'Ana', usuario: u, senha: '123456', confirmar: '123456' }).erros?.usuario));
verificar('contas recusadas não foram gravadas', JSON.parse(localStorage.getItem('bookhaven:usuarios')).length === 1);

const entrouMaria = auth.entrar('maria.s', 'segredo1');
verificar('a conta cadastrada consegue entrar', entrouMaria.ok === true && auth.usuarioAtual().nome === 'Maria Souza');
verificar('leitor acessa Início e Catálogo, mas NÃO o Gerenciar', auth.podeAcessar('inicio') && auth.podeAcessar('catalogo') && auth.podeAcessar('gerenciar') === false);
verificar('leitor não pode criar, editar nem remover', ['criar', 'editar', 'remover', 'marcarPerdido', 'gerenciar'].every((a) => auth.pode(a) === false));
auth.sair();
localStorage.setItem('bookhaven:usuarios', '{estragado');
verificar('lista de contas estragada não derruba o login (mockados seguem valendo)', auth.entrar('silvia', 'silvia123').ok === true);
auth.sair();

console.log('\n13) Área administrativa: contas, atividades e indicadores');
const ativ = await import('../js/services/activity.js');

localStorage.removeItem('bookhaven:usuarios');
auth.cadastrar({ nome: 'Maria Souza', usuario: 'maria.s', senha: 'segredo1', confirmar: 'segredo1' });
auth.cadastrar({ nome: 'Leitor Um', usuario: 'leitor1', senha: '123456', confirmar: '123456' });
verificar('sem login, listarContas devolve vazio', auth.listarContas().length === 0);
auth.entrar('maria.s', 'segredo1');
verificar('leitor não lista contas nem altera perfis', auth.listarContas().length === 0 && auth.alterarPerfilConta('leitor1', 'auxiliar').ok === false && auth.removerConta('leitor1').ok === false);
auth.sair();
auth.entrar('thiago', 'thiago123');
verificar('auxiliar NÃO gerencia contas', auth.pode('gerirUsuarios') === false && auth.alterarPerfilConta('leitor1', 'auxiliar').ok === false && auth.removerConta('leitor1').ok === false);
auth.sair();

auth.entrar('silvia', 'silvia123');
const contas = auth.listarContas();
verificar('bibliotecária lista contas fixas e cadastradas, sem senha', contas.length >= 3 && contas.every((c) => !('senha' in c)) && contas.find((c) => c.id === 'silvia').fixa === true && contas.find((c) => c.id === 'leitor1').fixa === false);
verificar('promover leitor a auxiliar funciona', auth.alterarPerfilConta('leitor1', 'auxiliar').ok === true && auth.listarContas().find((c) => c.id === 'leitor1').perfil === 'auxiliar');
verificar('perfil novo vale no login (auxiliar abre o Gerenciar)', (auth.sair(), auth.entrar('leitor1', '123456'), auth.podeAcessar('gerenciar') && auth.podeAcessar('painel') && !auth.pode('remover')));
auth.sair(); auth.entrar('silvia', 'silvia123');
verificar('não dá para tornar alguém bibliotecária por aqui', auth.alterarPerfilConta('leitor1', 'bibliotecaria').ok === false);
verificar('contas fixas (Silvia, Thiago) não mudam nem somem', auth.alterarPerfilConta('thiago', 'leitor').ok === false && auth.removerConta('silvia').ok === false);
verificar('remover conta funciona e a pessoa não entra mais', auth.removerConta('leitor1').ok === true && (auth.sair(), auth.entrar('leitor1', '123456').ok === false));
auth.sair();

verificar('painel e gerenciar são da equipe; leitor não acessa', (auth.entrar('maria.s', 'segredo1'), !auth.podeAcessar('painel') && !auth.podeAcessar('gerenciar') && auth.podeAcessar('inicio')));
auth.sair();

localStorage.removeItem('bookhaven:atividades');
auth.entrar('thiago', 'thiago123');
ativ.registrarAtividade('Cadastrou', '“Livro X”');
auth.sair(); auth.entrar('silvia', 'silvia123');
ativ.registrarAtividade('Removeu da coleção', '“Livro Y”');
const lista = ativ.listarAtividades();
verificar('atividades: mais recente primeiro, com quem fez (nome e perfil)', lista.length === 2 && lista[0].usuario === 'Silvia' && lista[0].perfil === 'Bibliotecária' && lista[1].usuario === 'Thiago');
verificar('atividade tem data válida em ISO', !Number.isNaN(Date.parse(lista[0].quando)));
for (let i = 0; i < 250; i++) ativ.registrarAtividade('Teste', String(i));
verificar('histórico é limitado a 200 registros (o mais antigo sai)', JSON.parse(localStorage.getItem('bookhaven:atividades')).length === 200 && ativ.listarAtividades(5).length === 5);
localStorage.setItem('bookhaven:atividades', '{estragado');
verificar('histórico estragado não derruba o sistema', Array.isArray(ativ.listarAtividades()));
auth.sair();

catalogo.restaurarAcervoDeExemplo();
const ind = catalogo.getIndicadores();
verificar('indicadores: resumo bate com getResumo', JSON.stringify(ind.resumo) === JSON.stringify(catalogo.getResumo()));
verificar('indicadores: perdidos = lista de perdidos', ind.perdidos.length === ind.resumo.perdidos && ind.perdidos.every((l) => l.status === 'perdido'));
verificar('indicadores: soma das categorias = total', ind.porCategoria.reduce((s, c) => s + c.total, 0) === ind.resumo.total);
verificar('indicadores: perdidos por categoria somam o total de perdidos', ind.porCategoria.reduce((s, c) => s + c.perdidos, 0) === ind.resumo.perdidos);
verificar('indicadores: categorias da maior para a menor', ind.porCategoria.every((c, i, a) => i === 0 || a[i - 1].total >= c.total));
verificar('indicadores: percentuais coerentes (0 a 100, soma 99 a 101)', Object.values(ind.percentuais).every((p) => p >= 0 && p <= 100) && Math.abs(Object.values(ind.percentuais).reduce((a, b) => a + b, 0) - 100) <= 1);
verificar('indicadores: obras raras contadas', ind.raras === catalogo.listar().filter((l) => l.obraRara).length && ind.raras > 0);

console.log(`\nResultado: ${passou} ok, ${falhou} falhas.\n`);
process.exit(falhou === 0 ? 0 : 1);
