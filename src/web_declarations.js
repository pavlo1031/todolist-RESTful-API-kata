const HEADERS_TEXT_PLAIN = {
    'Content-Type': "text/plain; charset=utf-8"
};

const HEADERS_TEXT_HTML = {
    'Content-Type': "text/html; charset=utf-8"
};

const HEADERS_APPLICATION_JSON = {
    'Content-Type': "application/json; charset=utf-8"
};

const HEADERS_CORS = {
    'Access-Control-Allow-Header': 'Content-Type, Authorization, Content-Length, X-Request-Width',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
}

module.exports = {
    HEADERS_TEXT_PLAIN,
    HEADERS_TEXT_HTML,
    HEADERS_APPLICATION_JSON,
    HEADERS_CORS
};
