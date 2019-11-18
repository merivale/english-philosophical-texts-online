import * as get from '../../service/get.js'

export default function checkAuthors () {
  get.authors(false).forEach(checkAuthor)
}

function checkAuthor (author) {
  if (author.forename === undefined) console.log(`No forename for ${author.id}`)
  if (author.surname === undefined) console.log(`No surname for ${author.id}`)
  if (author.birth === undefined) console.log(`No birth date for ${author.id}`)
  if (author.death === undefined) console.log(`No death date for ${author.id}`)
  if (author.published === undefined) console.log(`No first published date for ${author.id}`)
  if (author.nationality === undefined) console.log(`No nationality for ${author.id}`)
  if (author.sex === undefined) console.log(`No sex for ${author.id}`)
  if (author.texts === undefined) console.log(`No texts for ${author.id}`)
  author.texts.forEach(checkText)
}

function checkText (id) {
  const text = get.text(id)
  if (text) {
    if (text.id !== id) console.log(`Id does not match filename for ${id}`)
    if (text.title === undefined) console.log(`No title for ${id}`)
    if (text.breadcrumb === undefined) console.log(`No title for ${id}`)
    if (text.fulltitle === undefined) console.log(`No title for ${id}`)
    if (text.imported) {
      if (text.source === undefined) console.log(`No source information for ${id}`)
      if (text.comments === undefined) console.log(`No comments for ${id}`)
      if (text.copyright === undefined) console.log(`No copyright information for ${id}`)
      if (text.texts) {
        if (text.texts.length === 0) console.log(`No content for ${id}`)
      } else {
        if (text.paragraphs.length === 0) console.log(`No content for ${id}`)
      }
    }
    if (text.texts) text.texts.forEach(checkText)
  } else {
    console.log(`No text file found for ${id}`)
  }
}
