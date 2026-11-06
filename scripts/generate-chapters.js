#!/usr/bin/env node
/* Generates the 13 chapter pages under /medborgarskapsprovet/ from
   scripts/chapters.json. The site itself has no build step: run this by hand
   after editing chapters.json and commit the generated HTML.

     node scripts/generate-chapters.js

   Each chapter in chapters.json has: number, slug, title, tag (the ?from= value
   for the store links), sourcePage (pdf page), audio (UHR mp3), description,
   summaryHtml (array of HTML strings) and questions (3 blocks with stem,
   options, correct (index), explanation, sourceRef, id). */
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'chapters.json'), 'utf8'));
const SITE = 'https://mebbo.se';
const LETTERS = ['A', 'B', 'C', 'D'];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = (n) => String(n).padStart(2, '0');
const url = (c) => `/medborgarskapsprovet/${c.slug}/`;

function h1Html(title) {
  const i = title.lastIndexOf(' ');
  return `${esc(title.slice(0, i))} <span class="nw">${esc(title.slice(i + 1))}:</span> sammanfattning och övningsfrågor`;
}

function quizCard(q, i, total) {
  const n = i + 1;
  const opts = q.options.map((o, k) =>
    `          <li><span class="quiz-option"><span class="letter" aria-hidden="true">${LETTERS[k]}</span><span><span class="sr-letter">${LETTERS[k]}: </span>${esc(o)}</span></span></li>`
  ).join('\n');
  return `    <li>
      <article class="quiz-card" data-correct="${q.correct}" aria-labelledby="fraga-${n}">
        <p class="quiz-num">Fråga ${n} av ${total}</p>
        <h3 class="quiz-question" id="fraga-${n}">${esc(q.stem)}</h3>
        <ol class="quiz-options">
${opts}
        </ol>
        <details class="quiz-answer">
          <summary>Visa rätt svar</summary>
          <div class="quiz-explanation">
            <p><b>Rätt svar:</b> <span class="quiz-correct">${LETTERS[q.correct]}, ${esc(q.options[q.correct])}</span></p>
            <p class="quiz-why">${esc(q.explanation)}</p>
            <p class="quiz-source">${esc(q.sourceRef)}</p>
          </div>
        </details>
      </article>
    </li>`;
}

function page(c) {
  const total = c.questions.length;
  const ramp = Array.from({ length: 13 }, (_, i) => `<span style="background:var(--ch${i + 1})"></span>`).join('');
  const others = data.chapters.filter((o) => o.number !== c.number).map((o) =>
    `    <li><a href="${url(o)}"><span class="sw" style="background:var(--ch${o.number})"></span><span class="num">${pad(o.number)}</span><span>${esc(o.title)}: sammanfattning och övningsfrågor</span></a></li>`
  ).join('\n');
  const title = `${c.title}: sammanfattning och övningsfrågor | Mebbo`;
  const canonical = `${SITE}${url(c)}`;
  const summary = c.summaryHtml.map((s) => s.split('\n').map((l) => '  ' + l).join('\n')).join('\n');
  const ld = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Mebbo', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Medborgarskapsprovet', item: `${SITE}/medborgarskapsprovet/` },
      { '@type': 'ListItem', position: 3, name: c.title, item: canonical },
    ],
  }, null, 2);
  return `<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(c.description)}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">

<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(c.description)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="sv_SE">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="Mebbo">
<meta property="og:image" content="https://mebbo.se/assets/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Mebbo, en app för att öva inför medborgarskapsprovet.">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#2E4A38">
<link rel="canonical" href="${canonical}">

<script type="application/ld+json">
${ld}
</script>

<link rel="stylesheet" href="/assets/fonts/fonts.css">
<link rel="stylesheet" href="/assets/guide.css">
<!-- Cloudflare Web Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "${data.beaconToken}"}'></script><!-- End Cloudflare Web Analytics -->
</head>
<body>

<nav class="nav" aria-label="Huvudmeny">
  <div class="nav-inner">
    <a href="/" class="nav-logo">Mebbo</a>
    <div class="nav-links">
      <a href="/medborgarskapsprovet/" class="nav-hide">Om provet</a>
      <a href="#hamta" class="nav-cta">Hämta appen</a>
    </div>
  </div>
</nav>
<div class="ramp" aria-hidden="true">${ramp}</div>

<main class="wrap">
<header class="page-head">
  <nav class="crumbs" aria-label="Brödsmulor"><ol><li><a href="/">Mebbo</a></li><li><a href="/medborgarskapsprovet/">Medborgarskapsprovet</a></li><li><span aria-current="page">${esc(c.title)}</span></li></ol></nav>
  <p class="eyebrow"><i style="background:var(--ch${c.number})"></i>Kapitel ${c.number} i Sverige i fokus</p>
  <h1>${h1Html(c.title)}</h1>
  <p class="lead">En kort sammanfattning av kapitlet ${esc(c.title)} i UHR:s utbildningsmaterial Sverige i fokus, och ${total === 3 ? 'tre' : total} övningsfrågor från Mebbo.</p>
  <p class="note indep">Mebbo är en fristående studieapp och har ingen koppling till UHR, Skolverket eller Migrationsverket. Frågorna på den här sidan är Mebbos egna övningsfrågor, inte frågor från det riktiga provet.</p>
</header>

<section aria-labelledby="sammanfattning">
  <h2 id="sammanfattning">Sammanfattning</h2>
${summary}
  <p class="src">Läs hela kapitlet hos UHR: <a href="${data.sourcePdf}#page=${c.sourcePage}" target="_blank" rel="noopener">Sverige i fokus, ${esc(c.title)}, sidan ${c.sourcePage} (pdf)</a>. Du kan också <a href="${c.audio}" target="_blank" rel="noopener">lyssna på kapitlet ${esc(c.title)} (mp3, UHR)</a>.</p>
</section>

<section aria-labelledby="ovningsfragor">
  <h2 id="ovningsfragor">Tre övningsfrågor</h2>
  <p>Frågorna kommer från Grunderna, den första nivån i Mebbo, som är gratis. Välj ett svar för att se rätt svar och en kort förklaring.</p>
  <ol class="quiz-list" data-score="poang">
${c.questions.map((q, i) => quizCard(q, i, total)).join('\n')}
  </ol>
  <p class="quiz-score" id="poang" role="status" hidden></p>
</section>

<section aria-labelledby="fler-kapitel">
  <h2 id="fler-kapitel">Fler kapitel</h2>
  <ul class="chapter-links">
${others}
  </ul>
  <p class="src">Läs också <a href="/medborgarskapsprovet/">om medborgarskapsprovet: vad det är, hur det är uppbyggt och vad UHR skriver om nästa prov</a>.</p>
</section>

<section class="get-app" id="hamta" aria-labelledby="hamta-rubrik">
  <h2 id="hamta-rubrik">Öva vidare i appen Mebbo</h2>
  <p>Mebbo finns för Android och iPhone. Alla 13 kapitellektioner är gratis, och lektionerna och övningen fungerar utan internet.</p>
  <div class="store-btns">
    <a href="/go/android/?from=${c.tag}" class="btn">Hämta Mebbo på Google Play</a>
    <a href="/go/iphone/?from=${c.tag}" class="btn">Hämta Mebbo i App Store</a>
  </div>
</section>
</main>

<footer>
  <div class="wrap">
    <div class="footer-logo">Mebbo</div>
    <p class="footer-about">En fristående app för att öva inför medborgarskapsprovet. Inte kopplad till UHR, Skolverket eller Migrationsverket. För officiell information, läs alltid hos <a href="https://www.uhr.se/medborgarskapsprovet/" target="_blank" rel="noopener">UHR</a> och <a href="https://www.migrationsverket.se/du-vill-ansoka/svenskt-medborgarskap/medborgarskap-for-vuxna/medborgarskap-for-vuxna.html" target="_blank" rel="noopener">Migrationsverket</a>.</p>
    <div class="footer-links">
      <a href="/">Startsida</a>
      <a href="/medborgarskapsprovet/">Om provet</a>
      <a href="/privacy.html">Integritetspolicy</a>
      <a href="/terms.html">Villkor</a>
      <a href="mailto:mebbo.app@proton.me">Kontakt</a>
    </div>
  </div>
</footer>

<script src="/assets/guide.js"></script>
</body>
</html>
`;
}

for (const c of data.chapters) {
  if (c.questions.length !== 3) throw new Error(`${c.slug}: expected 3 questions`);
  const dir = path.join(root, 'medborgarskapsprovet', c.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(c));
  console.log('wrote', path.relative(root, path.join(dir, 'index.html')));
}
