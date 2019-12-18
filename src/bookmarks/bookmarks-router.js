const express = require('express')
const uuid = require('uuid/v4')
const bookmarksRouter = express.Router()
const { isWebUri } = require('valid-url')
const logger = require('../logger')
const bodyParser = express.json()
const store =require('../store')



bookmarksRouter
  .route('/bookmarks')
  .get((req, res) => {
    res.json(store.bookmark)
  })
  .post(bodyParser, (req, res) => {
    for (const field of ['title', 'url', 'rating']) {
      if (!req.body[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send(`'${field}' is required`)
      }
    }

    const { title, url, description, rating } = req.body

    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
      logger.error(`Rating '${rating}' supplied incorrectly`)
      return res.status(400).send(`'rating' is a number between 0 and 5`)
    }

    if (!isWebUri(url)) {
      logger.error(`Url '${url}' supplied incorrectly`)
      return res.status(400).send(`'url': Invalid URL`)
    }
    const id = uuid()
    const bookmarks = { id, title, url, description, rating }
    
    store.bookmark.push(bookmarks)

    logger.info(`Bookmark with id ${bookmarks.id} created`)
    
    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${bookmarks.id}`)
      .json(bookmarks)
  })

bookmarksRouter
  .route('/bookmarks/:bookmark_id')
  .get((req, res) => {
    const { bookmark_id } = req.params

    const bookmarks = store.bookmark.find(c => c.id == bookmark_id)

    if (!bookmarks) {
      logger.error(`Bookmark with id ${bookmark_id} not found.`)
      return res
        .status(404)
        .send('Bookmark Not Found')
    }

    res.json(bookmarks)
  })
  .delete((req, res) => {
    const { bookmark_id } = req.params

    const bookmarkIndex = store.bookmark.findIndex(b => b.id === bookmark_id)

    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with id ${bookmark_id} not found.`)
      return res
        .status(404)
        .send('Bookmark Not Found')
    }

    store.bookmark.splice(bookmarkIndex, 1)

    logger.info(`Bookmark with id ${bookmark_id} deleted.`)
    res
      .status(204)
      .end()
  })

module.exports = bookmarksRouter