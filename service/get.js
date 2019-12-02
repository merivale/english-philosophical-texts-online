/*
 * Functions for getting data from the corpus.
 */
import { open, read } from './file.js'
import * as enrich from './enrich.js'
import inherit from './inherit.js'
import { formattedText } from './prepare.js'

// get all authors from data/texts directory
export function authors (enrichAuthor = true) {
  return read('texts').map(id => author(id, enrichAuthor))
}

// get stubs for all texts
export function texts () {
  return authors()
    .map(a => a.texts.map(t => Object.assign(t, { author: a })))
    .reduce((x, y) => x.concat(y), [])
    .sort((x, y) => x.published[0] - y.published[0])
}

// get author from id
export function author (id, enrichAuthor = true) {
  const author = open('texts', id)
  if (author) {
    author.fullname = author.title
      ? `${author.title} [${author.forename} ${author.surname}]`
      : `${author.forename} ${author.surname}`
    author.url = `/texts/${author.id.toLowerCase()}`
    return enrichAuthor ? enrich.author(author) : author
  }
  return null
}

// get text from id
export function text (id, enrichText = true) {
  const text = open('texts', id)
  if (text) {
    // format text content
    if (text.paragraphs) text.paragraphs.forEach((b) => { b.content = formattedText(b.content) })
    if (text.notes) text.notes.forEach((b) => { b.content = formattedText(b.content) })
    // inherit parent properties
    if (text.parent) {
      text.published = inherit(text, 'published')
      text.copytext = inherit(text, 'copytext')
      text.source = inherit(text, 'source')
      text.comments = inherit(text, 'comments')
      text.copyright = inherit(text, 'copyright')
    }
    return enrichText ? enrich.text(text) : text
  }
  return null
}

// get paragraph from id
export function paragraph (id, enrichParagraph = true) {
  const normalizedId = id.replace(/\//g, '.')
  const bits = normalizedId.split('.')
  const paragraphId = bits.pop()
  const textId = bits.join('.')
  const text = open('texts', textId)
  if (text && text.paragraphs) {
    const paragraph = text.paragraphs.find(x => x.id === paragraphId)
    if (paragraph) {
      paragraph.id = `${text.id}.${paragraph.id}`
      return enrichParagraph ? enrich.paragraph(paragraph) : paragraph
    }
    return null
  }
  return null
}

// get sentences from id
export function sentences (id) {
  const text = open('texts', id)
  if (text && text.imported) {
    if (text.texts) {
      return text.texts.map(sentences).reduce((x, y) => x.concat(y), [])
    }
    return open('cache/sentences', id)
  }
  return null
}

// get sentence from id
export function sentence (id) {
  const normalizedId = id.toLowerCase().replace(/\//g, '.')
  const bits = normalizedId.split('.')
  const textId = bits.slice(0, -2).join('.')
  const sentences = open('cache/sentences', textId)
  if (sentences) {
    return sentences.find(x => x.id.toLowerCase() === normalizedId) || null
  }
  return null
}

// get searchable text from id
export function searchableText (id) {
  return open('cache/search', id)
}

// get usage data from id
export function usage (id) {
  return open('cache/usage', id)
}

// get TF-IDF data from id
export function tfidf (id) {
  return open('cache/tfidf', id)
}

// get sub IDs
export function subIds () {
  return open('cache', 'sub-ids') || {}
}

// get paragraph IDs
export function paragraphIds () {
  return open('cache', 'paragraph-ids') || []
}
