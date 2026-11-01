"""Gera precos.js (portfólio com preço ao consumidor) para o Apresentador de Lentes.

Fontes:
  - Portiolio de lentes/planilhas/Inoovax 2026 - preco ao cliente.xlsx (aba "Lentes")
  - Portiolio de lentes/tabela inoovax fast.pdf (lentes prontas; transcrita abaixo em FAST)

Só lê colunas de produto, faixa de grau e preço AO CLIENTE. As colunas de observação e
conferência e a aba "Conferir" falam de custo e NÃO podem ir para o app da equipe.

Uso: python3 ferramentas/gerar_precos.py   (rodar dentro de APRESENTADOR-LENTES)
"""
import json
from pathlib import Path

import openpyxl

AQUI = Path(__file__).resolve().parent.parent
PLANILHA = AQUI.parent / "Portiolio de lentes" / "planilhas" / "Inoovax 2026 - preco ao cliente.xlsx"

MATERIAL = {"1.50": "cr39", "1.56": "156", "1.59": "poly", "1.60": "160", "1.67": "167", "1.74": "174"}
LENTE = {"Advanced Pro": "advanced-pro", "Advanced": "advanced", "Plus": "plus", "Light": "light",
         "Office": "office", "Driver": "driver", "Relax": "relax", "Single Vision": "single-vision"}
TRAT = {"Verniz": "Verniz (sem antirreflexo)",
        "Diamond Green Total": "Diamond Green Total",
        "Diamond Blue Total": "Diamond Blue Total (com filtro azul)",
        "Diamond Green Externo": "Diamond Green Externo",
        "Diamond Blue Externo": "Diamond Blue Externo (com filtro azul)"}

# Tabela Inoovax Fast (lentes prontas). esf/cil = [mínimo, máximo]; cil "2.25 à -4.00" = [-4, -2.25]
FAST = [
    # nome, material, cor, tratamento, esf, cil, preço
    ("VS Inoovax Fast 1.56 Filtro Azul", "156", "Incolor", "Filtro azul", [-4, 4], [-2, 0], 299.99),
    ("VS Inoovax Fast 1.59 Poli Filtro Azul", "poly", "Incolor", "Filtro azul", [-4, 4], [-2, 0], 350.00),
    ("VS Inoovax Fast 1.56 AR Verde", "156", "Incolor", "Antirreflexo verde", [-4, 2], [-2, 0], 250.99),
    ("VS Inoovax Fast 1.59 Poli AR Verde", "poly", "Incolor", "Antirreflexo verde", [-4, 2], [-2, 0], 299.99),
    ("VS Inoovax Fast 1.56 Filtro Azul Cil Est", "156", "Incolor", "Filtro azul", [-4, 0], [-4, -2.25], 350.00),
    ("VS Inoovax Fast 1.59 Poli AR Verde Cil Est", "poly", "Incolor", "Antirreflexo verde", [-4, 0], [-4, -2.25], 420.00),
    ("VS Inoovax Fast 1.56 Fotossensível AR Verde", "156", "Fotossensível", "Antirreflexo verde", [-4, 2], [-2, 0], 579.99),
    ("VS Inoovax Fast 1.56 Fotossensível AR Verde Cil Est", "156", "Fotossensível", "Antirreflexo verde", [-4, 0], [-4, -2.25], 579.99),
    ("VS Inoovax Fast 1.56 Fotossensível Filtro Azul", "156", "Fotossensível", "Filtro azul", [-4, 2], [-2, 0], 650.00),
    ("VS Inoovax Fast 1.56 Fotossensível Filtro Azul Cil Est", "156", "Fotossensível", "Filtro azul", [-4, 0], [-4, -2.25], 700.00),
    ("VS Inoovax Fast 1.59 Poli Fotossensível Filtro Azul", "poly", "Fotossensível", "Filtro azul", [-4, 2], [-2, 0], 1195.00),
    ("VS Inoovax Fast 1.59 Poli Fotossensível Filtro Azul Cil Est", "poly", "Fotossensível", "Filtro azul", [-4, 0], [-4, -2.25], 1290.00),
    ("VS Inoovax Fast 1.67 AR Verde", "167", "Incolor", "Antirreflexo verde", [-4, 4], [-2, 0], 1295.00),
    ("VS Inoovax Fast 1.67 AR Verde Cil Est", "167", "Incolor", "Antirreflexo verde", [-10, -4.25], [-4, -2.25], 1495.00),
    ("VS Inoovax Fast 1.67 AR Filtro Azul", "167", "Incolor", "Antirreflexo + filtro azul", [-4, -3], [-2, 0], 1515.00),
    ("VS Inoovax Fast 1.67 AR Filtro Azul Cil Est", "167", "Incolor", "Antirreflexo + filtro azul", [-10, -4.25], [-4, -2.25], 1615.00),
    ("VS Inoovax Fast 1.74 AR Verde Cil Est", "174", "Incolor", "Antirreflexo verde", [-10, -3], [-3, 0], 3240.00),
]
EASY = [
    ("Inoovax Easy 1.56 Filtro Azul AR Externo", "156", "Incolor", [-6, 6], [-4, 0], 799.00),
    ("Inoovax Easy 1.56 Fotossensível Filtro Azul AR Externo", "156", "Fotossensível", [-6, 6], [-4, 0], 1145.00),
    ("Inoovax Easy 1.59 Poli Filtro Azul AR Externo", "poly", "Incolor", [-8, 8], [-5, 0], 1770.00),
    ("Inoovax Easy 1.59 Poli Fotossensível Filtro Azul AR Externo", "poly", "Fotossensível", [-8, 8], [-5, 0], 1980.00),
]
MULT = [
    ("Multifocal pronta Incolor Filtro Azul", None, "Incolor", 450.00),
    ("Multifocal pronta Fotossensível Filtro Azul", None, "Fotossensível", 600.00),
    ("Multifocal pronta Poli Filtro Azul", "poly", "Incolor", 800.00),
    # a tabela repete "MULT POLI FILTRO AZUL" a R$ 1.100,00: fica de fora até o dono dizer o que é
]


def faixa(a, b):
    return None if a is None or b is None else [float(a), float(b)]


def main():
    wb = openpyxl.load_workbook(PLANILHA, read_only=True, data_only=True)
    linhas = list(wb["Lentes"].iter_rows(values_only=True))
    cab = linhas[0]
    precos = []
    for bruta in linhas[1:]:
        r = dict(zip(cab, bruta))
        if not r.get("linha") or r.get("preco") is None:
            continue
        precos.append({
            "linha": r["linha"], "lente": LENTE.get(r["linha"]), "tipo": r["tipo"],
            "material": MATERIAL[str(r["indice"])], "cor": r["variante"], "trat": TRAT[r["tratamento"]],
            "esf": faixa(r["esferico_min"], r["esferico_max"]), "cil": faixa(r["cilindrico_min"], r["cilindrico_max"]),
            "adicao": faixa(r["adicao_min"], r["adicao_max"]), "preco": round(float(r["preco"]), 2), "par": True,
        })
    for nome, mat, cor, trat, esf, cil, preco in FAST:
        precos.append({"linha": "Fast", "lente": "fast", "tipo": "Visão simples (pronta)", "nome": nome,
                       "material": mat, "cor": cor, "trat": trat, "esf": esf, "cil": cil, "adicao": None,
                       "preco": preco, "pronta": True})
    for nome, mat, cor, esf, cil, preco in EASY:
        precos.append({"linha": "Easy", "lente": "easy", "tipo": "Multifocal (pronta)", "nome": nome,
                       "material": mat, "cor": cor, "trat": "Filtro azul + AR externo", "esf": esf, "cil": cil,
                       "adicao": None, "preco": preco, "pronta": True})
    for nome, mat, cor, preco in MULT:
        precos.append({"linha": "Multifocal pronta", "lente": None, "tipo": "Multifocal (pronta)", "nome": nome,
                       "material": mat, "cor": cor, "trat": "Filtro azul", "esf": None, "cil": None,
                       "adicao": None, "preco": preco, "pronta": True})

    corpo = ",\n".join("  " + json.dumps(p, ensure_ascii=False) for p in precos)
    (AQUI / "precos.js").write_text(
        "// Portfólio com PREÇO AO CONSUMIDOR. Gerado por ferramentas/gerar_precos.py — não editar à mão.\n"
        "// Fontes: planilha 'Inoovax 2026 - preco ao cliente.xlsx' e 'tabela inoovax fast.pdf'.\n"
        "// Nunca colocar custo aqui: este arquivo vai para o tablet da equipe.\n"
        f"const PRECOS = [\n{corpo},\n];\n", encoding="utf-8")
    print(f"{len(precos)} preços gravados em precos.js")


if __name__ == "__main__":
    main()
