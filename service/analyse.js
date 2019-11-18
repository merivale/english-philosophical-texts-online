// dependencies
import * as get from '../service/get.js'

const lexicon = get.lexicon()

// analyse textual data
export default function analyse (text) {
  const blocks = text.paragraphs.concat(text.notes)
  const tokens = blocks.map(block => tokenize(block.content)).reduce((x, y) => x.concat(y), [])
  const numbers = tokens.filter(x => !isNaN(x[0])).sort()
  const words = tokens.filter(x => isNaN(x[0]))
  const lexemes = lemmatize(words)
  return {
    people: people(blocks),
    citations: citations(blocks),
    foreign: foreign(blocks),
    numbers,
    count: words.length,
    lexemes: lexemes.lexemes,
    unidentified: lexemes.unidentified
  }
}

// convert a string of marked-up text to an array of (plain text) words
const tokenize = content =>
  content.toLowerCase()
    .replace(/&emsp;/g, '') // remove tabs (EM space entities)
    .replace(/<a(.*?)>(.*?)<\/a>/g, '') // remove all footnote anchors
    .replace(/<i>(.*?)<\/i>/g, '') // remove all foreign language text
    .replace(/<cite>(.*?)<\/cite>/g, '') // remove all citations
    .replace(/(<(b|em)>)?<u>(.*?)<\/u>(<\/(b|em)>)?('s)?/g, '') // remove all names
    .replace(/<label>(.*?)<\/label>/g, '') // remove all margin notes
    .replace(/<small>(.*?)<\/small>/g, '') // remove anything marked as <small>
    .replace(/<([^>]+)>/g, '') // remove all remaining HTML tags
    .replace(/—/g, ' ') // replace long dashes with spaces
    .replace(/-+/g, ' ') // replace sequences of two or more short dashes with spaces
    .split(' ') // split into an array of words
    .map((x) => { // get rid of punctuation
      if (x === 'i.e.' || x === 'e.g.' || x === '&amp;' || x === '&amp;c.') return x
      return x.replace(/[,.;:!?()]/g, '')
    })
    .filter(x => x.length > 0) // get rid of empties

// get lexemes and unidentified words from words
const lemmatize = (words) => {
  const entries = Object.entries(lexicon)
  const lexemes = []
  const unidentified = []
  words.forEach((word) => {
    const lexeme = entries.find(x => x[0] === word || x[1].includes(word))
    const lemma = lexeme ? lexeme[0] : undefined
    if (lemma) {
      const existing = lexemes.find(x => x.lemma === lemma)
      if (existing) {
        existing.frequency += 1
      } else {
        lexemes.push({ lemma, frequency: 1 })
      }
    } else {
      const existing = unidentified.find(x => x.word === word)
      if (existing) {
        existing.frequency += 1
      } else {
        unidentified.push({ word, frequency: 1 })
      }
    }
  })
  lexemes.sort((x, y) => x.lemma.localeCompare(y.lemma, 'en'))
  lexemes.forEach((lexeme) => { lexeme.lemma = formatLemma(lexeme.lemma) })
  unidentified.sort((x, y) => x.word.localeCompare(y.word, 'en'))
  return { lexemes, unidentified }
}

// format lemma for display
const formatLemma = lemma =>
  lemma.replace(/_\b/g, '') // get rid of disambiguating underscores at the ends of words
    .replace(/apriori/g, 'a priori') // reinstate spaces between 'a priori'
    .replace(/aposteriori/g, 'a posteriori') // reinstate spaces between 'a posteriori'
    .replace(/ipsofacto/g, 'ipso facto') // reinstate spaces between 'ipso facto'

// get named people from blocks
const people = blocks =>
  blocks.map(block => block.content.match(/<u>.*?<\/u>/g))
    .reduce((x, y) => x.concat(y), []).filter(Boolean)
    .map(x => x.replace(/<([^>]+)>/g, '')) // strip html
    .sort().reduce((sofar, current) => {
      const existing = sofar.find(x => x.name === current)
      if (existing) {
        existing.frequency += 1
      } else {
        sofar.push({ name: current, frequency: 1 })
      }
      return sofar
    }, [])

// get citations from blocks
const citations = blocks =>
  blocks.map(block => block.content.match(/<cite>.*?<\/cite>/g))
    .reduce((x, y) => x.concat(y), []).filter(Boolean)

// get foreign text from blocks
const foreign = blocks =>
  blocks.map(block => block.content.match(/<i>.*?<\/i>/g))
    .reduce((x, y) => x.concat(y), []).filter(Boolean)
