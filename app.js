// Apresentador de Lentes — Ótica Pinheiro
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const porId = (id) => LENTES.find((l) => l.id === id);
const matPorId = (id) => MATERIAIS.find((m) => m.id === id);
const tratPorId = (id) => TRATAMENTOS.find((t) => t.id === id);
const num = (v, casas = 2) => v.toFixed(casas).replace(".", ",");
const grau = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + num(Math.abs(v));
const CRITERIOS = ["Visão de longe", "Visão intermediária", "Visão de perto", "Conforto", "Adaptação"];
const DIAMOND = ["ar", "hidro", "oleo", "estat", "risco"];

/* ===================== Estado (guardado no aparelho) ===================== */
const PADRAO = {
  aba: "lentes", tipo: "multifocal", lente: "advanced-pro", campo: "mapa", fotoPorLente: {}, tecLente: null, tecSel: "ff",
  sobrepor: false, sobreMats: ["cr39", "167"],
  rx: { od: { esf: -2, cil: 0, eixo: 0 }, oe: { esf: -2, cil: 0, eixo: 0 }, ad: 0 }, olho: null, rxCampo: "od.esf",
  diam: 58, perfil: [], material: "cr39",
  trat: [], foco: "ar", cena: "noite", comparar: true, cor: 0, luz: "sol", uso: 6,
  escolha: { lente: null, material: null }, nome: "", fone: "",
  opcoes: [], cfg: null, cfgManual: false, orcVista: "montar",
};
const CHAVE = "apresentador-lentes-v1";
let estado;
try { estado = { ...structuredClone(PADRAO), ...JSON.parse(localStorage.getItem(CHAVE) || "{}") }; } catch { estado = structuredClone(PADRAO); }
// versão antiga guardava um grau só (esf/cil): vira a mesma receita nos dois olhos
if (estado.esf !== undefined) {
  const o = { esf: estado.esf, cil: estado.cil || 0, eixo: 0 };
  estado.rx = { od: { ...o }, oe: { ...o }, ad: 0 };
  delete estado.esf; delete estado.cil;
}
estado.escolha = { ...PADRAO.escolha, ...estado.escolha };
// toda mudança de estado passa por aqui: grava no aparelho e atualiza a barra de escolhas
const salvar = () => {
  try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch { /* sem armazenamento */ }
  desenharFiltros();
};

// acao = { texto, fn }: mostra um botão no aviso (ex.: Desfazer)
function aviso(texto, acao) {
  const t = $("#toast");
  t.textContent = texto;
  t.classList.toggle("toast--acao", !!acao);
  if (acao) {
    const b = document.createElement("button");
    b.textContent = acao.texto;
    b.addEventListener("click", () => { t.classList.remove("is-on"); acao.fn(); });
    t.append(b);
  }
  t.classList.add("is-on");
  clearTimeout(aviso.timer);
  aviso.timer = setTimeout(() => t.classList.remove("is-on"), acao ? 6000 : 2200);
}

function estrelas(notas) {
  if (!notas) return "";
  const m = notas.reduce((a, b) => a + b, 0) / notas.length;
  let html = "";
  for (let i = 1; i <= 5; i++) html += `<i class="${m >= i ? "on" : m >= i - 0.5 ? "half" : ""}">★</i>`;
  return `<span class="stars" aria-label="Nota ${num(m, 1)} de 5">${html}</span>`;
}

function medidores(l) {
  if (!l.notas) return `<p class="tiny muted">Lente pronta: o portfólio do fabricante não traz notas para ela.</p>`;
  return `<div class="meters">${CRITERIOS.map((c, i) => `
    <div class="meter"><span>${c}</span><span class="meter__track"><span class="meter__fill" data-w="${l.notas[i] * 20}"></span></span><b>${num(l.notas[i], l.notas[i] % 1 ? 1 : 0)}</b></div>`).join("")}</div>`;
}
const animarMedidores = (raiz) => requestAnimationFrame(() => requestAnimationFrame(() =>
  $$(".meter__fill", raiz).forEach((f) => (f.style.width = f.dataset.w + "%"))));

/* ===================== Abas ===================== */
function irPara(aba) {
  estado.aba = aba;
  $$(".tabs [role=tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === aba)));
  $$(".panel").forEach((p) => (p.hidden = p.id !== `p-${aba}`));
  if (aba === "tratamentos") desenharSimulador();
  if (aba === "resumo") desenharOrcamento();
  if (aba === "materiais") desenharMateriais();
  window.scrollTo({ top: 0 });
  salvar();
}
$$(".tabs [role=tab]").forEach((b) => b.addEventListener("click", () => irPara(b.dataset.tab)));

const btnTela = $("#btnTela");
if (!document.documentElement.requestFullscreen) btnTela.hidden = true;
btnTela.addEventListener("click", () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen().catch(() => {});
});

/* ===================== Ícones das tecnologias ===================== */
const ICONES = {
  sp: '<path d="M16 5l2 2-2 2-2-2zM11 10l2 2-2 2-2-2zM21 10l2 2-2 2-2-2zM16 10l2 2-2 2-2-2zM6 15l2 2-2 2-2-2zM11 15l2 2-2 2-2-2zM16 15l2 2-2 2-2-2zM21 15l2 2-2 2-2-2zM26 15l2 2-2 2-2-2zM11 20l2 2-2 2-2-2zM16 20l2 2-2 2-2-2zM21 20l2 2-2 2-2-2zM16 25l2 2-2 2-2-2z"/>',
  pu: '<path d="M5 16c3-5 7-7 11-7s8 2 11 7c-3 5-7 7-11 7s-8-2-11-7z"/><circle cx="16" cy="16" r="3.5"/><path d="M3 9V4h5M29 9V4h-5M3 23v5h5M29 23v5h-5"/>',
  ff: '<path d="M11 4c9 4 12 16 5 25"/><path d="M8 7c7 4 9 13 4 20" stroke-dasharray="2 3"/>',
  ca: '<circle cx="16" cy="16" r="9"/><path d="M5 27L27 5M27 5h-6M27 5v6M5 27h6M5 27v-6"/>',
  dr: '<path d="M12 5c-6 6-6 16 0 22M20 5c6 6 6 16 0 22" stroke-dasharray="3 3"/><path d="M16 9v14"/>',
  ti: '<circle cx="16" cy="16" r="6"/><path d="M3 16l5-4v8zM29 16l-5-4v8z"/>',
  as: '<ellipse cx="16" cy="16" rx="12" ry="10"/><path d="M4 16h24M16 6v20M7 10h18M7 22h18M10 7c-2 6-2 12 0 18M22 7c2 6 2 12 0 18"/>',
  ds: '<rect x="10" y="3" width="12" height="26" rx="3"/><path d="M14 11h2.5a3.5 3.5 0 010 7H14z"/><path d="M15 25h2"/>',
  vd: '<path d="M10 16c2-3 4-4 6-4s4 1 6 4c-2 3-4 4-6 4s-4-1-6-4z"/><circle cx="16" cy="16" r="1.5"/><path d="M16 3v5M14 5l2-2 2 2M16 29v-5M14 27l2 2 2-2M3 16h5M5 14l-2 2 2 2M29 16h-5M27 14l2 2-2 2"/>',
  br: '<circle cx="16" cy="16" r="12"/><circle cx="16" cy="16" r="7" stroke-dasharray="2.5 2.5"/><path d="M5 16h7M10 14l2 2-2 2M27 16h-7M22 14l-2 2 2 2"/>',
  ia: '<rect x="8" y="8" width="16" height="16" rx="2"/><path d="M12 4v4M16 4v4M20 4v4M12 24v4M16 24v4M20 24v4M4 12h4M4 16h4M4 20h4M24 12h4M24 16h4M24 20h4"/><path d="M11.5 20l2-8 2 8M12.2 17.5h2.6M19 12v8"/>',
};
const icone = (k) => `<svg viewBox="0 0 32 32" aria-hidden="true">${ICONES[k]}</svg>`;

/* ===================== Mapa de nitidez (campo de visão) ===================== */
// fotos do mapa de nitidez: proporção (largura/altura) e altura do ponto de interesse (0 = topo, 1 = base)
const FOTOS_CAMPO = [
  { src: "img/cenas/teatro-dia.jpg", nome: "Teatro Amazonas", prop: 681 / 450, fy: 0.5 },
  { src: "img/cenas/arara.jpg", nome: "Araras", prop: 1, fy: 0.42 },
  { src: "img/cenas/onca.jpg", nome: "Onça-pintada", prop: 387 / 516, fy: 0.55 },
  { src: "img/cenas/teatro-noite.jpg", nome: "Teatro à noite", prop: 460 / 434, fy: 0.45 },
  { src: "img/cenas/harpia.jpg", nome: "Gavião-real", prop: 1100 / 1650, fy: 0.42 },
];
// contorno da lente igual ao das ilustrações do fabricante (desenhado em 700 × 513)
const CONTORNO_LENTE = "M30,120 C60,70 250,40 450,32 C560,28 640,50 670,95 C700,140 698,230 690,300 C680,390 640,460 560,495 C470,525 260,515 160,490 C70,465 20,400 8,320 C0,250 5,165 30,120 Z";

// lentes ocupacionais abrem na foto da rotina delas; depois o botão passa pelas outras
const fotosDa = (l) => (l.cena ? [l.cena, ...FOTOS_CAMPO] : FOTOS_CAMPO);
const fotoIdx = (l) => estado.fotoPorLente[l.id] ?? 0;

let uid = 0;
function campoSVG(l) {
  const id = `c${uid++}`;
  const [L, I, P] = l.notas || [5, 5, 5];
  const W = 600, H = 440, cx = 300;
  const fotos = fotosDa(l);
  const foto = fotos[fotoIdx(l) % fotos.length];
  const largo = foto.prop >= W / H;
  const iw = largo ? H * foto.prop : W, ih = largo ? H : W / foto.prop;
  const ix = (W - iw) / 2, iy = largo ? 0 : Math.min(0, Math.max(H - ih, H / 2 - foto.fy * ih));
  const img = (attrs) => `<image href="${foto.src}" x="${ix}" y="${iy}" width="${iw}" height="${ih}" preserveAspectRatio="none" ${attrs}/>`;
  const contorno = (attrs) => `<path d="${CONTORNO_LENTE}" transform="translate(9 0) scale(.83)" ${attrs}/>`;
  let zona, rotulos = "", extra = "";
  const rot = (x, y, t, anc = "middle") =>
    `<text x="${x}" y="${y}" text-anchor="${anc}" class="z-lbl">${t}</text>`;

  if (l.campo === "prog" || l.campo === "driver") {
    const hwF = 118 + 32 * L, hwI = 10 + 7 * I, hwP = 40 + 22 * P, yF = 165;
    const meio = (s) => {
      const x = (d) => cx + s * d;
      return { f: x(hwF), i: x(hwI), p: x(hwP), p2: x(hwP - 12) };
    };
    const d = meio(1), e = meio(-1);
    zona = `M${e.f},0 L${d.f},0 L${d.f},${yF - 30} C${d.f},${yF + 15} ${d.i + 22},${yF + 30} ${d.i},${yF + 58}
      L${d.i},290 C${d.i},322 ${d.p},318 ${d.p},352 L${d.p2},${H} L${e.p2},${H} L${e.p},352
      C${e.p},318 ${e.i},322 ${e.i},290 L${e.i},${yF + 58} C${e.i - 22},${yF + 30} ${e.f},${yF + 15} ${e.f},${yF - 30} Z`;
    const nomes = l.campo === "driver" ? ["ESTRADA", "Painel", "Mapa · celular"] : ["LONGE", "Meia distância", "PERTO"];
    rotulos = rot(cx, 105, nomes[0]) + rot(d.i + 14, 262, nomes[1], "start") + rot(cx, 400, nomes[2].toUpperCase());
    rotulos += `<path d="M${d.i + 10},257 h-${hwI + 4}" class="z-seta"/>`;
    if (l.campo === "driver") rotulos += rot(70, 200, "Retrovisor", "start") + rot(530, 200, "Retrovisor", "end");
  } else if (l.campo === "office") {
    zona = `M${cx - 150},48 L${cx + 150},48 C${cx + 215},70 ${cx + 235},150 ${cx + 240},210 L${cx + 262},${H} L${cx - 262},${H} L${cx - 240},210 C${cx - 235},150 ${cx - 215},70 ${cx - 150},48 Z`;
    rotulos = rot(cx, 66, "longe: use o óculos de rua") + rot(cx, 125, "ATÉ 2–4 METROS") + rot(cx, 245, "COMPUTADOR") + rot(cx, 375, "PERTO · PAPEL");
  } else {
    zona = `M0,0 H${W} V${H} H0 Z`;
    if (l.campo === "relax") {
      extra = `<ellipse cx="${cx}" cy="372" rx="190" ry="70" class="z-apoio"/>`;
      rotulos = rot(cx, 150, "VISÃO SIMPLES NÍTIDA") + rot(cx, 380, "APOIO PARA PERTO");
    } else {
      rotulos = l.campo === "pronta"
        ? rot(cx, 205, "VISÃO SIMPLES") + `<text x="${cx}" y="236" text-anchor="middle" class="z-sub">lente pronta, de estoque</text>`
        : rot(cx, 205, "NÍTIDA ATÉ A BORDA") + `<text x="${cx}" y="236" text-anchor="middle" class="z-sub">All Vision · visão simples freeform</text>`;
    }
  }
  return `<svg class="field-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mapa de nitidez da lente ${l.nome}">
    <defs>
      <clipPath id="${id}l">${contorno("")}</clipPath>
      <clipPath id="${id}z"><path d="${zona}"/></clipPath>
      <filter id="${id}b" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="9"/></filter>
    </defs>
    <style>
      .z-lbl{font:700 15px Inter,system-ui,sans-serif;letter-spacing:.08em;fill:#fff;paint-order:stroke;stroke:rgba(13,26,19,.65);stroke-width:4px}
      .z-sub{font:500 13px Inter,system-ui,sans-serif;fill:#fff;paint-order:stroke;stroke:rgba(13,26,19,.65);stroke-width:4px}
      .z-seta{stroke:#fff;stroke-width:2;fill:none}
      .z-apoio{fill:rgba(111,209,197,.28);stroke:#6fd1c5;stroke-width:2;stroke-dasharray:6 5}
    </style>
    <g clip-path="url(#${id}l)">
      ${img(`filter="url(#${id}b)"`)}
      <rect width="${W}" height="${H}" fill="rgba(240,236,226,.38)"/>
      ${img(`clip-path="url(#${id}z)"`)}
      <path d="${zona}" fill="none" stroke="#6fd1c5" stroke-width="3" stroke-dasharray="8 6"/>
      ${extra}${rotulos}
    </g>
    ${contorno(`fill="none" stroke="${l.cor}" stroke-width="9.6"`)}
  </svg>`;
}

/* ===================== 1. Tipos de lente ===================== */
function desenharTipos() {
  $("#segTipo").innerHTML = Object.entries(TIPOS).map(([k, t]) => `
    <button role="radio" aria-checked="${k === estado.tipo}" class="${k === estado.tipo ? "is-on" : ""}" data-tipo="${k}">
      ${t.nome}<small>${LENTES.filter((l) => l.tipo === k).length} linhas</small></button>`).join("");
  $("#tipoResumo").textContent = TIPOS[estado.tipo].resumo;
  $("#lensList").innerHTML = LENTES.filter((l) => l.tipo === estado.tipo).map((l) => `
    <button class="lens-item ${l.id === estado.lente ? "is-on" : ""}" data-id="${l.id}" style="--c:${l.cor}">
      <i></i><div><strong>${l.nome}${estado.escolha.lente === l.id ? " ✓" : ""}</strong><span>${l.tag}</span></div>${estrelas(l.notas)}
    </button>`).join("");
  // no celular e no iPad a lista vira carrossel: mantém a lente escolhida à vista
  const box = $("#lensList"), on = $(".lens-item.is-on", box);
  if (on && box.scrollWidth > box.clientWidth) {
    const ini = on.offsetLeft - box.offsetLeft, fim = ini + on.offsetWidth;
    if (ini < box.scrollLeft || fim > box.scrollLeft + box.clientWidth) box.scrollTo({ left: ini - 16, behavior: "smooth" });
  }
}
$("#segTipo").addEventListener("click", (e) => {
  const b = e.target.closest("[data-tipo]");
  if (!b) return;
  estado.tipo = b.dataset.tipo;
  if (porId(estado.lente).tipo !== estado.tipo) estado.lente = LENTES.find((l) => l.tipo === estado.tipo).id;
  estado.tecLente = null;
  desenharLentes();
});
$("#lensList").addEventListener("click", (e) => {
  const b = e.target.closest("[data-id]");
  if (!b) return;
  estado.lente = b.dataset.id;
  estado.tecLente = null;
  desenharLentes();
});

function desenharDetalhe() {
  const l = porId(estado.lente);
  const temFoto = l.id !== "kids" && l.id !== "fast";
  if (!temFoto) estado.campo = "mapa";
  const specs = [
    ["Diâmetro", "75 mm"], ["Altura de montagem", l.altura],
    ...(l.adicao ? [["Adição", l.adicao]] : []),
    ...(l.alcance ? [["Alcance", l.alcance]] : []),
    ...(l.potencia ? [["Apoio para perto", l.potencia]] : []),
    ["Materiais", l.materiais.map((m) => matPorId(m).indice === "1.59" ? "Poly" : matPorId(m).id === "cr39" ? "CR-39" : matPorId(m).indice).join(" · ")],
    ["Marcação", l.marcacao],
    ...(apartirDe(l.id) ? [["Preço ao cliente", `a partir de ${reais(apartirDe(l.id))}`]] : []),
  ];
  const escolhida = estado.escolha.lente === l.id;
  const tl = estado.tecLente && l.tecs.includes(estado.tecLente) ? estado.tecLente : null;
  $("#lensDetail").innerHTML = `
    <div class="detail-top">
      <div class="card field-card">
        <div class="field-head">
          <div><p class="eyebrow">${l.campo === "sv" || l.campo === "relax" ? "Onde a lente é nítida" : "Mapa de nitidez"}</p></div>
          ${temFoto ? `<div class="chips">
            <button data-campo="mapa" class="${estado.campo === "mapa" ? "is-on" : ""}">Simulação</button>
            <button data-campo="foto" class="${estado.campo === "foto" ? "is-on" : ""}">Imagem do fabricante</button></div>` : ""}
        </div>
        ${estado.campo === "foto" ? `<img class="field-fab" src="img/lentes/lente-${l.id}.jpg" alt="Ilustração do fabricante do campo de visão da lente ${l.nome}">`
          : `<div class="field-sim">${campoSVG(l)}
            <button class="field-troca" id="btnFoto" aria-label="Trocar a imagem">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5.3M20 4v5h-5M20 12a8 8 0 0 1-14 5.3M4 20v-5h5"/></svg>
              Trocar imagem <small>${(fotoIdx(l) % fotosDa(l).length) + 1}/${fotosDa(l).length} · ${fotosDa(l)[fotoIdx(l) % fotosDa(l).length].nome}</small></button></div>`}
        <div class="field-legend">
          <span><i style="background:#6fd1c5"></i>Área nítida</span>
          <span><i style="background:#cfc8b8"></i>Área desfocada (laterais)</span>
          <span>Quanto mais larga a área nítida, menos a pessoa precisa mexer a cabeça.</span>
        </div>
      </div>
      <div class="card info" style="--c:${l.cor}">
        <p class="eyebrow">${TIPOS[l.tipo].nome} · Inoovax</p>
        <h2>${l.nome}</h2>
        <p class="tag">${l.tag}</p>
        ${estrelas(l.notas)}
        <p class="desc">${l.desc}</p>
        <p class="para"><strong>Indicada para:</strong> ${l.para}</p>
        <div class="acts">${l.atividades.map((a) => `<span>${a}</span>`).join("")}</div>
        <div style="--c:${l.cor}">${medidores(l)}</div>
        <dl class="specs">${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
        <div class="actions">
          <button class="btn ${escolhida ? "is-on" : "btn--primary"}" id="btnEscolher">${escolhida ? "✓ Lente escolhida" : "Escolher esta lente"}</button>
          <button class="btn btn--soft" id="btnComparar">Comparar com outra</button>
        </div>
      </div>
    </div>
    <div class="detail-bottom">
      <div class="card">
        <div class="field-head"><p class="eyebrow">Tecnologias desta lente</p><span class="tec-count">${l.tecs.length} de ${ORDEM_TEC.length}</span></div>
        <div class="tec-row">${ORDEM_TEC.map((k) => `
          <button class="tec ${l.tecs.includes(k) ? "" : "is-off"} ${tl === k ? "is-sel" : ""}" data-tec="${k}">
            <span class="ic">${icone(k)}</span>${TECNOLOGIAS[k].nome}</button>`).join("")}</div>
        <div class="tec-explica" id="tecExplica">${tl ? `<strong>${TECNOLOGIAS[tl].nome}</strong>${TECNOLOGIAS[tl].texto}`
          : `<span class="muted">Toque num ícone para explicar a tecnologia ao cliente. Os ícones apagados são tecnologias que esta lente não tem.</span>`}</div>
      </div>
      <div class="card fala">
        <p class="eyebrow">Como explicar ao cliente</p>
        <ul>${l.fala.map((f) => `<li>${f}</li>`).join("")}</ul>
        ${l.aviso ? `<p class="aviso">${l.aviso}</p>` : ""}
      </div>
    </div>`;
  animarMedidores($("#lensDetail"));
}

$("#lensDetail").addEventListener("click", (e) => {
  const l = porId(estado.lente);
  const campo = e.target.closest("[data-campo]");
  if (campo) { estado.campo = campo.dataset.campo; desenharDetalhe(); salvar(); return; }
  if (e.target.closest("#btnFoto")) {
    estado.fotoPorLente = { ...estado.fotoPorLente, [l.id]: (fotoIdx(l) + 1) % fotosDa(l).length };
    desenharDetalhe(); salvar(); return;
  }
  const tec = e.target.closest("[data-tec]");
  if (tec) {
    const k = tec.dataset.tec;
    if (!l.tecs.includes(k)) {
      $("#tecExplica").innerHTML = `<strong>${TECNOLOGIAS[k].nome}</strong>A ${l.nome} não tem esta tecnologia. Ela está em: ${LENTES.filter((x) => x.tecs.includes(k)).map((x) => x.nome).join(", ")}.`;
      $$(".tec", $("#lensDetail")).forEach((b) => b.classList.toggle("is-sel", b === tec));
      return;
    }
    estado.tecLente = k;
    desenharDetalhe();
    return;
  }
  if (e.target.closest("#btnEscolher")) {
    estado.escolha.lente = estado.escolha.lente === l.id ? null : l.id;
    if (estado.escolha.lente) aviso(`Inoovax ${l.nome} adicionada ao resumo`);
    desenharLentes();
    atualizarBadge();
    return;
  }
  if (e.target.closest("#btnComparar")) abrirComparacao(l.id);
});

function desenharLentes() {
  desenharTipos();
  desenharDetalhe();
  salvar();
}

/* ----- Comparar ----- */
const sheet = $("#cmpSheet");
let cmp = ["advanced-pro", "light"];
function abrirComparacao(id) {
  const outra = LENTES.filter((l) => l.tipo === porId(id).tipo && l.id !== id);
  cmp = [id, (outra[0] || LENTES.find((l) => l.id !== id)).id];
  desenharComparacao();
  sheet.showModal();
}
function desenharComparacao() {
  const opcoes = (sel) => LENTES.map((l) => `<option value="${l.id}" ${l.id === sel ? "selected" : ""}>Inoovax ${l.nome} · ${TIPOS[l.tipo].nome}</option>`).join("");
  $("#cmpBody").innerHTML = cmp.map((id, i) => {
    const l = porId(id);
    const faltam = ORDEM_TEC.filter((k) => !l.tecs.includes(k));
    return `<div>
      <select data-i="${i}" aria-label="Lente ${i + 1}">${opcoes(id)}</select>
      <div class="cmp-col" style="--c:${l.cor}">
        ${campoSVG(l)}
        <div style="--c:${l.cor}">${medidores(l)}</div>
        <p class="cmp-tecs"><strong>${l.tecs.length} de ${ORDEM_TEC.length} tecnologias.</strong>
        ${faltam.length ? `Não tem: ${faltam.map((k) => TECNOLOGIAS[k].nome.toLowerCase()).join(", ")}.` : "Tem todas."}</p>
      </div></div>`;
  }).join("");
  animarMedidores($("#cmpBody"));
}
$("#cmpBody").addEventListener("change", (e) => {
  const s = e.target.closest("select");
  if (!s) return;
  cmp[Number(s.dataset.i)] = s.value;
  desenharComparacao();
});
sheet.querySelector("[data-close]").addEventListener("click", () => sheet.close());
sheet.addEventListener("click", (e) => { if (e.target === sheet) sheet.close(); });

/* ===================== 2. Tecnologias ===================== */
function desenharTecnologias() {
  const sel = estado.tecSel;
  $("#matrix").innerHTML = `
    <thead><tr><th></th>${LENTES.map((l) => `<th style="--c:${l.cor}">${l.nome}<span></span></th>`).join("")}</tr></thead>
    <tbody>${ORDEM_TEC.map((k) => `
      <tr data-tec="${k}" class="${k === sel ? "is-sel" : ""}">
        <th><button><span class="ic">${icone(k)}</span>${TECNOLOGIAS[k].nome}</button></th>
        ${LENTES.map((l) => `<td>${l.tecs.includes(k) ? '<i class="dot" aria-label="tem"></i>' : '<i class="dot dot--off" aria-label="não tem"></i>'}</td>`).join("")}
      </tr>`).join("")}</tbody>
    <tfoot><tr><td style="text-align:left;padding-left:14px">Total</td>${LENTES.map((l) => `<td>${l.tecs.length}</td>`).join("")}</tr></tfoot>`;
  const t = TECNOLOGIAS[sel];
  $("#tecCard").innerHTML = `
    <span class="ic">${icone(sel)}</span>
    <h2>${t.nome}</h2>
    <p class="curto">${t.curto}</p>
    <p>${t.texto}</p>
    <div class="tem">${LENTES.filter((l) => l.tecs.includes(sel)).map((l) => `<span style="--c:${l.cor}">${l.nome}</span>`).join("")}</div>`;
}
$("#matrix").addEventListener("click", (e) => {
  const tr = e.target.closest("tr[data-tec]");
  if (!tr) return;
  estado.tecSel = tr.dataset.tec;
  desenharTecnologias();
  salvar();
  if (window.innerWidth <= 980) $("#tecCard").scrollIntoView({ behavior: "smooth", block: "nearest" });
});

/* ===================== 3. Materiais e espessura ===================== */
/* ---------- Receita (OD, OE e adição, como na receita do optometrista) ---------- */
// as tabelas usam cilíndrico negativo: receita com cilíndrico positivo é transposta
function negativa(o) {
  if (o.cil <= 0) return o;
  return { esf: o.esf + o.cil, cil: -o.cil, eixo: o.eixo ? (o.eixo > 90 ? o.eixo - 90 : o.eixo + 90) : 0 };
}
const forca = (o) => { const n = negativa(o); return Math.max(Math.abs(n.esf), Math.abs(n.esf + n.cil)); };
const olhoCritico = () => (forca(estado.rx.oe) > forca(estado.rx.od) ? "oe" : "od");
const olhoNoCorte = () => estado.olho || olhoCritico();
const textoOlho = (o) => `${o.esf ? grau(o.esf) : "0,00"}${o.cil ? ` ${grau(o.cil)} × ${o.eixo || 0}°` : ""}`;
const textoRx = () => `OD ${textoOlho(estado.rx.od)} · OE ${textoOlho(estado.rx.oe)}${estado.rx.ad ? ` · Ad. ${grau(estado.rx.ad)}` : ""}`;
const NOMES_RX = { esf: "esférico", cil: "cilíndrico", eixo: "eixo" };
const nomeCampo = (k) => (k === "ad" ? "Adição" : `${k.slice(0, 2).toUpperCase()} · ${NOMES_RX[k.slice(3)]}`);
const lerRx = (k) => (k === "ad" ? estado.rx.ad : estado.rx[k.slice(0, 2)][k.slice(3)]);
function mostrarRx(k, v) {
  if (k.endsWith("eixo")) return estado.rx[k.slice(0, 2)].cil ? String(v) : "";
  if (k === "ad") return v ? grau(v) : "";
  return v ? grau(v) : "0,00";
}
function gravarRx(k, v) {
  const q = (x, a, b) => Math.min(b, Math.max(a, Math.round(x * 4) / 4));
  if (Number.isNaN(v)) return;
  if (k === "ad") { estado.rx.ad = q(v, 0, 4); return; }
  const [olho, campo] = k.split(".");
  estado.rx[olho][campo] = campo === "eixo" ? Math.min(180, Math.max(0, Math.round(v))) : campo === "esf" ? q(v, -20, 20) : q(v, -8, 8);
}
const lerNumero = (t) => (t.trim() === "" ? 0 : parseFloat(t.replace("−", "-").replace(",", ".").replace(/[^\d.+-]/g, "")));

function desenharRx() {
  $$("#rx [data-rx]").forEach((i) => {
    // não atropela o que a pessoa ainda está digitando
    if (!i.dataset.editando) i.value = mostrarRx(i.dataset.rx, lerRx(i.dataset.rx));
    i.classList.toggle("is-on", i.dataset.rx === estado.rxCampo);
  });
  $("#rxCampo").textContent = nomeCampo(estado.rxCampo);
  $("[data-rxsinal]").disabled = estado.rxCampo === "ad" || estado.rxCampo.endsWith("eixo");
  const olho = olhoNoCorte();
  $$("#chipsOlho button").forEach((b) => b.classList.toggle("is-on", b.dataset.olho === olho));
}
$("#rx").addEventListener("focusin", (e) => {
  const i = e.target.closest("[data-rx]");
  if (!i) return;
  estado.rxCampo = i.dataset.rx;
  i.select();
  desenharRx();
});
$("#rx").addEventListener("input", (e) => { if (e.target.matches("[data-rx]")) e.target.dataset.editando = "1"; });
$("#rx").addEventListener("change", (e) => {
  const i = e.target.closest("[data-rx]");
  if (!i) return;
  delete i.dataset.editando;
  gravarRx(i.dataset.rx, lerNumero(i.value));
  i.value = mostrarRx(i.dataset.rx, lerRx(i.dataset.rx));
  desenharMateriais();
});
$("#rx").addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.matches("[data-rx]")) e.target.blur(); });
$("#rx").addEventListener("click", (e) => {
  const k = estado.rxCampo;
  const passo = e.target.closest("[data-rxd]");
  if (passo) gravarRx(k, lerRx(k) + Number(passo.dataset.rxd) * (k.endsWith("eixo") ? 5 : 0.25));
  else if (e.target.closest("[data-rxsinal]")) gravarRx(k, -lerRx(k));
  else if (e.target.closest("#btnCopiaOE")) { estado.rx.oe = { ...estado.rx.od }; aviso("OD copiado para o OE"); }
  else return;
  desenharMateriais();
});
$("#chipsOlho").addEventListener("click", (e) => {
  const b = e.target.closest("[data-olho]");
  if (b) { estado.olho = b.dataset.olho; desenharMateriais(); }
});

function espessura(m, esf, cil, D) {
  const ref = CATALOGO_ESPESSURA[m.id];
  if (D === 65 && cil === 0 && ref && ref[String(esf)]) {
    const [t, w] = ref[String(esf)];
    return esf < 0 ? { ct: m.t0m, borda: t, centro: m.t0m, peso: w, dom: esf, catalogo: true }
      : { ct: t, borda: m.t0p, centro: t, peso: w, dom: esf, catalogo: true };
  }
  const h = D / 2, f = (m.k * h * h) / (2000 * (m.n - 1));
  const pMax = esf, pMin = esf + cil;
  const ct = pMax > 0 ? m.t0p + f * pMax : m.t0m;
  const borda1 = ct - f * pMax, borda2 = ct - f * pMin;
  const borda = Math.max(borda1, borda2);
  const mediaBorda = (borda1 + borda2) / 2;
  const peso = (m.dens * Math.PI * h * h * (ct + (mediaBorda - ct) / 2)) / 1000;
  const dom = Math.abs(pMin) >= Math.abs(pMax) ? pMin : pMax;
  return { ct, borda, centro: ct, peso, dom };
}

function recomendados(esf, cil, perfil) {
  const forte = Math.max(Math.abs(esf), Math.abs(esf + cil));
  const r = new Set();
  if (forte <= 2) r.add("cr39").add("156");
  else if (forte <= 4) r.add("160");
  else if (forte <= 6) r.add("167");
  else r.add("174");
  if (perfil.includes("crianca") || perfil.includes("esporte")) { r.clear(); r.add("poly"); if (forte > 4) r.add(forte > 6 ? "174" : "167"); }
  if (perfil.includes("parafuso")) { r.delete("cr39"); r.delete("156"); if (!r.size) r.add("poly").add("160"); }
  return r;
}

function lenteParaMateriais() { return porId(estado.escolha.lente || estado.lente); }

function desenharMateriais() {
  const { diam, perfil } = estado;
  const olho = olhoNoCorte();
  const { esf, cil } = negativa(estado.rx[olho]);
  desenharRx();
  $("#rngDiam").value = diam;
  $("#outDiam").textContent = `${diam} mm`;
  $$("#chipsDiam button").forEach((b) => b.classList.toggle("is-on", Number(b.dataset.d) === diam));
  $$("#chipsPerfil button").forEach((b) => b.classList.toggle("is-on", perfil.includes(b.dataset.p)));

  const lente = lenteParaMateriais();
  const forte = negativa(estado.rx[olhoCritico()]);
  const rec = recomendados(forte.esf, forte.cil, perfil);
  const calc = Object.fromEntries(MATERIAIS.map((m) => [m.id, espessura(m, esf, cil, diam)]));
  const m = matPorId(estado.material);
  const r = calc[m.id], base = calc.cr39;
  const negativo = r.dom < 0;
  const valor = (x) => (negativo ? x.borda : x.centro);
  const maxEsp = Math.max(...Object.values(calc).map(valor));
  const ganho = Math.round((1 - valor(r) / valor(base)) * 100);
  const ganhoPeso = Math.round((1 - r.peso / base.peso) * 100);

  $("#xsTitulo").textContent = `${m.nome} · ${m.frase.toLowerCase()} · ${olho.toUpperCase()}`;
  // peso do par = esta lente + a do outro olho, cada uma com o seu grau
  const outro = negativa(estado.rx[olho === "od" ? "oe" : "od"]);
  const pesoPar = (mat) => calc[mat.id].peso + espessura(mat, outro.esf, outro.cil, diam).peso;
  const ganhoPar = Math.round((1 - pesoPar(m) / pesoPar(matPorId("cr39"))) * 100);
  $("#xsStats").innerHTML = `
    <div><b>${num(valor(r), 1)} mm</b><span>${negativo ? "borda mais grossa" : "no centro"}</span></div>
    <div><b>${num(r.peso, 1)} g</b><span>peso desta lente (${olho.toUpperCase()})</span></div>
    <div><b>${num(pesoPar(m), 1)} g</b><span>peso do par (OD + OE)</span></div>
    ${m.id !== "cr39" ? `<div class="ganho"><b>${ganho > 0 ? "−" : "+"}${Math.abs(ganho)}%</b><span>espessura vs CR-39</span></div>
      <div class="ganho"><b>${ganhoPar > 0 ? "−" : "+"}${Math.abs(ganhoPar)}%</b><span>peso vs CR-39</span></div>` : ""}`;
  $("#xsNota").textContent = r.catalogo ? "Valores da tabela do Cardápio Inoovax." : esf === 0 && cil === 0 ? "Sem grau: espessura mínima." : "Espessura e peso estimados.";
  $("#chkSobrepor").checked = estado.sobrepor;
  const lista = estado.sobrepor
    ? MATERIAIS.filter((x) => estado.sobreMats.includes(x.id)).map((x) => ({ m: x, r: calc[x.id], cor: COR_MATERIAL[x.id] }))
    : [{ m: matPorId("cr39"), r: calc.cr39, fantasma: true }, { m, r, cor: "#23978a" }];
  desenharCorte(lista, r);
  $("#xsLegenda").innerHTML = estado.sobrepor
    ? `<div class="sobre-lista">${MATERIAIS.map((x) => {
        const on = estado.sobreMats.includes(x.id);
        return `<button class="sobre ${on ? "is-on" : ""}" data-sobre="${x.id}" style="--cm:${COR_MATERIAL[x.id]}" aria-pressed="${on}">
          <i></i><strong>${x.nome}</strong><span>${num(valor(calc[x.id]), 1)} mm · ${num(calc[x.id].peso, 1)} g</span></button>`;
      }).join("")}</div>
      <p class="tiny muted">Toque nos materiais para colocar ou tirar do desenho. Peso por lente, no olho ${olho.toUpperCase()}.</p>`
    : `<p class="xs-legend"><span class="sw sw--sel"></span> material escolhido <span class="sw sw--ghost"></span> CR-39 com o mesmo grau</p>`;

  $("#matRows").innerHTML = `<div class="mat-row mat-row--cab"><span>Material</span><span>${negativo ? "Espessura da borda" : "Espessura do centro"}</span><span class="num">mm</span><span class="num">Peso*</span></div>` + MATERIAIS.map((x) => {
    const c = calc[x.id];
    const na = !lente.materiais.includes(x.id);
    const evitar = perfil.includes("parafuso") && (x.id === "cr39" || x.id === "156");
    return `<button class="mat-row ${x.id === m.id ? "is-on" : ""} ${na || evitar ? "is-na" : ""}" data-mat="${x.id}">
      <span><strong>${x.nome}${rec.has(x.id) && !na ? '<span class="rec">indicado</span>' : ""}</strong>
        <small>${na ? `não disponível na ${lente.nome}` : evitar ? "evitar em parafusada/nylon" : `índice ${x.indice}`}</small></span>
      <span class="bar"><span style="width:${(valor(c) / maxEsp) * 100}%"></span></span>
      <span class="num">${num(valor(c), 1)}<small> mm</small></span>
      <span class="num">${num(c.peso, 1)}<small> g</small></span>
    </button>`;
  }).join("");

  const pontos = (n) => `<span class="dots">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;
  const finura = { "cr39": 1, "156": 2, "poly": 3, "160": 3, "167": 4, "174": 5 }[m.id];
  const leveza = { "cr39": 2, "156": 3, "poly": 5, "160": 3, "167": 4, "174": 4 }[m.id];
  const nitidez = m.abbe >= 55 ? 5 : m.abbe >= 40 ? 4 : m.abbe >= 35 ? 3 : 2;
  const escolhido = estado.escolha.material === m.id;
  $("#matInfo").innerHTML = `
    <p class="eyebrow">Material · índice ${m.indice}</p>
    <h3>${m.nome}</h3>
    <p class="frase">“${m.frase}”</p>
    <p>${m.desc}</p>
    <div class="prop"><span>Finura</span>${pontos(finura)}</div>
    <div class="prop"><span>Leveza</span>${pontos(leveza)}</div>
    <div class="prop"><span>Nitidez na borda</span>${pontos(nitidez)}</div>
    <div class="prop"><span>Resistência a impacto</span>${pontos(m.impacto)}</div>
    <p class="bom"><strong>Bom para:</strong> ${m.bom}</p>
    ${lente.materiais.includes(m.id) ? `<p class="lente-ok muted">Disponível na Inoovax ${lente.nome}.</p>`
      : `<p class="aviso">A Inoovax ${lente.nome} só é feita em ${lente.materiais.map((x) => matPorId(x).nome).join(" e ")}.</p>`}
    <div class="actions">
      <button class="btn ${escolhido ? "is-on" : "btn--primary"}" id="btnMaterial">${escolhido ? "✓ Material escolhido" : "Usar este material"}</button>
    </div>
    <details style="margin-top:14px"><summary class="muted" style="cursor:pointer;font-size:14px">Tabela do Cardápio Inoovax (lente de 65 mm)</summary>
      <table class="ref-table"><thead><tr><th>Material</th><th>−1,00 borda</th><th>−4,00 borda</th><th>+4,00 centro</th></tr></thead>
      <tbody>${Object.entries(CATALOGO_ESPESSURA).map(([k, v]) => `<tr><td>${matPorId(k).nome}</td>${["-1", "-4", "4"].map((g) => `<td>${num(v[g][0], 1)} mm · ${num(v[g][1], 1)} g</td>`).join("")}</tr>`).join("")}</tbody></table>
    </details>`;
  salvar();
}

// cores fixas por material para o modo sobreposto
const COR_MATERIAL = { cr39: "#8a94a6", "156": "#e0a030", poly: "#3b82c4", "160": "#9b59b6", "167": "#23978a", "174": "#d9480f" };

// lista = [{ m, r, cor, fantasma }]; r = resultado de espessura(); a cota é a de "cota"
function desenharCorte(lista, cotaRes) {
  const svg = $("#xsSvg");
  const D = estado.diam, h = D / 2, s = 720 / 75;
  const P = cotaRes.dom;
  const baseCurva = P < 0 ? Math.min(6, Math.max(1.5, P / 2 + 6)) : Math.min(10, P + 6);
  const R = 530 / baseCurva;
  const sag = (x) => R - Math.sqrt(R * R - x * x);
  const perfil = (mat, res) => {
    const f = (mat.k * 1) / (2000 * (mat.n - 1));
    return (x) => (P < 0 ? res.ct + f * x * x * Math.abs(P) : Math.max(res.ct - f * x * x * P, 0.3));
  };
  const caminho = (mat, res) => {
    const t = perfil(mat, res), topo = [], fundo = [];
    for (let i = 0; i <= 60; i++) {
      const x = -h + (2 * h * i) / 60;
      topo.push([x, sag(x)]);
      fundo.push([x, sag(x) + t(x)]);
    }
    return [...topo, ...fundo.reverse()];
  };
  const formas = lista.map((it) => ({ ...it, pts: caminho(it.m, it.r), esp: P < 0 ? it.r.borda : it.r.centro }));
  const todos = formas.flatMap((f) => f.pts);
  if (!todos.length) { svg.innerHTML = ""; return; }
  const yMin = Math.min(...todos.map((p) => p[1])), yMax = Math.max(...todos.map((p) => p[1]));
  const Wv = 800, pad = 34, Hv = Math.max(200, (yMax - yMin) * s + pad * 2 + 20);
  const X = (x) => Wv / 2 + x * s, Y = (y) => pad + (y - yMin) * s;
  const d = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(" ") + " Z";
  const cota = (x, y1, y2, txt) => `
    <path d="M${X(x) + 14},${Y(y1)} h12 M${X(x) + 14},${Y(y2)} h12 M${X(x) + 20},${Y(y1)} V${Y(y2)}" stroke="#17241b" stroke-width="1.5" fill="none"/>
    <text x="${X(x) + 32}" y="${(Y(y1) + Y(y2)) / 2 + 5}" font-size="15" font-weight="700" fill="#17241b">${txt}</text>`;
  const sobre = !formas.some((f) => f.fantasma);
  // a mais grossa vai para trás, para todas aparecerem
  const desenho = [...formas].sort((a, b) => b.esp - a.esp).map((f) => f.fantasma
    ? `<path d="${d(f.pts)}" fill="none" stroke="#9aa39c" stroke-width="2" stroke-dasharray="6 5"/>`
    // sobrepostas: fundo branco opaco + tinta, para cada material virar uma faixa de cor na borda
    : `${sobre ? `<path d="${d(f.pts)}" fill="#fff"/>` : ""}<path d="${d(f.pts)}" fill="${f.cor}" fill-opacity="${sobre ? 0.5 : 0.55}" stroke="${f.cor}" stroke-width="2.5"/>`).join("");
  const principal = formas.find((f) => !f.fantasma && f.r === cotaRes) || null;
  let cotas = "";
  if (!sobre && principal) {
    const t = perfil(principal.m, principal.r)(P < 0 ? h : 0);
    cotas = P < 0 ? cota(h, sag(h), sag(h) + t, `${num(principal.r.borda, 1)} mm`) : `
      <path d="M${X(0)},${Y(sag(0))} V${Y(sag(0) + t)}" stroke="#17241b" stroke-width="1.5" stroke-dasharray="3 3"/>
      <text x="${X(0) + 8}" y="${Y(sag(0)) - 8}" font-size="15" font-weight="700" fill="#17241b">${num(principal.r.centro, 1)} mm no centro</text>`;
  }
  svg.setAttribute("viewBox", `0 0 ${Wv + 90} ${Hv}`);
  svg.innerHTML = `${desenho}${cotas}
    <path d="M${X(-h)},${Hv - 12} H${X(h)}" stroke="#5b6b5e" stroke-width="1.2" marker-start="url(#ar)" marker-end="url(#ar)"/>
    <text x="${X(0)}" y="${Hv - 18}" text-anchor="middle" font-size="13" fill="#5b6b5e">${D} mm</text>
    <defs><marker id="ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#5b6b5e"/></marker></defs>`;
  svg.style.height = `${Math.min(340, Math.max(190, Hv * 0.9))}px`;
}
$("#chkSobrepor").addEventListener("change", (e) => {
  estado.sobrepor = e.target.checked;
  if (estado.sobrepor && !estado.sobreMats.includes(estado.material)) estado.sobreMats = [...estado.sobreMats, estado.material];
  desenharMateriais();
});
$("#xsLegenda").addEventListener("click", (e) => {
  const b = e.target.closest("[data-sobre]");
  if (!b) return;
  const id = b.dataset.sobre;
  estado.sobreMats = estado.sobreMats.includes(id) ? estado.sobreMats.filter((x) => x !== id) : [...estado.sobreMats, id];
  desenharMateriais();
});

$("#rngDiam").addEventListener("input", (e) => { estado.diam = Number(e.target.value); desenharMateriais(); });
$("#chipsDiam").addEventListener("click", (e) => {
  const b = e.target.closest("[data-d]");
  if (b) { estado.diam = Number(b.dataset.d); desenharMateriais(); }
});
$("#chipsPerfil").addEventListener("click", (e) => {
  const b = e.target.closest("[data-p]");
  if (!b) return;
  const p = b.dataset.p;
  estado.perfil = estado.perfil.includes(p) ? estado.perfil.filter((x) => x !== p) : [...estado.perfil, p];
  desenharMateriais();
});
$("#matRows").addEventListener("click", (e) => {
  const b = e.target.closest("[data-mat]");
  if (b) { estado.material = b.dataset.mat; desenharMateriais(); }
});
$("#matInfo").addEventListener("click", (e) => {
  if (!e.target.closest("#btnMaterial")) return;
  estado.escolha.material = estado.escolha.material === estado.material ? null : estado.material;
  if (estado.escolha.material) aviso(`${matPorId(estado.material).nome} adicionado ao resumo`);
  desenharMateriais();
  atualizarBadge();
});

/* ===================== 4. Simulador de tratamentos ===================== */
function aleatorio(semente) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Cenas desenhadas no navegador (1600 × 900). luzes = fontes de luz para os reflexos.
const CENAS = {};
function cena(nome) {
  if (CENAS[nome]) return CENAS[nome];
  if (nome === "dia") return (CENAS.dia = { url: "img/vitrine-solar.jpg", luzes: [] });
  const cv = document.createElement("canvas");
  cv.width = 1600; cv.height = 900;
  const g = cv.getContext("2d");
  const rnd = aleatorio(7);
  const luzes = [];
  const brilho = (x, y, r, cor, a = 1) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, cor); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.globalAlpha = a; g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
  };

  if (nome === "noite") {
    let gr = g.createLinearGradient(0, 0, 0, 900);
    gr.addColorStop(0, "#050813"); gr.addColorStop(0.55, "#121a33"); gr.addColorStop(1, "#07090f");
    g.fillStyle = gr; g.fillRect(0, 0, 1600, 900);
    for (let x = -20; x < 1620;) {
      const w = 80 + rnd() * 120, hh = 120 + rnd() * 260;
      g.fillStyle = "#0b0f1d"; g.fillRect(x, 480 - hh, w, hh);
      for (let wy = 480 - hh + 14; wy < 470; wy += 26) for (let wx = x + 10; wx < x + w - 14; wx += 22)
        if (rnd() < 0.35) { g.fillStyle = `rgba(255,${190 + rnd() * 50 | 0},120,${0.35 + rnd() * 0.4})`; g.fillRect(wx, wy, 10, 14); }
      x += w + 6;
    }
    g.fillStyle = "#15171d";
    g.beginPath(); g.moveTo(0, 900); g.lineTo(760, 480); g.lineTo(840, 480); g.lineTo(1600, 900); g.fill();
    g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 4;
    for (let i = 0; i < 9; i++) {
      const t1 = i / 9, t2 = t1 + 0.05;
      const yy = (t) => 480 + 420 * t * t, ww = (t) => 3 + 10 * t;
      g.lineWidth = ww(t1); g.beginPath(); g.moveTo(800, yy(t1)); g.lineTo(800, yy(t2)); g.stroke();
    }
    [[260, 300, 1], [520, 390, 0.6], [680, 440, 0.35], [1340, 300, 1], [1080, 390, 0.6], [920, 440, 0.35]].forEach(([x, y, s]) => {
      g.fillStyle = "#222"; g.fillRect(x - 3 * s, y, 6 * s, 900);
      brilho(x, y, 140 * s, "rgba(255,190,110,.55)");
      brilho(x, y, 26 * s, "rgba(255,240,210,1)");
      luzes.push({ x, y, r: 22 * s, cor: "255,210,150" });
    });
    [[690, 560, 0.8], [600, 640, 1.3], [430, 760, 2]].forEach(([x, y, s]) => {
      [-1, 1].forEach((lado) => {
        const lx = x + lado * 34 * s;
        brilho(lx, y, 120 * s, "rgba(200,220,255,.5)");
        brilho(lx, y, 16 * s, "rgba(255,255,255,1)");
        luzes.push({ x: lx, y, r: 16 * s, cor: "230,240,255" });
      });
    });
    [[905, 560, 0.8], [1010, 640, 1.2]].forEach(([x, y, s]) => {
      [-1, 1].forEach((lado) => {
        const lx = x + lado * 34 * s;
        brilho(lx, y, 50 * s, "rgba(255,40,40,.6)");
        brilho(lx, y, 9 * s, "rgba(255,120,120,1)");
      });
    });
  } else if (nome === "tela") {
    let gr = g.createLinearGradient(0, 0, 0, 900);
    gr.addColorStop(0, "#07090f"); gr.addColorStop(1, "#11131a");
    g.fillStyle = gr; g.fillRect(0, 0, 1600, 900);
    brilho(800, 420, 700, "rgba(90,140,255,.30)");
    g.fillStyle = "#1b1d24"; g.fillRect(0, 700, 1600, 200);
    g.fillStyle = "#0d0e12"; g.fillRect(770, 640, 60, 70); g.fillRect(690, 700, 220, 14);
    g.fillStyle = "#0d0e12"; g.fillRect(450, 200, 700, 450);
    g.fillStyle = "#eef4ff"; g.fillRect(470, 220, 660, 410);
    g.fillStyle = "#2f6fed"; g.fillRect(470, 220, 660, 56);
    g.fillStyle = "#c9d8f5"; g.fillRect(500, 300, 260, 160);
    g.fillStyle = "#9db5e8"; g.fillRect(500, 480, 260, 12); g.fillRect(500, 504, 200, 12);
    for (let i = 0; i < 9; i++) { g.fillStyle = "#b9c3d6"; g.fillRect(790, 306 + i * 30, 300 - (i % 3) * 50, 12); }
    g.fillStyle = "#0d0e12"; g.fillRect(1180, 600, 140, 250);
    g.fillStyle = "#dfe9ff"; g.fillRect(1190, 612, 120, 226);
    brilho(1250, 720, 200, "rgba(120,160,255,.25)");
    luzes.push({ x: 800, y: 425, r: 330, cor: "200,220,255", tela: true });
  } else if (nome === "sol") {
    let gr = g.createLinearGradient(0, 0, 0, 520);
    gr.addColorStop(0, "#3f97ec"); gr.addColorStop(1, "#cfe8ff");
    g.fillStyle = gr; g.fillRect(0, 0, 1600, 520);
    brilho(1300, 130, 420, "rgba(255,250,220,.9)");
    brilho(1300, 130, 70, "rgba(255,255,255,1)");
    g.fillStyle = "rgba(255,255,255,.9)";
    [[300, 120, 1], [620, 80, 0.7], [900, 160, 0.9]].forEach(([x, y, s]) => {
      [[0, 0, 60], [55, -18, 48], [105, 4, 42], [-50, 10, 40]].forEach(([dx, dy, r]) => { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2); g.fill(); });
    });
    const fach = ["#f2c14e", "#e9897e", "#7cc6b4", "#f4efe4", "#8fb8e8", "#e8a65d"];
    for (let x = -10, i = 0; x < 1620; i++) {
      const w = 150 + rnd() * 90, hh = 150 + rnd() * 110;
      g.fillStyle = fach[i % fach.length]; g.fillRect(x, 560 - hh, w, hh);
      g.fillStyle = "rgba(40,60,80,.55)";
      for (let wx = x + 18; wx < x + w - 40; wx += 54) g.fillRect(wx, 560 - hh + 26, 30, 38);
      g.fillStyle = "rgba(60,40,30,.6)"; g.fillRect(x + w / 2 - 22, 500, 44, 60);
      x += w + 4;
    }
    [[120, 470], [560, 480], [1060, 470], [1480, 480]].forEach(([x, y]) => {
      g.fillStyle = "#6b4a2b"; g.fillRect(x - 6, y, 12, 90);
      g.fillStyle = "#2f8a4a"; [[0, -10, 70], [-45, 10, 50], [45, 10, 50], [0, -60, 50]].forEach(([dx, dy, r]) => { g.beginPath(); g.arc(x + dx, y + dy, r, 0, Math.PI * 2); g.fill(); });
    });
    g.fillStyle = "#d9d4c7"; g.fillRect(0, 560, 1600, 60);
    g.fillStyle = "#5d6066"; g.beginPath(); g.moveTo(0, 900); g.lineTo(0, 620); g.lineTo(1600, 620); g.lineTo(1600, 900); g.fill();
    g.fillStyle = "#fff";
    for (let i = 0; i < 8; i++) g.fillRect(40 + i * 210, 750, 120, 12);
    luzes.push({ x: 1300, y: 130, r: 70, cor: "255,250,220" });
  }
  return (CENAS[nome] = { url: cv.toDataURL("image/jpeg", 0.88), luzes });
}

const LENTE_L = { x: 190, y: 250, w: 580, h: 430 }, LENTE_R = { x: 830, y: 250, w: 580, h: 430 };
const lenteRect = (r, extra = "") => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="190" ry="170" ${extra}/>`;
const OPACIDADE_FOTO = { interno: 0.05, nublado: 0.42, sol: 0.8, carro: 0.16 };
let flanela = false, molhado = false, gotasSemente = 1;

function camadasDaLente(lado, trat) {
  const r = lado === "L" ? LENTE_L : LENTE_R;
  const rnd = aleatorio(lado === "L" ? 11 : 23);
  const tem = (k) => trat.includes(k);
  const cn = cena(estado.cena);
  const uso = estado.uso;
  let s = "";
  const px = () => r.x + 40 + rnd() * (r.w - 80), py = () => r.y + 30 + rnd() * (r.h - 60);

  // filtro azul
  if (estado.cena === "tela") {
    s += tem("azul")
      ? `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="#ffd76a" opacity=".13" style="mix-blend-mode:multiply"/>`
      : `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="url(#gAzul)" style="mix-blend-mode:screen"/>`;
  } else if (tem("azul")) {
    s += `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="#ffe08a" opacity=".07"/>`;
  }

  // riscos
  const nRiscos = Math.round(tem("risco") ? uso * 0.3 : uso * 2.4);
  for (let i = 0; i < nRiscos; i++) {
    const x = px(), y = py(), ang = rnd() * Math.PI, len = 40 + rnd() * 160;
    if (rnd() < 0.4) {
      const rr = 60 + rnd() * 140;
      s += `<path d="M${x},${y} a${rr},${rr} 0 0 1 ${len * 0.8},${len * 0.3}" class="risco"/>`;
    } else s += `<path d="M${x},${y} l${Math.cos(ang) * len},${Math.sin(ang) * len}" class="risco"/>`;
  }

  // poeira
  let nPo = tem("estat") ? 2 + uso * 0.8 : 12 + uso * 8;
  if (flanela) nPo = tem("estat") ? 0 : nPo * 0.4;
  for (let i = 0; i < nPo; i++) s += `<circle cx="${px()}" cy="${py()}" r="${0.8 + rnd() * 2.6}" class="po"/>`;

  // gordura / digitais
  const digitais = [[r.x + r.w * 0.32, r.y + r.h * 0.6, -20], [r.x + r.w * 0.7, r.y + r.h * 0.35, 25]];
  if (!flanela) {
    const op = tem("oleo") ? 0.12 : 0.36;
    digitais.forEach(([x, y, rot]) => {
      s += `<g transform="translate(${x} ${y}) rotate(${rot})" opacity="${op}" filter="url(#fSuave)">
        ${[...Array(9)].map((_, k) => `<ellipse rx="${14 + k * 9}" ry="${20 + k * 11}" class="digital" stroke-dasharray="${12 + k * 3} ${3 + (k % 3) * 2}"/>`).join("")}
        <ellipse rx="95" ry="120" fill="#fff" opacity=".25" filter="url(#fBorra)"/></g>`;
    });
  } else if (!tem("oleo")) {
    s += `<ellipse cx="${r.x + r.w / 2}" cy="${r.y + r.h / 2}" rx="${r.w * 0.38}" ry="${r.h * 0.3}" fill="#fff" opacity=".2" filter="url(#fBorra)"/>
      <image href="${cn.url}" width="1600" height="900" preserveAspectRatio="xMidYMid slice" filter="url(#fDesfoque)" clip-path="url(#cMancha${lado})" opacity=".85"/>`;
  }

  // água
  if (molhado) {
    if (tem("hidro")) {
      const g = aleatorio(gotasSemente + (lado === "L" ? 0 : 99));
      for (let i = 0; i < 26; i++) {
        const rr = 4 + g() * 11;
        s += `<g class="gota" style="animation-delay:${(g() * 2.5).toFixed(2)}s"><circle cx="${r.x + 40 + g() * (r.w - 80)}" cy="${r.y + 30 + g() * (r.h - 80)}" r="${rr}" fill="url(#gGota)"/></g>`;
      }
    } else {
      s += `<image href="${cn.url}" width="1600" height="900" preserveAspectRatio="xMidYMid slice" filter="url(#fAgua)" clip-path="url(#cAgua${lado})"/>
        <g clip-path="url(#cAgua${lado})"><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="rgba(220,235,255,.16)"/></g>
        <use href="#pAgua${lado}" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="2"/>`;
    }
  }

  // reflexos
  if (tem("ar")) {
    s += `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="url(#gVerde)" opacity=".5"/>`;
  } else {
    s += `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="url(#gBrilho)"/>`;
    if (estado.cena === "noite" || estado.cena === "tela") {
      cn.luzes.forEach((l) => {
        if (l.tela) {
          s += `<rect x="${l.x - 300 + 70}" y="${l.y - 190 - 40}" width="600" height="380" fill="rgba(200,220,255,.10)" filter="url(#fBorra)"/>`;
        } else {
          s += `<circle cx="${l.x}" cy="${l.y}" r="${l.r * 3.2}" fill="none" stroke="rgba(${l.cor},.35)" stroke-width="${l.r * 0.5}" filter="url(#fSuave)"/>
            <circle cx="${l.x + 46}" cy="${l.y - 30}" r="${l.r * 0.9}" fill="rgba(${l.cor},.55)" filter="url(#fSuave)"/>
            <circle cx="${l.x - 70}" cy="${l.y + 52}" r="${l.r * 0.6}" fill="rgba(${l.cor},.3)" filter="url(#fSuave)"/>`;
        }
      });
    } else {
      s += `<g opacity=".32" filter="url(#fBorra)" transform="translate(${r.x + r.w * 0.22} ${r.y + r.h * 0.12}) skewX(-8)">
        <rect width="${r.w * 0.5}" height="${r.h * 0.55}" fill="#fff"/>
        <rect x="${r.w * 0.24}" width="${r.w * 0.02}" height="${r.h * 0.55}" fill="#000" opacity=".6"/>
        <rect y="${r.h * 0.26}" width="${r.w * 0.5}" height="${r.h * 0.02}" fill="#000" opacity=".6"/></g>`;
    }
  }
  if (tem("azul")) s += `<path d="M${r.x + r.w * 0.6},${r.y} l${r.w * 0.18},0 l${-r.w * 0.35},${r.h} l${-r.w * 0.18},0 Z" fill="#7b7bff" opacity=".12"/>`;
  return s;
}

function desenharSimulador() {
  const svg = $("#simSvg");
  const cn = cena(estado.cena);
  const comTrat = estado.trat;
  const tratL = estado.comparar ? [] : comTrat;
  const temFoto = (t) => t.includes("foto");
  const rndAgua = aleatorio(gotasSemente * 7 + 3);
  const manchaAgua = (r) => [...Array(5)].map(() => {
    const cx = r.x + 80 + rndAgua() * (r.w - 160), cy = r.y + 60 + rndAgua() * (r.h - 120);
    const rx = 50 + rndAgua() * 90, ry = 40 + rndAgua() * 70;
    return `M${cx - rx},${cy} C${cx - rx},${cy - ry * 1.2} ${cx + rx * 0.6},${cy - ry} ${cx + rx},${cy - ry * 0.2} S${cx + rx * 0.4},${cy + ry * 1.3} ${cx - rx * 0.2},${cy + ry} S${cx - rx},${cy + ry * 0.5} ${cx - rx},${cy} Z`;
  }).join(" ");
  const pL = manchaAgua(LENTE_L), pR = manchaAgua(LENTE_R);
  const solForte = estado.cena === "sol" && (estado.luz === "sol" || estado.luz === "carro");
  const nublado = estado.cena === "sol" && estado.luz === "nublado";
  const carro = estado.cena === "sol" && estado.luz === "carro";
  const [nomeCor, cor] = CORES_TRANSITIONS[estado.cor];
  const op = OPACIDADE_FOTO[estado.cena === "sol" ? estado.luz : "interno"];

  svg.innerHTML = `
    <defs>
      <clipPath id="cL">${lenteRect(LENTE_L)}</clipPath>
      <clipPath id="cR">${lenteRect(LENTE_R)}</clipPath>
      <clipPath id="cAguaL"><path id="pAguaL" d="${pL}"/></clipPath>
      <clipPath id="cAguaR"><path id="pAguaR" d="${pR}"/></clipPath>
      <clipPath id="cManchaL"><ellipse cx="${LENTE_L.x + LENTE_L.w / 2}" cy="${LENTE_L.y + LENTE_L.h / 2}" rx="${LENTE_L.w * 0.36}" ry="${LENTE_L.h * 0.28}"/></clipPath>
      <clipPath id="cManchaR"><ellipse cx="${LENTE_R.x + LENTE_R.w / 2}" cy="${LENTE_R.y + LENTE_R.h / 2}" rx="${LENTE_R.w * 0.36}" ry="${LENTE_R.h * 0.28}"/></clipPath>
      <mask id="mFora"><rect width="1600" height="900" fill="#fff"/>${lenteRect(LENTE_L, 'fill="#000"')}${lenteRect(LENTE_R, 'fill="#000"')}</mask>
      <filter id="fSuave"><feGaussianBlur stdDeviation="1.2"/></filter>
      <filter id="fBorra" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
      <filter id="fDesfoque"><feGaussianBlur stdDeviation="7"/></filter>
      <filter id="fAgua"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="2" seed="${gotasSemente}"/><feDisplacementMap in="SourceGraphic" scale="38"/><feGaussianBlur stdDeviation="3"/></filter>
      <linearGradient id="gBrilho" x1="0" y1="0" x2="1" y2="1">
        <stop offset=".18" stop-color="#fff" stop-opacity="0"/><stop offset=".34" stop-color="#fff" stop-opacity=".42"/>
        <stop offset=".46" stop-color="#fff" stop-opacity=".08"/><stop offset=".58" stop-color="#fff" stop-opacity=".28"/><stop offset=".72" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="gVerde" x1="0" y1="0" x2="1" y2="1">
        <stop offset=".3" stop-color="#7dffb0" stop-opacity="0"/><stop offset=".42" stop-color="#7dffb0" stop-opacity=".12"/><stop offset=".55" stop-color="#7dffb0" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="gAzul" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="#6d9bff" stop-opacity=".55"/><stop offset="1" stop-color="#3355ff" stop-opacity=".15"/></radialGradient>
      <radialGradient id="gGota" cx=".38" cy=".32" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".25" stop-color="#fff" stop-opacity=".35"/><stop offset=".8" stop-color="#cfe3ff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".7"/></radialGradient>
    </defs>
    <style>
      .risco{stroke:rgba(255,255,255,.55);stroke-width:1.3;fill:none}
      .po{fill:rgba(255,255,255,.75)}
      .digital{fill:none;stroke:#fff;stroke-width:2.6}
      .gota{animation:escorre 3.2s ease-in forwards}
      @keyframes escorre{0%,35%{transform:translateY(0);opacity:1}100%{transform:translateY(520px);opacity:0}}
      .tinta{transition:fill-opacity 1.6s ease, fill .4s}
      .ofusca{transition:opacity 1s}
    </style>
    <image href="${cn.url}" width="1600" height="900" preserveAspectRatio="xMidYMid slice"/>
    ${nublado ? `<rect width="1600" height="900" fill="#c9ced6" opacity=".45"/>` : ""}
    <rect class="ofusca" width="1600" height="900" fill="#fffbe8" opacity="${solForte ? 0.3 : 0}"/>
    ${carro ? `<path d="M0,0 L170,0 L330,900 L0,900 Z M1600,0 L1430,0 L1270,900 L1600,900 Z" fill="#14161a"/>
      <path d="M0,760 Q800,690 1600,760 L1600,900 L0,900 Z" fill="#1d2026"/><rect x="700" y="40" width="200" height="70" rx="20" fill="#14161a"/>` : ""}
    <g clip-path="url(#cL)">${camadasDaLente("L", tratL)}
      ${lenteRect(LENTE_L, `class="tinta" id="tintaL" fill="${cor}" style="fill-opacity:${temFoto(tratL) ? op : 0}"`)}</g>
    <g clip-path="url(#cR)">${camadasDaLente("R", comTrat)}
      ${lenteRect(LENTE_R, `class="tinta" id="tintaR" fill="${cor}" style="fill-opacity:${temFoto(comTrat) ? op : 0}"`)}</g>
    <rect width="1600" height="900" fill="#000" opacity=".5" mask="url(#mFora)"/>
    <g fill="none" stroke="#121212" stroke-width="34">${lenteRect(LENTE_L)}${lenteRect(LENTE_R)}</g>
    <path d="M770,380 Q800,350 830,380" fill="none" stroke="#121212" stroke-width="30"/>
    <path d="M190,380 L0,350 M1410,380 L1600,350" stroke="#121212" stroke-width="30"/>`;
  svg.dataset.op = op;
  $("#simLabels").hidden = !estado.comparar;
  $$("#chipsCena button").forEach((b) => b.classList.toggle("is-on", b.dataset.cena === estado.cena));
  $$("#chipsLuz button").forEach((b) => b.classList.toggle("is-on", b.dataset.luz === estado.luz));
  $("#chkComparar").checked = estado.comparar;
  $("#rngUso").value = estado.uso;
  $("#outUso").textContent = estado.uso === 0 ? "lente nova" : `${estado.uso} ${estado.uso === 1 ? "mês" : "meses"}`;
  $("#btnAgua").textContent = molhado ? "Secar a lente" : "Molhar a lente";
  $("#btnFlanela").textContent = flanela ? "Voltar a sujar" : "Passar a flanela";
  desenharListaTrat();
  desenharTextoTrat();
  desenharCamadas();
  desenharFotoFab();
  salvar();
  return nomeCor;
}

// muda só a tinta Transitions, para a transição aparecer animada
function atualizarTinta() {
  const op = OPACIDADE_FOTO[estado.cena === "sol" ? estado.luz : "interno"];
  const cor = CORES_TRANSITIONS[estado.cor][1];
  const tL = $("#tintaL"), tR = $("#tintaR");
  const comL = !estado.comparar && estado.trat.includes("foto"), comR = estado.trat.includes("foto");
  [[tL, comL], [tR, comR]].forEach(([t, on]) => { if (t) { t.setAttribute("fill", cor); t.style.fillOpacity = on ? op : 0; } });
  const solForte = estado.cena === "sol" && (estado.luz === "sol" || estado.luz === "carro");
  const of = $("#simSvg .ofusca");
  if (of) of.setAttribute("opacity", solForte ? 0.3 : 0);
}

function desenharListaTrat() {
  const item = (t) => `<button class="trat ${estado.trat.includes(t.id) ? "is-on" : ""} ${estado.foco === t.id ? "is-foco" : ""}" data-trat="${t.id}" aria-pressed="${estado.trat.includes(t.id)}">
    <div><strong>${t.nome}</strong><span>${t.curto}</span></div><i class="tg" aria-hidden="true"></i></button>`;
  $("#tratDiamond").innerHTML = TRATAMENTOS.filter((t) => t.grupo === "diamond").map(item).join("");
  $("#tratExtra").innerHTML = TRATAMENTOS.filter((t) => t.grupo === "extra").map(item).join("");
  const todos = DIAMOND.every((k) => estado.trat.includes(k));
  $("#btnDiamond").textContent = todos ? "Desligar o pacote Diamond" : "Ligar o pacote Diamond completo";
  $("#btnDiamond").classList.toggle("is-on", todos);
  $("#fotoCtrl").hidden = !estado.trat.includes("foto") && estado.foco !== "foto";
  $("#swatches").innerHTML = CORES_TRANSITIONS.map(([n, c], i) =>
    `<button class="swatch" role="radio" aria-checked="${i === estado.cor}" aria-label="${n}" title="${n}" style="background:${c}" data-cor="${i}"></button>`).join("");
}

function desenharTextoTrat() {
  const t = tratPorId(estado.foco);
  const extra = t.id === "foto" ? `<p class="tiny muted">Cor escolhida: <strong>${CORES_TRANSITIONS[estado.cor][0]}</strong>. Na simulação a lente escurece em segundos; na vida real, clarear de volta leva alguns minutos.</p>`
    : t.id === "oleo" ? `<p class="tiny muted">Toque em “Passar a flanela”: na lente sem oleofóbica a gordura espalha; na lente com, sai.</p>`
    : t.id === "hidro" ? `<p class="tiny muted">Toque em “Molhar a lente” para ver a diferença.</p>`
    : t.id === "risco" || t.id === "estat" ? `<p class="tiny muted">Arraste o “Tempo de uso” para ver a lente envelhecer.</p>` : "";
  $("#tratTexto").innerHTML = `
    <p class="eyebrow">${t.grupo === "diamond" ? "Camada do antirreflexo Diamond" : "Opcional"}</p>
    <h3>${t.nome}</h3>
    <p>${t.texto}</p>
    <div class="semcom"><div><b>Sem</b>${t.sem}</div><div><b>Com</b>${t.com}</div></div>
    ${extra}`;
}

function desenharCamadas() {
  const ativo = (k) => estado.trat.includes(k);
  const algumDiamond = DIAMOND.some(ativo);
  const camadas = [
    ["Lente", true, "#9fd8f0", null],
    ["Antirrisco", ativo("risco"), "#6fd1c5", "risco"],
    ["Antiaderente (base)", algumDiamond, "#8fd3a8", null],
    ["Antiestática", ativo("estat"), "#a7c7ff", "estat"],
    ["Antirreflexo", ativo("ar"), "#c3a8ff", "ar"],
    ["Óleo-hidrofóbica", ativo("oleo") || ativo("hidro"), "#ffd27a", ativo("oleo") ? "oleo" : "hidro"],
  ];
  $("#camadas").innerHTML = camadas.map(([nome, on, cor, k], i) => {
    const y = 214 - i * 34 - (i ? 16 : 0), esp = i ? 9 : 26;
    const foco = k && (k === estado.foco || (estado.foco === "hidro" && i === 5) || (estado.foco === "oleo" && i === 5));
    return `<g opacity="${on ? 1 : 0.28}">
      <path d="M20,${y} L150,${y - 40} L250,${y - 40} L120,${y} Z" fill="${on ? cor : "#ddd"}" stroke="${foco ? "#0d1a13" : "rgba(13,26,19,.25)"}" stroke-width="${foco ? 2.5 : 1}"/>
      <path d="M20,${y} L120,${y} L120,${y + esp} L20,${y + esp} Z M120,${y} L250,${y - 40} L250,${y - 40 + esp} L120,${y + esp} Z" fill="${on ? cor : "#ddd"}" opacity=".7"/>
      <path d="M250,${y - 30} H272" stroke="#9aa39c"/>
      <text x="278" y="${y - 25}" font-size="14" font-weight="${foco ? 700 : 500}" fill="#17241b" font-family="Inter,system-ui,sans-serif">${nome}</text></g>`;
  }).join("");
}

function desenharFotoFab() {
  const f = FOTOS_FABRICANTE[estado.foco];
  const box = $("#fotoFab");
  if (!f) {
    box.innerHTML = `<p class="eyebrow">Cores Transitions Gen S</p>
      <div class="swatches">${CORES_TRANSITIONS.map(([n, c]) => `<span title="${n}" style="display:grid;justify-items:center;gap:4px;font-size:11px"><i class="swatch" style="background:${c};display:block"></i>${n}</span>`).join("")}</div>
      <p class="tiny muted">Lentes fotossensíveis são as que escurecem com o sol. Transitions Gen S é a marca disponível no portfólio Inoovax.</p>`;
    return;
  }
  const proporcao = f[0] === "ar-sem" ? "616 / 363" : f[0] === "azul-sem" ? "342 / 262" : "1";
  box.innerHTML = `<p class="eyebrow">Foto do fabricante · arraste</p>
    <div class="ba" style="aspect-ratio:${proporcao}">
      <img src="img/lentes/${f[0]}.jpg" alt="${f[2]}: sem tratamento">
      <img class="ba__com" src="img/lentes/${f[1]}.jpg" alt="${f[2]}: com tratamento">
      <span class="ba__line"></span>
      <div class="ba__tags"><span>SEM</span><span>COM</span></div>
    </div>`;
  const ba = $(".ba", box);
  const mover = (x) => {
    const r = ba.getBoundingClientRect();
    ba.style.setProperty("--p", `${Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100))}%`);
  };
  ba.addEventListener("pointerdown", (e) => { ba.setPointerCapture(e.pointerId); mover(e.clientX); });
  ba.addEventListener("pointermove", (e) => { if (e.buttons) mover(e.clientX); });
}

$("#p-tratamentos").addEventListener("click", (e) => {
  const t = e.target.closest("[data-trat]");
  if (t) {
    const id = t.dataset.trat;
    const tr = tratPorId(id);
    estado.trat = estado.trat.includes(id) && estado.foco === id ? estado.trat.filter((x) => x !== id) : [...new Set([...estado.trat, id])];
    estado.foco = id;
    if (tr.cena !== estado.cena) estado.cena = tr.cena;
    if (id === "hidro" && estado.trat.includes("hidro") && !molhado) { molhado = true; gotasSemente++; }
    if (id === "foto" && estado.luz === "interno") estado.luz = "sol";
    desenharSimulador();
    atualizarBadge();
    return;
  }
  const c = e.target.closest("[data-cena]");
  if (c) { estado.cena = c.dataset.cena; desenharSimulador(); return; }
  const l = e.target.closest("[data-luz]");
  if (l) {
    estado.luz = l.dataset.luz;
    estado.cena = "sol";
    redesenharSemPiscar();
    return;
  }
  const sw = e.target.closest("[data-cor]");
  if (sw) {
    estado.cor = Number(sw.dataset.cor);
    if (!estado.trat.includes("foto")) estado.trat = [...estado.trat, "foto"];
    estado.foco = "foto";
    redesenharSemPiscar();
    atualizarBadge();
  }
});

// redesenha mantendo a opacidade anterior da tinta e anima até a nova
function redesenharSemPiscar() {
  const antes = ["#tintaL", "#tintaR"].map((s) => $(s)?.style.fillOpacity ?? 0);
  desenharSimulador();
  ["#tintaL", "#tintaR"].forEach((s, i) => { const t = $(s); if (t) t.style.fillOpacity = antes[i]; });
  requestAnimationFrame(() => requestAnimationFrame(atualizarTinta));
}

$("#btnDiamond").addEventListener("click", () => {
  const todos = DIAMOND.every((k) => estado.trat.includes(k));
  estado.trat = todos ? estado.trat.filter((k) => !DIAMOND.includes(k)) : [...new Set([...estado.trat, ...DIAMOND])];
  if (!todos) { estado.foco = "ar"; molhado = true; gotasSemente++; }
  desenharSimulador();
  atualizarBadge();
});
$("#chkComparar").addEventListener("change", (e) => { estado.comparar = e.target.checked; desenharSimulador(); });
$("#rngUso").addEventListener("input", (e) => { estado.uso = Number(e.target.value); flanela = false; desenharSimulador(); });
$("#btnFlanela").addEventListener("click", () => {
  flanela = !flanela;
  if (flanela && estado.foco !== "oleo" && estado.foco !== "estat") estado.foco = "oleo";
  if (estado.cena !== "dia" && flanela) estado.cena = "dia";
  desenharSimulador();
});
$("#btnAgua").addEventListener("click", () => {
  molhado = !molhado;
  gotasSemente++;
  if (molhado) estado.foco = "hidro";
  desenharSimulador();
});

/* ===================== Resumo ===================== */
function atualizarBadge() {
  // qualquer escolha nova nas outras abas volta o orçamento para o padrão dessas escolhas
  estado.cfgManual = false;
  const n = estado.opcoes.length || (estado.escolha.lente ? 1 : 0) + (estado.escolha.material ? 1 : 0) + (estado.trat.length ? 1 : 0);
  const b = $("#badgeResumo");
  b.hidden = !n;
  b.textContent = n;
  salvar();
}

function textoTratamentos() {
  const tem = (k) => estado.trat.includes(k);
  const partes = [];
  if (DIAMOND.every(tem)) partes.push("Antirreflexo Diamond completo (antirrisco, antiestática, hidrofóbica e oleofóbica)");
  else DIAMOND.filter(tem).forEach((k) => partes.push(tratPorId(k).nome));
  if (tem("azul")) partes.push("Filtro azul");
  if (tem("foto")) partes.push(`Transitions Gen S cor ${CORES_TRANSITIONS[estado.cor][0]}`);
  return partes;
}

/* ===================== Orçamento (preço ao consumidor) ===================== */
const reais = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const GRUPOS_ORC = [
  ["Multifocal", ["Advanced Pro", "Advanced", "Plus", "Light", "Easy", "Multifocal pronta", "Bifocal"]],
  ["Ocupacional", ["Office", "Driver", "Relax"]],
  ["Visão simples", ["Single Vision", "Fast"]],
];
const ORDEM_COR = ["Incolor", "Transitions Gen S", "Fotossensível"];
const ORDEM_MAT = [...MATERIAIS.map((m) => m.id), null];
const filtrar = (f) => PRECOS.filter((p) => Object.entries(f).every(([k, v]) => p[k] === v));
const menor = (rows) => Math.min(...rows.map((r) => r.preco));
const unicos = (rows, k, ordem) => [...new Set(rows.map((r) => r[k]))].sort((a, b) => ordem.indexOf(a) - ordem.indexOf(b));
const nomeLinha = (linha) => (linha === "Multifocal pronta" ? linha : `Inoovax ${linha}`);
const nomeMat = (id) => (id ? matPorId(id).nome : "Resina");
const linhaDaLente = (id) => PRECOS.find((p) => p.lente === id)?.linha || null;
function apartirDe(lenteId) {
  const rows = PRECOS.filter((p) => p.lente === lenteId);
  return rows.length ? menor(rows) : null;
}
const cabe = (r, o) => (!r.esf || (o.esf >= r.esf[0] && o.esf <= r.esf[1])) && (!r.cil || (o.cil >= r.cil[0] && o.cil <= r.cil[1]));
const dentroDaFaixa = (r) => cabe(r, negativa(estado.rx.od)) && cabe(r, negativa(estado.rx.oe))
  && (!r.adicao || !estado.rx.ad || (estado.rx.ad >= r.adicao[0] && estado.rx.ad <= r.adicao[1]));
const precisaAdicao = (r) => /Multifocal|progressiva|Bifocal/i.test(r.tipo);
// a mesma combinação pode ter mais de uma linha na tabela (ex.: Fast "Cil Est"): vale a que cobre a receita
function linhaDaReceita(rows) {
  const ok = rows.find(dentroDaFaixa);
  return { row: ok || rows[0], fora: !ok };
}
const prefere = (lista, ...pref) => pref.find((p) => p != null && lista.includes(p)) ?? lista[0];

// completa a configuração para uma combinação que existe na tabela, mantendo o que der
function resolverCfg(c, querFoto = c.cor !== "Incolor") {
  const linhas = GRUPOS_ORC.flatMap(([, ls]) => ls);
  c.linha = prefere(linhas, c.linha, "Single Vision");
  const mats = unicos(filtrar({ linha: c.linha }), "material", ORDEM_MAT);
  c.material = prefere(mats, c.material, estado.material, "156");
  const cores = unicos(filtrar({ linha: c.linha, material: c.material }), "cor", ORDEM_COR);
  c.cor = querFoto ? prefere(cores, c.cor, "Transitions Gen S", "Fotossensível") : prefere(cores, c.cor, "Incolor");
  const trats = filtrar({ linha: c.linha, material: c.material, cor: c.cor });
  const nomes = unicos(trats, "trat", []).sort((a, b) => menor(filtrar({ ...c, trat: a })) - menor(filtrar({ ...c, trat: b })));
  const familia = /Blue|azul/.test(c.trat || "") ? /Blue|azul/ : /Green|verde/.test(c.trat || "") ? /Green|verde/ : null;
  c.trat = nomes.includes(c.trat) ? c.trat : (familia && nomes.find((t) => familia.test(t))) || nomes[0];
  return c;
}

// padrão vindo das outras abas: lente escolhida, material e tratamentos ligados
function cfgPadrao() {
  const tem = (k) => estado.trat.includes(k);
  const diamond = tem("ar");
  const linha = linhaDaLente(estado.escolha.lente || estado.lente);
  const fast = linha === "Fast";
  const trat = fast ? (diamond && tem("azul") ? "Antirreflexo + filtro azul" : tem("azul") ? "Filtro azul" : "Antirreflexo verde")
    : diamond && tem("azul") ? "Diamond Blue Total (com filtro azul)" : diamond ? "Diamond Green Total" : tem("azul") ? "Diamond Blue Total (com filtro azul)" : "Verniz (sem antirreflexo)";
  return resolverCfg({ linha, material: estado.escolha.material || estado.material, cor: tem("foto") ? "Transitions Gen S" : "Incolor", trat }, tem("foto"));
}

function precoAtual() {
  const c = estado.cfg;
  const rows = filtrar({ linha: c.linha, material: c.material, cor: c.cor, trat: c.trat });
  return rows.length ? linhaDaReceita(rows) : null;
}

function desenharOrcamento() {
  if (!estado.cfg || !estado.cfgManual) estado.cfg = cfgPadrao();
  const c = estado.cfg;
  $$("#chipsOrcVista button").forEach((b) => b.classList.toggle("is-on", b.dataset.vista === estado.orcVista));
  $("#orcMontar").hidden = estado.orcVista !== "montar";
  $("#orcTabela").hidden = estado.orcVista !== "tabela";

  const opc = (k, v, titulo, sub, extra = "") => `<button class="opc ${c[k] === v ? "is-on" : ""}" data-k="${k}" data-v="${v ?? ""}" ${extra}>
    <strong>${titulo}</strong>${sub ? `<small>${sub}</small>` : ""}</button>`;
  const lenteSemPreco = estado.escolha.lente && !linhaDaLente(estado.escolha.lente) ? porId(estado.escolha.lente) : null;
  const mats = unicos(filtrar({ linha: c.linha }), "material", ORDEM_MAT);
  const cores = unicos(filtrar({ linha: c.linha, material: c.material }), "cor", ORDEM_COR);
  const trats = unicos(filtrar({ linha: c.linha, material: c.material, cor: c.cor }), "trat", [])
    .map((t) => ({ t, ...linhaDaReceita(filtrar({ linha: c.linha, material: c.material, cor: c.cor, trat: t })) }))
    .sort((a, b) => a.row.preco - b.row.preco);
  const atual = precoAtual();
  const r = atual.row;
  const faixa = (f) => (f ? `${grau(f[0])} a ${grau(f[1])}` : "não informada");

  $("#orcMontar").innerHTML = `
    <div class="orc-receita">
      <span>Receita: <strong>${textoRx()}</strong></span>
      <button data-ir="materiais">Alterar</button>
    </div>
    ${lenteSemPreco ? `<p class="aviso">A Inoovax ${lenteSemPreco.nome} não está na tabela de preço ao consumidor. Escolha outra linha abaixo.</p>` : ""}
    <p class="eyebrow">1 · Linha</p>
    ${GRUPOS_ORC.map(([g, ls]) => `<p class="orc-grupo">${g}</p><div class="opc-grid">${ls.map((l) =>
      opc("linha", l, l === "Multifocal pronta" ? l : l + (filtrar({ linha: l })[0].pronta ? " <em>pronta</em>" : ""), `a partir de ${reais(menor(filtrar({ linha: l })))}`)).join("")}</div>`).join("")}
    <p class="eyebrow">2 · Material</p>
    <div class="opc-grid">${mats.map((m) => opc("material", m, nomeMat(m), `a partir de ${reais(menor(filtrar({ linha: c.linha, material: m })))}`)).join("")}</div>
    <p class="eyebrow">3 · Cor da lente</p>
    <div class="opc-grid">${cores.map((x) => opc("cor", x, x, x === "Incolor" ? "lente clara" : "escurece no sol")).join("")}</div>
    <p class="eyebrow">4 · Tratamento</p>
    <div class="opc-lista">${trats.map(({ t, row, fora }) => `<button class="opc-lin ${t === c.trat ? "is-on" : ""}" data-k="trat" data-v="${t}">
      <span>${t}${fora ? ' <small class="fora">fora da faixa da receita</small>' : ""}</span><b>${reais(row.preco)}</b></button>`).join("")}</div>
    <div class="orc-total">
      <div>
        <span>${r.par ? "Valor do par de lentes" : "Valor"}</span>
        <b>${reais(r.preco)}</b>
        <small>${r.nome || `${nomeLinha(c.linha)} · ${nomeMat(c.material)} · ${c.cor} · ${c.trat}`}</small>
        <small>Faixa: esf. ${faixa(r.esf)} · cil. ${faixa(r.cil)}${r.adicao ? ` · adição ${num(r.adicao[0])} a ${num(r.adicao[1])}` : ""}</small>
      </div>
      <button class="btn btn--primary" id="btnAddOpcao" ${estado.opcoes.length >= 4 ? "disabled" : ""}>${estado.opcoes.length >= 4 ? "Limite de 4 opções" : "Adicionar ao orçamento"}</button>
    </div>
    ${atual.fora ? `<p class="aviso">A receita (${textoRx()}) está fora da faixa desta lente na tabela. Confirme com o laboratório antes de fechar.</p>` : ""}
    ${precisaAdicao(r) && !estado.rx.ad ? `<p class="aviso">A receita está sem adição. Multifocal, ocupacional e bifocal precisam dela: confira a receita.</p>` : ""}`;

  desenharTabelaPrecos();
  desenharOpcoes();
}

function desenharTabelaPrecos() {
  const c = estado.cfg;
  const rows = filtrar({ linha: c.linha });
  const prontas = rows[0].pronta;
  let corpo;
  if (prontas) {
    corpo = `<table class="tab-precos"><thead><tr><th>Lente</th><th>Esférico</th><th>Cilíndrico</th><th>Valor</th></tr></thead><tbody>
      ${rows.map((r) => `<tr><td>${r.nome}</td><td>${r.esf ? `${grau(r.esf[0])} a ${grau(r.esf[1])}` : "—"}</td><td>${r.cil ? `${grau(r.cil[0])} a ${grau(r.cil[1])}` : "—"}</td>
        <td><button class="cel ${dentroDaFaixa(r) ? "" : "is-fora"}" data-pmat="${r.material ?? ""}" data-pcor="${r.cor}" data-ptrat="${r.trat}">${reais(r.preco)}</button></td></tr>`).join("")}
      </tbody></table>`;
  } else {
    const ordemTrat = ["Verniz", "Green Externo", "Blue Externo", "Green Total", "Blue Total"];
    const pos = (t) => ordemTrat.findIndex((o) => t.includes(o));
    const trats = unicos(rows, "trat", []).sort((a, b) => pos(a) - pos(b));
    const combos = [];
    unicos(rows, "material", ORDEM_MAT).forEach((m) => unicos(filtrar({ linha: c.linha, material: m }), "cor", ORDEM_COR).forEach((cor) => combos.push([m, cor])));
    corpo = `<table class="tab-precos"><thead><tr><th>Material · cor</th>${trats.map((t) => `<th>${t.replace(" (com filtro azul)", " ✦").replace(" (sem antirreflexo)", "")}</th>`).join("")}</tr></thead><tbody>
      ${combos.map(([m, cor]) => `<tr><th>${nomeMat(m)}<small>${cor}</small></th>${trats.map((t) => {
        const x = filtrar({ linha: c.linha, material: m, cor, trat: t });
        return `<td>${x.length ? `<button class="cel ${m === c.material && cor === c.cor && t === c.trat ? "is-on" : ""}" data-pmat="${m ?? ""}" data-pcor="${cor}" data-ptrat="${t}">${reais(menor(x))}</button>` : '<span class="muted">—</span>'}</td>`;
      }).join("")}</tr>`).join("")}</tbody></table>
      <p class="tiny muted">✦ = com filtro de luz azul. “Externo” = tratamento só na face de fora da lente. Valores do par de lentes.</p>`;
  }
  $("#orcTabela").innerHTML = `
    <p class="eyebrow">Tabela de preços ao consumidor</p>
    <div class="opc-grid opc-grid--linhas">${GRUPOS_ORC.flatMap(([, ls]) => ls).map((l) =>
      `<button class="opc ${l === c.linha ? "is-on" : ""}" data-k="linha" data-v="${l}"><strong>${l}</strong></button>`).join("")}</div>
    <h3 class="tab-titulo">${nomeLinha(c.linha)}${prontas ? " · lentes prontas" : ""}</h3>
    <div class="tab-wrap">${corpo}</div>
    <p class="tiny muted">Toque num valor para montar o orçamento com ele.${prontas ? " Em vermelho: fora da faixa da receita atual." : ""}</p>`;
}

function descricaoOpcao(o) {
  return o.nome || `${nomeLinha(o.linha)} · ${nomeMat(o.material)} · ${o.cor} · ${o.trat}`;
}

function desenharOpcoes() {
  $("#orcOpcoes").innerHTML = estado.opcoes.length
    ? estado.opcoes.map((o, i) => `<div class="orc-item">
        <span class="orc-n">${i + 1}</span>
        <div><strong>${descricaoOpcao(o)}</strong><small>${o.par ? "par de lentes" : "lente pronta"}${o.fora ? " · ⚠ receita fora da faixa" : ""}</small></div>
        <b>${reais(o.preco)}</b>
        <button class="orc-x" data-tirar="${i}" aria-label="Tirar a opção ${i + 1}">×</button></div>`).join("")
    : `<p class="muted orc-vazio">Monte a lente ao lado e toque em “Adicionar ao orçamento”. Dá para mandar até 4 opções para o cliente comparar.</p>`;
  $("#inpNome").value = estado.nome;
  $("#inpFone").value = estado.fone;
  $("#resumoTexto").textContent = montarTexto();
}

function montarTexto() {
  const ola = `Olá${estado.nome ? ", " + estado.nome.trim() : ""}!`;
  const fim = ["", "Qualquer dúvida, é só responder esta mensagem.", "Ótica Pinheiro · (92) 99309-5763"];
  if (estado.opcoes.length) {
    const linhas = [`${ola} Segue o orçamento das suas lentes na Ótica Pinheiro:`];
    estado.opcoes.forEach((o, i) => {
      linhas.push("", `${estado.opcoes.length > 1 ? `Opção ${i + 1}` : "Lente"}: ${descricaoOpcao(o)}`, `Valor: ${reais(o.preco)}${o.par ? " (par de lentes)" : ""}`);
    });
    linhas.push("", "Valores das lentes.");
    return [...linhas, ...fim].join("\n");
  }
  const l = estado.escolha.lente && porId(estado.escolha.lente);
  const m = estado.escolha.material && matPorId(estado.escolha.material);
  const t = textoTratamentos();
  const linhas = [`${ola} Aqui está o resumo da sua escolha na Ótica Pinheiro:`, ""];
  if (l) linhas.push(`• Lente: Inoovax ${l.nome} (${TIPOS[l.tipo].nome.toLowerCase()}) — ${l.tag.toLowerCase()}`);
  if (m) linhas.push(`• Material: ${m.nome} — ${m.frase.toLowerCase()}`);
  if (t.length) linhas.push(`• Tratamentos: ${t.join("; ")}`);
  if (!l && !m && !t.length) linhas.push("• (nenhuma escolha ainda)");
  return [...linhas, ...fim].join("\n");
}

$("#p-resumo").addEventListener("click", (e) => {
  const ir = e.target.closest("[data-ir]");
  if (ir) { irPara(ir.dataset.ir); return; }
  const vista = e.target.closest("[data-vista]");
  if (vista) { estado.orcVista = vista.dataset.vista; desenharOrcamento(); salvar(); return; }
  const o = e.target.closest("[data-k]");
  if (o) {
    const k = o.dataset.k, v = o.dataset.v || null;
    estado.cfg = resolverCfg({ ...estado.cfg, [k]: v }, k === "cor" ? v !== "Incolor" : estado.cfg.cor !== "Incolor");
    estado.cfgManual = true;
    desenharOrcamento(); salvar(); return;
  }
  const cel = e.target.closest("[data-pcor]");
  if (cel) {
    estado.cfg = resolverCfg({ ...estado.cfg, material: cel.dataset.pmat || null, cor: cel.dataset.pcor, trat: cel.dataset.ptrat });
    estado.cfgManual = true;
    estado.orcVista = "montar";
    desenharOrcamento(); salvar();
    $("#orcMontar .orc-total").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  if (e.target.closest("#btnAddOpcao")) {
    const { row, fora } = precoAtual();
    const ja = estado.opcoes.some((x) => x.linha === row.linha && x.material === row.material && x.cor === row.cor && x.trat === row.trat && x.preco === row.preco);
    if (ja) { aviso("Essa opção já está no orçamento"); return; }
    estado.opcoes = [...estado.opcoes, { linha: row.linha, material: row.material, cor: row.cor, trat: row.trat, nome: row.nome || null, preco: row.preco, par: !!row.par, fora }];
    aviso(`Opção ${estado.opcoes.length} adicionada: ${reais(row.preco)}`);
    atualizarBadge(); estado.cfgManual = true;
    desenharOrcamento(); return;
  }
  const tirar = e.target.closest("[data-tirar]");
  if (tirar) {
    estado.opcoes = estado.opcoes.filter((_, i) => i !== Number(tirar.dataset.tirar));
    atualizarBadge(); estado.cfgManual = true;
    desenharOrcamento();
  }
});
$("#inpNome").addEventListener("input", (e) => { estado.nome = e.target.value; $("#resumoTexto").textContent = montarTexto(); salvar(); });
$("#inpFone").addEventListener("input", (e) => { estado.fone = e.target.value; salvar(); });
$("#btnWa").addEventListener("click", () => {
  let fone = estado.fone.replace(/\D/g, "");
  if (fone.length === 10 || fone.length === 11) fone = "55" + fone;
  window.open(`https://wa.me/${fone}?text=${encodeURIComponent(montarTexto())}`, "_blank", "noopener");
});
$("#btnCopiar").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(montarTexto()); aviso("Texto copiado"); } catch { aviso("Não foi possível copiar"); }
});
$("#btnNovo").addEventListener("click", () => {
  const aba = "lentes";
  estado = { ...structuredClone(PADRAO), aba };
  flanela = false; molhado = false;
  salvar();
  iniciar();
  aviso("Pronto para o próximo cliente");
});

/* ===================== Barra de escolhas ===================== */
const RX_VAZIA = () => structuredClone(PADRAO.rx);
function filtrosAtuais() {
  const f = [];
  const tem = (k) => estado.trat.includes(k);
  const rx = estado.rx, vazia = RX_VAZIA();
  if (JSON.stringify(rx) !== JSON.stringify(vazia)) f.push({ id: "rx", aba: "materiais", tipo: "Receita", txt: textoRx() });
  if (estado.escolha.lente) f.push({ id: "lente", aba: "lentes", tipo: "Lente", txt: `Inoovax ${porId(estado.escolha.lente).nome}` });
  if (estado.escolha.material) f.push({ id: "material", aba: "materiais", tipo: "Material", txt: matPorId(estado.escolha.material).nome });
  estado.perfil.forEach((p) => f.push({ id: `perfil:${p}`, aba: "materiais", tipo: "Uso", txt: $(`#chipsPerfil [data-p="${p}"]`)?.textContent || p }));
  if (DIAMOND.every(tem)) f.push({ id: "trat:diamond", aba: "tratamentos", tipo: "Tratamento", txt: "Diamond completo" });
  else DIAMOND.filter(tem).forEach((k) => f.push({ id: `trat:${k}`, aba: "tratamentos", tipo: "Tratamento", txt: tratPorId(k).nome }));
  if (tem("azul")) f.push({ id: "trat:azul", aba: "tratamentos", tipo: "Tratamento", txt: "Filtro azul" });
  if (tem("foto")) f.push({ id: "trat:foto", aba: "tratamentos", tipo: "Tratamento", txt: `Transitions ${CORES_TRANSITIONS[estado.cor][0]}` });
  if (estado.opcoes.length) f.push({ id: "opcoes", aba: "resumo", tipo: "Orçamento", txt: estado.opcoes.length > 2 ? `${estado.opcoes.length} opções` : estado.opcoes.map((o) => reais(o.preco)).join(" / ") });
  return f;
}

function desenharFiltros() {
  const f = filtrosAtuais();
  $("#filtros").hidden = !f.length;
  $("#filtrosLista").innerHTML = f.map((x) => `<span class="filtro" data-aba="${x.aba}">
    <button class="filtro__ir" data-ir-f="${x.aba}"><small>${x.tipo}</small>${x.txt}</button>
    <button class="filtro__x" data-tirar-f="${x.id}" aria-label="Tirar ${x.tipo.toLowerCase()}: ${x.txt}">×</button></span>`).join("");
}

function tirarFiltro(id) {
  const [k, v] = id.split(":");
  if (k === "rx") estado.rx = RX_VAZIA();
  if (k === "lente") estado.escolha.lente = null;
  if (k === "material") estado.escolha.material = null;
  if (k === "perfil") estado.perfil = estado.perfil.filter((p) => p !== v);
  if (k === "trat") estado.trat = estado.trat.filter((t) => (v === "diamond" ? !DIAMOND.includes(t) : t !== v));
  if (k === "opcoes") estado.opcoes = [];
  estado.cfg = null;
}

$("#filtros").addEventListener("click", (e) => {
  const x = e.target.closest("[data-tirar-f]");
  if (x) { tirarFiltro(x.dataset.tirarF); iniciar(); return; }
  const ir = e.target.closest("[data-ir-f]");
  if (ir) { irPara(ir.dataset.irF); return; }
  if (e.target.closest("#btnLimpar")) {
    const antes = structuredClone(estado);
    ["rx", "lente", "material", "trat:diamond", "trat:azul", "trat:foto", "opcoes"].forEach(tirarFiltro);
    estado.trat = []; estado.perfil = [];
    iniciar();
    aviso("Escolhas limpas", { texto: "Desfazer", fn: () => { estado = antes; iniciar(); aviso("Escolhas de volta"); } });
  }
});

/* ===================== Início ===================== */
function iniciar() {
  desenharLentes();
  desenharTecnologias();
  desenharMateriais();
  atualizarBadge();
  irPara(estado.aba);
}
iniciar();
