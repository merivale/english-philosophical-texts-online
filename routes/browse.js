const createError = require('http-errors')
const express = require('express')
const router = express.Router()
const area = 'browse'
const get = require('../data/get')

// index (list of authors)
router.get('/', (req, res) => {
  const authors = get.authors({ enrich: true })
  const maleAuthors = authors.filter(a => a.sex === 'Male')
  const femaleAuthors = authors.filter(a => a.sex === 'Female')
  const authorsWithTexts = authors.filter(a => a.imported.length > 0)
  const imported = authors.reduce((acc, current) => acc + current.imported.length, 0)
  const total = authors.reduce((acc, current) => acc + current.texts.length, 0)
  res.render('browse/index', { area, authors, maleAuthors, femaleAuthors, authorsWithTexts, imported, total })
})

// author main page
router.get('/:author', (req, res, next) => {
  const author = get.author(req.params.author, { enrich: true })
  if (author) {
    const available = author.texts.filter(x => x.imported)
    const desired = author.texts.filter(x => !x.imported)
    res.render('browse/author', { area, author, available, desired })
  } else {
    next(createError(404))
  }
})

// text about page
router.get('/:author/:text*/about', (req, res, next) => {
  const author = get.author(req.params.author)
  const textId = `${req.params.author}/${req.params.text}${req.params[0]}`
  const text = get.text(textId, { context: true })
  if (author && text) {
    res.render('browse/about', { area, author, text })
  } else {
    next(createError(404))
  }
})

// text details page
router.get('/:author/:text*/details', (req, res) => {
  const author = get.author(req.params.author)
  const textId = `${req.params.author}/${req.params.text}${req.params[0]}`
  const text = get.text(textId, { context: true })
  if (author && text && text.imported && text.paragraphs) {
    const details = get.details(text)
    const lexemes = get.lexemes(text)
    res.render('browse/details', { area, author, text, details, lexemes })
  } else {
    res.status(404).end()
  }
})

// text main page
router.get('/:author/:text*', (req, res, next) => {
  const author = get.author(req.params.author)
  const textId = `${req.params.author}/${req.params.text}${req.params[0]}`
  const text = get.text(textId, { context: true, enrich: true })
  if (author && text) {
    res.render('browse/text', { area, author, text })
  } else {
    next(createError(404))
  }
})

module.exports = router
