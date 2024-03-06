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

module.exports = {
    preflight
}