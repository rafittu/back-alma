# 🌱 Back-end da aplicação ALMA

###

<br>

A API desenvolvida tem como objetivo o gerenciamento de usuários. Por meio dessa API, é possível realizar operações de cadastro, consulta, autenticação, atualização e exclusão de usuários.

A identidade de cada usuário é considerada uma "ALMA" dentro do sistema, representando a importância e singularidade de cada indivíduo. Por isso, a API oferece recursos para gerenciar e manter essas informações com segurança e eficiência.

<br>

## Tecnologias

Este projeto utiliza as seguintes tecnologias:

- **Node.js** com framework **NestJS** e **TypeScript**;
- **Prisma ORM** para comunicação e manipulação do banco de dados **PostgreSQL**;
- **Redis** para armazenamento em memória
- **Amazon Simple Queue Service (SQS)** para comunicação assíncrona entre serviços;

- **Docker** como uma ferramenta de containerização;

- **Bcrypt** e **Crypto** como ferramenta de criptografia;
- **Passport.js** para implementação de estratégias de autenticação;

- **Jest** para execução dos testes unitários;
- **Swagger** para documentação da API;

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

A API possui uma cobertura de testes unitários abrangente, com 100% de cobertura em cada parte essencial do código, garantindo a qualidade e o correto funcionamento do sistema.

Para executar os testes unitários, utilize o seguinte comando:

```bash
$ npm run test
```

Você também pode gerar um relatório de cobertura dos testes para verificar quais partes do código foram testadas. Para gerar esse relatório, utilize o seguinte comando:

```bash
$ npm run test:cov
```

<br>

## Documentação

A documentação completa da API está disponível através do Swagger. Para acessá-la, siga as etapas abaixo:

- Certifique-se de ter a API em execução localmente ou em um ambiente acessível;
- Abra um navegador da web e acesse a seguinte URL: `http://localhost:3000/api-doc` (substitua `3000` pelo número da porta inserida no arquivo `.env`);
- A documentação interativa da API será exibida no Swagger UI, onde você poderá explorar todos os endpoints, seus parâmetros e exemplos de solicitação.

<br>

##

<p align="right">
  <a href="https://www.linkedin.com/in/rafittu/">Rafael Ribeiro 🚀</a>
</p>
