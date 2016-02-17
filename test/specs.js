"use strict";
var jsdom = require("jsdom").jsdom;
global.document = jsdom(undefined, {});
global.window = document.defaultView;
global.Element = global.window.Element;
global.HTMLElement = global.window.HTMLElement;
var template = require('lodash.template');
var normalizeToView = require("..");
var TemplateView = require('template-view');
var View = require('simple-view').View;
var Model = require('backbone-model').Model;
var assert = require('assert');
describe('normalizeToView', () => {
    var parentElement;
    var simpleTemplate;
    beforeEach(() => {
        parentElement = document.createElement("div");
        simpleTemplate = template("<div>hello world</div>");
    });
    it("should set options.defaultParentElement as constructorOptions.el by default", () => {
        var myNewView = normalizeToView({
            defaultParentElement: parentElement,
            content: {
                template: simpleTemplate
            }
        });
        assert.equal(myNewView.el, parentElement);
    });
    it("should not use options.defaultParentElement as constructorOptions.el if useInnerElement is specified on the Constructors prototype", () => {
        var CustomTemplateView = TemplateView.extend({
            template: {
                useInnerElement: true,
                src: simpleTemplate
            }
        });
        var myNewView = normalizeToView({
            defaultParentElement: parentElement,
            content: {
                template: simpleTemplate
            },
            Constructor: CustomTemplateView
        });
        assert(myNewView.el !== parentElement);
    });
    it("should not use options.defaultParentElement as constructorOptions.el if useInnerElement is specified on options sent to initialize", () => {
        var myNewView = normalizeToView({
            defaultParentElement: parentElement,
            content: {
                template: simpleTemplate,
                useInnerElement: true
            }
        });
        assert.notEqual(myNewView.el, parentElement);
    });
    it("should set {templateVars: options.defaultTemplateVars} only if the view will not receive any other templateVars and only when using TemplateView as the constructor", function () {
        var defaultTemplateVars = {
            foo: 'default',
            bar: 'default',
            baz: 'default'
        };
        var nv;
        nv = normalizeToView({
            content: {
                template: template("")
            },
            defaultTemplateVars: defaultTemplateVars
        });
        assert.equal(nv.templateVars.foo, 'default');
        assert.equal(nv.templateVars.bar, 'default');
        assert.equal(nv.templateVars.baz, 'default');
        nv = normalizeToView({
            content: {
                templateVars: {
                    foo: 'options',
                    bar: 'options',
                    beek: 'options'
                },
                template: template("")
            },
            defaultTemplateVars: defaultTemplateVars
        });
        assert.equal(nv.templateVars.foo, 'options');
        assert.equal(nv.templateVars.bar, 'options');
        assert.equal(nv.templateVars.beek, 'options');
        assert.equal(nv.templateVars.baz, undefined);
        nv = normalizeToView({
            content: {
                model: new Model({
                    foo: 'model',
                    bar: 'model'
                }),
                template: template("")
            },
            defaultTemplateVars: defaultTemplateVars
        });
        assert.equal(nv.templateVars.foo, 'model');
        assert.equal(nv.templateVars.bar, 'model');
        assert.equal(nv.templateVars.baz, undefined);
        nv = normalizeToView({
            Constructor: TemplateView.extend({
                template: template(""),
                templateVars: function () {
                    return {
                        foo: 'prototype'
                    };
                }
            }),
            defaultTemplateVars: defaultTemplateVars
        });
        assert.equal(nv.templateVars.foo, 'prototype');
        assert.equal(nv.templateVars.bar, undefined);
        assert.equal(nv.templateVars.baz, undefined);
        nv = normalizeToView({
            Constructor: View,
            defaultTemplateVars: defaultTemplateVars
        });
        assert.equal(nv.templateVars, undefined);
    });
});
