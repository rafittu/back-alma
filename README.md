# 🌱 Back-end da aplicação ALMA

###

<br>

A API desenvolvida tem como objetivo o gerenciamento de usuários. Por meio dessa API, é possível realizar operações de cadastro, consulta, autenticação, atualização e exclusão de usuários.

A identidade de cada usuário é considerada uma "ALMA" dentro do sistema, representando a importância e singularidade de cada indivíduo. Por isso, a API oferece recursos para gerenciar e manter essas informações com segurança e eficiência.

<br>

## Tecnologias

<br>

Este projeto utiliza as seguintes tecnologias:

- **Node.js** com framework **NestJS** e **TypeScript**;
- **Prisma ORM** para comunicação e manipulação do banco de dados **PostgreSQL**;
- **Redis** para armazenamento em memória
- **Amazon Simple Queue Service (SQS)** para comunicação assíncrona entre serviços;

- **Docker** como uma ferramenta de containerização;

- **JWT** para autenticação e autorização de acesso;
- **Bcrypt** e **Crypto** como ferramenta de criptografia;
- **Passport.js** para implementação de estratégias de autenticação;

- **Jest** para execução dos testes unitários;
- **Swagger** para documentação da API;

<br>

## Funcionalidades

A API ALMA oferece diversas funcionalidades para gerenciamento de usuários, autenticação e segurança, permitindo desenvolver aplicações robustas e seguras.

<br>

### Gerenciamento de Usuários:

- **Cadatro de usuários**: crie novos usuários na plataforma com informações completas.
 ```
    {
      "firstName": "John",
      "lastName": "Doe",
      "cpf": "12365478914",
      "socialName": "Joane Eod",
      "username": "jd",
      "bornDate": "1990-01-01",
      "motherName": "Jane Doe",
      "email": "johndoe@example.com",
      "phone": "1234567890",
      "password": "#Password123",
      "passwordConfirmation": "#Password123",
      "originChannel": "WOPHI"
    }
```

- **Busca de usuários**: encontre usuários por ID, email ou telefone.

- **Atualização de cadastro**: atualize as informações do seu perfil.
```
{
  "username": "John D"
}
```

- **Exclusão e reativação de cadastro**: exclua ou reative um cadastro de usuário.
<br>

### Autenticação e Segurança:

- **Login**: realize login na plataforma utilizando email e senha para obtenção de tokens de acesso.
```
{
  "email": "johndoe@example.com",
  "password": "password123",
  "origin": "wophi"
}
```

- **Renovação de tokens**: renove o `accessToken` e o `refreshToken` para garantir acesso contínuo à plataforma.

- **Recuperação da senha**: recupere sua senha de acesso em caso de esquecimento.
<br>

### Explore mais:

- Consulte a documentação completa da API ALMA para obter mais detalhes sobre cada funcionalidade e exemplos de utilização.

<br>

## Instalação

<br>

Clonando o repositório:

```bash
$ git clone git@github.com:rafittu/back-alma.git
```

Instalando as dependências:

```bash
$ cd back-alma
$ npm install
```

<br>

## Iniciando o app

<br>

Crie um arquivo `.env` na raiz do projeto e preencha as informações de acordo com o arquivo `.env.example` disponível.

Execute o banco de dados PostgreSQL usando Docker:

```bash
$ docker-compose up -d
```

Para garantir que o banco de dados esteja atualizado com as ultimas alterações, rode o comando:

```bash
$ npx prisma migrate dev
```

Iniciando o servidor:

```bash
# modo de desenvolvimento
$ npm run start

# modo de observação
$ npm run start:dev
```

<br>

## Testes

<br>

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

<br>

A documentação completa da API está disponível através do Swagger. Para acessá-la, siga as etapas abaixo:

- Certifique-se de ter a API em execução localmente ou em um ambiente acessível;
- Abra um navegador da web e acesse a seguinte URL: `http://localhost:3000/v3/api-doc` (substitua `3000` pelo número da porta inserida no arquivo `.env`);
- A documentação interativa da API será exibida no Swagger UI, onde você poderá explorar todos os endpoints, seus parâmetros e exemplos de solicitação.

<br>

##

<p align="right">
  <a href="https://www.linkedin.com/in/rafittu/">Rafael Ribeiro 🚀</a>
</p>
