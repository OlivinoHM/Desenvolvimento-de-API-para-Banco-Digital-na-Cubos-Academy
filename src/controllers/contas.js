const fs = require("fs/promises");
const { contas, banco } = require("../bancodedados");
const { format } = require("date-fns");

const listar = (req, res) => {
  const { senha_banco } = req.query;

  if (!senha_banco) {
    return res
      .status(401)
      .json({ mensagem: "Necessário fornecer a senha para listar as contas." });
  }

  if (senha_banco !== banco.senha) {
    return res
      .status(403)
      .json({ mensagem: "A senha do banco informada é inválida!" });
  }

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
    return res.status(401).json({
      mensagem:
        "Todos os campos nome, cpf, data_nascimento, telefone, email e senha são obrigatórios.",
    });
  }

  const contaExistente = contas.find((conta) => conta.usuario.cpf === cpf);

  if (contaExistente) {
    return res
      .status(401)
      .json({ mensagem: "Já existe uma conta com o cpf ou e-mail informado!" });
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
    return res.send();
  } catch (error) {
    return res
      .status(500)
      .json({ mensagem: `Erro interno do servidor: ${error}` });
  }
};

const atualizar = async (req, res) => {
  const { numeroConta } = req.params;
  let { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

  if (!numeroConta) {
    return res
      .status(401)
      .json({ mensagem: "Necessário fornecer o número da conta." });
  }

  try {
    const dadosAtualizados = JSON.parse(
      JSON.stringify(require("../bancodedados"))
    );

    const indexConta = dadosAtualizados.contas.findIndex(
      (conta) => conta.numero === String(numeroConta)
    );

    if (indexConta === -1) {
      return res.status(404).json({ mensagem: "Conta não encontrada." });
    }

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

    dadosAtualizados.contas[indexConta] = {
      numero: String(numeroConta),
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

const deletar = async (req, res) => {
  const { numeroConta } = req.params;

  if (!numeroConta) {
    return res
      .status(401)
      .json({ mensagem: "Necessário fornecer o número da conta." });
  }

  try {
    const dadosAtualizados = JSON.parse(
      JSON.stringify(require("../bancodedados"))
    );

    const indexConta = dadosAtualizados.contas.findIndex(
      (conta) => conta.numero === String(numeroConta)
    );

    if (indexConta === -1) {
      return res.status(404).json({ mensagem: "Conta não encontrada." });
    }

    if (dadosAtualizados.contas[indexConta].saldo > 0) {
      return res.status(401).json({
        mensagem: "A conta só pode ser removida se o saldo for zero!",
      });
    }
    dadosAtualizados.contas.splice(indexConta, 1);

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

const depositar = async (req, res) => {
  let { numeroConta, valor } = req.body;

  if (!numeroConta || !valor) {
    return res.status(401).json({
      mensagem: "O número da conta e o valor são obrigatórios!",
    });
  }
  if (valor <= 0) {
    return res.status(401).json({
      mensagem: "Não é permitido depósitos com valores negativos ou zerados",
    });
  }

  try {
    const dadosAtualizados = JSON.parse(
      JSON.stringify(require("../bancodedados"))
    );

    const indexConta = dadosAtualizados.contas.findIndex(
      (conta) => conta.numero === String(numeroConta)
    );

    if (indexConta === -1) {
      return res.status(404).json({ mensagem: "Conta não encontrada." });
    }

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

const sacar = async (req, res) => {
  let { numeroConta, valor, senha } = req.body;

  if (!numeroConta || !valor || !senha) {
    return res.status(401).json({
      mensagem: "O número da conta, valor e senha são obrigatórios!",
    });
  }
  if (valor <= 0) {
    return res.status(401).json({
      mensagem: "O valor não pode ser menor que zero!",
    });
  }

  try {
    const dadosAtualizados = JSON.parse(
      JSON.stringify(require("../bancodedados"))
    );

    const indexConta = dadosAtualizados.contas.findIndex(
      (conta) => conta.numero === String(numeroConta)
    );

    if (indexConta === -1) {
      return res.status(404).json({ mensagem: "Conta não encontrada." });
    }

    if (dadosAtualizados.contas[indexConta].usuario.senha !== senha) {
      return res.status(401).json({
        mensagem: "Senha incorreta.",
      });
    }

    if (dadosAtualizados.contas[indexConta].saldo - valor <= 0) {
      return res.status(401).json({
        mensagem: "Saldo insuficiente!",
      });
    }

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

const transferir = async (req, res) => {
  let { numeroContaOrigem, numeroContaDestino, valor, senha } = req.body;

  if (!numeroContaOrigem || !numeroContaDestino || !valor || !senha) {
    return res.status(401).json({
      mensagem: "O número da conta, valor e senha são obrigatórios!",
    });
  }
  if (numeroContaOrigem === numeroContaDestino) {
    return res.status(401).json({
      mensagem: "Não é permitido transação entre contas.",
    });
  }
  if (valor <= 0) {
    return res.status(401).json({
      mensagem: "O valor não pode ser menor que zero!",
    });
  }

  try {
    const dadosAtualizados = JSON.parse(
      JSON.stringify(require("../bancodedados"))
    );

    const indexContaOrigem = dadosAtualizados.contas.findIndex(
      (conta) => conta.numero === String(numeroContaOrigem)
    );

    if (indexContaOrigem === -1) {
      return res
        .status(404)
        .json({ mensagem: "Conta de origem não encontrada." });
    }

    const indexContaDestindo = dadosAtualizados.contas.findIndex(
      (conta) => conta.numero === String(numeroContaDestino)
    );

    if (indexContaDestindo === -1) {
      return res
        .status(404)
        .json({ mensagem: "Conta de destino não encontrada." });
    }

    if (dadosAtualizados.contas[indexContaOrigem].usuario.senha !== senha) {
      return res.status(401).json({
        mensagem: "Senha incorreta.",
      });
    }

    if (dadosAtualizados.contas[indexContaOrigem].saldo - valor <= 0) {
      return res.status(401).json({
        mensagem: "Saldo insuficiente.",
      });
    }

    dadosAtualizados.contas[indexContaOrigem].saldo -= valor;
    dadosAtualizados.contas[indexContaDestindo].saldo += valor;

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

const saldo = async (req, res) => {
  const { numeroConta, senha } = req.query;

  if (!numeroConta || !senha) {
    return res.status(401).json({
      mensagem: "O número da conta e senha são obrigatórios!",
    });
  }

  try {
    const dadosAtualizados = JSON.parse(
      JSON.stringify(require("../bancodedados"))
    );

    const conta = dadosAtualizados.contas.find(
      (conta) => conta.numero === String(numeroConta)
    );

    if (!conta) {
      return res.status(404).json({ mensagem: "Conta não encontrada." });
    }

    if (conta.usuario.senha !== senha) {
      return res.status(401).json({
        mensagem: "Senha incorreta.",
      });
    }

    return res.status(200).json(conta.saldo);
  } catch (error) {
    return res
      .status(500)
      .json({ mensagem: `Erro interno do servidor: ${error}` });
  }
};

const extrato = async (req, res) => {
  const { numeroConta, senha } = req.query;

  if (!numeroConta || !senha) {
    return res.status(401).json({
      mensagem: "O número da conta e senha são obrigatórios!",
    });
  }

  try {
    const dadosAtualizados = JSON.parse(
      JSON.stringify(require("../bancodedados"))
    );

    const conta = dadosAtualizados.contas.find(
      (conta) => conta.numero === String(numeroConta)
    );

    if (!conta) {
      return res.status(404).json({ mensagem: "Conta não encontrada." });
    }

    if (conta.usuario.senha !== senha) {
      return res.status(401).json({
        mensagem: "Senha incorreta.",
      });
    }

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
