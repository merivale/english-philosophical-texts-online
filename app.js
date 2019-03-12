// vendor dependencies
const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const sassMiddleware = require('node-sass-middleware')

// routers
const homeRouter = require('./routes/home')
const browseRouter = require('./routes/browse')
const compareRouter = require('./routes/compare')
const searchRouter = require('./routes/search')
const dataRouter = require('./routes/data')

// initialize the app
const app = express()

// basic setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'twig')
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false,
  sourceMap: true
}))
app.use(express.static(path.join(__dirname, 'public')))

// main areas of the site
app.use('/', homeRouter)
app.use('/browse', browseRouter)
app.use('/compare', compareRouter)
app.use('/search', searchRouter)
app.use('/data', dataRouter)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

// export the app
module.exports = app
