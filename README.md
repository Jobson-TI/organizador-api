# Organizador da Casa 🏠

Um app full stack para lembrar onde cada objeto está guardado em casa. Cada usuário tem sua própria conta, seus próprios cômodos e seus próprios itens.

## Funcionalidades

- **Cadastro e login** de usuários, com senha criptografada
- **Cômodos personalizados**: crie e apague os cômodos da sua casa (cada conta começa com Quarto, Sala, Banheiro e Cozinha)
- **Itens**: cadastre objetos com nome, cômodo e local exato
- **Editar e apagar** itens
- **Busca** por nome enquanto digita e **filtro** por cômodo
- **Privacidade**: cada usuário vê e altera apenas os próprios dados
- Layout **responsivo** para celular

## Tecnologias

**Backend**

- Node.js + Express
- SQLite (better-sqlite3)
- bcryptjs (hash de senhas)
- jsonwebtoken (autenticação com JWT)
- express-rate-limit (limite de tentativas)

**Frontend**

- HTML, CSS e JavaScript puro
- Fetch API com async/await

## Como rodar localmente

1. Clone o repositório e instale as dependências:

   ```bash
   git clone https://github.com/SEU_USUARIO/organizador-api.git
   cd organizador-api
   npm install
   ```

2. Crie um arquivo `.env` na raiz, seguindo o `.env.example`:

   Para gerar um segredo forte: `openssl rand -hex 32`

3. Inicie o servidor:

   ```bash
   node --env-file=.env server.js
   ```

4. Acesse **http://localhost:3000**

O banco de dados (`organizador.db`) é criado automaticamente na primeira execução.

## API

Todas as rotas de `/itens` e `/comodos` exigem o cabeçalho `Authorization: Bearer <token>`.

| Método | Rota             | Descrição                             |
| ------ | ---------------- | ------------------------------------- |
| POST   | `/auth/cadastro` | Cria uma conta                        |
| POST   | `/auth/login`    | Faz login e devolve o token JWT       |
| GET    | `/itens`         | Lista os itens do usuário             |
| GET    | `/itens/:id`     | Busca um item                         |
| POST   | `/itens`         | Cria um item                          |
| PUT    | `/itens/:id`     | Edita um item                         |
| DELETE | `/itens/:id`     | Apaga um item                         |
| GET    | `/comodos`       | Lista os cômodos do usuário           |
| POST   | `/comodos`       | Cria um cômodo                        |
| DELETE | `/comodos/:id`   | Apaga um cômodo (só se estiver vazio) |

## Segurança

- Senhas armazenadas com **hash bcrypt**, nunca em texto puro
- Autenticação com **JWT** assinado e com validade de 7 dias
- **Limite de tentativas** no login e no cadastro contra ataques de força bruta
- Mensagem de erro genérica no login, para não revelar quais e-mails têm conta
- Todas as consultas filtram pelo dono dos dados, impedindo o acesso a itens de outros usuários (proteção contra **IDOR**)
- Consultas com parâmetros (`?`), protegidas contra **SQL Injection**
- **Validação** de todos os dados recebidos no servidor
- **Transação** no cadastro, garantindo que a conta e os cômodos padrão sejam criados juntos

## Estrutura

organizador-api/
├── server.js # inicia o servidor e junta as rotas
├── db.js # conexão e criação das tabelas
├── validacoes.js # regras de validação
├── middlewares/
│ └── verificarToken.js # confere o JWT e identifica o usuário
├── rotas/
│ ├── auth.js # cadastro e login
│ ├── itens.js # rotas de itens
│ └── comodos.js # rotas de cômodos
└── public/ # frontend (HTML, CSS e JS)

## O que aprendi

- Criar uma **API REST** com Express, usando os verbos e códigos de status HTTP corretos
- Modelar um banco **relacional** com SQL: chaves estrangeiras, `JOIN`, `UNIQUE` e transações
- Implementar **autenticação** com hash de senhas e JWT
- Pensar em **segurança**: força bruta, IDOR, SQL Injection e validação no servidor
- Organizar o backend em **módulos** e o frontend com o padrão "estado → renderização"
- Tratar erros dos dois lados: no servidor e no navegador
