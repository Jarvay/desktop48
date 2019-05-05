class Dev {
    static log(message, param) {
        if (process.env.NODE_ENV === 'development') {
            if (typeof param === "undefined"){
                console.log(message);
            }else {
                console.log(message, param);
            }
        }
    }

    static error(error) {
        if (process.env.NODE_ENV === 'development') {
            console.error(error);
        }
    }

    static info(message, param) {
        if (process.env.NODE_ENV === 'development') {
            if (typeof param === "undefined"){
                console.info(message);
            }else {
                console.info(message, param);
            }
        }
    }
}

export default Dev;