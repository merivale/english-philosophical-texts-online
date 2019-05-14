// dependencies
const fs = require('fs')
const file = require('./file')
const prepare = require('./prepare')

// get all authors from data directory
const authors = () =>
  fs.readdirSync(file.dir(), { withFileTypes: true })
    .filter(x => x.isDirectory())
    .map(x => x.name)
    .map(author)

// get author from id
const author = (id) => {
  const author = file.open(id)
  if (author) {
    return prepare.author(author)
  }
}

// get text from id
const text = (id) => {
  const text = file.open(id)
  if (text) {
    return prepare.text(text)
  }
}

// exports
module.exports = {
  authors,
  author,
  text
}
