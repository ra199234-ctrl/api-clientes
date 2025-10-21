// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://seu_usuario:sua_senha@cluster.mongodb.net/clientes_db?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado ao MongoDB'))
.catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));

// Schema do Cliente
const clienteSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  sobreNome: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Cliente = mongoose.model('Cliente', clienteSchema);

// ROTAS

// GET - Listar todos os clientes
app.get('/clientes', async (req, res) => {
  try {
    const clientes = await Cliente.find();
    const clientesFormatados = clientes.map(cliente => ({
      _id: cliente._id.toString(),
      nome: cliente.nome,
      sobreNome: cliente.sobreNome
    }));
    res.status(200).json(clientesFormatados);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar clientes', detalhes: error.message });
  }
});

// POST - Cadastrar novo cliente
app.post('/clientes', async (req, res) => {
  try {
    const { nome, sobreNome } = req.body;
    
    if (!nome || !sobreNome) {
      return res.status(400).json({ erro: 'Nome e sobreNome são obrigatórios' });
    }

    const novoCliente = new Cliente({
      nome,
      sobreNome
    });

    await novoCliente.save();
    res.status(200).send();
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao cadastrar cliente', detalhes: error.message });
  }
});

// PUT - Atualizar cliente
app.put('/clientes', async (req, res) => {
  try {
    const { _id, nome, sobreNome } = req.body;

    if (!_id) {
      return res.status(400).json({ erro: '_id é obrigatório' });
    }

    const dadosAtualizacao = {};
    if (nome) dadosAtualizacao.nome = nome;
    if (sobreNome) dadosAtualizacao.sobreNome = sobreNome;

    const clienteAtualizado = await Cliente.findByIdAndUpdate(
      _id,
      dadosAtualizacao,
      { new: true }
    );

    if (!clienteAtualizado) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.status(200).json({
      _id: clienteAtualizado._id.toString(),
      nome: clienteAtualizado.nome,
      sobreNome: clienteAtualizado.sobreNome
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar cliente', detalhes: error.message });
  }
});

// DELETE - Remover cliente
app.delete('/clientes', async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ erro: '_id é obrigatório' });
    }

    const clienteRemovido = await Cliente.findByIdAndDelete(_id);

    if (!clienteRemovido) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.status(200).send();
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover cliente', detalhes: error.message });
  }
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    mensagem: 'API de Clientes está funcionando!',
    rotas: {
      GET: '/clientes - Lista todos os clientes',
      POST: '/clientes - Cadastra um novo cliente',
      PUT: '/clientes - Atualiza um cliente existente',
      DELETE: '/clientes - Remove um cliente'
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

module.exports = app;
