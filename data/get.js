// dependencies
const file = require('./file')
const prepare = require('./prepare')

// get all authors from data/texts directory
const authors = (enrich = true) =>
  file.read('texts').map(id => author(id, enrich))

// get stubs for all texts
const texts = () =>
  authors()
    .map(a => a.texts.map(t => Object.assign(t, { author: a })))
    .reduce((x, y) => x.concat(y), [])
    .sort((x, y) => x.published[0] - y.published[0])

// get author from id
const author = (id, enrich = true) => {
  const author = file.open('texts', id)
  if (author) {
    return prepare.author(author, enrich)
  }
}

// get text from id
const text = (id, enrich = true) => {
  const text = file.open('texts', id)
  if (text) {
    return prepare.text(text, enrich)
  }
}

// get usage data from id
const usage = id =>
  file.open('cache/usage', id)

// get usage data from id
const tfidf = id =>
  file.open('cache/tfidf', id)

// exports
module.exports = {
  authors,
  texts,
  author,
  text,
  usage,
  tfidf
}
