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
    document.getElementById('btnRestart').addEventListener('click', () => this.restart());

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
    document.getElementById('sectionIcon').textContent = section.icon;
    document.getElementById('sectionTitle').textContent = section.title;
    document.getElementById('sectionSubtitle').textContent = section.subtitle;
    document.getElementById('sectionLabel').textContent = section.icon + ' ' + section.title;

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

    window.scrollTo(0, 0);
  },

  renderHero() {
    var summary = this.results.summary;
    document.getElementById('typeName').textContent = summary.typeName;
    document.getElementById('summaryText').textContent = summary.summary;

    var kwHtml = '';
    for (var i = 0; i < summary.keywords.length; i++) {
      kwHtml += '<span class="keyword">' + summary.keywords[i] + '</span>';
    }
    document.getElementById('keywords').innerHTML = kwHtml;
  },

  // ==========================================================
  // タブシステム
  // ==========================================================
  renderTabs() {
    var tabs = [
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
        '<div class="chart-container">' + radarSvg + '</div>' +
      '</div>' +
      '<div class="result-card">' +
        '<h3><span class="icon">📝</span>各特性の詳細</h3>' +
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

    panel.innerHTML =
      '<div class="result-card">' +
        '<h3><span class="icon">💼</span>RIASEC 職業適性</h3>' +
        barHtml + hollandHtml + top3Html +
      '</div>' +
      careerHtml;
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
        topHtml +
      '</div>' +
      '<div class="result-card">' +
        '<h3><span class="icon">📊</span>6つの美徳スコア</h3>' +
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
        patternHtml + barHtml +
      '</div>' +
      '<div class="result-card">' +
        '<h3><span class="icon">📝</span>5つの自我状態の詳細</h3>' +
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
        sensHtml + sensBarHtml + tipsHtml +
      '</div>' +
      stressHtml + copingHtml + resHtml;
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

    var text = '【総合パーソナリティ診断 結果】\n\n';
    text += '🏷️ ' + s.typeName + '\n';
    text += '📝 ' + s.summary + '\n\n';
    text += '🧠 Big Five:\n';
    var bfKeys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'stability'];
    for (var i = 0; i < bfKeys.length; i++) {
      text += '  ' + bf.labels[bfKeys[i]] + ': ' + bf.scores[bfKeys[i]] + '\n';
    }
    text += '\n💼 ホランド・コード: ' + ri.hollandCode + '\n';
    text += '⭐ 強みトップ3: ' + st.top3.map(function(v) { return st.labels[v.virtue]; }).join('、') + '\n';
    text += '🤝 愛着スタイル: ' + at.labels[at.dominant] + '\n';
    text += '🌿 感受性: ' + sens.level + '（' + sens.overall + '）\n';

    var ego = this.results.egogram;
    text += '👨‍👩‍👦 エゴグラム: ' + ego.pattern.name + '\n';
    text += '  CP:' + ego.scores.cp + ' NP:' + ego.scores.np + ' A:' + ego.scores.a + ' FC:' + ego.scores.fc + ' AC:' + ego.scores.ac + '\n';

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
