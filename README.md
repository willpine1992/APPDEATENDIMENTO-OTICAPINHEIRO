# Apresentador de Lentes · Ótica Pinheiro

Ferramenta de atendimento para o vendedor explicar as lentes Inoovax ao cliente e montar o orçamento:
tipos de lente e mapa de nitidez, tecnologias, materiais e espessura (receita OD/OE), simulador de tratamentos
e orçamento com a tabela de preço ao consumidor, enviado pelo WhatsApp.

Página estática (HTML, CSS e JavaScript), sem servidor. Funciona no computador, no iPad e no celular.

## Atualizar os preços

Os preços ficam em `precos.js`, gerado a partir da planilha de preço ao cliente:

```
python3 ferramentas/gerar_precos.py
```

Só preço ao consumidor entra neste repositório (ele é público).
