---
description: Como implantar o site na Netlify
---

Para subir o projeto na Netlify, siga estes passos:

### 1. Banco de Dados Online (Obrigatório)
A Netlify não hospeda bancos de dados MySQL. Você precisará de um banco online.
- **Opções Gratuitas**: [Railway](https://railway.app/), [Aiven](https://aiven.io/), ou [PlanetScale](https://planetscale.com/).
- Crie o banco e execute o arquivo `database.sql` nele para criar as tabelas.

### 2. Preparar o Repositório
- Suba seu código para um repositório no **GitHub**, **GitLab** ou **Bitbucket**.

### 3. Configurar na Netlify
1. Vá para o [Painel da Netlify](https://app.netlify.com/).
2. Clique em **Add new site** > **Import an existing project**.
3. Selecione seu repositório.
4. Em **Build settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next` (a Netlify detecta Next.js automaticamente).

### 4. Variáveis de Ambiente (CRÍTICO)
Vá em **Site configuration** > **Environment variables** e adicione as variáveis do seu arquivo `.env`:
- `DB_HOST`: Host do seu novo banco de dados online.
- `DB_USER`: Usuário do banco.
- `DB_PASSWORD`: Senha do banco.
- `DB_NAME`: Nome do banco.
- `DISCORD_TOKEN`: Seu token do bot (se necessário no frontend).

### 5. Deploy
- Clique em **Deploy site**. A Netlify vai compilar e gerar um link `.netlify.app`.
