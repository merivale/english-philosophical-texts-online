/*
 * Functions for enriching author and text data with some useful derivative properties.
 */
import { open } from './file.js'
import inherit from './inherit.js'
import * as prepare from './prepare.js'

/*
 * enrich author data
 */
export function author (author) {
  author.texts = author.texts.map(stub)
  author.imported = author.texts.filter(t => t.imported)
  author.desired = author.texts.filter(t => !t.imported)
}

/*
 * enrich text data
 */
export function text (text) {
  text.breadcrumb = breadcrumb(text)
  text.next = next(text)
  text.previous = previous(text)
  if (text.parent) {
    text.parent = stub(text.parent)
  }
  if (text.texts) {
    text.texts = text.texts.map(stub)
  }
  return text
}

/*
 * enrich a paragraph
 */
export function paragraph (paragraph) {
  paragraph.sentences = prepare.plainSentences(paragraph.content)
  return paragraph
}

/*
 * get a text's breadcrumb trail
 */
function breadcrumb (text) {
  return text.parent
    ? breadcrumb(open('texts', text.parent)).concat([stub(text.id)])
    : [stub(text.id)]
}

/*
 * get a text's next text
 */
function next (text, down = true) {
  if (text.texts && text.texts.length && down) {
    return stub(text.texts[0])
  }
  if (text.parent) {
    const parent = open('texts', text.parent)
    const index = parent.texts.indexOf(text.id)
    if (index < parent.texts.length - 1) {
      return stub(parent.texts[index + 1])
    }
    if (parent.parent) {
      return next(parent, false)
    }
  }
  return null
}

/*
 * get a text's previous text
 */
function previous (text) {
  if (text.parent) {
    const parent = open('texts', text.parent)
    const index = parent.texts.indexOf(text.id)
    if (index === 0) {
      return stub(text.parent)
    }
    return lastDescendant(open('texts', parent.texts[index - 1]))
  }
  return null
}

/*
 * get a text's last descendant
 */
function lastDescendant (text) {
  return (text.texts && text.texts.length)
    ? lastDescendant(open('texts', text.texts[text.texts.length - 1]))
    : stub(text.id)
}

/*
 * get stub text data (for links, breadcrumb trails, etc.)
 */
function stub (id) {
  const text = open('texts', id)
  if (text) {
    return {
      id: text.id,
      imported: text.imported,
      duplicate: text.duplicate,
      title: text.title,
      published: inherit(text, 'published'),
      breadcrumb: text.breadcrumb,
      url: `/texts/${text.id.toLowerCase().replace(/\./g, '/')}`
    }
  }
  return null
}
