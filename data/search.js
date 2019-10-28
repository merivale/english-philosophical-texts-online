// dependencies
const get = require('./get')

// strip content so that it can be searched
const strip = content =>
  content.replace(/<a href="(.*?)"><sup>(.*?)<\/sup><\/a>/g, '') // remove footnote anchors
    .replace(/<label>(.*?)<\/label>/g, '') // remove margin comments
    .replace(/<small>(.*?)<\/small>/g, '') // remove small things
    .replace(/(<(.*?)>)/g, '') // remove all HTML markup
    .replace(/(&emsp;)+/g, ' ') // replace tabs with single spaces
    .replace(/\s\s/g, ' ').trim() // trim whitespace

// create the string for a regular expression from the search query
const regexString = (query, options) => {
  if (typeof query === 'string') {
    if (options.variantSpellings) {
      // TODO
    }
    if (options.wholeWords) {
      // add word break before and after every word
      query = query.split(' ').map(word => `\\b${word}\\b`).join(' ')
    }
    if (options.ignorePunctuation) {
      // remove all punctuation from query string
      query = query.replace(/[.,;?!()]/g, '')
      // add optional punctuation before and after every word
      query = query.split(' ').map(word => `\\(?${word}[.,;?!)]?`).join(' ')
    }
    return query
  }

  switch (query.operator) {
    case 'and': // fallthrough
    case 'or':
      return `${regexString(query.query1, options)}|${regexString(query.query2, options)}`

    case 'bot':
      return regexString(query.query1, options)
  }
}

// create a regular expression from the search query
const regex = (query, options) =>
  new RegExp(`(${regexString(query, options)})`, 'gi')

// look for a search query hit in some content
const hit = (content, query, options) => {
  if (typeof query === 'string') {
    return (strip(content).match(regex(query, options)) !== null)
  }

  switch (query.operator) {
    case 'and':
      return hit(content, query.query1, options) && hit(content, query.query2, options)

    case 'or':
      return hit(content, query.query1, options) || hit(content, query.query2, options)

    case 'bot':
      return hit(content, query.query1, options) && !hit(content, query.query2, options)
  }
}

// prepare some matched content
const matchedContent = (content, query, options) =>
  strip(content).replace(regex(query, options), '<mark>$1</mark>')

// prepare a matched paragraph
const matchedTitle = (fulltitle, query, options, textId) =>
  ({
    id: textId,
    url: `/texts/${textId.toLowerCase().replace(/\./g, '/')}`,
    content: matchedContent(fulltitle, query, options)
  })

// prepare a matched paragraph
const matchedParagraph = (paragraph, query, options, textId) =>
  ({
    id: `${textId}.${paragraph.id}`,
    url: `/texts/${textId.toLowerCase().replace(/\./g, '/')}#${paragraph.id}`,
    content: matchedContent(paragraph.content, query, options)
  })

// prepare a matched note
const matchedNote = (note, query, options, textId) =>
  ({
    id: `${textId}.${note.paragraph}n${note.id}`,
    url: `/texts/${textId.toLowerCase().replace(/\./g, '/')}#n${note.id}`,
    content: matchedContent(note.content, query, options)
  })

// get search matches from a text
const matches = (text, query, options) => {
  const result = {
    id: text.id,
    title: text.title || text.surname,
    matches: [],
    total: 0 // includes matches in sub texts
  }
  if (text.fulltitle && hit(text.fulltitle, query, options)) {
    result.matches.push(matchedTitle(text.fulltitle, query, options, text.id))
    result.total += 1
  }
  if (text.texts) {
    result.texts = search(text.texts, query, options, text.id.split('.')[0])
    result.texts.forEach(text => { result.total += text.total })
  }
  if (text.paragraphs) {
    const matchedParagraphs = text.paragraphs
      .filter(paragraph => hit(paragraph.content, query, options))
      .map(paragraph => matchedParagraph(paragraph, query, options, text.id))
    const matchedNotes = text.notes
      .filter(note => hit(note.content, query, options))
      .map(note => matchedNote(note, query, options, text.id))
    result.matches.push(...matchedParagraphs)
    result.matches.push(...matchedNotes)
    result.total += matchedParagraphs.length + matchedNotes.length
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
const search = (ids, query, options, author = null) =>
  ids.map(id => get.text(id, false)) // get texts from their IDs (not enriched)
    .filter(text => text.sex || text.imported) // remove texts that aren't imported or aren't authors
    .filter(text => (author === null) || text.id.indexOf(author) === 0) // remove sub texts by a different author
    .map(text => matches(text, query, options)) // get search matches
    .filter(result => result.total > 0) // remove texts with no matches

// exports
module.exports = search
