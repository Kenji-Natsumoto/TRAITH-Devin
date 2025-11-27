import { useState } from 'react'
import './App.css'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { PenTool, Lightbulb, Globe, TrendingUp, Plus, Save, Sparkles, Edit2, History, Trash2, CheckCircle2, SquarePen, Settings, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react'

interface AIEvaluationCriteria {
  id: number
  name: string
  score: number
  comment: string
}

interface AIEvaluationResult {
  overall_score: number
  overall_comment: string
  criteria: AIEvaluationCriteria[]
  suggested_mtp: string
}

interface MTPCandidate {
  id: number
  text: string
  createdAt: Date
  editCount: number
  checklist: boolean[]
  changeNote: string
}

interface Answers {
  passion: string
  competence: string
  feasibility: string
  need: string
}

const translations = {
  ja: {
    title: 'TRAITH',
    version: 'ベータ版 v1.5',
    subtitle: '組織の理念をMTPとAIで素早く正しく言語化',
    editMode: '編集モード',
    steps: ['MTPを知る', '4つの質問', 'MTP候補作成', 'チェックリスト', '完成'],
    step1Title: '今すぐ「TRAITH（トライス）」しましょう！',
    step1Subtitle: '【スタート】ボタンはこのページの最下部にあります。',
    step1Intro: 'このアプリでは、将来に耐えうる価値ある素晴らしいパーパスを再定義できます。MTPのナレッジをベースにしてステップバイステップで簡単に作成でき、専門のコンサルタントのようなAIの適切なアドバイスを得つつ正しく、素早く言語化できます。',
    step1Intro2: '作成したMTP（パーパス）は、何度も書き直しができ、最後にダウンロードできます。',
    mtpDefinitionTitle: 'MTPの定義',
    mtpDefinition: 'MTPとは「Massive Transformative Purpose」の略で、日本語では「野心的な変革目的」と訳されています。かつて成長前のGoogleやMeta、Uber、Airbnbなどの新興企業が、「世界に途方もない変化をもたらすゴール」として定めたもので、これらの会社が成長する強固な指針になった旗印です（下記にMTPの例として示すので参考にしてください）。',
    mtpDefinition2: 'シンギュラリティ大学の創設ディレクター：サリム・イスマイル氏が急成長した組織のメカニズムを研究し、体系化したフレームワーク「ExOスプリント」の中核概念です。',
    expectedEffectsTitle: 'MTP定義後の期待効果',
    expectedEffects: [
      '現代に通用し、かつ、この先20〜30年以上使える"パーパス"が言語化できる',
      '不確実性の高い現代に耐えうる堅牢な事業構想を計画・実行できるようになる',
      '経営層と現場社員との強固な共通情報基盤になる'
    ],
    differencesTitle: '他のものとの違い',
    differencesIntro: '「MTP」は従来のものとは全く次元が異なる概念です。比較してみるとその違いが分かります。',
    differences: {
      vision: { label: 'ビジョン：', text: '組織が達成したい変化ではなく「顧客との関係性を無視し企業が(勝手に)望んでいること」を表しているもの。' },
      mission: { label: 'ミッション：', text: '主に組織内に向けられた声明や取り組みを表しているもの。' },
      slogan: { label: 'スローガン：', text: 'プロダクトを宣伝するマーケティングスローガン、または事業を推進するための企業の能力を制限する声明や取り組みを表しているもの。' },
      goal: { label: '目標：', text: '期日や数量などの達成度が判断できる具体的な数値を組み込んだゴール。その数値に達しないと組織内外で数値の水増しやごまかしが起きる可能性を孕んでいるもの。' }
    },
    examples: [
      { company: 'Google', mtp: '「世界中の情報を整理する」' },
      { company: 'Tesla', mtp: '「世界の持続可能なエネルギーへの移行を加速する」' },
      { company: 'Starbucks', mtp: '「人間の精神を鼓舞し、育てる」' },
      { company: 'Singularity University', mtp: '「10億人にプラスの影響を」' }
    ],
    start: 'スタート',
    step2Title: '4つの質問（MTPの4つのレンズ）',
    step2Subtitle: 'この4つの質問は、『情熱・能力・対価・必要性』という4つの視点から、あなたの組織の"いきがい（Ikigai）"を言語化するためのものです。ここで書き出したキーワードが、次のステップ3でMTP文のたたき台として自動的に使われます。',
    step2Explanation: 'MTPは『世界にどんな大きな変化を起こすのか』を表す旗印です。このステップでは、何に情熱を感じるか、何が得意か、何で価値を生み報酬を得られるか、世界は何を必要としているか、の4つを整理し、その重なりからMTPのコアとなるテーマを見つけていきます。',
    questions: [
      { title: '1. 情熱：何に情熱を注いでいますか？', description: 'あなたが心から情熱を感じる分野やテーマを書き出してください', placeholder: '例：未来、人々、テクノロジー、サステナビリティ...', mtpRelation: 'MTPとの関係：あなたが心からワクワクできる対象が、MTPの"向かうべき未来"の方向性になります。' },
      { title: '2. 能力：何が得意ですか？', description: 'あなたの強みやスキルを書き出してください', placeholder: '例：創造性、コミュニケーション、シンプル化、傾聴...', mtpRelation: 'MTPとの関係：あなたが発揮できる強みが、MTPを現実にする"実行力"の源になります。' },
      { title: '3. 対価：何で報酬を得られますか？', description: 'あなたのスキルで経済的価値を生み出せる分野を書き出してください', placeholder: '例：トレーニング、コンサルティング、起業、リーダーシップ...', mtpRelation: 'MTPとの関係：どこで経済的価値を生み出せるかを明確にすることで、MTPが"空論"ではなく持続可能なものになります。' },
      { title: '4. 必要性：世界はあなたに何を必要としていますか？', description: '世界や社会があなたに求めているものを書き出してください', placeholder: '例：信頼性、ビジョン、実用性、一貫性...', mtpRelation: 'MTPとの関係：世界・社会・顧客が求めているものを捉えることで、MTPが"誰のための変革か"をはっきりさせます。' }
    ],
    passion: '情熱 / Passion',
    competence: '能力 / Competence',
    feasibility: '対価 / Feasibility',
    need: '必要性 / Need',
    notEntered: '未入力',
    entered: '入力済み',
    back: '戻る',
    next: '次へ',
    nextCreateMTP: '次へ（MTP候補を作る）',
    step3Title: 'MTP候補を作成',
    step3Subtitle: '4つの質問の答えを統合して、3〜5個のMTP候補を作成してください。後で編集や追加が可能です。',
    step3Hint: 'ヒント：既存の制約や過去の資産を無視し、最終的に成し遂げたいことをイメージしてください',
    candidateCount: '候補数',
    addCandidate: '新しい候補を追加',
    candidate: '候補',
    candidatePlaceholder: '例：「有益な豊かさの未来を創造する」\n\nMTPは短く、インスピレーショナルで、変革的であるべきです',
    changeNote: '変更メモ',
    changeNotePlaceholder: 'この変更の理由や経緯を記録...',
    initialVersion: '初版作成',
    saveChanges: '変更を保存',
    cancel: 'キャンセル',
    created: '作成',
    edited: '編集',
    times: '回',
    step4Title: 'MTチェックリスト',
    step4Subtitle: 'MTP候補が5〜7つの基準を満たしているか確認してください',
    selectCandidate: '評価する候補を選択',
    evaluatingMTP: '評価中のMTP',
    checklistItems: [
      '目的：組織の最も達成したいことを表現できていますか？',
      '世界の記述：そのMTPが実現したら、世界はどのように変わっているかが文章でわかりますか？',
      'シンプルさ：簡潔で分かりやすく、他に説明が不要ですか？',
      '高い意欲：そのMTPは壮大で大胆ですか？達成可能と思われるものをはるかに超えていますか？',
      '情熱的：そのMTPはあなたや組織の情熱が伝わる文章ですか？',
      'インスピレーション：そのMTPを知らない人と共有した時、組織に関わってくれるよう自信を持って促すことができますか？',
      '変革的：そのMTPが実現したら、世界は今よりより良く変わることができますか？',
      'グローバル：宇宙・地球的な範囲での可能性や実現を表していますか？',
      '豊かなつながり：そのMTPが実現したら、今までにない新しい価値や豊かさを創り出せますか？'
    ],
    achievementStatus: '達成状況',
    moreItemsNeeded: 'あと {count} 項目達成すると合格基準に達します。MTを見直してみましょう。',
    passedMessage: '素晴らしい！5項目以上達成しています。',
    step5Title: 'おめでとうございます！',
    step5Subtitle: 'MTP候補の作成とチェックが完了しました',
    step5Note: 'MTPは、一度創ったらそれで完成ではなく、絶えず洗練させていくものです。時代と共に研ぎ澄ましていきましょう。',
    yourMTPCandidates: 'あなたのMTP候補',
    fourFoundations: '4つの基盤',
    statistics: '統計',
    totalCandidates: '総候補数',
    passedCandidates: '合格候補',
    totalEdits: '総編集回数',
    backToEdit: '編集に戻る',
    download: 'ダウンロード',
    footer: '© 2025 SPRINT Japan Corp.',
    passionShort: '情熱',
    competenceShort: '能力',
    feasibilityShort: '対価',
    needShort: '必要性',
      mtpDirection: 'MTPの"向かうべき未来"',
      mtpExecution: 'MTPの"実行力"',
      mtpSustainability: 'MTPの"持続可能性"',
      mtpForWhom: 'MTPの"誰のため"',
      aiEvaluate: 'AI評価',
      aiEvaluating: 'AI評価中...',
      aiOverallScore: '総合スコア',
      aiOverallComment: '総合コメント',
      aiCriteriaScores: '基準別スコア',
      aiSuggestedMtp: 'AIの提案',
      aiApplySuggestion: 'この提案を反映',
      aiNoApiKey: 'APIキーが設定されていません',
      aiSetApiKey: 'APIキーを設定',
      aiApiKeyPlaceholder: 'OpenAI APIキーを入力...',
      aiApiKeySave: '保存',
      aiApiKeyCancel: 'キャンセル',
      aiApiKeyNote: 'APIキーはブラウザのローカルストレージに保存されます',
      aiError: 'AI評価中にエラーが発生しました',
      aiShowDetails: '詳細を表示',
      aiHideDetails: '詳細を隠す',
      aiCriteriaNames: ['目的', '世界の記述', 'シンプルさ', '高い意欲', '情熱的', 'インスピレーション', '変革的', 'グローバル', '豊かなつながり']
    },
    en: {
    title: 'TRAITH',
    version: 'Beta v1.5',
    subtitle: 'Quickly and Accurately Articulate Your Organization\'s Philosophy with MTP and AI',
    editMode: 'Edit Mode',
    steps: ['Learn MTP', '4 Questions', 'Create MTP', 'Checklist', 'Complete'],
    step1Title: 'Start "TRAITH" Now!',
    step1Subtitle: 'The [Start] button is at the bottom of this page.',
    step1Intro: 'With this app, you can redefine a valuable and wonderful purpose that will stand the test of time. Based on MTP knowledge, you can easily create it step by step, getting appropriate advice from AI like a professional consultant to articulate it correctly and quickly.',
    step1Intro2: 'The MTP (Purpose) you create can be rewritten many times and downloaded at the end.',
    mtpDefinitionTitle: 'Definition of MTP',
    mtpDefinition: 'MTP stands for "Massive Transformative Purpose". It was set as a "goal to bring tremendous change to the world" by emerging companies like Google, Meta, Uber, and Airbnb before their growth, and became a strong guiding flag for these companies\' growth.',
    mtpDefinition2: 'It is the core concept of the "ExO Sprint" framework, systematized by Salim Ismail, founding director of Singularity University.',
    expectedEffectsTitle: 'Expected Effects After MTP Definition',
    expectedEffects: [
      'You can articulate a "purpose" that works in modern times and can be used for the next 20-30+ years',
      'You can plan and execute robust business concepts that can withstand the highly uncertain modern era',
      'It becomes a strong common information foundation between management and field employees'
    ],
    differencesTitle: 'Differences from Others',
    differencesIntro: '"MTP" is a concept of a completely different dimension from conventional ones.',
    differences: {
      vision: { label: 'Vision:', text: 'Something that represents "what the company wants" ignoring the relationship with customers.' },
      mission: { label: 'Mission:', text: 'A statement or initiative mainly directed within the organization.' },
      slogan: { label: 'Slogan:', text: 'A marketing slogan to promote products.' },
      goal: { label: 'Goal:', text: 'A goal that incorporates specific numbers by which achievement can be judged.' }
    },
    examples: [
      { company: 'Google', mtp: '"Organize the world\'s information"' },
      { company: 'Tesla', mtp: '"Accelerate the world\'s transition to sustainable energy"' },
      { company: 'Starbucks', mtp: '"Inspire and nurture the human spirit"' },
      { company: 'Singularity University', mtp: '"Positively impact one billion people"' }
    ],
    start: 'Start',
    step2Title: '4 Questions (4 Lenses of MTP)',
    step2Subtitle: 'These 4 questions are designed to articulate your organization\'s "Ikigai" from 4 perspectives: Passion, Competence, Feasibility, and Need. The keywords you write here will automatically be used as the foundation for your MTP statement in the next step.',
    step2Explanation: 'MTP is a flag that represents "what big change you will bring to the world". In this step, we organize what you are passionate about, what you are good at, what you can be paid for, and what the world needs, and find the core theme of your MTP from their intersection.',
    questions: [
      { title: '1. Passion: What are you passionate about?', description: 'Write down the fields and themes you feel passionate about', placeholder: 'Example: Future, People, Technology, Sustainability...', mtpRelation: 'Relation to MTP: What excites you becomes the direction of the "future to aim for" in your MTP.' },
      { title: '2. Competence: What are you good at?', description: 'Write down your strengths and skills', placeholder: 'Example: Creativity, Communication, Simplification, Listening...', mtpRelation: 'Relation to MTP: Your strengths become the source of "execution power" to make your MTP a reality.' },
      { title: '3. Feasibility: What can you be paid for?', description: 'Write down the areas where you can create economic value with your skills', placeholder: 'Example: Training, Consulting, Entrepreneurship, Leadership...', mtpRelation: 'Relation to MTP: Clarifying where you can create economic value makes your MTP sustainable.' },
      { title: '4. Need: What does the world need from you?', description: 'Write down what the world and society are asking from you', placeholder: 'Example: Reliability, Vision, Practicality, Consistency...', mtpRelation: 'Relation to MTP: Capturing what the world needs clarifies "who the transformation is for".' }
    ],
    passion: 'Passion',
    competence: 'Competence',
    feasibility: 'Feasibility',
    need: 'Need',
    notEntered: 'Not entered',
    entered: 'Entered',
    back: 'Back',
    next: 'Next',
    nextCreateMTP: 'Next (Create MTP)',
    step3Title: 'Create MTP Candidates',
    step3Subtitle: 'Integrate the answers from the 4 questions to create 3-5 MTP candidates.',
    step3Hint: 'Hint: Ignore existing constraints and past assets, and imagine what you ultimately want to achieve',
    candidateCount: 'Candidates',
    addCandidate: 'Add New Candidate',
    candidate: 'Candidate',
    candidatePlaceholder: 'Example: "Create a future of beneficial abundance"\n\nMTP should be short, inspirational, and transformative',
    changeNote: 'Change Note',
    changeNotePlaceholder: 'Record the reason or background of this change...',
    initialVersion: 'Initial version',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    created: 'Created',
    edited: 'Edited',
    times: 'times',
    step4Title: 'MTP Checklist',
    step4Subtitle: 'Check if your MTP candidate meets 5-7 criteria',
    selectCandidate: 'Select candidate to evaluate',
    evaluatingMTP: 'Evaluating MTP',
    checklistItems: [
      'Purpose: Does it express what the organization most wants to achieve?',
      'World Description: Can you understand how the world will change when this MTP is realized?',
      'Simplicity: Is it concise, easy to understand, and requires no additional explanation?',
      'High Aspiration: Is the MTP grand and bold?',
      'Passionate: Does the MTP convey your or your organization\'s passion?',
      'Inspirational: Can you confidently encourage others to get involved?',
      'Transformative: Can the world change for the better?',
      'Global: Does it represent possibilities on a global scale?',
      'Rich Connections: Can it create new value that has never existed before?'
    ],
    achievementStatus: 'Achievement Status',
    moreItemsNeeded: '{count} more items needed to reach the passing criteria.',
    passedMessage: 'Excellent! You have achieved 5 or more items.',
    step5Title: 'Congratulations!',
    step5Subtitle: 'Your MTP candidates are complete',
    step5Note: 'MTP is not finished once created - it should be continuously refined.',
    yourMTPCandidates: 'Your MTP Candidates',
    fourFoundations: '4 Foundations',
    statistics: 'Statistics',
    totalCandidates: 'Total Candidates',
    passedCandidates: 'Passed Candidates',
    totalEdits: 'Total Edits',
    backToEdit: 'Back to Edit',
    download: 'Download',
    footer: '© 2025 SPRINT Japan Corp.',
    passionShort: 'Passion',
    competenceShort: 'Competence',
    feasibilityShort: 'Feasibility',
    needShort: 'Need',
    mtpDirection: 'MTP Direction',
    mtpExecution: 'MTP Execution',
    mtpSustainability: 'MTP Sustainability',
    mtpForWhom: 'MTP For Whom',
    aiEvaluate: 'AI Evaluate',
    aiEvaluating: 'Evaluating...',
    aiOverallScore: 'Overall Score',
    aiOverallComment: 'Overall Comment',
    aiCriteriaScores: 'Criteria Scores',
    aiSuggestedMtp: 'AI Suggestion',
    aiApplySuggestion: 'Apply this suggestion',
    aiNoApiKey: 'API key not set',
    aiSetApiKey: 'Set API Key',
    aiApiKeyPlaceholder: 'Enter OpenAI API key...',
    aiApiKeySave: 'Save',
    aiApiKeyCancel: 'Cancel',
    aiApiKeyNote: 'API key is stored in your browser\'s local storage',
    aiError: 'Error during AI evaluation',
    aiShowDetails: 'Show details',
    aiHideDetails: 'Hide details',
    aiCriteriaNames: ['Purpose', 'World Description', 'Simplicity', 'High Aspiration', 'Passionate', 'Inspirational', 'Transformative', 'Global', 'Rich Connections']
  }
}

function App() {
  const [language, setLanguage] = useState<'ja' | 'en'>('ja')
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState<Answers>({ passion: '', competence: '', feasibility: '', need: '' })
  const [candidates, setCandidates] = useState<MTPCandidate[]>([])
  const [editingCandidate, setEditingCandidate] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [editNote, setEditNote] = useState('')
    const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null)
    const [activeQuestionTab, setActiveQuestionTab] = useState('0')
    const [apiKey, setApiKey] = useState<string>(() => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('traith_openai_api_key') || ''
      }
      return ''
    })
    const [showApiKeyInput, setShowApiKeyInput] = useState(false)
    const [tempApiKey, setTempApiKey] = useState('')
    const [aiEvaluations, setAiEvaluations] = useState<Record<number, AIEvaluationResult>>({})
    const [aiLoading, setAiLoading] = useState<Record<number, boolean>>({})
    const [aiErrors, setAiErrors] = useState<Record<number, string>>({})
    const [expandedEvaluations, setExpandedEvaluations] = useState<Record<number, boolean>>({})

    const t = translations[language]

    const saveApiKey = () => {
      localStorage.setItem('traith_openai_api_key', tempApiKey)
      setApiKey(tempApiKey)
      setShowApiKeyInput(false)
      setTempApiKey('')
    }

    const evaluateWithAI = async (candidateId: number, candidateText: string) => {
      if (!apiKey) {
        setShowApiKeyInput(true)
        return
      }

      setAiLoading(prev => ({ ...prev, [candidateId]: true }))
      setAiErrors(prev => ({ ...prev, [candidateId]: '' }))

      const langName = language === 'ja' ? 'Japanese' : 'English'
      const criteriaNames = language === 'ja' 
        ? ['目的', '世界の記述', 'シンプルさ', '高い意欲', '情熱的', 'インスピレーション', '変革的', 'グローバル', '豊かなつながり']
        : ['Purpose', 'World Description', 'Simplicity', 'High Aspiration', 'Passionate', 'Inspirational', 'Transformative', 'Global', 'Rich Connections']

      const systemPrompt = `You are an expert consultant in the ExO Sprint "Massive Transformative Purpose (MTP)" framework.
  Your job is to evaluate proposed MTP statements and suggest improvements.
  You ALWAYS respond ONLY with valid JSON that matches the given schema.

  An MTP is a short, inspirational, transformative statement like:
  - "Organize the world's information."
  - "Accelerate the world's transition to sustainable energy."

  Use the following 9 criteria. For each, give an integer score from 1 (very poor) to 5 (excellent) and a short explanation in ${langName}:
  1. Purpose – Does it express what the organization most wants to achieve?
  2. World Description – Is it clear how the world looks when it is achieved?
  3. Simplicity – Is it concise and easy to understand?
  4. High Aspiration – Is it grand and bold beyond ordinary goals?
  5. Passionate – Does it convey strong passion?
  6. Inspirational – Would it inspire others to join?
  7. Transformative – Would it significantly improve the world?
  8. Global – Does it describe impact at global or at least very large scale?
  9. Rich Connections – Does it enable many new kinds of value and collaborations?

  Also consider the organization's context from the 4 foundations: passion, competence, feasibility, and need. The improved MTP should be consistent with these.`

      const userPrompt = `Language: ${langName}
  MTP candidate:
  "${candidateText}"

  Four foundations (Ikigai):
  - Passion: ${answers.passion || 'Not specified'}
  - Competence: ${answers.competence || 'Not specified'}
  - Feasibility: ${answers.feasibility || 'Not specified'}
  - Need: ${answers.need || 'Not specified'}

  Please evaluate this candidate and respond ONLY with JSON in the following format:

  {
    "overall_score": 0-100 integer,
    "overall_comment": "string in ${langName}",
    "criteria": [
      {"id": 1, "name": "${criteriaNames[0]}", "score": 1-5, "comment": "string"},
      {"id": 2, "name": "${criteriaNames[1]}", "score": 1-5, "comment": "string"},
      {"id": 3, "name": "${criteriaNames[2]}", "score": 1-5, "comment": "string"},
      {"id": 4, "name": "${criteriaNames[3]}", "score": 1-5, "comment": "string"},
      {"id": 5, "name": "${criteriaNames[4]}", "score": 1-5, "comment": "string"},
      {"id": 6, "name": "${criteriaNames[5]}", "score": 1-5, "comment": "string"},
      {"id": 7, "name": "${criteriaNames[6]}", "score": 1-5, "comment": "string"},
      {"id": 8, "name": "${criteriaNames[7]}", "score": 1-5, "comment": "string"},
      {"id": 9, "name": "${criteriaNames[8]}", "score": 1-5, "comment": "string"}
    ],
    "suggested_mtp": "string in ${langName}; improved version of the candidate"
  }`

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 2000
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error?.message || `API error: ${response.status}`)
        }

        const data = await response.json()
        const content = data.choices[0]?.message?.content || ''
      
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          throw new Error('Invalid response format')
        }
      
        const evaluation: AIEvaluationResult = JSON.parse(jsonMatch[0])
        setAiEvaluations(prev => ({ ...prev, [candidateId]: evaluation }))
        setExpandedEvaluations(prev => ({ ...prev, [candidateId]: true }))
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setAiErrors(prev => ({ ...prev, [candidateId]: errorMessage }))
      } finally {
        setAiLoading(prev => ({ ...prev, [candidateId]: false }))
      }
    }

    const applySuggestion = (candidateId: number, suggestedMtp: string) => {
      setCandidates(prev => prev.map(c => {
        if (c.id === candidateId) {
          return { ...c, text: suggestedMtp, editCount: c.editCount + 1, changeNote: 'AI suggestion applied' }
        }
        return c
      }))
    }

  const handleAnswerChange = (field: keyof Answers, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }))
  }

  const addCandidate = () => {
    const newCandidate: MTPCandidate = {
      id: Date.now(),
      text: '',
      createdAt: new Date(),
      editCount: 0,
      checklist: new Array(9).fill(false),
      changeNote: t.initialVersion
    }
    setCandidates(prev => [...prev, newCandidate])
    setEditingCandidate(newCandidate.id)
    setEditText('')
    setEditNote(t.initialVersion)
  }

  const saveCandidate = () => {
    if (editingCandidate === null) return
    setCandidates(prev => prev.map(c => {
      if (c.id === editingCandidate) {
        return { ...c, text: editText, editCount: c.editCount + 1, changeNote: editNote }
      }
      return c
    }))
    setEditingCandidate(null)
    setEditText('')
    setEditNote('')
  }

  const deleteCandidate = (id: number) => {
    setCandidates(prev => prev.filter(c => c.id !== id))
    if (selectedCandidateId === id) setSelectedCandidateId(null)
  }

  const toggleChecklist = (candidateId: number, index: number) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === candidateId) {
        const newChecklist = [...c.checklist]
        newChecklist[index] = !newChecklist[index]
        return { ...c, checklist: newChecklist }
      }
      return c
    }))
  }

  const getChecklistScore = (candidate: MTPCandidate) => candidate.checklist.filter(Boolean).length
  const isPassed = (candidate: MTPCandidate) => getChecklistScore(candidate) >= 5
  const canProceedToStep3 = candidates.length > 0 && candidates.some(c => c.text.trim() !== '')

  const downloadResults = () => {
    const content = `TRAITH - MTP Results\nGenerated: ${new Date().toLocaleString()}\n\n=== 4 Questions ===\nPassion: ${answers.passion}\nCompetence: ${answers.competence}\nFeasibility: ${answers.feasibility}\nNeed: ${answers.need}\n\n=== MTP Candidates ===\n${candidates.map((c, i) => `Candidate ${i + 1}: ${c.text}\nScore: ${getChecklistScore(c)}/9 ${isPassed(c) ? '(Passed)' : ''}\nEdit Count: ${c.editCount}\n`).join('\n')}\n\n=== Statistics ===\nTotal Candidates: ${candidates.length}\nPassed Candidates: ${candidates.filter(isPassed).length}\nTotal Edits: ${candidates.reduce((sum, c) => sum + c.editCount, 0)}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'traith-mtp-results.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <PenTool className="w-8 h-8 text-blue-600" />
          {t.step1Title}
        </CardTitle>
        <CardDescription className="text-base">{t.step1Subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-600">
          <p className="text-lg text-gray-800 font-medium mb-3">{t.step1Intro}</p>
          <p className="text-base text-gray-700">{t.step1Intro2}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-blue-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">{t.mtpDefinitionTitle}</h3>
            <p className="text-gray-700 text-sm">{t.mtpDefinition}</p>
            <p className="mt-4 text-gray-700 text-sm">{t.mtpDefinition2}</p>
          </div>
          <div className="p-6 bg-green-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">{t.expectedEffectsTitle}</h3>
            <ol className="space-y-2 text-sm text-gray-700">
              {t.expectedEffects.map((effect, i) => (
                <li key={i} className="flex gap-2"><span className="font-semibold">{i + 1}.</span><span>{effect}</span></li>
              ))}
            </ol>
          </div>
          <div className="p-6 bg-orange-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">{t.differencesTitle}</h3>
            <p className="text-sm text-gray-700 mb-4">{t.differencesIntro}</p>
            <div className="space-y-3">
              {Object.values(t.differences).map((diff, i) => (
                <div key={i} className="text-sm"><span className="font-semibold text-gray-900">{diff.label}</span><span className="text-gray-700">{diff.text}</span></div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {t.examples.map((example, i) => (
            <div key={i} className={`p-4 rounded-lg ${i === 0 ? 'bg-gradient-to-br from-purple-50 to-pink-50' : i === 1 ? 'bg-gradient-to-br from-green-50 to-teal-50' : i === 2 ? 'bg-gradient-to-br from-yellow-50 to-orange-50' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
              <h4 className="font-semibold text-lg mb-2">{language === 'ja' ? '例：' : 'Example: '}{example.company}</h4>
              <p className="text-gray-700">{example.mtp}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={() => setCurrentStep(2)} className="px-8">{t.start}</Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Lightbulb className="w-8 h-8 text-blue-600" />
          {t.step2Title}
        </CardTitle>
        <CardDescription className="text-base">{t.step2Subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-l-4 border-indigo-500">
          <p className="text-sm text-gray-700">{t.step2Explanation}</p>
        </div>
        <Tabs value={activeQuestionTab} onValueChange={setActiveQuestionTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="0">Q1</TabsTrigger>
            <TabsTrigger value="1">Q2</TabsTrigger>
            <TabsTrigger value="2">Q3</TabsTrigger>
            <TabsTrigger value="3">Q4</TabsTrigger>
          </TabsList>
          {t.questions.map((q, i) => (
            <TabsContent key={i} value={String(i)}>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{q.title}</h3>
                <p className="text-gray-600">{q.description}</p>
                <Textarea
                  placeholder={q.placeholder}
                  value={i === 0 ? answers.passion : i === 1 ? answers.competence : i === 2 ? answers.feasibility : answers.need}
                  onChange={(e) => handleAnswerChange(i === 0 ? 'passion' : i === 1 ? 'competence' : i === 2 ? 'feasibility' : 'need', e.target.value)}
                  className="min-h-[120px]"
                />
                <div className="p-3 bg-blue-50 rounded-lg border-l-2 border-blue-400">
                  <p className="text-sm text-blue-800 font-medium">{q.mtpRelation}</p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${answers.passion ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} border`}>
            <p className="text-sm font-medium text-red-600">{t.passion}</p>
            <p className="text-xs text-gray-500 mt-1">{t.mtpDirection}</p>
            <p className="text-sm mt-2">{answers.passion ? `✓ ${t.entered}` : t.notEntered}</p>
          </div>
          <div className={`p-4 rounded-lg ${answers.competence ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border`}>
            <p className="text-sm font-medium text-green-600">{t.competence}</p>
            <p className="text-xs text-gray-500 mt-1">{t.mtpExecution}</p>
            <p className="text-sm mt-2">{answers.competence ? `✓ ${t.entered}` : t.notEntered}</p>
          </div>
          <div className={`p-4 rounded-lg ${answers.feasibility ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'} border`}>
            <p className="text-sm font-medium text-yellow-600">{t.feasibility}</p>
            <p className="text-xs text-gray-500 mt-1">{t.mtpSustainability}</p>
            <p className="text-sm mt-2">{answers.feasibility ? `✓ ${t.entered}` : t.notEntered}</p>
          </div>
          <div className={`p-4 rounded-lg ${answers.need ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'} border`}>
            <p className="text-sm font-medium text-blue-600">{t.need}</p>
            <p className="text-xs text-gray-500 mt-1">{t.mtpForWhom}</p>
            <p className="text-sm mt-2">{answers.need ? `✓ ${t.entered}` : t.notEntered}</p>
          </div>
        </div>
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setCurrentStep(1)}>{t.back}</Button>
          <Button onClick={() => setCurrentStep(3)}>{t.nextCreateMTP}</Button>
        </div>
      </CardContent>
    </Card>
  )

    const renderStep3 = () => (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            {t.step3Title}
          </CardTitle>
          <CardDescription className="text-base">{t.step3Subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {showApiKeyInput && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2"><Settings className="w-5 h-5" />{t.aiSetApiKey}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowApiKeyInput(false)}><X className="w-4 h-4" /></Button>
                </div>
                <Input type="password" value={tempApiKey} onChange={(e) => setTempApiKey(e.target.value)} placeholder={t.aiApiKeyPlaceholder} className="mb-2" />
                <p className="text-xs text-gray-500 mb-4">{t.aiApiKeyNote}</p>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowApiKeyInput(false)}>{t.aiApiKeyCancel}</Button>
                  <Button onClick={saveApiKey} disabled={!tempApiKey.trim()}>{t.aiApiKeySave}</Button>
                </div>
              </div>
            </div>
          )}
          <div className="p-4 bg-yellow-50 rounded-lg flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
            <p className="text-sm text-gray-700">{t.step3Hint}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="p-4 bg-red-50 rounded-lg"><p className="text-sm font-medium text-red-600">{t.passion}</p><p className="text-sm mt-1">{answers.passion || t.notEntered}</p></div>
              <div className="p-4 bg-green-50 rounded-lg"><p className="text-sm font-medium text-green-600">{t.competence}</p><p className="text-sm mt-1">{answers.competence || t.notEntered}</p></div>
              <div className="p-4 bg-yellow-50 rounded-lg"><p className="text-sm font-medium text-yellow-600">{t.feasibility}</p><p className="text-sm mt-1">{answers.feasibility || t.notEntered}</p></div>
              <div className="p-4 bg-blue-50 rounded-lg"><p className="text-sm font-medium text-blue-600">{t.need}</p><p className="text-sm mt-1">{answers.need || t.notEntered}</p></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t.candidateCount}: {candidates.length} / 5</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowApiKeyInput(true)}><Settings className="w-4 h-4 mr-1" />{apiKey ? 'API Key Set' : t.aiSetApiKey}</Button>
              {candidates.length < 5 && <Button onClick={addCandidate} variant="outline"><Plus className="w-4 h-4 mr-2" />{t.addCandidate}</Button>}
            </div>
          </div>
          <div className="space-y-4">
            {candidates.map((candidate, index) => (
              <div key={candidate.id} className="border rounded-lg p-4">
                {editingCandidate === candidate.id ? (
                  <div className="space-y-4">
                    <label className="text-sm font-medium">{t.candidate} {index + 1}</label>
                    <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} placeholder={t.candidatePlaceholder} className="min-h-[100px]" />
                    <label className="text-sm font-medium">{t.changeNote}</label>
                    <Input value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder={t.changeNotePlaceholder} />
                    <div className="flex gap-2">
                      <Button onClick={saveCandidate} disabled={!editText.trim()}><Save className="w-4 h-4 mr-2" />{t.saveChanges}</Button>
                      <Button variant="outline" onClick={() => { if (!candidate.text) deleteCandidate(candidate.id); setEditingCandidate(null) }}>{t.cancel}</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{t.candidate} {index + 1}</p>
                        <p className="font-medium">{candidate.text}</p>
                        <p className="text-xs text-gray-400 mt-1">{t.created}: {candidate.createdAt.toLocaleString()} | {t.edited}: {candidate.editCount}{t.times}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="text-purple-600" onClick={() => candidate.text && evaluateWithAI(candidate.id, candidate.text)} disabled={!candidate.text || aiLoading[candidate.id]}>
                          {aiLoading[candidate.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                          {aiLoading[candidate.id] ? t.aiEvaluating : t.aiEvaluate}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setEditingCandidate(candidate.id); setEditText(candidate.text); setEditNote('') }}><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm"><History className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteCandidate(candidate.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                    {aiErrors[candidate.id] && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{t.aiError}: {aiErrors[candidate.id]}</p>
                      </div>
                    )}
                    {aiEvaluations[candidate.id] && (
                      <div className="mt-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-purple-700">{t.aiOverallScore}: {aiEvaluations[candidate.id].overall_score}/100</span>
                            <Progress value={aiEvaluations[candidate.id].overall_score} className="w-24 h-2" />
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setExpandedEvaluations(prev => ({ ...prev, [candidate.id]: !prev[candidate.id] }))}>
                            {expandedEvaluations[candidate.id] ? <><ChevronUp className="w-4 h-4 mr-1" />{t.aiHideDetails}</> : <><ChevronDown className="w-4 h-4 mr-1" />{t.aiShowDetails}</>}
                          </Button>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{aiEvaluations[candidate.id].overall_comment}</p>
                        {expandedEvaluations[candidate.id] && (
                          <>
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold mb-2">{t.aiCriteriaScores}</h4>
                              <div className="grid grid-cols-3 gap-2">
                                {aiEvaluations[candidate.id].criteria.map((criterion) => (
                                  <div key={criterion.id} className={`p-2 rounded text-xs ${criterion.score >= 4 ? 'bg-green-100' : criterion.score >= 3 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                                    <div className="font-medium">{criterion.name}</div>
                                    <div className="flex items-center gap-1">
                                      <span className="font-bold">{criterion.score}/5</span>
                                      <span className="text-gray-600 truncate">{criterion.comment}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {aiEvaluations[candidate.id].suggested_mtp && (
                              <div className="p-3 bg-white rounded-lg border border-purple-300">
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Sparkles className="w-4 h-4 text-purple-600" />{t.aiSuggestedMtp}</h4>
                                <p className="text-sm text-gray-800 mb-2">"{aiEvaluations[candidate.id].suggested_mtp}"</p>
                                <Button size="sm" variant="outline" className="text-purple-600 border-purple-300" onClick={() => applySuggestion(candidate.id, aiEvaluations[candidate.id].suggested_mtp)}>
                                  {t.aiApplySuggestion}
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>{t.back}</Button>
            <Button onClick={() => setCurrentStep(4)} disabled={!canProceedToStep3}>{t.next}</Button>
          </div>
        </CardContent>
      </Card>
    )

  const renderStep4 = () => {
    const selectedCandidate = candidates.find(c => c.id === selectedCandidateId)
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-blue-600" />
            {t.step4Title}
          </CardTitle>
          <CardDescription className="text-base">{t.step4Subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium">{t.selectCandidate}</label>
            <div className="mt-2 space-y-2">
              {candidates.filter(c => c.text.trim()).map((candidate, index) => (
                <div key={candidate.id} className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedCandidateId === candidate.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`} onClick={() => setSelectedCandidateId(candidate.id)}>
                  <div className="flex justify-between items-center">
                    <div><p className="text-sm text-gray-500">{t.candidate} {index + 1}</p><p className="font-medium">{candidate.text}</p></div>
                    <span className={`px-2 py-1 rounded text-sm ${isPassed(candidate) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{getChecklistScore(candidate)}/9</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {selectedCandidate && (
            <>
              <div className="p-4 bg-blue-50 rounded-lg"><h3 className="font-semibold mb-2">{t.evaluatingMTP}</h3><p>{selectedCandidate.text}</p></div>
              <div className="space-y-3">
                {t.checklistItems.map((item, index) => (
                  <div key={index} className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedCandidate.checklist[index] ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'}`} onClick={() => toggleChecklist(selectedCandidate.id, index)}>
                    <div className="flex items-start gap-3">
                      <Checkbox checked={selectedCandidate.checklist[index]} onCheckedChange={() => toggleChecklist(selectedCandidate.id, index)} />
                      <p className="text-sm">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{t.achievementStatus}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${isPassed(selectedCandidate) ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>{getChecklistScore(selectedCandidate)} / 9</span>
                </div>
                <Progress value={(getChecklistScore(selectedCandidate) / 9) * 100} className="mb-2" />
                <p className={`text-sm ${isPassed(selectedCandidate) ? 'text-green-600' : 'text-gray-600'}`}>
                  {isPassed(selectedCandidate) ? `✓ ${t.passedMessage}` : t.moreItemsNeeded.replace('{count}', String(5 - getChecklistScore(selectedCandidate)))}
                </p>
              </div>
            </>
          )}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentStep(3)}>{t.back}</Button>
            <Button onClick={() => setCurrentStep(5)}>{t.next}</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderStep5 = () => {
    const passedCandidates = candidates.filter(isPassed)
    const totalEdits = candidates.reduce((sum, c) => sum + c.editCount, 0)
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Globe className="w-8 h-8 text-blue-600" />
            {t.step5Title}
          </CardTitle>
          <CardDescription className="text-base">{t.step5Subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg flex items-start gap-2">
            <TrendingUp className="w-5 h-5 text-gray-600 mt-0.5" />
            <p className="text-sm text-gray-700">{t.step5Note}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t.yourMTPCandidates}</h3>
            {candidates.filter(c => c.text.trim()).map((candidate, index) => (
              <div key={candidate.id} className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500">{t.candidate} {index + 1}</p>
                    <p className="text-xl font-semibold">{candidate.text}</p>
                    <p className="text-sm text-gray-500 mt-1">{t.edited}: {candidate.editCount}{t.times}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${isPassed(candidate) ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>{getChecklistScore(candidate)}/9 {isPassed(candidate) && '✓'}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">{t.fourFoundations}</h4>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-2"><span className="text-red-500">♡</span>{t.passionShort} {answers.passion && '✓'}</p>
                      <p className="flex items-center gap-2"><span className="text-green-500">○</span>{t.competenceShort} {answers.competence && '✓'}</p>
                      <p className="flex items-center gap-2"><span className="text-yellow-500">↗</span>{t.feasibilityShort} {answers.feasibility && '✓'}</p>
                      <p className="flex items-center gap-2"><span className="text-blue-500">⊕</span>{t.needShort} {answers.need && '✓'}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">{t.statistics}</h4>
                    <div className="space-y-1 text-sm">
                      <p>{t.totalCandidates}: {candidates.length}</p>
                      <p>{t.passedCandidates}: {passedCandidates.length}</p>
                      <p>{t.totalEdits}: {totalEdits}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={() => setCurrentStep(3)} className="flex-1">{t.backToEdit}</Button>
            <Button onClick={downloadResults} className="flex-1">{t.download}</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-4xl font-bold text-gray-900">{t.title}</h1>
              <span className="text-sm text-gray-500">{t.version}</span>
            </div>
            <p className="text-lg text-gray-600 mt-2">{t.subtitle}</p>
          </div>
          <div className="flex gap-2">
            <Button variant={language === 'ja' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('ja')}>日本語</Button>
            <Button variant={language === 'en' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('en')}>English</Button>
            <Button variant="outline" size="sm"><SquarePen className="w-4 h-4 mr-2" />{t.editMode}</Button>
          </div>
        </div>
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {t.steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${currentStep > index + 1 ? 'bg-blue-600 text-white' : currentStep === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`} onClick={() => { if (index + 1 <= currentStep) setCurrentStep(index + 1) }}>{index + 1}</div>
                <span className="text-xs mt-2 text-center">{step}</span>
              </div>
            ))}
          </div>
          <Progress value={(currentStep / 5) * 100} className="mt-4" />
        </div>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
        <footer className="mt-16 pb-6">
          <div className="flex items-center justify-center opacity-60">
            <span className="text-xs text-gray-600">{t.footer}</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
