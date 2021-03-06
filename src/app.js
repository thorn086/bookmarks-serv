require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const logger = require('./logger')
const bookmarksRouter = require('./bookmarks/bookmarks-router')
const { NODE_ENV} = require('./config')

const app = express()

const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.use(express.json())

app.use(function validationBearerToken( req, res, next){
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')
  
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        logger.error(`Unauthorized request to path: ${req.path}`);
        return res.status(401).json({ error: 'Unauthorized request' })
    }
    // move to the next middleware
    next()
})

app.use(bookmarksRouter)

app.get('/', (req, res) =>{
    res.send("Hello, world!")
})

app.use(function errorHandler(error, req, res, next){
    let response
    if (NODE_ENV === 'production'){
        response = { error: { message: 'server error'}}
    } else {
        console.error(error)
        response = {message: error.messag, error }
    }
    res.status(500).json(response)
})

module.exports = app