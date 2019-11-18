import createError from 'http-errors'
import express from 'express'
import * as get from '../../service/get.js'

const area = 'texts'

const router = express.Router()

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

// author usage page (TODO)
router.get('/:id/usage', (req, res, next) => {
  const author = get.author(req.params.id)
  if (author) {
    const usage = get.usage(author.id)
    res.render('texts/author/usage', { area, author, usage })
  } else {
    next(createError(404))
  }
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

// text usage page
router.get('/:id*/usage', (req, res, next) => {
  const author = get.author(req.params.id)
  const text = get.text(req.params.id + req.params['0'])
  if (author && text) {
    const usage = get.usage(req.params.id + req.params['0'])
    res.render('texts/text/usage', { area, author, text, usage })
  } else {
    next(createError(404))
  }
})

// tfidf page
router.get('/:id*/tfidf', (req, res, next) => {
  const author = get.author(req.params.id)
  const text = get.text(req.params.id + req.params['0'])
  if (author && text) {
    const tfidf = get.tfidf(req.params.id + req.params['0'])
    res.render('texts/text/tfidf', { area, author, text, tfidf })
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

export default router
