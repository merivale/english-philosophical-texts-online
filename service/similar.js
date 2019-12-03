/*
 * Search the corpus of texts for sentences similar to the input sentence.
 */
import * as get from './get.js'
import * as prepare from './prepare.js'
import * as lexicon from './lexicon.js'

// compare sentences in the text with the given ID with the given sentence
export default function similar (id, sentence) {
  const text = get.text(id, false)
  if (text && (text.imported || text.sex)) {
    if (text.texts) {
      const sentences = []
      text.texts.forEach((id) => {
        if (id.match(text.id.split('.')[0])) { // skip past subtexts by different authors
          const result = similar(id, sentence)
          if (result) {
            sentences.push(...result)
          }
        }
      })
      return filterAndSort(sentences)
    } else {
      const sentences = get.sentences(id)
        .filter(s => s.id !== sentence.id) // don't match the sentence itself
        .map((s) => {
          const result = similarity(s.content, sentence.content)
          return Object.assign(s, { similarity: result.similarity, matched: result.matched })
        })
      return filterAndSort(sentences)
    }
  }
  return []
}

// get the array of common lemmas
const commonLemmas = lexicon.commonLemmas()

// compare two sentences
function similarity (s1, s2) {
  const lemmas1 = [...new Set(prepare.lemmatizedText(s1).split(' '))]
  const lemmas2 = [...new Set(prepare.lemmatizedText(s2).split(' '))]
  const sharedLemmas = lemmas1.filter(lemma => lemmas2.includes(lemma) && !commonLemmas.includes(lemma))
  const regexString = `\\b(${sharedLemmas.map(lexicon.regexString).join('|')})\\b`
  const regex = new RegExp(regexString, 'gi')
  return { similarity: sharedLemmas.length, matched: s1.replace(regex, '<mark>$1</mark>') }
}

// filter and sort an array of sentences
function filterAndSort (sentences) {
  sentences.sort((x, y) => y.similarity - x.similarity)
  return sentences[0]
    ? sentences.filter(x => x.similarity === sentences[0].similarity)
    : sentences
}
