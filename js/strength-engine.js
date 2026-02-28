/**
 * 得意ドメイン診断 - アキネーター方式アダプティブエンジン
 *
 * 15の具体的な知識・専門領域（6大カテゴリ）をベイズ的に特定。
 * 知識量＋情熱の両面から判定し、称号＋内訳＋ハンディキャップを生成。
 */

var StrengthEngine = {

  // ==============================================================
  // 6大カテゴリ
  // ==============================================================
  CATEGORIES: [
    { id: 'entertainment', name: 'エンタメ', color: '#ef4444', domains: ['movie', 'music', 'anime', 'game'] },
    { id: 'culture', name: '文化・知識', color: '#3b82f6', domains: ['literature', 'history'] },
    { id: 'technology', name: 'テクノロジー', color: '#6366f1', domains: ['tech', 'science'] },
    { id: 'creative', name: 'クリエイティブ', color: '#d946ef', domains: ['art', 'photo'] },
    { id: 'lifestyle', name: 'ライフスタイル', color: '#fb923c', domains: ['cooking', 'travel', 'fashion'] },
    { id: 'active', name: 'アクティブ', color: '#84cc16', domains: ['sports', 'outdoor'] }
  ],

  // ==============================================================
  // 15の具体ドメイン（小カテゴリ）
  // ==============================================================
  DOMAINS: [
    {
      id: 'movie', name: '映画・ドラマ', category: 'entertainment',
      icon: '🎬', color: '#ef4444',
      description: '映画やドラマの世界に精通しています。監督や俳優、ジャンルの違い、撮影技法や脚本構造まで幅広い知識と情熱を持ち、作品を深く味わえる人です。友人からおすすめを聞かれることも多いでしょう。',
      keywords: ['監督', '俳優', 'ジャンル', '名作', 'レビュー'],
      growth: 'まだ見ぬ名作映画との出会いが待っています。友人のおすすめから始めてみては？'
    },
    {
      id: 'music', name: '音楽', category: 'entertainment',
      icon: '🎵', color: '#ec4899',
      description: '音楽の世界に深い造詣があります。ジャンルの違いやアーティストの系譜、楽器や音楽理論まで、聴くだけでなく「わかる」レベルで音楽を楽しめます。プレイリスト作りも得意でしょう。',
      keywords: ['アーティスト', 'ジャンル', 'ライブ', '楽器', '音楽理論'],
      growth: '音楽は無限の世界。普段聴かないジャンルに触れると新しい扉が開きます。'
    },
    {
      id: 'anime', name: 'アニメ・マンガ', category: 'entertainment',
      icon: '📺', color: '#f97316',
      description: 'アニメやマンガの世界を深く理解しています。作品の作画や演出の違い、制作スタジオやクリエイターまで詳しく、日本が誇るポップカルチャーの良き理解者です。',
      keywords: ['作画', '声優', 'マンガ家', '制作スタジオ', '同人'],
      growth: 'アニメ・マンガは日本が世界に誇る文化。名作から入門してみては？'
    },
    {
      id: 'game', name: 'ゲーム', category: 'entertainment',
      icon: '🎮', color: '#a78bfa',
      description: 'ゲームの世界に精通しています。やり込みの深さ、ゲームデザインの理解、メタゲームの把握まで、単なるプレイヤーを超えた知見を持っています。戦略的思考にも長けているでしょう。',
      keywords: ['RPG', 'FPS', 'eスポーツ', 'ゲームデザイン', 'やり込み'],
      growth: 'ゲームは思考力と反射神経を鍛える優れたメディアです。まず気軽に一本から。'
    },
    {
      id: 'literature', name: '小説・読書', category: 'culture',
      icon: '📖', color: '#3b82f6',
      description: '文学の世界に深く浸っています。作家の文体の違い、物語構造の妙、ジャンルの変遷まで幅広い読書体験があり、言葉の力を誰よりも知っている人です。',
      keywords: ['作家', '文体', '純文学', 'ミステリ', '書評'],
      growth: '一冊の本が人生を変えることもあります。話題作から手に取ってみては。'
    },
    {
      id: 'history', name: '歴史', category: 'culture',
      icon: '🏛️', color: '#eab308',
      description: '歴史の世界に魅了されています。時代背景や人物の動機、文明の興亡まで深く知ることで、現代を多角的に理解できる視座を持っています。語り部としての資質も十分です。',
      keywords: ['日本史', '世界史', '文明', '偉人', '史跡'],
      growth: '歴史を知ると現在がもっと面白くなります。興味のある時代から始めてみては。'
    },
    {
      id: 'tech', name: 'プログラミング・IT', category: 'technology',
      icon: '💻', color: '#6366f1',
      description: 'テクノロジーの世界に精通しています。コードを書く技術だけでなく、ITの最新トレンド、ツールの使いこなし、デジタル社会の仕組みまで深く理解しています。',
      keywords: ['プログラミング', 'AI', 'Web', 'ガジェット', 'OSS'],
      growth: 'プログラミングは現代の読み書きそろばん。無料の教材で始められます。'
    },
    {
      id: 'science', name: '科学', category: 'technology',
      icon: '🔬', color: '#10b981',
      description: '科学的思考と知識に長けています。自然現象の仕組み、数学的な美しさ、実験と検証のプロセスに強い知的好奇心を持ち、論理的に世界を理解する力があります。',
      keywords: ['物理', '化学', '生物', '数学', '実験'],
      growth: '科学的思考は日常のあらゆる場面で役立ちます。科学ニュースから始めてみては。'
    },
    {
      id: 'art', name: 'アート・デザイン', category: 'creative',
      icon: '🎨', color: '#d946ef',
      description: 'アートとデザインの感性が豊かです。色彩やレイアウト、造形の美しさを感じ取り、自らも表現する力を持っています。日常の中にも美を見出せる観察眼の持ち主です。',
      keywords: ['絵画', 'デザイン', '建築', 'イラスト', '美術館'],
      growth: 'アートに触れると世界の見え方が変わります。美術館に足を運んでみては。'
    },
    {
      id: 'photo', name: '写真・映像', category: 'creative',
      icon: '📷', color: '#06b6d4',
      description: 'ビジュアル表現に長けています。構図やライティング、編集技術まで、写真や映像を通じて瞬間を切り取り、物語を伝える力を持っています。',
      keywords: ['構図', 'カメラ', '編集', 'ライティング', '映像制作'],
      growth: 'カメラを持つと日常が特別な瞬間に変わります。スマホでも始められます。'
    },
    {
      id: 'cooking', name: '料理・グルメ', category: 'lifestyle',
      icon: '🍳', color: '#fb923c',
      description: '料理とグルメの世界に精通しています。食材の選び方、調理技法、味の組み立て方まで深い知見があり、食を通じて人を幸せにできる人です。',
      keywords: ['レシピ', '食材', '調理法', 'レストラン', '食文化'],
      growth: '料理は最も身近なクリエイティブ活動。簡単なレシピから始めてみては。'
    },
    {
      id: 'travel', name: '旅行', category: 'lifestyle',
      icon: '✈️', color: '#14b8a6',
      description: '旅行と地理の知識が豊富です。行き先のリサーチ力、現地文化への理解、旅のプランニング能力に優れ、未知の場所を楽しむ冒険心を持っています。',
      keywords: ['観光地', '文化体験', '地理', 'プランニング', '異文化'],
      growth: '旅は視野を広げる最良の方法です。まずは近場の知らない場所から。'
    },
    {
      id: 'fashion', name: 'ファッション', category: 'lifestyle',
      icon: '👗', color: '#f472b6',
      description: 'ファッションの世界に精通しています。トレンドの理解、素材や品質の見極め、自己表現としてのスタイリングまで、装いを通じた文化的素養を持っています。',
      keywords: ['ブランド', 'トレンド', 'コーディネート', '素材', 'スタイリング'],
      growth: 'ファッションは最も身近な自己表現。好きな色から意識してみては。'
    },
    {
      id: 'sports', name: 'スポーツ', category: 'active',
      icon: '⚽', color: '#84cc16',
      description: 'スポーツの世界に深い知識と情熱を持っています。ルールや戦術の理解、選手の実力の見極め、自らも体を動かす習慣があり、スポーツを通じた充実した生活を送っています。',
      keywords: ['観戦', '戦術', '選手', 'チームスポーツ', 'トレーニング'],
      growth: '体を動かすことは心身の健康に直結します。好きな種目から始めてみては。'
    },
    {
      id: 'outdoor', name: 'アウトドア・自然', category: 'active',
      icon: '🏔️', color: '#22c55e',
      description: '自然とアウトドアの世界を深く愛しています。植物や動物、天体の知識があり、自然の中で過ごすスキルと経験が豊富です。地球と季節の移り変わりを肌で感じられる人です。',
      keywords: ['登山', 'キャンプ', '動植物', '天体', '自然観察'],
      growth: '自然に触れると心がリフレッシュされます。公園の散歩から始めてみては。'
    }
  ],

  // ==============================================================
  // 質問プール（65問 / 20問をアダプティブに出題）
  // 知識量＋情熱の両面から各ドメインをスコアリング
  // ==============================================================
  QUESTIONS: [
    // ─── 映画・ドラマ (movie) ───
    { id: 1,  text: "新作映画の予告編をチェックするのが習慣だ",
      w: { movie: 1.0, anime: 0.1 } },
    { id: 2,  text: "好きな映画監督が3人以上いる",
      w: { movie: 0.9, art: 0.1, photo: 0.1 } },
    { id: 3,  text: "映画の撮影技法や脚本構成について語れる",
      w: { movie: 0.8, literature: 0.2, photo: 0.3 } },
    { id: 4,  text: "友人から映画のおすすめを聞かれることが多い",
      w: { movie: 0.9 } },

    // ─── 音楽 (music) ───
    { id: 5,  text: "好きなアーティストの新曲は発売日にチェックする",
      w: { music: 1.0 } },
    { id: 6,  text: "音楽のジャンルやサブジャンルの違いを詳しく説明できる",
      w: { music: 0.9, history: 0.1 } },
    { id: 7,  text: "楽器の演奏経験がある、または音楽理論に興味がある",
      w: { music: 0.8, science: 0.2, art: 0.1 } },
    { id: 8,  text: "ライブやフェスに行くのが好きだ",
      w: { music: 0.7, outdoor: 0.1, sports: 0.1 } },

    // ─── アニメ・マンガ (anime) ───
    { id: 9,  text: "毎シーズン新作アニメを複数チェックしている",
      w: { anime: 1.0, game: 0.1 } },
    { id: 10, text: "好きなマンガ家や声優について詳しく語れる",
      w: { anime: 0.9 } },
    { id: 11, text: "アニメやマンガの作画や演出の違いがわかる",
      w: { anime: 0.8, art: 0.3, movie: 0.1 } },
    { id: 12, text: "コミケや同人文化などサブカルチャーに関心がある",
      w: { anime: 0.7, art: 0.2, game: 0.1 } },

    // ─── ゲーム (game) ───
    { id: 13, text: "新作ゲームの情報は常にチェックしている",
      w: { game: 1.0, tech: 0.1 } },
    { id: 14, text: "一つのゲームをやり込んで極めるタイプだ",
      w: { game: 0.9, sports: 0.1 } },
    { id: 15, text: "ゲームのレベルデザインやバランス調整について語れる",
      w: { game: 0.8, tech: 0.2, science: 0.1 } },
    { id: 16, text: "eスポーツやゲーム実況に興味がある",
      w: { game: 0.7, sports: 0.3, tech: 0.1 } },

    // ─── 小説・読書 (literature) ───
    { id: 17, text: "常に何かしらの本を読んでいる",
      w: { literature: 1.0, history: 0.2 } },
    { id: 18, text: "好きな作家の作品はほぼ全部読んでいる",
      w: { literature: 0.9 } },
    { id: 19, text: "文体や比喩の美しさに思わず感動することがある",
      w: { literature: 0.8, art: 0.2, movie: 0.1 } },
    { id: 20, text: "書店や図書館に行くとワクワクする",
      w: { literature: 0.7, history: 0.2, science: 0.1 } },

    // ─── 歴史 (history) ───
    { id: 21, text: "歴史上の人物や事件について深く調べるのが楽しい",
      w: { history: 1.0, literature: 0.2 } },
    { id: 22, text: "大河ドラマや歴史映画を楽しむ教養がある",
      w: { history: 0.8, movie: 0.3 } },
    { id: 23, text: "博物館や史跡を巡るのが好きだ",
      w: { history: 0.9, travel: 0.3, outdoor: 0.1 } },
    { id: 24, text: "歴史の「もしも」を考えるのが面白い",
      w: { history: 0.7, literature: 0.2, game: 0.1 } },

    // ─── プログラミング・IT (tech) ───
    { id: 25, text: "コードを書くことに没頭できる",
      w: { tech: 1.0, science: 0.2 } },
    { id: 26, text: "新しいプログラミング言語やツールを試すのが好きだ",
      w: { tech: 0.9, science: 0.1 } },
    { id: 27, text: "スマホやPCの設定やカスタマイズにこだわるほうだ",
      w: { tech: 0.7, game: 0.1 } },
    { id: 28, text: "IT技術のトレンドニュースを追いかけている",
      w: { tech: 0.8, science: 0.2 } },

    // ─── 科学 (science) ───
    { id: 29, text: "自然現象や科学的な仕組みを理解するのが好きだ",
      w: { science: 1.0, outdoor: 0.2 } },
    { id: 30, text: "数式やデータを見ると知的好奇心が湧いてくる",
      w: { science: 0.9, tech: 0.3 } },
    { id: 31, text: "科学ニュースや新発見の記事をよく読む",
      w: { science: 0.8, history: 0.1, tech: 0.1 } },
    { id: 32, text: "実験や検証を通して答えを見つけたい",
      w: { science: 0.7, cooking: 0.2, tech: 0.2 } },

    // ─── アート・デザイン (art) ───
    { id: 33, text: "美術館やギャラリーに行くのが好きだ",
      w: { art: 1.0, history: 0.2 } },
    { id: 34, text: "色の組み合わせやレイアウトのバランスが気になる",
      w: { art: 0.9, fashion: 0.3, photo: 0.2 } },
    { id: 35, text: "自分で絵を描いたりデザインしたりすることがある",
      w: { art: 0.8, anime: 0.2 } },
    { id: 36, text: "建築やインテリアのデザインに興味がある",
      w: { art: 0.7, travel: 0.1, fashion: 0.1 } },

    // ─── 写真・映像 (photo) ───
    { id: 37, text: "写真を撮るとき構図やライティングにこだわる",
      w: { photo: 1.0, art: 0.3 } },
    { id: 38, text: "写真編集や動画編集のスキルがある",
      w: { photo: 0.9, tech: 0.2 } },
    { id: 39, text: "旅先やイベントでは撮影に夢中になる",
      w: { photo: 0.7, travel: 0.3, outdoor: 0.1 } },
    { id: 40, text: "カメラの機材やレンズについて詳しい",
      w: { photo: 0.8, tech: 0.3 } },

    // ─── 料理・グルメ (cooking) ───
    { id: 41, text: "新しいレシピに挑戦するのが楽しい",
      w: { cooking: 1.0 } },
    { id: 42, text: "食材の目利きや調理法にこだわりがある",
      w: { cooking: 0.9, science: 0.1 } },
    { id: 43, text: "食べ歩きやレストラン開拓が趣味だ",
      w: { cooking: 0.7, travel: 0.3, fashion: 0.1 } },
    { id: 44, text: "調味料やスパイスの種類に詳しい",
      w: { cooking: 0.8, science: 0.1, travel: 0.1 } },

    // ─── 旅行 (travel) ───
    { id: 45, text: "旅行の計画を立てている時間が一番楽しい",
      w: { travel: 1.0 } },
    { id: 46, text: "世界の地名や地理の知識が豊富なほうだ",
      w: { travel: 0.8, history: 0.3, outdoor: 0.2 } },
    { id: 47, text: "現地の文化や風習に触れるのが旅の醍醐味だ",
      w: { travel: 0.9, history: 0.2, cooking: 0.2 } },
    { id: 48, text: "まだ行ったことのない場所の「行きたいリスト」がある",
      w: { travel: 0.7, outdoor: 0.2 } },

    // ─── ファッション (fashion) ───
    { id: 49, text: "流行のファッションやブランドに詳しい",
      w: { fashion: 1.0 } },
    { id: 50, text: "毎日のコーディネートを考えるのが楽しい",
      w: { fashion: 0.9, art: 0.2 } },
    { id: 51, text: "服の素材や縫製の品質を見分けられる",
      w: { fashion: 0.8 } },
    { id: 52, text: "ファッション雑誌やSNSのスタイリングをよくチェックする",
      w: { fashion: 0.7, photo: 0.2, art: 0.1 } },

    // ─── スポーツ (sports) ───
    { id: 53, text: "スポーツ観戦が好きで、選手やルールに詳しい",
      w: { sports: 1.0 } },
    { id: 54, text: "定期的に体を動かす習慣がある",
      w: { sports: 0.8, outdoor: 0.3 } },
    { id: 55, text: "スポーツの戦術や戦略を分析するのが面白い",
      w: { sports: 0.8, game: 0.2, science: 0.1 } },
    { id: 56, text: "チームで協力して勝利を目指す経験が好きだ",
      w: { sports: 0.7, game: 0.1 } },

    // ─── アウトドア・自然 (outdoor) ───
    { id: 57, text: "山登りやキャンプなど自然の中で過ごすのが好きだ",
      w: { outdoor: 1.0, sports: 0.2 } },
    { id: 58, text: "植物や動物の名前をよく知っている",
      w: { outdoor: 0.8, science: 0.3 } },
    { id: 59, text: "星空や天体観測を楽しむことがある",
      w: { outdoor: 0.7, science: 0.4 } },
    { id: 60, text: "天気や季節の変化に敏感なほうだ",
      w: { outdoor: 0.6, science: 0.2, travel: 0.1 } },

    // ─── クロスドメイン質問 ───
    { id: 61, text: "好きなコンテンツの「裏側」（制作過程や技術）にも興味がある",
      w: { tech: 0.3, photo: 0.3, movie: 0.2, music: 0.2, science: 0.2 } },
    { id: 62, text: "SNSで自分の趣味について積極的に発信している",
      w: { photo: 0.3, fashion: 0.3, cooking: 0.2, anime: 0.2 } },
    { id: 63, text: "一人で没頭する趣味のほうが性に合う",
      w: { literature: 0.3, tech: 0.3, game: 0.3, art: 0.2, sports: -0.2, outdoor: -0.1 } },
    { id: 64, text: "何かを学ぶとき、体を動かして体験しながら覚えたい",
      w: { cooking: 0.3, sports: 0.3, outdoor: 0.3, travel: 0.2, tech: -0.2, literature: -0.2 } },
    { id: 65, text: "流行よりも自分の「好き」を深く突き詰めるタイプだ",
      w: { anime: 0.3, game: 0.2, literature: 0.2, music: 0.2, history: 0.2, fashion: -0.3 } }
  ],

  // ==============================================================
  // 回答マッピング（5段階 → -1.0 ～ +1.0）
  // ==============================================================
  ANSWER_MAP: { 1: 1.0, 2: 0.5, 3: 0.0, 4: -0.5, 5: -1.0 },
  ANSWER_LABELS: ['はい', 'たぶんはい', 'どちらでもない', 'たぶんいいえ', 'いいえ'],

  MAX_QUESTIONS: 20,

  // ==============================================================
  // ヘルパー: ドメインIDからカテゴリを取得
  // ==============================================================
  getCategoryForDomain: function(domainId) {
    for (var i = 0; i < this.CATEGORIES.length; i++) {
      if (this.CATEGORIES[i].domains.indexOf(domainId) !== -1) {
        return this.CATEGORIES[i];
      }
    }
    return null;
  },

  getDomainById: function(domainId) {
    for (var i = 0; i < this.DOMAINS.length; i++) {
      if (this.DOMAINS[i].id === domainId) return this.DOMAINS[i];
    }
    return null;
  },

  // ==============================================================
  // セッション管理
  // ==============================================================
  createSession: function() {
    var domainScores = {};
    for (var i = 0; i < this.DOMAINS.length; i++) {
      domainScores[this.DOMAINS[i].id] = 0;
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
  selectNextQuestion: function(session) {
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

    var sorted = this.getSortedDomains(session.scores);
    var topDomains = sorted.slice(0, 6).map(function(d) { return d.id; });

    var best = null;
    var bestScore = -Infinity;

    for (var i = 0; i < available.length; i++) {
      var q = available[i];
      var infoGain = this.calcInformationGain(q, session.scores, topDomains);

      var progress = session.questionCount / this.MAX_QUESTIONS;
      if (progress < 0.3) {
        infoGain += this.calcCoverage(q) * 0.5;
      } else if (progress > 0.6) {
        infoGain += this.calcDiscrimination(q, sorted.slice(0, 4)) * 0.8;
      }

      if (infoGain > bestScore) {
        bestScore = infoGain;
        best = q;
      }
    }

    session.currentQuestion = best;
    return best;
  },

  calcInformationGain: function(question, currentScores, topDomains) {
    var gain = 0;
    var w = question.w;

    for (var i = 0; i < topDomains.length; i++) {
      var d = topDomains[i];
      var weight = w[d] || 0;
      gain += Math.abs(weight);
    }

    for (var j = 0; j < topDomains.length; j++) {
      for (var k = j + 1; k < topDomains.length; k++) {
        var w1 = w[topDomains[j]] || 0;
        var w2 = w[topDomains[k]] || 0;
        gain += Math.abs(w1 - w2) * 0.5;
      }
    }

    return gain;
  },

  calcCoverage: function(question) {
    var count = 0;
    var w = question.w;
    for (var i = 0; i < this.DOMAINS.length; i++) {
      var id = this.DOMAINS[i].id;
      if (w[id] && Math.abs(w[id]) >= 0.3) count++;
    }
    return count;
  },

  calcDiscrimination: function(question, topDomains) {
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
  processAnswer: function(session, answerValue) {
    if (!session.currentQuestion) return;

    var mappedValue = this.ANSWER_MAP[answerValue];
    var w = session.currentQuestion.w;

    for (var i = 0; i < this.DOMAINS.length; i++) {
      var d = this.DOMAINS[i].id;
      var weight = w[d] || 0;
      session.scores[d] += weight * mappedValue;
    }

    session.askedIds.push(session.currentQuestion.id);
    session.answers.push({
      questionId: session.currentQuestion.id,
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
  getSortedDomains: function(scores) {
    var entries = [];
    for (var i = 0; i < this.DOMAINS.length; i++) {
      var id = this.DOMAINS[i].id;
      entries.push({ id: id, score: scores[id] });
    }
    entries.sort(function(a, b) { return b.score - a.score; });
    return entries;
  },

  getNormalizedScores: function(scores) {
    var sorted = this.getSortedDomains(scores);
    var maxAbs = 0;
    for (var i = 0; i < sorted.length; i++) {
      var abs = Math.abs(sorted[i].score);
      if (abs > maxAbs) maxAbs = abs;
    }

    var normalized = {};
    if (maxAbs === 0) maxAbs = 1;

    for (var j = 0; j < sorted.length; j++) {
      normalized[sorted[j].id] = Math.round(((sorted[j].score / maxAbs) + 1) * 50);
    }
    return normalized;
  },

  // ==============================================================
  // カテゴリ別スコア（レーダーチャート用）
  // ==============================================================
  getCategoryScores: function(normalized) {
    var catScores = [];
    for (var i = 0; i < this.CATEGORIES.length; i++) {
      var cat = this.CATEGORIES[i];
      var total = 0;
      for (var j = 0; j < cat.domains.length; j++) {
        total += normalized[cat.domains[j]] || 50;
      }
      catScores.push({
        id: cat.id,
        name: cat.name,
        color: cat.color,
        score: Math.round(total / cat.domains.length)
      });
    }
    return catScores;
  },

  // ==============================================================
  // 確信度
  // ==============================================================
  getConfidence: function(session) {
    if (session.questionCount === 0) return 0;

    var sorted = this.getSortedDomains(session.scores);
    if (sorted.length < 2) return 100;

    var top = sorted[0].score;
    var second = sorted[1].score;
    var range = sorted[0].score - sorted[sorted.length - 1].score;

    if (range === 0) return Math.min(session.questionCount * 3, 30);

    var separation = (top - second) / range;
    var progress = session.questionCount / this.MAX_QUESTIONS;

    var confidence = Math.round((progress * 60) + (separation * 40));
    return Math.min(Math.max(confidence, 5), 99);
  },

  // ==============================================================
  // 最終結果生成
  // ==============================================================
  generateResults: function(session) {
    var normalized = this.getNormalizedScores(session.scores);
    var sorted = this.getSortedDomains(session.scores);
    var self = this;

    var rankedDomains = sorted.map(function(entry, index) {
      var domain = self.getDomainById(entry.id);
      var cat = self.getCategoryForDomain(entry.id);
      return {
        rank: index + 1,
        id: entry.id,
        rawScore: entry.score,
        score: normalized[entry.id],
        name: domain.name,
        icon: domain.icon,
        color: domain.color,
        category: cat ? cat.name : '',
        categoryColor: cat ? cat.color : '#888',
        description: domain.description,
        keywords: domain.keywords,
        growth: domain.growth
      };
    });

    var top3 = rankedDomains.slice(0, 3);
    var handicap = rankedDomains.slice(-3).reverse();
    var typeName = this.generateTypeName(top3);
    var summary = this.generateSummary(top3);
    var catScores = this.getCategoryScores(normalized);
    var combination = this.generateCombinationAnalysis(top3);

    return {
      typeName: typeName,
      summary: summary,
      combination: combination,
      domains: rankedDomains,
      top3: top3,
      handicap: handicap,
      categoryScores: catScores,
      totalQuestions: session.questionCount,
      answeredQuestions: session.answers
    };
  },

  // ==============================================================
  // 称号生成（称号＋内訳形式）
  // ==============================================================
  generateTypeName: function(top3) {
    var cat1 = this.getCategoryForDomain(top3[0].id);
    var cat2 = this.getCategoryForDomain(top3[1].id);
    var cat3 = this.getCategoryForDomain(top3[2].id);

    // 同一カテゴリ内 → カテゴリ特化型の称号
    if (cat1 && cat2 && cat3 && cat1.id === cat2.id && cat2.id === cat3.id) {
      var sameMap = {
        entertainment: 'エンタメの覇者',
        culture: '知の巨人',
        technology: 'テクノロジーの権化',
        creative: '創造の魔術師',
        lifestyle: 'ライフスタイルの達人',
        active: 'アクティブマスター'
      };
      return sameMap[cat1.id] || cat1.name + 'の達人';
    }

    // #1 のドメインに基づくコアタイトル
    var coreMap = {
      movie: '映画マスター', music: '音楽マスター', anime: 'アニメ・マンガの達人',
      game: 'ゲームマスター', literature: '文学の達人', history: '歴史の語り部',
      tech: 'テックマスター', science: 'サイエンスの探求者',
      art: 'アートの申し子', photo: '映像クリエイター',
      cooking: '料理の達人', travel: '旅の達人', fashion: 'ファッションの達人',
      sports: 'スポーツマスター', outdoor: 'アウトドアの達人'
    };

    // #2 のカテゴリに基づくプレフィックス
    var prefixMap = {
      entertainment: 'エンタメ好きの',
      culture: '博学な',
      technology: 'テック系',
      creative: 'クリエイティブな',
      lifestyle: 'おしゃれな',
      active: 'アクティブな'
    };

    var core = coreMap[top3[0].id] || '達人';

    // #1 と #2 が同カテゴリならプレフィックスは #3 のカテゴリから
    var prefixCat = (cat1 && cat2 && cat1.id === cat2.id && cat3) ? cat3 : cat2;
    var prefix = prefixCat ? (prefixMap[prefixCat.id] || '') : '';

    return prefix + core;
  },

  generateSummary: function(top3) {
    var lines = [];
    lines.push('あなたの最も得意な分野は「' + top3[0].name + '」（' + top3[0].category + '）。');
    lines.push(top3[0].description.split('。')[0] + '。');
    lines.push('さらに「' + top3[1].name + '」と「' + top3[2].name + '」の知識・情熱も持ち合わせた、');
    lines.push('独自の専門性プロファイルです。');
    return lines.join('');
  },

  generateCombinationAnalysis: function(top3) {
    var cat1 = this.getCategoryForDomain(top3[0].id);
    var cat2 = this.getCategoryForDomain(top3[1].id);
    var cat3 = this.getCategoryForDomain(top3[2].id);

    // カテゴリの組み合わせで分析テキストを生成
    var catIds = [];
    if (cat1) catIds.push(cat1.id);
    if (cat2 && catIds.indexOf(cat2.id) === -1) catIds.push(cat2.id);
    if (cat3 && catIds.indexOf(cat3.id) === -1) catIds.push(cat3.id);
    catIds.sort();
    var catKey = catIds.join('+');

    var analysisMap = {
      'entertainment': 'エンタメ分野に特化した深い知識を持っています。映像、音声、インタラクティブコンテンツの幅広い理解があり、エンタメ業界や批評の世界で輝ける素養があります。',
      'culture': '文化と教養の深い素養を持っています。歴史的文脈と文学的感性の両方から物事を捉えられる、稀有な知性の持ち主です。',
      'technology': 'テクノロジーの幅広い知見を持っています。理論と実践の両面から技術を理解し、イノベーションを起こせるポテンシャルがあります。',
      'creative': 'クリエイティブ分野に強い感性と技術を持っています。視覚表現のプロフェッショナルとして活躍できる資質があります。',
      'lifestyle': 'ライフスタイル全般にわたる高い感度を持っています。生活を豊かにする知識と実践力で、周囲にインスピレーションを与えます。',
      'active': 'アクティブな分野に深い知見と情熱を持っています。体を動かし自然に触れることで、心身ともに充実した生活を送っています。',
      'culture+entertainment': '物語を深く愛する人です。映像と文字、両方のメディアから物語を味わい、その構造や背景まで語れる「ストーリーテラー」の資質があります。',
      'entertainment+technology': 'テクノロジーとエンタメの交差点に立っています。デジタルコンテンツの制作から消費まで精通した、現代カルチャーの最先端を行く存在です。',
      'creative+entertainment': 'コンテンツを楽しむだけでなく、自ら創り出す力も持っています。消費者と制作者の両方の視点を持った、クリエイティブなコンテンツ通です。',
      'culture+technology': '文系と理系の壁を超えた幅広い知性の持ち主です。歴史や文学の教養とテクノロジーの知見を融合させ、独自の視点を生み出せます。',
      'active+entertainment': 'インドアもアウトドアも楽しめるバランス型です。スポーツとエンタメ、両方の世界で友人と盛り上がれる社交性の高い人でしょう。',
      'lifestyle+entertainment': '日常を楽しむ天才です。エンタメと生活の両面で高い感度を持ち、「楽しい」を見つける達人と言えます。'
    };

    if (analysisMap[catKey]) return analysisMap[catKey];

    // 汎用分析
    var catNames = [];
    if (cat1) catNames.push(cat1.name);
    if (cat2 && catNames.indexOf(cat2.name) === -1) catNames.push(cat2.name);
    if (cat3 && catNames.indexOf(cat3.name) === -1) catNames.push(cat3.name);

    return '「' + top3[0].name + '」×「' + top3[1].name + '」×「' + top3[2].name +
      '」という、' + catNames.join('と') + 'にまたがるユニークな専門性を持っています。' +
      'この組み合わせを活かせば、あなたにしかない視点と価値を発揮できます。';
  }
};
