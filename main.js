(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  document.documentElement.classList.remove('no-js');
  const IZBY = {"obyvacka": ["Obývačka", "Zásuvky pri televízore, gauči aj pracovnom mieste, osvetlenie podľa rozloženia nábytku."], "spalna": ["Spálňa", "Zásuvky a&nbsp;vypínače pri posteli, svetlo ovládané od dverí aj od postele."], "detska": ["Detská izba", "Dostatok zásuviek pri stole a&nbsp;posteli, aby nebolo treba predlžovačky."], "kuchyna": ["Kuchyňa", "Samostatné okruhy pre sporák a&nbsp;väčšie spotrebiče, zásuvky nad pracovnou doskou."], "predsien": ["Predsieň", "Nový rozvádzač s&nbsp;ističmi a&nbsp;prúdovým chráničom, každý okruh popísaný."], "kupelna": ["Kúpeľňa", "Zásuvky a&nbsp;svetlá v&nbsp;bezpečných zónach, okruh chránený prúdovým chráničom."], "wc": ["WC", "Vlastné svetlo, prípadne prívod pre ventilátor."]};

  /* hlavička: plná po opustení hero */
  const hd = $('#hd'), hero = $('#hero');
  new IntersectionObserver(([e]) => hd.classList.toggle('is-solid', !e.isIntersecting), { rootMargin: '-72px 0px 0px 0px' }).observe(hero);

  /* mobilné menu */
  const burger = $('#burger'), nav = $('#nav');
  const menu = (open) => {
    nav.classList.toggle('is-open', open); hd.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => menu(!nav.classList.contains('is-open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => menu(false)));

  /* odhaľovanie */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -12% 0px' });
  $$('.rv, .pr__list li').forEach(el => io.observe(el));
  const pr = $('.pr');
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { pr.classList.add('is-in'); o.disconnect(); } }, { threshold: .35 }).observe(pr);

  /* služby: fotka pri kurzore */
  const peek = $('#peek'), pimg = $('img', peek);
  if (matchMedia('(hover: hover) and (min-width: 901px)').matches) {
    let x = 0, y = 0, raf = 0;
    const move = () => { raf = 0; peek.style.setProperty('--x', x + 'px'); peek.style.setProperty('--y', y + 'px'); };
    $$('.sl__i').forEach(li => {
      li.addEventListener('pointerenter', () => { pimg.src = li.dataset.img; peek.classList.add('is-on'); });
      li.addEventListener('pointerleave', () => peek.classList.remove('is-on'));
      li.addEventListener('pointermove', ev => {
        x = ev.clientX + 28; y = ev.clientY - 120;
        if (x + 310 > innerWidth) x = ev.clientX - 330;
        if (!raf) raf = requestAnimationFrame(move);
      });
    });
  }

  /* panelák: pred / po prerábke + miestnosti */
  const pn = $('#panelak'), room = $('#pnRoom'), text = $('#pnText');
  const TXT = {
    pred: ['Pôvodný stav', 'Pár zásuviek na celý byt, hliníkové vedenie a&nbsp;starý rozvádzač. Kliknite na <b>Po prerábke</b>.'],
    po: ['Po prerábke', 'Každá miestnosť má vlastný okruh, zásuvky sú tam, kde ich potrebujete. Kliknite na miestnosť v&nbsp;pôdoryse.'],
  };
  let stav = 'pred', vybrana = null, dotkol = false;
  const info = () => {
    if (vybrana && stav === 'po') { room.textContent = IZBY[vybrana][0]; text.innerHTML = IZBY[vybrana][1]; }
    else { room.textContent = TXT[stav][0]; text.innerHTML = TXT[stav][1]; }
  };
  const nastav = (s) => {
    stav = s; pn.dataset.stav = s;
    $$('.pn__b').forEach(b => b.setAttribute('aria-pressed', b.dataset.stav === s));
    if (s === 'pred') { vybrana = null; delete pn.dataset.r; $$('#plan .rooms rect').forEach(r => r.classList.remove('is-on')); }
    info();
  };
  const vyber = (r) => {
    if (stav !== 'po') nastav('po');
    vybrana = vybrana === r ? null : r;
    if (vybrana) pn.dataset.r = vybrana; else delete pn.dataset.r;
    $$('#plan .rooms rect').forEach(el => el.classList.toggle('is-on', el.dataset.r === vybrana));
    info();
  };
  $$('.pn__b').forEach(b => b.addEventListener('click', () => { dotkol = true; nastav(b.dataset.stav); }));
  $$('#plan .rooms rect').forEach(r => {
    r.addEventListener('click', () => { dotkol = true; vyber(r.dataset.r); });
    r.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dotkol = true; vyber(r.dataset.r); } });
  });
  nastav('pred');
  /* keď sa pôdorys ukáže, sám sa „prerobí“ */
  new IntersectionObserver(([e], o) => {
    if (e.isIntersecting) { o.disconnect(); setTimeout(() => { if (!dotkol) nastav('po'); }, 1400); }
  }, { threshold: .55 }).observe($('#plan'));

  /* formulár → e-mail */
  const fm = $('#fm'), msg = $('#fmMsg');
  fm.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(fm);
    let ok = true;
    ['meno', 'kontakt'].forEach(n => {
      const el = fm.elements[n], prazdne = !String(d.get(n) || '').trim();
      el.classList.toggle('is-err', prazdne); if (prazdne) ok = false;
    });
    if (!ok) { msg.textContent = 'Doplňte prosím meno a kontakt.'; return; }
    const typ = d.getAll('typ').join(', ');
    const riadky = [
      'Meno: ' + d.get('meno'), 'Kontakt: ' + d.get('kontakt'),
      typ && 'Zákazka: ' + typ, d.get('miesto') && 'Miesto: ' + d.get('miesto'),
      d.get('obhliadka') ? 'Mám záujem o obhliadku zdarma.' : '', '', d.get('sprava') || '',
    ].filter(v => v !== false && v !== null);
    location.href = 'mailto:rselektro.pp@gmail.com?subject=' + encodeURIComponent('Dopyt z webu' + (typ ? ' – ' + typ : ''))
      + '&body=' + encodeURIComponent(riadky.join('\n'));
    msg.textContent = 'Otvára sa Váš e-mail s pripraveným dopytom.';
  });
})();
