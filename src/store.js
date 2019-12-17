const uuid = require('uuid/v4')

bookmark ={
    id: uuid(),
    title: "Book One",
    url: "https://bookone.com",
    description: "This is an awesome book",
    rating: 3
}

module.exports = bookmark