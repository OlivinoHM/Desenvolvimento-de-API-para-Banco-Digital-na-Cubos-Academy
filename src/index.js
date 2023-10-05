const express = require("express");
const rotas = require("./rotas");
const intermediarios = require("./middleware/intermediarios");

const app = express();

app.use(express.json());

app.use(rotas);

app.listen(3000);
