const { banco, contas } = require("../bancodedados");

const buscarIndexConta = (numeroConta, res) => {
  const index = contas.findIndex(
    (conta) => conta.numero === String(numeroConta)
  );
  if (index === -1) {
    return res.status(404).json({ mensagem: "Conta não encontrada." });
  }
  return index;
};

const validarSenhaBanco = (req, res, next) => {
  const senhaBanco = req.query.senhaBanco;

  if (!senhaBanco) {
    return res
      .status(401)
      .json({ mensagem: "Necessário fornecer a senha para listar as contas." });
  }

  if (senhaBanco !== banco.senha) {
    return res
      .status(403)
      .json({ mensagem: "A senha do banco informada é inválida!" });
  }

  next();
};

const validarSenhaConta = (req, res, next) => {
  let { senha, numeroConta } = req.body;

  if (!senha || !numeroConta) {
    senha = req.query.senha;
    numeroConta = req.query.numeroConta;
  }

  if (!senha) {
    return res.status(401).json({ mensagem: "Necessário fornecer a senha." });
  }

  const indexConta = buscarIndexConta(numeroConta, res);

  if (contas[indexConta].usuario.senha !== senha) {
    return res
      .status(403)
      .json({ mensagem: "A senha do banco informada é inválida!" });
  }

  next();
};

const validarNumeroConta = (req, res, next) => {
  try {
    let { numeroConta } = req.params;

    if (!numeroConta) {
      numeroConta = req.body.numeroConta;
    }

    if (!numeroConta) {
      numeroConta = req.query.numeroConta;
    }

    if (!numeroConta) {
      return res
        .status(400)
        .json({ mensagem: "Necessário fornecer o número da conta." });
    }

    if (isNaN(numeroConta)) {
      return res
        .status(400)
        .json({ mensagem: "Necessário fornecer o número da conta válido." });
    }

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ mensagem: `Erro interno do servidor: ${error}` });
  }
};

const validarValor = (req, res, next) => {
  try {
    let { valor } = req.params;

    if (!valor) {
      valor = req.body.valor;
    }

    if (!valor) {
      return res.status(400).json({ mensagem: "Necessário fornecer o valor." });
    }

    if (isNaN(valor)) {
      return res
        .status(400)
        .json({ mensagem: "Necessário fornecer o valor válido." });
    }
    if (valor <= 0) {
      return res.status(400).json({
        mensagem: "Não é permitido depósitos com valores negativos ou zerados",
      });
    }

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ mensagem: `Erro interno do servidor: ${error}` });
  }
};

const validarValorPositivo = (req, res, next) => {
  const { valor } = req.body;

  if (valor <= 0) {
    return res.status(400).json({
      mensagem: "O valor não pode ser menor que zero!",
    });
  }

  next();
};

const validaCPF = (req, res, next) => {
  const { cpf } = req.body;

  const buscarCPF = contas.find((busca) => busca.usuario.cpf === cpf);

  if (buscarCPF) {
    return res
      .status(400)
      .json({ mensagem: "Já existe uma conta com o cpf informado!" });
  }

  next();
};

const validaEmail = (req, res, next) => {
  const { email } = req.body;

  const buscarEmail = contas.find((busca) => busca.usuario.email === email);

  if (buscarEmail) {
    return res
      .status(400)
      .json({ mensagem: "Já existe uma conta com o e-mail informado!" });
  }

  next();
};

const validarSaldo = (req, res, next) => {
  const { numeroConta, valor } = req.body;

  const indexConta = buscarIndexConta(numeroConta, res);

  if (contas[indexConta].saldo - valor < 0) {
    return res.status(400).json({
      mensagem: "Saldo insuficiente",
    });
  }
  next();
};

const verificarSaldoZerado = (req, res, next) => {
  const { numeroConta } = req.params;

  const indexConta = buscarIndexConta(numeroConta, res);

  if (contas[indexConta].saldo > 0) {
    return res.status(400).json({
      mensagem: "A conta só pode ser removida se o saldo for zero!",
    });
  }
  next();
};

const validarTransferecia = (req, res, next) => {
  let { numeroContaOrigem, numeroContaDestino, senha, valor } = req.body;

  if (!numeroContaOrigem || !numeroContaDestino) {
    return res.status(400).json({
      mensagem: "O número da conta, valor e senha são obrigatórios!",
    });
  }

  if (!senha) {
    return res.status(400).json({ mensagem: "Necessário fornecer a senha." });
  }

  const indexContaOrigem = contas.findIndex(
    (conta) => conta.numero === String(numeroContaOrigem)
  );

  if (indexContaOrigem === -1) {
    return res
      .status(404)
      .json({ mensagem: "Conta de origem não encontrada." });
  }

  const indexContaDestino = contas.findIndex(
    (conta) => conta.numero === String(numeroContaDestino)
  );

  if (indexContaDestino === -1) {
    return res
      .status(404)
      .json({ mensagem: "Conta de destino não encontrada." });
  }

  if (contas[indexContaOrigem].usuario.senha !== senha) {
    return res.status(403).json({ mensagem: "A senha informada é inválida!" });
  }
  if (contas[indexContaOrigem].saldo - valor < 0) {
    return res.status(400).json({
      mensagem: "Saldo insuficiente",
    });
  }

  next();
};

module.exports = {
  validarSenhaBanco,
  validarNumeroConta,
  validarValorPositivo,
  validaCPF,
  validaEmail,
  validarValor,
  verificarSaldoZerado,
  validarSaldo,
  validarSenhaConta,
  validarTransferecia,
};
