// src/routes/movimentacoes.js
const express = require('express');
const router = express.Router();
const db = require('../database');

// POST /movimentacoes/entrada - Registrar entrada de produto
router.post('/entrada', async (req, res) => {
  const { produto_id, quantidade, data_entrada, observacao } = req.body;

  if (!produto_id) return res.status(400).json({ erro: 'Campo obrigatório: produto_id' });
  if (!quantidade || quantidade <= 0) return res.status(400).json({ erro: 'Campo obrigatório: quantidade (deve ser > 0)' });
  if (!data_entrada) return res.status(400).json({ erro: 'Campo obrigatório: data_entrada' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      'INSERT INTO entradas (produto_id, quantidade, data_entrada, observacao) VALUES (?, ?, ?, ?)',
      [produto_id, quantidade, data_entrada, observacao || null]
    );
    await conn.query(
      'UPDATE produtos SET quantidade = quantidade + ? WHERE id = ?',
      [quantidade, produto_id]
    );
    await conn.commit();
    console.log(`[POST /entrada] Entrada registrada: produto_id=${produto_id}, qtd=${quantidade}`);
    res.status(201).json({ mensagem: 'Entrada registrada com sucesso' });
  } catch (err) {
    await conn.rollback();
    console.error('[POST /entrada] Erro:', err.message);
    res.status(500).json({ erro: err.message });
  } finally {
    conn.release();
  }
});

// POST /movimentacoes/saida - Registrar saída de produto
router.post('/saida', async (req, res) => {
  const { produto_id, quantidade, data_saida, observacao } = req.body;

  if (!produto_id) return res.status(400).json({ erro: 'Campo obrigatório: produto_id' });
  if (!quantidade || quantidade <= 0) return res.status(400).json({ erro: 'Campo obrigatório: quantidade (deve ser > 0)' });
  if (!data_saida) return res.status(400).json({ erro: 'Campo obrigatório: data_saida' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Verifica estoque disponível
    const [[produto]] = await conn.query('SELECT quantidade FROM produtos WHERE id = ?', [produto_id]);
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
    if (produto.quantidade < quantidade) {
      await conn.rollback();
      return res.status(400).json({ erro: `Estoque insuficiente. Disponível: ${produto.quantidade}` });
    }

    await conn.query(
      'INSERT INTO saidas (produto_id, quantidade, data_saida, observacao) VALUES (?, ?, ?, ?)',
      [produto_id, quantidade, data_saida, observacao || null]
    );
    await conn.query(
      'UPDATE produtos SET quantidade = quantidade - ? WHERE id = ?',
      [quantidade, produto_id]
    );
    await conn.commit();
    console.log(`[POST /saida] Saída registrada: produto_id=${produto_id}, qtd=${quantidade}`);
    res.status(201).json({ mensagem: 'Saída registrada com sucesso' });
  } catch (err) {
    await conn.rollback();
    console.error('[POST /saida] Erro:', err.message);
    res.status(500).json({ erro: err.message });
  } finally {
    conn.release();
  }
});

// GET /movimentacoes/saidas-por-data - Listar saídas em ordem decrescente por data
router.get('/saidas-por-data', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.id, p.nome AS produto, s.quantidade, s.data_saida, s.observacao
      FROM saidas s
      JOIN produtos p ON s.produto_id = p.id
      ORDER BY s.data_saida DESC
    `);
    console.log(`[GET /saidas-por-data] ${rows.length} saídas retornadas`);
    res.json(rows);
  } catch (err) {
    console.error('[GET /saidas-por-data] Erro:', err.message);
    res.status(500).json({ erro: err.message });
  }
});

// GET /movimentacoes/periodo?data_inicial=YYYY-MM-DD&data_final=YYYY-MM-DD
// Lista movimentações de entrada e saída com 7 campos obrigatórios
router.get('/periodo', async (req, res) => {
  const { data_inicial, data_final } = req.query;
  if (!data_inicial || !data_final) {
    return res.status(400).json({ erro: 'Parâmetros obrigatórios: data_inicial e data_final' });
  }

  try {
    const [rows] = await db.query(`
      SELECT
        p.nome AS nome_produto,
        p.unidade_medida,
        COALESCE(SUM(e.quantidade), 0) AS total_entradas,
        COALESCE(SUM(s.quantidade), 0) AS total_saidas,
        (COALESCE(SUM(e.quantidade), 0) - COALESCE(SUM(s.quantidade), 0)) AS saldo_periodo,
        COALESCE(SUM(e.quantidade * p.valor_unitario), 0) AS valor_financeiro_entradas,
        COALESCE(SUM(s.quantidade * p.valor_unitario), 0) AS valor_financeiro_saidas
      FROM produtos p
      LEFT JOIN entradas e ON e.produto_id = p.id AND e.data_entrada BETWEEN ? AND ?
      LEFT JOIN saidas s ON s.produto_id = p.id AND s.data_saida BETWEEN ? AND ?
      GROUP BY p.id, p.nome, p.unidade_medida, p.valor_unitario
      HAVING total_entradas > 0 OR total_saidas > 0
      ORDER BY p.nome
    `, [data_inicial, data_final, data_inicial, data_final]);

    console.log(`[GET /periodo] Período: ${data_inicial} a ${data_final} - ${rows.length} produtos`);
    res.json(rows);
  } catch (err) {
    console.error('[GET /periodo] Erro:', err.message);
    res.status(500).json({ erro: err.message });
  }
});

// GET /movimentacoes/maior-saida?data_inicial=YYYY-MM-DD&data_final=YYYY-MM-DD
// Produtos com maior volume de saída no período - 3 campos obrigatórios
router.get('/maior-saida', async (req, res) => {
  const { data_inicial, data_final } = req.query;
  if (!data_inicial || !data_final) {
    return res.status(400).json({ erro: 'Parâmetros obrigatórios: data_inicial e data_final' });
  }

  try {
    const [rows] = await db.query(`
      SELECT
        p.nome AS nome_produto,
        SUM(s.quantidade) AS quantidade_total_saida,
        SUM(s.quantidade * p.valor_unitario) AS valor_financeiro_saidas
      FROM saidas s
      JOIN produtos p ON s.produto_id = p.id
      WHERE s.data_saida BETWEEN ? AND ?
      GROUP BY p.id, p.nome, p.valor_unitario
      ORDER BY quantidade_total_saida DESC
    `, [data_inicial, data_final]);

    console.log(`[GET /maior-saida] ${rows.length} produtos com saída no período`);
    res.json(rows);
  } catch (err) {
    console.error('[GET /maior-saida] Erro:', err.message);
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
