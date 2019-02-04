// dependencies
const fs = require('fs')
const path = require('./path')

// save author data
const author = (data) => {
  save('authors', Author(data))
}

// save text data
const text = (data) => {
  save('texts', Text(data))
}

// save concordance data
const concordance = (data) => {
  if (data.words) data.words.sort(sortWords)
  save('concordances', Concordance(data))
}

// save dictionary data
const dictionary = (data) => {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyz'.split('')
  const files = characters.map(c => data.filter(x => x.lexeme[0] === c))
  files.push(data.filter(x => characters.indexOf(x.lexeme[0]) === -1))
  characters.push('_')
  const sortEntries = (x, y) => {
    if (x.lexeme === y.lexeme) return x.word.localeCompare(y.word, 'en')
    return x.lexeme.localeCompare(y.lexeme, 'en')
  }
  files.forEach((f, index) => {
    f.sort(sortEntries)
    save('dictionary', f, characters[index])
  })
}

// word sort function
const sortWords = (x, y) => {
  if (x.count === y.count) return x.word.localeCompare(y.word, 'en')
  return y.count - x.count
}

// save a file to disk
const save = (type, object, filename = null) => {
  fs.writeFileSync(path(type, filename || object.id), `${JSON.stringify(object, null, 2)}\n`)
}

// regiment author data
const Author = (data) => ({
  id: data.id,
  forename: data.forename,
  surname: data.surname,
  title: data.title || undefined,
  birth: data.birth,
  death: data.death,
  published: data.published,
  nationality: data.nationality,
  sex: data.sex,
  texts: data.texts || []
})

// regiment text data
const Text = (data) => ({
  id: data.id,
  parent: data.parent || undefined,
  title: data.title,
  breadcrumb: data.breadcrumb,
  fulltitle: data.fulltitle,
  published: data.published,
  copytext: data.copytext || undefined,
  source: data.source || undefined,
  imported: data.imported || false,
  duplicate: data.duplicate || undefined,
  comments: data.comments || undefined,
  copyright: data.copyright || undefined,
  texts: data.texts ? data.texts : undefined,
  paragraphs: data.paragraphs ? data.paragraphs.map(Paragraph) : undefined,
  notes: data.notes ? data.notes.map(Note) : undefined
})

// regiment paragraph data
const Paragraph = (data) => ({
  id: data.id,
  title: data.title || undefined,
  before: data.before || undefined,
  content: data.content
})

// regiment note data
const Note = (data) => ({
  id: data.id,
  paragraph: data.paragraph,
  content: data.content
})

// regiment index data
const Concordance = (data) => ({
  id: data.id,
  total: data.total || 0,
  words: data.words || []
})

// export the save functions
module.exports = { author, text, concordance, dictionary }
