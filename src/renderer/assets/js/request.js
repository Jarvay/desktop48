import Database from './database';

class Request {
    static send(url, body = {}, headers = {'Content-Type': 'application/json'}) {
        return new Promise((resolve, reject) => {
            const request = Request.net.request({
                url: url,
                method: 'POST'
            });

            for (let key in headers) {
                request.setHeader(key, headers[key]);
            }

            let data = '';
            request.on('response', response => {
                response.on('end', () => {
                    const responseBody = JSON.parse(data);
                    resolve(responseBody);
                });

                response.on('data', (chunk) => {
                    let body = chunk.toString('utf8');
                    data = data + body;
                });

                response.on('error', error => {
                    reject(error);
                })
            });

            request.on('error', error => {
                reject(error);
            });
            request.write(JSON.stringify(body));
            request.end();
        });
    }
}

Request.net = require('electron').remote.net

export default Request;