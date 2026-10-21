(function () {
  'use strict';


  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const esc = (v) =>
    String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

  const normalize = (v) =>
    String(v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const cssEscape = (v) => (window.CSS && CSS.escape ? CSS.escape(v) : String(v).replace(/"/g, '\\"'));

  const PATHS = {
    paw: '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>',
    heart: '<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>',
    pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    arrowUpRight: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
    search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    check: '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>'
  };

  const icon = (name, size) =>
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + (size || 18) + '" height="' + (size || 18) +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    PATHS[name] + '</svg>';


  const STORAGE_KEY = 'ipet:listings:v1';
  const FAV_KEY = 'ipet:favorites:v1';

  const KINDS = {
    adocao:     { label: 'Adoção',         tab: 'adocao',    pet: true,  cta: 'Quero conhecer' },
    perdido:    { label: 'Pet perdido',    tab: 'perdidos',  pet: true,  cta: 'Ver alerta' },
    encontrado: { label: 'Pet encontrado', tab: 'perdidos',  pet: true,  cta: 'Ver alerta' },
    vacinacao:  { label: 'Vacinação',      tab: 'vacinacao', pet: false, cta: 'Ver detalhes' },
    banho:      { label: 'Banho e tosa',   tab: 'banho',     pet: false, cta: 'Ver detalhes' }
  };

  const TABS = {
    adocao: {
      kinds: ['adocao'], species: true, defaultKind: 'adocao',
      eyebrow: 'ADOÇÃO',
      title: 'Um novo melhor amigo espera por você.',
      text: 'Encontre uma conexão para a vida toda.',
      community: {
        lines: ['Um lar muda', 'tudo.'],
        text: 'Tem um pet esperando por uma família? Ajude essa história a acontecer.',
        button: 'Anunciar para adoção', kind: 'adocao'
      }
    },
    perdidos: {
      kinds: ['perdido', 'encontrado'], species: true, defaultKind: 'perdido',
      eyebrow: 'PERDIDOS E ENCONTRADOS',
      title: 'Ajude um pet a voltar para casa.',
      text: 'Veja os alertas mais recentes e compartilhe pistas.',
      community: {
        lines: ['Todo alerta', 'ajuda.'],
        text: 'Viu um pet sozinho na rua? Um aviso rápido pode levá-lo de volta para casa.',
        button: 'Avisar que encontrei', kind: 'encontrado'
      }
    },
    vacinacao: {
      kinds: ['vacinacao'], species: false, defaultKind: 'vacinacao',
      eyebrow: 'VACINAÇÃO',
      title: 'Proteção em dia, pet saudável.',
      text: 'Encontre clínicas e campanhas de vacinação perto de você.',
      community: {
        lines: ['Cuidar é', 'prevenir.'],
        text: 'Tem uma clínica ou campanha de vacinação? Divulgue para quem está procurando.',
        button: 'Divulgar vacinação', kind: 'vacinacao'
      }
    },
    banho: {
      kinds: ['banho'], species: false, defaultKind: 'banho',
      eyebrow: 'BANHO E TOSA',
      title: 'Cuidado e carinho de verdade.',
      text: 'Descubra serviços de banho e tosa na sua região.',
      community: {
        lines: ['Pet limpo,', 'tutor feliz.'],
        text: 'Oferece banho e tosa? Mostre o seu trabalho para a vizinhança.',
        button: 'Divulgar serviço', kind: 'banho'
      }
    }
  };

  const SPECIES_FILTERS = ['todos', 'cachorro', 'gato'];

  const DEMOS = [
    { id: 'demo-bento', kind: 'adocao', name: 'Bento', species: 'cachorro',
      meta: 'Macho · 2 anos · Porte médio', neighborhood: 'Água Verde', city: 'Curitiba',
      image: 'pets/dog.jpg', demo: true,
      description: 'Bento é brincalhão, sociável e adora passear. Convive bem com crianças e com outros cachorros.' },
    { id: 'demo-luna', kind: 'adocao', name: 'Luna', species: 'gato',
      meta: 'Fêmea · 1 ano · Porte pequeno', neighborhood: 'Batel', city: 'Curitiba',
      image: 'pets/cat.jpg', demo: true,
      description: 'Luna é curiosa e carinhosa, uma ótima companhia para quem mora em apartamento.' },
    { id: 'demo-nino', kind: 'adocao', name: 'Nino', species: 'cachorro',
      meta: 'Macho · 3 anos · Porte médio', neighborhood: 'Boa Vista', city: 'Curitiba',
      image: 'pets/dog2.jpg', demo: true,
      description: 'Nino é calmo, obediente e adora companhia. Está pronto para uma família atenciosa.' },

    { id: 'demo-thor', kind: 'perdido', name: 'Thor', species: 'cachorro',
      meta: 'Perdido · Macho · 4 anos · Porte grande', neighborhood: 'Cajuru', city: 'Curitiba',
      image: '', demo: true,
      description: 'Fugiu do quintal durante a tarde. Pelagem caramelo e coleira azul. Atende pelo nome.' },
    { id: 'demo-mel', kind: 'encontrado', name: 'Mel', species: 'gato',
      meta: 'Encontrado · Fêmea · Porte pequeno', neighborhood: 'Portão', city: 'Curitiba',
      image: '', demo: true,
      description: 'Gatinha de pelo cinza encontrada na calçada, aparentemente bem cuidada. Está em segurança, aguardando o tutor.' },

    { id: 'demo-pata', kind: 'vacinacao', name: 'Clínica Pata Saudável', species: null,
      meta: 'Seg a sáb · 8h às 18h', neighborhood: 'Centro', city: 'Curitiba',
      image: '', demo: true,
      description: 'Vacinação para cães e gatos, com agendamento. Traga a carteirinha de vacinação do pet.' },
    { id: 'demo-posto', kind: 'vacinacao', name: 'Posto Vacina Pet', species: null,
      meta: 'Sábados · 9h às 13h', neighborhood: 'Santa Felicidade', city: 'Curitiba',
      image: '', demo: true,
      description: 'Campanha de vacinação com atendimento por ordem de chegada.' },

    { id: 'demo-banhocia', kind: 'banho', name: 'Banho & Cia Pet', species: null,
      meta: 'Seg a sex · 9h às 19h', neighborhood: 'Portão', city: 'Curitiba',
      image: '', demo: true,
      description: 'Banho, tosa higiênica e tosa completa. Atendimento com hora marcada.' },
    { id: 'demo-carinho', kind: 'banho', name: 'Tosa Carinho', species: null,
      meta: 'Ter a dom · 10h às 18h', neighborhood: 'Bigorrilho', city: 'Curitiba',
      image: '', demo: true,
      description: 'Especialistas em tosa para gatos e cães de pequeno porte, com muita paciência.' }
  ];


  const state = {
    tab: 'adocao',
    query: '',
    species: 'todos',
    published: [],
    favs: new Set()
  };

  function readJSON(key) {
    try {
      const raw = localStorage.getItem(key);
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  const savePublished = () => writeJSON(STORAGE_KEY, state.published);
  const saveFavs = () => writeJSON(FAV_KEY, Array.from(state.favs));
  const allListings = () => state.published.concat(DEMOS);

  const locationOf = (l) => [l.neighborhood, l.city].filter(Boolean).join(', ');

  const main = $('main');
  const tablist = $('[role="tablist"]');
  const tabs = $$('[role="tab"]', tablist).map((el) => ({
    el: el,
    key: (el.id.split('-trigger-')[1] || '').trim(),
    panel: document.getElementById(el.getAttribute('aria-controls'))
  })).filter((t) => TABS[t.key]);

  const searchInput = $('.search-box input');
  const filtersBox = $('.filters');
  const filterButtons = $$('button', filtersBox);
  const resultLabels = $$('.result-label span');
  const headingEyebrow = $('.section-heading .eyebrow');
  const headingTitle = $('.section-heading h2');
  const headingText = $('.section-heading p:not(.eyebrow)');
  const communityTitle = $('.community-card h3');
  const communityText = $('.community-card p');
  const communityButton = $('.community-card .button');


  function placeholderHtml(variant) {
    return '<span class="illustration-free' + (variant === 'detail' ? ' detail-placeholder' : '') +
      '" aria-hidden="true">' + icon('paw', variant === 'detail' ? 72 : 56) + '</span>';
  }

  function attachFallbacks(root) {
    $$('img[data-fallback]', root).forEach((img) => {
      img.addEventListener('error', () => {
        const holder = document.createElement('div');
        holder.innerHTML = placeholderHtml(img.getAttribute('data-fallback'));
        img.replaceWith(holder.firstChild);
      }, { once: true });
    });
  }

  function cardHtml(l) {
    const kind = KINDS[l.kind];
    const fav = state.favs.has(l.id);
    const badge = l.demo
      ? '<span class="badge demo">Exemplo</span>'
      : '<span class="badge live">' + esc(kind.label) + '</span>';
    const media = l.image
      ? '<img src="' + esc(l.image) + '" alt="Foto do anúncio ' + esc(l.name) + '" loading="lazy" data-fallback="card"/>'
      : placeholderHtml('card');

    return '<article class="pet-card" data-id="' + esc(l.id) + '">' +
      '<button type="button" class="card-image" aria-label="Ver detalhes de ' + esc(l.name) + '">' + media + badge + '</button>' +
      '<div class="card-content">' +
        '<div class="pet-title"><h3>' + esc(l.name) + '</h3>' +
          '<button type="button" class="fav" data-id="' + esc(l.id) + '" aria-pressed="' + fav + '" aria-label="' +
            (fav ? 'Remover ' : 'Favoritar ') + esc(l.name) + (fav ? ' dos favoritos' : '') + '">' + icon('heart', 19) + '</button>' +
        '</div>' +
        '<p class="pet-meta">' + esc(l.meta) + '</p>' +
        '<p class="location">' + icon('pin', 14) + esc(locationOf(l)) + '</p>' +
        '<button type="button" class="card-link">' + esc(kind.cta) + icon('arrow', 17) + '</button>' +
      '</div></article>';
  }

  function visibleListings() {
    const cfg = TABS[state.tab];
    const q = normalize(state.query.trim());
    return allListings().filter((l) => {
      if (cfg.kinds.indexOf(l.kind) === -1) return false;
      if (cfg.species && state.species !== 'todos' && l.species !== state.species) return false;
      if (q) {
        const hay = normalize([l.name, l.neighborhood, l.city, l.meta, l.description, KINDS[l.kind].label].join(' '));
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function render() {
    const cfg = TABS[state.tab];
    const current = tabs.find((t) => t.key === state.tab);
    if (!current || !current.panel) return;
    const list = visibleListings();

    if (resultLabels[0]) resultLabels[0].textContent = list.length === 1 ? '1 publicação' : list.length + ' publicações';
    if (resultLabels[1]) resultLabels[1].textContent = list.some((l) => l.demo) ? 'Exemplos sinalizados nos cartões' : '';

    if (!list.length) {
      const filtering = state.query.trim() || (cfg.species && state.species !== 'todos');
      current.panel.innerHTML =
        '<div class="empty">' + icon('search', 34) +
        '<h3>Nada por aqui ainda</h3>' +
        '<p>' + (filtering
          ? 'Nenhum resultado para a sua busca. Tente outros termos ou limpe os filtros.'
          : 'Seja a primeira pessoa a publicar nesta categoria.') + '</p>' +
        '<div class="empty-actions">' +
          (filtering ? '<button type="button" class="button outline" data-action="clear">Limpar filtros</button>' : '') +
          '<button type="button" class="button primary" data-action="publish" data-kind="' + cfg.defaultKind + '">Publicar anúncio</button>' +
        '</div></div>';
      return;
    }

    current.panel.innerHTML = '<div class="cards">' + list.map(cardHtml).join('') + '</div>';
    attachFallbacks(current.panel);
  }


  function setTab(key, opts) {
    if (!TABS[key]) return;
    const cfg = TABS[key];
    state.tab = key;

    tabs.forEach((t) => {
      const active = t.key === key;
      t.el.setAttribute('data-state', active ? 'active' : 'inactive');
      t.el.setAttribute('aria-selected', String(active));
      t.el.tabIndex = active ? 0 : -1;
      if (t.panel) {
        t.panel.setAttribute('data-state', active ? 'active' : 'inactive');
        t.panel.hidden = !active;
        if (!active) t.panel.innerHTML = '';
      }
      if (active && opts && opts.focus) t.el.focus();
    });

    headingEyebrow.textContent = cfg.eyebrow;
    headingTitle.textContent = cfg.title;
    headingText.textContent = cfg.text;
    filtersBox.hidden = !cfg.species;

    communityTitle.innerHTML = esc(cfg.community.lines[0]) + '<br/>' + esc(cfg.community.lines[1]);
    communityText.textContent = cfg.community.text;
    communityButton.innerHTML = esc(cfg.community.button) + ' ' + icon('arrowUpRight', 17);

    render();
  }

  function setSpecies(species) {
    state.species = species;
    filterButtons.forEach((btn, i) => {
      const active = SPECIES_FILTERS[i] === species;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    render();
  }

  function clearFilters() {
    state.query = '';
    if (searchInput) searchInput.value = '';
    setSpecies('todos');
  }


  function toggleFav(id) {
    if (state.favs.has(id)) state.favs.delete(id); else state.favs.add(id);
    saveFavs();
    const on = state.favs.has(id);
    const l = allListings().find((x) => x.id === id);
    $$('.fav[data-id="' + cssEscape(id) + '"]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(on));
      if (btn.closest('.pet-card') && l) {
        btn.setAttribute('aria-label', (on ? 'Remover ' : 'Favoritar ') + l.name + (on ? ' dos favoritos' : ''));
      }
    });
    return on;
  }

  function openDialog(className, html, labelledBy) {
    const dialog = document.createElement('dialog');
    dialog.className = 'ipet-dialog ' + className;
    dialog.setAttribute('aria-labelledby', labelledBy);
    dialog.innerHTML = html;
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
    });
    dialog.addEventListener('close', () => {
      dialog.remove();
      document.documentElement.classList.remove('dialog-open');
    });
    document.body.appendChild(dialog);
    dialog.showModal();
    document.documentElement.classList.add('dialog-open');
    return dialog;
  }

  function contactHtml(contact) {
    const c = String(contact || '').trim();
    if (!c) return 'Não informado';
    if (c.indexOf('@') !== -1) return '<a href="mailto:' + esc(c) + '">' + esc(c) + '</a>';
    const digits = c.replace(/[^\d+]/g, '');
    if (digits.replace(/\D/g, '').length >= 8) return '<a href="tel:' + esc(digits) + '">' + esc(c) + '</a>';
    return esc(c);
  }

  const SAFETY_NOTE = {
    adocao: 'Adoção é compromisso. Conheça o animal e converse com o responsável antes de decidir.',
    perdido: 'Se reconhecer este pet, entre em contato e combine o reencontro em um local seguro.',
    encontrado: 'Se este pet é seu, entre em contato e combine a devolução em um local seguro.',
    vacinacao: 'Confirme horários, vacinas disponíveis e valores diretamente com o local.',
    banho: 'Confirme horários, serviços e valores diretamente com o local.'
  };

  function openDetail(id) {
    const l = allListings().find((x) => x.id === id);
    if (!l) return;
    const kind = KINDS[l.kind];
    const on = state.favs.has(id);

    const media = l.image
      ? '<img class="detail-image" src="' + esc(l.image) + '" alt="Foto do anúncio ' + esc(l.name) + '" data-fallback="detail"/>'
      : placeholderHtml('detail');

    const footer = l.demo
      ? '<p class="demo-notice">Este é um anúncio de exemplo, criado para demonstrar o iPet. Não há um responsável real por trás dele.</p>'
      : '<div class="contact-block"><p><strong>Contato</strong></p><p>' + contactHtml(l.contact) + '</p>' +
        '<small>' + esc(SAFETY_NOTE[l.kind]) + '</small></div>';

    const html =
      '<div class="dialog-body dialog-stack">' +
        '<div class="dialog-head"><div>' +
          '<h2 id="detail-title" data-slot="dialog-title">' + esc(l.name) + '</h2>' +
          '<p data-slot="dialog-description">' + esc(kind.label) + ' · ' + esc(l.meta) + ' · ' + esc(locationOf(l)) + '</p>' +
        '</div><button type="button" class="dialog-close" data-close aria-label="Fechar">' + icon('x', 18) + '</button></div>' +
        media +
        '<p class="description"></p>' +
        footer +
        '<div class="dialog-actions">' +
          '<button type="button" class="button outline fav" data-id="' + esc(id) + '" data-fav-dialog aria-pressed="' + on + '">' + icon('heart', 17) + '<span>' + (on ? 'Nos favoritos' : 'Favoritar') + '</span></button>' +
          (l.demo ? '' : '<button type="button" class="button outline" data-remove>Remover anúncio</button>') +
          '<button type="button" class="button dark" data-close>Fechar</button>' +
        '</div>' +
      '</div>';

    const dialog = openDialog('detail-dialog', html, 'detail-title');
    $('.description', dialog).textContent = l.description || 'Sem descrição.';
    attachFallbacks(dialog);

    const favBtn = $('[data-fav-dialog]', dialog);
    favBtn.addEventListener('click', () => {
      const now = toggleFav(id);
      $('span', favBtn).textContent = now ? 'Nos favoritos' : 'Favoritar';
    });

    const removeBtn = $('[data-remove]', dialog);
    if (removeBtn) {
      let armed = false;
      let timer = null;
      removeBtn.addEventListener('click', () => {
        if (!armed) {
          armed = true;
          removeBtn.textContent = 'Confirmar remoção';
          timer = setTimeout(() => { armed = false; removeBtn.textContent = 'Remover anúncio'; }, 4000);
          return;
        }
        clearTimeout(timer);
        state.published = state.published.filter((x) => x.id !== id);
        state.favs.delete(id);
        savePublished();
        saveFavs();
        dialog.close();
        render();
      });
    }
  }


  const NAME_LABEL = {
    adocao: 'Nome do pet', perdido: 'Nome do pet', encontrado: 'Nome do pet (se souber)',
    vacinacao: 'Nome do local ou serviço', banho: 'Nome do local ou serviço'
  };
  const DESC_LABEL = {
    adocao: 'Conte a história do pet',
    perdido: 'Descrição e onde foi visto pela última vez',
    encontrado: 'Descrição e onde foi encontrado',
    vacinacao: 'Descrição dos serviços',
    banho: 'Descrição dos serviços'
  };

  function publishHtml(kind) {
    const kindOptions = Object.keys(KINDS).map((k) =>
      '<label><input type="radio" name="kind" value="' + k + '"' + (k === kind ? ' checked' : '') + '/> ' + esc(KINDS[k].label) + '</label>'
    ).join('');

    return '<div class="dialog-body dialog-stack">' +
      '<div class="dialog-head"><div>' +
        '<h2 id="publish-title" data-slot="dialog-title">Publicar anúncio</h2>' +
        '<p data-slot="dialog-description">Preencha os dados abaixo. O anúncio fica salvo neste navegador.</p>' +
      '</div><button type="button" class="dialog-close" data-close aria-label="Fechar">' + icon('x', 18) + '</button></div>' +

      '<form class="publish-form" novalidate>' +
        '<fieldset><legend>O que você quer publicar?</legend><div class="kind-options">' + kindOptions + '</div></fieldset>' +

        '<label><span class="lbl" data-name-label>Nome do pet</span><input name="name" type="text" maxlength="40" autocomplete="off"/></label>' +

        '<fieldset data-group="pet"><legend>Espécie</legend><div class="species-options">' +
          '<label><input type="radio" name="species" value="cachorro" checked/> Cachorro</label>' +
          '<label><input type="radio" name="species" value="gato"/> Gato</label>' +
          '<label><input type="radio" name="species" value="outro"/> Outro</label>' +
        '</div></fieldset>' +

        '<div class="form-row" data-group="pet">' +
          '<label><span class="lbl">Sexo</span><select name="sex"><option value="">Não informado</option><option value="Macho">Macho</option><option value="Fêmea">Fêmea</option></select></label>' +
          '<label><span class="lbl">Idade</span><input name="age" type="text" maxlength="20" placeholder="Ex.: 2 anos"/></label>' +
        '</div>' +
        '<label data-group="pet"><span class="lbl">Porte</span><select name="size"><option value="">Não informado</option><option value="Porte pequeno">Pequeno</option><option value="Porte médio">Médio</option><option value="Porte grande">Grande</option></select></label>' +

        '<label data-group="service"><span class="lbl">Horário de atendimento</span><input name="hours" type="text" maxlength="80" placeholder="Ex.: Seg a sáb · 8h às 18h"/></label>' +

        '<div class="form-row">' +
          '<label><span class="lbl">Bairro</span><input name="neighborhood" type="text" maxlength="60" autocomplete="off"/></label>' +
          '<label><span class="lbl">Cidade</span><input name="city" type="text" maxlength="60" value="Curitiba" autocomplete="off"/></label>' +
        '</div>' +

        '<label><span class="lbl" data-desc-label>Conte a história do pet</span><textarea name="description" rows="4" maxlength="600"></textarea><span data-counter>0/600</span></label>' +

        '<label><span class="lbl">Contato</span><span>Telefone, WhatsApp ou e-mail. Será exibido no anúncio.</span><input name="contact" type="text" maxlength="80" autocomplete="off"/></label>' +

        '<label><span class="lbl">Foto (opcional)</span><input name="photo" type="file" accept="image/*"/></label>' +

        '<div class="error" role="alert" hidden></div>' +
        '<div class="success" role="status" hidden>' + icon('check', 18) + '<span>Anúncio publicado!</span></div>' +
        '<button type="submit" class="button primary submit">Publicar anúncio</button>' +
      '</form></div>';
  }

  function resizeImage(file, max) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const ratio = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * ratio));
        canvas.height = Math.max(1, Math.round(img.height * ratio));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Não foi possível ler essa imagem. Tente outro arquivo.'));
      };
      img.src = url;
    });
  }

  function openPublish(kind) {
    const startKind = KINDS[kind] ? kind : TABS[state.tab].defaultKind;
    const dialog = openDialog('publish-dialog', publishHtml(startKind), 'publish-title');
    const form = $('form', dialog);
    const errorBox = $('.error', form);
    const successBox = $('.success', form);
    const submit = $('.submit', form);
    const field = (n) => form.elements[n];

    function currentKind() {
      const checked = $('input[name="kind"]:checked', form);
      return checked ? checked.value : startKind;
    }

    function updateMode() {
      const k = currentKind();
      const isPet = KINDS[k].pet;
      $$('[data-group="pet"]', form).forEach((el) => { el.hidden = !isPet; });
      $$('[data-group="service"]', form).forEach((el) => { el.hidden = isPet; });
      $('[data-name-label]', form).textContent = NAME_LABEL[k];
      $('[data-desc-label]', form).textContent = DESC_LABEL[k];
    }

    function clearErrors() {
      errorBox.hidden = true;
      errorBox.textContent = '';
      $$('[aria-invalid]', form).forEach((el) => el.removeAttribute('aria-invalid'));
    }

    function fail(name, message) {
      errorBox.textContent = message;
      errorBox.hidden = false;
      const el = field(name);
      if (el) { el.setAttribute('aria-invalid', 'true'); el.focus(); }
      submit.disabled = false;
      submit.textContent = 'Publicar anúncio';
    }

    form.addEventListener('change', (e) => { if (e.target.name === 'kind') updateMode(); });
    field('description').addEventListener('input', (e) => {
      $('[data-counter]', form).textContent = e.target.value.length + '/600';
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const kindKey = currentKind();
      const kind = KINDS[kindKey];
      const val = (n) => String(field(n).value || '').trim();

      let name = val('name');
      const neighborhood = val('neighborhood');
      const city = val('city');
      const description = val('description');
      const contact = val('contact');

      if (!name && kindKey === 'encontrado') name = 'Pet sem nome';
      if (name.length < 2) return fail('name', 'Informe um nome com pelo menos 2 caracteres.');
      if (!neighborhood) return fail('neighborhood', 'Informe o bairro.');
      if (!city) return fail('city', 'Informe a cidade.');
      if (description.length < 10) return fail('description', 'Escreva uma descrição com pelo menos 10 caracteres.');

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
      const phoneOk = contact.replace(/\D/g, '').length >= 8;
      if (!emailOk && !phoneOk) return fail('contact', 'Informe um telefone (com DDD) ou um e-mail válido.');

      submit.disabled = true;
      submit.textContent = 'Publicando…';

      let image = '';
      const file = field('photo').files && field('photo').files[0];
      if (file) {
        if (file.type.indexOf('image/') !== 0) return fail('photo', 'O arquivo escolhido não é uma imagem.');
        if (file.size > 15 * 1024 * 1024) return fail('photo', 'A foto é muito grande. Escolha uma de até 15 MB.');
        try {
          image = await resizeImage(file, 900);
        } catch (err) {
          return fail('photo', err.message);
        }
      }

      let meta;
      let species = null;
      if (kind.pet) {
        const checkedSpecies = $('input[name="species"]:checked', form);
        species = checkedSpecies ? checkedSpecies.value : 'outro';
        const lead = kindKey === 'perdido' ? 'Perdido' : kindKey === 'encontrado' ? 'Encontrado' : '';
        meta = [lead, val('sex'), val('age'), val('size')].filter(Boolean).join(' · ') || kind.label;
      } else {
        meta = val('hours') || kind.label;
      }

      const listing = {
        id: 'u-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        kind: kindKey,
        name: name,
        species: species,
        meta: meta,
        neighborhood: neighborhood,
        city: city,
        description: description,
        contact: contact,
        image: image,
        demo: false
      };

      state.published.unshift(listing);
      if (!savePublished()) {
        state.published.shift();
        return fail(image ? 'photo' : 'description',
          'Não foi possível salvar o anúncio (armazenamento do navegador cheio). Tente sem foto ou com uma foto menor.');
      }

      clearFilters();
      setTab(kind.tab);

      successBox.hidden = false;
      submit.textContent = 'Publicado';
      dialog.addEventListener('close', () => {
        const card = $('.pet-card[data-id="' + cssEscape(listing.id) + '"]');
        if (card) {
          card.scrollIntoView({ block: 'center' });
          const btn = $('.card-image', card);
          if (btn) btn.focus({ preventScroll: true });
        }
      }, { once: true });
      setTimeout(() => { if (dialog.isConnected) dialog.close(); }, 1300);
    });

    updateMode();
    field('name').focus();
  }

  function bindEvents() {
    // Abas
    tabs.forEach((t) => t.el.addEventListener('click', () => setTab(t.key)));
    tablist.addEventListener('keydown', (e) => {
      const keys = tabs.map((t) => t.key);
      const i = keys.indexOf(state.tab);
      let next = null;
      if (e.key === 'ArrowRight') next = (i + 1) % keys.length;
      else if (e.key === 'ArrowLeft') next = (i - 1 + keys.length) % keys.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = keys.length - 1;
      if (next !== null) {
        e.preventDefault();
        setTab(keys[next], { focus: true });
      }
    });

    // Busca
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        state.query = searchInput.value;
        render();
      });
    }

   
    filterButtons.forEach((btn, i) => {
      btn.type = 'button';
      btn.addEventListener('click', () => setSpecies(SPECIES_FILTERS[i]));
    });

   
    main.addEventListener('click', (e) => {
      const fav = e.target.closest('.fav');
      if (fav && fav.dataset.id) { toggleFav(fav.dataset.id); return; }

      const action = e.target.closest('[data-action]');
      if (action) {
        if (action.dataset.action === 'clear') clearFilters();
        if (action.dataset.action === 'publish') openPublish(action.dataset.kind);
        return;
      }

      const open = e.target.closest('.card-image, .card-link');
      if (open) {
        const card = open.closest('.pet-card');
        if (card) openDetail(card.dataset.id);
      }
    });

    // Botões de publicação
    const lostNav = $('.header nav button');
    if (lostNav) lostNav.addEventListener('click', () => openPublish('perdido'));

    const headerButton = $('.header-button');
    if (headerButton) headerButton.addEventListener('click', () => openPublish(TABS[state.tab].defaultKind));

    communityButton.addEventListener('click', () => openPublish(TABS[state.tab].community.kind));

    const lostCardButton = $('.lost-card button');
    if (lostCardButton) lostCardButton.addEventListener('click', () => openPublish('perdido'));
  }


  function init() {
    if (!main || !tablist || !tabs.length) return;

    state.published = readJSON(STORAGE_KEY).filter((l) => l && l.id && KINDS[l.kind]);
    state.favs = new Set(readJSON(FAV_KEY));

    if (resultLabels[0]) resultLabels[0].setAttribute('aria-live', 'polite');

    bindEvents();
    setSpecies('todos');
    setTab('adocao');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
