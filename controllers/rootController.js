const {prisma} = require('../db/prisma.js');
const {
  body,
  query,
  validationResult,
  matchedData
} = require('express-validator');
const bcrypt = require('bcryptjs');

exports.signupPageForm = (req, res) => {
  res.render('signup', {
    title: 'Join MDrive Today!'
  })
}

exports.checkUserName = async (req, res) => {
  try {
    console.log('Made it to the controller.')

    const username = req.query.username;
    console.log('Username:', username);
    const result = await prisma.account.findUnique({
      where: {
        username: username,
      },
      select: {
        username: true,
      },
    });
    
    const isTaken = !!(result != null);
    return res.json({ isTaken });
  } catch(err) {
    console.error(err);
    res.status(500).json({error: 'Database check failed'});
  }
}

const validateSignup = [
  body('firstname').exists().trim()
    .isAlpha().withMessage('First Name can only contain alphabetical characters')
    .isLength({min: 1, max: 40}).withMessage('First Name must be between 1 and 40 characters in length.'),
  body('lastname').exists().trim()
    .isAlpha().withMessage('Last Name can only contain alphabetical characters. ')
    .isLength({min: 1, max: 40}).withMessage('Last Name must be between 1 and 40 characters in length.'),
  body('username').exists().trim()
    .isEmail().withMessage('Email must be a valid email address.'),
  body('password').exists().trim()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,20}$/).withMessage('Password must be 10-20 characters in length, with at least one uppercase, lowercase, numeral and symbol character.'),
  body('confirmPW').exists().trim()
    .custom((value, {req}) => {
      if (value !== req.body.password) {
        return false;
      }
      return true;
    }).withMessage('Passwords do not match.')
];

exports.signupPageAction = [
  validateSignup,
  async (req, res, next) => {
    const errors = validationResult(req).errors;
    if (errors.length != 0) {
      console.log('Errors detected in sign-up submission');
      return res.status(400).render('signup', {
        title: 'Join MDrive Today!',
        errors
      });
    }
    const {firstname, lastname, username, password} = matchedData(req);
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const newAccount = await prisma.account.create({
        data: {
          firstname: firstname,
          lastname: lastname,
          username: username,
          passwordhash: passwordHash,
          folders: {
            create: {
              name: 'Home',
              isHome: true,
              parentId: null
            }
          }
        },
        include: {
          folders: true,
        }
      });
      res.redirect('/login');
    } catch (err) {
      return next(err);
    }
  }
]

exports.loginPageForm = async (req, res, next) => {
  const messages = req.session.messages || [];
  req.session.messages = [];

  res.render('login', {
    title: 'Log In',
    errors: messages
  })
}

exports.logOutAction = async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  })
}