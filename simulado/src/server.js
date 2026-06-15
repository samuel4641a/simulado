// src/server.js
const express = require('express');
const app = express();

app.use(express.json());

// Rotas
const produtosRoutes = require('./routes/produtos');
const movimentacoesRoutes = require('./routes/movimentacoes');

app.use('/produtos', produtosRoutes);
app.use('/movimentacoes', movimentacoesRoutes);

// Rota raiz - lista todos os endpoints disponíveis
app.get('/', (req, res) => {
  console.log('[GET /] Listando endpoints disponíveis');
  res.json({
    sistema: 'Almoxarifado SENAI',
    endpoints: [
      { metodo: 'GET',  rota: '/produtos',                       descricao: 'Listar todos os produtos' },
      { metodo: 'POST', rota: '/produtos',                       descricao: 'Cadastrar novo produto (nome, categoria_id, unidade_medida, valor_unitario obrigatórios)' },
      { metodo: 'GET',  rota: '/produtos/vw-estoque',            descricao: 'View: valor total por produto (quantidade x valor_unitario)' },
      { metodo: 'GET',  rota: '/produtos/valor-por-categoria',   descricao: 'Valor total por categoria' },
      { metodo: 'GET',  rota: '/produtos/limites',               descricao: 'Produtos no limite mínimo (0) ou máximo (100)' },
      { metodo: 'POST', rota: '/movimentacoes/entrada',          descricao: 'Registrar entrada de estoque (produto_id, quantidade, data_entrada)' },
      { metodo: 'POST', rota: '/movimentacoes/saida',            descricao: 'Registrar saída de estoque (produto_id, quantidade, data_saida)' },
      { metodo: 'GET',  rota: '/movimentacoes/saidas-por-data',  descricao: 'Listar saídas em ordem decrescente por data' },
      { metodo: 'GET',  rota: '/movimentacoes/periodo?data_inicial=YYYY-MM-DD&data_final=YYYY-MM-DD', descricao: 'Movimentações no período (7 campos)' },
      { metodo: 'GET',  rota: '/movimentacoes/maior-saida?data_inicial=YYYY-MM-DD&data_final=YYYY-MM-DD', descricao: 'Produtos com maior volume de saída no período (3 campos)' },
    ]
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📦 Sistema de Almoxarifado - SENAI`);
  console.log(`📋 Acesse GET / para ver todos os endpoints disponíveis\n`);
});
