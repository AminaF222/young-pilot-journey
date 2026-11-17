import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  advanceLanguageQuiz,
  answerLanguageQuestion,
  alphabetFlashcards,
  createLanguageQuiz,
  getLanguageQuizMisses,
  languageQuestions,
  phoneticAlphabet,
  scoreLanguageQuiz,
  spellPhonetic,
} from './pilotLanguage.ts';

test('the phonetic alphabet contains 26 ordered letters with verified FAA spellings', () => {
  assert.equal(phoneticAlphabet.length, 26);
  assert.equal(phoneticAlphabet.map((entry) => entry.letter).join(''), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  assert.deepEqual(phoneticAlphabet.map(({letter,word,pronunciation}) => [letter,word,pronunciation]), [
    ['A','Alfa','AL-FAH'], ['B','Bravo','BRAH-VOH'], ['C','Charlie','CHAR-LEE (also SHAR-LEE)'],
    ['D','Delta','DELL-TAH'], ['E','Echo','ECK-OH'], ['F','Foxtrot','FOKS-TROT'], ['G','Golf','GOLF'],
    ['H','Hotel','HOH-TEL'], ['I','India','IN-DEE-AH'], ['J','Juliett','JEW-LEE-ETT'], ['K','Kilo','KEY-LOH'],
    ['L','Lima','LEE-MAH'], ['M','Mike','MIKE'], ['N','November','NO-VEM-BER'], ['O','Oscar','OSS-CAH'],
    ['P','Papa','PAH-PAH'], ['Q','Quebec','KEH-BECK'], ['R','Romeo','ROW-ME-OH'], ['S','Sierra','SEE-AIR-RAH'],
    ['T','Tango','TANG-GO'], ['U','Uniform','YOU-NEE-FORM (also OO-NEE-FORM)'], ['V','Victor','VIK-TAH'],
    ['W','Whiskey','WISS-KEY'], ['X','Xray','ECKS-RAY'], ['Y','Yankee','YANG-KEY'], ['Z','Zulu','ZOO-LOO'],
  ]);
  assert.equal(alphabetFlashcards.length, 26);
  assert.deepEqual(alphabetFlashcards[0], { id:'alphabet-A', term:'A', definition:'Alfa · AL-FAH' });
});

test('practice converts only A–Z characters to their phonetic entries', () => {
  assert.deepEqual(spellPhonetic('N123AB'), [
    phoneticAlphabet[13], phoneticAlphabet[0], phoneticAlphabet[1],
  ]);
  assert.deepEqual(spellPhonetic('sky!'), [phoneticAlphabet[18], phoneticAlphabet[10], phoneticAlphabet[24]]);
  assert.deepEqual(spellPhonetic('123'), []);
});

test('quiz locks an answered question until advancing and calculates score and missed review', () => {
  const first = languageQuestions[0];
  let state = answerLanguageQuestion(createLanguageQuiz(), first, 'Wrong');
  assert.equal(state.answers[first.id], 'Wrong');
  assert.equal(answerLanguageQuestion(state, first, first.correct).answers[first.id], 'Wrong');
  assert.equal(advanceLanguageQuiz(state).index, 1);
  for (let i = 1; i < languageQuestions.length; i += 1) {
    const question = languageQuestions[i];
    state = answerLanguageQuestion(state, question, question.correct);
    state = advanceLanguageQuiz(state);
  }
  assert.deepEqual(scoreLanguageQuiz(state), { correct:5, total:6, percentage:83 });
  assert.deepEqual(getLanguageQuizMisses(state).map(({id, answer, correct}) => ({id,answer,correct})), [
    { id:first.id, answer:'Wrong', correct:first.correct },
  ]);
});

test('an unanswered quiz question cannot advance and a fresh round resets all state', () => {
  const state = createLanguageQuiz();
  assert.equal(advanceLanguageQuiz(state), state);
  assert.deepEqual(createLanguageQuiz(), { index:0, answers:{} });
});
