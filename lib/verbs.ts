import type { Difficulty } from "@/types";

export interface VerbEntry {
  base: string;
  past: string;
  participle: string;
  thirdPerson: string;
  ing: string;
  translation: string;
}

const beginnerVerbs: VerbEntry[] = [
  { base: "play", past: "played", participle: "played", thirdPerson: "plays", ing: "playing", translation: "играть" },
  { base: "work", past: "worked", participle: "worked", thirdPerson: "works", ing: "working", translation: "работать" },
  { base: "live", past: "lived", participle: "lived", thirdPerson: "lives", ing: "living", translation: "жить" },
  { base: "like", past: "liked", participle: "liked", thirdPerson: "likes", ing: "liking", translation: "нравиться" },
  { base: "want", past: "wanted", participle: "wanted", thirdPerson: "wants", ing: "wanting", translation: "хотеть" },
  { base: "need", past: "needed", participle: "needed", thirdPerson: "needs", ing: "needing", translation: "нуждаться" },
  { base: "ask", past: "asked", participle: "asked", thirdPerson: "asks", ing: "asking", translation: "спрашивать" },
  { base: "help", past: "helped", participle: "helped", thirdPerson: "helps", ing: "helping", translation: "помогать" },
  { base: "call", past: "called", participle: "called", thirdPerson: "calls", ing: "calling", translation: "звонить" },
  { base: "try", past: "tried", participle: "tried", thirdPerson: "tries", ing: "trying", translation: "пытаться" },
  { base: "use", past: "used", participle: "used", thirdPerson: "uses", ing: "using", translation: "использовать" },
  { base: "start", past: "started", participle: "started", thirdPerson: "starts", ing: "starting", translation: "начинать" },
  { base: "talk", past: "talked", participle: "talked", thirdPerson: "talks", ing: "talking", translation: "говорить" },
  { base: "look", past: "looked", participle: "looked", thirdPerson: "looks", ing: "looking", translation: "смотреть" },
  { base: "walk", past: "walked", participle: "walked", thirdPerson: "walks", ing: "walking", translation: "ходить" },
  { base: "eat", past: "ate", participle: "eaten", thirdPerson: "eats", ing: "eating", translation: "есть" },
  { base: "drink", past: "drank", participle: "drunk", thirdPerson: "drinks", ing: "drinking", translation: "пить" },
  { base: "go", past: "went", participle: "gone", thirdPerson: "goes", ing: "going", translation: "идти" },
  { base: "come", past: "came", participle: "come", thirdPerson: "comes", ing: "coming", translation: "приходить" },
  { base: "see", past: "saw", participle: "seen", thirdPerson: "sees", ing: "seeing", translation: "видеть" },
  { base: "take", past: "took", participle: "taken", thirdPerson: "takes", ing: "taking", translation: "брать" },
  { base: "make", past: "made", participle: "made", thirdPerson: "makes", ing: "making", translation: "делать" },
  { base: "give", past: "gave", participle: "given", thirdPerson: "gives", ing: "giving", translation: "давать" },
  { base: "know", past: "knew", participle: "known", thirdPerson: "knows", ing: "knowing", translation: "знать" },
  { base: "think", past: "thought", participle: "thought", thirdPerson: "thinks", ing: "thinking", translation: "думать" },
  { base: "find", past: "found", participle: "found", thirdPerson: "finds", ing: "finding", translation: "находить" },
  { base: "tell", past: "told", participle: "told", thirdPerson: "tells", ing: "telling", translation: "рассказывать" },
  { base: "sleep", past: "slept", participle: "slept", thirdPerson: "sleeps", ing: "sleeping", translation: "спать" },
  { base: "read", past: "read", participle: "read", thirdPerson: "reads", ing: "reading", translation: "читать" },
  { base: "write", past: "wrote", participle: "written", thirdPerson: "writes", ing: "writing", translation: "писать" },
];

const intermediateVerbs: VerbEntry[] = [
  { base: "achieve", past: "achieved", participle: "achieved", thirdPerson: "achieves", ing: "achieving", translation: "достигать" },
  { base: "believe", past: "believed", participle: "believed", thirdPerson: "believes", ing: "believing", translation: "верить" },
  { base: "consider", past: "considered", participle: "considered", thirdPerson: "considers", ing: "considering", translation: "рассматривать" },
  { base: "develop", past: "developed", participle: "developed", thirdPerson: "develops", ing: "developing", translation: "развивать" },
  { base: "expect", past: "expected", participle: "expected", thirdPerson: "expects", ing: "expecting", translation: "ожидать" },
  { base: "explain", past: "explained", participle: "explained", thirdPerson: "explains", ing: "explaining", translation: "объяснять" },
  { base: "happen", past: "happened", participle: "happened", thirdPerson: "happens", ing: "happening", translation: "происходить" },
  { base: "imagine", past: "imagined", participle: "imagined", thirdPerson: "imagines", ing: "imagining", translation: "воображать" },
  { base: "manage", past: "managed", participle: "managed", thirdPerson: "manages", ing: "managing", translation: "управлять" },
  { base: "notice", past: "noticed", participle: "noticed", thirdPerson: "notices", ing: "noticing", translation: "замечать" },
  { base: "offer", past: "offered", participle: "offered", thirdPerson: "offers", ing: "offering", translation: "предлагать" },
  { base: "prepare", past: "prepared", participle: "prepared", thirdPerson: "prepares", ing: "preparing", translation: "готовить" },
  { base: "receive", past: "received", participle: "received", thirdPerson: "receives", ing: "receiving", translation: "получать" },
  { base: "remember", past: "remembered", participle: "remembered", thirdPerson: "remembers", ing: "remembering", translation: "помнить" },
  { base: "suggest", past: "suggested", participle: "suggested", thirdPerson: "suggests", ing: "suggesting", translation: "предлагать" },
  { base: "begin", past: "began", participle: "begun", thirdPerson: "begins", ing: "beginning", translation: "начинать" },
  { base: "break", past: "broke", participle: "broken", thirdPerson: "breaks", ing: "breaking", translation: "ломать" },
  { base: "bring", past: "brought", participle: "brought", thirdPerson: "brings", ing: "bringing", translation: "приносить" },
  { base: "build", past: "built", participle: "built", thirdPerson: "builds", ing: "building", translation: "строить" },
  { base: "buy", past: "bought", participle: "bought", thirdPerson: "buys", ing: "buying", translation: "покупать" },
  { base: "catch", past: "caught", participle: "caught", thirdPerson: "catches", ing: "catching", translation: "ловить" },
  { base: "choose", past: "chose", participle: "chosen", thirdPerson: "chooses", ing: "choosing", translation: "выбирать" },
  { base: "drive", past: "drove", participle: "driven", thirdPerson: "drives", ing: "driving", translation: "водить" },
  { base: "fall", past: "fell", participle: "fallen", thirdPerson: "falls", ing: "falling", translation: "падать" },
  { base: "feel", past: "felt", participle: "felt", thirdPerson: "feels", ing: "feeling", translation: "чувствовать" },
  { base: "forget", past: "forgot", participle: "forgotten", thirdPerson: "forgets", ing: "forgetting", translation: "забывать" },
  { base: "grow", past: "grew", participle: "grown", thirdPerson: "grows", ing: "growing", translation: "расти" },
  { base: "hold", past: "held", participle: "held", thirdPerson: "holds", ing: "holding", translation: "держать" },
  { base: "keep", past: "kept", participle: "kept", thirdPerson: "keeps", ing: "keeping", translation: "хранить" },
  { base: "lead", past: "led", participle: "led", thirdPerson: "leads", ing: "leading", translation: "вести" },
  { base: "learn", past: "learned", participle: "learned", thirdPerson: "learns", ing: "learning", translation: "учить" },
  { base: "leave", past: "left", participle: "left", thirdPerson: "leaves", ing: "leaving", translation: "покидать" },
  { base: "lose", past: "lost", participle: "lost", thirdPerson: "loses", ing: "losing", translation: "терять" },
  { base: "meet", past: "met", participle: "met", thirdPerson: "meets", ing: "meeting", translation: "встречать" },
  { base: "pay", past: "paid", participle: "paid", thirdPerson: "pays", ing: "paying", translation: "платить" },
  { base: "put", past: "put", participle: "put", thirdPerson: "puts", ing: "putting", translation: "класть" },
  { base: "run", past: "ran", participle: "run", thirdPerson: "runs", ing: "running", translation: "бежать" },
  { base: "send", past: "sent", participle: "sent", thirdPerson: "sends", ing: "sending", translation: "отправлять" },
  { base: "sit", past: "sat", participle: "sat", thirdPerson: "sits", ing: "sitting", translation: "сидеть" },
  { base: "speak", past: "spoke", participle: "spoken", thirdPerson: "speaks", ing: "speaking", translation: "говорить" },
  { base: "spend", past: "spent", participle: "spent", thirdPerson: "spends", ing: "spending", translation: "тратить" },
  { base: "stand", past: "stood", participle: "stood", thirdPerson: "stands", ing: "standing", translation: "стоять" },
  { base: "teach", past: "taught", participle: "taught", thirdPerson: "teaches", ing: "teaching", translation: "учить" },
  { base: "understand", past: "understood", participle: "understood", thirdPerson: "understands", ing: "understanding", translation: "понимать" },
  { base: "wear", past: "wore", participle: "worn", thirdPerson: "wears", ing: "wearing", translation: "носить" },
  { base: "win", past: "won", participle: "won", thirdPerson: "wins", ing: "winning", translation: "побеждать" },
];

const advancedVerbs: VerbEntry[] = [
  { base: "acknowledge", past: "acknowledged", participle: "acknowledged", thirdPerson: "acknowledges", ing: "acknowledging", translation: "признавать" },
  { base: "acquire", past: "acquired", participle: "acquired", thirdPerson: "acquires", ing: "acquiring", translation: "приобретать" },
  { base: "advocate", past: "advocated", participle: "advocated", thirdPerson: "advocates", ing: "advocating", translation: "выступать за" },
  { base: "allocate", past: "allocated", participle: "allocated", thirdPerson: "allocates", ing: "allocating", translation: "распределять" },
  { base: "anticipate", past: "anticipated", participle: "anticipated", thirdPerson: "anticipates", ing: "anticipating", translation: "предвидеть" },
  { base: "appreciate", past: "appreciated", participle: "appreciated", thirdPerson: "appreciates", ing: "appreciating", translation: "ценить" },
  { base: "collaborate", past: "collaborated", participle: "collaborated", thirdPerson: "collaborates", ing: "collaborating", translation: "сотрудничать" },
  { base: "compensate", past: "compensated", participle: "compensated", thirdPerson: "compensates", ing: "compensating", translation: "компенсировать" },
  { base: "contemplate", past: "contemplated", participle: "contemplated", thirdPerson: "contemplates", ing: "contemplating", translation: "размышлять" },
  { base: "demonstrate", past: "demonstrated", participle: "demonstrated", thirdPerson: "demonstrates", ing: "demonstrating", translation: "демонстрировать" },
  { base: "distinguish", past: "distinguished", participle: "distinguished", thirdPerson: "distinguishes", ing: "distinguishing", translation: "различать" },
  { base: "elaborate", past: "elaborated", participle: "elaborated", thirdPerson: "elaborates", ing: "elaborating", translation: "разрабатывать" },
  { base: "facilitate", past: "facilitated", participle: "facilitated", thirdPerson: "facilitates", ing: "facilitating", translation: "способствовать" },
  { base: "implement", past: "implemented", participle: "implemented", thirdPerson: "implements", ing: "implementing", translation: "осуществлять" },
  { base: "negotiate", past: "negotiated", participle: "negotiated", thirdPerson: "negotiates", ing: "negotiating", translation: "вести переговоры" },
  { base: "participate", past: "participated", participle: "participated", thirdPerson: "participates", ing: "participating", translation: "участвовать" },
  { base: "reconcile", past: "reconciled", participle: "reconciled", thirdPerson: "reconciles", ing: "reconciling", translation: "примирять" },
  { base: "scrutinize", past: "scrutinized", participle: "scrutinized", thirdPerson: "scrutinizes", ing: "scrutinizing", translation: "тщательно изучать" },
  { base: "undertake", past: "undertook", participle: "undertaken", thirdPerson: "undertakes", ing: "undertaking", translation: "предпринимать" },
  { base: "withstand", past: "withstood", participle: "withstood", thirdPerson: "withstands", ing: "withstanding", translation: "выдерживать" },
  { base: "arise", past: "arose", participle: "arisen", thirdPerson: "arises", ing: "arising", translation: "возникать" },
  { base: "bind", past: "bound", participle: "bound", thirdPerson: "binds", ing: "binding", translation: "связывать" },
  { base: "cast", past: "cast", participle: "cast", thirdPerson: "casts", ing: "casting", translation: "бросать" },
  { base: "cling", past: "clung", participle: "clung", thirdPerson: "clings", ing: "clinging", translation: "цепляться" },
  { base: "dwell", past: "dwelt", participle: "dwelt", thirdPerson: "dwells", ing: "dwelling", translation: "проживать" },
  { base: "flee", past: "fled", participle: "fled", thirdPerson: "flees", ing: "fleeing", translation: "сбегать" },
  { base: "forsake", past: "forsook", participle: "forsaken", thirdPerson: "forsakes", ing: "forsaking", translation: "покидать" },
  { base: "kneel", past: "knelt", participle: "knelt", thirdPerson: "kneels", ing: "kneeling", translation: "стоять на коленях" },
  { base: "overcome", past: "overcame", participle: "overcome", thirdPerson: "overcomes", ing: "overcoming", translation: "преодолевать" },
  { base: "plead", past: "pleaded", participle: "pleaded", thirdPerson: "pleads", ing: "pleading", translation: "умолять" },
  { base: "shed", past: "shed", participle: "shed", thirdPerson: "sheds", ing: "shedding", translation: "проливать" },
  { base: "strive", past: "strove", participle: "striven", thirdPerson: "strives", ing: "striving", translation: "стремиться" },
  { base: "undergo", past: "underwent", participle: "undergone", thirdPerson: "undergoes", ing: "undergoing", translation: "подвергаться" },
  { base: "uphold", past: "upheld", participle: "upheld", thirdPerson: "upholds", ing: "upholding", translation: "поддерживать" },
  { base: "withdraw", past: "withdrew", participle: "withdrawn", thirdPerson: "withdraws", ing: "withdrawing", translation: "отзывать" },
];

export const verbBanks: Record<Difficulty, VerbEntry[]> = {
  beginner: beginnerVerbs,
  intermediate: intermediateVerbs,
  advanced: advancedVerbs,
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getVerbsForDifficulty(difficulty: Difficulty, count: number = 10): VerbEntry[] {
  const verbs = verbBanks[difficulty] ?? verbBanks.beginner;
  return shuffleArray(verbs).slice(0, Math.min(count, verbs.length));
}
