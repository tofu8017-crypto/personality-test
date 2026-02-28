/**
 * 得意ドメイン診断 - アキネーター方式 UI
 *
 * 15ドメイン×6大カテゴリの知識・専門領域をアダプティブに特定。
 * 称号＋内訳＋ハンディキャップを表示。
 */

var StrengthApp = {
  session: null,
  results: null,
  isTransitioning: false,

  // ==========================================================
  // 初期化
  // ==========================================================
  init: function() {
    var self = this;
    document.getElementById('btnStart').addEventListener('click', function() { self.start(); });
    document.getElementById('btnRestart').addEventListener('click', function() { self.restart(); });
    document.getElementById('btnShareResult').addEventListener('click', function() { self.shareResults(); });
  },

  // ==========================================================
  // 開始
  // ==========================================================
  start: function() {
    this.session = StrengthEngine.createSession();

    document.getElementById('landing').style.display = 'none';
    document.getElementById('quiz').classList.add('active');
    document.getElementById('results').classList.remove('active');

    this.updateDomainBars();
    this.nextQuestion();
  },

  // ==========================================================
  // 次の質問を表示
  // ==========================================================
  nextQuestion: function() {
    var question = StrengthEngine.selectNextQuestion(this.session);

    if (!question || this.session.finished) {
      this.showResults();
      return;
    }

    this.renderQuestion(question);
    this.updateProgress();
    this.updateConfidence();
  },

  renderQuestion: function(question) {
    var area = document.getElementById('questionArea');
    var self = this;

    area.classList.add('fade-out');

    setTimeout(function() {
      var num = self.session.questionCount + 1;
      var html = '';
      html += '<div class="question-counter">Q' + num + ' / ' + StrengthEngine.MAX_QUESTIONS + '</div>';
      html += '<div class="question-text">' + question.text + '</div>';
      html += '<div class="answer-buttons">';

      var labels = StrengthEngine.ANSWER_LABELS;
      var icons = ['&#9711;', '&#9651;', '&#9644;', '&#9661;', '&#10005;'];
      var classes = ['ans-yes', 'ans-prob-yes', 'ans-neutral', 'ans-prob-no', 'ans-no'];

      for (var i = 0; i < labels.length; i++) {
        html += '<button class="answer-btn ' + classes[i] + '" data-value="' + (i + 1) + '">';
        html += '<span class="ans-icon">' + icons[i] + '</span>';
        html += '<span class="ans-label">' + labels[i] + '</span>';
        html += '</button>';
      }

      html += '</div>';
      area.innerHTML = html;

      var buttons = area.querySelectorAll('.answer-btn');
      for (var j = 0; j < buttons.length; j++) {
        buttons[j].addEventListener('click', function() {
          if (self.isTransitioning) return;
          self.handleAnswer(parseInt(this.dataset.value));
        });
      }

      area.classList.remove('fade-out');
      area.classList.add('fade-in');
      setTimeout(function() { area.classList.remove('fade-in'); }, 400);
    }, 300);
  },

  // ==========================================================
  // 回答処理
  // ==========================================================
  handleAnswer: function(value) {
    var self = this;
    this.isTransitioning = true;

    var buttons = document.querySelectorAll('.answer-btn');
    for (var i = 0; i < buttons.length; i++) {
      if (parseInt(buttons[i].dataset.value) === value) {
        buttons[i].classList.add('selected');
      } else {
        buttons[i].classList.add('dimmed');
      }
    }

    StrengthEngine.processAnswer(this.session, value);

    this.showThinking(function() {
      self.updateDomainBars();
      self.isTransitioning = false;
      self.nextQuestion();
    });
  },

  showThinking: function(callback) {
    var orb = document.getElementById('thinkingOrb');
    orb.classList.add('thinking');
    setTimeout(function() {
      orb.classList.remove('thinking');
      callback();
    }, 600);
  },

  // ==========================================================
  // プログレス・確信度
  // ==========================================================
  updateProgress: function() {
    var progress = (this.session.questionCount / StrengthEngine.MAX_QUESTIONS) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressCount').textContent =
      this.session.questionCount + ' / ' + StrengthEngine.MAX_QUESTIONS;
  },

  updateConfidence: function() {
    var confidence = StrengthEngine.getConfidence(this.session);
    var fill = document.getElementById('confidenceFill');
    var label = document.getElementById('confidenceLabel');

    fill.style.width = confidence + '%';
    label.textContent = confidence + '%';

    if (confidence >= 70) {
      fill.style.background = 'linear-gradient(90deg, #22d3ee, #10b981)';
    } else if (confidence >= 40) {
      fill.style.background = 'linear-gradient(90deg, #f59e0b, #22d3ee)';
    } else {
      fill.style.background = 'linear-gradient(90deg, #6366f1, #f59e0b)';
    }
  },

  // ==========================================================
  // ドメインサイドバー（15ドメイン）
  // ==========================================================
  updateDomainBars: function() {
    var container = document.getElementById('domainBars');
    var normalized = StrengthEngine.getNormalizedScores(this.session.scores);
    var sorted = StrengthEngine.getSortedDomains(this.session.scores);

    var html = '';
    for (var i = 0; i < sorted.length; i++) {
      var domainId = sorted[i].id;
      var score = normalized[domainId];
      var domain = StrengthEngine.getDomainById(domainId);

      var isTop = i < 3;
      var barClass = isTop ? 'domain-bar-item top' : 'domain-bar-item';

      html += '<div class="' + barClass + '">';
      html += '<span class="domain-bar-icon">' + domain.icon + '</span>';
      html += '<span class="domain-bar-name">' + domain.name + '</span>';
      html += '<div class="domain-bar-track">';
      html += '<div class="domain-bar-fill" style="width:' + score + '%;background:' + domain.color + '"></div>';
      html += '</div>';
      html += '<span class="domain-bar-score">' + score + '</span>';
      html += '</div>';
    }

    container.innerHTML = html;
  },

  // ==========================================================
  // 結果画面
  // ==========================================================
  showResults: function() {
    this.results = StrengthEngine.generateResults(this.session);

    document.getElementById('quiz').classList.remove('active');
    document.getElementById('results').classList.add('active');

    this.renderResultHero();
    this.renderCategoryRadar();
    this.renderTop3();
    this.renderHandicap();
    this.renderAllDomains();
    this.renderCombination();

    window.scrollTo(0, 0);
  },

  // ==========================================================
  // 結果ヒーロー（称号＋内訳）
  // ==========================================================
  renderResultHero: function() {
    var r = this.results;
    document.getElementById('resultTypeName').textContent = r.typeName;
    document.getElementById('resultSummary').textContent = r.summary;

    // 内訳タグ（TOP3ドメイン＋カテゴリ表示）
    var bkHtml = '';
    for (var i = 0; i < r.top3.length; i++) {
      var d = r.top3[i];
      if (i > 0) bkHtml += '<span class="breakdown-separator">×</span>';
      bkHtml += '<span class="breakdown-tag" style="border-color:' + d.color + ';color:' + d.color + '">';
      bkHtml += d.icon + ' ' + d.name;
      bkHtml += '</span>';
    }
    document.getElementById('resultBreakdown').innerHTML = bkHtml;

    // カテゴリバッジ
    var catHtml = '';
    var shownCats = [];
    for (var j = 0; j < r.top3.length; j++) {
      var cat = r.top3[j].category;
      if (shownCats.indexOf(cat) === -1) {
        shownCats.push(cat);
        catHtml += '<span class="category-badge" style="border-color:' + r.top3[j].categoryColor + ';color:' + r.top3[j].categoryColor + '">';
        catHtml += cat;
        catHtml += '</span>';
      }
    }
    document.getElementById('resultCategories').innerHTML = catHtml;
  },

  // ==========================================================
  // カテゴリ別レーダーチャート（6大カテゴリ）
  // ==========================================================
  renderCategoryRadar: function() {
    var cats = this.results.categoryScores;
    var size = 360;
    var cx = size / 2;
    var cy = size / 2;
    var maxR = 120;
    var n = cats.length;

    function polarToXY(angleDeg, radius) {
      var rad = (angleDeg - 90) * Math.PI / 180;
      return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
    }

    // グリッド
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
      var val = cats[di].score / 100;
      var dp = polarToXY((360 / n) * di, maxR * val);
      dataPoints.push({ x: dp.x, y: dp.y });
    }
    var polyPts = dataPoints.map(function(p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ');

    // ドット
    var dots = '';
    for (var dti = 0; dti < dataPoints.length; dti++) {
      dots += '<circle cx="' + dataPoints[dti].x.toFixed(1) + '" cy="' + dataPoints[dti].y.toFixed(1) + '" r="5" fill="' + cats[dti].color + '" stroke="#0f0f1a" stroke-width="2"/>';
    }

    // ラベル
    var labelTexts = '';
    for (var li = 0; li < n; li++) {
      var lp = polarToXY((360 / n) * li, maxR + 36);
      labelTexts += '<text x="' + lp.x.toFixed(1) + '" y="' + (lp.y - 6).toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" font-size="11" font-weight="600" fill="#e8e8f0">' + cats[li].name + '</text>';
      labelTexts += '<text x="' + lp.x.toFixed(1) + '" y="' + (lp.y + 10).toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="' + cats[li].color + '" font-weight="700">' + cats[li].score + '</text>';
    }

    var svg = '<svg viewBox="0 0 ' + size + ' ' + size + '" class="radar-chart" width="' + size + '" height="' + size + '">' +
      gridLines + axisLines +
      '<polygon points="' + polyPts + '" fill="rgba(99,102,241,0.12)" stroke="#6366f1" stroke-width="2.5"/>' +
      dots + labelTexts +
      '</svg>';

    document.getElementById('radarChart').innerHTML = svg;
  },

  // ==========================================================
  // TOP3 得意ドメインカード
  // ==========================================================
  renderTop3: function() {
    var top3 = this.results.top3;
    var medals = ['1st', '2nd', '3rd'];
    var html = '';

    for (var i = 0; i < top3.length; i++) {
      var d = top3[i];
      html += '<div class="top3-card" style="border-color:' + d.color + '">';
      html += '<div class="top3-rank" style="background:' + d.color + '">' + medals[i] + '</div>';
      html += '<div class="top3-header">';
      html += '<div class="top3-icon">' + d.icon + '</div>';
      html += '<div>';
      html += '<div class="top3-category-badge" style="color:' + d.categoryColor + '">' + d.category + '</div>';
      html += '<div class="top3-name" style="color:' + d.color + '">' + d.name + '</div>';
      html += '</div>';
      html += '<div class="top3-score">' + d.score + '</div>';
      html += '</div>';
      html += '<div class="top3-desc">' + d.description + '</div>';

      // キーワード
      html += '<div class="top3-keywords">';
      for (var j = 0; j < d.keywords.length; j++) {
        html += '<span class="domain-keyword" style="border-color:' + d.color + '">' + d.keywords[j] + '</span>';
      }
      html += '</div>';

      html += '</div>';
    }

    document.getElementById('top3Container').innerHTML = html;
  },

  // ==========================================================
  // ハンディキャップ（苦手ドメイン）
  // ==========================================================
  renderHandicap: function() {
    var handicap = this.results.handicap;
    var html = '';

    for (var i = 0; i < handicap.length; i++) {
      var d = handicap[i];
      html += '<div class="handicap-card">';
      html += '<div class="handicap-header">';
      html += '<span class="handicap-icon">' + d.icon + '</span>';
      html += '<span class="handicap-name">' + d.name + '</span>';
      html += '<span class="handicap-category">' + d.category + '</span>';
      html += '<span class="handicap-score">' + d.score + '</span>';
      html += '</div>';
      html += '<p class="handicap-growth">' + d.growth + '</p>';
      html += '</div>';
    }

    document.getElementById('handicapContainer').innerHTML = html;
  },

  // ==========================================================
  // 全ドメインスコア（カテゴリ別グルーピング）
  // ==========================================================
  renderAllDomains: function() {
    var domains = this.results.domains;
    var normalized = {};
    for (var i = 0; i < domains.length; i++) {
      normalized[domains[i].id] = domains[i];
    }

    var html = '';
    var categories = StrengthEngine.CATEGORIES;

    for (var ci = 0; ci < categories.length; ci++) {
      var cat = categories[ci];
      html += '<div class="cat-group">';
      html += '<div class="cat-group-header" style="color:' + cat.color + '">' + cat.name + '</div>';

      for (var di = 0; di < cat.domains.length; di++) {
        var domainId = cat.domains[di];
        var d = normalized[domainId];
        if (!d) continue;

        var isTop = d.rank <= 3;
        var isBottom = d.rank > (StrengthEngine.DOMAINS.length - 3);
        var rowClass = 'all-domain-row';
        if (isTop) rowClass += ' top-row';
        if (isBottom) rowClass += ' bottom-row';

        html += '<div class="' + rowClass + '">';
        html += '<span class="all-domain-rank">#' + d.rank + '</span>';
        html += '<span class="all-domain-icon">' + d.icon + '</span>';
        html += '<span class="all-domain-name">' + d.name + '</span>';
        html += '<div class="all-domain-track">';
        html += '<div class="all-domain-fill" style="width:' + d.score + '%;background:' + d.color + '"></div>';
        html += '</div>';
        html += '<span class="all-domain-score">' + d.score + '</span>';
        html += '</div>';
      }

      html += '</div>';
    }

    document.getElementById('allDomainsContainer').innerHTML = html;
  },

  // ==========================================================
  // 組み合わせ分析
  // ==========================================================
  renderCombination: function() {
    var combination = this.results.combination;
    var top3 = this.results.top3;

    var html = '<div class="synergy-visual">';
    for (var i = 0; i < top3.length; i++) {
      if (i > 0) html += '<span class="synergy-plus">×</span>';
      html += '<span class="synergy-domain" style="border-color:' + top3[i].color + ';color:' + top3[i].color + '">' + top3[i].icon + ' ' + top3[i].name + '</span>';
    }
    html += '</div>';
    html += '<p class="synergy-text">' + combination + '</p>';

    document.getElementById('combinationContainer').innerHTML = html;
  },

  // ==========================================================
  // シェア
  // ==========================================================
  shareResults: function() {
    if (!this.results) return;
    var r = this.results;

    var text = '【得意ドメイン診断 結果】\n\n';
    text += '称号: ' + r.typeName + '\n';
    text += '得意: ' + r.top3.map(function(d) { return d.icon + ' ' + d.name; }).join(' × ') + '\n\n';
    text += r.summary + '\n\n';

    text += '--- 得意ドメイン TOP3 ---\n';
    for (var i = 0; i < r.top3.length; i++) {
      text += (i + 1) + '. ' + r.top3[i].icon + ' ' + r.top3[i].name + '（' + r.top3[i].category + '）' + r.top3[i].score + '\n';
    }

    text += '\n--- ハンディキャップ ---\n';
    for (var h = 0; h < r.handicap.length; h++) {
      text += '▽ ' + r.handicap[h].icon + ' ' + r.handicap[h].name + '（' + r.handicap[h].category + '）' + r.handicap[h].score + '\n';
    }

    text += '\n--- カテゴリスコア ---\n';
    for (var c = 0; c < r.categoryScores.length; c++) {
      text += r.categoryScores[c].name + ': ' + r.categoryScores[c].score + '\n';
    }

    text += '\n' + r.combination;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      var btn = document.getElementById('btnShareResult');
      navigator.clipboard.writeText(text).then(function() {
        var original = btn.textContent;
        btn.textContent = 'コピーしました！';
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
      var btn2 = document.getElementById('btnShareResult');
      var original2 = btn2.textContent;
      btn2.textContent = 'コピーしました！';
      setTimeout(function() { btn2.textContent = original2; }, 2000);
    }
  },

  // ==========================================================
  // リスタート
  // ==========================================================
  restart: function() {
    this.session = null;
    this.results = null;
    this.isTransitioning = false;

    document.getElementById('results').classList.remove('active');
    document.getElementById('quiz').classList.remove('active');
    document.getElementById('landing').style.display = '';

    window.scrollTo(0, 0);
  }
};

document.addEventListener('DOMContentLoaded', function() {
  StrengthApp.init();
});
