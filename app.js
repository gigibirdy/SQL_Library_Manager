//require express module and path module
const express = require('express');
const path = require('path');
//create app object by calling the express() function
const app = express();
//use destructuring assignment to extract the Book model and the property Op from db.Sequelize
const db = require('./models');
const {Book} = db.sequelize.models;
const {Op} = db.Sequelize;

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
//use bodyParser middleware bundled with Express
app.use(express.json());
app.use(express.urlencoded({extended: false}));
//use a static route and the express.static method to serve the static files located in the public folder
app.use('/static', express.static(path.join(__dirname, 'public')));

//Handler function to wrap each route
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      res.status(500).send(error);
    }
  }
};

//pagination function to caculate offset when fetching data
const pagination = (page) => {
  const bookPerPage = 10;
  let offset = 0;
  if (page) {
    offset = (Number(page) - 1) * bookPerPage;
  }
  return offset;
};

//all books route
app.get('/books', asyncHandler(async (req, res) => {
  const offset = pagination(req.query.page);
  const bookCount = await Book.findAll();
  const books = await Book.findAll({
    limit: 10,
    offset: offset
  });
  res.render('all_books', {
    books: books,
    title: 'Books',
    numberOfBooks: bookCount.length
  });
}));

//root route
app.get('/', asyncHandler(async (req, res) => {
  res.redirect('/books');
}));

//search Books
app.get('/books/search', asyncHandler(async (req, res) => {
  const books = await Book.findAll({
    where: {
      [Op.or]: [{
          title: {
            [Op.substring]: req.query.search,
          }
        },
        {
          author: {
            [Op.substring]: req.query.search,
          }
        },
        {
          genre: {
            [Op.substring]: req.query.search,
          }
        },
        {
          year: {
            [Op.substring]: req.query.search,
          }
        }
      ]
    }
  });
  if (req.query.search) {
    res.render('all_books', {
      books: books,
      title: 'Books'
    });
  } else {
    res.redirect('/books');
  }
}));

//new book route
app.get('/books/new', (req, res) => {
  res.render("new_book", {
    title: 'New Book'
  });
});

//add a new book
app.post('/books/new', asyncHandler(async (req, res) => {
  let new_book;
  try {
    new_book = await Book.create(req.body);
    res.redirect('/books');
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      new_book = await Book.build(req.body);
      res.render("new_book", {
        errors: error.errors,
        title: "New Book"
      });
    } else {
      throw error;
    }
  }
}));

//get book detail
app.get("/books/:id", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render("book_details", {
      book: book,
      title: book.title
    });
  } else {
    res.render("error");
  }
}));

//edit book
app.post('/books/:id', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    await book.update(req.body);
    res.redirect('/books');
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render("book_details", {
        book: book,
        errors: error.errors,
        title: "Error"
      })
    } else {
      throw error;
    }
  }
}));

//delete a book
app.post('/books/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  await book.destroy();
  res.redirect("/books");
}));

//catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error();
  err.status = 404;
  next(err);
});

//error handler
app.use((err, req, res, next) => {
  //render the 404 error page
  if(err.status === 404){
    res.render('page_not_found');
    //for all else errors will render the server_error page
  } else {
    res.render('server_error');
  }
});

app.listen(3000, () => console.log('This app is listening to port 3000'));
