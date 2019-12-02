/*
 * Controller for the HOMEPAGE of the site.
 */
import express from 'express'
import * as get from '../../service/get.js'

// create and export the router
const router = express.Router()
export default router

// define the area id
const area = 'texts'

// route for the text page (a list of authors)
router.get('/', (req, res) => {
  const authors = get.authors()
  const males = authors.filter(a => a.sex === 'Male')
  const females = authors.filter(a => a.sex === 'Female')
  const authorsWithTexts = authors.filter(a => a.imported.length > 0)
  const imported = authors.reduce((acc, current) => acc + current.imported.filter(t => !t.duplicate).length, 0)
  const total = authors.reduce((acc, current) => acc + current.texts.filter(t => !t.duplicate).length, 0)
  res.render('index', { area, authors, males, females, authorsWithTexts, imported, total })
})
