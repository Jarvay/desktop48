export default class Debug {
    public static log(message: any, param: any = 'undefined') {
        if (process.env.NODE_ENV === 'development') {
            if (param === 'undefined') {
                console.log(message);
            } else {
                console.log(message, param);
            }
        }
    }

    public static error(error: any) {
        if (process.env.NODE_ENV === 'development') {
            console.error(error);
        }
    }

    public static info(message: any, param: any = 'undefined') {
        if (process.env.NODE_ENV === 'development') {
            if (param === 'undefined') {
                console.info(message);
            } else {
                console.info(message, param);
            }
        }
    }
}
