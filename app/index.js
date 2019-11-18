// vendor dependencies
import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import sassMiddleware from 'node-sass-middleware'

// routers
import homeRouter from './routes/home.js'
import textsRouter from './routes/texts.js'
import aboutRouter from '../app/routes/about.js'
import compareRouter from './routes/compare.js'
import searchRouter from './routes/search.js'
import dataRouter from './routes/data.js'

// initialize the app
const app = express()

// basic setup
app.set('views', path.join(path.resolve(), 'app/views'))
app.set('view engine', 'twig')
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(sassMiddleware({
  src: path.join(path.resolve(), 'app/public'),
  dest: path.join(path.resolve(), 'app/public'),
  indentedSyntax: false,
  sourceMap: true
}))
app.use(express.static(path.join(path.resolve(), 'app/public')))

// main areas of the site
app.use('/', homeRouter)
app.use('/texts', textsRouter)
app.use('/about', aboutRouter)
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
export default app
