// Apresentador de Lentes — dados
// Fontes: Portfólio Inoovax 2026, Cardápio Inoovax 2.0 e Folder Inovar (laboratório Inoovar Lentes).
// notas = [longe, intermediária, perto, conforto, adaptação]

const TODOS_MATERIAIS = ["cr39", "156", "poly", "160", "167", "174"];

const TIPOS = {
  simples: { nome: "Visão simples", resumo: "Um grau só em toda a lente: para longe ou para perto." },
  multifocal: { nome: "Multifocal (progressiva)", resumo: "Longe, meia distância e perto na mesma lente, sem linha aparente." },
  ocupacional: { nome: "Ocupacional", resumo: "Desenhada para uma rotina específica: escritório, telas ou volante." },
};

const TECNOLOGIAS = {
  sp: { nome: "Surfaçagem ponto a ponto", curto: "Lente esculpida por máquina digital",
    texto: "A superfície da lente é desbastada por máquina de controle numérico em milhares de pontos, seguindo o desenho calculado para a receita. Resultado: o grau sai mais exato em toda a lente, não só no centro." },
  pu: { nome: "Personalização única", curto: "Desenho calculado para a pessoa",
    texto: "O desenho da progressão é gerado com os dados de quem vai usar (receita e anamnese). Cada par é único, e não um molde de prateleira." },
  ff: { nome: "Tecnologia freeform", curto: "Desenho na face interna",
    texto: "O desenho é feito na face de trás, mais perto do olho. Assim os campos de visão ficam mais largos e as laterais menos borradas do que numa progressiva convencional." },
  ca: { nome: "Campos visuais amplos", curto: "Áreas nítidas maiores",
    texto: "As áreas de visão nítida para longe, meia distância e perto são mais largas, então a pessoa mexe menos a cabeça para achar o foco." },
  dr: { nome: "Distorções reduzidas", curto: "Menos borrão nas laterais",
    texto: "Toda progressiva tem regiões laterais menos nítidas. Esta tecnologia diminui essas regiões e a sensação de imagem 'torta' ao olhar de lado." },
  ti: { nome: "Transição inteligente", curto: "Passagem suave entre distâncias",
    texto: "A mudança de grau entre longe, meia distância e perto é mais suave. O olho passa de uma distância para outra sem 'degrau'." },
  as: { nome: "Lentes asféricas", curto: "Curva mais plana e fina",
    texto: "A curvatura varia do centro para a borda. A lente fica mais plana e fina, com menos efeito de aumento ou diminuição dos olhos para quem vê de fora." },
  ds: { nome: "Digital surface", curto: "Pensada para a era das telas",
    texto: "Desenho que considera o uso intenso de celular, tablet e computador nas zonas de perto e meia distância." },
  vd: { nome: "Visão dinâmica", curto: "Imagem estável em movimento",
    texto: "Reduz o efeito de 'balanço' ou flutuação ao mexer a cabeça ou andar, comum em quem está se adaptando a uma multifocal." },
  br: { nome: "Bordas reduzidas em alta dioptria", curto: "Bordas mais finas em graus altos",
    texto: "Otimiza a espessura das bordas quando o grau é alto, deixando o óculos mais leve e bonito na armação." },
  ia: { nome: "Inteligência artificial", curto: "Cálculo e produção otimizados",
    texto: "O laboratório Inoovar usa inteligência artificial para analisar dados de produção, melhorar a personalização e monitorar a qualidade de cada lente em tempo real." },
};
const ORDEM_TEC = ["sp", "pu", "ff", "ca", "dr", "ti", "as", "ds", "vd", "br", "ia"];

const LENTES = [
  {
    id: "advanced-pro", nome: "Advanced Pro", tipo: "multifocal", cor: "#3b6fb6", marcacao: "INAP",
    tag: "O topo da linha multifocal",
    desc: "Design exclusivo e personalizado para cada usuário, com conforto em todos os ângulos. Segundo o fabricante, até 90% menos efeito de flutuação.",
    para: "Quem quer o máximo desempenho e conforto no dia a dia.",
    atividades: ["Qualquer atividade"],
    notas: [5, 5, 5, 5, 5], adicao: "0,75 a 3,50", altura: "14 mm", materiais: TODOS_MATERIAIS,
    tecs: ORDEM_TEC, campo: "prog",
    fala: [
      "É a única da linha com as 11 tecnologias do laboratório.",
      "Campos nítidos amplos em todas as distâncias: menos 'procurar o foco' com a cabeça.",
      "A melhor escolha para quem já teve dificuldade de adaptação com outra multifocal.",
    ],
  },
  {
    id: "advanced", nome: "Advanced", tipo: "multifocal", cor: "#f28c28", marcacao: "INA",
    tag: "Conforto em todas as distâncias",
    desc: "Design progressivo com as mais avançadas tecnologias de otimização e bordas mais finas. Segundo o fabricante, até 50% menos efeito de flutuação.",
    para: "Quem busca conforto em todas as distâncias e uma adaptação fácil.",
    atividades: ["Dirigir", "Computador", "Esportes", "Ler", "Adaptação"],
    notas: [5, 4, 4, 5, 4], adicao: "0,75 a 3,50", altura: "14 mm", materiais: TODOS_MATERIAIS,
    tecs: ["sp", "pu", "ff", "ca", "dr", "ti", "as", "ds", "br", "ia"], campo: "prog",
    fala: [
      "Tem 10 das 11 tecnologias; só fica sem a visão dinâmica da Advanced Pro.",
      "Ótima para quem dirige, usa computador e pratica esportes.",
      "Melhor relação entre desempenho e investimento da linha premium.",
    ],
  },
  {
    id: "plus", nome: "Plus", tipo: "multifocal", cor: "#8f99a3", marcacao: "INP",
    tag: "Mais área para perto e meia distância",
    desc: "Para quem precisa de uma zona maior de visão intermediária e de perto, sem comprometer a visão de longe. Nitidez em quase toda a área útil da lente.",
    para: "Quem quer uma multifocal acessível sem abrir mão de qualidade e tecnologia.",
    atividades: ["Dirigir", "Computador", "TV", "Ler", "Adaptação"],
    notas: [4, 3, 4, 4, 4], adicao: "0,75 a 3,50", altura: "14 mm", materiais: TODOS_MATERIAIS,
    tecs: ["sp", "pu", "ff", "ca", "dr", "ds", "br", "ia"], campo: "prog",
    fala: [
      "Freeform e personalizada, com campos amplos.",
      "Boa para quem lê bastante e assiste TV.",
      "Degrau de entrada para a tecnologia freeform completa.",
    ],
  },
  {
    id: "light", nome: "Light", tipo: "multifocal", cor: "#3fa9f5", marcacao: "INL",
    tag: "Equilíbrio entre qualidade e preço",
    desc: "Transições suaves entre longe, intermediário e perto, com adaptação facilitada e visão estável. Boa nitidez para leitura, telas e visão geral.",
    para: "Quem busca praticidade e confiança na multifocal.",
    atividades: ["Computador", "Ler", "Adaptação"],
    notas: [3.5, 3.5, 3.5, 3.5, 3.5], adicao: "0,75 a 3,50", altura: "14 mm", materiais: TODOS_MATERIAIS,
    tecs: ["sp", "pu", "ff", "dr", "ds", "br", "ia"], campo: "prog",
    fala: [
      "Freeform e personalizada a um preço intermediário.",
      "Indicada para quem usa computador e lê no dia a dia.",
      "Boa primeira multifocal para quem quer adaptação tranquila.",
    ],
  },
  {
    id: "basic", nome: "Basic", tipo: "multifocal", cor: "#d6338a", marcacao: "BSC",
    tag: "Para quem está começando",
    desc: "A progressiva de entrada da família Inoovax, com design funcional e transições suaves entre longe, intermediário e perto.",
    para: "Quem está iniciando no uso de multifocais e quer uma solução simples.",
    atividades: ["Computador", "Ler", "Adaptação"],
    notas: [3, 3, 3, 3, 3], adicao: "1,00 a 3,50", altura: "14 mm", materiais: ["156", "poly"],
    tecs: ["sp", "pu", "ds", "br"], campo: "prog",
    fala: [
      "Progressiva digital com bom custo-benefício.",
      "Disponível só em 1.56 e policarbonato.",
      "Para graus altos ou quem quer campos mais largos, suba para a Light.",
    ],
  },
  {
    id: "easy", nome: "Easy", tipo: "multifocal", cor: "#2f5d8c", marcacao: "INE",
    tag: "Progressiva simples e acessível",
    desc: "Progressiva de entrada, funcional e confortável para o dia a dia, com boa adaptação e uma experiência visual simples.",
    para: "Quem busca uma multifocal com o melhor custo-benefício.",
    atividades: ["Ler", "Adaptação"],
    notas: [2.5, 2.5, 2.5, 2.5, 2.5], adicao: "1,00 a 3,50", altura: "14 mm", materiais: TODOS_MATERIAIS,
    tecs: ["sp", "ds"], campo: "prog",
    fala: [
      "A porta de entrada para a multifocal Inoovax.",
      "Atende bem leitura e uso diário com orçamento menor.",
      "Mostre a diferença de campo para a Light no mapa de nitidez.",
    ],
  },
  {
    id: "office", nome: "Office", tipo: "ocupacional", cor: "#8a5a36", marcacao: "INO",
    tag: "Para o escritório e o computador",
    desc: "Progressiva ocupacional para ambientes fechados, com visão ampla e nítida de perto e na meia distância. Alcance de 2 ou 4 metros.",
    para: "Quem usa computador e trabalha o dia todo em escritório.",
    atividades: ["Curtas distâncias", "Computador", "TV", "Ler", "Adaptação"],
    notas: [1, 5, 5, 5, 5], adicao: "0,75 a 3,50", altura: "14 mm", materiais: TODOS_MATERIAIS, alcance: "2 ou 4 metros",
    tecs: ["sp", "pu", "ff", "dr", "ti", "as", "ds", "vd", "br"], campo: "office",
    cena: { src: "img/cenas/office.jpg", nome: "Escritório", prop: 590 / 393, fy: 0.5 },
    fala: [
      "Não substitui o óculos de rua: é para a mesa de trabalho.",
      "Tela, papel e reunião ficam nítidos sem levantar o queixo.",
      "Ótimo segundo par para quem já usa multifocal.",
    ],
  },
  {
    id: "driver", nome: "Driver", tipo: "ocupacional", cor: "#6b2fa0", marcacao: "IND",
    tag: "Feita para quem dirige",
    desc: "Para motoristas que passam horas ao volante. Transição suave entre as distâncias, com visão nítida do painel, dos retrovisores e da estrada.",
    para: "Quem fica de 4 a 8 horas por dia ao volante.",
    atividades: ["Dirigir", "Adaptação"],
    notas: [5, 4, 4, 5, 4], adicao: "0,75 a 3,50", altura: "14 mm", materiais: TODOS_MATERIAIS,
    tecs: ["sp", "pu", "ff", "ca", "dr", "ti", "as", "ds", "br"], campo: "driver",
    cena: { src: "img/cenas/driver.jpg", nome: "Dirigindo", prop: 474 / 360, fy: 0.45 },
    fala: [
      "Estrada, painel e retrovisores com pouco movimento de cabeça.",
      "Combine com antirreflexo Diamond: menos reflexo dos faróis à noite.",
      "Para motorista de aplicativo, táxi, caminhão e viagens longas.",
    ],
  },
  {
    id: "relax", nome: "Relax", tipo: "ocupacional", cor: "#9aab00", marcacao: "INVR",
    tag: "Para longas horas de tela",
    desc: "Visão simples com uma área de apoio para perto, pensada para quem passa muitas horas em telas, celular e livros e sente o olho cansado.",
    para: "Adultos de 30 a 42 anos com rotina intensa de telas e leitura.",
    atividades: ["Curtas distâncias", "Computador", "TV", "Ler", "Adaptação"],
    notas: [5, 5, 5, 5, 5], adicao: null, altura: "—", materiais: TODOS_MATERIAIS,
    potencia: "0,50 (30 a 35 anos) · 0,75 (35 a 39) · 1,00 (40 a 42)",
    tecs: ["sp", "ff", "as", "ds", "vd", "br"], campo: "relax",
    cena: { src: "img/cenas/relax.jpg", nome: "Celular", prop: 1000 / 900, fy: 0.5 },
    fala: [
      "Parece uma visão simples, mas tem um 'empurrãozinho' para perto na parte de baixo.",
      "O apoio é escolhido pela idade: 0,50, 0,75 ou 1,00.",
      "Para quem ainda não precisa de multifocal, mas cansa no fim do dia.",
    ],
  },
  {
    id: "single-vision", nome: "Single Vision", tipo: "simples", cor: "#1e3a8a", marcacao: "INV",
    tag: "Visão simples freeform",
    desc: "Lente de visão simples freeform com a tecnologia All Vision do laboratório Inoovar, que deixa toda a lente nítida até as bordas.",
    para: "Qualquer pessoa que use óculos só para longe ou só para perto.",
    atividades: ["Qualquer atividade"],
    notas: [5, 5, 5, 5, 5], adicao: null, altura: "—", materiais: TODOS_MATERIAIS,
    tecs: ["sp", "ff", "ca", "as", "ds", "vd", "br"], campo: "sv",
    fala: [
      "Visão simples feita com desenho freeform, não só surfaçagem comum.",
      "All Vision: nitidez até a borda da lente, ótima em armações grandes.",
      "Mostre na aba Materiais como a lente afina nos índices altos.",
    ],
  },
  {
    id: "kids", nome: "Kids", tipo: "simples", cor: "#22a06b", marcacao: "INK",
    tag: "Para crianças e adolescentes",
    desc: "Desenvolvida para crianças e adolescentes de 0 a 17 anos que precisam de correção visual. O fabricante a apresenta com tecnologia de controle da progressão da miopia.",
    para: "Crianças e adolescentes de 0 a 17 anos.",
    atividades: ["Escola", "Brincar", "Telas"],
    notas: [5, 5, 5, 5, 5], adicao: null, altura: "—", materiais: TODOS_MATERIAIS,
    tecs: ["sp", "ff", "as", "ds", "vd", "br"], campo: "sv",
    fala: [
      "Para os pequenos, prefira policarbonato: é o mais resistente a impactos.",
      "O fabricante recomenda uso de pelo menos 12 horas por dia.",
      "Controle de miopia é indicação do oftalmologista: não prometa resultado.",
    ],
    aviso: "Não prometa redução de grau. Os números do fabricante (até 70% com uso de 12 h/dia) dependem de cada criança e do acompanhamento médico.",
  },
  {
    // fonte: "tabela inoovax fast.pdf" (lentes prontas da loja); o portfólio do fabricante não traz notas nem tecnologias
    id: "fast", nome: "Fast", tipo: "simples", cor: "#e8603c", marcacao: "—",
    tag: "Lente pronta, de estoque",
    desc: "Visão simples pronta, que já vem fabricada do laboratório. Não é feita sob medida: por isso sai mais rápido e é a opção mais em conta.",
    para: "Graus simples dentro da faixa da tabela, para quem quer economia e rapidez.",
    atividades: ["Uso geral", "Óculos reserva"],
    notas: null, adicao: null, altura: "—", materiais: ["156", "poly", "167", "174"],
    tecs: [], campo: "pronta",
    fala: [
      "É lente pronta: o grau precisa estar dentro da faixa da tabela.",
      "Cilíndrico acima de 2,00 usa a versão “Cil Est”, com outro preço; o orçamento já escolhe sozinho.",
      "Se o cliente quer nitidez até a borda, mostre a Single Vision (freeform).",
    ],
  },
];

// Materiais: n = índice de refração; abbe = nitidez nas bordas (maior = menos franja colorida);
// dens = g/cm³. Valores típicos de mercado; espessuras e pesos calibrados com o cardápio Inoovax.
// Modelo de espessura: borda (negativo) = t0m + k·Δ ; centro (positivo) = t0p + k·Δ ; Δ = h²·|P| / (2000·(n−1))
const MATERIAIS = [
  { id: "cr39", nome: "CR-39", indice: "1.50", n: 1.498, abbe: 58, dens: 1.32, impacto: 2, k: 1.069, t0m: 2.07, t0p: 0.87,
    frase: "Lente acessível a todos", desc: "Resina clássica, com a melhor nitidez óptica (Abbe 58). Mais grossa em graus altos.",
    bom: "Graus baixos (até ±2,00) e quem busca o menor preço." },
  { id: "156", nome: "Resina 1.56", indice: "1.56", n: 1.56, abbe: 37, dens: 1.23, impacto: 2, k: 1.03, t0m: 1.7, t0p: 0.95,
    frase: "Mais fina que o CR-39", desc: "Um pouco mais fina e leve que o CR-39, com ótimo custo-benefício.",
    bom: "Graus baixos e moderados (até ±3,00)." },
  { id: "poly", nome: "Policarbonato", indice: "1.59", n: 1.586, abbe: 30, dens: 1.20, impacto: 5, k: 1.035, t0m: 1.37, t0p: 1.27,
    frase: "Leve e resistente a impactos", desc: "O mais resistente a impactos e o mais leve por volume. Ideal para segurança.",
    bom: "Crianças, esportes e armações de fio de nylon ou parafusadas." },
  { id: "160", nome: "Alto índice 1.60", indice: "1.60", n: 1.60, abbe: 41, dens: 1.30, impacto: 4, k: 0.95, t0m: 1.4, t0p: 0.9,
    frase: "Fina e com boa nitidez", desc: "Bem mais fina que o CR-39 e com nitidez acima do policarbonato.",
    bom: "Graus moderados (±2,00 a ±4,00) e armações parafusadas." },
  { id: "167", nome: "Alto índice 1.67", indice: "1.67", n: 1.67, abbe: 32, dens: 1.35, impacto: 3, k: 0.888, t0m: 1.40, t0p: 1.0,
    frase: "Lente ultrafina", desc: "Ultrafina, para graus altos ficarem discretos na armação.",
    bom: "Graus altos (±4,00 a ±6,00)." },
  { id: "174", nome: "Alto índice 1.74", indice: "1.74", n: 1.74, abbe: 33, dens: 1.47, impacto: 3, k: 0.794, t0m: 1.43, t0p: 0.43,
    frase: "Espessura mínima e ultratransparente", desc: "A mais fina disponível. Para os graus mais altos.",
    bom: "Graus muito altos (acima de ±6,00)." },
];

// Tabela do Cardápio Inoovax 2.0 (lente de 65 mm): [grau, espessura (mm), peso (g)]
// grau negativo = espessura da borda; grau positivo = espessura do centro
const CATALOGO_ESPESSURA = {
  cr39: { "-1": [3.2, 11.3], "-4": [6.6, 18.6], "4": [5.4, 14.9] },
  poly: { "-1": [2.3, 6.5], "-4": [5.1, 12.0], "4": [5.0, 12.9] },
  "167": { "-1": [2.1, 8.2], "-4": [4.2, 12.3], "4": [3.8, 11.2] },
  "174": { "-1": [2.0, 8.2], "-4": [3.7, 12.0], "4": [2.7, 8.4] },
};

const TRATAMENTOS = [
  { id: "ar", nome: "Antirreflexo", grupo: "diamond", cena: "noite",
    curto: "Some com os reflexos da lente",
    texto: "Camadas finíssimas cancelam o reflexo da luz na superfície. Quem olha vê os seus olhos, não o reflexo. À noite, faróis e postes ficam sem halos e imagens fantasmas.",
    sem: "Reflexos e halos em volta das luzes", com: "Imagem limpa, sem 'fantasmas'" },
  { id: "hidro", nome: "Hidrofóbica", grupo: "diamond", cena: "dia",
    curto: "A água escorre em gotas",
    texto: "A camada repele a água: em vez de formar uma película que embaça, a água vira gotinhas que escorrem e secam rápido. Útil na chuva e com a umidade de Manaus.",
    sem: "Película de água que borra", com: "Gotas pequenas que escorrem" },
  { id: "oleo", nome: "Oleofóbica", grupo: "diamond", cena: "dia",
    curto: "Menos marca de dedo e gordura",
    texto: "Dificulta a aderência de gordura da pele e de digitais. As marcas que aparecem saem com uma passada de flanela, sem espalhar.",
    sem: "Digitais que espalham ao limpar", com: "Sai com uma passada de pano", limpar: true },
  { id: "estat", nome: "Antiestática", grupo: "diamond", cena: "dia",
    curto: "Atrai menos poeira",
    texto: "A lente não acumula carga elétrica, então atrai menos poeira e fiapos. Fica limpa por mais tempo.",
    sem: "Poeira grudada na lente", com: "Bem menos poeira" },
  { id: "risco", nome: "Antirrisco", grupo: "diamond", cena: "dia",
    curto: "Superfície mais dura",
    texto: "Um verniz endurecido protege a resina contra o desgaste do dia a dia. Reduz os riscos finos, mas nenhuma lente é à prova de riscos: guardar no estojo continua importante.",
    sem: "Riscos finos com o uso", com: "Muito menos riscos" },
  { id: "azul", nome: "Filtro azul", grupo: "extra", cena: "tela",
    curto: "Mais conforto nas telas",
    texto: "Filtra parte da luz azul-violeta emitida por celular, computador e TV (até cerca de 420–435 nm, segundo o fabricante). Muita gente relata mais conforto em longas horas de tela. A lente tem um leve reflexo azulado.",
    sem: "Brilho azulado forte da tela", com: "Imagem mais confortável" },
  { id: "foto", nome: "Transitions Gen S", grupo: "extra", cena: "sol",
    curto: "Clara dentro, escura no sol",
    texto: "A lente escurece com a radiação UV do sol em poucos segundos e volta a clarear em ambiente interno. Disponível em 8 cores. Atrás do para-brisa do carro escurece pouco, porque o vidro barra a maior parte do UV.",
    sem: "Ofuscamento no sol", com: "Escurece sozinha no sol" },
];

const CORES_TRANSITIONS = [
  ["Cinza", "#4f5458"], ["Marrom", "#6e4526"], ["Verde-grafite", "#3d5243"], ["Âmbar", "#a8651f"],
  ["Ametista", "#5e3f8c"], ["Safira", "#244f96"], ["Rubi", "#8f1a2e"], ["Esmeralda", "#17694d"],
];

// Fotos do fabricante (Portfólio 2026): [arquivo sem, arquivo com, legenda]
const FOTOS_FABRICANTE = {
  ar: ["ar-sem", "ar-com", "Antirreflexo Diamond"],
  hidro: ["ar-hidrofobica-sem", "ar-hidrofobica-com", "Camada hidrofóbica"],
  oleo: ["ar-oleofobica-sem", "ar-oleofobica-com", "Camada oleofóbica"],
  estat: ["ar-antiestatica-sem", "ar-antiestatica-com", "Camada antiestática"],
  risco: ["ar-antirrisco-sem", "ar-antirrisco-com", "Camada antirrisco"],
  azul: ["azul-sem", "azul-com", "Filtro azul"],
};
