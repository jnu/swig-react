"use strict";

/**
 * Renders a React component as a string in place.
 *
 * Inspired by the [react-rails gem](https://github.com/reactjs/react-rails),
 * and renders templates consistent with their View Helper.
 *
 * @alias react
 *
 * @example
 * // Render a component with no props
 * {% react 'Header' %}
 * // <div data-react-class="./ui/shared/Header">...</div>
 *
 * @example
 * // Render a component with some props
 * // props = { name: 'John' };
 * {% react 'HelloMessage' with props %}
 * // <div
 * //    data-react-class="./ui/shared/HelloMessage"
 * //    data-react-props="{&quot;name&quot;:&quot;John&quot;}"
 * //    >
 * //    ...
 * //    </div>
 *
 * @example
 * // Render a component with props in a custom element
 * {% react 'HelloMessage' with props in 'span' %}
 * // <span data-...>...</span>
 *
 * @example
 * // Render a component with props in a more customized element
 * // el = { tag: 'span', class: 'foo', id: 'hello' };
 * {% react './ui/shared/HelloMessage' with props in el %}
 * // <span class="foo" id="hello" data-...>...</span>
 *
 * @param {string|var}    modulePath Path to ReactComponent module
 * @param {Literal}       [with]     Literal string "with"
 * @param {object}        [props]    Properties to pass to ReactComponent
 * @param {Literal}       [in]       Literal string "in"
 * @param {string|object} [tag]      String specifying tag to use as container,
 *                                   or an object describing such a tag. In the
 *                                   object, the "tag" key must be defined, and
 *                                   every other key will be attached as an
 *                                   attribute to the tag. Note also that
 *                                   "data-react-props" is a reserved key.
 */

// Modules
var React = require('react');
var path = require('path');
// Literals
var STR_WITH = "with";
var STR_IN = "in";
// Swig Tag Interface def
var name = 'react';
var ends = false;
var blockLevel = false;

/**
 * Tag compiler
 */
function compile(compiler, args, content, parents, options) {
    var componentRoot = options.reactComponentRoot || "./modules/";
    var componentPath = args.shift();
    // Find class relative to opts.componentRoot, which itself by default is
    // relative to the process's CWD.
    var fullPath = path.resolve(componentRoot + '/' + componentPath);
    var props;
    var container;
    var js = "";
    var arg;

    // Parse remaining arguments
    while (arg = args.shift()) {
        switch (arg) {
            case STR_WITH:
                props = args.shift();
                break;
            case STR_IN:
                container = args.shift();
                // TODO: simple "string" for container arg (as tagname)
                break;
            default:
                var err = 'Unexpected argument "' + arg + '" in react tag.';
                throw new Error(err);
        }
    }

    // Create start tag for containing node
    js += "_output += (function(props, container) {";
    js +=   "props = props || {};";
    js +=   "container = container || { tag: 'div' };";
    js +=   "var __o = '<' + container.tag;";
    js +=   "var __p = JSON.stringify(props).replace(/\"/g, \"&quot;\");";
    js +=   "for (var key in container) {";
    js +=       "var val;";
    js +=       "if (container.hasOwnProperty(key) && key !== 'tag') {";
    js +=           "val = container[key].replace('\"', '&quot;');";
    js +=           "__o += ' ' + key + '=\"' + val + '\"';";
    js +=       "}";
    js +=   "}";
    // Add the react component module (full path)
    js +=   "__o += ' data-react-class=\"" + componentPath + "\"';";
    // Add the serialized properties as an attribute
    js +=   "__o += ' data-react-props=\"' + __p + '\">';";
    // Render the React component via an extension (from the local environment)
    js +=   "__o += _ext.react('" + fullPath + "', props);";
    // Close containing node
    js +=   "__o += '</' + container.tag + '>';";
    js +=   "return __o;";
    js += "})(" + props + ", " + container + ");\n";
    // ... Hope that works!

    return js;
}


/**
 * Tag parser
 * @todo Object literal parsing
 */
function parse(str, line, parser, types) {
    var componentPath;

    parser.on(types.STRING, function(token) {
        if (!componentPath) {
            componentPath = token.match.replace(/(^['"]|['"]$)/g, '');
            this.out.push(componentPath);
            return;
        }

        return true;
    });

    parser.on(types.VAR, function(token) {
        if (!componentPath) {
            componentPath = token.match;
            return true;
        }

        if (token.match === STR_WITH || token.match === STR_IN) {
            this.out.push(token.match);
            return false;
        }

        return true;
    });

    return true;
}

/**
 * Render a React component, defined in specified path, to a string, with
 * the specified props.
 *
 * Add this as an extension to swig in order to support rendering components
 * during template compilation.
 *
 * @param  {string} fullPath Path to React Component's module.
 * @param  {object} [props]  Properties to pass to React component.
 * @return {string}          Prerendered React.
 *
 * @todo Option for rendering as static markup
 */
function renderReactComponentToString(fullPath, props) {
    var ComponentClass = require(fullPath);
    var cmp = new ComponentClass(props);
    return React.renderComponentToString(cmp);
}

/**
 * Helper to enable react tag on a swig instance.
 *
 * @example
 * var swig = require('swig');
 * var swigReact = require('swig-react');
 * swigReact.useTag(swig);
 *
 * @param  {swig}   swig         Swig instance
 * @param  {string} [customName] Optional custom name to use for tag. Default
 *                               is "react".
 * @return {undefined}
 */
exports.useTag = function(swig, customName) {
    swig.setExtension('react', renderReactComponentToString);
    swig.setTag(customName || name, parse, compile, ends, blockLevel);
};

// export tag interface
exports.tag = {
    name: name,
    ends: ends,
    blockLevel: blockLevel,
    compile: compile,
    parse: parse
};

exports.extension = renderReactComponentToString;
