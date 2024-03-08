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

module.exports = {
    preflight,
    getRequestBody
}