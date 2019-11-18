// dependencies
import createError from 'http-errors'
import express from 'express'
import * as get from '../../service/get.js'

const router = express.Router()

// return authors array
router.get('/authors.json', (req, res, next) => {
  const authors = get.authors()
  res.json(authors)
})

// return author
router.get('/author/:id.json', (req, res, next) => {
  const author = get.author(req.params.id)
  if (author) {
    res.json(author)
  } else {
    next(createError(404))
  }
})

// return text
router.get('/text/:id*.json', (req, res, next) => {
  const text = get.text(req.params.id + req.params['0'])
  if (text) {
    res.json(text)
  } else {
    next(createError(404))
  }
})

// return usage data for a text
router.get('/usage/:id*.json', (req, res, next) => {
  const usage = get.usage(req.params.id + req.params['0'])
  if (usage) {
    res.json(usage)
  } else {
    next(createError(404))
  }
})

export default router
