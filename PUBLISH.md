# Publicar no npm

## Erro "Scope not found" (404)

Se aparecer **`Scope not found`** ao publicar, o escopo `@zikka` ainda não existe no npm. Escolha uma opção:

### A) Usar seu usuário npm (mais rápido)

No `package.json`, troque o nome para **`@SEU_USUARIO_NPM/vanta.js`** (ex.: se seu usuário for `joao`, use `@joao/vanta.js`).  
Não precisa criar organização; qualquer um pode publicar em `@seu-usuario/...`.

### B) Manter @zikka/vanta.js

Crie a organização no npm: [npmjs.com/org/create](https://www.npmjs.com/org/create) → nome **zikka**. Depois publique de novo.

---

## Pré-requisitos

1. **Conta no npm** – [npmjs.com](https://www.npmjs.com/signup)
2. **Escopo** – Use `@seu-usuario/vanta.js` (troque no package.json) **ou** crie a org `zikka` em [npmjs.com/org/create](https://www.npmjs.com/org/create)
3. **Autenticação** – O npm exige **2FA (autenticação em dois fatores)** ou **token de acesso** para publicar:
   - **Opção A:** Ative 2FA em [npmjs.com → Account → Two-Factor Authentication](https://www.npmjs.com/settings/~/account). Ao rodar `npm publish`, o npm vai pedir o código do app (ex.: Google Authenticator).
   - **Opção B:** Crie um **token de publicação** em [npmjs.com → Access Tokens → Generate New Token](https://www.npmjs.com/settings/~/tokens): tipo **Automation** ou **Granular** com permissão "Read and write" para pacotes. Use esse token no lugar da senha quando rodar `npm login`.

## Passos para publicar

### 1. Login no npm (terminal)

```bash
npm login
```

Use seu usuário, senha e e-mail do npm.

### 2. Corrigir avisos do package.json (opcional)

```bash
npm pkg fix
```

### 3. Conferir o pacote

```bash
npm run build
npm pack --dry-run
```

`npm pack --dry-run` lista os arquivos que seriam publicados (deve incluir `dist/` e `src/types/`).

### 4. Publicar

**Primeira vez (público):**
```bash
npm publish --access public
```

Pacotes com escopo (`@zikka/...`) são privados por padrão; `--access public` deixa o pacote público e gratuito.

**Próximas versões:** altere a versão no `package.json` e rode:
```bash
npm version patch   # 0.5.24 → 0.5.25
npm publish
```

## Como outros vão usar

Depois de publicado:

```bash
npm i @zikka/vanta.js
```

**Com TypeScript / bundler:**
```ts
import VANTA from '@zikka/vanta.js';

// Ex.: efeito FOG
const effect = VANTA.FOG({
  el: '#my-element',
  highlightColor: 0xffc300,
  midtoneColor: 0xff1f00,
  lowlightColor: 0x2d00ff,
  baseColor: 0xffebeb,
});

// Destruir quando não precisar mais
effect.destroy();
```

**Importar um efeito específico (menor bundle):**
```ts
import VANTA from '@zikka/vanta.js/dist/vanta.fog.min';
```

**No HTML (Three.js precisa estar carregado antes):**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
<script src="node_modules/@zikka/vanta.js/dist/vanta.fog.min.js"></script>
<script>
  VANTA.FOG({ el: '#bg', highlightColor: 0xffc300 });
</script>
```
