/**
 * 強みドメイン診断 - アキネーター方式 UI
 *
 * 1問ずつ表示し、アダプティブに次の質問を選択。
 * 確信度メーター、ドメイン確率バー、アニメーション遷移を実装。
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

    // フェードアウト
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

      // ボタンイベント
      var buttons = area.querySelectorAll('.answer-btn');
      for (var j = 0; j < buttons.length; j++) {
        buttons[j].addEventListener('click', function() {
          if (self.isTransitioning) return;
          self.handleAnswer(parseInt(this.dataset.value));
        });
      }

      area.classList.remove('fade-out');
      area.classList.add('fade-in');

      setTimeout(function() {
        area.classList.remove('fade-in');
      }, 400);
    }, 300);
  },

  // ==========================================================
  // 回答処理
  // ==========================================================
  handleAnswer: function(value) {
    var self = this;
    this.isTransitioning = true;

    // ボタンのフィードバック
    var buttons = document.querySelectorAll('.answer-btn');
    for (var i = 0; i < buttons.length; i++) {
      if (parseInt(buttons[i].dataset.value) === value) {
        buttons[i].classList.add('selected');
      } else {
        buttons[i].classList.add('dimmed');
      }
    }

    // スコア更新
    StrengthEngine.processAnswer(this.session, value);

    // "思考中" エフェクト
    this.showThinking(function() {
      self.updateDomainBars();
      self.isTransitioning = false;
      self.nextQuestion();
    });
  },

  // ==========================================================
  // 思考中アニメーション
  // ==========================================================
  showThinking: function(callback) {
    var orb = document.getElementById('thinkingOrb');
    orb.classList.add('thinking');

    setTimeout(function() {
      orb.classList.remove('thinking');
      callback();
    }, 600);
  },

  // ==========================================================
  // プログレス更新
  // ==========================================================
  updateProgress: function() {
    var progress = (this.session.questionCount / StrengthEngine.MAX_QUESTIONS) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressCount').textContent =
      this.session.questionCount + ' / ' + StrengthEngine.MAX_QUESTIONS;
  },

  // ==========================================================
  // 確信度メーター更新
  // ==========================================================
  updateConfidence: function() {
    var confidence = StrengthEngine.getConfidence(this.session);
    var fill = document.getElementById('confidenceFill');
    var label = document.getElementById('confidenceLabel');

    fill.style.width = confidence + '%';
    label.textContent = confidence + '%';

    // 色変化
    if (confidence >= 70) {
      fill.style.background = 'linear-gradient(90deg, #22d3ee, #10b981)';
    } else if (confidence >= 40) {
      fill.style.background = 'linear-gradient(90deg, #f59e0b, #22d3ee)';
    } else {
      fill.style.background = 'linear-gradient(90deg, #6366f1, #f59e0b)';
    }
  },

  // ==========================================================
  // ドメイン確率バー更新
  // ==========================================================
  updateDomainBars: function() {
    var container = document.getElementById('domainBars');
    var normalized = StrengthEngine.getNormalizedScores(this.session.scores);
    var sorted = StrengthEngine.getSortedDomains(this.session.scores);

    var html = '';
    for (var i = 0; i < sorted.length; i++) {
      var domainId = sorted[i].id;
      var score = normalized[domainId];
      var domain = null;
      for (var j = 0; j < StrengthEngine.DOMAINS.length; j++) {
        if (StrengthEngine.DOMAINS[j].id === domainId) {
          domain = StrengthEngine.DOMAINS[j];
          break;
        }
      }

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
    this.renderRadarChart();
    this.renderTop3();
    this.renderAllDomains();
    this.renderSynergy();

    window.scrollTo(0, 0);
  },

  renderResultHero: function() {
    var r = this.results;
    document.getElementById('resultTypeName').textContent = r.typeName;
    document.getElementById('resultSummary').textContent = r.summary;

    // キーワードタグ
    var kwHtml = '';
    for (var i = 0; i < r.top3.length; i++) {
      kwHtml += '<span class="keyword">' + r.top3[i].icon + ' ' + r.top3[i].name + '</span>';
    }
    document.getElementById('resultKeywords').innerHTML = kwHtml;
  },

  // ==========================================================
  // レーダーチャート
  // ==========================================================
  renderRadarChart: function() {
    var domains = this.results.domains;
    var size = 360;
    var cx = size / 2;
    var cy = size / 2;
    var maxR = 120;
    var n = domains.length;

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
      var val = domains[di].score / 100;
      var dp = polarToXY((360 / n) * di, maxR * val);
      dataPoints.push({ x: dp.x, y: dp.y });
    }
    var polyPts = dataPoints.map(function(p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ');

    // ドット
    var dots = '';
    for (var dti = 0; dti < dataPoints.length; dti++) {
      dots += '<circle cx="' + dataPoints[dti].x.toFixed(1) + '" cy="' + dataPoints[dti].y.toFixed(1) + '" r="5" fill="' + domains[dti].color + '" stroke="#0f0f1a" stroke-width="2"/>';
    }

    // ラベル
    var labelTexts = '';
    for (var li = 0; li < n; li++) {
      var lp = polarToXY((360 / n) * li, maxR + 32);
      labelTexts += '<text x="' + lp.x.toFixed(1) + '" y="' + (lp.y - 6).toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" font-size="11" font-weight="600" fill="#e8e8f0">' + domains[li].icon + ' ' + domains[li].name + '</text>';
      labelTexts += '<text x="' + lp.x.toFixed(1) + '" y="' + (lp.y + 10).toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="' + domains[li].color + '" font-weight="700">' + domains[li].score + '</text>';
    }

    var svg = '<svg viewBox="0 0 ' + size + ' ' + size + '" class="radar-chart" width="' + size + '" height="' + size + '">' +
      gridLines + axisLines +
      '<polygon points="' + polyPts + '" fill="rgba(99,102,241,0.12)" stroke="#6366f1" stroke-width="2.5"/>' +
      dots + labelTexts +
      '</svg>';

    document.getElementById('radarChart').innerHTML = svg;
  },

  // ==========================================================
  // TOP3 強みカード
  // ==========================================================
  renderTop3: function() {
    var top3 = this.results.top3;
    var medals = ['1st', '2nd', '3rd'];
    var medalColors = ['#f59e0b', '#94a3b8', '#cd7c32'];
    var html = '';

    for (var i = 0; i < top3.length; i++) {
      var d = top3[i];
      html += '<div class="top3-card" style="border-color:' + d.color + '">';
      html += '<div class="top3-rank" style="background:' + d.color + '">' + medals[i] + '</div>';
      html += '<div class="top3-icon">' + d.icon + '</div>';
      html += '<div class="top3-name" style="color:' + d.color + '">' + d.name + '</div>';
      html += '<div class="top3-score">' + d.score + ' / 100</div>';
      html += '<div class="top3-short">' + d.short + '</div>';
      html += '<div class="top3-desc">' + d.description + '</div>';

      // 強みリスト
      html += '<div class="top3-strengths"><strong>この強みの表れ方</strong><ul>';
      for (var j = 0; j < d.strengths.length; j++) {
        html += '<li>' + d.strengths[j] + '</li>';
      }
      html += '</ul></div>';

      // 活かし方
      html += '<div class="top3-tips"><strong>さらに活かすために</strong><ul>';
      for (var k = 0; k < d.tips.length; k++) {
        html += '<li>' + d.tips[k] + '</li>';
      }
      html += '</ul></div>';

      html += '</div>';
    }

    document.getElementById('top3Container').innerHTML = html;
  },

  // ==========================================================
  // 全ドメインスコア
  // ==========================================================
  renderAllDomains: function() {
    var domains = this.results.domains;
    var html = '<div class="all-domains-chart">';

    for (var i = 0; i < domains.length; i++) {
      var d = domains[i];
      var isTop = i < 3;
      html += '<div class="all-domain-row' + (isTop ? ' top-row' : '') + '">';
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
    document.getElementById('allDomainsContainer').innerHTML = html;
  },

  // ==========================================================
  // シナジー分析
  // ==========================================================
  renderSynergy: function() {
    var synergy = this.results.synergy;
    var top3 = this.results.top3;

    var html = '<div class="synergy-visual">';
    for (var i = 0; i < top3.length; i++) {
      if (i > 0) html += '<span class="synergy-plus">+</span>';
      html += '<span class="synergy-domain" style="border-color:' + top3[i].color + ';color:' + top3[i].color + '">' + top3[i].icon + ' ' + top3[i].name + '</span>';
    }
    html += '</div>';
    html += '<p class="synergy-text">' + synergy + '</p>';

    document.getElementById('synergyContainer').innerHTML = html;
  },

  // ==========================================================
  // シェア
  // ==========================================================
  shareResults: function() {
    if (!this.results) return;
    var r = this.results;

    var text = '【強みドメイン診断 結果】\n\n';
    text += 'タイプ: ' + r.typeName + '\n';
    text += r.summary + '\n\n';
    text += '--- 強みTOP3 ---\n';
    for (var i = 0; i < r.top3.length; i++) {
      text += (i + 1) + '. ' + r.top3[i].icon + ' ' + r.top3[i].name + ' (' + r.top3[i].score + ')\n';
    }
    text += '\n--- 全ドメイン ---\n';
    for (var j = 0; j < r.domains.length; j++) {
      text += r.domains[j].icon + ' ' + r.domains[j].name + ': ' + r.domains[j].score + '\n';
    }
    text += '\n' + r.synergy;

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
