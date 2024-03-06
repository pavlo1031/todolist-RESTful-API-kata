// import from modules
const http = require('http');
const { v4: uuidv4 } = require('uuid');

// Web constants, and customized checks
const web = require('./web_declarations');
const { preflight } = require('./web_util');

const URL_TODOS_API = '/api/todos';

var todolist = [];

const requestHandler = (req, response) => {
    // response headers
    const headers = {
        ...web.HEADERS_TEXT_HTML,
        ...web.HEADERS_CORS
    };
    let statusCode = 200;
    let message;
    let payload;

    console.log(`[${req.method}] "${req.url}"`);
    try {
        if (req.url == '/') {
            response.writeHead(200, headers);
            response.write("Server");
            response.end();
            return;
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
            let todo = {};
            try {
                switch (req.method) {
                    case 'GET':
                        break;
                    case 'POST':
                        todo.id = uuidv4();
                        todo.title = 'def'
                        todolist.push(todo);
                        console.log('- 已新增一task: ' + JSON.stringify(todo));
                        console.log('- 目前todolist: ' + JSON.stringify(todolist));
                        break;
                    case 'PATCH':
                        break;
                    case 'DELETE':
                        break;
                }
                // keep states
                statusCode = 200;
                payload = todo;
                // write response
                response.writeHead(statusCode, {...headers, ...web.HEADERS_APPLICATION_JSON});
                response.write(JSON.stringify({
                    status: 'success',
                    data: (payload)? payload:undefined
                }));
                response.end();
                return;
            }
            catch (err) {
                // keep states
                statusCode = 500;
                message = err;
                // write response
                response.writeHead(statusCode, {...headers, ...web.HEADERS_APPLICATION_JSON});
                response.write(JSON.stringify({
                    status: 'failed',
                    message: err,
                    data: (payload)? payload:undefined
                }));
                response.end();
                return;
            }
        }
        // API Not found
        else {
            // keep states
            statusCode = 404;
            message = "Not found";
            // write response
            response.writeHead(statusCode, headers);
            response.write(JSON.stringify({
                status: (statusCode == 200)? 'success':'failed',
                message: (message)? message:undefined,
                data: (payload)? payload:undefined
            }));
            response.end();
            return;
        }
    }
    // 未處理錯誤
    catch (err) {
        // keep states
        statusCode = 500;
        message = `Server internal error: "${err}"`;
        console.error(`Error: \"${err}\"`);
        // write response
        response.writeHead(statusCode, headers);
        response.write(JSON.stringify({
            status: 'failed',
            message: message,
            data: (payload)? payload:undefined
        }));
        response.end();
        return;
    }
    finally {
        console.log();
    }
};

http.createServer(requestHandler)
.listen(8080);
