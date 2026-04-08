/**
 * アニマルオーラ診断32 - 32タイプ定義
 *
 * 8種の守護動物 × 4色のオーラ = 全32タイプ
 *
 * 動物判定: Big Five スコアの組み合わせで決定
 * オーラ判定: 誠実性(J/P軸) × 外向性+FC(H/L軸)で決定
 */

var AURA_COLORS = {
  JH: { name: "金", nameEn: "Gold",    hex: "#D4A017", suffix: "JH" },
  JL: { name: "銀", nameEn: "Silver",  hex: "#8A9BA8", suffix: "JL" },
  PH: { name: "翠", nameEn: "Emerald", hex: "#2EAD6B", suffix: "PH" },
  PL: { name: "紅", nameEn: "Crimson", hex: "#C73E5A", suffix: "PL" }
};

var ANIMALS = {
  dolphin:  { name: "イルカ",   emoji: "🐬" },
  lion:     { name: "ライオン", emoji: "🦁" },
  eagle:    { name: "ワシ",     emoji: "🦅" },
  dog:      { name: "犬",       emoji: "🐕" },
  cat:      { name: "ネコ",     emoji: "🐱" },
  owl:      { name: "フクロウ", emoji: "🦉" },
  rabbit:   { name: "ウサギ",   emoji: "🐰" },
  wolf:     { name: "オオカミ", emoji: "🐺" }
};

var PERSONALITY_TYPES = [
  // ========== イルカ (Dolphin) — 共感的な社交家 ==========
  { code: "DOL-JH", animal: "イルカ", emoji: "🐬", title: "金のイルカ", color: "#D4A017",
    keywords: ["情熱的リーダー", "共感力", "行動派"],
    description: "組織の中で人を巻き込みながら目標を達成する、エネルギッシュな共感リーダー。計画性と社交性を兼ね備え、チームの士気を高める存在です。" },
  { code: "DOL-JL", animal: "イルカ", emoji: "🐬", title: "銀のイルカ", color: "#8A9BA8",
    keywords: ["堅実な調和", "信頼感", "安定"],
    description: "穏やかで安定した存在感を持つ調停者。計画的に物事を進めながら、周囲の感情にも丁寧に寄り添います。" },
  { code: "DOL-PH", animal: "イルカ", emoji: "🐬", title: "翠のイルカ", color: "#2EAD6B",
    keywords: ["自由な共感者", "直感", "柔軟"],
    description: "自由奔放な感性と深い共感力を持つムードメーカー。場の空気を明るくし、人々を自然とつなげる力があります。" },
  { code: "DOL-PL", animal: "イルカ", emoji: "🐬", title: "紅のイルカ", color: "#C73E5A",
    keywords: ["深い絆", "繊細な社交", "内省"],
    description: "深い感受性と共感力を持ち、少数の人と濃密な関係を築きます。表面的な付き合いより、魂レベルの対話を求めるタイプです。" },

  // ========== ライオン (Lion) — 自信あるリーダー ==========
  { code: "LIO-JH", animal: "ライオン", emoji: "🦁", title: "金のライオン", color: "#D4A017",
    keywords: ["王者", "決断力", "統率"],
    description: "天性のリーダーシップと揺るぎない自信を持つ統率者。計画的にチームを導き、大きな成果を上げます。" },
  { code: "LIO-JL", animal: "ライオン", emoji: "🦁", title: "銀のライオン", color: "#8A9BA8",
    keywords: ["冷静な統率", "戦略家", "信念"],
    description: "冷静沈着な戦略家タイプのリーダー。感情に流されず、合理的な判断でチームを安定させます。" },
  { code: "LIO-PH", animal: "ライオン", emoji: "🦁", title: "翠のライオン", color: "#2EAD6B",
    keywords: ["カリスマ", "冒険", "革新"],
    description: "既存の枠を壊し、新しい道を切り拓くカリスマ。柔軟な発想と大胆な行動力で周囲を魅了します。" },
  { code: "LIO-PL", animal: "ライオン", emoji: "🦁", title: "紅のライオン", color: "#C73E5A",
    keywords: ["孤高", "信念", "情熱"],
    description: "強い信念と情熱を内に秘めた孤高のリーダー。静かだが確固たる意志で道を切り拓きます。" },

  // ========== ワシ (Eagle) — ビジョナリーな独立者 ==========
  { code: "EAG-JH", animal: "ワシ", emoji: "🦅", title: "金のワシ", color: "#D4A017",
    keywords: ["先見の明", "戦略", "実行力"],
    description: "高い視座から全体を見渡し、戦略的に行動する先見者。理想を現実に変える実行力を持っています。" },
  { code: "EAG-JL", animal: "ワシ", emoji: "🦅", title: "銀のワシ", color: "#8A9BA8",
    keywords: ["分析", "洞察", "独立"],
    description: "鋭い分析力と冷静な洞察力を持つ知的探究者。一人で深く考え、本質を見抜く力に長けています。" },
  { code: "EAG-PH", animal: "ワシ", emoji: "🦅", title: "翠のワシ", color: "#2EAD6B",
    keywords: ["開拓者", "自由", "創造"],
    description: "未知の領域に果敢に挑む開拓者。既成概念に縛られない自由な発想で、新しい世界を創造します。" },
  { code: "EAG-PL", animal: "ワシ", emoji: "🦅", title: "紅のワシ", color: "#C73E5A",
    keywords: ["哲学者", "深遠", "孤独"],
    description: "深い思索と哲学的な視点を持つ知の探究者。孤独を恐れず、真理を追い求めます。" },

  // ========== 犬 (Dog) — 忠実な献身者 ==========
  { code: "DOG-JH", animal: "犬", emoji: "🐕", title: "金の犬", color: "#D4A017",
    keywords: ["忠誠", "情熱", "守護者"],
    description: "強い忠誠心と情熱を持ち、仲間のために全力を尽くす守護者。責任感と行動力でチームを支えます。" },
  { code: "DOG-JL", animal: "犬", emoji: "🐕", title: "銀の犬", color: "#8A9BA8",
    keywords: ["堅実", "勤勉", "信頼"],
    description: "コツコツと努力を積み重ねる堅実な働き者。信頼性が高く、周囲から頼りにされる存在です。" },
  { code: "DOG-PH", animal: "犬", emoji: "🐕", title: "翠の犬", color: "#2EAD6B",
    keywords: ["冒険好き", "仲間想い", "元気"],
    description: "明るく元気で、仲間との冒険を楽しむ社交的な犬タイプ。柔軟性と忠誠心を兼ね備えています。" },
  { code: "DOG-PL", animal: "犬", emoji: "🐕", title: "紅の犬", color: "#C73E5A",
    keywords: ["献身", "感受性", "寄り添い"],
    description: "深い献身性と繊細な感受性を持ち、傷ついた人にそっと寄り添う優しいタイプです。" },

  // ========== ネコ (Cat) — 好奇心旺盛な個人主義者 ==========
  { code: "CAT-JH", animal: "ネコ", emoji: "🐱", title: "金のネコ", color: "#D4A017",
    keywords: ["気品", "美学", "完璧主義"],
    description: "高い美意識と完璧主義を持つ洗練されたタイプ。自分の世界観を大切にし、妥協しない強さがあります。" },
  { code: "CAT-JL", animal: "ネコ", emoji: "🐱", title: "銀のネコ", color: "#8A9BA8",
    keywords: ["静寂", "観察", "自立"],
    description: "静かに世界を観察し、自分のペースで生きる自立したタイプ。冷静な判断力と独自の世界観を持ちます。" },
  { code: "CAT-PH", animal: "ネコ", emoji: "🐱", title: "翠のネコ", color: "#2EAD6B",
    keywords: ["気まぐれ", "好奇心", "自由"],
    description: "好奇心のままに動く自由な冒険家。束縛を嫌い、様々な体験から独自の世界を広げます。" },
  { code: "CAT-PL", animal: "ネコ", emoji: "🐱", title: "紅のネコ", color: "#C73E5A",
    keywords: ["ミステリアス", "深層", "直感"],
    description: "謎めいた魅力と深い直感力を持つタイプ。内面の世界が豊かで、芸術的な感性に溢れています。" },

  // ========== フクロウ (Owl) — 知恵ある賢者 ==========
  { code: "OWL-JH", animal: "フクロウ", emoji: "🦉", title: "金のフクロウ", color: "#D4A017",
    keywords: ["賢者", "計画", "知性"],
    description: "深い知性と計画力を持つ賢者タイプ。知識を行動に変え、周囲に的確なアドバイスを与えます。" },
  { code: "OWL-JL", animal: "フクロウ", emoji: "🦉", title: "銀のフクロウ", color: "#8A9BA8",
    keywords: ["静かな知恵", "分析", "慎重"],
    description: "静かに物事を見極める慎重な分析家。表に出ないが、その知恵でチームの意思決定を支えます。" },
  { code: "OWL-PH", animal: "フクロウ", emoji: "🦉", title: "翠のフクロウ", color: "#2EAD6B",
    keywords: ["知的好奇心", "発見", "革新"],
    description: "旺盛な知的好奇心で新しい知識を次々と吸収する革新的な知性。学びを楽しみ、発見を分かち合います。" },
  { code: "OWL-PL", animal: "フクロウ", emoji: "🦉", title: "紅のフクロウ", color: "#C73E5A",
    keywords: ["洞察", "神秘", "深淵"],
    description: "深い洞察力で人間の本質を見抜く神秘的な存在。哲学的な問いを大切にし、真理を追求します。" },

  // ========== ウサギ (Rabbit) — 繊細な感受性の持ち主 ==========
  { code: "RAB-JH", animal: "ウサギ", emoji: "🐰", title: "金のウサギ", color: "#D4A017",
    keywords: ["繊細な強さ", "献身", "忍耐"],
    description: "繊細さの中に強い忍耐力を秘めたタイプ。優しさと責任感で、周囲を静かに支えます。" },
  { code: "RAB-JL", animal: "ウサギ", emoji: "🐰", title: "銀のウサギ", color: "#8A9BA8",
    keywords: ["穏やか", "共感", "安心"],
    description: "穏やかな佇まいで周囲に安心感を与えるタイプ。共感力が高く、人の心の機微に自然と気づけます。" },
  { code: "RAB-PH", animal: "ウサギ", emoji: "🐰", title: "翠のウサギ", color: "#2EAD6B",
    keywords: ["天真爛漫", "感性", "純粋"],
    description: "純粋で天真爛漫な感性の持ち主。繊細ながらも好奇心旺盛で、新しい体験に胸を躍らせます。" },
  { code: "RAB-PL", animal: "ウサギ", emoji: "🐰", title: "紅のウサギ", color: "#C73E5A",
    keywords: ["儚さ", "芸術", "深い感情"],
    description: "深い感情と芸術的な感性を持つ繊細なタイプ。その感受性は、他者には見えない世界を映し出します。" },

  // ========== オオカミ (Wolf) — 戦略的な一匹狼 ==========
  { code: "WOL-JH", animal: "オオカミ", emoji: "🐺", title: "金のオオカミ", color: "#D4A017",
    keywords: ["戦略家", "独立", "意志"],
    description: "強い意志と戦略的思考を持つ独立した実行者。自分の道を切り拓き、確実に目標を達成します。" },
  { code: "WOL-JL", animal: "オオカミ", emoji: "🐺", title: "銀のオオカミ", color: "#8A9BA8",
    keywords: ["孤高", "冷静", "観察"],
    description: "冷静に状況を見極め、必要な時に的確に動く孤高の存在。無駄のない生き方に美学があります。" },
  { code: "WOL-PH", animal: "オオカミ", emoji: "🐺", title: "翠のオオカミ", color: "#2EAD6B",
    keywords: ["放浪", "自由", "野生"],
    description: "束縛を嫌い、自分の本能に従って生きる野生的な自由人。未知の世界を恐れず探索します。" },
  { code: "WOL-PL", animal: "オオカミ", emoji: "🐺", title: "紅のオオカミ", color: "#C73E5A",
    keywords: ["影の番人", "深謀", "直感"],
    description: "深い直感と鋭い洞察力を持つ影の番人。静かに状況を読み、決定的な場面で力を発揮します。" }
];

/**
 * スコアから動物タイプを判定
 */
function determineAnimal(bigfive, sensitivity) {
  var bf = bigfive.scores;
  var E = bf.extraversion;
  var A = bf.agreeableness;
  var O = bf.openness;
  var C = bf.conscientiousness;
  var S = bf.stability;
  var sens = sensitivity.overall;

  // 各動物への親和度スコアを計算
  var scores = {
    dolphin:  E * 0.35 + A * 0.35 + O * 0.15 + S * 0.15,
    lion:     E * 0.35 + S * 0.30 + C * 0.15 + (100 - A) * 0.20,
    eagle:    O * 0.30 + (100 - A) * 0.25 + S * 0.25 + (100 - E) * 0.20,
    dog:      C * 0.30 + A * 0.30 + S * 0.20 + (100 - O) * 0.20,
    cat:      (100 - E) * 0.30 + O * 0.25 + (100 - A) * 0.25 + (100 - C) * 0.20,
    owl:      O * 0.30 + C * 0.25 + (100 - E) * 0.25 + S * 0.20,
    rabbit:   A * 0.30 + sens * 0.25 + (100 - S) * 0.25 + (100 - E) * 0.20,
    wolf:     (100 - E) * 0.30 + (100 - A) * 0.30 + S * 0.20 + C * 0.20
  };

  // 最高スコアの動物を選択
  var best = "dolphin";
  var bestScore = -1;
  for (var key in scores) {
    if (scores[key] > bestScore) {
      bestScore = scores[key];
      best = key;
    }
  }
  return best;
}

/**
 * スコアからオーラ色を判定
 */
function determineAura(bigfive, egogram) {
  var C = bigfive.scores.conscientiousness;
  var E = bigfive.scores.extraversion;
  var FC = egogram.scores.fc;

  // J/P判定: 誠実性ベース
  var isJ = C >= 50;

  // H/L判定: 外向性 + FC (自由な子ども) の平均
  var energyScore = (E + FC) / 2;
  var isH = energyScore >= 50;

  if (isJ && isH) return "JH";
  if (isJ && !isH) return "JL";
  if (!isJ && isH) return "PH";
  return "PL";
}

/**
 * 動物キー + オーラコード → PERSONALITY_TYPES のエントリを取得
 */
function getPersonalityType(animalKey, auraCode) {
  var codeMap = {
    dolphin: "DOL", lion: "LIO", eagle: "EAG", dog: "DOG",
    cat: "CAT", owl: "OWL", rabbit: "RAB", wolf: "WOL"
  };
  var typeCode = codeMap[animalKey] + "-" + auraCode;

  for (var i = 0; i < PERSONALITY_TYPES.length; i++) {
    if (PERSONALITY_TYPES[i].code === typeCode) {
      return PERSONALITY_TYPES[i];
    }
  }
  return PERSONALITY_TYPES[0]; // フォールバック
}
