/*
 * Controller for returning JSON data from the corpus.
 */
import createError from 'http-errors'
import express from 'express'
import * as get from '../../service/get.js'
import * as lexicon from '../../service/lexicon.js'
import similar from '../../service/similar.js'

// create and export the router
const router = express.Router()
export default router

// route for downloading the lexicon
router.get('/lexicon.json', (req, res, next) => {
  res.json(lexicon.raw())
})

// route for downloading map of sub IDs
router.get('/sub-ids.json', (req, res, next) => {
  res.json(get.subIds())
})

// route for downloading array of paragraph IDs
router.get('/paragraph-ids.json', (req, res, next) => {
  res.json(get.paragraphIds())
})

// route for downloading an array of enriched author data
router.get('/authors.json', (req, res, next) => {
  res.json(get.authors())
})

// route for downloading enriched data about an individual author
router.get('/author/:id.json', (req, res, next) => {
  const author = get.author(req.params.id)
  if (author) {
    res.json(author)
  } else {
    next(createError(404))
  }
})

// route for downloading an enriched text
router.get('/text/:id*.json', (req, res, next) => {
  const text = get.text(req.params.id + req.params['0'])
  if (text) {
    res.json(text)
  } else {
    next(createError(404))
  }
})

// route for downloading an array of sub-IDs for the given author/text
router.get('/subids/:id*.json', (req, res, next) => {
  const subIds = get.subIds()
  const id = req.params.id + req.params['0']
  if (subIds[id]) {
    res.json(subIds[id])
  } else {
    next(createError(404))
  }
})

// route for downloading a paragraph of text
router.get('/paragraph/:id*.json', (req, res, next) => {
  const paragraph = get.paragraph(req.params.id + req.params['0'])
  if (paragraph) {
    res.json(paragraph)
  } else {
    next(createError(404))
  }
})

// route for downloading similar sentences
router.get('/sentences/text/:textId*/sentence/:sentenceId*.json', (req, res, next) => {
  const textId = req.params.textId + req.params[0]
  const sentenceId = req.params.sentenceId + req.params[1]
  const sentence = get.sentence(sentenceId)
  try {
    if (sentence) {
      const sentences = similar(textId, sentence)
      res.json(sentences)
    } else {
      next(createError(404))
    }
  } catch (error) {
    console.log(error)
    next(createError(500))
  }
})
