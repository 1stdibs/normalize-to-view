"use strict";
var TemplateView; // required after export is defined to avoid circular dependency
var result = require('lodash.result');
var assign = require('lodash.assign');
var View = require('simple-view').View;
var normalizeToView = module.exports = function (options) {
    if (!global.HTMLElement) {
        throw new Error('normalize-to-view expects global.HTMLElement');
    }
    // TODO: test this
    var view;
    var constructorOptions;
    var defaultParentElement;
    var newContent;
    var useDefaultParentElement;
    if (undefined === options.content && !options.Constructor) {
        throw new Error("normalizeToView requires options.Constructor if options.content is missing");
    }
    options = assign({
        defaultParentElement: undefined,
        defaultContext: undefined,
        defaultTemplateVars: undefined,
        content: undefined,
        Constructor: TemplateView
    }, options);
    if (false === options.content) {
        return false;
    }
    if (options.content && options.content.jquery) {
        options.content = options.content.get(0);
        view = new View({el: options.content});
    }
    // content can't be jQuery below this line
    if (options.content instanceof global.HTMLElement) {
        view = new View({el: options.content});
    }
    if (options.content && options.content.hasOwnProperty('el')) { // assume it's a backbone-style view if it has an `el` property
        view = options.content;
    }
    if (options.content instanceof Function) {
        defaultParentElement = undefined;
        if (options.defaultParentElement) {
            defaultParentElement = options.defaultParentElement;
        }
        newContent = options.content.call(options.defaultContext, defaultParentElement);
        if (!newContent) {
            return newContent;
        }
        view = normalizeToView(assign({}, options, {content: newContent}));
    }
    if (!view && options.Constructor) {
        constructorOptions = options.content;
        useDefaultParentElement = true;
        if (options.Constructor && result(options.Constructor.prototype.template, 'useInnerElement')) {
            useDefaultParentElement = false;
        }
        if (result(constructorOptions, 'useInnerElement')) {
            useDefaultParentElement = false;
        }
        if (useDefaultParentElement) {
            constructorOptions = assign({el: options.defaultParentElement}, constructorOptions);
        }
        if (
            options.Constructor.prototype.templateVars === TemplateView.prototype.templateVars &&
            !constructorOptions.templateVars && !constructorOptions.model
        ) {
            constructorOptions = assign({templateVars: options.defaultTemplateVars}, constructorOptions);
        }
        view = new options.Constructor(constructorOptions);
    }
    return view;
};
TemplateView = require('template-view');
