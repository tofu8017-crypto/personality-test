/**
 * 総合パーソナリティ診断 - 分析エンジン
 *
 * 各理論のスコアリング、タイプ判定、総合アドバイス生成
 */

const AnalysisEngine = {

  /**
   * 全回答からスコアを計算
   * @param {Object} answers - { questionId: score(1-5) }
   * @returns {Object} 全分析結果
   */
  analyze(answers) {
    const bigfive = this.scoreBigFive(answers);
    const riasec = this.scoreRIASEC(answers);
    const strengths = this.scoreStrengths(answers);
    const attachment = this.scoreAttachment(answers);
    const sensitivity = this.scoreSensitivity(answers);
    const egogram = this.scoreEgogram(answers);

    return {
      bigfive,
      riasec,
      strengths,
      attachment,
      sensitivity,
      egogram,
      career: this.generateCareerAdvice(bigfive, riasec, strengths, egogram),
      relationship: this.generateRelationshipAdvice(bigfive, attachment, sensitivity),
      stress: this.generateStressAdvice(bigfive, sensitivity, attachment),
      summary: this.generateSummary(bigfive, riasec, strengths, attachment, sensitivity, egogram)
    };
  },

  // ==========================================================
  // Big Five スコアリング
  // ==========================================================
  scoreBigFive(answers) {
    const traits = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"];
    const scores = {};

    for (const trait of traits) {
      const qs = QUESTIONS.filter(q => q.section === "bigfive" && q.trait === trait);
      let total = 0;
      for (const q of qs) {
        let val = answers[q.id] || 3;
        if (q.reverse) val = 6 - val;
        total += val;
      }
      // 3問の合計(3-15)を0-100に正規化
      scores[trait] = Math.round(((total - 3) / 12) * 100);
    }

    // 情緒安定性 = 100 - 神経症的傾向
    scores.stability = 100 - scores.neuroticism;

    return {
      scores,
      dominant: this.getTopTraits(scores, ["openness", "conscientiousness", "extraversion", "agreeableness", "stability"], 2),
      labels: {
        openness: "開放性",
        conscientiousness: "誠実性",
        extraversion: "外向性",
        agreeableness: "協調性",
        stability: "情緒安定性"
      },
      descriptions: this.getBigFiveDescriptions(scores)
    };
  },

  getBigFiveDescriptions(scores) {
    const desc = {};

    // 開放性
    if (scores.openness >= 70) {
      desc.openness = "新しい経験や発想に対して非常にオープンです。好奇心旺盛で、芸術や抽象的な概念にも関心が高い傾向があります。";
    } else if (scores.openness >= 40) {
      desc.openness = "新しいことへの好奇心と、慣れ親しんだ方法の安心感をバランスよく持っています。";
    } else {
      desc.openness = "実践的で地に足がついた考え方を好みます。確立された方法や具体的なアプローチを重視する傾向があります。";
    }

    // 誠実性
    if (scores.conscientiousness >= 70) {
      desc.conscientiousness = "計画的で責任感が強く、目標に向かって着実に進む力があります。自己管理能力が高い傾向です。";
    } else if (scores.conscientiousness >= 40) {
      desc.conscientiousness = "必要に応じて計画的にも柔軟にも動ける適応力を持っています。";
    } else {
      desc.conscientiousness = "柔軟で即興的な対応が得意です。型にはまらない自由なスタイルを好む傾向があります。";
    }

    // 外向性
    if (scores.extraversion >= 70) {
      desc.extraversion = "社交的でエネルギッシュ。人と関わることからエネルギーを得るタイプです。";
    } else if (scores.extraversion >= 40) {
      desc.extraversion = "状況に応じて社交的にも一人の時間も楽しめる、バランスの取れた性格です。";
    } else {
      desc.extraversion = "内省的で、少人数の深い関係を好みます。一人の時間で充電するタイプです。";
    }

    // 協調性
    if (scores.agreeableness >= 70) {
      desc.agreeableness = "思いやりがあり、周囲との調和を大切にします。協力的で、人の気持ちに寄り添える力があります。";
    } else if (scores.agreeableness >= 40) {
      desc.agreeableness = "協力と自己主張のバランスが取れています。場面に応じて柔軟に対応できます。";
    } else {
      desc.agreeableness = "独立心が強く、自分の信念に基づいて行動します。競争的な場面で力を発揮しやすいタイプです。";
    }

    // 情緒安定性
    if (scores.stability >= 70) {
      desc.stability = "感情的に安定しており、ストレスへの耐性が高いです。冷静な判断力を維持しやすい傾向があります。";
    } else if (scores.stability >= 40) {
      desc.stability = "感情の波は普通程度で、日常的なストレスには十分対処できます。";
    } else {
      desc.stability = "感受性が豊かで、繊細な面があります。その分、深い共感力や気づきの力を持っています。";
    }

    return desc;
  },

  // ==========================================================
  // RIASEC スコアリング
  // ==========================================================
  scoreRIASEC(answers) {
    const types = ["realistic", "investigative", "artistic", "social", "enterprising", "conventional"];
    const scores = {};

    for (const type of types) {
      const qs = QUESTIONS.filter(q => q.section === "riasec" && q.trait === type);
      let total = 0;
      for (const q of qs) {
        total += answers[q.id] || 3;
      }
      // 2問の合計(2-10)を0-100に正規化
      scores[type] = Math.round(((total - 2) / 8) * 100);
    }

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const topCode = sorted.slice(0, 3).map(([k]) => k[0].toUpperCase()).join("");

    return {
      scores,
      hollandCode: topCode,
      top3: sorted.slice(0, 3).map(([k, v]) => ({ type: k, score: v })),
      labels: {
        realistic: "現実型",
        investigative: "研究型",
        artistic: "芸術型",
        social: "社会型",
        enterprising: "企業型",
        conventional: "慣習型"
      },
      descriptions: {
        realistic: "手を動かし、具体的なモノを扱う仕事",
        investigative: "調査・分析し、知識を深める仕事",
        artistic: "創造性を発揮し、自由に表現する仕事",
        social: "人を助け、教え、支援する仕事",
        enterprising: "人を導き、組織を動かす仕事",
        conventional: "データを整理し、正確に管理する仕事"
      },
      careers: this.suggestCareers(sorted.slice(0, 2).map(([k]) => k))
    };
  },

  suggestCareers(topTypes) {
    const careerMap = {
      "realistic,investigative": ["機械エンジニア", "ソフトウェア開発者", "建築士", "技術研究者", "電気技師", "ロボット開発者", "環境工学技術者", "航空整備士"],
      "realistic,artistic": ["インテリアデザイナー", "工芸作家", "ゲームデザイナー", "映像クリエイター", "フラワーアレンジメント", "家具職人", "舞台美術", "造園デザイナー"],
      "realistic,social": ["理学療法士", "看護師", "スポーツトレーナー", "消防士", "救急救命士", "作業療法士", "介護福祉士", "動物看護師"],
      "realistic,enterprising": ["施工管理者", "農業経営者", "製造業マネージャー", "パイロット", "不動産デベロッパー", "自動車ディーラー", "建設会社経営", "物流管理者"],
      "realistic,conventional": ["品質管理", "測量士", "機械整備士", "システム管理者", "製図技術者", "検査技師", "設備管理", "生産管理"],
      "investigative,artistic": ["UXデザイナー", "サイエンスライター", "研究者", "データビジュアライゼーション", "建築デザイナー", "サウンドエンジニア", "テクニカルライター", "博物館学芸員"],
      "investigative,social": ["臨床心理士", "医師", "教育研究者", "カウンセラー", "言語聴覚士", "栄養士", "公衆衛生専門家", "スクールカウンセラー"],
      "investigative,enterprising": ["経営コンサルタント", "データサイエンティスト", "起業家", "戦略アナリスト", "マーケティングリサーチャー", "投資アナリスト", "新規事業開発", "技術営業"],
      "investigative,conventional": ["会計士", "プログラマー", "統計学者", "薬剤師", "システムエンジニア", "特許調査員", "臨床検査技師", "情報セキュリティ"],
      "artistic,social": ["美術・音楽教師", "アートセラピスト", "コミュニティデザイナー", "ライター", "音楽療法士", "ヨガ・ピラティスインストラクター", "絵本作家", "ワークショップファシリテーター"],
      "artistic,enterprising": ["広告クリエイター", "プロデューサー", "ブランドマネージャー", "フリーランスデザイナー", "映画監督", "ファッションデザイナー", "YouTuber/クリエイター", "イベントプロデューサー"],
      "artistic,conventional": ["グラフィックデザイナー", "編集者", "Webデザイナー", "翻訳家", "DTPオペレーター", "校正者", "テクニカルイラストレーター", "フォトレタッチャー"],
      "social,enterprising": ["人事マネージャー", "営業リーダー", "教育管理者", "イベントプランナー", "採用コンサルタント", "研修講師", "NPO/NGO運営", "コーチング"],
      "social,conventional": ["事務職", "社会福祉士", "図書館司書", "医療事務", "保育士", "行政書士", "ケアマネージャー", "受付・秘書"],
      "enterprising,conventional": ["経営者", "プロジェクトマネージャー", "銀行員", "不動産業", "税理士", "ファイナンシャルプランナー", "店舗マネージャー", "営業企画"],
    };

    // 同タイプの組み合わせ
    const sameTypeMap = {
      "realistic,realistic": ["職人", "自動車整備士", "土木技術者", "電気工事士", "農業従事者", "料理人", "大工"],
      "investigative,investigative": ["研究者", "大学教授", "データアナリスト", "AIエンジニア", "医学研究者", "考古学者", "天文学者"],
      "artistic,artistic": ["画家", "音楽家", "小説家", "俳優", "写真家", "アニメーター", "振付師"],
      "social,social": ["教師", "保育士", "ソーシャルワーカー", "看護師", "カウンセラー", "介護士", "NPOスタッフ"],
      "enterprising,enterprising": ["起業家", "CEO", "政治家", "弁護士", "プロデューサー", "外交官", "ベンチャーキャピタリスト"],
      "conventional,conventional": ["公務員", "経理", "総務", "システム運用", "銀行窓口", "データ入力", "法務事務"],
    };

    const key1 = topTypes.join(",");
    const key2 = [...topTypes].reverse().join(",");
    return careerMap[key1] || careerMap[key2] || sameTypeMap[key1] || sameTypeMap[key2] || ["幅広い分野で活躍できるポテンシャルがあります"];
  },

  // ==========================================================
  // 強み分析スコアリング
  // ==========================================================
  scoreStrengths(answers) {
    const virtues = ["wisdom", "courage", "humanity", "justice", "temperance", "transcendence"];
    const scores = {};

    for (const v of virtues) {
      const qs = QUESTIONS.filter(q => q.section === "strengths" && q.trait === v);
      let total = 0;
      for (const q of qs) {
        total += answers[q.id] || 3;
      }
      scores[v] = Math.round(((total - 2) / 8) * 100);
    }

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    return {
      scores,
      top3: sorted.slice(0, 3).map(([k, v]) => ({ virtue: k, score: v })),
      labels: {
        wisdom: "知恵",
        courage: "勇気",
        humanity: "人間性",
        justice: "正義感",
        temperance: "節制",
        transcendence: "超越性"
      },
      descriptions: {
        wisdom: "知識を活かし、広い視野で判断する力",
        courage: "困難に立ち向かい、信念を貫く力",
        humanity: "他者への思いやりと深い共感力",
        justice: "公平さとチーム貢献への意識",
        temperance: "自己制御と謙虚さ",
        transcendence: "感謝・希望・美的感覚"
      }
    };
  },

  // ==========================================================
  // 愛着スタイルスコアリング
  // ==========================================================
  scoreAttachment(answers) {
    const styles = ["secure", "anxious", "avoidant", "disorganized"];
    const scores = {};

    for (const s of styles) {
      const qs = QUESTIONS.filter(q => q.section === "attachment" && q.trait === s);
      let total = 0;
      for (const q of qs) {
        total += answers[q.id] || 3;
      }
      scores[s] = Math.round(((total - 3) / 12) * 100);
    }

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const dominant = sorted[0][0];

    return {
      scores,
      dominant,
      labels: {
        secure: "安定型",
        anxious: "不安型",
        avoidant: "回避型",
        disorganized: "混乱型"
      },
      descriptions: {
        secure: "人間関係に安心感を持ち、信頼と自立のバランスが取れています。親しい人に素直に頼ることができ、相手の自由も尊重できます。",
        anxious: "深い絆を求め、相手の反応に敏感です。愛情深い反面、相手の気持ちを確認したくなる傾向があります。自分の魅力や価値に気づくことが成長のカギです。",
        avoidant: "自立心が強く、自分の空間を大切にします。感情を内に秘める傾向がありますが、その分冷静で頼りがいのある存在です。少しずつ心を開くことで関係がより豊かになります。",
        disorganized: "親密さへの欲求と警戒心が共存しています。過去の経験が影響していることが多く、自分のパターンに気づくことが変化の第一歩です。安心できる関係を少しずつ築いていけます。"
      },
      advice: this.getAttachmentAdvice(dominant, scores)
    };
  },

  getAttachmentAdvice(dominant, scores) {
    const advice = {
      secure: [
        "あなたの安定した関係構築力は、周囲の人にとっても安心感の源です",
        "パートナーや友人が不安を感じた時、あなたの落ち着きが大きな支えになります",
        "この強みを活かして、周囲の人間関係の架け橋になることもできます"
      ],
      anxious: [
        "不安を感じた時は、事実と感情を分けて考える習慣をつけてみましょう",
        "「返事がない＝嫌われた」ではなく、相手にも事情があることを思い出して",
        "自分の趣味や目標に集中する時間を作ると、心の安定につながります"
      ],
      avoidant: [
        "信頼できる人に少しずつ自分の気持ちを伝える練習をしてみましょう",
        "「弱さを見せる＝負け」ではなく、「強さの表れ」と捉え直してみて",
        "一人の時間も大切にしながら、心地よい距離感を探ってみましょう"
      ],
      disorganized: [
        "関係のパターンに気づくだけでも大きな進歩です",
        "安心できる人との小さな成功体験を積み重ねていきましょう",
        "必要であれば、専門家のサポートを受けることも強さの証です"
      ]
    };
    return advice[dominant] || advice.secure;
  },

  // ==========================================================
  // 感受性スコアリング
  // ==========================================================
  scoreSensitivity(answers) {
    const dimensions = ["sensory", "emotional", "depth"];
    const scores = {};

    for (const d of dimensions) {
      const qs = QUESTIONS.filter(q => q.section === "sensitivity" && q.trait === d);
      let total = 0;
      for (const q of qs) {
        total += answers[q.id] || 3;
      }
      scores[d] = Math.round(((total - 3) / 12) * 100);
    }

    // 総合感受性スコア
    const overall = Math.round((scores.sensory + scores.emotional + scores.depth) / 3);

    let level, description;
    if (overall >= 70) {
      level = "高感受性";
      description = "環境からの刺激を深く処理する傾向があります。これは豊かな内面世界と高い共感力の源ですが、過剰な刺激への対策も大切です。";
    } else if (overall >= 40) {
      level = "中程度";
      description = "適度な感受性を持ち、状況に応じて柔軟に反応できます。繊細さと逞しさのバランスが取れています。";
    } else {
      level = "低感受性";
      description = "刺激に対して強い耐性を持っています。ストレスフルな環境でも安定したパフォーマンスを発揮しやすいタイプです。";
    }

    return {
      scores,
      overall,
      level,
      description,
      labels: {
        sensory: "感覚の敏感さ",
        emotional: "情緒の反応性",
        depth: "処理の深さ"
      },
      tips: this.getSensitivityTips(overall, scores)
    };
  },

  getSensitivityTips(overall, scores) {
    const tips = [];

    if (overall >= 60) {
      tips.push("一日の中に「刺激のない静かな時間」を意識的に作りましょう");
      tips.push("自然の中で過ごす時間が、心身のリセットに効果的です");
    }
    if (scores.sensory >= 60) {
      tips.push("ノイズキャンセリングイヤホンや照明の調整など、環境を整えることが有効です");
    }
    if (scores.emotional >= 60) {
      tips.push("他者の感情と自分の感情を区別する練習（感情日記など）が役立ちます");
    }
    if (scores.depth >= 60) {
      tips.push("決断に時間がかかるのは「慎重」の証。自分のペースを大切にしましょう");
    }
    if (overall < 40) {
      tips.push("あなたの強い精神力は、チームの安定に大きく貢献します");
      tips.push("繊細な人の気持ちを理解するために、意識的に相手の視点に立ってみましょう");
    }

    return tips.length > 0 ? tips : ["あなたの感受性は、日常生活に良いバランスをもたらしています"];
  },

  // ==========================================================
  // エゴグラムスコアリング（交流分析）
  // ==========================================================
  scoreEgogram(answers) {
    const states = ["cp", "np", "a", "fc", "ac"];
    const scores = {};

    for (const s of states) {
      const qs = QUESTIONS.filter(q => q.section === "egogram" && q.trait === s);
      let total = 0;
      for (const q of qs) {
        total += answers[q.id] || 3;
      }
      // 2問の合計(2-10)を0-100に正規化
      scores[s] = Math.round(((total - 2) / 8) * 100);
    }

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const dominant = sorted[0][0];
    const pattern = this.getEgogramPattern(scores);

    return {
      scores,
      dominant,
      pattern,
      labels: {
        cp: "CP（厳格な親）",
        np: "NP（養育的な親）",
        a: "A（大人）",
        fc: "FC（自由な子ども）",
        ac: "AC（順応した子ども）"
      },
      shortLabels: { cp: "CP", np: "NP", a: "A", fc: "FC", ac: "AC" },
      descriptions: {
        cp: "ルールや正義感を重んじ、責任感が強い面です。リーダーシップや指導力の源になりますが、強すぎると批判的になることも。",
        np: "思いやりがあり、人の面倒を見るのが得意な面です。周囲から慕われやすく、支援やケアの仕事で力を発揮します。",
        a: "事実に基づいて冷静に判断する面です。論理的思考力が高く、分析や問題解決に優れています。",
        fc: "天真爛漫で直感的な面です。創造性やユーモアの源であり、新しいアイデアを生み出す力があります。",
        ac: "協調性が高く、場の空気を読む面です。チームワークを大切にしますが、自分を抑えすぎるとストレスの原因にも。"
      },
      advice: this.getEgogramAdvice(scores, dominant)
    };
  },

  getEgogramPattern(scores) {
    // エゴグラムのパターン分類（山型・谷型・平坦型など）
    const vals = [scores.cp, scores.np, scores.a, scores.fc, scores.ac];
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const range = max - min;

    if (range <= 15) return { name: "平坦型", description: "5つの自我状態がバランスよく発達しています。柔軟に対応できる反面、特徴が出にくいことも。" };

    // 逆N型（NP高い・CP低い・FC高い）
    if (scores.np >= 60 && scores.fc >= 60 && scores.cp <= 40) {
      return { name: "逆N型", description: "優しさと自由さを兼ね備えた、のびのびとしたタイプです。" };
    }
    // N型（CP高い・NP低い・AC高い）
    if (scores.cp >= 60 && scores.ac >= 60 && scores.np <= 40) {
      return { name: "N型", description: "責任感と協調性が高い一方、自分に厳しく我慢しがちな面があります。" };
    }
    // 山型（中央のAが高い）
    if (scores.a >= 60 && scores.a >= scores.cp && scores.a >= scores.ac) {
      return { name: "A優位型", description: "理性的で客観的な判断力に優れたタイプです。" };
    }
    // NP優位
    if (scores.np === max) {
      return { name: "NP優位型", description: "面倒見がよく、周囲から頼りにされる母性的なタイプです。" };
    }
    // CP優位
    if (scores.cp === max) {
      return { name: "CP優位型", description: "リーダーシップが強く、規律を重んじる父性的なタイプです。" };
    }
    // FC優位
    if (scores.fc === max) {
      return { name: "FC優位型", description: "自由で創造的、天真爛漫なタイプです。" };
    }
    // AC優位
    if (scores.ac === max) {
      return { name: "AC優位型", description: "協調性が高く、周囲に気を配るタイプです。自分の気持ちも大切にしましょう。" };
    }
    return { name: "混合型", description: "複数の自我状態が強く、場面に応じて使い分けられるタイプです。" };
  },

  getEgogramAdvice(scores, dominant) {
    const advice = [];

    // 高いものを伸ばすアドバイス
    if (scores.np >= 60) advice.push("あなたのNP（養育的な親）の高さは、人間関係を豊かにする大きな強みです。");
    if (scores.a >= 60) advice.push("冷静な判断力（A）は、複雑な問題を解決する際に頼りになります。");
    if (scores.fc >= 60) advice.push("自由な発想（FC）を活かして、創造的な場面で力を発揮できます。");

    // バランスのアドバイス
    if (scores.cp >= 70 && scores.np <= 30) {
      advice.push("厳しさの中にも「相手の事情を聴く」余白を持つと、より信頼される存在になれます。");
    }
    if (scores.ac >= 70 && scores.fc <= 30) {
      advice.push("たまには自分のやりたいことを優先してみましょう。FCを少し解放すると気持ちが軽くなります。");
    }
    if (scores.np >= 70 && scores.a <= 30) {
      advice.push("感情だけでなく、時には冷静な視点（A）も取り入れると判断の精度が上がります。");
    }

    if (advice.length === 0) {
      advice.push("バランスの取れたエゴグラムです。状況に応じて自我状態を切り替えられる柔軟性があります。");
    }

    return advice;
  },

  // ==========================================================
  // 総合アドバイス生成
  // ==========================================================
  generateCareerAdvice(bigfive, riasec, strengths, egogram) {
    const advice = [];
    const topRiasec = riasec.top3[0].type;
    const topStrength = strengths.top3[0].virtue;

    // RIASEC上位とBig Fiveの組み合わせ
    if (topRiasec === "social" && bigfive.scores.agreeableness >= 60) {
      advice.push("対人支援の分野であなたの力が最も発揮されます。教育、医療、カウンセリングなどが向いています。");
    }
    if (topRiasec === "investigative" && bigfive.scores.openness >= 60) {
      advice.push("探求心と知的好奇心を活かせる研究・分析の分野が適しています。");
    }
    if (topRiasec === "artistic" && bigfive.scores.openness >= 60) {
      advice.push("創造性を存分に発揮できる環境で輝くタイプです。デザイン、コンテンツ制作、アートの分野が向いています。");
    }
    if (topRiasec === "enterprising" && bigfive.scores.extraversion >= 60) {
      advice.push("リーダーシップと行動力を活かし、人を巻き込む仕事で力を発揮します。");
    }
    if (topRiasec === "realistic" && bigfive.scores.conscientiousness >= 60) {
      advice.push("実直で着実な仕事ぶりが評価されます。技術職や専門職が向いています。");
    }
    if (topRiasec === "conventional" && bigfive.scores.conscientiousness >= 60) {
      advice.push("正確さと確実さが求められる業務で真価を発揮します。管理・事務・経理の分野が適しています。");
    }

    // エゴグラムとの組み合わせ
    if (egogram && egogram.scores) {
      if (egogram.scores.np >= 60 && topRiasec === "social") {
        advice.push("NP（養育的な親）の高さは、福祉・教育・医療分野で大きな強みになります。人を育てる仕事に天職の素質があります。");
      }
      if (egogram.scores.cp >= 60 && topRiasec === "enterprising") {
        advice.push("CP（厳格な親）のリーダーシップと企業型の適性が合わさり、管理職や経営者として力を発揮できます。");
      }
      if (egogram.scores.a >= 60) {
        advice.push("A（大人）の冷静な分析力は、コンサルティング、データ分析、戦略立案などで重宝されます。");
      }
      if (egogram.scores.fc >= 60 && topRiasec === "artistic") {
        advice.push("FC（自由な子ども）の発想力と芸術型の適性が、クリエイティブ業界で独自のポジションを築けます。");
      }
    }

    // 強みとの組み合わせ
    if (topStrength === "wisdom") {
      advice.push("知恵を活かして、判断力が必要な場面で頼られる存在になれます。");
    }
    if (topStrength === "humanity") {
      advice.push("高い共感力は、チームワークや顧客対応において大きな武器です。");
    }
    if (topStrength === "courage") {
      advice.push("挑戦を恐れない姿勢が、新しいプロジェクトの推進役として適しています。");
    }

    if (advice.length === 0) {
      advice.push("あなたは多面的な能力をバランスよく持っており、幅広い分野で活躍できるポテンシャルがあります。");
    }

    return {
      careers: riasec.careers,
      advice,
      workStyle: this.getWorkStyle(bigfive, riasec)
    };
  },

  getWorkStyle(bigfive, riasec) {
    const styles = [];
    if (bigfive.scores.extraversion >= 60) {
      styles.push("チームでの協働・ディスカッションが多い環境");
    } else if (bigfive.scores.extraversion <= 40) {
      styles.push("集中して取り組める静かな環境");
    }
    if (bigfive.scores.openness >= 60) {
      styles.push("変化があり、新しいチャレンジがある仕事");
    }
    if (bigfive.scores.conscientiousness >= 60) {
      styles.push("明確な目標と計画がある組織");
    } else if (bigfive.scores.conscientiousness <= 40) {
      styles.push("柔軟で裁量の大きい環境");
    }
    return styles.length > 0 ? styles : ["あなたに合った環境を柔軟に選べるタイプです"];
  },

  generateRelationshipAdvice(bigfive, attachment, sensitivity) {
    const advice = [];
    const style = attachment.dominant;

    // 基本的な関係性パターン
    advice.push(attachment.descriptions[style]);

    // Big Fiveとの組み合わせ
    if (bigfive.scores.agreeableness >= 70 && style === "anxious") {
      advice.push("協調性が高い分、自分の気持ちを後回しにしがちです。「No」と言う練習も大切です。");
    }
    if (bigfive.scores.extraversion <= 30 && style === "avoidant") {
      advice.push("一人の時間を大切にするのは自然なことです。ただ、信頼できる人との時間も少しずつ増やしてみましょう。");
    }

    // 感受性との組み合わせ
    if (sensitivity.overall >= 60) {
      advice.push("感受性が高いため、相手の気持ちに敏感に気づけます。ただし、相手の感情を背負いすぎないことも大切です。");
    }

    return { style: attachment.labels[style], advice };
  },

  generateStressAdvice(bigfive, sensitivity, attachment) {
    const stressFactors = [];
    const copingStrategies = [];

    // ストレス要因の特定
    if (bigfive.scores.neuroticism >= 60) {
      stressFactors.push("不確実な状況や予期しない変化");
    }
    if (sensitivity.overall >= 60) {
      stressFactors.push("過剰な感覚刺激（騒音、人混みなど）");
    }
    if (attachment.scores.anxious >= 60) {
      stressFactors.push("人間関係の曖昧さや距離感の変化");
    }
    if (bigfive.scores.conscientiousness >= 70) {
      stressFactors.push("計画通りに進まない状況");
    }
    if (bigfive.scores.agreeableness >= 70) {
      stressFactors.push("対立や衝突がある場面");
    }

    if (stressFactors.length === 0) {
      stressFactors.push("特定のストレス要因は目立ちませんが、蓄積には注意が必要です");
    }

    // コーピング戦略の提案
    if (bigfive.scores.extraversion >= 60) {
      copingStrategies.push("信頼できる人に話を聞いてもらう");
    } else {
      copingStrategies.push("一人で静かに内省する時間を確保する");
    }
    if (bigfive.scores.openness >= 60) {
      copingStrategies.push("アート、音楽、自然など創造的な活動でリフレッシュ");
    }
    if (sensitivity.scores.sensory >= 60) {
      copingStrategies.push("刺激を減らす環境調整（静かな場所、やわらかい照明）");
    }
    copingStrategies.push("定期的な運動やマインドフルネスの実践");
    copingStrategies.push("「今日できたこと」を3つ書き出す習慣");

    // レジリエンス（回復力）評価
    let resilience;
    const resScore = (bigfive.scores.stability + bigfive.scores.conscientiousness + (100 - sensitivity.overall)) / 3;
    if (resScore >= 60) {
      resilience = { level: "高い", description: "ストレスからの立ち直りが早く、困難を成長の機会として捉えられるタイプです。" };
    } else if (resScore >= 40) {
      resilience = { level: "普通", description: "日常的なストレスには十分対処できますが、大きなストレスには意識的なケアが必要です。" };
    } else {
      resilience = { level: "要ケア", description: "繊細な感受性を持つ分、ストレスの影響を受けやすい傾向があります。セルフケアを最優先にしましょう。" };
    }

    return { stressFactors, copingStrategies, resilience };
  },

  generateSummary(bigfive, riasec, strengths, attachment, sensitivity, egogram) {
    const bf = bigfive.scores;
    const topRiasec = riasec.top3[0];
    const topStrength = strengths.top3[0];

    // パーソナリティタイプ名の生成
    const typeWords = [];

    if (bf.openness >= 60) typeWords.push("探究者");
    else typeWords.push("実践者");

    if (bf.extraversion >= 60) typeWords.push("社交的な");
    else typeWords.push("思慮深い");

    if (bf.agreeableness >= 60) typeWords.push("調和の");
    else typeWords.push("独立の");

    const typeName = typeWords.join("") + "タイプ";

    // 一言サマリー
    const summaryParts = [];
    summaryParts.push(`あなたは${bigfive.descriptions[bigfive.dominant[0]].split("。")[0]}。`);
    summaryParts.push(`${riasec.labels[topRiasec.type]}の適性が高く、${strengths.labels[topStrength.virtue]}が大きな強みです。`);

    if (sensitivity.overall >= 60) {
      summaryParts.push("繊細な感受性を武器に、他者の気持ちに寄り添える力を持っています。");
    }

    return {
      typeName,
      summary: summaryParts.join(""),
      keywords: this.generateKeywords(bigfive, riasec, strengths, attachment, sensitivity)
    };
  },

  generateKeywords(bigfive, riasec, strengths, attachment, sensitivity) {
    const keywords = [];
    const bf = bigfive.scores;

    if (bf.openness >= 60) keywords.push("好奇心旺盛");
    if (bf.conscientiousness >= 60) keywords.push("責任感が強い");
    if (bf.extraversion >= 60) keywords.push("社交的");
    if (bf.extraversion <= 30) keywords.push("内省的");
    if (bf.agreeableness >= 60) keywords.push("思いやり");
    if (bf.stability >= 60) keywords.push("冷静沈着");
    if (sensitivity.overall >= 60) keywords.push("高感受性");
    if (attachment.dominant === "secure") keywords.push("安定した絆");
    if (strengths.top3[0].score >= 70) keywords.push(strengths.labels[strengths.top3[0].virtue]);

    return keywords.slice(0, 5);
  },

  // ユーティリティ
  getTopTraits(scores, keys, n) {
    return keys.sort((a, b) => scores[b] - scores[a]).slice(0, n);
  }
};
