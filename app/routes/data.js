/*
 * Controller for returning JSON data from the corpus.
 */
import createError from 'http-errors'
import express from 'express'
import * as get from '../../service/get.js'
import { open } from '../../service/file.js'
import similar from '../../service/similar.js'

// create and export the router
const router = express.Router()
export default router

// route for downloading an array of enriched author data
router.get('/authors', (req, res, next) => {
  res.json(get.authors({ enrich: true }))
})

// route for downloading map of sub-text IDs
router.get('/sub-text-ids', (req, res, next) => {
  const subTextIds = open('cache', 'sub-text-ids') || {}
  res.json(subTextIds)
})

// route for downloading map of sub-paragraph IDs
router.get('/sub-paragraph-ids', (req, res, next) => {
  const subParagraphIds = open('cache', 'sub-paragraph-ids') || {}
  res.json(subParagraphIds)
})

// route for downloading array of paragraph IDs
router.get('/paragraph-ids', (req, res, next) => {
  const paragraphIds = open('cache', 'paragraph-ids') || []
  res.json(paragraphIds)
})

// route for downloading a paragraph of text
router.get('/paragraph/:id*', (req, res, next) => {
  const paragraph = get.paragraph(req.params.id + req.params['0'])
  if (paragraph) {
    res.json(paragraph)
  } else {
    next(createError(404))
  }
})

// route for downloading similar sentences
router.get('/similar', (req, res, next) => {
  const textId = req.query.textId
  const sentenceId = req.query.sentenceId
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
