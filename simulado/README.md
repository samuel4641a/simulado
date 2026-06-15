# Sistema de Almoxarifado - SENAI

## Como rodar

### 1. Banco de dados
Execute o script SQL no MySQL:
```
mysql -u root -p < sql/banco.sql
```

### 2. Configurar conexão
Edite `src/database.js` e informe seu usuário/senha do MySQL.

### 3. Instalar dependências e rodar
```bash
npm install
npm start
```

O servidor sobe em `http://localhost:3000`

---

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/produtos` | Listar todos os produtos |
| POST | `/produtos` | Cadastrar produto |
| GET | `/produtos/vw-estoque` | View vw_estoque |
| GET | `/produtos/valor-por-categoria` | Valor total por categoria |
| GET | `/produtos/limites` | Produtos no limite mín/máx |
| POST | `/movimentacoes/entrada` | Registrar entrada |
| POST | `/movimentacoes/saida` | Registrar saída |
| GET | `/movimentacoes/saidas-por-data` | Saídas ordem decrescente |
| GET | `/movimentacoes/periodo` | Movimentações no período (7 campos) |
| GET | `/movimentacoes/maior-saida` | Maior volume de saída (3 campos) |

---

## Exemplos Postman/Insomnia

### Cadastrar produto
```
POST /produtos
{
  "nome": "Desinfetante 1L",
  "categoria_id": 1,
  "unidade_medida": "Unidade",
  "valor_unitario": 5.50,
  "quantidade": 40
}
```

### Registrar entrada
```
POST /movimentacoes/entrada
{
  "produto_id": 1,
  "quantidade": 20,
  "data_entrada": "2026-06-15"
}
```

### Registrar saída
```
POST /movimentacoes/saida
{
  "produto_id": 1,
  "quantidade": 5,
  "data_saida": "2026-06-15"
}
```

### Movimentações no período
```
GET /movimentacoes/periodo?data_inicial=2026-06-01&data_final=2026-06-30
```

### Maior volume de saída
```
GET /movimentacoes/maior-saida?data_inicial=2026-06-01&data_final=2026-06-30
```
