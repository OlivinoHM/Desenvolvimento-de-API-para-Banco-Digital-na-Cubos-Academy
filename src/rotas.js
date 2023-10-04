const express = require("express");
const contas = require("./controllers/contas");

const rotas = express();

rotas.get("/contas", contas.listar);
rotas.post("/contas", contas.criar);
rotas.put("/contas/:numeroConta/usuario", contas.atualizar);
rotas.delete("/contas/:numeroConta", contas.deletar);
rotas.post("/transacoes/depositar", contas.depositar);
rotas.post("/transacoes/sacar", contas.sacar);
rotas.post("/transacoes/transferir", contas.transferir);
rotas.get("/contas/saldo", contas.saldo);
rotas.get("/contas/extrato", contas.extrato);

module.exports = rotas;
