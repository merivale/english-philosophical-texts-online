// dependencies
const createError = require('http-errors')
const express = require('express')
const router = express.Router()
const analyse = require('../data/analyse')
const get = require('../data/get')
const file = require('../data/file')

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

// return analysis of text
router.get('/analysis/:id*.json', (req, res, next) => {
  const text = get.text(req.params.id + req.params['0'])
  if (text) {
    const details = analyse(text)
    res.json(details)
  } else {
    next(createError(404))
  }
})

// return raw json
router.get('/:id*.json', (req, res, next) => {
  const data = file.open(req.params.id + req.params['0'])
  if (data) {
    res.json(data)
  } else {
    next(createError(404))
  }
})

module.exports = router
