// dependencies
const get = require('./get')

// strip content so that it can be searched
const strip = content =>
  content.replace(/<i>(.*?)<\/i>/g, '') // remove foreign text
    .replace(/<a href="(.*?)"><sup>(.*?)<\/sup><\/a>/g, '') // remove footnote anchors
    .replace(/<label>(.*?)<\/label>/g, '') // remove margin comments
    .replace(/<small>(.*?)<\/small>/g, '') // remove small things
    .replace(/(<(.*?)>)/g, '') // remove all HTML markup
    .replace(/(&emsp;)+/g, ' ') // replace tabs with single spaces
    .replace(/\s\s/g, ' ').trim() // trim whitespace

// create the string for a regular expression from the search query
const regexString = (query) => {
  if (typeof query === 'string') {
    return query
  }
  switch (query.operator) {
    case 'and': // fallthrough
    case 'or':
      return `${regexString(query.query1)}|${regexString(query.query2)}`

    case 'bot':
      return regexString(query.query1)
  }
}

// create a regular expression from the search query
const regex = query =>
  new RegExp(`(${regexString(query)})`, 'gi')

// look for a search query hit in some content
const hit = (content, query) => {
  if (typeof query === 'string') {
    return (strip(content).match(regex(query)) !== null)
  }
  switch (query.operator) {
    case 'and':
      return hit(content, query.query1) && hit(content, query.query2)

    case 'or':
      return hit(content, query.query1) || hit(content, query.query2)

    case 'bot':
      return hit(content, query.query1) && !hit(content, query.query2)
  }
}

// prepare some matched content
const matchedContent = (content, query) =>
  strip(content).replace(regex(query), '<mark>$1</mark>')

// prepare a matched paragraph
const matchedParagraph = (paragraph, query) =>
  ({
    id: paragraph.id,
    content: matchedContent(paragraph.content, query)
  })

// prepare a matched note
const matchedNote = (note, query) =>
  ({
    id: note.id,
    paragraph: note.paragraph,
    content: matchedContent(note.content, query)
  })

// get search matches from a text
const matches = (text, query) => {
  const result = {
    id: text.id,
    title: text.title || text.surname,
    count: 0
  }
  if (text.fulltitle) {
    result.matchedTitle = hit(text.fulltitle, query) ? matchedContent(text.fulltitle, query) : false
    if (result.matchedTitle) result.count += 1
  }
  if (text.texts) {
    result.texts = search(text.texts, query)
    result.texts.forEach(text => { result.count += text.count })
  }
  if (text.paragraphs) {
    result.matchedParagraphs = text.paragraphs
      .filter(paragraph => hit(paragraph.content, query))
      .map(paragraph => matchedParagraph(paragraph, query))
    result.matchedNotes = text.notes
      .filter(note => hit(note.content, query))
      .map(note => matchedNote(note, query))
    result.count += result.matchedParagraphs.length + result.matchedNotes.length
  }
  return result
}

// whether the results are empty
const notEmpty = result =>
  result.matchedTitle ||
    (result.texts && result.texts.length > 0) ||
    (result.matchedParagraphs && result.matchedParagraphs.length > 0) ||
    (result.matchedNotes && result.matchedNotes.length) > 0

// the search function
const search = (ids, query) =>
  ids.map(id => get.text(id, false))
    .filter(text => text.sex || text.imported)
    .map(text => matches(text, query))
    .filter(notEmpty)

// exports
module.exports = search
