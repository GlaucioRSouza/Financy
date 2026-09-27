# Gerenciamento Financeiro - Backend

Este projeto é uma aplicação de gerenciamento financeiro pessoal, construída com TypeScript, Node.js e GraphQL. O objetivo é fornecer uma API que permita aos usuários gerenciar suas transações e categorias de forma segura e eficiente.

## Estrutura do Projeto

A estrutura do projeto é organizada da seguinte forma:

```
finance-backend
├── prisma
│   └── schema.prisma          # Define o esquema do banco de dados
├── src
│   ├── graphql
│   │   ├── schema.ts          # Define o esquema GraphQL
│   │   ├── resolvers.ts       # Contém os resolvers para as queries e mutations
│   │   ├── context.ts         # Cria o contexto para a API GraphQL
│   │   └── index.ts           # Exporta o esquema e os resolvers
│   ├── services
│   │   ├── auth.service.ts     # Lógica de autenticação
│   │   ├── category.service.ts  # Lógica para gerenciar categorias
│   │   └── transaction.service.ts # Lógica para gerenciar transações
│   ├── utils
│   │   ├── jwt.ts              # Funções utilitárias para JWT
│   │   ├── bcrypt.ts           # Funções para hash e verificação de senhas
│   │   └── constants.ts        # Define constantes utilizadas na aplicação
│   ├── app.ts                  # Ponto de entrada da aplicação
│   ├── server.ts               # Inicializa o servidor
│   └── types
│       └── index.ts           # Exporta tipos e interfaces
├── .env.example                 # Exemplo de variáveis de ambiente
├── package.json                 # Configuração do npm
├── tsconfig.json               # Configuração do TypeScript
└── README.md                   # Documentação do projeto
```
