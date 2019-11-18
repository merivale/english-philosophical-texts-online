/**
 * Search the database of texts for paragraphs matching the input query.
 * @module Search
 *
 * @requires service/get.js:Get
 */

import * as get from './get.js'

/**
 * The reduced lexicon.
 * @constant {Object}
 */
const reducedLexicon = get.reducedLexicon()

/**
 * Search the database of texts for paragraphs matching the input query.
 *
 * @param {string[]} ids IDs of the texts to search.
 * @param {string|Object} query The search query.
 * @param {Object} options The search options.
 * @param {string|null} author ID of the author being searched; used to filter out subtexts by different authors.
 *
 * @returns {Object[]} An array of matches.
 */
export default function search (ids, query, options, author = null) {
  return ids.map(id => get.searchableText(id)) // map text IDs to searchable texts
    .filter(text => text.sex || text.imported) // remove texts that aren't imported or aren't authors
    .filter(text => (author === null) || text.id.indexOf(author) === 0) // remove sub texts by a different author
    .map(text => matches(text, query, options)) // get search matches
    .filter(result => result.total > 0) // remove texts with no matches
}

/**
 *  Get search matches from a text.
 *
 * @param {Object} text The text to search.
 * @param {string|Object} query The search query.
 * @param {Object} options The search options.
 *
 * @returns {Object} The search matches together with some metadata.
 */
function matches (text, query, options) {
  // initialise the result object
  const result = {
    id: text.id,
    title: text.title,
    matches: [],
    total: 0 // this total includes matches in sub texts
  }

  // check for a matching title
  if (text.fulltitle && hit(text.fulltitle, query, options)) {
    result.matches.push(matchedTitle(text.fulltitle, query, options, text.id))
    result.total += 1
  }

  // either search subtexts recursively for matches
  if (text.texts) {
    result.texts = search(text.texts, query, options, text.id.split('.')[0])
    result.texts.forEach(text => { result.total += text.total })
  }

  // or search the paragraphs and notes of this text
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

  // return the result
  return result
}

/**
 * Create a matched title for display.
 *
 * @param {string} fulltitle The title of the text.
 * @param {string|Object} query The search query.
 * @param {Object} options The search options.
 * @param {string} textId The ID of the text.
 *
 * @returns {Object}
 */
function matchedTitle (fulltitle, query, options, textId) {
  return ({
    id: textId,
    url: `/texts/${textId.toLowerCase().replace(/\./g, '/')}`,
    content: matchedContent(fulltitle, query, options)
  })
}

/**
 * Create a matched paragraph for display.
 *
 * @param {Object} paragraph The paragraph.
 * @param {string|Object} query The search query.
 * @param {Object} options The search options.
 * @param {string} textId The ID of the text.
 *
 * @returns {Object}
 */
function matchedParagraph (paragraph, query, options, textId) {
  return ({
    id: `${textId}.${paragraph.id}`,
    url: `/texts/${textId.toLowerCase().replace(/\./g, '/')}#${paragraph.id}`,
    content: matchedContent(paragraph.content, query, options)
  })
}

/**
 * Create a matched note for display.
 *
 * @param {Object} note The note.
 * @param {string|Object} query The search query.
 * @param {Object} options The search options.
 * @param {string} textId The ID of the text.
 *
 * @returns {Object}
 */
function matchedNote (note, query, options, textId) {
  return ({
    id: `${textId}.${note.paragraph}n${note.id}`,
    url: `/texts/${textId.toLowerCase().replace(/\./g, '/')}#n${note.id}`,
    content: matchedContent(note.content, query, options)
  })
}

/**
 * Create matched content (for titles, paragraphs, or notes).
 *
 * @param {string} content The content.
 * @param {string|Object} query The search query.
 * @param {Object} options The search options.
 *
 * @returns {string}
 */
function matchedContent (content, query, options) {
  return content.replace(regex(query, options), '<mark>$1</mark>')
}

/**
 * Look for a search query hit in some content.
 *
 * @param {string} content The text to search.
 * @param {string|query} query The search query.
 * @param {Object} options The search options.
 *
 * @returns {boolean} Whether the query matches the content.
 */
function hit (content, query, options) {
  // match string queries directly
  if (typeof query === 'string') {
    return (content.match(regex(query, options)) !== null)
  }

  // otherwise break down the query recursively
  switch (query.operator) {
    case 'and':
      return hit(content, query.query1, options) && hit(content, query.query2, options)

    case 'or':
      return hit(content, query.query1, options) || hit(content, query.query2, options)

    case 'bot': // "but not"
      return hit(content, query.query1, options) && !hit(content, query.query2, options)
  }
}

/**
 * Create a regular expression from the search query.
 *
 * @param {string|Object} query The search query.
 * @param {Object} options The search options.
 *
 * @return {RegExp}
 */
function regex (query, options) {
  return new RegExp(`(${regexString(query, options)})`, 'gi')
}

/**
 * Create the string for a regular expression from the search query.
 *
 * @param {string|Object} query The search query.
 * @param {Object} options The search options.
 *
 * @return {string}
 */
function regexString (query, options) {
  if (typeof query === 'string') {
    if (options.ignorePunctuation) {
      query = query.replace(/[.,:;?!()]/g, '')
    }

    let words = query.split(' ')

    if (options.variantSpellings) {
      words = words.map((word) => {
        const group = reducedLexicon.find(group => group.includes(word))
        return group ? `(${group.join('|')})` : word
      })
    }

    if (options.wholeWords) {
      words = words.map(word => `\\b${word}\\b`)
    }

    if (options.ignorePunctuation) {
      words = words.map(word => `\\(?${word}[.,;?!)]?`)
    }

    return words.join(' ')
  }

  switch (query.operator) {
    case 'and': // fallthrough
    case 'or':
      return `${regexString(query.query1, options)}|${regexString(query.query2, options)}`

    case 'bot': // "but not"
      return regexString(query.query1, options)
  }
}
