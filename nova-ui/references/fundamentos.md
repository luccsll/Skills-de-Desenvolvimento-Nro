# Nova UI — Fundamentos

Fonte completa: `fonte/tokens.css` (variáveis) e `fonte/base.css` (utilitários). Na dúvida, `grep` nesses arquivos.

## Tokens em três camadas

| Camada | Prefixo | Uso |
|---|---|---|
| Primitivos | `--nro-*` | Paleta e escalas brutas. **Não use direto** em telas. |
| Semânticos | `--nova-*` | Papel do valor (fundo, texto, borda, ação, status). **É o que o CSS das telas usa.** |
| Componente | `--nova-btn-*`, `--nova-input-*`… | Definidos em cada componente, apontando para os semânticos. |

Padrão: **light mode** (`<html data-theme="light">`). Densidade opcional: `data-density="compact|comfortable"`.

## Paleta oficial da marca

| Cor | Hex | Primitivo | Uso semântico |
|---|---|---|---|
| Azul | `#2F509F` | `--nro-blue-700` | `--nova-color-brand-700` (hover de ação) |
| Navy | `#283272` | `--nro-blue-800` | `--nova-color-brand-800/900`, `--nova-accent-navy`, `--nova-color-bg-brand` |
| Azul médio | `#3869B1` | `--nro-blue-500` | escala |
| Azul royal | `#295BA7` | `--nro-blue-600` | `--nova-color-brand-500` — **cor de ação** (botões, links, seleção) |
| Teal | `#13B2AC` | `--nro-teal-500` | `--nova-accent-teal` |
| Lime | `#DBDD3B` | `--nro-lime-400` | `--nova-accent-lime` — **só decorativo** (contraste baixo) |

## Semânticos mais usados

| Para | Token |
|---|---|
| Fundo da página / superfície (card, modal) / sutil | `--nova-color-bg-page` · `--nova-color-bg-surface` · `--nova-color-bg-subtle` |
| Texto principal / secundário / apagado | `--nova-color-text-primary` · `--nova-color-text-secondary` · `--nova-color-text-muted` |
| Borda / borda forte / foco | `--nova-color-border` · `--nova-color-border-strong` · `--nova-color-border-focus` |
| Ação / link | `--nova-color-brand-500` · `--nova-color-link` |
| Item selecionado | `--nova-color-selected` |
| Sucesso / erro / alerta / info | `--nova-success-bg` + `--nova-success-text` · `--nova-danger-*` · `--nova-warning-*` · `--nova-info-*` |
| Fundo de modal/drawer | `--nova-color-overlay` (branco 70% — não trocar por preto) |
| Cor por sistema | `--nova-sys-protheus` · `--nova-sys-rm` · `--nova-sys-fluig` · `--nova-sys-kcor` · `--nova-sys-securos` · `--nova-sys-backoffice-n3` |

## Tipografia

Fonte da Nova UI: Inter (fallback Segoe UI, Roboto, Arial). Base 14px, igual ao Fluig.

| Token | px | Uso |
|---|---|---|
| `--nova-font-size-xs` | 11 | rótulos de card, legendas |
| `--nova-font-size-sm` | 13 | texto de apoio |
| `--nova-font-size-base` | 14 | texto padrão |
| `--nova-font-size-md` | 16 | título de card |
| `--nova-font-size-lg` | 20 | título de seção |
| `--nova-font-size-xl` | 28 | número de KPI |
| `--nova-font-size-2xl` | 32 | título de página |

Classes prontas: `.text-display · .text-h1 · .text-h2 · .text-h3 · .text-h4 · .text-body · .text-body-lg · .text-body-sm · .text-caption · .text-overline · .text-kpi · .text-mono · .text-numeric · .text-secondary · .text-muted · .text-truncate · .text-clamp-2 · .text-prose`.

Pesos: `--nova-font-weight-regular|medium|semibold|bold` (400–700).

## Espaçamento (base 4px)

Tokens: `--nova-space-1` 4 · `-2` 8 · `-3` 12 · `-4` 16 · `-5` 20 · `-6` 24 · `-8` 32 · `-10` 40 · `-12` 48 · `-16` 64.

Utilitários: `.margin-{lado}-{n}` e `.pad-{lado}-{n}`, lado = `top|bottom|left|right|x|y` (ou nenhum = 4 lados), n = `0` 0 · `1` 4px · `2` 8px · `3` 12px · `4` 16px · `5` 24px · `6` 32px. Ex.: `.margin-top-3`, `.pad-x-4`. (Atenção: nos utilitários `5` = 24px e `6` = 32px, diferente dos tokens.)

## Raio, sombra, camadas

- Raio: `--nova-radius-xs` 4 · `-sm` 6 (inputs, botões) · `-md` 10 (cards, menus) · `-lg` 14 (containers, modais) · `-pill`.
- Elevação: `--nova-elevation-1` (card) · `-2` (hover) · `-3` (menus) · `-4` (modais).
- z-index: `--nova-z-sticky` 20 · `-modal` 1000 · `-menu` 1100 · `-toast` 1300 · `-tooltip` 1400.

## Layout

- Área: `.nova-app` (fonte, fundo e cor numa área, sem mexer no body do Fluig).
- Containers: `.page-container` + `--sm` 640 · `--md` 880 (formulários Fluig) · `--lg` 1200 (consulta) · `--xl` 1440 · `--max` · `--fluid`.
- Grid de formulário: `.form-grid` com `.form-col-1…12` e `.form-col-sm|md|lg|xl-1…12`. `.form-grid--compact` para menos espaço.
- Breakpoints: sm 576 · md 768 · lg 992 · xl 1200 · 2xl 1400.
- Estrutura de formulário: `.form-section` (+ `__header`, `__title`, `__desc`), `.fieldset` (+ `--bordered`, `__legend`), `.form-actions` (+ `--between`, `--start`, `--sticky`, `__spacer`), `.form-group` / `.form-label` para controles que não são `.field` (checkbox, radio, switch, upload, OTP).

## Ícones

Material Symbols Rounded (Google Fonts), nome em inglês de fonts.google.com/icons:

```html
<span class="icon" aria-hidden="true">receipt_long</span>
```

Modificadores: `.icon--xs|sm|md|lg|xl`, `.icon--filled`, `.icon--bold`, `.icon--light`. Ícone em bloco colorido: `.icon-tile` + `--sm|lg|xl|2xl`, `--teal|success|warning|danger|neutral`, `--round`.

## Outros utilitários

`.justify-start|center|end|between` · `.align-center` · `.sr-only` · `.focus-ring` · `.state-layer` · `.anim-fade-in|scale-in|slide-up|slide-down|slide-in-right|pop|pulse|spin`.
