/*
 * Controller for the ABOUT area of the site.
 */
import express from 'express'

// create and export the router
const router = express.Router()
export default router

// define the area id
const area = 'about'

// route for the about page
router.get('/', (req, res) => {
  res.render('about/index', { area })
})

// route for the editorial principles page
router.get('/principles', (req, res) => {
  res.render('about/principles', { area })
})

// route for the permissions page
router.get('/permissions', (req, res) => {
  res.render('about/permissions', { area })
})

// route for the contact page
router.get('/contact', (req, res) => {
  res.render('about/contact', { area })
})
