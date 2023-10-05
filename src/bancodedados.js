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
      saldo: 0,
      usuario: {
        nome: "Tamo ai21",
        cpf: "00011122225",
        data_nascimento: "2021-03-15",
        telefone: "71999998888",
        email: "foo34@bar2.com",
        senha: "12345",
      },
    },
    {
      numero: "3",
      saldo: 300,
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
  saques: [
    { data: "04-10-2023 16:14:11", numeroConta: "1", valor: 1900 },
    { data: "04-10-2023 23:30:12", numeroConta: "1", valor: 1900 },
    { data: "04-10-2023 23:31:13", numeroConta: "1", valor: 1900 },
    { data: "04-10-2023 23:34:07", numeroConta: "1", valor: 100 },
  ],
  depositos: [
    { data: "04-10-2023 15:55:57", numeroConta: "1", valor: 100 },
    { data: "04-10-2023 23:06:05", numeroConta: "1", valor: 100 },
    { data: "04-10-2023 23:33:29", numeroConta: "1", valor: 100 },
    { data: "05-10-2023 00:05:11", numeroConta: "1", valor: 100 },
  ],
  transferencias: [
    {
      data: "04-10-2023 16:26:57",
      numeroContaOrigem: "1",
      numeroContaDestino: "3",
      valor: 100,
    },
    {
      data: "04-10-2023 23:51:53",
      numeroContaOrigem: "1",
      numeroContaDestino: "3",
      valor: 100,
    },
    {
      data: "05-10-2023 00:05:14",
      numeroContaOrigem: "1",
      numeroContaDestino: "3",
      valor: 100,
    },
  ],
};
