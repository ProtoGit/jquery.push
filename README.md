# jQuery Push State Plug-in

## Useage

To load a single block of content into an element and update the URL, push() can be called simply with:

    $('#foo').push('/foo');

The response for that call would be expected in this format:

    {
        "title": "New Title",
        "content": "<p>New content</p>"
    }

If the response needs to contain multiple fragments, push() can be called through the jQuery object and passed an object with key name references to the response fragments:

    $.push({foo: '#foo', bar: '#bar'}, '/baz');

<!-- -->

    {
        "title": "New title",
        "fragments": {
            "foo": "<p>New content for the #foo fragment",
            "bar": "<p>New content for the #bar fragment"
        }
    }

There's also a few optional, extra values that can be passed back:

| Key | Type | Meaning |
| --- | ---- | ------- |
| title | string | The new document title |
| description | string | The new meta description |
| keywords |  string | The new meta keywords |

To send a POST request with some data, call push() with an object:

    $('#foo').push('/foo', {...});

A non-null value for that argument will trigger the POST, so to request an empty POST request just provide an empty object.


### Callback & Events

For any DOM manipulation that can *only* be performed once the content has been loaded into the DOM, a callback can be provided to push():

    $('#foo').push('/foo', function() {
        // Do something here
    });

Or for POST requests:

    $('#foo').push('/foo', {...}, function() {
        // Do something here
    });

That callback is stored and called *everytime* the content is loaded, even when the back button is pressed, so be careful of what's put in it. Also avoid any event binding here, instead just delegate the events to the first static parent.
