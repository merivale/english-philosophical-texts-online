// dependencies
const file = require('./file')

// prepare author data
const author = (author) => {
  author.fullname = author.title
    ? `${author.title} [${author.forename} ${author.surname}]`
    : `${author.forename} ${author.surname}`
  author.url = `/texts/${author.id.toLowerCase()}`
  author.texts = author.texts.map(stub)
  author.imported = author.texts.filter(t => t.imported)
  return author
}

// prepare text data
const text = (text) => {
  text.breadcrumb = breadcrumb(text)
  text.next = next(text)
  text.previous = previous(text)
  text.url = `/texts/${text.id.toLowerCase().replace(/\./g, '/')}`
  if (text.parent) {
    text.published = inherit(text, 'published')
    text.copytext = inherit(text, 'copytext')
    text.source = inherit(text, 'source')
    text.comments = inherit(text, 'comments')
    text.copyright = inherit(text, 'copyright')
    text.parent = stub(text.parent)
  }
  if (text.texts) text.texts = text.texts.map(stub)
  if (text.paragraphs) text.paragraphs.forEach((b) => { b.content = formatContent(b.content) })
  if (text.notes) text.notes.forEach((b) => { b.content = formatContent(b.content) })
  return text
}

// format content of a block for reading
const formatContent = content =>
  content.replace(/_/g, '') // remove underscores (used for disambiguating lemmas)
    .replace(/\b(I|i)pso(F|f)acto\b/g, '$1pso $2acto') // reinstate space in 'ipso facto'
    .replace(/\b(A|a)(P|p)riori\b/g, '$1 $2riori') // reinstate space in 'a priori'
    .replace(/\b(A|a)(P|p)osteriori\b/g, '$1 $2osteriori') // reinstate space in 'a posteriori'

// get a text's breadcrumb trail
const breadcrumb = (text) =>
  text.parent ? breadcrumb(file.open(text.parent)).concat([stub(text.id)]) : [stub(text.id)]

// get a text's next text
const next = (text, down = true) => {
  if (text.texts && text.texts.length && down) return stub(text.texts[0])
  if (text.parent) {
    const parent = file.open(text.parent)
    const index = parent.texts.indexOf(text.id)
    if (index < parent.texts.length - 1) return stub(parent.texts[index + 1])
    if (parent.parent) return next(parent, false)
  }
}

// get a text's previous text
const previous = (text) => {
  if (text.parent) {
    const parent = file.open(text.parent)
    const index = parent.texts.indexOf(text.id)
    if (index === 0) return stub(text.parent)
    return lastDescendant(file.open(parent.texts[index - 1]))
  }
}

// get a text's last descendant
const lastDescendant = (text) =>
  (text.texts && text.texts.length)
    ? lastDescendant(file.open(text.texts[text.texts.length - 1]))
    : stub(text.id)

// get stub text data (for links, breadcrumb trails, etc.)
const stub = (id) => {
  const text = file.open(id)
  if (text) {
    return {
      id: text.id,
      imported: text.imported,
      title: text.title,
      published: inherit(text, 'published'),
      breadcrumb: text.breadcrumb,
      url: `/texts/${text.id.toLowerCase().replace(/\./g, '/')}`
    }
  }
}

// get inherited property from a text's ancestor
const inherit = (text, property) => {
  if (text[property]) return text[property]
  if (text.parent) return inherit(file.open(text.parent), property)
}

module.exports = {
  author,
  text
}
