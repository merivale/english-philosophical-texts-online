const createError = require('http-errors')
const express = require('express')
const router = express.Router()
const area = 'browse'
const analyse = require('../data/analyse')
const file = require('../data/file')
const get = require('../data/get')

// index (list of authors)
router.get('/', (req, res) => {
  const authors = get.authors({ enrich: true })
  const males = authors.filter(a => a.sex === 'Male')
  const females = authors.filter(a => a.sex === 'Female')
  const authorsWithTexts = authors.filter(a => a.imported.length > 0)
  const imported = authors.reduce((acc, current) => acc + current.imported.length, 0)
  const total = authors.reduce((acc, current) => acc + current.texts.length, 0)
  res.render('browse/index', { area, authors, males, females, authorsWithTexts, imported, total })
})

// author page
router.get('/:id', (req, res, next) => {
  const author = get.author(req.params.id)
  if (author) {
    const available = author.texts.filter(x => x.imported)
    const desired = author.texts.filter(x => !x.imported)
    res.render('browse/author/index', { area, author, available, desired })
  } else {
    next(createError(404))
  }
})

// author details page (TODO)
router.get('/:id/details', (req, res, next) => {
  next(createError(404))
  // const author = get.author(req.params.id)
  // if (author) {
  //   res.render('browse/author/details', { area, author })
  // } else {
  //  next(createError(404))
  // }
})

// text table of contents page
router.get('/:id*/toc', (req, res, next) => {
  const author = get.author(req.params.id)
  const text = get.text(req.params.id + req.params['0'])
  const parent = text.texts ? text : (text.parent ? get.text(text.parent.id) : undefined)
  if (author && text && parent) {
    res.render('browse/text/toc', { area, author, text, parent })
  } else {
    next(createError(404))
  }
})

// text about page
router.get('/:id*/about', (req, res, next) => {
  const author = get.author(req.params.id)
  const text = get.text(req.params.id + req.params['0'])
  if (author && text) {
    res.render('browse/text/about', { area, author, text })
  } else {
    next(createError(404))
  }
})

// text details page
router.get('/:id*/details', (req, res, next) => {
  const author = get.author(req.params.id)
  const text = get.text(req.params.id + req.params['0'])
  if (author && text) {
    const raw = file.open(req.params.id + req.params['0'])
    const details = analyse(raw)
    res.render('browse/text/details', { area, author, text, details })
  } else {
    next(createError(404))
  }
})

// text page
router.get('/:id*', (req, res, next) => {
  const author = get.author(req.params.id)
  const text = get.text(req.params.id + req.params['0'])
  if (author && text) {
    res.render('browse/text/index', { area, author, text })
  } else {
    next(createError(404))
  }
})

module.exports = router
