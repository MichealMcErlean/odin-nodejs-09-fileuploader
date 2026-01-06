require('dotenv').config();
const error = require('console');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const {prisma} = require('./db/prisma.js');
const {PrismaSessionStore} = require('@quixo3/prisma-session-store');
const path = require('path');
const app = express();
const {ensureAuthentication} = require('./helpers/auth.js');
const rootRouter = require('./routes/rootRouter.js');
const homeRouter = require('./routes/homeRouter.js');

//middleware

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 30 * 24 * 60 * 60 * 1000}, //30 days in microseconds
  store: new PrismaSessionStore(
    prisma,
    {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }
  )
}));

app.use(express.urlencoded({extended: true}));
const assetsPath = path.join(__dirname, 'public');
app.use(express.static(assetsPath))

require('./config/passport.js')(passport);
app.use(passport.session());

// Make current session user available via locals to all views and routes
app.use((req, res, next) => {
  res.locals.currentAccount = req.user;
  next();
})

// Routes
app.use('/home', ensureAuthentication, homeRouter);
app.use("/", rootRouter);

// Error Handling
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).render('error', {
    title: 'An Error Occurred',
    message: process.env.NODE_ENV === 'production'
        ? 'Something went wrong on our end.'
        : err.message,
    error: process.env.NODE_ENV === 'production'
        ? {} : err
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`File Uploader app listening on port ${PORT}.`);
})