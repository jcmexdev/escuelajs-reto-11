const passport = require('passport');
const { BasicStrategy } = require('passport-http');
const boom = require('@hapi/boom');
const bcrypt = require('bcryptjs');

const UsersService = require('../../services/user');

passport.use(
  new BasicStrategy(async function(email, password, cb) {
    const usersService = new UsersService();

    try {
      const user = await usersService.getUser({ email });

      //if user is not present
      if (!user) {
        return cb(boom.unauthorized(), false);
      }

      //if password is wrong 
      if (!(await bcrypt.compare(password, user.password))) {
        return cb(boom.unauthorized(), false);
      }

      //if user is ok, delete password
      delete user.password;

      //return callback with user
      return cb(null, user);
    } catch (error) {
        //if something is wrong return error without user
      return cb(error);
    }
  })
);
