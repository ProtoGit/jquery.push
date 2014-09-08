# jQuery Push Plug-in

Provides simple jQuery integration with the native pushState() API. 



## Usage



### Basic

To load a single block of content into an element and update the URL, push() can be called simply with:

    $.push('/foo', '#bar');

The response for that call would be expected in this format:

    {
        "title": "Optional Replacement Window Title",
        "content": "<p>New #bar content</p>"
    }

With the existing HTML within the page expected as:

    <div id="bar">
        <!-- response.content would be loaded here -->
    </div>

Due to the limitations with what can be stored within the `popstate` event `state` property's data, and the inability to retrieve the original selector from within a jQuery plug-in, we need to pass a string selector to the plug-in, instead of a jQuery object, so that we can reference the element later.

If push() is passed an `<a>` or `<form>` native element (or jQuery object wrapping a native element) instead of a string URI, the `.href` or `.action` properties are, respectively used as the URI.



### Fragments

If the response contains multiple fragments of HTML, as opposed to a single block, push() can be called with only a URI:

    $.push('/foo');

The fragments are then mapped automatically to the DOM based on the `fragments` within the response object. For example:

    {
        "title": "New Window Title",
        "fragments": {
            "bar": "<p>New content for the #bar fragment",
            "baz": "<p>New content for the #baz fragment"
        }
    }

<!-- -->

    <div id="bar">
        <!-- response.fragments.bar would be loaded here -->
    </div>

    <div id="baz">
        <!-- response.fragments.baz would be loaded here -->
    </div>



### POST

To avoid any overly complex argument swapping for POST requests, an extra method is defined for sending the request as a POST:

    $.postPush('/foo', {...}, '#bar');

This function works exactly as push(), except that second argument must always be the post data.



### Callbacks

For any DOM manipulation that can *only* be performed once the content has been loaded into the DOM, a callback can be provided to push(), that is called with the original JSON HTTP response passed as the only argument.

Here are some examples with various argument swapping:

    $.push('/foo', function(response) {
        // ...
    });

    $.push('/foo', '#bar', function(response) {
        // ...
    });

    $.postPush('/foo', {}, function(response) {
        // ...
    });

    $.postPush('/foo', {}, '#bar', function(response) {
        // ...
    });

Note that the callback is converted to a string and stored within the event `state` data, and then re-called every time the corresponding `popstate` event is fired. That means no native functions can be passed directly as the callback, and for best performance it's better to delegate any event listeners to a parent static element.



### Custom Data

Any amount of extra, custom data can be passed back wihin the response and accessed within your callback. If you don't want to render any HTML on the server at all, you can pass back some custom data and handle it manually:

    $.push('/foo', function(response) {
        console.log(response.myCustomData);
    });

<!-- -->

    {
        "myCustomData": {
            ...
        }
    }

The name `myCustomData` is not important, it's just an example.



## Compatibility

`window.history.pushState()` is not supported in IE before v10. Anything built using this should degrade gracefully if IE8/9 support is required.