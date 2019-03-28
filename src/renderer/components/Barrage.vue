<template>
    <canvas ref="canvas"></canvas>
</template>

<script>
    const USERNAME_COLOR = '#999999';

    const TEXT_SIZE = 24;

    const BORDER_WIDTH = 4;

    export default {
        name: 'Barrage',
        data() {
            return {
                context: null,
                width: -1,
                height: -1,
                barrageList: [],
                randomCount: 0,
            };
        },
        mounted: function () {
            this.init();
        },
        methods: {
            shoot: function (barrage) {
                const top = this.randomTop();
                const left = this.width;
                const level = barrage.level || 1;
                const color = level == 1 ? '#000' : this.randomColor();
                this.barrageList.push({
                    top: top,
                    left: left,
                    color: color,
                    content: barrage.content,
                    username: barrage.username,
                    level: barrage.level,
                });
            },
            start: function () {
                setInterval(() => {
                    this.context.clearRect(0, 0, this.width, this.height);
                    this.barrageList.forEach(barrage => {
                        switch (barrage.level) {
                            default:
                                //弹幕发送者
                                this.context.fillStyle = USERNAME_COLOR;
                                this.context.fillText(barrage.username + '：', barrage.left, barrage.top);
                                //弹幕内容
                                this.context.fillStyle = barrage.color || '#000000';
                                this.context.fillText(barrage.content, barrage.left +
                                    this.context.measureText(barrage.username + '：').width,
                                    barrage.top);
                                break;
                            case 3: //成员弹幕
                                this.drawQuadratic(barrage.left - BORDER_WIDTH * 4, barrage.top - TEXT_SIZE - BORDER_WIDTH,
                                    this.context.measureText(barrage.username + '：' + barrage.content).width + BORDER_WIDTH * 8,
                                    80, '#c07fcc');
                                this.context.fillStyle = '#fff';
                                this.context.fillText(barrage.username + '：' + barrage.content, barrage.left, barrage.top);
                                break;
                            case 0: //礼物信息
                                this.drawQuadratic(barrage.left - BORDER_WIDTH * 4, barrage.top - TEXT_SIZE - BORDER_WIDTH,
                                    this.context.measureText(barrage.username + barrage.content + TEXT_SIZE).width +
                                    BORDER_WIDTH * 8,
                                    80);
                                this.context.fillStyle = '#fff';
                                this.context.fillText(barrage.username + barrage.content, barrage.left, barrage.top);
                                break;
                        }

                        barrage.left -= 1.2;
                    });

                    this.barrageList.forEach((barrage, index) => {
                        if (barrage.left + this.context.measureText(barrage.username + '：' + barrage.content).width < 0) {
                            this.barrageList.splice(index, 1);
                        }
                    });
                }, 8);
            },
            randomColor: function () {
                return '#' + Math.floor(Math.random() * 0xffffff).toString(16);
            },
            init: function () {
                const canvas = this.$refs.canvas;
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;

                this.context = canvas.getContext('2d');
                this.context.fillStyle = '#000000';
                this.context.font = 'bold ' + TEXT_SIZE + 'px Microsoft YaHei';

                const react = canvas.getBoundingClientRect();
                this.width = react.right - react.left;
                this.height = react.bottom - react.top;

                this.start();
            },
            randomTop: function () {
                let top = Math.floor(Math.random() * (this.height - TEXT_SIZE)) + TEXT_SIZE - 4;
                const isSuperimposed = this.barrageList.some(barrage => {
                    return top < barrage.top + TEXT_SIZE && top > barrage.top - TEXT_SIZE;
                });
                //尽量避免重叠
                if (isSuperimposed && this.randomCount < 4) {
                    this.randomCount++;
                    return this.randomTop();
                }
                this.randomCount = 0;
                return top;
            },
            drawQuadratic: function (x, y, width, radius, color) {
                this.context.fillStyle = color || '#04ebff';

                const height = TEXT_SIZE + BORDER_WIDTH * 4;
                if (width < 2 * radius) {
                    radius = width / 2;
                }
                if (height < 2 * radius) {
                    radius = height / 2;
                }
                this.context.beginPath();
                this.context.moveTo(x + radius, y);
                this.context.arcTo(x + width, y, x + width, y + height, radius);
                this.context.arcTo(x + width, y + height, x, y + height, radius);
                this.context.arcTo(x, y + height, x, y, radius);
                this.context.arcTo(x, y, x + width, y, radius);
                this.context.closePath();
                this.context.fill();
            },
        }
    }
</script>

<style scoped>

</style>
