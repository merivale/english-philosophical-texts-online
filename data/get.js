// dependencies
const fs = require('fs')
const path = require('./path')

// get array of all authors
const authors = (options = {}) =>
  fs.readdirSync(path('authors')).map(id => author(id, options))

// get author by id (optionally map text ids to enriched text data)
const author = (id, options = {}) => {
  const a = open('authors', id)
  if (!a) return undefined
  a.url = `/browse/${a.id.toLowerCase()}`
  a.fullname = a.title ? `${a.title} [${a.forename} ${a.surname}]` : `${a.forename} ${a.surname}`
  a.imported = a.texts.filter(id => text(id).imported)
  if (options.enrich) a.texts = a.texts.map(stub)
  if (options.concordance) a.concordance = concordance(id)
  return a
}

// get text by id
const text = (id, options = {}) => {
  let t = open('texts', id)
  if (!t) return undefined
  t.url = `/browse/${t.id.toLowerCase().replace(/\./g, '/')}`
  if (t.parent) {
    const parent = text(t.parent)
    t.published = t.published || parent.published
    t.copytext = t.copytext || parent.copytext
    t.source = t.source || parent.source
    t.comments = t.comments || parent.comments
    t.copyright = t.copyright || parent.copyright
    if (options.context) {
      const index = parent.texts.indexOf(t.id)
      if (index > 0) t.prev = stub(parent.texts[index - 1])
      if (index < parent.texts.length - 1) t.next = stub(parent.texts[index + 1])
      t.parent = stub(t.parent)
    }
  }
  if (options.enrich && t.texts) t.texts = t.texts.map(stub)
  if (options.concordance) t.concordance = concordance(id)
  return t
}

// create a text stub from a text id
const stub = (id) => {
  const t = text(id)
  if (!t) return undefined
  return {
    parent: t.parent ? stub(t.parent) : undefined,
    title: t.title,
    breadcrumb: t.breadcrumb,
    published: t.published,
    url: `/browse/${t.id.toLowerCase().replace(/\./g, '/')}`,
    imported: t.imported
  }
}

// get concordance data
const concordance = (id) =>
  open('concordances', id)

// get dictionary
const dictionary = (letter = null) => {
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
  if (letter && letters.includes(letter)) return open('dictionary', letter)
  return letters.map(l => open('dictionary', l))
    .reduce((sofar, current) => sofar.concat(current))
}

// open and parse a JSON file
const open = (type, id) =>
  fs.existsSync(path(type, id)) ? JSON.parse(fs.readFileSync(path(type, id))) : undefined

// export the getters
module.exports = { authors, author, text, concordance, dictionary }
