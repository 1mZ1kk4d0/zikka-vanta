# Instalar @zikkado/vanta.js

Pacote publicado em: https://www.npmjs.com/package/@zikkado/vanta.js

## Se der 404 ou "Access token expired"

No projeto onde vai instalar (ex.: SLS-FRONT), rode na ordem:

### 1. Limpar token e cache do npm

```bash
npm logout
npm cache clean --force
```

### 2. Garantir que está no registry público

```bash
npm config get registry
```

Deve ser `https://registry.npmjs.org/`. Se não for:

```bash
npm config set registry https://registry.npmjs.org/
```

### 3. Instalar o pacote

```bash
npm i @zikkado/vanta.js
```

Se ainda der 404, force o registry na hora da instalação:

```bash
npm i @zikkado/vanta.js --registry https://registry.npmjs.org/
```

---

## Uso

```ts
import VANTA from '@zikkado/vanta.js';

const effect = VANTA.FOG({
  el: '#my-element',
  highlightColor: 0xffc300,
  midtoneColor: 0xff1f00,
  baseColor: 0xffebeb,
});

// effect.destroy() quando não precisar mais
```

**Importante:** carregue o Three.js antes (no HTML ou como dependência do projeto).
