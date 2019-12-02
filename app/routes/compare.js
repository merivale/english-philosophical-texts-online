/*
 * Controller for the COMPARE area of the site.
 */
import createError from 'http-errors'
import express from 'express'
import * as get from '../../service/get.js'
import similar from '../../service/similar.js'

// create and export the router
const router = express.Router()
export default router

// define the area id
const area = 'compare'

// route for the compare page
router.get('/', (req, res) => {
  const authors = get.authors().filter(a => a.imported.length > 0)
  res.render('compare/index', { area, authors })
})

// route for viewing details of a paragraph
router.get('/paragraph/:id*', (req, res, next) => {
  const paragraph = get.paragraph(req.params.id + req.params['0'])
  if (paragraph) {
    res.render('compare/paragraph', { area, paragraph })
  } else {
    next(createError(404))
  }
})

// route for comparing sentences
router.get('/sentence', (req, res, next) => {
  const textId = req.query.t
  const sentenceId = req.query.s
  const sentence = get.sentence(sentenceId)
  try {
    const sentences = similar(textId, sentence.content)
    res.render('compare/sentence', { area, sentence, sentences })
  } catch (error) {
    console.log(error)
    next(createError(500))
  }
})
