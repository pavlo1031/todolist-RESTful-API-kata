function isNull(value) {
    return (
        value == null || value == undefined
    );
}

function isNotNull(value) {
    return !isNull(value)
}

class ProcessDataPromise {
    // Constants
    static PENDING = 'pending';
    static FULFILLED = 'fulfilled';
    static REJECTED  = 'rejected';
    // init
    constructor(executor) {
        this.status = ProcessDataPromise.PENDING;
        this.result = null;
        this.isOnRejectedCalled = null;
        executor(this.resolve.bind(this), this.reject.bind(this));
    }

    resolve(result) {
        console.log(`resolve()`);
        if (this.status === ProcessDataPromise.PENDING) {
            this.status = ProcessDataPromise.FULFILLED;
            this.result = result; 
        }
    }

    reject(result) {
        console.log(`reject()`);
        if (this.status === ProcessDataPromise.PENDING) {
            this.status = ProcessDataPromise.REJECTED;
            this.result = result;
            this.isOnRejectedCalled = false;
        }
    }

    then(onFulfilled, onRejected) {
        if (this.status === ProcessDataPromise.FULFILLED) {
            console.log('then()');
            setTimeout(() => {
                if (onFulfilled) {
                    let ret = onFulfilled(this.result);
                    if (ret != undefined && ret != null)
                        this.result = ret; 
                }
            });
        }
        else if (this.status === ProcessDataPromise.REJECTED) {
            console.log('then()');
            if (onRejected) {
                let ret = onRejected(this.result);
                if (ret != undefined && ret != null)
                    this.result = ret;
                this.isOnRejectedCalled = true;
            }
        }
        return this;
    }
}

module.exports = {
    isNull,
    isNotNull,
    ProcessDataPromise
}
