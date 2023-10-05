const express = require("express");
const contas = require("./controllers/contas");
const intermediarios = require("./middleware/intermediarios");

const rotas = express();

rotas.get("/contas", intermediarios.validarSenhaBanco, contas.listar);

rotas.post(
  "/contas",
  intermediarios.validaCPF,
  intermediarios.validaEmail,
  contas.criar
);

rotas.put(
  "/contas/:numeroConta/usuario",
  intermediarios.validarNumeroConta,
  intermediarios.validaCPF,
  intermediarios.validaEmail,
  contas.atualizar
);

rotas.delete(
  "/contas/:numeroConta",
  intermediarios.validarNumeroConta,
  intermediarios.verificarSaldoZerado,
  contas.deletar
);

rotas.post(
  "/transacoes/depositar",
  intermediarios.validarNumeroConta,
  intermediarios.validarValor,
  intermediarios.validarValorPositivo,
  contas.depositar
);

rotas.post(
  "/transacoes/sacar",
  intermediarios.validarNumeroConta,
  intermediarios.validarSenhaConta,
  intermediarios.validarValorPositivo,
  intermediarios.validarSaldo,
  contas.sacar
);

rotas.post(
  "/transacoes/transferir",
  intermediarios.validarTransferecia,
  intermediarios.validarValorPositivo,
  contas.transferir
);

rotas.get(
  "/contas/saldo",
  intermediarios.validarNumeroConta,
  intermediarios.validarSenhaConta,
  contas.saldo
);

rotas.get(
  "/contas/extrato",
  intermediarios.validarNumeroConta,
  intermediarios.validarSenhaConta,
  contas.extrato
);

module.exports = rotas;
