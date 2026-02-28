/**
 * 強みドメイン診断 - アキネーター方式アダプティブエンジン
 *
 * ベイズ的スコアリングで回答ごとにドメイン確率を更新し、
 * 情報利得が最大の質問を動的に選択する。
 * 全20問で8つの強みドメインからTOP3を割り出す。
 */

const StrengthEngine = {

  // ==============================================================
  // 8つの強みドメイン定義
  // ==============================================================
  DOMAINS: [
    {
      id: 'analytical',
      name: '分析思考',
      icon: '🔬',
      color: '#6366f1',
      short: 'データや論理で本質を見抜く力',
      description: 'あなたは物事を構造的に捉え、因果関係やパターンを見出すのが得意です。複雑な問題も要素に分解し、論理的に最適解を導き出します。曖昧さよりも「なぜ？」を追求する姿勢が、周囲の意思決定の質を高めます。',
      strengths: ['根拠に基づく意思決定', 'データから洞察を引き出す', '複雑な問題の構造化', 'リスクの事前予測'],
      tips: ['直感派の人の意見も取り入れると、分析に深みが出ます', '「分析麻痺」に注意。80%の確信で動く勇気も大切です', 'データだけでなく、現場の声も重要な情報源として扱いましょう']
    },
    {
      id: 'achievement',
      name: '達成欲',
      icon: '🎯',
      color: '#ef4444',
      short: '目標を掲げ、やり遂げる実行力',
      description: 'あなたは「成し遂げる」ことに強い情熱を持っています。目標を設定し、計画を立て、着実に成果を積み上げていくプロセスそのものにエネルギーを感じます。生産性が高く、常に次のチャレンジを求める推進力の持ち主です。',
      strengths: ['高い目標設定と実行力', '継続的な生産性', '成果への強いコミットメント', 'プロジェクトの完遂力'],
      tips: ['達成だけでなく「プロセスの楽しさ」にも目を向けてみましょう', '燃え尽き防止のため、意識的な休息をスケジュールに組み込んで', '他者のペースを尊重することで、チーム全体の成果が上がります']
    },
    {
      id: 'empathy',
      name: '共感力',
      icon: '💗',
      color: '#ec4899',
      short: '他者の感情を理解し、寄り添う力',
      description: 'あなたは他者の感情を直感的に感じ取り、その人の立場に立って考えることができます。言葉にならない気持ちも汲み取れる繊細さがあり、周囲の人に安心感を与えます。人間関係の「接着剤」として、組織やチームに不可欠な存在です。',
      strengths: ['感情の機微を読み取る力', '信頼関係の構築', '相手に合わせたコミュニケーション', '心理的安全性の醸成'],
      tips: ['共感疲れに注意。自分の感情と他者の感情を区別する時間を持ちましょう', '共感するだけでなく、時には建設的なフィードバックも必要です', '自分自身への共感（セルフ・コンパッション）も忘れずに']
    },
    {
      id: 'ideation',
      name: '着想力',
      icon: '💡',
      color: '#f59e0b',
      short: '新しいアイデアを生み出す創造力',
      description: 'あなたは一見無関係に思える事象の間にも繋がりを見出し、斬新なアイデアを次々と生み出します。既存の枠にとらわれない発想力があり、「そんな考え方があったのか！」と周囲を驚かせることが多いでしょう。イノベーションの火種となる存在です。',
      strengths: ['独創的なアイデア創出', '異分野の知識を結合する力', '既成概念を打ち破る発想', 'ブレインストーミングの推進'],
      tips: ['アイデアを出すだけでなく、実行に移す「仕組み」も作りましょう', '全てのアイデアが当たるわけではない。失敗を学びに変える姿勢を', '着想を他者と共有し、磨き合うことで更に良いものが生まれます']
    },
    {
      id: 'command',
      name: '指導力',
      icon: '👑',
      color: '#f97316',
      short: 'ビジョンを示し、人を導くリーダーシップ',
      description: 'あなたは状況を俯瞰し、進むべき方向を示す力を持っています。曖昧な状況でも決断を下し、周囲を巻き込んで物事を前に進めることができます。責任を引き受けることを恐れず、チームに方向性と安心感を与えるリーダーです。',
      strengths: ['決断力と方向性の提示', '困難な状況での冷静な判断', 'チームの士気を高める力', '責任を引き受ける覚悟'],
      tips: ['「指示」だけでなく「傾聴」のバランスも意識しましょう', '権限を委譲し、メンバーの成長機会を作ることもリーダーの役割です', 'フォロワーシップの価値も理解すると、より優れたリーダーになれます']
    },
    {
      id: 'learner',
      name: '学習欲',
      icon: '📚',
      color: '#06b6d4',
      short: '知識を貪欲に吸収し続ける探究心',
      description: 'あなたは学ぶプロセスそのものに喜びを感じます。新しい分野、未知のスキル、深い専門知識——対象は何であれ、「知らないことを知る」瞬間に強い充実感を覚えます。この知的好奇心が、あなたを常に成長させ続ける原動力です。',
      strengths: ['継続的な自己成長', '幅広い知識の蓄積', '新技術・新手法への素早い適応', '学んだことを実践に活かす力'],
      tips: ['「学ぶ」ことと「使う」ことのバランスを取りましょう。インプット過多に注意', '学んだことを他者に教えると、自分の理解がさらに深まります', '深さと広さ、両方の学びを意識すると知識の相乗効果が生まれます']
    },
    {
      id: 'harmony',
      name: '調和性',
      icon: '🤝',
      color: '#10b981',
      short: '対立を解消し、チームをまとめる力',
      description: 'あなたは人と人との間にある共通点を見出し、合意形成に導く力があります。対立や摩擦を最小限に抑え、全員が納得できる落としどころを見つけるのが得意です。チームの一体感を高め、協力関係を築く上で欠かせない存在です。',
      strengths: ['合意形成と対立解消', '多様な意見の統合', 'チームの一体感の醸成', '安定した人間関係の構築'],
      tips: ['調和を重視するあまり、重要な意見を飲み込まないようにしましょう', '建設的な対立は成長に必要な場合もあります', '「全員が満足」を目指すより「全員が納得」を目指すと楽になります']
    },
    {
      id: 'adaptability',
      name: '適応性',
      icon: '🌊',
      color: '#8b5cf6',
      short: '変化に柔軟に対応し、即興で動ける力',
      description: 'あなたは予期しない変化や新しい状況にも柔軟に対応できます。計画通りにいかなくても動じることなく、その場の状況を読んで最善の行動を取れます。変化の激しい時代において、周囲に安心感と柔軟性をもたらす貴重な存在です。',
      strengths: ['変化への素早い対応', '即興的な問題解決', 'ストレス耐性の高さ', '多様な環境での活躍'],
      tips: ['柔軟さの中にも「ブレない軸」を持つと、さらに信頼されます', '長期計画を立てる練習もすると、適応力と計画力の両方が武器になります', '変化を楽しむ姿勢を周囲にも共有すると、チーム全体が強くなります']
    }
  ],

  // ==============================================================
  // 質問プール（45問 / 実際に出題されるのは20問）
  // 各質問は8ドメインへの重み(weight)を持つ
  // 回答は -1.0(いいえ) ～ +1.0(はい) にマッピング
  // weight * answer が各ドメインのスコアに加算される
  // ==============================================================
  QUESTIONS: [
    // --- 分析・論理系 ---
    { id: 1,  text: "複雑な問題に直面すると、まず要素に分解して考え始める",
      w: { analytical: 1.0, achievement: 0.2, ideation: 0.1, learner: 0.3 } },
    { id: 2,  text: "スプレッドシートやグラフでデータを整理するのが好きだ",
      w: { analytical: 0.9, achievement: 0.3, harmony: -0.1, adaptability: -0.2 } },
    { id: 3,  text: "「なぜ？」「本当に？」と根拠を確認せずにはいられない",
      w: { analytical: 0.8, learner: 0.5, command: -0.1, harmony: -0.2 } },
    { id: 4,  text: "感覚や直感よりも、データや事実に基づいて判断したい",
      w: { analytical: 0.9, empathy: -0.4, ideation: -0.3, adaptability: -0.2 } },
    { id: 5,  text: "議論では感情論より論理的な筋道を重視する",
      w: { analytical: 0.7, empathy: -0.5, command: 0.2, harmony: -0.3 } },

    // --- 達成・実行系 ---
    { id: 6,  text: "一日の終わりに「今日は何を成し遂げたか」を振り返る",
      w: { achievement: 1.0, analytical: 0.2, command: 0.1, adaptability: -0.2 } },
    { id: 7,  text: "やりかけの仕事があると落ち着かない",
      w: { achievement: 0.9, analytical: 0.1, harmony: -0.1, adaptability: -0.3 } },
    { id: 8,  text: "目標を数値で設定し、進捗を管理するのが自然だ",
      w: { achievement: 0.8, analytical: 0.5, command: 0.2, adaptability: -0.2 } },
    { id: 9,  text: "「まあいいか」で終わらせるのが苦手だ。とことんやりたい",
      w: { achievement: 0.9, learner: 0.2, harmony: -0.2, adaptability: -0.3 } },
    { id: 10, text: "忙しいほうが調子がよく、暇だとソワソワする",
      w: { achievement: 0.7, command: 0.3, empathy: -0.1, adaptability: 0.2 } },

    // --- 共感・寄り添い系 ---
    { id: 11, text: "相手の表情や声のトーンから気持ちを察するのが得意だ",
      w: { empathy: 1.0, harmony: 0.4, analytical: -0.2, command: -0.2 } },
    { id: 12, text: "映画や小説で登場人物に深く感情移入してしまう",
      w: { empathy: 0.8, ideation: 0.2, analytical: -0.3, achievement: -0.1 } },
    { id: 13, text: "誰かが辛そうにしていると、自分も胸が痛くなる",
      w: { empathy: 0.9, harmony: 0.3, command: -0.3, analytical: -0.2 } },
    { id: 14, text: "相手が本当に言いたいことは、言葉の裏にあると思う",
      w: { empathy: 0.7, analytical: 0.2, harmony: 0.3, achievement: -0.1 } },
    { id: 15, text: "人の相談を聞くとき、解決策より先にまず気持ちを受け止める",
      w: { empathy: 0.9, harmony: 0.3, analytical: -0.4, command: -0.3 } },

    // --- 着想・創造系 ---
    { id: 16, text: "一見関係なさそうなものの間に、意外なつながりを見つけることがある",
      w: { ideation: 1.0, learner: 0.3, analytical: 0.2, harmony: -0.1 } },
    { id: 17, text: "「普通こうする」と言われると、別の方法を試したくなる",
      w: { ideation: 0.8, adaptability: 0.3, harmony: -0.4, achievement: -0.1 } },
    { id: 18, text: "アイデアが次から次へと浮かんで、メモが追いつかないことがある",
      w: { ideation: 0.9, adaptability: 0.2, achievement: -0.1, analytical: -0.1 } },
    { id: 19, text: "既存のやり方を改善するより、ゼロから作り直すほうが好きだ",
      w: { ideation: 0.7, command: 0.2, harmony: -0.3, achievement: -0.2 } },
    { id: 20, text: "「もし◯◯だったら」と空想するのが日常的だ",
      w: { ideation: 0.8, learner: 0.2, empathy: 0.2, achievement: -0.2 } },

    // --- 指導・リーダーシップ系 ---
    { id: 21, text: "グループで方向性が定まらないとき、自分が決断を下すことが多い",
      w: { command: 1.0, achievement: 0.3, harmony: -0.2, empathy: -0.2 } },
    { id: 22, text: "人に影響を与え、行動を変えてもらうことにやりがいを感じる",
      w: { command: 0.9, empathy: 0.1, achievement: 0.2, harmony: -0.1 } },
    { id: 23, text: "困難な状況でも「自分が何とかする」という気持ちが湧いてくる",
      w: { command: 0.8, achievement: 0.4, adaptability: 0.2, harmony: -0.1 } },
    { id: 24, text: "チームの方針について、反対意見があっても自分の考えを主張できる",
      w: { command: 0.7, analytical: 0.2, harmony: -0.5, empathy: -0.3 } },
    { id: 25, text: "後輩や部下の成長を見届けることに喜びを感じる",
      w: { command: 0.5, empathy: 0.5, harmony: 0.3, learner: 0.1 } },

    // --- 学習・探究系 ---
    { id: 26, text: "新しい分野を学び始めると、時間を忘れてのめり込む",
      w: { learner: 1.0, ideation: 0.2, achievement: 0.1, harmony: -0.1 } },
    { id: 27, text: "本、動画、講座など、常に何かを学んでいないと落ち着かない",
      w: { learner: 0.9, achievement: 0.2, adaptability: -0.1, harmony: -0.1 } },
    { id: 28, text: "「専門外だから」と学びを止める理由にはならないと思う",
      w: { learner: 0.8, ideation: 0.3, adaptability: 0.2, analytical: 0.1 } },
    { id: 29, text: "知らないことに出会うと、恥ずかしさより嬉しさが勝る",
      w: { learner: 0.9, adaptability: 0.3, empathy: 0.1, command: -0.2 } },
    { id: 30, text: "学んだことを自分なりに整理して、体系化するのが好きだ",
      w: { learner: 0.7, analytical: 0.5, achievement: 0.2, ideation: 0.1 } },

    // --- 調和・チーム系 ---
    { id: 31, text: "意見が対立したとき、双方の落としどころを探すのが自然だ",
      w: { harmony: 1.0, empathy: 0.3, command: -0.3, ideation: -0.1 } },
    { id: 32, text: "チーム内にギスギスした空気があると、放っておけない",
      w: { harmony: 0.8, empathy: 0.4, command: -0.1, analytical: -0.2 } },
    { id: 33, text: "議論で「勝つ」より「みんなが納得する」ほうが大事だ",
      w: { harmony: 0.9, empathy: 0.3, command: -0.4, achievement: -0.2 } },
    { id: 34, text: "初対面の人ともすぐに共通点を見つけて仲良くなれる",
      w: { harmony: 0.7, empathy: 0.3, adaptability: 0.3, analytical: -0.2 } },
    { id: 35, text: "自分の手柄より、チーム全体の成功のほうが嬉しい",
      w: { harmony: 0.8, empathy: 0.2, achievement: -0.4, command: -0.2 } },

    // --- 適応・柔軟系 ---
    { id: 36, text: "急な予定変更があっても、すぐに切り替えて対応できる",
      w: { adaptability: 1.0, achievement: -0.3, analytical: -0.2, harmony: 0.1 } },
    { id: 37, text: "計画をガチガチに決めるより、流れに任せるほうが性に合う",
      w: { adaptability: 0.9, achievement: -0.5, analytical: -0.3, ideation: 0.2 } },
    { id: 38, text: "知らない土地や文化に飛び込むのにワクワクする",
      w: { adaptability: 0.7, learner: 0.4, ideation: 0.2, harmony: -0.1 } },
    { id: 39, text: "「正解がない問題」に取り組むのが好きだ",
      w: { adaptability: 0.6, ideation: 0.5, analytical: 0.1, achievement: -0.2 } },
    { id: 40, text: "同時に複数のことを進めるのが得意だ",
      w: { adaptability: 0.7, achievement: 0.3, analytical: -0.1, harmony: -0.1 } },

    // --- クロスドメイン質問（複合的に判別する質問） ---
    { id: 41, text: "チームメンバーの強みを見抜いて、適材適所に配置したい",
      w: { command: 0.6, empathy: 0.4, analytical: 0.3, harmony: 0.3 } },
    { id: 42, text: "失敗しても「次にどう活かすか」をすぐ考え始める",
      w: { adaptability: 0.5, achievement: 0.4, learner: 0.3, analytical: 0.1 } },
    { id: 43, text: "一人で黙々と作業するより、誰かと議論しながら進めたい",
      w: { harmony: 0.5, empathy: 0.3, command: 0.2, analytical: -0.4 } },
    { id: 44, text: "「前例がない」と言われると、むしろやる気が出る",
      w: { ideation: 0.5, command: 0.4, adaptability: 0.3, harmony: -0.3 } },
    { id: 45, text: "物事の全体像をつかんでから、細部に取りかかりたい",
      w: { analytical: 0.5, learner: 0.3, command: 0.3, adaptability: -0.2 } }
  ],

  // ==============================================================
  // 回答マッピング（5段階 → -1.0 ～ +1.0）
  // ==============================================================
  ANSWER_MAP: {
    1: 1.0,    // はい
    2: 0.5,    // たぶんはい
    3: 0.0,    // どちらでもない
    4: -0.5,   // たぶんいいえ
    5: -1.0    // いいえ
  },

  ANSWER_LABELS: ['はい', 'たぶんはい', 'どちらでもない', 'たぶんいいえ', 'いいえ'],

  MAX_QUESTIONS: 20,

  // ==============================================================
  // セッション管理
  // ==============================================================
  createSession() {
    var domainScores = {};
    var domainIds = this.DOMAINS.map(function(d) { return d.id; });
    for (var i = 0; i < domainIds.length; i++) {
      domainScores[domainIds[i]] = 0;
    }
    return {
      scores: domainScores,
      askedIds: [],
      answers: [],
      questionCount: 0,
      currentQuestion: null,
      finished: false
    };
  },

  // ==============================================================
  // 次の質問を選択（情報利得最大化）
  // ==============================================================
  selectNextQuestion(session) {
    if (session.questionCount >= this.MAX_QUESTIONS) {
      session.finished = true;
      return null;
    }

    var self = this;
    var available = this.QUESTIONS.filter(function(q) {
      return session.askedIds.indexOf(q.id) === -1;
    });

    if (available.length === 0) {
      session.finished = true;
      return null;
    }

    var best = null;
    var bestScore = -Infinity;

    // 現在のスコアから上位ドメインを特定
    var sorted = this.getSortedDomains(session.scores);
    var topDomains = sorted.slice(0, 4).map(function(d) { return d.id; });

    for (var i = 0; i < available.length; i++) {
      var q = available[i];
      var infoGain = this.calcInformationGain(q, session.scores, topDomains);

      // 序盤は広く探索、終盤はトップ候補の判別に集中
      var progress = session.questionCount / this.MAX_QUESTIONS;
      if (progress < 0.3) {
        // 序盤: 多くのドメインに影響する質問を優先
        infoGain += this.calcCoverage(q) * 0.5;
      } else if (progress > 0.6) {
        // 終盤: 上位ドメイン間の弁別力を重視
        infoGain += this.calcDiscrimination(q, sorted.slice(0, 3)) * 0.8;
      }

      if (infoGain > bestScore) {
        bestScore = infoGain;
        best = q;
      }
    }

    session.currentQuestion = best;
    return best;
  },

  // 情報利得の計算
  calcInformationGain(question, currentScores, topDomains) {
    var gain = 0;
    var w = question.w;

    for (var i = 0; i < topDomains.length; i++) {
      var d = topDomains[i];
      var weight = w[d] || 0;
      // 上位ドメイン間で重みの差が大きい質問ほど弁別力が高い
      gain += Math.abs(weight);
    }

    // 上位ドメイン間での重み差分（弁別力）
    for (var j = 0; j < topDomains.length; j++) {
      for (var k = j + 1; k < topDomains.length; k++) {
        var w1 = w[topDomains[j]] || 0;
        var w2 = w[topDomains[k]] || 0;
        gain += Math.abs(w1 - w2) * 0.5;
      }
    }

    return gain;
  },

  // 質問のカバレッジ（何ドメインに影響するか）
  calcCoverage(question) {
    var count = 0;
    var w = question.w;
    var domainIds = this.DOMAINS.map(function(d) { return d.id; });
    for (var i = 0; i < domainIds.length; i++) {
      if (w[domainIds[i]] && Math.abs(w[domainIds[i]]) >= 0.3) {
        count++;
      }
    }
    return count;
  },

  // 上位ドメイン間の弁別力
  calcDiscrimination(question, topDomains) {
    var disc = 0;
    var w = question.w;
    for (var i = 0; i < topDomains.length; i++) {
      for (var j = i + 1; j < topDomains.length; j++) {
        var w1 = w[topDomains[i].id] || 0;
        var w2 = w[topDomains[j].id] || 0;
        disc += Math.abs(w1 - w2);
      }
    }
    return disc;
  },

  // ==============================================================
  // 回答処理
  // ==============================================================
  processAnswer(session, answerValue) {
    if (!session.currentQuestion) return;

    var mappedValue = this.ANSWER_MAP[answerValue];
    var question = session.currentQuestion;
    var w = question.w;
    var domainIds = this.DOMAINS.map(function(d) { return d.id; });

    // 各ドメインスコアを更新
    for (var i = 0; i < domainIds.length; i++) {
      var d = domainIds[i];
      var weight = w[d] || 0;
      session.scores[d] += weight * mappedValue;
    }

    session.askedIds.push(question.id);
    session.answers.push({
      questionId: question.id,
      answer: answerValue,
      mapped: mappedValue
    });
    session.questionCount++;

    if (session.questionCount >= this.MAX_QUESTIONS) {
      session.finished = true;
    }
  },

  // ==============================================================
  // スコア正規化とソート
  // ==============================================================
  getSortedDomains(scores) {
    var entries = [];
    var domainIds = this.DOMAINS.map(function(d) { return d.id; });
    for (var i = 0; i < domainIds.length; i++) {
      entries.push({ id: domainIds[i], score: scores[domainIds[i]] });
    }
    entries.sort(function(a, b) { return b.score - a.score; });
    return entries;
  },

  getNormalizedScores(scores) {
    var sorted = this.getSortedDomains(scores);
    var maxAbs = 0;
    for (var i = 0; i < sorted.length; i++) {
      var abs = Math.abs(sorted[i].score);
      if (abs > maxAbs) maxAbs = abs;
    }

    var normalized = {};
    if (maxAbs === 0) maxAbs = 1;

    for (var j = 0; j < sorted.length; j++) {
      // -maxAbs ～ +maxAbs を 0 ～ 100 にマッピング
      normalized[sorted[j].id] = Math.round(((sorted[j].score / maxAbs) + 1) * 50);
    }
    return normalized;
  },

  // ==============================================================
  // 現在の確信度（上位ドメインと他のドメインの差）
  // ==============================================================
  getConfidence(session) {
    if (session.questionCount === 0) return 0;

    var sorted = this.getSortedDomains(session.scores);
    if (sorted.length < 2) return 100;

    var top = sorted[0].score;
    var second = sorted[1].score;
    var range = sorted[0].score - sorted[sorted.length - 1].score;

    if (range === 0) return Math.min(session.questionCount * 3, 30);

    var separation = (top - second) / range;
    var progress = session.questionCount / this.MAX_QUESTIONS;

    // 進行度と分離度の組み合わせ
    var confidence = Math.round((progress * 60) + (separation * 40));
    return Math.min(Math.max(confidence, 5), 99);
  },

  // ==============================================================
  // 最終結果生成
  // ==============================================================
  generateResults(session) {
    var normalized = this.getNormalizedScores(session.scores);
    var sorted = this.getSortedDomains(session.scores);
    var self = this;

    // ドメイン情報をマージ
    var rankedDomains = sorted.map(function(entry, index) {
      var domain = null;
      for (var i = 0; i < self.DOMAINS.length; i++) {
        if (self.DOMAINS[i].id === entry.id) {
          domain = self.DOMAINS[i];
          break;
        }
      }
      return {
        rank: index + 1,
        id: entry.id,
        rawScore: entry.score,
        score: normalized[entry.id],
        name: domain.name,
        icon: domain.icon,
        color: domain.color,
        short: domain.short,
        description: domain.description,
        strengths: domain.strengths,
        tips: domain.tips
      };
    });

    // タイプ名生成
    var top3 = rankedDomains.slice(0, 3);
    var typeName = this.generateTypeName(top3);
    var summary = this.generateSummary(top3, rankedDomains);
    var synergy = this.generateSynergy(top3);

    return {
      typeName: typeName,
      summary: summary,
      synergy: synergy,
      domains: rankedDomains,
      top3: top3,
      totalQuestions: session.questionCount,
      answeredQuestions: session.answers
    };
  },

  generateTypeName(top3) {
    var nameMap = {
      'analytical': '論理の',
      'achievement': '達成の',
      'empathy': '共感の',
      'ideation': '創造の',
      'command': '統率の',
      'learner': '探究の',
      'harmony': '調和の',
      'adaptability': '変幻の'
    };
    var coreMap = {
      'analytical': '戦略家',
      'achievement': '実行者',
      'empathy': '共感者',
      'ideation': '発明家',
      'command': 'リーダー',
      'learner': '求道者',
      'harmony': '仲裁者',
      'adaptability': '冒険者'
    };

    var prefix = nameMap[top3[1].id] || '';
    var core = coreMap[top3[0].id] || 'マスター';

    return prefix + core;
  },

  generateSummary(top3, all) {
    var lines = [];
    lines.push('あなたの最大の強みは「' + top3[0].name + '」です。');
    lines.push(top3[0].short + '。');
    lines.push('さらに「' + top3[1].name + '」と「' + top3[2].name + '」がそれを支え、');
    lines.push('独自の強みプロファイルを形成しています。');
    return lines.join('');
  },

  generateSynergy(top3) {
    var ids = top3.map(function(d) { return d.id; }).sort();
    var key = ids.join('+');

    var synergyMap = {
      'analytical+command+learner': 'データに基づくビジョンで組織を導く「知的リーダー」タイプ。戦略コンサルタントや研究開発リーダーとして力を発揮します。',
      'achievement+analytical+command': '分析力と実行力と統率力の三拍子。プロジェクトマネジメントや経営企画で真価を発揮する「完遂型リーダー」です。',
      'empathy+harmony+ideation': '人の気持ちを理解しながら創造的な解決策を生む「クリエイティブ・ファシリテーター」。UXデザインやコミュニティ運営に最適。',
      'adaptability+ideation+learner': '好奇心と柔軟性と創造性の掛け合わせ。スタートアップや新規事業など、未知の領域を切り拓く「パイオニア」タイプ。',
      'command+empathy+harmony': '人を動かす力と寄り添う力の両立。チームビルディングのプロフェッショナル。組織開発やHR領域で輝きます。',
      'achievement+adaptability+command': '変化の中でも成果を出し続ける「突破型リーダー」。危機管理や営業の最前線で真価を発揮します。',
      'analytical+empathy+learner': '知識と共感力の融合。カウンセリング、マーケティングリサーチ、教育など、人を深く理解する仕事に向いています。',
      'achievement+harmony+learner': '学びを実践に活かしながらチームの力を引き出す「成長促進者」。研修講師やチームリーダーに最適。'
    };

    if (synergyMap[key]) return synergyMap[key];

    // 汎用シナジー
    return 'あなたの「' + top3[0].name + '」×「' + top3[1].name + '」×「' + top3[2].name +
      '」の組み合わせは、多面的な強みを発揮できるユニークなプロファイルです。' +
      'この3つを意識的に連携させることで、あなたにしかできない価値を生み出せます。';
  }
};
