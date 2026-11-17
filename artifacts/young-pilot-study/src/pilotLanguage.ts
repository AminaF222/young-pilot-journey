import type { Flashcard } from './data';

export type PhoneticEntry = { letter: string; word: string; pronunciation: string };

export const phoneticAlphabet: PhoneticEntry[] = [
  { letter:'A', word:'Alfa', pronunciation:'AL-FAH' },
  { letter:'B', word:'Bravo', pronunciation:'BRAH-VOH' },
  { letter:'C', word:'Charlie', pronunciation:'CHAR-LEE (also SHAR-LEE)' },
  { letter:'D', word:'Delta', pronunciation:'DELL-TAH' },
  { letter:'E', word:'Echo', pronunciation:'ECK-OH' },
  { letter:'F', word:'Foxtrot', pronunciation:'FOKS-TROT' },
  { letter:'G', word:'Golf', pronunciation:'GOLF' },
  { letter:'H', word:'Hotel', pronunciation:'HOH-TEL' },
  { letter:'I', word:'India', pronunciation:'IN-DEE-AH' },
  { letter:'J', word:'Juliett', pronunciation:'JEW-LEE-ETT' },
  { letter:'K', word:'Kilo', pronunciation:'KEY-LOH' },
  { letter:'L', word:'Lima', pronunciation:'LEE-MAH' },
  { letter:'M', word:'Mike', pronunciation:'MIKE' },
  { letter:'N', word:'November', pronunciation:'NO-VEM-BER' },
  { letter:'O', word:'Oscar', pronunciation:'OSS-CAH' },
  { letter:'P', word:'Papa', pronunciation:'PAH-PAH' },
  { letter:'Q', word:'Quebec', pronunciation:'KEH-BECK' },
  { letter:'R', word:'Romeo', pronunciation:'ROW-ME-OH' },
  { letter:'S', word:'Sierra', pronunciation:'SEE-AIR-RAH' },
  { letter:'T', word:'Tango', pronunciation:'TANG-GO' },
  { letter:'U', word:'Uniform', pronunciation:'YOU-NEE-FORM (also OO-NEE-FORM)' },
  { letter:'V', word:'Victor', pronunciation:'VIK-TAH' },
  { letter:'W', word:'Whiskey', pronunciation:'WISS-KEY' },
  { letter:'X', word:'Xray', pronunciation:'ECKS-RAY' },
  { letter:'Y', word:'Yankee', pronunciation:'YANG-KEY' },
  { letter:'Z', word:'Zulu', pronunciation:'ZOO-LOO' },
];

export const radioTerms = [
  { term:'Roger', meaning:'I received your last transmission. It does not answer a yes/no question.', example:'A pilot might say “Cessna 123AB, roger” to acknowledge a non-yes/no message.' },
  { term:'Wilco', meaning:'I received your message, understand it, and will comply.', example:'After a simulated instruction in a lesson, “Wilco” means it was received, understood, and will be followed.' },
  { term:'Say again', meaning:'Request a repeat of the last transmission, usually specifying what was not understood.', example:'If a radio message is unclear, a learner might ask, “Say again the last word, please.”' },
  { term:'Stand by', meaning:'Pause or wait briefly, often while higher-priority duties are handled; it is not approval or denial.', example:'A station might reply, “Cessna 123AB, stand by.” That is a request to wait, not a clearance.' },
  { term:'Affirmative', meaning:'Yes.', example:'In response to a yes/no question, “Affirmative” means yes.' },
  { term:'Negative', meaning:'No, permission not granted, or not correct.', example:'“Negative” can mean no, not approved, or not correct, depending on the question.' },
];

export type LanguageQuestion = { id:string; prompt:string; choices:string[]; correct:string; explanation:string };
export const languageQuestions: LanguageQuestion[] = [
  { id:'alphabet-alpha', prompt:'Which word represents the letter A in the aviation alphabet?', choices:['Alpha','Alfa','Bravo'], correct:'Alfa', explanation:'FAA/ICAO radio spelling uses Alfa, with an f, to distinguish it from other spellings.' },
  { id:'alphabet-zulu', prompt:'Which pronunciation guide matches Zulu?', choices:['ZOO-LOO','ZAY-LOO','ZOO-LOW'], correct:'ZOO-LOO', explanation:'The FAA pronunciation guide gives Zulu as ZOO-LOO.' },
  { id:'radio-roger', prompt:'What does “Roger” communicate?', choices:['I received your last transmission','Yes, permission granted','Please wait for approval'], correct:'I received your last transmission', explanation:'Roger acknowledges receipt; it must not be used as a yes/no answer.' },
  { id:'radio-repeat', prompt:'Which phrase asks for a transmission to be repeated?', choices:['Wilco','Say again','Stand by'], correct:'Say again', explanation:'“Say again” requests a repeat, often with the part not understood specified.' },
  { id:'radio-wilco', prompt:'What does “Wilco” mean?', choices:['I received, understand, and will comply','I do not understand','No, not correct'], correct:'I received, understand, and will comply', explanation:'Wilco combines receipt, understanding, and intention to comply.' },
  { id:'radio-standby', prompt:'What should you remember about “Stand by”?', choices:['It is a brief wait, not approval or denial','It always grants permission','It answers yes or no'], correct:'It is a brief wait, not approval or denial', explanation:'Stand by means pause or wait briefly; it does not grant or deny anything.' },
];
export type LanguageQuizState = { index:number; answers:Record<string,string> };
export const createLanguageQuiz = (): LanguageQuizState => ({ index:0, answers:{} });
export function answerLanguageQuestion(state: LanguageQuizState, question: LanguageQuestion, answer: string): LanguageQuizState {
  if (state.index >= languageQuestions.length || state.answers[question.id]) return state;
  return { ...state, answers:{ ...state.answers, [question.id]:answer } };
}
export function advanceLanguageQuiz(state: LanguageQuizState): LanguageQuizState {
  const question = languageQuestions[state.index];
  if (!question || !state.answers[question.id]) return state;
  return { ...state, index:state.index + 1 };
}
export function scoreLanguageQuiz(state: LanguageQuizState) {
  const correct = languageQuestions.filter((question) => state.answers[question.id] === question.correct).length;
  return { correct, total:languageQuestions.length, percentage:Math.round(correct / languageQuestions.length * 100) };
}
export function getLanguageQuizMisses(state: LanguageQuizState) {
  return languageQuestions.filter((question) => state.answers[question.id] !== question.correct).map((question) => ({
    ...question, answer:state.answers[question.id] ?? null,
  }));
}
export function spellPhonetic(input: string) {
  return [...input.toUpperCase()].filter((letter) => /^[A-Z]$/.test(letter)).map((letter) => {
    const entry = phoneticAlphabet.find((item) => item.letter === letter)!;
    return { ...entry };
  });
}
export const alphabetFlashcards: Flashcard[] = phoneticAlphabet.map(({ letter, word, pronunciation }) => ({
  id:`alphabet-${letter}`, term:letter, definition:`${word} · ${pronunciation}`,
}));
