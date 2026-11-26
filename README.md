# Forma — Sistema de Caronas Universitárias

Aplicação web integrada para cadastro e autenticação de passageiros, busca de caronas com cálculo de compatibilidade (*match*), divisão proporcional de custos e confirmação de reserva com persistência em SQLite.

## Executar com Docker 

```bash
docker compose up --build
```

O container sobe a interface Vite com *hot-reload* em `http://localhost:5173` e a API Express em `http://localhost:3001`, persistindo o banco SQLite em `./data`. Para encerrar, use `Ctrl+C` ou `docker compose down`.

## Executar localmente

Requer Node.js `>= 22.12`.

```bash
npm install
npm run dev
```

Para validar tipagem, build de produção e lint:

```bash
npm run build
npm run lint
```

## Fluxo integrado

1. **Cadastro (`/`) e Login (`/login`):** cria a conta com senha protegida por hash `scrypt` (ou autentica usuário existente), salva a sessão ativa em `localStorage` (`forma.current-user`) e direciona imediatamente para `/busca`.
2. **Busca e Match (`/busca`):** consulta caronas futuras com vagas disponíveis em `GET /api/caronas/busca`, sugere cidades cadastradas (`GET /api/caronas/cidades`) e ordena por compatibilidade, horário ou menor valor por pessoa.
3. **Pagamento e Divisão de Custos (`/pagamento`):** apresenta o resumo completo da viagem (incluindo veículo, valor total da viagem, divisão entre passageiros, valor unitário e total proporcional aos lugares reservados) com simulação via Pix ou cartão.
4. **Confirmação (`/confirmada`):** aciona `POST /api/caronas/:id/reservar`, abate atomicamente as vagas reservadas em `vagas_ocupadas` no SQLite e gera o código único da reserva (`FRM-XXXXXX`).

## Persistência e reinicialização para baterias de testes

O arquivo `data/users.sqlite` é criado automaticamente ao iniciar a API (não é versionado no Git). Caso não existam caronas futuras no banco, `seedCaronas()` popula automaticamente 12 viagens de demonstração com datas relativas ao dia atual.

Para restaurar todas as vagas originais entre baterias de testes repetidos:

```bash
rm -f data/users.sqlite*
docker compose restart
```

## Organização do projeto

- `src/features/users`: páginas e serviços de cadastro, login e sessão do usuário.
- `src/features/caronas`: páginas e serviços de busca, integração de pagamento e confirmação.
- `src/components/Pagamento`: componente visual de pagamento simulado e resumo financeiro.
- `server/database.ts`: esquema SQLite (`users` e `caronas`) e seed automático.
- `server/routes`: rotas REST `/api/users` e `/api/caronas`.

## Equipe de desenvolvimento

- **GP do time de dev:** Tiago Secundo Santos
- **Dev 1 (tela de cadastro):** Hudson Jr Xavier da Silva
- **Dev 2 (tela de busca):** Nadson Nascimento Santos
- **Dev 3 (tela de pagamento):** Helen Geovanna Gonçalves
- **Dev 4 (integração):** Augusto Henrique Santos de Oliveira

