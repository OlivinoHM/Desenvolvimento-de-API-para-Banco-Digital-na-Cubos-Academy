module.exports = {
  banco: {
    nome: "Cubos Bank",
    numero: "123",
    agencia: "0001",
    senha: "Cubos123Bank",
  },
  contas: [
    {
      numero: "1",
      saldo: 100,
      usuario: {
        nome: "Foo Bar",
        cpf: "00011122233",
        data_nascimento: "2021-03-15",
        telefone: "71999998888",
        email: "foo@bar.com",
        senha: "1234",
      },
    },
    {
      numero: "3",
      saldo: 100,
      usuario: {
        nome: "Foo Bar 2",
        cpf: "00011122235",
        data_nascimento: "2021-03-15",
        telefone: "71999998888",
        email: "foo@bar2.com",
        senha: "12345",
      },
    },
  ],
  saques: [{ data: "04-10-2023 16:14:11", numeroConta: "1", valor: 1900 }],
  depositos: [{ data: "04-10-2023 15:55:57", numeroConta: "1", valor: 100 }],
  transferencias: [
    {
      data: "04-10-2023 16:26:57",
      numeroContaOrigem: "1",
      numeroContaDestino: "3",
      valor: 100,
    },
  ],
};
