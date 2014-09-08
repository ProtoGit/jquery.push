/**
 * https://github.com/ProtoGit/jquery.push
 */
(function($) {

    if (!'history' in window
     || !'pushState' in window.history) {
        throw new Error('No pushState API support');
    }

    $.push = function() {

        if (arguments.length === 0) {
            throw new Error('Invalid push() arguments');
        }

        // URI only
        if (arguments.length === 1) {
            return pushState(resolveUri(arguments[0]));
        }

        // URI and callback only
        if (arguments.length === 2 && typeof arguments[1] == 'function') {
            return pushState(resolveUri(arguments[0]), null, null, arguments[1]);
        }

        // URI with optional output selector and callback
        return pushState(resolveUri(arguments[0]), null, arguments[1], arguments[2]);
    };

    $.postPush = function() {

        if (arguments.length < 2) {
            throw new Error('Invalid postPush() arguments');
        }

        // URI and post data only
        if (arguments.length === 2) {
            return pushState(resolveUri(arguments[0]), arguments[1]);
        }

        // URI, post data and callback only
        if (arguments.length === 3 && typeof arguments[2] == 'function') {
            return pushState(resolveUri(arguments[0]), arguments[1], null, arguments[2]);
        }

        // URI and post data with optional output selector and callback
        return pushState(resolveUri(arguments[0]), arguments[1], arguments[2], arguments[3]);
    };

    function resolveUri(unknown)
    {
        // Check for string URI
        if (typeof unknown == 'string') {
            return unknown;
        }

        // Check for native or jQuery elements
        if (typeof unknown == 'object') {
            var element = (unknown.get)
                ? unknown.get(0)
                : unkown;
            if (element.tagName) {
                var tagName = element.tagName.toLowerCase();
                if (tagName == 'form') {
                    return element.action;
                } else if (tagName == 'a') {
                    return element.href;
                }
            }
        }

        throw new Error('Invalid push() URI argument');
    }

    function pushState(uri, postData, target, callback)
    {
        var handleResponse = function(xhr) {

            if (!xhr.responseJSON) {
                throw new Error('Response must be JSON');
            }

            var response = xhr.responseJSON;
            if (!response.title && (!response.content || !response.fragments)) {
                throw new Error('Invalid JSON response');
            }

            var state = {
                response: response
            };

            if (target) {
                state.target = target;
            }

            if (typeof callback == 'function') {
                state.callback = callback.toString();
            }

            window.history.pushState(state, response.title, uri);
            renderState(state);
        };

        var options = {
            url: uri,
            dataType: 'json',
            complete: handleResponse
        };

        if (postData) {
            options.type = 'POST';
            options.data = postData;
        }

        $.ajax(options);
    }

    function renderState(state)
    {
        window.document.title = state.response.title;

        if (state.target && state.response.content) {
            $(state.target).html(state.response.content);
        }

        if (state.response.fragments) {
            $.each(state.response.fragments, function(id, content) {
                $('#' + id).html(content);
            });
        }

        if (state.callback) {
            var callback = Function('return ' + state.callback)();
            callback(state.response);
        }
    }

    $(window).on('popstate', function(event) {
        if (event.originalEvent.state) {
            renderState(event.originalEvent.state);
        }
    });

})(jQuery);