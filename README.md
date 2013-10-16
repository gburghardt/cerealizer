# Cerealizer

Cerealizer is a general purpose object serializer and deserializer for
a variety of formats. It sports a generic interface to make
programmatically parsing and stringifying data easier.

These formats are supported:

* XML (via native DOMParser or ActiveXObject)
* JSON (via native JSON object)
* Query Strings

## Why Use Cerealizer?

Cerealizer is ideal for applications that need to manipulate data
before sending it to the server for processing. It provides and easy,
generic way of converting data from a string format to a JavaScript
object, and back to a string format. Regardless of which format you
use, the process is basically the same:

1. Extract data from a form
2. Manipulate it in JavaScript
3. Serialize it for transmission across the network
4. Receive a string response
5. Parse the response into an object
6. Process the response

Because of this, Cerealizer hides the messy details of object
serialization behind an interface so you can make your code more
flexible and robust.

## Using Cerealizer

It's easy to start using Cerealizer:

    <!DOCTYPE HTML>
    <html>
    <head>
        ...
        <script type="text/javascript" src="path/to/cerealizer.js"></script>
        <script type="text/javascript" src="path/to/cerealizer/json.js"></script>
        <script type="text/javascript" src="path/to/cerealizer/query_string.js"></script>
        <script type="text/javascript" src="path/to/cerealizer/xml.js"></script>
    </head>
    <body>

    </body>
    </html>

No external dependencies are required for newer browsers. To support
JSON parsing, older browsers will need to use
[JSON2.js](https://github.com/douglascrockford/JSON-js). You only need
to include the specific parsers you plan on using. If you will only
ever use JSON, there is no need to include query_string.js and xml.js.

### Programmatically Using Cerealizer

This is really how Cerealizer was meant to be used. Each
implementation supports the same interface so you can use Cerealizer
to convert data without knowing the implementation behind it:

    var data = {
        foo: {
            bar: "Test"
        }
    };

    var types = ["json", "xml", "queryString"],
        i = 0,
        length = types.length,
        output = [],
        parser;

    for (i < length; i++) {
        parser = Cerealizer.getInstance( types[i] );
        output.push( parser.serialize(data) );
    }

    console.log(output);

You can also get a parser instance by mime type as well:

__JSON__

* Cerealizer.getInstance("json")
* Cerealizer.getInstance("text/json")
* Cerealizer.getInstance("application/json")

__Query Strings__

* Cerealizer.getInstance("queryString")
* Cerealizer.getInstance("application/x-www-form-urlencoded")
* Cerealizer.getInstance("multipart/form-data")

__XML__

* Cerealizer.getInstance("xml")
* Cerealizer.getInstance("text/xml")
* Cerealizer.getInstance("application/xml")

### JSON Parser

This uses the native JSON object. Older browsers will need a copy of
[JSON2.js](https://github.com/douglascrockford/JSON-js).

#### Configuration Parameters

None.

### Query String Parser

This is useful for interacting with RESTful web services.

#### Configuration Parameters

This parser can be configured in two modes:

* __Hash Notation__ &mdash; Query strings are serialized with nested
  keys delineated by square brackets: `blog[posts][0][id]=1`. This is
  usefull for Ruby on Rails and PHP applications.
* __Dot Notation__ &mdash; Query strings are serialized with nested
  keys delineated by dots for string keys, and square brackets for
  array keys: `blog.posts[0].id=1`. This is usefull for many Java and
  .NET applications.

Example 1:

The default is to use Hash Notation.

    var parser = new Cerealizer.QueryString();

    // returns blog[posts][0][id]=1
    parser.serialize({
        blog: {
            posts: {
                0: {
                    id: 1
                }
            }
        }
    });

Example 2:

By setting `hashNotation` to false, Dot Notation is used instead:

    var parser = new Cerealizer.QueryString();
    parser.hashNotation = false;

    // returns blog.posts[0].id=1
    parser.serialize({
        blog: {
            posts: {
                0: {
                    id: 1
                }
            }
        }
    });

### XML Parser

This uses the browser's native objects. Standards compliant browsers
use the `DOMParser` and Internet Explorer will fall back on an ActiveX
Control if it doesn't support `DOMParser`.

#### Configuration Parameters

None.

## The Cerealizer Interface

* `test(x) -> boolean` &mdash; The test method takes a string
  parameter and returns true if this parser can convert it to an
  object without throwing an error. Syntax errors can still be thrown.
* `serialize(data) -> string` &mdash; The serialize method takes an
  Object as a parameter and returns a string.
* `deserialize(str) -> Object` &mdash; The deserialize method takes a
  string and returns an Object.

### Creating Your Own Parser

Use this template if you want to create your own parser:

    Cerealizer.MyParser = function MyParser() {
        // Note: Use an empty class constructor
    };

    Cerealizer.MyParser.prototype = {

        constructor: Cerealizer.MyParser,

        regex: /valid format test/,

        deserialize: function deserialize(str) {
            throw new Error("Not implemented");
        },

        serialize: function serialize(data) {
            throw new Error("Not implemented");
        },

        test: function test(x) {
            return this.regex.test(x);
        },

        toString; function toString() {
            return "[object Cerealizer.MyParser]";
        }

    };

    // Allow Cerealizer.getInstance(...) to return instances of your
    // custom parser:
    Cerealizer.registerType(Cerealizer.MyParser, [
        "myParser",
        "mime/type+1",
        "mime/type+2"
    ]);

If you need other utility methods, prefix them with an underscore to
denote them as "not public".

## Using an Object Factory

If you utilize Inversion of Control in your application, Cerealizer
can support a general purpose object factory. The example below uses
[Hypodermic](https://github.com/gburghardt/hypodermic) to generate
parsers:

    // 1) Create the general purpose object factory:
    var objectFactory = new Hypodermic({
        queryString: {
            className: "Cerealizer.QueryString",
            singleton: true,
            properties: {
                hashNotation: { value: false }
            }
        }
    });

    // 2) Configure Cerealizer to use this object factory to generate
    //    instances of parsers.
    Cerealizer.objectFactory = objectFactory;

    // 3) Hypodermic generates and returns a fully configured instance
    //    of Cerealizer.QueryString:
    Cerealizer.getInstance("queryString");

Any object factory supporting a method called `getInstance`, which
takes a single string parameter, is supported. The parameter to
`Cerealizer.getInstance("...")` is passed directly to
`Cerealizer.objectFactory.getInstance("...")`. If no object is returned
then Cerealizer will throw an error.

## Development Plan

A more robust XML parser is planned based on
[JXON](https://developer.mozilla.org/en-US/docs/JXON), as well as
the ability to specify a conversion format from JSON to XML.

    var parser = Cerealizer.getInstance("xml");

    parser.format = {
        blog: {
            type: "node",
            attributes: [
                id
            ],
            children: {
                posts: {
                    type: "node",
                    children: {
                        post: {
                            attributes: [
                                id
                            ],
                            children: {
                                title: {
                                    type: "node"
                                }
                                body: {
                                    type: "node"
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    parser.serialize({
        blog: {
            id: 123,
            posts: [
                {
                    id: 1,
                    title: "Test",
                    body: "Test"
                }
            ]
        }
    });

Would return something like:

    <blog id="123">
        <posts>
            <post id="1">
                <title>Test</title>
                <body>Test</body>
            </post>
        </posts>
    </blog>
