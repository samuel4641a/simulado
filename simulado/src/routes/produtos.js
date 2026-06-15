// src/routes/produtos.js
const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /produtos - Listar todos os produtos cadastrados
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.id, p.nome, c.nome AS categoria, p.unidade_medida,
             p.valor_unitario, p.quantidade, p.estoque_minimo, p.estoque_maximo
      FROM produtos p
      JOIN categorias c ON p.categoria_id = c.id
    `);
    console.log(`[GET /produtos] ${rows.length} produtos retornados`);
    res.json(rows);
  } catch (err) {
    console.error('[GET /produtos] Erro:', err.message);
    res.status(500).json({ erro: err.message });
  }
});

// GET /produtos/vw-estoque - View vw_estoque (valor total por categoria)
router.get('/vw-estoque', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM vw_estoque');
    console.log(`[GET /produtos/vw-estoque] ${rows.length} registros retornados`);
    res.json(rows);
  } catch (err) {
    console.error('[GET /produtos/vw-estoque] Erro:', err.message);
    res.status(500).json({ erro: err.message });
  }
});

// GET /produtos/valor-por-categoria - Valor total por categoria
router.get('/valor-por-categoria', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.nome AS categoria,
             SUM(p.quantidade) AS quantidade_total,
             SUM(p.quantidade * p.valor_unitario) AS valor_total
      FROM produtos p
      JOIN categorias c ON p.categoria_id = c.id
      GROUP BY c.id, c.nome
    `);
    console.log(`[GET /produtos/valor-por-categoria] ${rows.length} categorias`);
    res.json(rows);
  } catch (err) {
    console.error('[GET /produtos/valor-por-categoria] Erro:', err.message);
    res.status(500).json({ erro: err.message });
  }
});

// GET /produtos/limites - Produtos no limite mínimo (0) ou máximo (100)
router.get('/limites', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT nome, categoria_id, quantidade, estoque_minimo, estoque_maximo,
        CASE
          WHEN quantidade <= estoque_minimo THEN 'MÍNIMO ATINGIDO'
          WHEN quantidade >= estoque_maximo THEN 'MÁXIMO ATINGIDO'
        END AS status_limite,
        ROUND((quantidade / estoque_maximo) * 100, 2) AS percentual_nivel
      FROM produtos
      WHERE quantidade <= estoque_minimo OR quantidade >= estoque_maximo
    `);
    console.log(`[GET /produtos/limites] ${rows.length} produtos em limite`);
    res.json(rows);
  } catch (err) {
    console.error('[GET /produtos/limites] Erro:', err.message);
    res.status(500).json({ erro: err.message });
  }
});

// POST /produtos - Cadastrar novo produto
router.post('/', async (req, res) => {
  const { nome, categoria_id, unidade_medida, valor_unitario, quantidade, estoque_minimo, estoque_maximo } = req.body;

  // Validações obrigatórias
  if (!nome || nome.trim() === '') {
    return res.status(400).json({ erro: 'Campo obrigatório: nome' });
  }
  if (!unidade_medida || unidade_medida.trim() === '') {
    return res.status(400).json({ erro: 'Campo obrigatório: unidade_medida' });
  }
  if (valor_unitario === undefined || valor_unitario === null || isNaN(valor_unitario) || Number(valor_unitario) < 0) {
    return res.status(400).json({ erro: 'Campo obrigatório: valor_unitario (deve ser >= 0)' });
  }
  if (!categoria_id || isNaN(categoria_id)) {
    return res.status(400).json({ erro: 'Campo obrigatório: categoria_id (deve ser um número válido)' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO produtos (nome, categoria_id, unidade_medida, valor_unitario, quantidade, estoque_minimo, estoque_maximo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nome, categoria_id, unidade_medida, valor_unitario, quantidade || 0, estoque_minimo || 0, estoque_maximo || 100]
    );
    console.log(`[POST /produtos] Produto criado com ID: ${result.insertId}`);
    res.status(201).json({ mensagem: 'Produto cadastrado com sucesso', id: result.insertId });
  } catch (err) {
    console.error('[POST /produtos] Erro:', err.message);
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
