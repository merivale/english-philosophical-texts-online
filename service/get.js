/*
 * Functions for getting data from the corpus.
 */
import { open, read } from './file.js'
import * as enrich from './enrich.js'
import inherit from './inherit.js'
import { formattedText } from './prepare.js'

/*
 * get all authors from the `data/texts` directory
 */
export function authors (options = {}) {
  return read('texts').map(id => author(id, options))
}

/*
 * get an author with the given ID
 */
export function author (id, options = {}) {
  // look for the author file
  const author = open('texts', id)

  // return null if not found
  if (!author) return null

  // always add basic derivative properties
  author.fullname = author.title
    ? `${author.title} [${author.forename} ${author.surname}]`
    : `${author.forename} ${author.surname}`
  author.url = `/texts/${author.id.toLowerCase()}`

  // optionally enrich data concerning the author's texts
  if (options.enrich) enrich.author(author)

  // return the author
  return author
}

/*
 * get a text with the given ID
 */
export function text (id, options = {}) {
  // look for the text file
  const text = open('texts', id)

  // return null if not found
  if (!text) return null

  // always add basic derivative properties
  text.url = `/texts/${text.id.toLowerCase().replace(/\./g, '/')}`

  // optionally enrich data concerning subtexts and surrounding texts
  if (options.enrich) {
    enrich.text(text)
  }

  // optionally format text content
  if (options.format && text.paragraphs) {
    text.paragraphs.forEach((b) => { b.content = formattedText(b.content) })
    text.notes.forEach((b) => { b.content = formattedText(b.content) })
  }

  // optionally inherit parent properties
  if (options.inherit && text.parent) {
    text.published = inherit(text, 'published')
    text.copytext = inherit(text, 'copytext')
    text.source = inherit(text, 'source')
    text.comments = inherit(text, 'comments')
    text.copyright = inherit(text, 'copyright')
  }

  // return the text
  return text
}

/*
 * get table of contents for a text with the given ID
 */
export function toc (id) {
  // look for the text file
  const text = open('texts', id)

  // return null if not found
  if (!text) return null

  // return null if this is an isolated text
  if (!text.texts && !text.parent) return null

  // define the relevant collection to base the TOC on
  const collection = text.texts ? text : text.parent

  // enrich the collection to include stubs of all its members
  enrich.text(collection)

  // return what we need from the enriched collection
  return {
    title: collection.title,
    texts: collection.texts
  }
}

// TODO... (rewritten this module only up to here)

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
