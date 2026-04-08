/**
 * 総合パーソナリティ診断 - メインアプリケーション
 *
 * 画面遷移、クイズフロー、結果レンダリング、チャート描画
 */

const App = {
  currentSection: 0,
  answers: {},
  results: null,

  // ==========================================================
  // 初期化
  // ==========================================================
  init() {
    document.getElementById('btnStart').addEventListener('click', () => this.start());
    document.getElementById('btnPrev').addEventListener('click', () => this.prevSection());
    document.getElementById('btnNext').addEventListener('click', () => this.handleNext());
    document.getElementById('btnShare').addEventListener('click', () => this.shareResults());
    document.getElementById('btnShareX').addEventListener('click', () => this.shareToX());
    document.getElementById('btnShareLINE').addEventListener('click', () => this.shareToLINE());
    document.getElementById('btnPDF').addEventListener('click', () => this.downloadPDF());
    document.getElementById('btnRestart').addEventListener('click', () => this.restart());
    document.getElementById('btnSticker').addEventListener('click', () => this.downloadSticker());
    document.getElementById('btnAIContext').addEventListener('click', () => this.showAIContext());
    document.getElementById('modalClose').addEventListener('click', () => this.closeAIContextModal());
    document.getElementById('btnCopyContext').addEventListener('click', () => this.copyAIContext());
    document.getElementById('aiContextModal').addEventListener('click', function(e) {
      if (e.target === this) App.closeAIContextModal();
    });

    // 質問エリアのイベント委譲（一度だけ登録）
    document.getElementById('questionArea').addEventListener('change', function(e) {
      if (e.target.type === 'radio' && e.target.dataset.qid) {
        App.answer(parseInt(e.target.dataset.qid), parseInt(e.target.dataset.val));
        // 回答後にエラーハイライトを解除
        var card = e.target.closest('.question-card');
        if (card) {
          card.style.borderColor = '';
          card.style.boxShadow = '';
        }
      }
    });

    // ランディングページ用32タイプ図鑑トグル
    document.getElementById('btnGalleryToggle').addEventListener('click', function() {
      var gallery = document.getElementById('landingGallery');
      var btn = document.getElementById('btnGalleryToggle');
      if (gallery.style.display === 'none') {
        if (!gallery.innerHTML) {
          gallery.innerHTML = App.renderGalleryHTML(null);
        }
        gallery.style.display = 'block';
        btn.textContent = '🐾 タイプ図鑑を閉じる';
        gallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        gallery.style.display = 'none';
        btn.textContent = '🐾 全32タイプを見る';
      }
    });

    // テーマ切替
    this.initTheme();
  },

  initTheme() {
    var saved = localStorage.getItem('theme') || 'dark';
    this.setTheme(saved);

    document.getElementById('themeToggle').addEventListener('click', function(e) {
      var btn = e.target.closest('button');
      if (!btn || !btn.dataset.theme) return;
      App.setTheme(btn.dataset.theme);
      localStorage.setItem('theme', btn.dataset.theme);
    });
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    // ボタンのアクティブ状態を更新
    var btns = document.querySelectorAll('#themeToggle button');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].dataset.theme === theme);
    }
    // theme-colorメタタグも更新
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      meta.setAttribute('content', isDark ? '#0f0f1a' : '#f5f5f8');
    }
  },

  // ==========================================================
  // セクションSVGアイコン
  // ==========================================================
  getSectionSvg(sectionId, color) {
    var icons = {
      bigfive: '<svg viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>',
      riasec: '<svg viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 8l3 3 2-2 5 5"/></svg>',
      strengths: '<svg viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
      attachment: '<svg viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      sensitivity: '<svg viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>',
      egogram: '<svg viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/><path d="M2 20h20"/></svg>'
    };
    return icons[sectionId] || '';
  },

  // ==========================================================
  // 画面遷移
  // ==========================================================
  start() {
    document.getElementById('landing').style.display = 'none';
    document.getElementById('quiz').classList.add('active');
    this.currentSection = 0;
    this.showSection(0);
  },

  handleNext() {
    if (this.currentSection === SECTIONS.length - 1) {
      this.showResults();
    } else {
      this.nextSection();
    }
  },

  // ==========================================================
  // クイズフロー
  // ==========================================================
  showSection(index) {
    this.currentSection = index;
    const section = SECTIONS[index];

    // セクションヘッダー更新
    document.getElementById('sectionIcon').innerHTML = this.getSectionSvg(section.id, section.color);
    document.getElementById('sectionTitle').textContent = section.title;
    document.getElementById('sectionSubtitle').textContent = section.subtitle;
    document.getElementById('sectionLabel').textContent = section.title;

    // セクション内の質問取得
    const sectionQuestions = QUESTIONS.filter(function(q) { return q.section === section.id; });

    // プログレス更新
    var firstIdx = QUESTIONS.indexOf(sectionQuestions[0]);
    var lastIdx = QUESTIONS.indexOf(sectionQuestions[sectionQuestions.length - 1]);
    document.getElementById('progressCount').textContent =
      (firstIdx + 1) + '〜' + (lastIdx + 1) + ' / ' + QUESTIONS.length + '問';

    var progress = (firstIdx / QUESTIONS.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';

    // 質問カード描画
    var area = document.getElementById('questionArea');
    area.innerHTML = '';

    for (var qi = 0; qi < sectionQuestions.length; qi++) {
      var q = sectionQuestions[qi];
      var card = document.createElement('div');
      card.className = 'question-card';

      var html = '<div class="q-number">Q' + q.id + '</div>';
      html += '<div class="q-text">' + q.text + '</div>';
      html += '<div class="likert-scale">';

      for (var si = 0; si < SCALE_LABELS.length; si++) {
        var val = si + 1;
        var checked = this.answers[q.id] === val ? ' checked' : '';
        html += '<div class="likert-option">';
        html += '<input type="radio" name="q' + q.id + '" id="q' + q.id + '_' + val + '" value="' + val + '"' + checked;
        html += ' data-qid="' + q.id + '" data-val="' + val + '">';
        html += '<label for="q' + q.id + '_' + val + '">';
        html += '<div class="likert-dot">' + val + '</div>';
        html += SCALE_LABELS[si];
        html += '</label></div>';
      }
      html += '</div>';

      card.innerHTML = html;
      area.appendChild(card);
    }

    // ナビゲーションボタン更新
    document.getElementById('btnPrev').disabled = index === 0;
    var btnNext = document.getElementById('btnNext');
    btnNext.textContent = index === SECTIONS.length - 1 ? '結果を見る →' : '次へ →';

    window.scrollTo(0, 0);
  },

  answer(questionId, value) {
    this.answers[questionId] = value;
  },

  nextSection() {
    if (!this.validateCurrentSection()) return;
    if (this.currentSection < SECTIONS.length - 1) {
      this.showSection(this.currentSection + 1);
    }
  },

  prevSection() {
    if (this.currentSection > 0) {
      this.showSection(this.currentSection - 1);
    }
  },

  validateCurrentSection() {
    var section = SECTIONS[this.currentSection];
    var sectionQs = QUESTIONS.filter(function(q) { return q.section === section.id; });
    var unanswered = sectionQs.filter(function(q) { return !App.answers[q.id]; });

    if (unanswered.length > 0) {
      // 未回答の質問カードをハイライト
      for (var i = 0; i < unanswered.length; i++) {
        var cardInputs = document.querySelectorAll('input[name="q' + unanswered[i].id + '"]');
        if (cardInputs.length > 0) {
          var card = cardInputs[0].closest('.question-card');
          if (card) {
            card.style.borderColor = '#ef4444';
            card.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.2)';
          }
        }
      }
      // 最初の未回答にスクロール
      var firstUnanswered = document.querySelector('input[name="q' + unanswered[0].id + '"]');
      if (firstUnanswered) {
        firstUnanswered.closest('.question-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }
    return true;
  },

  // ==========================================================
  // 結果画面
  // ==========================================================
  showResults() {
    if (!this.validateCurrentSection()) return;

    // プログレスバー100%
    document.getElementById('progressBar').style.width = '100%';

    // 分析実行
    this.results = AnalysisEngine.analyze(this.answers);

    // 画面切り替え
    document.getElementById('quiz').classList.remove('active');
    document.getElementById('results').classList.add('active');

    // レンダリング
    this.renderHero();
    this.renderTabs();
    this.renderTypeGallery();

    window.scrollTo(0, 0);
  },

  renderHero() {
    var summary = this.results.summary;

    // 動物画像を表示（画像がある場合はimg、なければ絵文字フォールバック）
    var emojiEl = document.getElementById('animalEmoji');
    if (summary.image) {
      emojiEl.innerHTML = '<img src="' + summary.image + '" alt="' + summary.animal + '" class="animal-img">';
    } else {
      emojiEl.textContent = summary.emoji;
    }

    // タイプ名（動物名＋称号）をテーマカラーで表示
    var typeNameEl = document.getElementById('typeName');
    typeNameEl.textContent = summary.typeName;
    typeNameEl.style.color = summary.color;

    // タイプバッジ
    document.getElementById('rarityBadge').textContent = '32タイプ中の1つ';

    // サマリーテキスト
    document.getElementById('summaryText').textContent = summary.summary;

    // キーワード
    var kwHtml = '';
    for (var i = 0; i < summary.keywords.length; i++) {
      kwHtml += '<span class="keyword">' + summary.keywords[i] + '</span>';
    }
    document.getElementById('keywords').innerHTML = kwHtml;

    // テーマ色のグラデーション背景を適用
    var heroEl = document.getElementById('resultsHero');
    var color = summary.color;
    heroEl.style.background = 'linear-gradient(135deg, ' + color + '18 0%, #0f0f1a 60%)';
    heroEl.style.borderBottom = '2px solid ' + color + '40';
  },

  // ==========================================================
  // 全32タイプ図鑑（共通HTML生成）
  // ==========================================================
  renderGalleryHTML(myType) {
    var animalFileMap = {
      "イルカ": "dolphin", "ワシ": "eagle", "犬": "dog", "ライオン": "lion",
      "ネコ": "cat", "フクロウ": "owl", "ウサギ": "rabbit", "オオカミ": "wolf"
    };
    var colorFileMap = { "JH": "gold", "JL": "silver", "PH": "emerald", "PL": "crimson" };
    var animalOrder = ["イルカ", "ワシ", "犬", "ライオン", "ネコ", "フクロウ", "ウサギ", "オオカミ"];

    var groups = {};
    for (var i = 0; i < PERSONALITY_TYPES.length; i++) {
      var t = PERSONALITY_TYPES[i];
      if (!groups[t.animal]) groups[t.animal] = [];
      groups[t.animal].push(t);
    }

    var html = '<h2>全32タイプ図鑑</h2>';
    html += '<p class="gallery-subtitle">タップすると詳細が見れます</p>';

    for (var g = 0; g < animalOrder.length; g++) {
      var animal = animalOrder[g];
      var types = groups[animal];
      if (!types) continue;

      html += '<div class="gallery-group">';
      html += '<div class="gallery-group-header"><span class="group-emoji">' + types[0].emoji + '</span> ' + animal + '</div>';
      html += '<div class="gallery-grid">';

      for (var j = 0; j < types.length; j++) {
        var t = types[j];
        var isMine = myType && (t.title === myType);
        var codeSuffix = t.code.slice(-2);
        var imgFile = animalFileMap[t.animal] + '-' + colorFileMap[codeSuffix] + '.jpg';
        var imgPath = 'assets/animals/' + imgFile;

        html += '<div class="gallery-card' + (isMine ? ' is-mine' : '') + '" style="border-color:' + t.color + '40" onclick="this.classList.toggle(\'is-open\')">';
        if (isMine) {
          html += '<span class="gallery-card-badge">あなた</span>';
        }
        html += '<img src="' + imgPath + '" alt="' + t.title + '" class="gallery-card-img" loading="lazy">';
        html += '<div class="gallery-card-title" style="color:' + t.color + '">' + t.title + '</div>';
        html += '<div class="gallery-card-keywords">';
        for (var k = 0; k < t.keywords.length; k++) {
          html += '<span>' + t.keywords[k] + '</span>';
        }
        html += '</div>';
        html += '<div class="gallery-card-detail">' + t.description + '</div>';
        html += '</div>';
      }

      html += '</div></div>';
    }
    return html;
  },

  // 結果画面用の図鑑表示
  renderTypeGallery() {
    var container = document.getElementById('typeGallery');
    container.innerHTML = this.renderGalleryHTML(this.results.summary.typeName);
  },

  // ==========================================================
  // タブシステム
  // ==========================================================
  renderTabs() {
    var tabs = [
      { id: 'report', label: '📋 総合レポート' },
      { id: 'bigfive', label: '🧠 性格特性' },
      { id: 'riasec', label: '💼 職業適性' },
      { id: 'strengths', label: '⭐ 強み' },
      { id: 'attachment', label: '🤝 愛着スタイル' },
      { id: 'egogram', label: '👨‍👩‍👦 エゴグラム' },
      { id: 'stress', label: '🛡️ ストレス対策' }
    ];

    // タブボタン
    var tabsHtml = '';
    for (var i = 0; i < tabs.length; i++) {
      var active = i === 0 ? ' active' : '';
      tabsHtml += '<button class="tab-btn' + active + '" data-tab="' + tabs[i].id + '">' + tabs[i].label + '</button>';
    }
    var tabsInner = document.getElementById('tabsInner');
    tabsInner.innerHTML = tabsHtml;

    tabsInner.addEventListener('click', function(e) {
      if (e.target.classList.contains('tab-btn')) {
        App.switchTab(e.target.dataset.tab);
      }
    });

    // タブパネル
    var panelsHtml = '';
    for (var j = 0; j < tabs.length; j++) {
      var activePanel = j === 0 ? ' active' : '';
      panelsHtml += '<div class="tab-panel' + activePanel + '" id="panel-' + tabs[j].id + '"></div>';
    }
    document.getElementById('tabContent').innerHTML = panelsHtml;

    // 各パネル描画
    this.renderReportPanel();
    this.renderBigFivePanel();
    this.renderRIASECPanel();
    this.renderStrengthsPanel();
    this.renderAttachmentPanel();
    this.renderEgogramPanel();
    this.renderStressPanel();

    // 全バーチャートのアニメーション
    this.animateBars();
  },

  animateBars() {
    var fills = document.querySelectorAll('.bar-fill');
    var targets = [];
    for (var i = 0; i < fills.length; i++) {
      targets.push(fills[i].style.width);
      fills[i].style.width = '0%';
      fills[i].style.transition = 'none';
    }
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        for (var j = 0; j < fills.length; j++) {
          fills[j].style.transition = 'width 0.8s ease';
          fills[j].style.width = targets[j];
        }
      });
    });
  },

  switchTab(tabId) {
    var btns = document.querySelectorAll('.tab-btn');
    for (var i = 0; i < btns.length; i++) { btns[i].classList.remove('active'); }
    document.querySelector('.tab-btn[data-tab="' + tabId + '"]').classList.add('active');

    var panels = document.querySelectorAll('.tab-panel');
    for (var j = 0; j < panels.length; j++) { panels[j].classList.remove('active'); }
    document.getElementById('panel-' + tabId).classList.add('active');
  },

  // ==========================================================
  // Big Five パネル（レーダーチャート）
  // ==========================================================
  renderBigFivePanel() {
    var bf = this.results.bigfive;
    var panel = document.getElementById('panel-bigfive');

    var radarSvg = this.createRadarChart(bf);

    var descHtml = '';
    var traitKeys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'stability'];
    for (var i = 0; i < traitKeys.length; i++) {
      var key = traitKeys[i];
      descHtml += '<div class="trait-description">';
      descHtml += '<strong>' + bf.labels[key] + '：' + bf.scores[key] + '点</strong>';
      descHtml += '<p>' + bf.descriptions[key] + '</p>';
      descHtml += '</div>';
    }

    panel.innerHTML =
      '<div class="result-card">' +
        '<h3><span class="icon">🧠</span>Big Five 性格特性</h3>' +
        '<p class="panel-intro">Big Five（OCEAN）は、Costa & McCraeが体系化した性格心理学の最も堅牢なモデルです。40年以上の研究蓄積があり、文化を超えて再現性が確認されています。開放性（Openness）・誠実性（Conscientiousness）・外向性（Extraversion）・協調性（Agreeableness）・情緒安定性（Neuroticism の逆転）の5因子によって、あなたの性格の基本構造を描写します。スコアは0〜100で表示され、50が平均的な水準です。</p>' +
        '<div class="chart-container">' + radarSvg + '</div>' +
      '</div>' +
      '<div class="result-card">' +
        '<h3><span class="icon">📝</span>各特性の詳細</h3>' +
        '<p class="panel-intro">以下は、あなたの回答から算出された各因子のスコアと、その意味の解説です。高い・低いに良し悪しはなく、それぞれが異なる強みと行動パターンを示しています。</p>' +
        descHtml +
      '</div>';
  },

  createRadarChart(bigfive) {
    var size = 340;
    var cx = size / 2;
    var cy = size / 2;
    var maxR = 110;
    var traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'stability'];
    var labels = ['開放性', '誠実性', '外向性', '協調性', '情緒安定性'];
    var n = traits.length;

    function polarToXY(angleDeg, radius) {
      var rad = (angleDeg - 90) * Math.PI / 180;
      return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
    }

    // グリッド（25%, 50%, 75%, 100%）
    var gridLines = '';
    var gridLevels = [25, 50, 75, 100];
    for (var g = 0; g < gridLevels.length; g++) {
      var r = maxR * gridLevels[g] / 100;
      var pts = [];
      for (var gi = 0; gi < n; gi++) {
        var p = polarToXY((360 / n) * gi, r);
        pts.push(p.x.toFixed(1) + ',' + p.y.toFixed(1));
      }
      gridLines += '<polygon points="' + pts.join(' ') + '" fill="none" stroke="#2a2a45" stroke-width="1"/>';
    }

    // 軸線
    var axisLines = '';
    for (var ai = 0; ai < n; ai++) {
      var ap = polarToXY((360 / n) * ai, maxR);
      axisLines += '<line x1="' + cx + '" y1="' + cy + '" x2="' + ap.x.toFixed(1) + '" y2="' + ap.y.toFixed(1) + '" stroke="#2a2a45" stroke-width="1"/>';
    }

    // データポリゴン
    var dataPoints = [];
    for (var di = 0; di < n; di++) {
      var val = bigfive.scores[traits[di]] / 100;
      var dp = polarToXY((360 / n) * di, maxR * val);
      dataPoints.push({ x: dp.x, y: dp.y });
    }
    var polyPts = dataPoints.map(function(p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ');

    // データ頂点ドット
    var dots = '';
    for (var dti = 0; dti < dataPoints.length; dti++) {
      dots += '<circle cx="' + dataPoints[dti].x.toFixed(1) + '" cy="' + dataPoints[dti].y.toFixed(1) + '" r="5" fill="#f97316" stroke="#0f0f1a" stroke-width="2"/>';
    }

    // ラベル
    var labelTexts = '';
    for (var li = 0; li < n; li++) {
      var lp = polarToXY((360 / n) * li, maxR + 28);
      var score = bigfive.scores[traits[li]];
      labelTexts += '<text x="' + lp.x.toFixed(1) + '" y="' + (lp.y - 6).toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="600" fill="#e8e8f0">' + labels[li] + '</text>';
      labelTexts += '<text x="' + lp.x.toFixed(1) + '" y="' + (lp.y + 10).toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="#f97316" font-weight="700">' + score + '</text>';
    }

    return '<svg viewBox="0 0 ' + size + ' ' + size + '" class="radar-chart" width="' + size + '" height="' + size + '">' +
      gridLines + axisLines +
      '<polygon points="' + polyPts + '" fill="rgba(249,115,22,0.15)" stroke="#f97316" stroke-width="2.5"/>' +
      dots + labelTexts +
      '</svg>';
  },

  // ==========================================================
  // RIASEC パネル（棒グラフ）
  // ==========================================================
  renderRIASECPanel() {
    var ri = this.results.riasec;
    var career = this.results.career;
    var panel = document.getElementById('panel-riasec');

    // 棒グラフ
    var barHtml = '<div class="bar-chart">';
    var types = ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'];
    var colors = ['#22b8cf', '#8b7cf6', '#f0a030', '#34d399', '#f97316', '#a78bfa'];
    for (var i = 0; i < types.length; i++) {
      var t = types[i];
      var score = ri.scores[t];
      barHtml += '<div class="bar-item">';
      barHtml += '<span class="bar-label">' + ri.labels[t] + '</span>';
      barHtml += '<div class="bar-track"><div class="bar-fill" style="width:' + score + '%;background:' + colors[i] + '"></div></div>';
      barHtml += '<span class="bar-value">' + score + '</span>';
      barHtml += '</div>';
    }
    barHtml += '</div>';

    // Holland Code
    var hollandHtml = '<div class="mt-24" style="text-align:center">';
    hollandHtml += '<p style="font-size:0.85rem;color:var(--text-secondary)">ホランド・コード</p>';
    hollandHtml += '<p style="font-size:2rem;font-weight:800;color:var(--color-riasec);letter-spacing:0.1em">' + ri.hollandCode + '</p>';
    hollandHtml += '</div>';

    // 上位3タイプ説明
    var top3Html = '<div class="mt-16">';
    for (var j = 0; j < ri.top3.length; j++) {
      var item = ri.top3[j];
      top3Html += '<div class="trait-description">';
      top3Html += '<strong>' + ri.labels[item.type] + '（' + item.score + '点）</strong>';
      top3Html += '<p>' + ri.descriptions[item.type] + '</p>';
      top3Html += '</div>';
    }
    top3Html += '</div>';

    // 適職提案
    var careerHtml = '<div class="result-card">';
    careerHtml += '<h3><span class="icon">🎯</span>おすすめの職業・分野</h3>';
    careerHtml += '<div class="tag-group">';
    for (var k = 0; k < career.careers.length; k++) {
      careerHtml += '<span class="tag">' + career.careers[k] + '</span>';
    }
    careerHtml += '</div>';

    // キャリアアドバイス
    var advHtml = '<ul class="advice-list mt-16">';
    for (var m = 0; m < career.advice.length; m++) {
      advHtml += '<li>' + career.advice[m] + '</li>';
    }
    advHtml += '</ul>';

    // 適した働き方
    var wsHtml = '<div class="mt-16"><strong>あなたに合った働き方</strong><div class="tag-group">';
    for (var w = 0; w < career.workStyle.length; w++) {
      wsHtml += '<span class="tag">' + career.workStyle[w] + '</span>';
    }
    wsHtml += '</div></div>';

    careerHtml += advHtml + wsHtml + '</div>';

    // 副業提案
    var sideHtml = '<div class="result-card">';
    sideHtml += '<h3><span class="icon">🚀</span>あなたに向いている副業</h3>';
    sideHtml += '<p class="panel-intro">あなたのRIASECタイプの組み合わせから、スキルや性格特性を活かせる副業を提案します。本業の経験と掛け合わせることで、さらに独自のポジションを築けます。</p>';
    sideHtml += '<div class="tag-group">';
    for (var sb = 0; sb < career.sideBusiness.length; sb++) {
      sideHtml += '<span class="tag" style="border-color:#f97316;color:#f97316">' + career.sideBusiness[sb] + '</span>';
    }
    sideHtml += '</div></div>';

    panel.innerHTML =
      '<div class="result-card">' +
        '<h3><span class="icon">💼</span>RIASEC 職業適性</h3>' +
        '<p class="panel-intro">Holland RIASECは、心理学者John Hollandが開発し、米国労働省O*NETに正式採用されている職業適性モデルです。現実型（Realistic）・研究型（Investigative）・芸術型（Artistic）・社会型（Social）・企業型（Enterprising）・慣習型（Conventional）の6類型であなたの興味パターンを分類します。上位3つの類型を組み合わせた3文字のコード（ホランド・コード）が、あなたの職業的パーソナリティを表します。</p>' +
        barHtml + hollandHtml + top3Html +
      '</div>' +
      careerHtml + sideHtml;
  },

  // ==========================================================
  // 強み分析パネル
  // ==========================================================
  renderStrengthsPanel() {
    var st = this.results.strengths;
    var panel = document.getElementById('panel-strengths');

    // 上位3つハイライト
    var topHtml = '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:24px">';
    var medals = ['🥇', '🥈', '🥉'];
    for (var i = 0; i < st.top3.length; i++) {
      var item = st.top3[i];
      topHtml += '<div style="flex:1;min-width:140px;text-align:center;padding:20px 12px;background:var(--bg-input);border-radius:var(--radius-sm);border:1px solid var(--border)">';
      topHtml += '<div style="font-size:2rem">' + medals[i] + '</div>';
      topHtml += '<div style="font-size:1.1rem;font-weight:700;color:#f0a030;margin:4px 0">' + st.labels[item.virtue] + '</div>';
      topHtml += '<div style="font-size:0.85rem;color:var(--text-secondary)">' + item.score + '点</div>';
      topHtml += '</div>';
    }
    topHtml += '</div>';

    // 棒グラフ
    var barHtml = '<div class="bar-chart">';
    var virtues = ['wisdom', 'courage', 'humanity', 'justice', 'temperance', 'transcendence'];
    var colors = ['#6366f1', '#dc2626', '#059669', '#0891b2', '#7c3aed', '#d97706'];
    for (var j = 0; j < virtues.length; j++) {
      var v = virtues[j];
      var score = st.scores[v];
      barHtml += '<div class="bar-item">';
      barHtml += '<span class="bar-label">' + st.labels[v] + '</span>';
      barHtml += '<div class="bar-track"><div class="bar-fill" style="width:' + score + '%;background:' + colors[j] + '"></div></div>';
      barHtml += '<span class="bar-value">' + score + '</span>';
      barHtml += '</div>';
    }
    barHtml += '</div>';

    // 説明
    var descHtml = '<div class="mt-16">';
    for (var k = 0; k < st.top3.length; k++) {
      var vItem = st.top3[k];
      descHtml += '<div class="trait-description">';
      descHtml += '<strong>' + st.labels[vItem.virtue] + '</strong>';
      descHtml += '<p>' + st.descriptions[vItem.virtue] + '</p>';
      descHtml += '</div>';
    }
    descHtml += '</div>';

    panel.innerHTML =
      '<div class="result-card">' +
        '<h3><span class="icon">⭐</span>あなたの強みトップ3</h3>' +
        '<p class="panel-intro">Peterson & Seligmanのポジティブ心理学理論に基づき、あなたの中核的な強みを特定しました。世界中の哲学・宗教・文化に共通して見られる人間の美徳を6カテゴリに分類し、回答から最も顕著な強みを抽出しています。</p>' +
        topHtml +
      '</div>' +
      '<div class="result-card">' +
        '<h3><span class="icon">📊</span>6つの美徳スコア</h3>' +
        '<p class="panel-intro">VIA-IS（Values in Action Inventory of Strengths）の6美徳カテゴリそれぞれのスコアです。スコアが高い美徳は、あなたが日常的に発揮している強みの領域を示しています。自分の強みを意識的に活用することで、ウェルビーイング（幸福感）の向上に繋がることが研究で示されています。</p>' +
        barHtml + descHtml +
      '</div>';
  },

  // ==========================================================
  // 愛着スタイルパネル
  // ==========================================================
  renderAttachmentPanel() {
    var at = this.results.attachment;
    var rel = this.results.relationship;
    var panel = document.getElementById('panel-attachment');

    // メインスタイル表示
    var visualHtml = '<div class="attachment-visual">';
    visualHtml += '<div style="font-size:2.5rem;margin-bottom:8px">';
    var styleIcons = { secure: '🛡️', anxious: '💓', avoidant: '🏔️', disorganized: '🌀' };
    visualHtml += styleIcons[at.dominant] || '🤝';
    visualHtml += '</div>';
    visualHtml += '<div class="style-name">' + at.labels[at.dominant] + '</div>';
    visualHtml += '<p class="style-desc">' + at.descriptions[at.dominant] + '</p>';
    visualHtml += '</div>';

    // 4スタイルの棒グラフ
    var barHtml = '<div class="bar-chart">';
    var styles = ['secure', 'anxious', 'avoidant', 'disorganized'];
    var styleColors = ['#059669', '#dc2626', '#6366f1', '#d97706'];
    for (var i = 0; i < styles.length; i++) {
      var s = styles[i];
      var score = at.scores[s];
      barHtml += '<div class="bar-item">';
      barHtml += '<span class="bar-label">' + at.labels[s] + '</span>';
      barHtml += '<div class="bar-track"><div class="bar-fill" style="width:' + score + '%;background:' + styleColors[i] + '"></div></div>';
      barHtml += '<span class="bar-value">' + score + '</span>';
      barHtml += '</div>';
    }
    barHtml += '</div>';

    // アドバイス
    var advHtml = '<ul class="advice-list mt-16">';
    for (var j = 0; j < at.advice.length; j++) {
      advHtml += '<li>' + at.advice[j] + '</li>';
    }
    advHtml += '</ul>';

    // 人間関係アドバイス
    var relHtml = '<div class="result-card">';
    relHtml += '<h3><span class="icon">💕</span>人間関係アドバイス</h3>';
    relHtml += '<div class="level-badge mid">' + rel.style + 'の対人スタイル</div>';
    relHtml += '<ul class="advice-list">';
    for (var k = 0; k < rel.advice.length; k++) {
      relHtml += '<li>' + rel.advice[k] + '</li>';
    }
    relHtml += '</ul>';
    relHtml += '</div>';

    panel.innerHTML =
      '<div class="result-card">' +
        '<h3><span class="icon">🤝</span>愛着スタイル診断</h3>' +
        '<p class="panel-intro">Bowlbyの愛着理論をBartholomewが成人向けに発展させたモデルに基づく判定結果です。幼少期からの対人経験を通じて形成される「自己観」（自分は愛される価値があるか）と「他者観」（他者は信頼できるか）の2軸から、あなたの対人関係パターンを4つのスタイルに分類します。愛着スタイルは固定的なものではなく、自己理解と意識的な努力によって変化させることが可能です。</p>' +
        visualHtml + barHtml + advHtml +
      '</div>' +
      relHtml;
  },

  // ==========================================================
  // エゴグラムパネル
  // ==========================================================
  renderEgogramPanel() {
    var ego = this.results.egogram;
    var panel = document.getElementById('panel-egogram');

    // パターン表示
    var patternHtml = '<div style="text-align:center;margin-bottom:24px">';
    patternHtml += '<div style="font-size:2.5rem;margin-bottom:8px">👨‍👩‍👦</div>';
    patternHtml += '<div style="font-size:1.3rem;font-weight:700;color:#e11d48">' + ego.pattern.name + '</div>';
    patternHtml += '<p style="font-size:0.92rem;color:var(--text-secondary);margin-top:8px;line-height:1.7">' + ego.pattern.description + '</p>';
    patternHtml += '</div>';

    // 略語凡例
    var legendHtml = '<div class="egogram-legend">';
    legendHtml += '<div class="egogram-legend-item"><span class="egogram-legend-abbr" style="color:#dc2626">CP</span> 厳格な親（Critical Parent）</div>';
    legendHtml += '<div class="egogram-legend-item"><span class="egogram-legend-abbr" style="color:#059669">NP</span> 養育的な親（Nurturing Parent）</div>';
    legendHtml += '<div class="egogram-legend-item"><span class="egogram-legend-abbr" style="color:#6366f1">A</span> 大人（Adult）</div>';
    legendHtml += '<div class="egogram-legend-item"><span class="egogram-legend-abbr" style="color:#d97706">FC</span> 自由な子ども（Free Child）</div>';
    legendHtml += '<div class="egogram-legend-item"><span class="egogram-legend-abbr" style="color:#7c3aed">AC</span> 順応した子ども（Adapted Child）</div>';
    legendHtml += '</div>';

    // 5つの自我状態の棒グラフ
    var barHtml = '<div class="bar-chart">';
    var states = ['cp', 'np', 'a', 'fc', 'ac'];
    var stateColors = ['#dc2626', '#059669', '#6366f1', '#d97706', '#7c3aed'];
    for (var i = 0; i < states.length; i++) {
      var s = states[i];
      var score = ego.scores[s];
      barHtml += '<div class="bar-item">';
      barHtml += '<span class="bar-label">' + ego.shortLabels[s] + '</span>';
      barHtml += '<div class="bar-track"><div class="bar-fill" style="width:' + score + '%;background:' + stateColors[i] + '"></div></div>';
      barHtml += '<span class="bar-value">' + score + '</span>';
      barHtml += '</div>';
    }
    barHtml += '</div>';

    // 各自我状態の説明
    var descHtml = '<div class="mt-16">';
    for (var j = 0; j < states.length; j++) {
      var st = states[j];
      descHtml += '<div class="trait-description">';
      descHtml += '<strong>' + ego.labels[st] + '：' + ego.scores[st] + '点</strong>';
      descHtml += '<p>' + ego.descriptions[st] + '</p>';
      descHtml += '</div>';
    }
    descHtml += '</div>';

    // アドバイス
    var advHtml = '<div class="result-card">';
    advHtml += '<h3><span class="icon">💡</span>エゴグラムからのアドバイス</h3>';
    advHtml += '<ul class="advice-list">';
    for (var k = 0; k < ego.advice.length; k++) {
      advHtml += '<li>' + ego.advice[k] + '</li>';
    }
    advHtml += '</ul>';
    advHtml += '</div>';

    panel.innerHTML =
      '<div class="result-card">' +
        '<h3><span class="icon">👨‍👩‍👦</span>エゴグラム（交流分析）</h3>' +
        '<p class="panel-intro">Eric Berneの交流分析理論に基づき、John Dusayが開発したエゴグラムの結果です。人間の心の中には「親（Parent）」「大人（Adult）」「子ども（Child）」の3つの自我状態があり、さらに親はCP（批判的）とNP（養育的）に、子どもはFC（自由）とAC（順応）に分かれます。この5つの自我状態のエネルギー配分バランスが、あなたの対人コミュニケーションの特徴を表します。</p>' +
        patternHtml + legendHtml + barHtml +
      '</div>' +
      '<div class="result-card">' +
        '<h3><span class="icon">📝</span>5つの自我状態の詳細</h3>' +
        '<p class="panel-intro">各自我状態のスコアと解説です。エゴグラムでは「高い＝良い」ではなく、5つの自我状態のバランスが重要です。極端に低い自我状態を意識的に育てることで、コミュニケーションの幅を広げることができます。</p>' +
        descHtml +
      '</div>' +
      advHtml;
  },

  // ==========================================================
  // ストレス対策パネル
  // ==========================================================
  renderStressPanel() {
    var sens = this.results.sensitivity;
    var stress = this.results.stress;
    var panel = document.getElementById('panel-stress');

    // 感受性レベル
    var levelClass = sens.overall >= 70 ? 'high' : (sens.overall >= 40 ? 'mid' : 'low');
    var sensHtml = '<div class="level-badge ' + levelClass + '">' + sens.level + '（スコア: ' + sens.overall + '）</div>';
    sensHtml += '<p style="margin-bottom:16px;font-size:0.92rem;line-height:1.7">' + sens.description + '</p>';

    // 感受性の3次元棒グラフ
    var sensBarHtml = '<div class="bar-chart">';
    var dims = ['sensory', 'emotional', 'depth'];
    var dimColors = ['#7c3aed', '#ec4899', '#6366f1'];
    for (var i = 0; i < dims.length; i++) {
      var d = dims[i];
      var score = sens.scores[d];
      sensBarHtml += '<div class="bar-item">';
      sensBarHtml += '<span class="bar-label">' + sens.labels[d] + '</span>';
      sensBarHtml += '<div class="bar-track"><div class="bar-fill" style="width:' + score + '%;background:' + dimColors[i] + '"></div></div>';
      sensBarHtml += '<span class="bar-value">' + score + '</span>';
      sensBarHtml += '</div>';
    }
    sensBarHtml += '</div>';

    // セルフケアTips
    var tipsHtml = '<ul class="advice-list mt-16">';
    for (var j = 0; j < sens.tips.length; j++) {
      tipsHtml += '<li>' + sens.tips[j] + '</li>';
    }
    tipsHtml += '</ul>';

    // ストレス要因
    var stressHtml = '<div class="result-card">';
    stressHtml += '<h3><span class="icon">⚡</span>ストレス要因</h3>';
    stressHtml += '<ul class="advice-list">';
    for (var k = 0; k < stress.stressFactors.length; k++) {
      stressHtml += '<li style="border-left-color:#ef4444">' + stress.stressFactors[k] + '</li>';
    }
    stressHtml += '</ul>';
    stressHtml += '</div>';

    // コーピング戦略
    var copingHtml = '<div class="result-card">';
    copingHtml += '<h3><span class="icon">🧘</span>おすすめのコーピング戦略</h3>';
    copingHtml += '<ul class="advice-list">';
    for (var m = 0; m < stress.copingStrategies.length; m++) {
      copingHtml += '<li style="border-left-color:#059669">' + stress.copingStrategies[m] + '</li>';
    }
    copingHtml += '</ul>';
    copingHtml += '</div>';

    // レジリエンス
    var resLevelClass = stress.resilience.level === '高い' ? 'low' : (stress.resilience.level === '普通' ? 'mid' : 'high');
    var resHtml = '<div class="result-card">';
    resHtml += '<h3><span class="icon">💪</span>レジリエンス（回復力）</h3>';
    resHtml += '<div class="level-badge ' + resLevelClass + '">回復力: ' + stress.resilience.level + '</div>';
    resHtml += '<p style="font-size:0.92rem;line-height:1.7">' + stress.resilience.description + '</p>';
    resHtml += '</div>';

    panel.innerHTML =
      '<div class="result-card">' +
        '<h3><span class="icon">🌿</span>感受性プロファイル</h3>' +
        '<p class="panel-intro">Elaine Aronの感覚処理感受性（Sensory Processing Sensitivity）理論に基づく評価結果です。人口の約15〜20%が「高感受性（HSP: Highly Sensitive Person）」に該当するとされ、環境の微細な変化をキャッチする能力に優れる一方、過剰な刺激でストレスを感じやすい傾向があります。感覚過敏・情動反応性・処理の深さの3因子から、あなたの感受性パターンとストレス対処法を分析しました。</p>' +
        sensHtml + sensBarHtml + tipsHtml +
      '</div>' +
      stressHtml + copingHtml + resHtml;
  },

  // ==========================================================
  // 総合レポートパネル
  // ==========================================================
  renderReportPanel() {
    var panel = document.getElementById('panel-report');
    var s = this.results.summary;
    var bf = this.results.bigfive;
    var ri = this.results.riasec;
    var st = this.results.strengths;
    var at = this.results.attachment;
    var sens = this.results.sensitivity;
    var ego = this.results.egogram;
    var career = this.results.career;
    var stress = this.results.stress;
    var rel = this.results.relationship;
    var manual = this.results.manual;

    var html = '';

    // --- 1. パーソナリティ概要（動物カード）---
    html += '<div class="result-card animal-card" style="border-color:' + s.color + '40;background:linear-gradient(135deg, ' + s.color + '12 0%, var(--bg-card) 60%)">';
    html += '<div style="text-align:center;margin-bottom:16px">';
    html += s.image
      ? '<div style="margin-bottom:8px"><img src="' + s.image + '" alt="' + s.animal + '" class="animal-img-card"></div>'
      : '<div style="font-size:4rem;margin-bottom:8px">' + s.emoji + '</div>';
    html += '<div style="font-size:1.5rem;font-weight:800;color:' + s.color + ';margin-bottom:4px">' + s.typeName + '</div>';
    html += '<div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:12px">32タイプ中の1つ</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:12px">';
    for (var ki = 0; ki < s.keywords.length; ki++) {
      html += '<span class="tag" style="border-color:' + s.color + '40;color:' + s.color + '">' + s.keywords[ki] + '</span>';
    }
    html += '</div>';
    html += '<p style="font-size:0.92rem;color:var(--text-secondary);line-height:1.8;max-width:600px;margin:0 auto">' + s.summary + '</p>';
    html += '</div></div>';

    // --- 2. Big Five サマリー ---
    var radarSvg = this.createRadarChart(bf);
    html += '<div class="result-card">';
    html += '<h3><span class="icon">🧠</span>性格特性（Big Five）</h3>';
    html += '<div class="chart-container">' + radarSvg + '</div>';
    var bfKeys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'stability'];
    html += '<div class="report-scores-grid">';
    for (var bi = 0; bi < bfKeys.length; bi++) {
      html += '<div class="report-score-item">';
      html += '<div class="report-score-label">' + bf.labels[bfKeys[bi]] + '</div>';
      html += '<div class="report-score-value" style="color:#8b7cf6">' + bf.scores[bfKeys[bi]] + '</div>';
      html += '</div>';
    }
    html += '</div></div>';

    // --- 3. 職業適性 & 副業 ---
    html += '<div class="result-card">';
    html += '<h3><span class="icon">💼</span>職業適性 & 副業提案</h3>';
    html += '<div style="text-align:center;margin-bottom:16px">';
    html += '<div style="font-size:0.82rem;color:var(--text-secondary)">ホランド・コード</div>';
    html += '<div style="font-size:2rem;font-weight:800;color:#22b8cf;letter-spacing:0.1em">' + ri.hollandCode + '</div>';
    html += '</div>';
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:16px">';
    for (var ti = 0; ti < ri.top3.length; ti++) {
      html += '<span class="tag" style="border-color:#22b8cf;color:#22b8cf">' + ri.labels[ri.top3[ti].type] + '（' + ri.top3[ti].score + '）</span>';
    }
    html += '</div>';
    html += '<div style="margin-bottom:16px"><strong style="font-size:0.88rem;color:var(--text)">おすすめの職業</strong><div class="tag-group">';
    for (var ci = 0; ci < career.careers.length; ci++) {
      html += '<span class="tag">' + career.careers[ci] + '</span>';
    }
    html += '</div></div>';
    html += '<div><strong style="font-size:0.88rem;color:var(--text)">おすすめの副業</strong><div class="tag-group">';
    for (var sbi = 0; sbi < career.sideBusiness.length; sbi++) {
      html += '<span class="tag" style="border-color:#f97316;color:#f97316">' + career.sideBusiness[sbi] + '</span>';
    }
    html += '</div></div></div>';

    // --- 4. 強みプロファイル ---
    html += '<div class="result-card">';
    html += '<h3><span class="icon">⭐</span>強みトップ3</h3>';
    var medals = ['🥇', '🥈', '🥉'];
    html += '<div style="display:flex;flex-wrap:wrap;gap:12px">';
    for (var si2 = 0; si2 < st.top3.length; si2++) {
      html += '<div style="flex:1;min-width:100px;text-align:center;padding:16px 12px;background:var(--bg-input);border-radius:var(--radius-sm);border:1px solid var(--border)">';
      html += '<div style="font-size:1.5rem">' + medals[si2] + '</div>';
      html += '<div style="font-size:1rem;font-weight:700;color:#f0a030">' + st.labels[st.top3[si2].virtue] + '</div>';
      html += '<div style="font-size:0.82rem;color:var(--text-secondary)">' + st.top3[si2].score + '点</div>';
      html += '</div>';
    }
    html += '</div></div>';

    // --- 5. 対人関係パターン ---
    html += '<div class="result-card">';
    html += '<h3><span class="icon">🤝</span>対人関係パターン</h3>';
    var styleIcons = { secure: '🛡️', anxious: '💓', avoidant: '🏔️', disorganized: '🌀' };
    html += '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px">';
    html += '<div style="flex:1;min-width:180px;text-align:center;padding:20px;background:rgba(52,211,153,0.06);border-radius:var(--radius-sm);border:1px solid rgba(52,211,153,0.15)">';
    html += '<div style="font-size:1.5rem">' + (styleIcons[at.dominant] || '🤝') + '</div>';
    html += '<div style="font-size:1.1rem;font-weight:700;color:#34d399">' + at.labels[at.dominant] + '</div>';
    html += '<p style="font-size:0.82rem;color:var(--text-secondary);margin-top:4px">' + at.descriptions[at.dominant].split('。')[0] + '。</p>';
    html += '</div>';
    html += '<div style="flex:1;min-width:180px;text-align:center;padding:20px;background:rgba(244,114,182,0.06);border-radius:var(--radius-sm);border:1px solid rgba(244,114,182,0.15)">';
    html += '<div style="font-size:1.5rem">👨‍👩‍👦</div>';
    html += '<div style="font-size:1.1rem;font-weight:700;color:#f472b6">' + ego.pattern.name + '</div>';
    html += '<p style="font-size:0.82rem;color:var(--text-secondary);margin-top:4px">' + ego.pattern.description.split('。')[0] + '。</p>';
    html += '</div></div>';
    html += '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">';
    var egoStates = ['cp', 'np', 'a', 'fc', 'ac'];
    var egoColors = ['#dc2626', '#059669', '#6366f1', '#d97706', '#7c3aed'];
    for (var ei = 0; ei < egoStates.length; ei++) {
      html += '<div style="text-align:center;padding:8px 12px;background:var(--bg-input);border-radius:var(--radius-sm);border:1px solid var(--border);min-width:50px">';
      html += '<div style="font-size:0.75rem;color:var(--text-muted)">' + ego.shortLabels[egoStates[ei]] + '</div>';
      html += '<div style="font-size:1.1rem;font-weight:700;color:' + egoColors[ei] + '">' + ego.scores[egoStates[ei]] + '</div>';
      html += '</div>';
    }
    html += '</div></div>';

    // --- 6. ストレス & セルフケア ---
    var levelClass = sens.overall >= 70 ? 'high' : (sens.overall >= 40 ? 'mid' : 'low');
    var resClass = stress.resilience.level === '高い' ? 'low' : (stress.resilience.level === '普通' ? 'mid' : 'high');
    html += '<div class="result-card">';
    html += '<h3><span class="icon">🛡️</span>ストレス & セルフケア</h3>';
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">';
    html += '<div class="level-badge ' + levelClass + '">感受性: ' + sens.level + '（' + sens.overall + '）</div>';
    html += '<div class="level-badge ' + resClass + '">回復力: ' + stress.resilience.level + '</div>';
    html += '</div>';
    html += '<div style="display:flex;gap:16px;flex-wrap:wrap">';
    html += '<div style="flex:1;min-width:200px"><strong style="font-size:0.85rem;color:var(--text)">⚡ ストレス要因</strong><ul class="advice-list mt-8">';
    for (var sf = 0; sf < stress.stressFactors.length; sf++) {
      html += '<li style="border-left-color:#ef4444">' + stress.stressFactors[sf] + '</li>';
    }
    html += '</ul></div>';
    html += '<div style="flex:1;min-width:200px"><strong style="font-size:0.85rem;color:var(--text)">🧘 コーピング戦略</strong><ul class="advice-list mt-8">';
    for (var cs = 0; cs < stress.copingStrategies.length; cs++) {
      html += '<li style="border-left-color:#059669">' + stress.copingStrategies[cs] + '</li>';
    }
    html += '</ul></div></div></div>';

    // --- 7. あなたの取扱説明書（ハイライト）---
    html += '<div class="result-card report-manual">';
    html += '<h3><span class="icon">📖</span>あなたの取扱説明書</h3>';
    html += '<p class="panel-intro">Big Five・RIASEC・強み・愛着スタイル・感受性・エゴグラムの全スコアを掛け合わせて生成された、あなただけの「取扱説明書」です。</p>';

    // 行動パターン
    html += '<div class="manual-section">';
    html += '<h4 class="manual-heading" style="color:#f97316">🔍 行動パターン</h4>';
    for (var mb = 0; mb < manual.behaviors.length; mb++) {
      html += '<p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.8;margin-bottom:8px">' + manual.behaviors[mb] + '</p>';
    }
    html += '</div>';

    // コミュニケーション
    html += '<div class="manual-section">';
    html += '<h4 class="manual-heading" style="color:#22b8cf">💬 コミュニケーションのコツ</h4>';
    html += '<ul class="advice-list">';
    for (var mc = 0; mc < manual.communication.length; mc++) {
      html += '<li style="border-left-color:#22b8cf">' + manual.communication[mc] + '</li>';
    }
    html += '</ul></div>';

    // チーム役割
    html += '<div class="manual-section">';
    html += '<h4 class="manual-heading" style="color:#34d399">👥 理想のチーム役割</h4>';
    html += '<ul class="advice-list">';
    for (var mr = 0; mr < manual.teamRoles.length; mr++) {
      html += '<li style="border-left-color:#34d399">' + manual.teamRoles[mr] + '</li>';
    }
    html += '</ul></div>';

    // モチベーション
    html += '<div class="manual-section">';
    html += '<h4 class="manual-heading" style="color:#f0a030">⚡ モチベーションの源泉</h4>';
    html += '<div class="tag-group">';
    for (var mm = 0; mm < manual.motivations.length; mm++) {
      html += '<span class="tag" style="border-color:#f0a030;color:#f0a030">' + manual.motivations[mm] + '</span>';
    }
    html += '</div></div>';

    // 注意点
    html += '<div class="manual-section">';
    html += '<h4 class="manual-heading" style="color:#ef4444">⚠️ 注意すべきポイント</h4>';
    html += '<ul class="advice-list">';
    for (var mw = 0; mw < manual.warnings.length; mw++) {
      html += '<li style="border-left-color:#ef4444">' + manual.warnings[mw] + '</li>';
    }
    html += '</ul></div>';

    // 学習スタイル
    html += '<div class="manual-section">';
    html += '<h4 class="manual-heading" style="color:#6366f1">📚 あなたの学習スタイル</h4>';
    for (var ml = 0; ml < manual.learningStyle.length; ml++) {
      html += '<p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.8;margin-bottom:8px">' + manual.learningStyle[ml] + '</p>';
    }
    html += '</div>';

    // 意思決定パターン
    html += '<div class="manual-section">';
    html += '<h4 class="manual-heading" style="color:#0ea5e9">🧭 意思決定パターン</h4>';
    for (var md = 0; md < manual.decisionMaking.length; md++) {
      html += '<p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.8;margin-bottom:8px">' + manual.decisionMaking[md] + '</p>';
    }
    html += '</div>';

    // 理想の環境
    html += '<div class="manual-section">';
    html += '<h4 class="manual-heading" style="color:#10b981">🏠 理想の環境</h4>';
    for (var me = 0; me < manual.idealEnvironment.length; me++) {
      html += '<p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.8;margin-bottom:8px">' + manual.idealEnvironment[me] + '</p>';
    }
    html += '</div>';

    // 成長のためのアクションプラン
    html += '<div class="manual-section">';
    html += '<h4 class="manual-heading" style="color:#f59e0b">🚀 成長のためのアクションプラン</h4>';
    for (var mg = 0; mg < manual.growthPlan.length; mg++) {
      html += '<p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.8;margin-bottom:8px">' + manual.growthPlan[mg] + '</p>';
    }
    html += '</div>';

    html += '</div>';

    // --- 8. この診断の理論的根拠 ---
    html += '<div class="result-card">';
    html += '<h3><span class="icon">📚</span>この診断の理論的根拠</h3>';
    html += '<p class="panel-intro">この診断は、以下の6つの科学的理論を統合し、29の次元からパーソナリティを分析しています。各タブで詳細なスコアと解説を確認できます。</p>';
    html += '<div class="theory-reference-grid">';
    var theories = [
      { icon: '🧠', tab: 'bigfive', name: 'Big Five（OCEAN）', author: 'Costa & McCrae', desc: '性格5因子モデル。40年以上の研究蓄積を持つ最も堅牢な性格モデル' },
      { icon: '💼', tab: 'riasec', name: 'Holland RIASEC', author: 'John Holland', desc: '職業興味6類型。米国労働省O*NETに正式採用' },
      { icon: '⭐', tab: 'strengths', name: 'VIA-IS', author: 'Peterson & Seligman', desc: '性格的強み6美徳24強み。ポジティブ心理学の基盤理論' },
      { icon: '🤝', tab: 'attachment', name: '愛着理論', author: 'Bowlby / Bartholomew', desc: '対人関係4類型。自己観と他者観の2軸で愛着パターンを分類' },
      { icon: '🛡️', tab: 'stress', name: 'SPS / HSP', author: 'Elaine Aron', desc: '感覚処理感受性。人口の15〜20%が持つ高感受性特性を3因子で測定' },
      { icon: '👨‍👩‍👦', tab: 'egogram', name: '交流分析（エゴグラム）', author: 'Berne / Dusay', desc: '5つの自我状態のバランスで対人コミュニケーションを可視化' }
    ];
    for (var th = 0; th < theories.length; th++) {
      var t = theories[th];
      html += '<div class="theory-ref-item" onclick="App.switchTab(\'' + t.tab + '\');document.querySelector(\'.results-tabs\').scrollIntoView({behavior:\'smooth\'})">';
      html += '<div class="theory-ref-icon">' + t.icon + '</div>';
      html += '<div class="theory-ref-body">';
      html += '<div class="theory-ref-name">' + t.name + '</div>';
      html += '<div class="theory-ref-author">' + t.author + '</div>';
      html += '<div class="theory-ref-desc">' + t.desc + '</div>';
      html += '</div></div>';
    }
    html += '</div></div>';

    panel.innerHTML = html;
  },

  // ==========================================================
  // シェア機能
  // ==========================================================
  shareResults() {
    if (!this.results) return;

    var s = this.results.summary;
    var bf = this.results.bigfive;
    var ri = this.results.riasec;
    var st = this.results.strengths;
    var at = this.results.attachment;
    var sens = this.results.sensitivity;

    var career = this.results.career;
    var ego = this.results.egogram;
    var stress = this.results.stress;
    var manual = this.results.manual;

    var text = '【アニマルオーラ診断32 結果レポート】\n\n';
    text += '━━━ あなたのアニマルオーラ ━━━\n';
    text += s.emoji + ' ' + s.typeName + '\n';
    text += '📝 ' + s.summary + '\n';
    text += '🔑 キーワード: ' + s.keywords.join('・') + '\n\n';
    text += '━━━ Big Five 性格特性 ━━━\n';
    var bfKeys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'stability'];
    for (var i = 0; i < bfKeys.length; i++) {
      text += '  ' + bf.labels[bfKeys[i]] + ': ' + bf.scores[bfKeys[i]] + '\n';
    }
    text += '\n━━━ 職業適性（RIASEC）━━━\n';
    text += '💼 ホランド・コード: ' + ri.hollandCode + '\n';
    text += '🎯 おすすめ職業: ' + career.careers.slice(0, 5).join('、') + '\n';
    text += '🚀 おすすめ副業: ' + career.sideBusiness.join('、') + '\n';
    text += '\n━━━ 強みトップ3 ━━━\n';
    var medals3 = ['🥇', '🥈', '🥉'];
    for (var si3 = 0; si3 < st.top3.length; si3++) {
      text += medals3[si3] + ' ' + st.labels[st.top3[si3].virtue] + '（' + st.top3[si3].score + '点）\n';
    }
    text += '\n━━━ 対人関係 ━━━\n';
    text += '🤝 愛着スタイル: ' + at.labels[at.dominant] + '\n';
    text += '👨‍👩‍👦 エゴグラム: ' + ego.pattern.name + '\n';
    text += '  CP:' + ego.scores.cp + ' NP:' + ego.scores.np + ' A:' + ego.scores.a + ' FC:' + ego.scores.fc + ' AC:' + ego.scores.ac + '\n';
    text += '\n━━━ ストレス＆セルフケア ━━━\n';
    text += '🌿 感受性: ' + sens.level + '（' + sens.overall + '）\n';
    text += '💪 回復力: ' + stress.resilience.level + '\n';
    text += '\n━━━ あなたの取扱説明書 ━━━\n';
    text += '🔍 行動パターン:\n';
    for (var b = 0; b < manual.behaviors.length; b++) {
      text += '  • ' + manual.behaviors[b] + '\n';
    }
    text += '💬 コミュニケーション:\n';
    for (var c = 0; c < manual.communication.length; c++) {
      text += '  • ' + manual.communication[c] + '\n';
    }
    text += '👥 チーム役割:\n';
    for (var r = 0; r < manual.teamRoles.length; r++) {
      text += '  • ' + manual.teamRoles[r] + '\n';
    }
    text += '⚡ モチベーション: ' + manual.motivations.join('、') + '\n';
    text += '⚠️ 注意点:\n';
    for (var w = 0; w < manual.warnings.length; w++) {
      text += '  • ' + manual.warnings[w] + '\n';
    }
    text += '\n📚 学習スタイル:\n';
    for (var ls = 0; ls < manual.learningStyle.length; ls++) {
      text += '  • ' + manual.learningStyle[ls] + '\n';
    }
    text += '\n🧭 意思決定パターン:\n';
    for (var dm = 0; dm < manual.decisionMaking.length; dm++) {
      text += '  • ' + manual.decisionMaking[dm] + '\n';
    }
    text += '\n🏠 理想の環境:\n';
    for (var ie = 0; ie < manual.idealEnvironment.length; ie++) {
      text += '  • ' + manual.idealEnvironment[ie] + '\n';
    }
    text += '\n🚀 成長のためのアクションプラン:\n';
    for (var gp = 0; gp < manual.growthPlan.length; gp++) {
      text += '  • ' + manual.growthPlan[gp] + '\n';
    }
    text += '\n🔗 診断はこちら: ' + window.location.origin + window.location.pathname + '\n';

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        var btn = document.getElementById('btnShare');
        var original = btn.textContent;
        btn.textContent = '✅ コピーしました！';
        setTimeout(function() { btn.textContent = original; }, 2000);
      });
    } else {
      // フォールバック
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      var btn = document.getElementById('btnShare');
      var original = btn.textContent;
      btn.textContent = '✅ コピーしました！';
      setTimeout(function() { btn.textContent = original; }, 2000);
    }
  },

  // ==========================================================
  // SNSシェア
  // ==========================================================
  shareToX() {
    if (!this.results) return;
    var s = this.results.summary;
    var url = window.location.origin + window.location.pathname;

    var text = '私は【' + s.typeName + s.emoji + '】でした！\n';
    text += s.keywords.join('・') + '\n';
    text += '#性格診断 #アニマルオーラ診断32';

    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url), '_blank');
  },

  shareToLINE() {
    if (!this.results) return;
    var s = this.results.summary;
    var url = window.location.origin + window.location.pathname;
    var text = '私は【' + s.typeName + s.emoji + '】でした！\n' + s.summary + '\n' + url;

    window.open('https://line.me/R/share?text=' + encodeURIComponent(text), '_blank');
  },

  // ==========================================================
  // PDFダウンロード
  // ==========================================================
  downloadPDF() {
    if (typeof html2canvas === 'undefined') {
      window.print();
      return;
    }

    this.switchTab('report');

    var btn = document.getElementById('btnPDF');
    var originalText = btn.textContent;
    btn.textContent = '⏳ 生成中...';
    btn.disabled = true;

    var element = document.getElementById('panel-report');

    // PDF用に一時的にライトモード（白背景）に切り替え
    var root = document.documentElement;
    var lightVars = {
      '--bg-dark': '#ffffff',
      '--bg-card': '#f8f8fc',
      '--bg-card-hover': '#f0f0f5',
      '--bg-input': '#f4f4f8',
      '--text': '#1a1a2e',
      '--text-secondary': '#4a4a68',
      '--text-muted': '#7a7a98',
      '--border': '#d8d8e8',
      '--border-light': '#e0e0ee'
    };
    var savedVars = {};
    for (var key in lightVars) {
      savedVars[key] = root.style.getPropertyValue(key);
      root.style.setProperty(key, lightVars[key]);
    }

    // インラインスタイルで設定されたテーマ色背景も白系に変更
    var heroCards = element.querySelectorAll('.animal-card');
    var savedCardStyles = [];
    for (var ci = 0; ci < heroCards.length; ci++) {
      savedCardStyles.push(heroCards[ci].getAttribute('style'));
      heroCards[ci].style.background = '#f8f8fc';
    }

    html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false
    }).then(function(canvas) {
      // ダークモードに戻す
      for (var key in savedVars) {
        if (savedVars[key]) {
          root.style.setProperty(key, savedVars[key]);
        } else {
          root.style.removeProperty(key);
        }
      }
      for (var ci = 0; ci < heroCards.length; ci++) {
        heroCards[ci].setAttribute('style', savedCardStyles[ci] || '');
      }

      var jsPDF = window.jspdf.jsPDF;
      var pdf = new jsPDF('p', 'mm', 'a4');
      var pdfWidth = pdf.internal.pageSize.getWidth();
      var pdfHeight = pdf.internal.pageSize.getHeight();
      var imgWidth = pdfWidth;
      var imgHeight = canvas.height * imgWidth / canvas.width;
      var heightLeft = imgHeight;
      var position = 0;
      var imgData = canvas.toDataURL('image/jpeg', 0.95);

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save('アニマルオーラ診断32_レポート.pdf');
      btn.textContent = originalText;
      btn.disabled = false;
    }).catch(function() {
      // エラー時もダークモードに戻す
      for (var key in savedVars) {
        if (savedVars[key]) {
          root.style.setProperty(key, savedVars[key]);
        } else {
          root.style.removeProperty(key);
        }
      }
      for (var ci = 0; ci < heroCards.length; ci++) {
        heroCards[ci].setAttribute('style', savedCardStyles[ci] || '');
      }
      btn.textContent = originalText;
      btn.disabled = false;
      window.print();
    });
  },

  // ==========================================================
  // AIエージェント最適化コンテキスト
  // ==========================================================
  generateAIContext() {
    if (!this.results) return '';

    var s = this.results.summary;
    var bf = this.results.bigfive;
    var ri = this.results.riasec;
    var st = this.results.strengths;
    var at = this.results.attachment;
    var sens = this.results.sensitivity;
    var ego = this.results.egogram;
    var manual = this.results.manual;

    var md = '';
    md += '# パーソナリティ・コンテキスト\n\n';
    md += '> このデータは「アニマルオーラ診断32」の結果に基づく、ユーザーのパーソナリティプロファイルです。\n';
    md += '> AIエージェントがこのユーザーに最適化した対応を行うための参考情報として使用してください。\n\n';

    // タイプ概要
    md += '## パーソナリティタイプ\n\n';
    md += '- **タイプ名**: ' + s.typeName + '\n';
    md += '- **キーワード**: ' + s.keywords.join('、') + '\n';
    md += '- **概要**: ' + s.description + '\n\n';

    // Big Five スコア
    md += '## 性格特性（Big Five）\n\n';
    var bfKeys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'stability'];
    for (var i = 0; i < bfKeys.length; i++) {
      var key = bfKeys[i];
      var score = bf.scores[key];
      var level = score >= 70 ? '高い' : (score >= 40 ? '中程度' : '低い');
      md += '- ' + bf.labels[key] + ': ' + score + '/100（' + level + '）\n';
    }
    md += '\n';

    // RIASEC
    md += '## 職業適性（RIASEC）\n\n';
    md += '- ホランド・コード: ' + ri.hollandCode + '\n';
    for (var j = 0; j < ri.top3.length; j++) {
      md += '- ' + ri.labels[ri.top3[j].type] + ': ' + ri.top3[j].score + '/100\n';
    }
    md += '\n';

    // 強み
    md += '## 強み（VIA-IS 上位3つ）\n\n';
    for (var k = 0; k < st.top3.length; k++) {
      md += (k + 1) + '. ' + st.labels[st.top3[k].virtue] + '（' + st.top3[k].score + '/100）\n';
    }
    md += '\n';

    // 愛着・エゴグラム
    md += '## 対人関係パターン\n\n';
    md += '- 愛着スタイル: ' + at.labels[at.dominant] + '\n';
    md += '- エゴグラムパターン: ' + ego.pattern.name + '\n';
    md += '- エゴグラム: CP=' + ego.scores.cp + ' NP=' + ego.scores.np + ' A=' + ego.scores.a + ' FC=' + ego.scores.fc + ' AC=' + ego.scores.ac + '\n\n';

    // 感受性
    md += '## 感受性\n\n';
    md += '- レベル: ' + sens.level + '（総合 ' + sens.overall + '/100）\n\n';

    // コミュニケーション傾向
    md += '## コミュニケーション傾向\n\n';
    for (var c = 0; c < manual.communication.length; c++) {
      md += '- ' + manual.communication[c] + '\n';
    }
    md += '\n';

    // 行動パターン
    md += '## 行動パターン\n\n';
    for (var b = 0; b < manual.behaviors.length; b++) {
      md += '- ' + manual.behaviors[b] + '\n';
    }
    md += '\n';

    // モチベーション
    md += '## モチベーションの源泉\n\n';
    for (var m = 0; m < manual.motivations.length; m++) {
      md += '- ' + manual.motivations[m] + '\n';
    }
    md += '\n';

    // 学習スタイル
    md += '## 学習スタイル\n\n';
    for (var ls = 0; ls < manual.learningStyle.length; ls++) {
      md += '- ' + manual.learningStyle[ls] + '\n';
    }
    md += '\n';

    // 配慮ポイント
    md += '## 配慮すべきポイント\n\n';
    for (var w = 0; w < manual.warnings.length; w++) {
      md += '- ' + manual.warnings[w] + '\n';
    }
    md += '\n';

    // AI推奨対応方針
    md += '## AIエージェントへの推奨対応方針\n\n';

    if (bf.scores.extraversion <= 35) {
      md += '- 説明は簡潔にまとめ、必要に応じて深掘りする形式が好ましい\n';
    } else if (bf.scores.extraversion >= 65) {
      md += '- 対話的なやり取りを好むため、質問を投げかけながら進めると効果的\n';
    }

    if (bf.scores.openness >= 65) {
      md += '- 新しいアイデアや別の視点の提案を積極的に行うと喜ばれる\n';
    } else if (bf.scores.openness <= 35) {
      md += '- 実績のある手法や具体的な手順を示すと安心感を得られる\n';
    }

    if (bf.scores.conscientiousness >= 65) {
      md += '- 構造化された情報（ステップバイステップ、チェックリスト）が効果的\n';
    } else if (bf.scores.conscientiousness <= 35) {
      md += '- 堅苦しい形式より柔軟で自由度のある提案が好まれる\n';
    }

    if (bf.scores.agreeableness >= 65) {
      md += '- フィードバックを伝える際は、まず共感を示してから本題に入ると受け入れやすい\n';
    }

    if (sens.overall >= 60) {
      md += '- 情報量が多い場合は段階的に提示し、一度に大量の情報を浴びせないよう配慮する\n';
    }

    md += '- このユーザーのモチベーションの源泉を理解し、提案や励ましに活用する\n';

    return md;
  },

  showAIContext() {
    var text = this.generateAIContext();
    if (!text) return;
    document.getElementById('aiContextPreview').textContent = text;
    document.getElementById('aiContextModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  },

  closeAIContextModal() {
    document.getElementById('aiContextModal').style.display = 'none';
    document.body.style.overflow = '';
  },

  copyAIContext() {
    var text = document.getElementById('aiContextPreview').textContent;
    var btn = document.getElementById('btnCopyContext');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        var original = btn.textContent;
        btn.textContent = '✅ コピーしました！';
        setTimeout(function() { btn.textContent = original; }, 2000);
      });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      var original = btn.textContent;
      btn.textContent = '✅ コピーしました！';
      setTimeout(function() { btn.textContent = original; }, 2000);
    }
  },

  // ==========================================================
  // ステッカーダウンロード
  // ==========================================================
  downloadSticker() {
    if (!this.results) return;
    var s = this.results.summary;
    var btn = document.getElementById('btnSticker');
    var originalText = btn.textContent;
    btn.textContent = '⏳ 生成中...';
    btn.disabled = true;

    // ステッカーカードにデータを反映
    var card = document.getElementById('stickerCard');
    card.style.setProperty('--sticker-color', s.color);
    document.getElementById('stickerEmoji').textContent = s.emoji;

    var typeEl = document.getElementById('stickerType');
    typeEl.textContent = s.typeName;
    typeEl.style.color = s.color;

    var auraEl = document.getElementById('stickerAura');
    auraEl.textContent = s.aura + 'のオーラ';
    auraEl.style.borderColor = s.color + '66';

    var kwHtml = '';
    var kws = s.keywords.slice(0, 4);
    for (var i = 0; i < kws.length; i++) {
      kwHtml += '<span style="color:' + s.color + ';border-color:' + s.color + '40">' + kws[i] + '</span>';
    }
    document.getElementById('stickerKeywords').innerHTML = kwHtml;
    document.getElementById('stickerDesc').textContent = s.description || s.summary;

    // 背景グローをテーマカラーで設定
    var bgEl = card.querySelector('.sticker-bg');
    bgEl.style.background =
      'radial-gradient(ellipse at 30% 20%, ' + s.color + '40 0%, transparent 60%), ' +
      'radial-gradient(ellipse at 70% 80%, ' + s.color + '26 0%, transparent 50%), ' +
      'linear-gradient(160deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)';

    // ステッカーをレンダリング位置に一時表示
    var container = document.getElementById('stickerContainer');
    container.style.left = '0';
    container.style.opacity = '1';

    // html2canvas でキャプチャ
    setTimeout(function() {
      html2canvas(card, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        logging: false
      }).then(function(canvas) {
        // 非表示に戻す
        container.style.left = '-9999px';

        // ダウンロード
        var link = document.createElement('a');
        link.download = 'animal-aura-sticker-' + s.typeCode + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();

        btn.textContent = '✅ ダウンロード完了！';
        setTimeout(function() {
          btn.textContent = originalText;
          btn.disabled = false;
        }, 2000);
      }).catch(function() {
        container.style.left = '-9999px';
        btn.textContent = originalText;
        btn.disabled = false;
      });
    }, 100);
  },

  // ==========================================================
  // リスタート
  // ==========================================================
  restart() {
    this.currentSection = 0;
    this.answers = {};
    this.results = null;

    document.getElementById('results').classList.remove('active');
    document.getElementById('quiz').classList.remove('active');
    document.getElementById('landing').style.display = '';

    window.scrollTo(0, 0);
  }
};

// DOM準備完了後に初期化
document.addEventListener('DOMContentLoaded', function() {
  App.init();
});
