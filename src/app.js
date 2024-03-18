// import from modules
const http = require('http');
const { v4: uuidv4 } = require('uuid');

// Web constants, and customized checks
const web = require('./web_declarations');
const { buildApiUrl, url_path_info } = require('./web_util');
const { preflight, getRequestBody, writeResponse } = require('./web_util');

// URL constants
const API_VERSION = "v1";
const URL_TODOS_API = buildApiUrl(`api`, 'todos', API_VERSION);

const URL_TODOS_API_LIST = `${URL_TODOS_API}`
const URL_TODOS_API_COUNT = `${URL_TODOS_API}/count`;
const URL_TODOS_API_INSERT = `${URL_TODOS_API}`;
const URL_TODOS_API_UPDATE = `${URL_TODOS_API}`;
const URL_TODOS_API_DELETE = `${URL_TODOS_API}`;
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
            writeResponse(200, headers, "Server");
            return;
        }
        // Todolist API (application/json)
        else if (req.url.startsWith(URL_TODOS_API)) {
            const { apiPath, paths } = url_path_info(URL_TODOS_API, req);

            // preflight流程
            if (preflight(req, response)) {
                /* 檢查通過 */
                writeResponse(200, headers, response, "pass");
                return;
            }

            // 一般流程
            let todo = {};
            try {
                switch (req.method) {
                    case 'GET': {
                        if (URL_TODOS_API_LIST === req.url) {
                            statusCode = 200;
                            writeResponse(statusCode, {...headers, ...web.HEADERS_APPLICATION_JSON}, response,                            
                                JSON.stringify({
                                    status: 'success',
                                    data: Array.from(todolist.values()),
                                    count: todolist.size
                                })
                            );
                        }
                        else if (URL_TODOS_API_COUNT === req.url) {
                            statusCode = 200;
                            writeResponse(statusCode, {...headers, ...web.HEADERS_APPLICATION_JSON}, response,                            
                                JSON.stringify({
                                    status: 'success',
                                    count: todolist.size
                                })
                            );
                        }
                        break;
                    }
                    case 'POST': {
                        getRequestBody(req)
                        .then((bodyJson) => {
                            console.log(`request body:${JSON.stringify(bodyJson)}`);
                            /*
                             * 測式環境/模式:
                             * 1).requeset body可使用給定的id
                             * 2).允許批量新增: requeset body可以是array
                             */
                            const isArray = Array.isArray(bodyJson);

                            // 新增多筆
                            if (isArray) {
                                todo = [];
                                [...bodyJson].forEach((element, index) => {
                                    const {
                                        id, title,    // 規格中的
                                        ...otherProps // 非規格
                                    } = element;

                                    // build
                                    let todo_ = {
                                        id: (id)? id : uuidv4(),
                                        title: title,
                                        ...otherProps
                                    };
                                    todo.push(todo_);
                                    todolist.set(todo_.id, todo_);
                                });
                            }
                            // 新增一筆
                            else {
                                const {
                                    id, title,    // 規格中的
                                    ...otherProps // 非規格
                                } = bodyJson;

                                todo = {
                                    id: (id)? id : uuidv4(),
                                    title: title,
                                    ...otherProps
                                };
                                todolist.set(todo.id, todo);
                            }
                            console.log(`--> todo: ${JSON.stringify(todo)}`);

                            // keep states
                            statusCode = 200;
                            // write response
                            writeResponse(statusCode, {...headers, ...web.HEADERS_APPLICATION_JSON}, response,                            
                                JSON.stringify({
                                    status: 'success',
                                    data: (isArray)? Array.from(todo) : todo
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
                    status: 'failed',
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
