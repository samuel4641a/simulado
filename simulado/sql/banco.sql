-- ============================================
-- SISTEMA DE CONTROLE DE ALMOXARIFADO - SENAI
-- Script de criação do banco de dados
-- ============================================

CREATE DATABASE IF NOT EXISTS almoxarifado;
USE almoxarifado;

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255)
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    categoria_id INT NOT NULL,
    unidade_medida VARCHAR(30) NOT NULL,
    valor_unitario DECIMAL(10, 2) NOT NULL CHECK (valor_unitario >= 0),
    quantidade INT NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
    estoque_minimo INT NOT NULL DEFAULT 0,
    estoque_maximo INT NOT NULL DEFAULT 100,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Tabela de Entradas de Estoque
CREATE TABLE IF NOT EXISTS entradas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    data_entrada DATE NOT NULL,
    observacao VARCHAR(255),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- Tabela de Saídas de Estoque
CREATE TABLE IF NOT EXISTS saidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    data_saida DATE NOT NULL,
    observacao VARCHAR(255),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- ============================================
-- VIEW vw_estoque (obrigatória pelo enunciado)
-- ============================================
CREATE OR REPLACE VIEW vw_estoque AS
SELECT
    p.id,
    p.nome,
    c.nome AS categoria,
    p.unidade_medida,
    p.quantidade AS quantidade_registrada,
    p.valor_unitario,
    (p.quantidade * p.valor_unitario) AS valor_total,
    p.estoque_minimo,
    p.estoque_maximo
FROM produtos p
JOIN categorias c ON p.categoria_id = c.id;

-- ============================================
-- DADOS DE EXEMPLO (mínimo 3 por tabela)
-- ============================================

INSERT INTO categorias (nome, descricao) VALUES
('Limpeza', 'Materiais de limpeza em geral'),
('Higiene', 'Produtos de higiene pessoal e coletiva'),
('Escritório', 'Materiais de escritório e papelaria');

INSERT INTO produtos (nome, categoria_id, unidade_medida, valor_unitario, quantidade, estoque_minimo, estoque_maximo) VALUES
('Detergente 500ml', 1, 'Unidade', 2.50, 80, 10, 100),
('Água Sanitária 1L', 1, 'Unidade', 4.00, 5, 10, 100),
('Sabão em Pó 1kg', 1, 'Pacote', 8.90, 30, 5, 100),
('Papel Toalha', 2, 'Rolo', 3.50, 50, 10, 100),
('Álcool Gel 500ml', 2, 'Unidade', 12.00, 0, 5, 100),
('Papel A4 Resma', 3, 'Resma', 25.00, 120, 10, 100);

INSERT INTO entradas (produto_id, quantidade, data_entrada, observacao) VALUES
(1, 50, '2026-06-01', 'Compra mensal'),
(3, 20, '2026-06-05', 'Reposição'),
(6, 100, '2026-06-10', 'Compra trimestral');

INSERT INTO saidas (produto_id, quantidade, data_saida, observacao) VALUES
(1, 10, '2026-06-02', 'Distribuição setor A'),
(4, 5,  '2026-06-03', 'Distribuição setor B'),
(6, 30, '2026-06-11', 'Distribuição geral');
