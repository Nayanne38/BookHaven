import { entrar, sair, cadastrar, usuarioAtual, pode } from '../services/auth.js';
import { USUARIOS } from '../data/users.js';
import { destinoPendente, limparDestino, irParaTela } from './navigation.js';
import { mostrarToast } from './toast.js';

const $ = (id) => document.getElementById(id);

export const atualizarTelaEntrar = () => {
  const usuario = usuarioAtual();
  $('form-entrar').hidden = usuario !== null;
  $('entrar-logado').hidden = usuario === null;
  if (usuario) {
    $('entrar-logado-texto').textContent = `Você entrou como ${usuario.nome} (${usuario.rotulo}).`;
  }
};

const iniciarCadastro = () => {
  const formulario = $('form-cadastro');
  const lista = $('erro-cadastro');
  const campos = ['nome', 'usuario', 'senha', 'confirmar'];

  $('mostrar-senha-cadastro').addEventListener('change', (evento) => {
    const tipo = evento.target.checked ? 'text' : 'password';
    formulario.elements.senha.type = tipo;
    formulario.elements.confirmar.type = tipo;
  });

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    lista.replaceChildren();
    campos.forEach((c) => formulario.elements[c].removeAttribute('aria-invalid'));

    const dados = Object.fromEntries(campos.map((c) => [c, formulario.elements[c].value]));
    const resultado = cadastrar(dados);

    if (!resultado.ok) {
      let primeiro = null;
      campos.forEach((c) => {
        if (!resultado.erros[c]) return;
        const item = document.createElement('li');
        item.textContent = resultado.erros[c];
        lista.append(item);
        formulario.elements[c].setAttribute('aria-invalid', 'true');
        primeiro ??= formulario.elements[c];
      });
      primeiro.focus();
      return;
    }

    formulario.reset();
    formulario.elements.senha.type = 'password';
    formulario.elements.confirmar.type = 'password';
    mostrarToast(`Conta criada, ${resultado.usuario.nome}! Agora é só entrar.`);
    $('form-entrar').elements.usuario.value = resultado.usuario.id;
    irParaTela('entrar');
    setTimeout(() => $('form-entrar').elements.senha.focus(), 0);
  });
};

export const iniciarLogin = ({ aoMudarSessao }) => {
  const formulario = $('form-entrar');
  const erro = $('erro-entrar');

  USUARIOS.forEach((u) => {
    const item = document.createElement('li');
    const nome = document.createElement('strong');
    nome.textContent = u.id;
    const senha = document.createElement('code');
    senha.textContent = u.senha;
    item.append(nome, ` · ${u.rotulo} `, senha);
    $('lista-demo').append(item);
  });

  $('mostrar-senha').addEventListener('change', (evento) => {
    formulario.elements.senha.type = evento.target.checked ? 'text' : 'password';
  });

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const resultado = entrar(formulario.elements.usuario.value, formulario.elements.senha.value);

    if (!resultado.ok) {
      erro.textContent = resultado.erro;
      formulario.elements.senha.value = '';
      formulario.elements.senha.focus();
      return;
    }

    erro.textContent = '';
    formulario.reset();
    formulario.elements.senha.type = 'password';
    mostrarToast(`Olá, ${resultado.usuario.nome}! Você entrou como ${resultado.usuario.rotulo.toLowerCase()}.`);

    const pedido = destinoPendente();
    const padrao = pode('gerenciar') ? 'painel' : 'inicio';
    const destino = !pedido || pedido === 'inicio' ? padrao : pedido;
    limparDestino();
    aoMudarSessao();
    irParaTela(destino);
  });

  iniciarCadastro();

  document.addEventListener('click', (evento) => {
    if (!evento.target.closest('[data-sair]')) return;
    sair();
    mostrarToast('Você saiu. Até logo!');
    aoMudarSessao();
    irParaTela('inicio');
  });
};
