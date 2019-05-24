class Request {
    static send(url, body = {}, headers = {'Content-Type': 'application/json'}) {
        headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36';
        return new Promise((resolve, reject) => {
            const request = Request.net.request({
                url: url,
                method: 'POST',
                headers: headers
            });

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

Request.net = require('electron').remote.net;

export default Request;