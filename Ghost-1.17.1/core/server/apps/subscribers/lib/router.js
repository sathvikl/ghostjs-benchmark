var path                = require('path'),
    express             = require('express'),
    _                   = require('lodash'),
    subscribeRouter     = express.Router(),
    bodyParser          = require('body-parser'),

    // Dirty requires
    api                 = require('../../../api'),
    errors              = require('../../../errors'),
    validator           = require('../../../data/validation').validator,
    templates           = require('../../../controllers/frontend/templates'),
    postLookup          = require('../../../controllers/frontend/post-lookup'),
    setResponseContext  = require('../../../controllers/frontend/context'),

    templateName = 'subscribe',
    defaultTemplate = path.resolve(__dirname, 'views', templateName + '.hbs');

// In future we'd have a more complex controller here - showing if someone already subscribed?!
function _renderer(req, res) {
    // Renderer begin
    // Format data
    var data = req.body;

    // Context
    setResponseContext(req, res);

    // Template
    res.template = templates.pickTemplate(templateName, defaultTemplate);

    // Render Call
    return res.render(res.template, data);
}

/**
 * Takes care of sanitizing the email input.
 * XSS prevention.
 * For success cases, we don't have to worry, because then the input contained a valid email address.
 */
function errorHandler(error, req, res, next) {
    req.body.email = '';

    if (error.statusCode !== 404) {
        res.locals.error = error;
        return _renderer(req, res);
    }

    next(error);
}

function honeyPot(req, res, next) {
    if (!req.body.hasOwnProperty('confirm') || req.body.confirm !== '') {
        return next(new Error('Oops, something went wrong!'));
    }

    // we don't need this anymore
    delete req.body.confirm;
    next();
}

function santizeUrl(url) {
    return validator.isEmptyOrURL(url || '') ? url : '';
}

function handleSource(req, res, next) {
    req.body.subscribed_url = santizeUrl(req.body.location);
    req.body.subscribed_referrer = santizeUrl(req.body.referrer);
    delete req.body.location;
    delete req.body.referrer;

    postLookup(req.body.subscribed_url)
        .then(function (result) {
            if (result && result.post) {
                req.body.post_id = result.post.id;
            }

            next();
        })
        .catch(function (err) {
            if (err instanceof errors.NotFoundError) {
                return next();
            }

            next(err);
        });
}

function storeSubscriber(req, res, next) {
    req.body.status = 'subscribed';

    if (_.isEmpty(req.body.email)) {
        return next(new errors.ValidationError({message: 'Email cannot be blank.'}));
    } else if (!validator.isEmail(req.body.email)) {
        return next(new errors.ValidationError({message: 'Invalid email.'}));
    }

    return api.subscribers.add({subscribers: [req.body]}, {context: {external: true}})
        .then(function () {
            res.locals.success = true;
            next();
        })
        .catch(function () {
            // we do not expose any information
            res.locals.success = true;
            next();
        });
}

// subscribe frontend route
subscribeRouter.route('/')
    .get(
        _renderer
    )
    .post(
        bodyParser.urlencoded({extended: true}),
        honeyPot,
        handleSource,
        storeSubscriber,
        _renderer
    );

// configure an error handler just for subscribe problems
subscribeRouter.use(errorHandler);

module.exports = subscribeRouter;
module.exports.storeSubscriber = storeSubscriber;
