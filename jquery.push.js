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

        if (arguments.length === 1) {
            return pushState(resolveUri(arguments[0]));
        }

        if (arguments.length === 2 && typeof arguments[1] == 'function') {
            return pushState(resolveUri(arguments[0]), null, null, arguments[1]);
        }

        return pushState(resolveUri(arguments[0]), null, arguments[1], arguments[2]);
    };

    $.postPush = function() {

        if (arguments.length < 2) {
            throw new Error('Invalid postPush() arguments');
        }

        if (arguments.length === 2) {
            return pushState(resolveUri(arguments[0]), arguments[1]);
        }

        if (arguments.length === 3 && typeof arguments[2] == 'function') {
            return pushState(resolveUri(arguments[0]), arguments[1], null, arguments[2]);
        }

        return pushState(resolveUri(arguments[0]), arguments[1], arguments[2], arguments[3]);
    };

    function resolveUri(unknown)
    {
        if (typeof unknown == 'string') {
            return unknown;
        }

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
        var state = {uri: uri};

        if (postData) {
            state.postData = postData;
        }

        if (typeof target == 'string') {
            state.target = target;
        }

        if (typeof callback == 'function') {
            state.callback = callback.toString();
        }

        window.history.pushState(state, '', uri);
        handleState(state, false);
    }

    function handleState(state, authentic)
    {
        var options = {
            url: state.uri,
            complete: function(xhr) {
                handleResponse(xhr, state, authentic);
            }
        };

        if (state.postData) {
            options.type = 'POST';
            options.data = state.postData;
        }

        $.ajax(options);
    }

    function handleResponse(xhr, state, authentic)
    {
        if (!xhr.responseJSON && !state.target) {
            throw new Error(
                'Response must be valid JSON, or HTML with a predefined output selector'
            );
        }

        if (xhr.responseJSON) {

            if (xhr.responseJSON.title) {
                window.document.title = xhr.responseJSON.title;
            }

            if (state.target && xhr.responseJSON.content) {
                $(state.target).html(xhr.responseJSON.content);
            }

            if (xhr.responseJSON.fragments) {
                $.each(xhr.responseJSON.fragments, function(id, content) {
                    var fragment = $('#' + id);
                    if (fragment.length) {
                        fragment.html(content);
                    }
                });
            }

        } else {

            if (state.target && xhr.responseText) {
                $(state.target).html(xhr.responseText);
            }

        }

        if (state.callback) {
            var callback = Function('return ' + state.callback)();
            if (xhr.responseJSON) {
                callback(xhr.responseJSON, authentic);
            } else {
                callback(xhr.responseText, authentic);
            }
        }
    }

    $(window).on('popstate', function(event) {
        if (event.originalEvent.state) {
            handleState(event.originalEvent.state, true);
        }
    });

})(jQuery);