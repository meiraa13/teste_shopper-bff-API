# teste_shopper-bff-API

Esta é uma API que possui um banco de dados em MySql5 de produtos para um ecommerce. A API possui 3 rotas no total:
-  GET /products : le todos os produtos que estão cadastrados no banco de dados
-  POST /products : recebe um arquivo .csv e valida os dados de acordo com as regras de negocio pre estabelecidas
-  PATCH /products: após validação dos dados um botão de atualizar é desbloqueado no front, permitindo fazer a atualização de preços no banco de dados

## Formato de envio do .csv

- linha 1 coluna A: product_code,new_price
- Inserir o codigo e preço de cada produto nas linhas abaixo na coluna A, ex: 18,9.10
- para informar um produto que é um pack deve ser informado o codigo do produto(pack) e não id do pack 

## Tecnologias Utilizadas

- Node.js
- Express.js
- MySql 5
- env
- multer
- csv-parser
- npm


## Iniciando a aplicação

Siga os passos abaixo para poder rodar a aplicação no seu servidor local:

1. Instale o Node.js e MySql 5

2. Crie um banco de dados com as querys que estão no arquivo sql/createTables.sql

3. clone este repositório para sua maquina local e abra o projeto

4. com o projeto aberto, rode o comando abaixo para instalar todas as dependencias:

```
npm install
```

5. Crie um arquivo chamado `.env` na raiz do projeto, fora da pasta src e defina as variaveis de ambiente para se conectar ao seu banco de dados. 
certifique-se de ter criado anteriormente o banco de dados que vai ser utilizado.

```
DATABASE_URL= mysql://user:password@host:port/db
```

6. Rode o comando abaixo para iniciar o servidor:

```
npm run dev
```

URL frontend : https://github.com/meiraa13/teste_shopper-ffb