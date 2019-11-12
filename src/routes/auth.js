const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');
const jwt = require('jsonwebtoken');
const ApiKeysServices = require('../services/api-keys');
const { config } = require('../config/index');
const UsersServices = require('../services/user');

require('../utils/strategies/basic');

function authApi(app) {
  const router = express.Router();
  app.use('/api/auth', router);

  const apiKeysServices = new ApiKeysServices();
  const userServices = new UsersServices();

  router.post('/sign-in', async (request, response, next) => {
    const { apiKeyToken } = request.body;

    if (!apiKeyToken) {
      next(boom.unauthorized('tokes is required'));
    }

    passport.authenticate('basic', function(error, user) {
      try {
        if (error || !user) {
          next(boom.unauthorized());
        }

        request.login(user, { session: false }, async function(error) {
          if (error) {
            next(error);
          }

          const apikey = await apiKeysServices.getApiKey({
            token: apiKeyToken
          });

          if (!apikey) {
            next(boom.unauthorized());
          }

          const { _id: id, name, email } = user;
          const payload = {
            sub: id,
            name,
            email,
            scopes: apikey.scopes
          };

          const token = jwt.sign(payload, config.authJwtSecret, {
            expiresIn: '15m'
          });

          return response
            .status(200)
            .json({ token, user: { id, name, email } });
        });
      } catch (error) {
        next(error);
      }
    })(request, response, next);
  });

  router.post('/sign-up', async function(request, response, next) {
    try {
      const { body: user } = request;
      const createdId = await userServices.createUser({ user });
      return response.status(201).json({
        data: createdId,
        message: 'user created'
      });
    } catch (error) {
      next(error);
    }
  });
}

module.exports = authApi;
