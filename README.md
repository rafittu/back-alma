# 🌱 Back-end da aplicação ALMA

###

<br>

A API desenvolvida tem como objetivo o gerenciamento de usuários. Por meio dessa API, é possível realizar operações de cadastro, consulta, atualização e exclusão de usuários.

A identidade de cada usuário é considerada uma "ALMA" dentro do sistema, representando a importância e singularidade de cada indivíduo. Por isso, a API oferece recursos para gerenciar e manter essas informações com segurança e eficiência.

<br>

## Tecnologias

Este projeto utiliza:

- Framework NestJS com TypeScript;
- ORM Prisma para comunicação com o banco de dados;
- Docker como uma ferramenta de containerização;

- Bcrypt e Crypto como ferramenta de criptografia;

<br>

## Instalação

Clonando o repositório:

```bash
$ git clone git@github.com:rafittu/back-alma.git
```

Instalando as dependências:

```bash
$ npm install
```

<br>

## Iniciando o app

Crie um arquivo `.env` na raiz do projeto e preencha as informações de acordo com o arquivo `.env.example` disponível.

Iniciando o servidor:

```bash
# modo de desenvolvimento
$ npm run start

# modo de observação
$ npm run start:dev
```

<br>

## Testes

Executando os testes unitários:

```bash
$ npm run test
```

Executando testes de ponta a ponta (end-to-end):

```bash
$ npm run test:e2e
```

Gerando relatório de cobertura dos testes:

```bash
$ npm run test:cov
```

<br>

##

<p align="right">
  <a href="https://www.linkedin.com/in/rafittu/">Rafael Ribeiro 🚀</a>
</p>
