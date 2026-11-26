# Forma — cadastro de usuários

Aplicação React com uma tela de cadastro responsiva, API local em Express e persistência SQLite.

## Executar localmente

```bash
npm install
npm run dev
```

O comando inicia a interface Vite e a API em paralelo. Abra o endereço informado pelo Vite. A API fica disponível em `http://localhost:3001`, e as chamadas `/api` da interface são encaminhadas para ela.

Para validar a versão de produção:

```bash
npm run build
npm run lint
```

## Persistência

O banco `data/users.sqlite` e suas tabelas são criados automaticamente ao iniciar a API. Os e-mails são normalizados e únicos no SQLite, que é a autoridade final para impedir cadastros duplicados. As senhas são armazenadas como hashes `scrypt`; nunca são enviadas de volta pela API nem gravadas no `localStorage`.

A interface consulta `GET /api/users` ao iniciar e guarda os perfis públicos no `localStorage` (`forma.registered-users`). `POST /api/users` valida e grava novos usuários. O cache local ajuda na experiência, mas a verificação no banco também é feita no servidor.

O login é feito em `/login`: `POST /api/users/login` valida a senha contra o hash salvo no SQLite. Após o cadastro, `/resultado` confirma a operação; após o login, a mesma tela confirma a autenticação e direciona para `/inicio`.

## Organização

- `src/features/users/pages`: tela de cadastro.
- `src/features/users/pages`: telas de login, confirmação e área inicial.
- `src/features/users/services`: comunicação com a API e persistência local.
- `server/routes`: endpoints de usuários.
- `server/database.ts`: inicialização e esquema SQLite.

## Equipe de desenvolvimento

- **GP do time de dev:** Tiago Secundo Santos
- **Dev 1 (tela de cadastro):** Hudson Jr Xavier da Silva
- **Dev 2 (tela de busca):** Nadson Nascimento Santos
- **Dev 3 (tela de pagamento):** Helen Geovanna Gonçalves
- **Dev 4 (integração):** Augusto Henrique Santos de Oliveira
