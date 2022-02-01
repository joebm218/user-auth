const md5 = require('md5');
const User = require('../model/user');
const ImageModel = require('../model/images');

const userController = {
    login: async (req,res) => {
        const username = req.body.username || req.session.username;
        const password = md5(req.body.password) || req.session.password;
      
        User.findOne({ username, password }, (err, user) => {
          if (err) {
            console.log(err);
          }
          if (!user) {
            res.render('login.hbs', {
              text: 'Invalid User'
            });
          } else {
            req.session.user = user.username;
            req.session.pass = user.password;
      
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
          }
        });
      }
}

module.exports = userController;
