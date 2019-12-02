/*
 * Controller for the TEXTS area of the site.
 */
import createError from 'http-errors'
import express from 'express'
import * as get from '../../service/get.js'

// create and export the router
const router = express.Router()
export default router

// define the area id
const area = 'texts'

// route for displaying a list of all texts
router.get('/', (req, res) => {
  const texts = get.texts()
  res.render('texts/index', { area, texts })
})

// route for displaying details of an author
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

// route for displaying author usage data
router.get('/:id/usage', (req, res, next) => {
  const author = get.author(req.params.id)
  if (author) {
    const usage = get.usage(author.id)
    res.render('texts/author/usage', { area, author, usage })
  } else {
    next(createError(404))
  }
})

// route for displaying a text's table of contents
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

// route for displaying a text's metadata
router.get('/:id*/about', (req, res, next) => {
  const author = get.author(req.params.id)
  const text = get.text(req.params.id + req.params['0'])
  if (author && text) {
    res.render('texts/text/about', { area, author, text })
  } else {
    next(createError(404))
  }
})

// route for displaying a text's usage data
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

// route for displaying a text's TF-IDF data
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

// route for displaying a text
router.get('/:id*', (req, res, next) => {
  const author = get.author(req.params.id)
  const text = get.text(req.params.id + req.params['0'])
  if (author && text) {
    res.render('texts/text/index', { area, author, text })
  } else {
    next(createError(404))
  }
})
