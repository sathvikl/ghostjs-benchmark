// # Templates
//
// Figure out which template should be used to render a request
// based on the templates which are allowed, and what is available in the theme
// TODO: consider where this should live as it deals with channels, singles, and errors
var _ = require('lodash'),
    path = require('path'),
    config = require('../../config'),
    themes = require('../../themes');

/**
 * ## Get Error Template Hierarchy
 *
 * Fetch the ordered list of templates that can be used to render this error statusCode.
 *
 * The default is the
 *
 * @param {integer} statusCode
 * @returns {String[]}
 */
function getErrorTemplateHierarchy(statusCode) {
    var errorCode = _.toString(statusCode),
        templateList = ['error'];

    // Add error class template: E.g. error-4xx.hbs or error-5xx.hbs
    templateList.unshift('error-' + errorCode[0] + 'xx');

    // Add statusCode specific template: E.g. error-404.hbs
    templateList.unshift('error-' + errorCode);

    return templateList;
}

/**
 * ## Get Channel Template Hierarchy
 *
 * Fetch the ordered list of templates that can be used to render this request.
 * 'index' is the default / fallback
 * For channels with slugs: [:channelName-:slug, :channelName, index]
 * For channels without slugs: [:channelName, index]
 * Channels can also have a front page template which is used if this is the first page of the channel, e.g. 'home.hbs'
 *
 * @param {Object} channelOpts
 * @returns {String[]}
 */
function getChannelTemplateHierarchy(channelOpts) {
    var templateList = ['index'];

    if (channelOpts.name && channelOpts.name !== 'index') {
        templateList.unshift(channelOpts.name);

        if (channelOpts.slugTemplate && channelOpts.slugParam) {
            templateList.unshift(channelOpts.name + '-' + channelOpts.slugParam);
        }
    }

    if (channelOpts.frontPageTemplate && channelOpts.postOptions.page === 1) {
        templateList.unshift(channelOpts.frontPageTemplate);
    }

    return templateList;
}

/**
 * ## Get Entry Template Hierarchy
 *
 * Fetch the ordered list of templates that can be used to render this request.
 * 'post' is the default / fallback
 * For posts: [post-:slug, custom-*, post]
 * For pages: [page-:slug, custom-*, page, post]
 *
 * @param {Object} postObject
 * @returns {String[]}
 */
function getEntryTemplateHierarchy(postObject) {
    var templateList = ['post'],
        slugTemplate = 'post-' + postObject.slug;

    if (postObject.page) {
        templateList.unshift('page');
        slugTemplate = 'page-' + postObject.slug;
    }

    if (postObject.custom_template) {
        templateList.unshift(postObject.custom_template);
    }

    templateList.unshift(slugTemplate);

    return templateList;
}

/**
 * ## Pick Template
 *
 * Taking the ordered list of allowed templates for this request
 * Cycle through and find the first one which has a match in the theme
 *
 * @param {Array|String} templateList
 * @param {String} fallback - a fallback template
 */
function pickTemplate(templateList, fallback) {
    var template;

    if (!_.isArray(templateList)) {
        templateList = [templateList];
    }

    if (!themes.getActive()) {
        template = fallback;
    } else {
        template = _.find(templateList, function (template) {
            return themes.getActive().hasTemplate(template);
        });
    }

    if (!template) {
        template = fallback;
    }

    return template;
}

function getTemplateForEntry(postObject) {
    var templateList = getEntryTemplateHierarchy(postObject),
        fallback = templateList[templateList.length - 1];
    return pickTemplate(templateList, fallback);
}

function getTemplateForChannel(channelOpts) {
    var templateList = getChannelTemplateHierarchy(channelOpts),
        fallback = templateList[templateList.length - 1];
    return pickTemplate(templateList, fallback);
}

function getTemplateForError(statusCode) {
    var templateList = getErrorTemplateHierarchy(statusCode),
        fallback = path.resolve(config.get('paths').defaultViews, 'error.hbs');
    return pickTemplate(templateList, fallback);
}

module.exports = {
    channel: getTemplateForChannel,
    entry: getTemplateForEntry,
    error: getTemplateForError,
    pickTemplate: pickTemplate
};
