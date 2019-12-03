/*
 * Function to check the text data.
 */
import jsdom from 'jsdom'
import * as get from '../../service/get.js'

// check all authors or one specified author
export default function (id = null) {
  if (id === null) {
    get.authors(false).forEach(checkAuthor)
  } else {
    checkAuthor(get.author(id))
  }
}

// check an author
function checkAuthor (author) {
  // check basic properties
  if (author.forename === undefined) {
    console.error(`No forename for ${author.id}`)
  }
  if (author.surname === undefined) {
    console.error(`No surname for ${author.id}`)
  }
  if (author.birth === undefined) {
    console.error(`No birth date for ${author.id}`)
  }
  if (author.death === undefined) {
    console.error(`No death date for ${author.id}`)
  }
  if (author.published === undefined) {
    console.error(`No first published date for ${author.id}`)
  }
  if (author.nationality === undefined) {
    console.error(`No nationality for ${author.id}`)
  }
  if (author.sex === undefined) {
    console.error(`No sex for ${author.id}`)
  }
  if (author.texts === undefined) {
    console.error(`No texts for ${author.id}`)
  }
  // check all of this author's texts
  author.texts.forEach(checkText)
}

// check a text
function checkText (id) {
  let text
  try {
    text = get.text(id, { inherit: true })
  } catch (error) {
    console.error(`${id}: Failed to open file; bad JSON?`)
    return
  }
  if (text) {
    if (text.duplicate) {
      return // don't bother rechecking duplicate texts
    }
    checkBasicData(text, id)
    if (text.imported) {
      checkImportedData(text, id)
      if (text.texts) {
        if (text.texts.length === 0) {
          console.error(`${id}: No content.`)
        } else {
          text.texts.forEach(checkText)
        }
      } else {
        if (text.paragraphs.length === 0) {
          console.error(`${id}: No content.`)
        } else {
          checkParagraphsAndNotes(text.paragraphs, text.notes, id)
        }
      }
    }
  } else {
    console.error(`${id}: No file found.`)
  }
}

// check basic data
function checkBasicData (text, id) {
  if (text.id !== id) {
    console.error(`${id}: Id does not match filename (${id} != ${text.id}).`)
  }
  if (text.title === undefined) {
    console.error(`${id}: No title.`)
  }
  if (text.breadcrumb === undefined) {
    console.error(`${id}: No breadcrumb.`)
  }
  if (text.fulltitle === undefined) {
    console.error(`${id}: No full title.`)
  }
}

// check properties for imported texts
function checkImportedData (text, id) {
  if (text.source === undefined) {
    console.error(`${id}: No source information.`)
  }
  if (text.comments === undefined) {
    console.error(`${id}: No comments.`)
  }
  if (text.copyright === undefined) {
    console.error(`${id}: No copyright information.`)
  }
}

// check paragraphs and notes
function checkParagraphsAndNotes (paragraphs, notes, id) {
  let paragraphId = 1
  let noteId = 1
  paragraphs.forEach((paragraph) => {
    const thisParagraphId = parseInt(paragraph.id)
    if (thisParagraphId) {
      if (thisParagraphId !== paragraphId) {
        console.error(`${id}.${paragraph.id}: Paragraph ID out of sync (${thisParagraphId} != ${paragraphId}).`)
      }
      paragraphId += 1
    } else {
      // this might be fine, if the paragraph ID is in Roman numerals, but warn to be on the safe side
      console.warn(`${id}.${paragraph.id}: Paragraph ID is not a number.`)
    }
    let fragment
    try {
      fragment = new jsdom.JSDOM(paragraph.content).window.document
    } catch (error) {
      console.error(`${id}.${paragraph.id}: Bad HTML.`)
      return
    }
    const anchors = Array.from(fragment.querySelectorAll('a'))
    anchors.forEach((anchor) => {
      const match = anchor.innerHTML.match(/<sup>\[(.*?)\]<\/sup>/)
      if (match && match[1]) {
        if (isNaN(parseInt(match[1]))) {
          console.warn(`${id}.${paragraph.id}: Note anchor reference is not a number (${match[1]})`)
        } else {
          if (noteId === 1) {
            // skip the check the first time round, since some texts continue note counts from previous sections
            noteId = parseInt(match[1])
          }
          if (noteId !== parseInt(match[1])) {
            console.error(`${id}.${paragraph.id}: Note ID out of sync (${noteId} != ${match[1]}).`)
          }
          noteId += 1
        }
        const note = notes.find(x => x.id === match[1])
        if (note) {
          if (note.paragraph !== paragraph.id) {
            console.error(`${id}.${paragraph.id}: Note paragraph ID mismatch (${paragraph.id} != ${note.paragraph}).`)
          }
        } else {
          console.error(`${id}.${paragraph.id}: Note reference not found (${match[1]}).`)
        }
      } else {
        console.error(`${id}.${paragraph.id}: Bad footnote anchor (${anchor.innerHTML}).`)
      }
    })
  })
}
