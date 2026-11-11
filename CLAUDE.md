# Pizza Builder 3D

Site interativo para montar uma pizza. O utilizador escolhe a massa, o molho, o queijo e os ingredientes, vê a pizza a montar-se em 3D à sua frente e, no fim, preenche um pequeno formulário de pedido.

Inspiração: um site de hambúrgueres em que se clica nos ingredientes e o hambúrguer vai ganhando camadas, com um cartão de pedido no fim ("Good food. Coming your way.").

## Estado atual

O projeto ainda está no início. Se não existir `package.json`, cria o projeto com `npm create vite@latest . -- --template vanilla-ts` e instala o `three` e os `@types/three`. Não adiciones outras dependências sem perguntar.

## Tecnologia

- **Vite** + **TypeScript** (sem framework)
- **Three.js** para a cena 3D
- **HTML + CSS simples** para toda a interface (painel, botões, formulário)
- **Vitest** para testes
- Sem backend. O pedido é simulado: no fim mostra-se uma confirmação, sem enviar nada para lado nenhum.

Não usar React, Next.js nem bibliotecas de UI. Se um dia for preciso, decide-se em conjunto.

## Comandos

```bash
npm run dev       # servidor local
npm run build     # build de produção (corre o tsc primeiro)
npm run preview   # pré-visualizar o build
npm run test      # testes (Vitest)
```

Antes de dar uma tarefa por terminada, corre `npm run build` e `npm run test`. Os dois têm de passar.

## Estrutura

```
src/
  main.ts              # arranque: liga o estado, a cena e a interface
  data/
    catalog.ts         # massas, molhos, queijos, ingredientes (id, nome, preço, cor, modelo)
  state/
    order.ts           # estado do pedido + cálculo do preço (sem Three.js)
    order.test.ts
  scene/
    scene.ts           # renderer, câmara, luzes, ciclo de animação
    pizza.ts           # base, molho e queijo
    toppings.ts        # colocar e retirar ingredientes na pizza
    animations.ts      # queda e entrada dos ingredientes
  ui/
    panel.ts           # lista de escolhas e botões
    summary.ts         # resumo do pedido e total
    form.ts            # formulário final e confirmação
  styles/
    main.css
public/
  models/              # modelos .glb (comprimidos)
  textures/
```

## Regras de arquitetura

- **O estado manda, a cena obedece.** `state/order.ts` é a única fonte de verdade. A cena e a interface só leem o estado e reagem às alterações. A cena nunca altera o estado.
- **A lógica do pedido não importa nada de Three.js**, para poder ser testada sozinha.
- Os dados dos produtos ficam todos em `data/catalog.ts`. Para acrescentar um ingrediente, deve bastar acrescentar uma entrada aí (e o modelo, se houver).
- Funções pequenas, um ficheiro por responsabilidade. Sem classes gigantes.

## Acessibilidade (obrigatório)

A acessibilidade é a base do projeto, não um extra. O 3D é decoração: tudo tem de funcionar sem ele.

- Todas as escolhas são feitas com **elementos HTML reais** (`<button>`, `<input type="radio">`, `<input type="checkbox">`), nunca clicando diretamente no canvas.
- Arrastar ingredientes para a pizza (drag-and-drop) pode vir mais tarde como extra, por cima dos botões, nunca em substituição deles.
- O `<canvas>` tem `aria-hidden="true"`. Ao lado existe um resumo em texto com o que está na pizza.
- Quando se adiciona ou retira um ingrediente, anuncia-se numa região `aria-live="polite"` (ex.: "Cogumelos adicionados. Total: 11,50 €").
- Tudo funciona só com teclado, com foco visível em todos os elementos.
- Respeitar `prefers-reduced-motion`: sem animações de queda, os ingredientes aparecem logo no sítio.
- Contraste mínimo WCAG 2.2 AA (4,5:1 no texto normal).
- O formulário tem `<label>` em todos os campos e mensagens de erro ligadas com `aria-describedby`.
- Se o WebGL não estiver disponível, mostra-se uma imagem estática e o resto do site continua a funcionar.

## Cena 3D

- Vista de cima, ligeiramente inclinada (como uma pizza em cima da mesa).
- Começar com **formas simples** (cilindros, esferas, discos) e cores do catálogo. Os modelos `.glb` vêm depois, substituindo as formas sem mudar o resto do código.
- Usar `InstancedMesh` para ingredientes repetidos (fatias de pepperoni, azeitonas, etc.).
- A posição de cada peça é calculada com uma semente fixa, para a mesma pizza ficar sempre igual (sem saltos ao re-renderizar).
- Limitar o `pixelRatio` a 2 no máximo.
- Libertar a memória (`dispose()`) das geometrias e materiais que se retiram.
- Modelos `.glb` com compressão (Draco ou meshopt) e, idealmente, menos de 500 KB cada.
- O ciclo de animação para quando o separador não está visível.

## Convenções

- Código (variáveis, funções, ficheiros) em **inglês**. Texto visível ao utilizador em **português de Portugal**.
- Preços em euros, formatados com `Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })`.
- Guardar os preços em cêntimos (números inteiros) para evitar erros de arredondamento.
- TypeScript em modo `strict`. Nada de `any`.
- Comentários só quando o "porquê" não é óbvio.

## Testes

- Testar sempre `state/order.ts`: adicionar, retirar, limites de ingredientes e cálculo do total.
- A cena 3D não precisa de testes automáticos. Verifica-se no browser.

## Forma de trabalhar

- Explica as alterações em linguagem simples, sem jargão. O dono do projeto vem de PHP/WordPress e está a aprender Three.js.
- Avança em passos pequenos que se possam ver a funcionar no browser.
- Antes de uma alteração grande (nova dependência, mudança de estrutura), descreve o plano e espera pela aprovação.
