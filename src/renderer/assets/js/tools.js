Date.prototype.format = function (fmt) {
    const o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (const k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) :
                (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};

const YI_ZHI_BO_HOST = 'alcdn.hls.xiaoka.tv';

class Tools {
    /**
     *
     * @param picturesStr
     * @returns {any[]}
     */
    static pictureUrls(picturesStr) {
        const pictures = picturesStr.split(',');
        return pictures.map(picture => {
            if (picture.includes('http')) {
                return picture;
            } else {
                return 'https://source.48.cn' + picture;
            }
        });
    }

    static timeToSecond(time) {
        if (!time) return;
        const hours = time.split(':')[0];
        const minutes = time.split(':')[1];
        const seconds = time.split(':')[2];
        return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
    }

    static setSenderName(senderName) {
        localStorage.setItem('senderName', senderName);
    }

    static getSenderName() {
        return localStorage.getItem('senderName');
    }

    static setSenderId(senderId) {
        localStorage.setItem('senderId', parseInt(senderId));
    }

    static getSenderId() {
        return localStorage.getItem('senderId');
    }

    static setVolume(volume) {
        localStorage.setItem('volume', volume);
    }

    static getVolume() {
        return localStorage.getItem('volume') || 0.8;
    }

    static lyricsParse(lyrics) {
        const barrages = [];
        const lines = lyrics.split('\r\n');
        lines.forEach(line => {
            if (line) {
                const tmp = line.split(']');
                if (tmp) {
                    const arr = tmp[1].split('\t');
                    barrages.push({
                        time: tmp[0].replace('[', ''),
                        username: arr[0],
                        content: arr[1]
                    })
                }
            }
        });
        return barrages;
    }

    static streamPathHandle(streamPath, timestamp) {
        const date = new Date(timestamp);
        const liveDate = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`;
        return streamPath.replace(/^(http|https):\/\/([^\/]+)\/(\d+)/, function (pathPrefix, protocol, host) {
            if (host.toLowerCase() != YI_ZHI_BO_HOST) {
                return pathPrefix;
            }

            return `${protocol}://${host}/${liveDate}`;
        })
    }
}

export default Tools;
