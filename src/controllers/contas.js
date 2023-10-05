const fs = require("fs/promises");
const { contas } = require("../bancodedados");
const { format } = require("date-fns");

const buscarIndexConta = (dadosAtualizados, numeroConta, res) => {
  const index = dadosAtualizados.contas.findIndex(
    (conta) => conta.numero === String(numeroConta)
  );
  if (index === -1) {
    return res.status(404).json({ mensagem: "Conta não encontrada." });
  }
  return index;
};

const atualizarBancoDeDados = async (dadosAtualizados, res) => {
  try {
    const dadosAtualizadosStringify = JSON.stringify(dadosAtualizados);

    await fs.writeFile(
      "./src/bancodedados.js",
      `module.exports = ${dadosAtualizadosStringify};`
    );

    return res.send();
  } catch (error) {
    return res
      .status(500)
      .json({ mensagem: `Erro interno do servidor: ${error}` });
  }
};

const listar = (req, res) => {
  if (!contas) {
    return res
      .status(404)
      .json({ mensagem: "Não existe conta para ser listada." });
  }
  return res.status(200).json(contas);
};

const criar = async (req, res) => {
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

  if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
    return res.status(400).json({
      mensagem:
        "Todos os campos nome, cpf, data_nascimento, telefone, email e senha são obrigatórios.",
    });
  }

  const encontrarUltimoId = () => {
    if (contas.length === 0) {
      return 0;
    }

    const ultimaConta = contas[contas.length - 1];
    return Number(ultimaConta.numero) + 1;
  };

  const novaConta = {
    numero: String(encontrarUltimoId()),
    saldo: 0,
    usuario: {
      nome,
      cpf,
      data_nascimento,
      telefone,
      email,
      senha,
    },
  };

  try {
    const dadosAtualizados = JSON.parse(
      JSON.stringify(require("../bancodedados"))
    );

    dadosAtualizados.contas.push(novaConta);

    const dadosAtualizadosStringify = JSON.stringify(dadosAtualizados);

    await fs.writeFile(
      "./src/bancodedados.js",
      `module.exports = ${dadosAtualizadosStringify};`
    );
    return res.status(201).send();
  } catch (error) {
    return res
      .status(500)
      .json({ mensagem: `Erro interno do servidor: ${error}` });
  }
};

const atualizar = async (req, res) => {
  const { numeroConta } = req.params;
  let { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

  try {
    const dadosAtualizados = JSON.parse(
      JSON.stringify(require("../bancodedados"))
    );

    const indexConta = buscarIndexConta(dadosAtualizados, numeroConta, res);

    nome =
      nome !== undefined
        ? nome
        : dadosAtualizados.contas[indexConta].usuario.nome;
    cpf =
      cpf !== undefined ? cpf : dadosAtualizados.contas[indexConta].usuario.cpf;
    data_nascimento =
      data_nascimento !== undefined
        ? data_nascimento
        : dadosAtualizados.contas[indexConta].usuario.data_nascimento;
    telefone =
      telefone !== undefined
        ? telefone
        : dadosAtualizados.contas[indexConta].usuario.telefone;
    email =
      email !== undefined
        ? email
        : dadosAtualizados.contas[indexConta].usuario.email;
    senha =
      senha !== undefined
        ? senha
        : dadosAtualizados.contas[indexConta].usuario.senha;

    dadosAtualizados.contas[indexConta].usuario = {
      nome,
      cpf,
      data_nascimento,
      telefone,
      email,
      senha,
    };

    await atualizarBancoDeDados(dadosAtualizados, res);
    return res.status(204).send();
  } catch (error) {
    return res
      .status(500)
      .json({ mensagem: `Erro interno do servidor: ${error}` });
  }
};

const deletar = async (req, res) => {
  const { numeroConta } = req.params;

  try {
    const dadosAtualizados = JSON.parse(
      JSON.stringify(require("../bancodedados"))
    );

    const indexConta = buscarIndexConta(dadosAtualizados, numeroConta, res);

    dadosAtualizados.contas.splice(indexConta, 1);

    await atualizarBancoDeDados(dadosAtualizados, res);
    return res.status(204).send();
  } catch (error) {
    return res
      .status(500)
      .json({ mensagem: `Erro interno do servidor: ${error}` });
  }
};

const depositar = async (req, res) => {
  let { numeroConta, valor } = req.body;

  try {
    const dadosAtualizados = JSON.parse(
      JSON.stringify(require("../bancodedados"))
    );

    const indexConta = buscarIndexConta(dadosAtualizados, numeroConta, res);

    dadosAtualizados.contas[indexConta].saldo += valor;

    const novaData = new Date();
    const formatoData = "dd-MM-yyyy HH:mm:ss";
    const data = format(novaData, formatoData);

    const registro = {
      data,
      numeroConta,
      valor,
    };

    dadosAtualizados.depositos.push(registro);

    await atualizarBancoDeDados(dadosAtualizados, res);
    return res.status(204).send();
  } catch (error) {
    return res
      .status(500)
      .json({ mensagem: `Erro interno do servidor: ${error}` });
  }
};

const sacar = async (req, res) => {
  let { numeroConta, valor } = req.body;

  try {
    const dadosAtualizados = JSON.parse(
      JSON.stringify(require("../bancodedados"))
    );

    const indexConta = buscarIndexConta(dadosAtualizados, numeroConta, res);

    dadosAtualizados.contas[indexConta].saldo -= valor;

    const novaData = new Date();
    const formatoData = "dd-MM-yyyy HH:mm:ss";
    const data = format(novaData, formatoData);

    const registro = {
      data,
      numeroConta,
      valor,
    };

    dadosAtualizados.saques.push(registro);

    await atualizarBancoDeDados(dadosAtualizados, res);
    return res.status(204).send();
  } catch (error) {
    return res
      .status(500)
      .json({ mensagem: `Erro interno do servidor: ${error}` });
  }
};

const transferir = async (req, res) => {
  let { numeroContaOrigem, numeroContaDestino, valor } = req.body;

  try {
    const dadosAtualizados = JSON.parse(
      JSON.stringify(require("../bancodedados"))
    );

    const indexContaOrigem = dadosAtualizados.contas.findIndex(
      (conta) => conta.numero === String(numeroContaOrigem)
    );

    const indexContaDestino = dadosAtualizados.contas.findIndex(
      (conta) => conta.numero === String(numeroContaDestino)
    );

    dadosAtualizados.contas[indexContaOrigem].saldo -= valor;
    dadosAtualizados.contas[indexContaDestino].saldo += valor;

    const novaData = new Date();
    const formatoData = "dd-MM-yyyy HH:mm:ss";
    const data = format(novaData, formatoData);

    const registro = {
      data,
      numeroContaOrigem,
      numeroContaDestino,
      valor,
    };

    dadosAtualizados.transferencias.push(registro);

    await atualizarBancoDeDados(dadosAtualizados, res);
    return res.status(204).send();
  } catch (error) {
    return res
      .status(500)
      .json({ mensagem: `Erro interno do servidor: ${error}` });
  }
};

const saldo = async (req, res) => {
  const { numeroConta } = req.query;

  try {
    const dadosAtualizados = JSON.parse(
      JSON.stringify(require("../bancodedados"))
    );

    const indexConta = buscarIndexConta(dadosAtualizados, numeroConta, res);

    return res.status(200).json(dadosAtualizados.contas[indexConta].saldo);
  } catch (error) {
    return res
      .status(500)
      .json({ mensagem: `Erro interno do servidor: ${error}` });
  }
};

const extrato = async (req, res) => {
  const { numeroConta } = req.query;

  try {
    const dadosAtualizados = JSON.parse(
      JSON.stringify(require("../bancodedados"))
    );

    const saques = dadosAtualizados.saques.filter(
      (saque) => saque.numeroConta === String(numeroConta)
    );

    const depositos = dadosAtualizados.depositos.filter(
      (deposito) => deposito.numeroConta === String(numeroConta)
    );

    const transferenciasEnviadas = dadosAtualizados.transferencias.filter(
      (transferencia) => transferencia.numeroContaOrigem === String(numeroConta)
    );

    const transferenciasRecebidas = dadosAtualizados.transferencias.filter(
      (transferencia) =>
        transferencia.numeroContaDestino === String(numeroConta)
    );

    const extrato = {
      saques,
      depositos,
      transferenciasEnviadas,
      transferenciasRecebidas,
    };

    return res.status(200).json(extrato);
  } catch (error) {
    return res
      .status(500)
      .json({ mensagem: `Erro interno do servidor: ${error}` });
  }
};

module.exports = {
  listar,
  criar,
  atualizar,
  deletar,
  depositar,
  sacar,
  transferir,
  saldo,
  extrato,
};
