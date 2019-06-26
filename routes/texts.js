const createError = require('http-errors')
const express = require('express')
const router = express.Router()
const area = 'texts'
const analyse = require('../data/analyse')
const file = require('../data/file')
const get = require('../data/get')

// lits of all texts
router.get('/', (req, res) => {
  const texts = get.texts()
  res.render('texts/index', { area, texts })
})

// lits of all texts to be typed up
router.get('/totype', (req, res) => {
  const texts = get.texts().map(t => {
    const text = get.text(t.id)
    return Object.assign(t, { source: text.source, pages: text.pages })
  }).filter(t => !t.source)
  const checked = texts.filter(t => t.pages !== undefined)
  const pages = checked.reduce((sofar, current) => sofar + current.pages, 0)
  res.render('texts/totype', { area, texts, checked, pages })
})

// author page
router.get('/:id', (req, res, next) => {
  const author = get.author(req.params.id)
  if (author) {
    const available = author.texts.filter(x => x.imported)
    const desired = author.texts.filter(x => !x.imported)
    res.render('texts/author/index', { area, author, available, desired })
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
    res.render('texts/text/toc', { area, author, text, parent })
  } else {
    next(createError(404))
  }
})

// text about page
router.get('/:id*/about', (req, res, next) => {
  const author = get.author(req.params.id)
  const text = get.text(req.params.id + req.params['0'])
  if (author && text) {
    res.render('texts/text/about', { area, author, text })
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
    res.render('texts/text/details', { area, author, text, details })
  } else {
    next(createError(404))
  }
})

// text page
router.get('/:id*', (req, res, next) => {
  const author = get.author(req.params.id)
  const text = get.text(req.params.id + req.params['0'])
  if (author && text) {
    res.render('texts/text/index', { area, author, text })
  } else {
    next(createError(404))
  }
})

module.exports = router
