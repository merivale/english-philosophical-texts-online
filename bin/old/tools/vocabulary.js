// dependencies
const get = require('../../data/get')
const save = require('../../data/save')

// strip content of all markup, punctuation, etc.
const strip = content =>
  content.toLowerCase()
    .replace(/[,.;:!?()]/g, '') // remove all punctuation
    .replace(/<a(.*?)>(.*?)<\/a>/g, '') // remove all footnote anchors
    .replace(/<i>(.*?)<\/i>/g, '') // remove all foreign language text
    .replace(/<cite>(.*?)<\/cite>/g, '') // remove all citations
    .replace(/<small>(.*?)<\/small>/g, '') // remove anything marked as <small>
    .replace(/<([^>]+)>/g, '') // remove all HTML tags
    .replace(/—/g, ' ') // replace mdashes with spaces
    .replace(/ {2}/g, ' ') // replace double spaces with single spaces

// extract the vocabulary from a text
const extractVocabulary = (vocabulary, id) => {
  const text = get.text(id)
  if (text.texts) {
    text.texts.forEach(extractVocabulary.bind(null, vocabulary))
  } else {
    const blocks = text.paragraphs.concat(text.notes)
    blocks.forEach((block) => {
      strip(block.content).split(' ').forEach((word) => {
        const existing = vocabulary.find(x => x.word === word)
        if (existing) {
          existing.paragraphs.push(`${text.id}.${block.id}`)
        } else {
          vocabulary.push({ word, paragraphs: [`${text.id}.${block.id}`] })
        }
      })
    })
  }
}

// create/update the vocabulary file for a given author
const updateVocabulary = (author) => {
  // initialize the vocabulary array
  const vocabulary = []
  // run through this author's texts, extracting vocabulary
  author.texts.forEach(extractVocabulary.bind(null, vocabulary))
  // save the vocabulary to disk
  save.vocabulary(author.id, vocabulary)
  console.log(`Updated vocabulary for ${author.id}`)
}

// update the vocabulary file for each author
get.authors().forEach(updateVocabulary)
