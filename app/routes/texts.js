/*
 * Controller for the TEXTS area of the site.
 */
import createError from 'http-errors'
import express from 'express'
import * as get from '../../service/get.js'
import { open } from '../../service/file.js'

// create and export the router
const router = express.Router()
export default router

// define the area id
const area = 'texts'

// index page: redirect to the home page
router.get('/', (req, res) => {
  res.redirect('/')
})

// route for displaying details of an author
router.get('/:id', (req, res, next) => {
  const author = get.author(req.params.id, { enrich: true })
  if (author) {
    res.render('texts/author/index', { area, author })
  } else {
    next(createError(404))
  }
})

// route for displaying author usage data
router.get('/:id/usage', (req, res, next) => {
  const author = get.author(req.params.id)
  const usage = open('cache/usage', req.params.id)
  if (author && usage) {
    res.render('texts/author/usage', { area, author, usage })
  } else {
    next(createError(404))
  }
})

// route for displaying a text's table of contents
router.get('/:id*/toc', (req, res, next) => {
  const author = get.author(req.params.id)
  const text = get.text(req.params.id + req.params['0'])
  const toc = get.toc(req.params.id + req.params['0'])
  if (author && text && toc) {
    res.render('texts/text/toc', { area, author, text, toc })
  } else {
    next(createError(404))
  }
})

// route for displaying a text's metadata
router.get('/:id*/about', (req, res, next) => {
  const author = get.author(req.params.id)
  const text = get.text(req.params.id + req.params['0'], { inherit: true })
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
  const usage = open('cache/usage', req.params.id + req.params['0'])
  if (author && text && usage) {
    res.render('texts/text/usage', { area, author, text, usage })
  } else {
    next(createError(404))
  }
})

// route for displaying a text's TF-IDF data
router.get('/:id*/tfidf', (req, res, next) => {
  const author = get.author(req.params.id)
  const text = get.text(req.params.id + req.params['0'])
  const tfidf = open('cache/tfidf', req.params.id + req.params['0'])
  if (author && text && tfidf) {
    res.render('texts/text/tfidf', { area, author, text, tfidf })
  } else {
    next(createError(404))
  }
})

// route for displaying a text
router.get('/:id*', (req, res, next) => {
  try {
    const author = get.author(req.params.id)
    const text = get.text(req.params.id + req.params['0'], { enrich: true, format: true })
    if (author && text) {
      res.render('texts/text/index', { area, author, text })
    } else {
      next(createError(404))
    }
  } catch (error) {
    console.log(error)
    next(createError(500))
  }
})
