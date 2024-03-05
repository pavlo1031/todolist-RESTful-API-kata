// import from modules
const http = require('http');

// Web constants, and customized checks
const web = require('./web_declarations');
const { preflight } = require('./web_util');


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
        else if (req.url.startsWith('/todolist')) {
            const apiPath = req.url.substring(9);
            console.log(`- todolist path: \"${apiPath}\"`);
            const paths = apiPath.split('/').filter((s) => s.length > 0);
            console.log(`- api path segments: [${paths}]`);

            response.writeHead(200, headers);
            response.write("<h2>Todolist Backend</h2>");
            response.write("目前開發中...");
            response.end();
        }
        else if (req.url.startsWith('/api/todolist')) {
            const apiPath = req.url.substring(13);
            console.log(`- todolist api path: \"${apiPath}\"`);
            const paths = apiPath.split('/').filter((s) => s.length > 0);
            console.log(`- api path segments: [${paths}]`);

            // preflight流程
            if (preflight(req, response)) {
                response.writeHead(200, headers);
                response.end();
                return;
            }

            // 一般流程
            response.writeHead(200, {...headers, ...web.HEADERS_APPLICATION_JSON});
            response.write(`it's todolist API, operation: ${req.method}<br/>`);
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
