// import from modules
const http = require('http');
const { v4: uuidv4 } = require('uuid');

// Web constants, and customized checks
const web = require('./web_declarations');
const { preflight, getRequestBody, writeResponse } = require('./web_util');

const URL_TODOS_API = '/api/todos';

var todolist = new Map();

const requestHandler = (req, response) => {
    // response headers
    const headers = {
        ...web.HEADERS_TEXT_HTML,
        ...web.HEADERS_CORS
    };
    let statusCode = 200;
    let message;

    console.log(`[${req.method}] "${req.url}"`);
    try {
        // Server root
        if (req.url == '/') {
            response.writeHead(200, headers);
            response.write("Server");
            response.end();
            return;
        }
        // Todolist API (application/json)
        else if (req.url.startsWith(URL_TODOS_API)) {
            const apiPath = req.url.substring(URL_TODOS_API.length);
            console.log(`- api path: \"${apiPath}\"`);
            const paths = apiPath.split('/').filter((s) => s.length > 0);
            console.log(`- path segments: [${paths}]`);

            // preflight流程
            if (preflight(req, response)) {
                /* 檢查通過 */
                response.writeHead(200, headers);
                response.end();
                return;
            }

            // 一般流程
            let todo = {};
            try {
                switch (req.method) {
                    case 'GET': {
                        // keep states
                        statusCode = 200;
                        // write response
                        writeResponse(statusCode, {...headers, ...web.HEADERS_APPLICATION_JSON}, response,                            
                            JSON.stringify({
                                status: 'success',
                                data: Array.from(todolist.values())
                            })
                        );
                        break;
                    }
                    case 'POST': {
                        getRequestBody(req, (bodyJson) => {
                            return 'title' in bodyJson;
                        })
                        .then((bodyJson) => {
                            console.log(`request body:${JSON.stringify(bodyJson)}`);
                            todo.id = uuidv4();
                            todo.title = bodyJson.title;
                            todolist.set(todo.id, todo);

                            // keep states
                            statusCode = 200;
                            // write response
                            writeResponse(statusCode, {...headers, ...web.HEADERS_APPLICATION_JSON}, response,                            
                                JSON.stringify({
                                    status: 'success',
                                    data: (todo)? todo:undefined
                                })
                            );
                        })
                        .catch((err) => {
                            console.log(`ERROR: :${err}`);
                            // keep states
                            statusCode = 500;
                            // write response
                            writeResponse(statusCode, {...headers, ...web.HEADERS_APPLICATION_JSON}, response,                            
                                JSON.stringify({
                                    status: 'failed',
                                    msg: err
                                })
                            );
                        });
                        break;
                    }
                    case 'PATCH': {
                        break;
                    }
                    case 'DELETE': {
                        break;
                    }
                }
                return;
            }
            catch (err) {
                // keep states
                statusCode = 500;
                message = err;
                // write response
                writeResponse(statusCode, {...headers, ...web.HEADERS_APPLICATION_JSON}, response,                            
                    JSON.stringify({
                        status: 'failed',
                        msg: err
                    })
                );
                return;
            }
        }
        // Error: 404 (Not found)
        else {
            // keep states
            statusCode = 404;
            message = "Not found";
            // write response
            writeResponse(statusCode, {...headers, ...web.HEADERS_APPLICATION_JSON}, response,                            
                JSON.stringify({
                    status: (statusCode == 200)? 'success':'failed',
                    msg: (message)? message:undefined
                })
            );
            return;
        }
    }
    // Error: 其他未處理錯誤
    catch (err) {
        // keep states
        statusCode = 500;
        message = `Server internal error: "${err}"`;
        console.error(`Error: \"${err}\"`);
        // write response
        response.writeHead(statusCode, headers);
        response.write(JSON.stringify({
            status: 'failed',
            msg: message
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
