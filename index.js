const debug = require('debug')('user-auth-api:index');
const express = require('express');
const hbs = require('hbs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const md5 = require('md5');
const config = require('./config');

/* Model */
const User = require('./model/user');
const ImageModel = require('./model/images');

/* Controllers */
const userController = require('./controllers/userController');

const port = config.api.PORT;

const app = express();

const dbURI = config.api.DATABASE_URL;
const dbOpts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
};
mongoose.Promise = global.Promise;
mongoose.connect(dbURI, dbOpts);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', () => {
  debug(`Mongoose default connection open to ${dbURI}`);
});

// If the connection throws an error
mongoose.connection.on('error', (err) => {
  debug(`Mongoose default connection error: ${err.message}`);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
  debug('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    debug('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

hbs.registerPartials(`${__dirname}/views/partials`);
app.set('view engine', 'hbs');
app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

/* session */
app.use(session({
  secret: '61f6aceaeb74a12f6841fabd', // a secret key
  resave: false,
  saveUninitialized: true
}));

/* Routes */

app.get('/', (req, res) => {
  User.find({}, (err, user) => {
    if (err) {
      console.log(err);
    } else if (user) {
      res.render('users-list.hbs', {
        users: user
      });
    }
  });
});

app.get('/home', (req, res) => {
  res.render('home.hbs', {
    pageTitle: 'Home page',
    welcomeMessage: 'Welcomes you',
    currentYear: new Date().getFullYear()
  });
});


// Login In

app.get('/login', (req, res) => {
  res.render('login.hbs');
});


app.post('/user', userController.login);

app.get('/register', (req, res) => {
  res.render('register.hbs', {
    pageTitle: 'Register page'
  });
});

// view detail page

app.get('/view_detail_page', (req, res) => {
  const { country_id } = req.query;
  if (req.session.user) {
    User.findOne({ username: req.session.user, password: req.session.pass }, (err, user) => {
      // console.log(user.username);
      ImageModel.findOne({
        country_name: country_id
        // country_name:'PARIS'
      }, (err, docs) => {
        // console.log(docs);
        if (!err) {
          res.render('view_detail_page.hbs', {
            list: user,
            list1: docs
          });
        } else {
          console.log(`error in retrieving the items${err}`);
        }
      });
    });
  } else {
    res.render('login.hbs', {
      text: 'Unauthorized Access'
    });
  }
});
// Packages
app.get('/package', (req, res) => {
  if (req.session.user) {
    User.findOne({ username: req.session.user, password: req.session.pass }, (err, user) => {
      ImageModel.find({}, (error, docs) => {
        if (err) {
          console.log(err);
        } else if (user) {
          res.render('package', {
            list: user,
            list1: docs
          });
        } else {
          res.send('Invalid user credentials');
        }
      });
    });
  } else {
    res.render('login.hbs', {
      text: 'Unauthorized Access'
    });
  }
});


// Insert data to gallery

app.get('/test3', (req, res) => {
  res.render('test.hbs');
});

app.post('/img', (req, res) => {
  const imgdata = new ImageModel({
    country_name: 'MALAYSIA', rate: '100', imga: 'ams2.jpg', imgb: 'aus1.jpg', imgc: 'dub3.jpg'
  });
  imgdata.save().then((item) => {
    console.log(item);
    res.render('test.hbs');
  }).catch((err) => {
    res.status(400).send('Unable to save gallery');
  });
});


// Inserting user  data
app.post('/reg', (req, res) => {
  const data_old = new User(req.body);
  const { firstName } = req.body;
  const { lastName } = req.body;
  const { address } = req.body;

  req.check('firstName', 'Firstname is required').notEmpty().isAlpha();
  req.check('lastName', 'Lastname is required').notEmpty().isAlpha();
  req.check('address', 'Address is required').notEmpty();
  req.check('city', 'City is required').notEmpty();
  req.check('zip', 'Zipcode is required').notEmpty().isNumeric();
  req.check('country', 'Country is required').notEmpty();
  req.check('username', 'Username is required').notEmpty();
  req.check('password', 'Password is required').notEmpty();
  req.check('confirm_password', 'Password Mismatch').equals(req.body.password);

  let firstname_message;
  let lastname_message;
  let address_message;
  let city_message;
  let zip_message;
  let country_message;
  let username_message;
  let password_message;
  let confirm_pass;

  const errors = req.validationErrors();
  //    console.log('Validation error',errors);
  //    console.log('Sample error message',errors.msg);
  if (errors) {
    errors.forEach((item) => {
      if (item.param === 'firstName') { firstname_message = 'Invalid  FirstName'; }
      if (item.param === 'lastName') { lastname_message = 'Invalid LastName'; }
      if (item.param === 'address') { address_message = 'Enter Address'; }
      if (item.param === 'city') { city_message = 'Enter City'; }
      if (item.param === 'country') { country_message = 'Select country'; }
      if (item.param === 'zip') { zip_message = 'Enter Zip'; }
      if (item.param === 'username') { username_message = 'Enter username'; }
      if (item.param === 'password') { password_message = 'Invalid Password'; }
      if (item.param === 'confirm_password') { confirm_pass = 'Password Mismatch'; }
    });
    res.render('register.hbs', {
      mydata: data_old,
      fname: firstname_message,
      lname: lastname_message,
      address: address_message,
      city: city_message,
      country: country_message,
      zip: zip_message,
      username: username_message,
      password: password_message,
      confirm_pass
    });
  } else {
    const data = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      address: req.body.address,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      username: req.body.username,
      password: md5(req.body.password)
      // password:bcrypt.hashSync(req.body.password,10)
    });
    // console.log(data.password);

    data.save().then((item) => {
      res.render('login.hbs');
      // res.send("Saved to db");
    }).catch((err) => {
      res.status(400).send('Unable to save');
    });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.send('User Not logged out ');
    } else {
      res.redirect('/login');
    }
  });
});

app.get('/bad', (req, res) => {
  res.send({
    error: 'Unable to handle request'
  });
});

app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

app.listen(port, () => {
  console.log(`Server is up on the port ${port}`);
});
