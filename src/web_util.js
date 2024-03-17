const web = require('./web_declarations');

/**
 * @return 成功, 回傳true; 如果http method不為'OPTIONS', 回傳false
 * @throws failException 檢驗失敗拋錯誤 
 */
function preflight(req, response) {
    if ('OPTIONS' != req.method)
        return false;

    // It's a OPTIONS api
    console.log('\n### Preflight Check: ###');

    let success;
    // do checks
    success = true;

    if (success) {
        console.info('--> 成功');
        return true;
    }

    // 失敗
    console.warn('--> 失敗');
    throw "Preflight check failed";
}

function writeResponse(statusCode, headers, response, payload) {
    response.writeHead(statusCode, headers);
    if (payload) {
        switch(typeof payload) {
            case 'string':
                if (payload.length > 0)
                    response.write(payload);
                break;
            case 'object':
                response.write(JSON.stringify(payload));
                break;
            default:
                response.write(payload);
        }
    }
    response.end();
}

function getRequestBody(req, func_body_structure_validate) {
    return new Promise((resolve, reject) => {
        let bodyRaw = '';
        let bodyJson = null;

        // start collecting chunks
        req.setEncoding('utf8');
        req.on('data', (chunk) => {
            bodyRaw += chunk;
        });        
        req.on('end', () => {
            try {
                // parse
                bodyJson = JSON.parse(bodyRaw);
                // body structure validation
                if (!func_body_structure_validate) {
                    resolve(bodyJson);
                }
                else {
                    let ret = null;
                    try {
                        ret = func_body_structure_validate(bodyJson);
                        if (ret === true)
                            resolve(bodyJson);
                        else
                            reject('body structure validation failed.');
                    }
                    catch (validateError) {
                        reject(validateError);
                    }
                }
            }
            catch (parseError) {
                reject(parseError);
            }
        });
    });
}

function buildApiUrl(apibaseURL, route, version) {
    let url = `/${apibaseURL}`;
    if (version != undefined && version !=  null && version.trim().length > 0) {
        url += `/${version}`;
    }
    url += `/${route}`;
    return url;
}

function url_path_info(baseURL, req) {
    const apiPath = req.url.substring(baseURL.length);
    console.log(`- api path: \"${apiPath}\"`);
    const paths = apiPath.split('/').filter((s) => s.length > 0);
    console.log(`- path segments: [${paths}]`);
    return { apiPath, paths };
}

module.exports = {
    preflight,
    getRequestBody,
    writeResponse,
    buildApiUrl,
    url_path_info
}