require('node-jsx').install({ extension: '.jsx' });

var assert = require('chai').assert;
var swig = require('swig');
var reactSwig = require('..');

reactSwig.useTag(swig);

describe('swig-react', function() {
    describe('Tag parsing and compilation', function() {
        it('should render the simple module correctly', function() {
            assert.match(
                swig.render('{% react "Simple" %}', {
                    filename: 'test.html',
                    reactComponentRoot: __dirname + '/fixtures'
                }),
                /^<div data-react-class="Simple" data-react-props="\{\}"><div data-reactid="\.[\d\w]+" data-react-checksum="-\d+">Hello, test!<\/div><\/div>$/
            );
        });
        it('should render module with props correctly');
        it('should render the module with props and a tag spec');
        it('should not matter which order the props and tag spec are passed');

        it('should render the module with props in an object literal');
        it('should render the tag spec in an object literal');
        it('should take a string in lieu of a tag object (use as tag name)');
    });
});