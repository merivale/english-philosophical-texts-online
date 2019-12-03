/*
 * Controller for the COMPARE area of the site.
 */
import express from 'express'
import * as get from '../../service/get.js'

// create and export the router
const router = express.Router()
export default router

// define the area id
const area = 'compare'

// route for the compare page
router.get('/', (req, res) => {
  const authors = get.authors({ enrich: true }).filter(a => a.imported.length > 0)
  res.render('compare/index', { area, authors })
})
