const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../public'))); // serve login.html e cadastro.html

// Rota de cadastro
app.post('/register', (req, res) => {
  const { nome, email, senha } = req.body;

  bcrypt.hash(senha, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: 'Erro ao configurar senha' });

    const sql = 'INSERT INTO users (nome, email, senha) VALUES (?,?,?)';
    db.query(sql, [nome, email, hash], (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao cadastrar usuário' });
      res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    });
  });
});

// Rota de login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erro no login' });
    if (result.length === 0) return res.status(401).json({ error: 'Usuário não encontrado' });

    const user = result[0];

    bcrypt.compare(senha, user.senha, (err, match) => {
      if (err) return res.status(500).json({ error: 'Erro ao verificar senha' });
      if (!match) return res.status(401).json({ error: 'Senha incorreta' });

      res.json({ message: 'Login realizado com sucesso!' });
    });
  });
});

// Inicia o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
