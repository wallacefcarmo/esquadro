const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Santiago Pivetta";
pres.title = "Sistema de Gestao de Fabrica - BNG Metalmecanica";

const W = 13.33, H = 7.5;
const NAVY = "0F2C4C";
const NAVY2 = "17416B";
const STEEL = "35709E";
const AMBER = "F2A007";
const AMBER_L = "FDE9C4";
const BG = "F4F6F8";
const CARD = "FFFFFF";
const LINE = "DCE3EA";
const TXT = "2A3947";
const MUTED = "62727F";
const HEAD = "Cambria";
const BODY = "Calibri";

const sh = () => ({ type: "outer", color: "9AAAB8", blur: 8, offset: 2, angle: 90, opacity: 0.25 });

function base(dark) {
  const s = pres.addSlide();
  s.background = { color: dark ? NAVY : BG };
  return s;
}

function title(s, t, sub) {
  s.addText(t, {
    x: 0.6, y: 0.42, w: 12.13, h: 0.62, fontFace: HEAD, fontSize: 32, bold: true,
    color: NAVY, align: "left", margin: 0
  });
  if (sub) {
    s.addText(sub, {
      x: 0.62, y: 1.05, w: 12.1, h: 0.36, fontFace: BODY, fontSize: 14,
      color: MUTED, align: "left", margin: 0
    });
  }
}

function numDot(s, n, x, y, d, fill, fg) {
  s.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill || AMBER } });
  s.addText(String(n), {
    x, y, w: d, h: d, fontFace: BODY, fontSize: 13, bold: true,
    color: fg || NAVY, align: "center", valign: "middle", margin: 0
  });
}

function card(s, x, y, w, h, fill) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: fill || CARD }, line: { color: LINE, width: 1 }, shadow: sh()
  });
}

/* ============ 1. CAPA ============ */
{
  const s = base(true);
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: NAVY } });
  // motivo: malha de circulos
  for (let i = 0; i < 7; i++) {
    s.addShape(pres.ShapeType.ellipse, {
      x: 9.4 + (i % 4) * 1.0, y: 0.6 + Math.floor(i / 4) * 1.0, w: 0.55, h: 0.55,
      fill: { color: STEEL, transparency: 55 }
    });
  }
  s.addShape(pres.ShapeType.ellipse, { x: 0.6, y: 1.72, w: 0.42, h: 0.42, fill: { color: AMBER } });
  s.addText("PROPOSTA DE PROJETO   |   JULHO / 2026", {
    x: 1.18, y: 1.72, w: 8, h: 0.42, fontFace: BODY, fontSize: 12.5, bold: true,
    color: AMBER, charSpacing: 2, valign: "middle", margin: 0
  });
  s.addText("Sistema de Gestão\nde Fábrica", {
    x: 0.6, y: 2.35, w: 8.6, h: 1.9, fontFace: HEAD, fontSize: 50, bold: true,
    color: "FFFFFF", lineSpacing: 52, margin: 0
  });
  s.addText("BNG Metalmecânica  ·  PCP, apontamento e controle de Ordens de Serviço em tempo real, do escritório ao chão de fábrica.", {
    x: 0.62, y: 4.45, w: 8.4, h: 0.8, fontFace: BODY, fontSize: 15.5, color: "C7D7E5", margin: 0
  });
  const chips = ["PREPARAÇÃO", "SOLDAGEM", "MONTAGEM", "USINAGEM"];
  chips.forEach((c, i) => {
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.6 + i * 2.45, y: 5.65, w: 2.25, h: 0.52, rectRadius: 0.26,
      fill: { color: NAVY2 }, line: { color: STEEL, width: 1 }
    });
    s.addText(c, {
      x: 0.6 + i * 2.45, y: 5.65, w: 2.25, h: 0.52, fontFace: BODY, fontSize: 11.5,
      bold: true, color: "DCE9F5", align: "center", valign: "middle", margin: 0
    });
  });
  s.addText("Documento elaborado a partir das Programações da Semana 26 (22 a 24/06/2026)", {
    x: 0.6, y: 6.55, w: 9, h: 0.3, fontFace: BODY, fontSize: 11, italic: true, color: "8FA8BE", margin: 0
  });
  s.addNotes("Proposta de sistema de gestao para a BNG Metalmecanica, construida a partir das programacoes semanais reais dos quatro setores produtivos.");
}

/* ============ 2. PONTO DE PARTIDA ============ */
{
  const s = base();
  title(s, "O ponto de partida: a rotina real da fábrica", "Os quatro setores já são programados hoje — em planilhas e PDFs separados, um arquivo por setor, por líder e por dia.");

  const sect = [
    { n: "PREPARAÇÃO", d: "CNC 01 e 02 (dia e noite), policorte, metaleira, serra fita, furadeira, traçagem de furação e de perfis, chanfro, calandra, acabamento e lixamento.", k: "Programado por posto de trabalho" },
    { n: "SOLDAGEM", d: "Líder, supervisor, soldadores e lixadores. Já existe campo de previsto × realizado, hora de início e volume de solda em milímetros.", k: "Programado por colaborador" },
    { n: "MONTAGEM", d: "Duplas de montadores trabalhando por desenho e folha (ex.: SGM-PE0005-FAB-DR-002-P, folha 1/18), com etapas de início, continuação e reparo.", k: "Programado por desenho" },
    { n: "USINAGEM", d: "Torno TR2, Torno Vertical, Torno L300200, Fresa M1500, Fresa M2000 (01 e 02), mandrilhadora Cutmaz. Status: sequência, manutenção, finalizado.", k: "Programado por máquina" }
  ];
  sect.forEach((it, i) => {
    const x = 0.6 + (i % 2) * 6.23, y = 1.62 + Math.floor(i / 2) * 2.62;
    card(s, x, y, 5.9, 2.35);
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.32, y: y + 0.3, w: 0.36, h: 0.36, fill: { color: AMBER } });
    s.addText(it.n, {
      x: x + 0.82, y: y + 0.26, w: 4.8, h: 0.44, fontFace: BODY, fontSize: 15, bold: true,
      color: NAVY, valign: "middle", margin: 0
    });
    s.addText(it.d, {
      x: x + 0.34, y: y + 0.82, w: 5.24, h: 1.02, fontFace: BODY, fontSize: 12, color: TXT, margin: 0
    });
    s.addText(it.k, {
      x: x + 0.34, y: y + 1.86, w: 5.24, h: 0.3, fontFace: BODY, fontSize: 11, bold: true,
      color: STEEL, margin: 0
    });
  });
  s.addNotes("Nada aqui e invencao: e a leitura das quatro programacoes da Semana 26 que ja circulam na fabrica.");
}

/* ============ 3. O QUE TRAVA HOJE ============ */
{
  const s = base();
  title(s, "O que trava hoje", "Seis gargalos que aparecem nos próprios arquivos analisados.");

  const probs = [
    ["Uma versão por arquivo", "Cada setor, líder e dia gera um PDF ou planilha própria. Não existe uma versão única e válida da programação."],
    ["Distribuição manual", "O arquivo vai impresso ou por WhatsApp. Se a programação muda às 10h, quem já imprimiu continua com a versão velha."],
    ["Realizado em branco", "Na programação de solda, quase toda linha de \"realizado (hs)\" está marcada como \"a confirmar\". O dado nunca fecha o ciclo."],
    ["Sem avanço da OS", "Não existe percentual de conclusão. Saber quanto falta da OS 018/26 depende de perguntar a cada líder."],
    ["Redigitação constante", "A mesma OS é digitada de novo em preparação, solda, montagem e usinagem — com risco de divergência entre elas."],
    ["Histórico que se perde", "Sem base de dados, não dá para comparar semanas, medir produtividade real nem estimar prazo por histórico."]
  ];
  probs.forEach((p, i) => {
    const x = 0.6 + (i % 3) * 4.12, y = 1.66 + Math.floor(i / 3) * 2.55;
    card(s, x, y, 3.86, 2.28);
    numDot(s, i + 1, x + 0.3, y + 0.28, 0.38);
    s.addText(p[0], {
      x: x + 0.78, y: y + 0.24, w: 2.9, h: 0.46, fontFace: BODY, fontSize: 14, bold: true,
      color: NAVY, valign: "middle", margin: 0
    });
    s.addText(p[1], {
      x: x + 0.3, y: y + 0.82, w: 3.3, h: 1.3, fontFace: BODY, fontSize: 11.5, color: TXT, margin: 0
    });
  });
  s.addNotes("Os seis pontos saem da leitura dos arquivos, nao de suposicao.");
}

/* ============ 4. A IDEIA ============ */
{
  const s = base(true);
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: NAVY } });
  s.addText("A ideia do projeto", {
    x: 0.6, y: 0.6, w: 12.1, h: 0.6, fontFace: HEAD, fontSize: 32, bold: true, color: "FFFFFF", margin: 0
  });
  s.addText("Uma única base de dados da Ordem de Serviço: o PCP alimenta uma vez, os quatro setores consomem a mesma informação e devolvem o realizado em tempo real.", {
    x: 0.6, y: 1.38, w: 11.4, h: 0.9, fontFace: BODY, fontSize: 18, color: AMBER, margin: 0
  });

  const pil = [
    ["PROGRAMAR", "O PCP monta a programação da semana no sistema, por setor, colaborador e máquina. Publicou, todo mundo enxerga a mesma coisa.", "Substitui os PDFs semanais"],
    ["EXECUTAR", "O líder abre o celular, vê o que é dele no dia e aponta início, fim, quantidade e ocorrências direto no posto de trabalho.", "Substitui o preenchimento à mão"],
    ["MEDIR", "Previsto × realizado alimenta automaticamente o avanço da OS, a produtividade por setor e o risco de atraso de cada obra.", "Cria o que hoje não existe"]
  ];
  pil.forEach((p, i) => {
    const x = 0.6 + i * 4.12;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 2.66, w: 3.86, h: 3.5, rectRadius: 0.08,
      fill: { color: NAVY2 }, line: { color: STEEL, width: 1 }
    });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.32, y: 3.0, w: 0.5, h: 0.5, fill: { color: AMBER } });
    s.addText(String(i + 1), {
      x: x + 0.32, y: 3.0, w: 0.5, h: 0.5, fontFace: BODY, fontSize: 16, bold: true,
      color: NAVY, align: "center", valign: "middle", margin: 0
    });
    s.addText(p[0], {
      x: x + 0.32, y: 3.66, w: 3.2, h: 0.42, fontFace: BODY, fontSize: 17, bold: true,
      color: "FFFFFF", charSpacing: 1, margin: 0
    });
    s.addText(p[1], {
      x: x + 0.32, y: 4.18, w: 3.26, h: 1.28, fontFace: BODY, fontSize: 12.5, color: "C7D7E5", margin: 0
    });
    s.addText(p[2], {
      x: x + 0.32, y: 5.6, w: 3.26, h: 0.34, fontFace: BODY, fontSize: 11.5, bold: true,
      italic: true, color: AMBER, margin: 0
    });
  });
  s.addText("O objetivo não é digitalizar a planilha. É fazer o dado nascer uma vez e servir a todos os setores.", {
    x: 0.6, y: 6.5, w: 12.1, h: 0.4, fontFace: BODY, fontSize: 13.5, italic: true, color: "8FA8BE", margin: 0
  });
  s.addNotes("O ganho vem de eliminar redigitacao e fechar o ciclo previsto x realizado.");
}

/* ============ 5. MAPA DO SISTEMA ============ */
{
  const s = base();
  title(s, "Mapa do sistema", "Cinco módulos formam o MVP. Os demais entram depois, sobre a mesma base de dados.");

  s.addText("NÚCLEO — MVP", {
    x: 0.6, y: 1.58, w: 4, h: 0.3, fontFace: BODY, fontSize: 11.5, bold: true, color: STEEL, charSpacing: 1.5, margin: 0
  });
  const core = [
    ["Cadastros & OS", "Clientes, obras, OS, desenhos, itens, colaboradores, máquinas e postos de trabalho."],
    ["Programação (PCP)", "Quadro semanal por setor. Alocação de itens a pessoas e máquinas, com publicação."],
    ["Apontamento", "Registro de início, fim, quantidade e ocorrência pelo líder, no celular, no posto."],
    ["Andamento da OS", "Percentual de avanço por item, etapa, setor e obra, alimentado pelo apontamento."],
    ["Painéis & relatórios", "Indicadores de aderência, produtividade, ocupação e prazo, por dia e por semana."]
  ];
  core.forEach((c, i) => {
    const x = 0.6 + i * 2.46;
    card(s, x, 1.94, 2.28, 2.42);
    s.addShape(pres.ShapeType.roundRect, {
      x: x + 0.28, y: 2.18, w: 0.72, h: 0.4, rectRadius: 0.2, fill: { color: AMBER_L }
    });
    s.addText("M" + (i + 1), {
      x: x + 0.28, y: 2.18, w: 0.72, h: 0.4, fontFace: BODY, fontSize: 11.5, bold: true,
      color: NAVY, align: "center", valign: "middle", margin: 0
    });
    s.addText(c[0], {
      x: x + 0.26, y: 2.66, w: 1.94, h: 0.6, fontFace: BODY, fontSize: 13, bold: true, color: NAVY, margin: 0
    });
    s.addText(c[1], {
      x: x + 0.26, y: 3.22, w: 1.94, h: 1.0, fontFace: BODY, fontSize: 10.5, color: MUTED, margin: 0
    });
  });

  s.addText("EXPANSÃO — FASE 2", {
    x: 0.6, y: 4.66, w: 4, h: 0.3, fontFace: BODY, fontSize: 11.5, bold: true, color: STEEL, charSpacing: 1.5, margin: 0
  });
  const next = [
    ["Materiais & plano de corte", "Chapas, espessuras, planos, sobras e pendências como o \"faltam 21x\"."],
    ["Qualidade & inspeção", "Checklist por item, registro de reparo, retrabalho e liberação."],
    ["Manutenção de máquinas", "Paradas, preventivas e histórico por equipamento (ex.: Fresa M2000-01)."],
    ["Custo por OS", "Horas apontadas × custo de posto para chegar ao custo real da obra."]
  ];
  next.forEach((c, i) => {
    const x = 0.6 + i * 3.09;
    card(s, x, 5.02, 2.88, 1.72, "EDF2F7");
    s.addText(c[0], {
      x: x + 0.26, y: 5.2, w: 2.4, h: 0.52, fontFace: BODY, fontSize: 12.5, bold: true, color: NAVY, margin: 0
    });
    s.addText(c[1], {
      x: x + 0.26, y: 5.74, w: 2.42, h: 0.86, fontFace: BODY, fontSize: 10.5, color: MUTED, margin: 0
    });
  });
  s.addNotes("Comecar pelo nucleo e essencial: sem OS e apontamento estruturados, os modulos de fase 2 nao tem base.");
}

/* ============ 6. ESTRUTURA DE DADOS ============ */
{
  const s = base();
  title(s, "O coração do sistema: como a OS é estruturada", "Toda a lógica nasce de uma hierarquia simples, tirada dos próprios códigos que a fábrica já usa.");

  const levels = [
    ["OBRA / CLIENTE", "B018/26 — módulo da roda", "Agrupa as OS de um mesmo contrato e dá o prazo de entrega."],
    ["ORDEM DE SERVIÇO", "OS 012/26", "Unidade de programação e de custo. Tem prazo, responsável e status."],
    ["DESENHO / FOLHA", "SGM-PE0005-FAB-DR-002-P — folha 1/18", "Documento técnico que origina a lista de itens."],
    ["ITEM", "Item 135.2 — 1 unidade — chapa #19", "A peça física. Carrega quantidade, espessura e material."],
    ["OPERAÇÃO", "Corte CNC → Chanfro → Solda → Montagem", "A sequência produtiva do item, com posto e tempo previsto."],
    ["APONTAMENTO", "Início 07:12 · Fim 09:40 · 2 un · 2.400 mm de solda", "O que de fato aconteceu. É daqui que sai todo indicador."]
  ];
  levels.forEach((l, i) => {
    const y = 1.84 + i * 0.82;
    const ind = i * 0.28;
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.6 + ind, y, w: 3.5 - ind, h: 0.7, rectRadius: 0.07,
      fill: { color: i === 5 ? AMBER : NAVY2 }, line: { color: i === 5 ? AMBER : NAVY2, width: 1 }
    });
    s.addText(l[0], {
      x: 0.75 + ind, y, w: 3.2 - ind, h: 0.7, fontFace: BODY, fontSize: 11.5, bold: true,
      color: i === 5 ? NAVY : "FFFFFF", valign: "middle", margin: 0
    });
    s.addText(l[1], {
      x: 4.35, y: y + 0.04, w: 4.05, h: 0.62, fontFace: BODY, fontSize: 12, bold: true,
      color: NAVY, valign: "middle", margin: 0
    });
    s.addText(l[2], {
      x: 8.5, y: y + 0.04, w: 4.22, h: 0.62, fontFace: BODY, fontSize: 11, color: MUTED, valign: "middle", margin: 0
    });
  });
  s.addText("Exemplo real da programação da Semana 26", {
    x: 4.35, y: 1.48, w: 4.05, h: 0.3, fontFace: BODY, fontSize: 10.5, bold: true, color: STEEL, charSpacing: 1, margin: 0
  });
  s.addText("Para que serve", {
    x: 8.5, y: 1.48, w: 4.2, h: 0.3, fontFace: BODY, fontSize: 10.5, bold: true, color: STEEL, charSpacing: 1, margin: 0
  });
  s.addNotes("Se essa estrutura estiver certa, todo o resto do sistema se apoia nela sem retrabalho.");
}

/* ============ 7. MODULO PROGRAMACAO ============ */
{
  const s = base();
  title(s, "Módulo 2 — Programação semanal (PCP)", "A tela que substitui os quatro arquivos de programação da semana.");

  card(s, 0.6, 1.66, 7.4, 4.9);
  s.addText("Como funciona", {
    x: 0.92, y: 1.92, w: 6.8, h: 0.4, fontFace: BODY, fontSize: 16, bold: true, color: NAVY, margin: 0
  });
  const steps = [
    ["Escolher a semana e o setor", "Ex.: Semana 26 · Preparação. O sistema já traz as OS em aberto com prazo e saldo pendente."],
    ["Arrastar o item para o recurso", "O item vai para o colaborador (Soldagem, Montagem) ou para a máquina (Usinagem, CNC), no dia certo."],
    ["Sistema valida a alocação", "Avisa se a máquina está em manutenção, se o colaborador já está cheio no dia ou se falta material."],
    ["Publicar a programação", "Publicou, todos os líderes veem a versão vigente na hora. Alteração posterior gera aviso de revisão."],
    ["Exportar quando precisar", "Se alguém ainda quiser papel, o PDF sai do sistema no mesmo formato de hoje — mas gerado do dado."]
  ];
  steps.forEach((st, i) => {
    const y = 2.48 + i * 0.82;
    numDot(s, i + 1, 0.94, y + 0.04, 0.36);
    s.addText(st[0], {
      x: 1.46, y: y - 0.02, w: 6.28, h: 0.32, fontFace: BODY, fontSize: 13, bold: true, color: NAVY, margin: 0
    });
    s.addText(st[1], {
      x: 1.46, y: y + 0.28, w: 6.28, h: 0.46, fontFace: BODY, fontSize: 11, color: MUTED, margin: 0
    });
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 8.25, y: 1.66, w: 4.48, h: 2.3, rectRadius: 0.08, fill: { color: NAVY }, line: { color: NAVY, width: 1 }
  });
  s.addText("SUBSTITUI HOJE", {
    x: 8.55, y: 1.92, w: 3.9, h: 0.3, fontFace: BODY, fontSize: 11, bold: true, color: AMBER, charSpacing: 1.5, margin: 0
  });
  s.addText([
    { text: "Prog. Setor de Preparação", options: { bullet: true, breakLine: true } },
    { text: "Prog. Setor de Soldagem (1 por líder)", options: { bullet: true, breakLine: true } },
    { text: "Prog. Setor de Montagem", options: { bullet: true, breakLine: true } },
    { text: "Prog. Setor da Usinagem", options: { bullet: true } }
  ], {
    x: 8.55, y: 2.32, w: 3.9, h: 1.4, fontFace: BODY, fontSize: 12.5, color: "DCE9F5", paraSpaceAfter: 6, margin: 0
  });

  card(s, 8.25, 4.26, 4.48, 2.3, "EDF2F7");
  s.addText("GANHO DIRETO", {
    x: 8.55, y: 4.5, w: 3.9, h: 0.3, fontFace: BODY, fontSize: 11, bold: true, color: STEEL, charSpacing: 1.5, margin: 0
  });
  s.addText("Uma versão única da programação, com histórico de alterações e sem risco de líder trabalhando com folha vencida.", {
    x: 8.55, y: 4.88, w: 3.9, h: 1.0, fontFace: BODY, fontSize: 12.5, color: TXT, margin: 0
  });
  s.addText("O formato visual da tela segue o quadro que os líderes já conhecem.", {
    x: 8.55, y: 5.96, w: 3.9, h: 0.44, fontFace: BODY, fontSize: 11, italic: true, color: MUTED, margin: 0
  });
  s.addNotes("Manter o formato visual parecido com o quadro atual reduz muito a resistencia na implantacao.");
}

/* ============ 8. MODULO APONTAMENTO ============ */
{
  const s = base();
  title(s, "Módulo 3 — Apontamento no chão de fábrica", "Pelo navegador do celular ou tablet do líder. Sem instalar nada, sem digitar OS.");

  // "telefone"
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.75, y: 1.62, w: 2.75, h: 4.95, rectRadius: 0.14,
    fill: { color: NAVY }, line: { color: NAVY2, width: 2 }, shadow: sh()
  });
  s.addText("MINHA EQUIPE · HOJE", {
    x: 0.95, y: 1.9, w: 2.35, h: 0.3, fontFace: BODY, fontSize: 10, bold: true, color: AMBER, charSpacing: 1, margin: 0
  });
  const rows = [
    ["João José Januário", "OS 018/26 · em execução", AMBER],
    ["Antonio Pires", "OS 012/26 · em execução", AMBER],
    ["Gabriel Santos", "OS 018/26 · concluído", "6FCF97"],
    ["Daniel Alves", "aguardando material", "EB6F6F"],
    ["Luciano · lixador", "OS 025/26 · em execução", AMBER],
    ["Raimundo · lixador", "não iniciado", "9AAAB8"]
  ];
  rows.forEach((r, i) => {
    const y = 2.28 + i * 0.7;
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.95, y, w: 2.35, h: 0.58, rectRadius: 0.06, fill: { color: NAVY2 }, line: { color: NAVY2, width: 1 }
    });
    s.addShape(pres.ShapeType.ellipse, { x: 1.08, y: y + 0.24, w: 0.11, h: 0.11, fill: { color: r[2] } });
    s.addText(r[0], {
      x: 1.26, y: y + 0.05, w: 1.98, h: 0.24, fontFace: BODY, fontSize: 9.5, bold: true, color: "FFFFFF", margin: 0
    });
    s.addText(r[1], {
      x: 1.26, y: y + 0.28, w: 1.98, h: 0.24, fontFace: BODY, fontSize: 8.5, color: "A9C2D8", margin: 0
    });
  });

  const feats = [
    ["Já vem preenchido", "O líder não digita OS nem item: ele vê a programação que o PCP publicou e só confirma o que aconteceu."],
    ["Um toque para iniciar e encerrar", "Botão de iniciar e encerrar por item. O sistema grava a hora — acaba o campo \"a confirmar\"."],
    ["Campos do próprio setor", "Solda registra milímetros; preparação registra peças cortadas; usinagem registra peças e setup. Cada setor vê o que é dele."],
    ["Motivo de parada padronizado", "Falta de material, manutenção, aguardando desenho, deslocamento, retrabalho. Vira estatística, não observação solta."],
    ["Foto e observação", "O líder anexa foto de uma não conformidade e escreve a observação direto no item, sem passar por WhatsApp."],
    ["Funciona com sinal fraco", "A tela guarda o apontamento no aparelho e sincroniza quando a conexão volta."]
  ];
  feats.forEach((f, i) => {
    const x = 3.95 + (i % 2) * 4.55, y = 1.62 + Math.floor(i / 2) * 1.7;
    card(s, x, y, 4.28, 1.5);
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.26, y: y + 0.26, w: 0.34, h: 0.34, fill: { color: AMBER } });
    s.addText(f[0], {
      x: x + 0.72, y: y + 0.22, w: 3.4, h: 0.42, fontFace: BODY, fontSize: 12.5, bold: true,
      color: NAVY, valign: "middle", margin: 0
    });
    s.addText(f[1], {
      x: x + 0.28, y: y + 0.7, w: 3.84, h: 0.68, fontFace: BODY, fontSize: 10.5, color: MUTED, margin: 0
    });
  });
  s.addNotes("O apontamento e o ponto critico do projeto: se o chao de fabrica nao usar, nenhum indicador existe.");
}

/* ============ 9. PAINEIS ============ */
{
  const s = base();
  title(s, "Módulos 4 e 5 — Andamento da OS e painéis", "O que hoje depende de reunião e telefonema passa a estar em uma tela.");

  const kpis = [
    ["% de avanço", "por OS, obra e setor", "Calculado pelos itens concluídos sobre o total previsto."],
    ["Aderência ao plano", "programado × realizado", "Quanto do que foi programado para o dia realmente saiu."],
    ["Horas por item", "previsto × apontado", "Base para melhorar a estimativa dos próximos orçamentos."],
    ["Risco de atraso", "semáforo por obra", "OS que, no ritmo atual, não fecham no prazo contratado."],
    ["Ocupação de máquina", "usinagem e CNC", "Horas produtivas, setup, manutenção e ociosidade por equipamento."],
    ["Motivos de parada", "ranking do mês", "Onde a hora se perde: material, desenho, manutenção ou retrabalho."]
  ];
  kpis.forEach((k, i) => {
    const x = 0.6 + (i % 3) * 4.12, y = 1.66 + Math.floor(i / 3) * 2.02;
    card(s, x, y, 3.86, 1.78);
    s.addText(k[0], {
      x: x + 0.3, y: y + 0.24, w: 3.3, h: 0.42, fontFace: HEAD, fontSize: 17, bold: true, color: NAVY, margin: 0
    });
    s.addText(k[1], {
      x: x + 0.3, y: y + 0.66, w: 3.3, h: 0.28, fontFace: BODY, fontSize: 11, bold: true, color: AMBER, margin: 0
    });
    s.addText(k[2], {
      x: x + 0.3, y: y + 0.98, w: 3.3, h: 0.66, fontFace: BODY, fontSize: 11, color: MUTED, margin: 0
    });
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 0.6, y: 5.86, w: 12.13, h: 0.86, rectRadius: 0.08, fill: { color: NAVY }, line: { color: NAVY, width: 1 }
  });
  s.addText("Todos esses números saem do apontamento — nenhum exige digitação extra de ninguém.", {
    x: 0.95, y: 5.86, w: 11.4, h: 0.86, fontFace: BODY, fontSize: 14, bold: true,
    color: "FFFFFF", valign: "middle", margin: 0
  });
  s.addNotes("Nenhum indicador aqui exige um relatorio manual: todos derivam do apontamento.");
}

/* ============ 10. ANTES x DEPOIS ============ */
{
  const s = base();
  title(s, "Como muda o dia a dia", "Mesmo processo, mesma gente — o que muda é onde a informação vive.");

  s.addShape(pres.ShapeType.roundRect, {
    x: 0.6, y: 1.62, w: 6.0, h: 4.9, rectRadius: 0.08, fill: { color: "EDF2F7" }, line: { color: LINE, width: 1 }
  });
  s.addShape(pres.ShapeType.roundRect, {
    x: 6.95, y: 1.62, w: 5.78, h: 4.9, rectRadius: 0.08, fill: { color: NAVY }, line: { color: NAVY, width: 1 }
  });
  s.addText("HOJE", {
    x: 0.92, y: 1.86, w: 5, h: 0.4, fontFace: BODY, fontSize: 14, bold: true, color: MUTED, charSpacing: 2, margin: 0
  });
  s.addText("COM O SISTEMA", {
    x: 7.27, y: 1.86, w: 5, h: 0.4, fontFace: BODY, fontSize: 14, bold: true, color: AMBER, charSpacing: 2, margin: 0
  });

  const comp = [
    ["PCP monta 4 planilhas separadas e exporta PDFs.", "PCP monta uma programação única, por setor, e publica."],
    ["Líder recebe impresso ou por WhatsApp.", "Líder abre o celular e vê a versão vigente do dia."],
    ["Realizado anotado à mão, quando é anotado.", "Início e fim registrados com um toque no posto."],
    ["Avanço da OS existe só na cabeça do líder.", "Avanço atualiza sozinho a cada item concluído."],
    ["Atraso aparece quando já é atraso.", "Semáforo de risco avisa antes do prazo estourar."],
    ["Nenhum histórico comparável entre semanas.", "Base histórica para estimar prazo e custo do próximo orçamento."]
  ];
  comp.forEach((c, i) => {
    const y = 2.42 + i * 0.68;
    s.addShape(pres.ShapeType.ellipse, { x: 0.94, y: y + 0.13, w: 0.13, h: 0.13, fill: { color: "9AAAB8" } });
    s.addText(c[0], {
      x: 1.22, y, w: 5.1, h: 0.56, fontFace: BODY, fontSize: 12.5, color: TXT, valign: "middle", margin: 0
    });
    s.addShape(pres.ShapeType.ellipse, { x: 7.29, y: y + 0.13, w: 0.13, h: 0.13, fill: { color: AMBER } });
    s.addText(c[1], {
      x: 7.57, y, w: 4.9, h: 0.56, fontFace: BODY, fontSize: 12.5, color: "DCE9F5", valign: "middle", margin: 0
    });
  });
  s.addNotes("Nao se propoe mudar o processo produtivo, apenas o meio pelo qual a informacao circula.");
}

/* ============ 11. ARQUITETURA ============ */
{
  const s = base();
  title(s, "Plataforma e arquitetura", "Sistema web acessado pelo computador do escritório e pelo navegador do celular no galpão.");

  const layers = [
    ["ACESSO", "Navegador — computador, tablet e celular. Sem instalação, sem licença por máquina.", NAVY2],
    ["APLICAÇÃO", "Sistema web responsivo, com telas separadas para PCP (desktop) e líder (celular).", STEEL],
    ["BANCO DE DADOS", "Base relacional única: OS, itens, operações, apontamentos e cadastros.", NAVY2],
    ["INFRAESTRUTURA", "Nuvem, com backup diário automático. Servidor local é possível se a política interna exigir.", STEEL]
  ];
  layers.forEach((l, i) => {
    const y = 1.66 + i * 1.06;
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.6, y, w: 2.5, h: 0.9, rectRadius: 0.07, fill: { color: l[2] }, line: { color: l[2], width: 1 }
    });
    s.addText(l[0], {
      x: 0.6, y, w: 2.5, h: 0.9, fontFace: BODY, fontSize: 12.5, bold: true, color: "FFFFFF",
      align: "center", valign: "middle", margin: 0
    });
    card(s, 3.28, y, 4.32, 0.9);
    s.addText(l[1], {
      x: 3.5, y, w: 3.94, h: 0.9, fontFace: BODY, fontSize: 11.5, color: TXT, valign: "middle", margin: 0
    });
  });

  card(s, 7.95, 1.66, 4.78, 4.24);
  s.addText("Perfis de acesso", {
    x: 8.25, y: 1.92, w: 4.2, h: 0.4, fontFace: BODY, fontSize: 16, bold: true, color: NAVY, margin: 0
  });
  const perfis = [
    ["PCP / Planejamento", "Cria OS, monta e publica a programação da semana."],
    ["Supervisor", "Acompanha os quatro setores, remaneja e aprova ocorrências."],
    ["Líder de setor", "Vê a programação da equipe e aponta o realizado."],
    ["Diretoria", "Painel de obras, prazos, avanço e custo — somente leitura."],
    ["Engenharia / Qualidade", "Cadastra desenhos, itens e registra inspeção."]
  ];
  perfis.forEach((p, i) => {
    const y = 2.46 + i * 0.68;
    s.addShape(pres.ShapeType.ellipse, { x: 8.28, y: y + 0.1, w: 0.26, h: 0.26, fill: { color: AMBER } });
    s.addText(p[0], {
      x: 8.68, y: y - 0.02, w: 3.86, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color: NAVY, margin: 0
    });
    s.addText(p[1], {
      x: 8.68, y: y + 0.26, w: 3.86, h: 0.32, fontFace: BODY, fontSize: 10.5, color: MUTED, margin: 0
    });
  });
  s.addText("Integrações possíveis depois: ERP, folha de ponto, e-mail e leitura de QR Code nas peças.", {
    x: 0.6, y: 6.16, w: 7.0, h: 0.5, fontFace: BODY, fontSize: 11.5, italic: true, color: MUTED, margin: 0
  });
  s.addNotes("A escolha entre nuvem e servidor local deve ser definida com a diretoria antes do inicio.");
}

/* ============ 12. ROADMAP ============ */
{
  const s = base();
  title(s, "Roadmap sugerido", "Entrega por fases, com valor visível já na primeira. Prazos são estimativas de referência.");

  const fases = [
    ["FASE 0", "Levantamento", "2 sem.", "Acompanhar os quatro setores, validar códigos de OS, lista de máquinas, postos e etapas.", 2.1],
    ["FASE 1", "Cadastros + Programação", "5 sem.", "OS, itens, colaboradores e máquinas. Programação semanal publicável e exportável em PDF.", 4.2],
    ["FASE 2", "Apontamento + Andamento", "5 sem.", "Tela do líder no celular, apontamento de início/fim, avanço automático da OS.", 4.2],
    ["FASE 3", "Painéis + Piloto", "4 sem.", "Indicadores, semáforo de prazo e operação assistida em um setor antes de expandir.", 3.4]
  ];
  fases.forEach((f, i) => {
    const y = 1.72 + i * 1.24;
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.6, y, w: 1.5, h: 1.0, rectRadius: 0.07,
      fill: { color: i === 0 ? STEEL : NAVY }, line: { color: i === 0 ? STEEL : NAVY, width: 1 }
    });
    s.addText(f[0], {
      x: 0.6, y: y + 0.18, w: 1.5, h: 0.32, fontFace: BODY, fontSize: 12, bold: true,
      color: "FFFFFF", align: "center", margin: 0
    });
    s.addText(f[2], {
      x: 0.6, y: y + 0.52, w: 1.5, h: 0.3, fontFace: BODY, fontSize: 11, color: AMBER, align: "center", margin: 0
    });
    card(s, 2.3, y, 6.1, 1.0);
    s.addText(f[1], {
      x: 2.56, y: y + 0.14, w: 5.6, h: 0.34, fontFace: BODY, fontSize: 14, bold: true, color: NAVY, margin: 0
    });
    s.addText(f[3], {
      x: 2.56, y: y + 0.48, w: 5.62, h: 0.44, fontFace: BODY, fontSize: 11, color: MUTED, margin: 0
    });
    s.addShape(pres.ShapeType.roundRect, {
      x: 8.62, y: y + 0.32, w: f[4], h: 0.36, rectRadius: 0.18,
      fill: { color: i === 0 ? "9AAAB8" : AMBER }
    });
  });
  s.addText("ESFORÇO RELATIVO", {
    x: 8.62, y: 1.3, w: 4.1, h: 0.3, fontFace: BODY, fontSize: 10.5, bold: true, color: STEEL, charSpacing: 1, margin: 0
  });
  s.addText("Total estimado até o piloto rodando: cerca de 16 semanas. A Fase 1 já elimina o retrabalho de montar quatro arquivos por semana.", {
    x: 0.6, y: 6.66, w: 12.13, h: 0.4, fontFace: BODY, fontSize: 12, italic: true, color: MUTED, margin: 0
  });
  s.addNotes("Prazos sao referencia e devem ser fechados apos a Fase 0.");
}

/* ============ 13. GANHOS ============ */
{
  const s = base(true);
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: NAVY } });
  s.addText("O que se ganha", {
    x: 0.6, y: 0.55, w: 12.1, h: 0.6, fontFace: HEAD, fontSize: 32, bold: true, color: "FFFFFF", margin: 0
  });
  s.addText("Indicadores para medir se o projeto entregou o que prometeu — todos comparáveis com a situação de hoje.", {
    x: 0.62, y: 1.2, w: 12.1, h: 0.4, fontFace: BODY, fontSize: 14, color: "8FA8BE", margin: 0
  });

  const stats = [
    ["0", "arquivo de programação\nmontado à mão por semana", "Hoje são quatro ou mais, refeitos toda semana."],
    ["1", "versão válida da\nprogramação, para todos", "Fim da folha vencida circulando no galpão."],
    ["100%", "dos apontamentos com\nhora registrada", "Fim do campo \"a confirmar\" na programação de solda."],
    ["Diário", "avanço de cada OS,\natualizado sozinho", "Prazo deixa de ser estimativa de memória."]
  ];
  stats.forEach((st, i) => {
    const x = 0.6 + i * 3.09;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 1.92, w: 2.88, h: 2.66, rectRadius: 0.08, fill: { color: NAVY2 }, line: { color: STEEL, width: 1 }
    });
    s.addText(st[0], {
      x: x + 0.24, y: 2.12, w: 2.4, h: 0.96, fontFace: HEAD, fontSize: 46, bold: true, color: AMBER, margin: 0
    });
    s.addText(st[1], {
      x: x + 0.26, y: 3.12, w: 2.4, h: 0.86, fontFace: BODY, fontSize: 12.5, bold: true, color: "FFFFFF", margin: 0
    });
    s.addText(st[2], {
      x: x + 0.26, y: 3.98, w: 2.42, h: 0.5, fontFace: BODY, fontSize: 10, color: "8FA8BE", margin: 0
    });
  });

  const outros = [
    ["Menos hora parada", "Motivo de parada padronizado mostra onde o tempo se perde e permite atacar a causa."],
    ["Orçamento mais firme", "Horas reais por item viram base de cálculo para os próximos contratos."],
    ["Decisão sem reunião", "Diretoria e supervisão consultam a tela em vez de reunir os líderes para levantar status."]
  ];
  outros.forEach((o, i) => {
    const x = 0.6 + i * 4.12;
    s.addShape(pres.ShapeType.ellipse, { x, y: 5.05, w: 0.34, h: 0.34, fill: { color: AMBER } });
    s.addText(o[0], {
      x: x + 0.46, y: 5.02, w: 3.3, h: 0.4, fontFace: BODY, fontSize: 14, bold: true, color: "FFFFFF", margin: 0
    });
    s.addText(o[1], {
      x: x + 0.02, y: 5.5, w: 3.8, h: 0.86, fontFace: BODY, fontSize: 11.5, color: "C7D7E5", margin: 0
    });
  });
  s.addNotes("Os quatro numeros grandes sao metas verificaveis, nao promessas genericas de eficiencia.");
}

/* ============ 14. RISCOS ============ */
{
  const s = base();
  title(s, "O que pode dar errado — e como tratar", "Sistema de chão de fábrica falha por adoção, não por tecnologia.");

  const riscos = [
    ["Líder não aponta", "ALTO", "Tela do líder com no máximo três toques por item, treinamento no posto e acompanhamento diário nas duas primeiras semanas."],
    ["Cadastro incompleto", "ALTO", "Fase 0 dedicada só a levantar OS, itens, máquinas e etapas reais antes de escrever qualquer tela."],
    ["Sistema virar burocracia", "MÉDIO", "Nada de campo obrigatório que não vire indicador. Se um dado não gera decisão, ele sai da tela."],
    ["Sinal fraco no galpão", "MÉDIO", "Apontamento guardado no aparelho e sincronizado depois; avaliar reforço de wi-fi nos setores críticos."],
    ["Escopo crescendo", "MÉDIO", "MVP fechado nos cinco módulos do núcleo. Pedido novo entra em lista de fase 2, não no meio da obra."],
    ["Depender de uma pessoa só", "BAIXO", "Documentação das telas e do banco desde a Fase 1, com mais de um usuário treinado no PCP."]
  ];
  riscos.forEach((r, i) => {
    const y = 1.84 + i * 0.83;
    card(s, 0.6, y, 12.13, 0.74);
    s.addText(r[0], {
      x: 0.9, y, w: 3.1, h: 0.74, fontFace: BODY, fontSize: 13, bold: true, color: NAVY, valign: "middle", margin: 0
    });
    const cor = r[1] === "ALTO" ? "C0392B" : (r[1] === "MÉDIO" ? "C88A1B" : "5A7A93");
    s.addShape(pres.ShapeType.roundRect, {
      x: 4.05, y: y + 0.19, w: 0.95, h: 0.36, rectRadius: 0.18, fill: { color: cor }
    });
    s.addText(r[1], {
      x: 4.05, y: y + 0.19, w: 0.95, h: 0.36, fontFace: BODY, fontSize: 9.5, bold: true,
      color: "FFFFFF", align: "center", valign: "middle", margin: 0
    });
    s.addText(r[2], {
      x: 5.2, y, w: 7.3, h: 0.74, fontFace: BODY, fontSize: 11.5, color: TXT, valign: "middle", margin: 0
    });
  });
  s.addText("Risco", { x: 0.9, y: 1.5, w: 3, h: 0.28, fontFace: BODY, fontSize: 10.5, bold: true, color: STEEL, charSpacing: 1, margin: 0 });
  s.addText("Impacto", { x: 4.05, y: 1.5, w: 1.1, h: 0.28, fontFace: BODY, fontSize: 10.5, bold: true, color: STEEL, charSpacing: 1, margin: 0 });
  s.addText("Como tratar", { x: 5.2, y: 1.5, w: 4, h: 0.28, fontFace: BODY, fontSize: 10.5, bold: true, color: STEEL, charSpacing: 1, margin: 0 });
  s.addNotes("O maior risco e adocao no chao de fabrica, nao desenvolvimento.");
}

/* ============ 15. PROXIMOS PASSOS ============ */
{
  const s = base(true);
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: NAVY } });
  s.addText("Próximos passos", {
    x: 0.6, y: 0.6, w: 12.1, h: 0.62, fontFace: HEAD, fontSize: 32, bold: true, color: "FFFFFF", margin: 0
  });
  s.addText("Quatro decisões destravam o início do projeto.", {
    x: 0.62, y: 1.26, w: 12.1, h: 0.4, fontFace: BODY, fontSize: 15, color: AMBER, margin: 0
  });

  const passos = [
    ["Validar o escopo do núcleo", "Confirmar se os cinco módulos do MVP cobrem a necessidade — e o que fica de fora sem dó."],
    ["Escolher o setor piloto", "Preparação e Usinagem são os candidatos naturais: têm posto e máquina bem definidos."],
    ["Definir os donos do dado", "Quem cadastra OS e item, quem publica a programação, quem cobra o apontamento diário."],
    ["Fechar plataforma e prazo", "Nuvem ou servidor local, orçamento e a data em que a Fase 0 começa."]
  ];
  passos.forEach((p, i) => {
    const x = 0.6 + (i % 2) * 6.23, y = 2.0 + Math.floor(i / 2) * 1.66;
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w: 5.9, h: 1.4, rectRadius: 0.08, fill: { color: NAVY2 }, line: { color: STEEL, width: 1 }
    });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.3, y: y + 0.24, w: 0.44, h: 0.44, fill: { color: AMBER } });
    s.addText(String(i + 1), {
      x: x + 0.3, y: y + 0.24, w: 0.44, h: 0.44, fontFace: BODY, fontSize: 15, bold: true,
      color: NAVY, align: "center", valign: "middle", margin: 0
    });
    s.addText(p[0], {
      x: x + 0.88, y: y + 0.22, w: 4.8, h: 0.44, fontFace: BODY, fontSize: 15, bold: true,
      color: "FFFFFF", valign: "middle", margin: 0
    });
    s.addText(p[1], {
      x: x + 0.32, y: y + 0.76, w: 5.26, h: 0.5, fontFace: BODY, fontSize: 11.5, color: "C7D7E5", margin: 0
    });
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 0.6, y: 5.42, w: 12.13, h: 1.24, rectRadius: 0.08, fill: { color: AMBER }
  });
  s.addText("Sugestão: começar pela Fase 0 acompanhando uma semana inteira de produção. É barata, não compromete orçamento e devolve o escopo real do sistema.", {
    x: 1.0, y: 5.42, w: 11.4, h: 1.24, fontFace: BODY, fontSize: 15, bold: true,
    color: NAVY, valign: "middle", margin: 0
  });
  s.addNotes("Fechar a apresentacao com uma decisao pequena e barata: acompanhar uma semana de producao.");
}

pres.writeFile({ fileName: "/sessions/funny-happy-lamport/mnt/outputs/Sistema-Gestao-Fabrica-BNG.pptx" })
  .then(f => console.log("OK:", f));
