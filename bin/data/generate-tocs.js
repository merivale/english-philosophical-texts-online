// dependencies
const get = require('../../data/get')
const save = require('../../data/save')

const makeTOC = (id) => {
  const text = get.text(id)
  const toc = {
    id: id,
    title: text.title,
    published: text.published,
    imported: text.imported,
    url: text.url
  }
  if (text.texts) toc.texts = text.texts.map(makeTOC)
  return toc
}

const flattenTOC = toc =>
  toc.texts.reduce((acc, val) => val.texts ? acc.concat(flattenTOC(val)) : acc.concat(val), [])

const authors = get.authors()

authors.forEach((author) => {
  author.texts.forEach((id) => {
    const toc = makeTOC(id)
    if (toc.texts) toc.flat = flattenTOC(toc)
    save.toc(toc)
  })
  console.log(`Saved TOC files for ${author.id}`)
})
