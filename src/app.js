// import from modules
const http = require('http');

// Web constants, and customized checks
const web = require('./web_declarations');
const { preflight } = require('./web_util');

const URL_TODOS = '/todos';
const URL_TODOS_API = '/api/todos';

const requestHandler = (req, response) => {
    // response headers
    const headers = {
        ...web.HEADERS_TEXT_HTML,
        ...web.HEADERS_CORS
    };

    console.log(`[${req.method}] "${req.url}"`);
    try {
        if (req.url == '/') {
            response.writeHead(200, headers);
            response.write("Server");
            response.end();
        }
        // text/html
        else if (req.url.startsWith(URL_TODOS)) {
            const apiPath = req.url.substring(URL_TODOS.length);
            console.log(`- path: \"${apiPath}\"`);
            const paths = apiPath.split('/').filter((s) => s.length > 0);
            console.log(`- path segments: [${paths}]`);

            response.writeHead(200, headers);
            response.write("<h2>Todolist Backend</h2>");
            response.write(`operation: \"${paths[0]}\"<br/>`);
            response.write("目前開發中...");
            response.end();
        }
        // application/json
        else if (req.url.startsWith(URL_TODOS_API)) {
            const apiPath = req.url.substring(URL_TODOS_API.length);
            console.log(`- api path: \"${apiPath}\"`);
            const paths = apiPath.split('/').filter((s) => s.length > 0);
            console.log(`- path segments: [${paths}]`);

            // preflight流程
            if (preflight(req, response)) {
                response.writeHead(200, headers);
                response.end();
                return;
            }

            // 一般流程
            response.writeHead(200, {...headers, ...web.HEADERS_APPLICATION_JSON});
            response.write(`it's todolist API, operation: "${paths[0]}"`);
            response.end();
        }
        else {
            response.writeHead(404, headers);
            response.write("Not found");
            response.end();
        }
    }
    catch (err) {
        console.error(`Error: \"${err}\"`);
        response.writeHead(500, headers);
        response.write(`Server internal error: "${err}"`);
        response.end();
    }
    finally {
        console.log();
    }
};

http.createServer(requestHandler)
.listen(8080);
