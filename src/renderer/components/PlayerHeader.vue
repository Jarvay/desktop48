<template>
    <div>
        <Header>
            <div class="header-box">
                <div class="layout-nav">
                    <Button style="margin-left: 8px;" type="primary" @click="showUrl = true">视频地址
                    </Button>
                </div>
            </div>
        </Header>

        <Modal v-model="showUrl" title="视频地址">
            <p>
                <span>{{videoUrl}}</span>
            </p>
        </Modal>
    </div>
</template>

<script>
    export default {
        name: 'PlayerHeader',
        data() {
            return {
                showUrl: false
            }
        },
        props: {
            currentPlayer: {
                type: String,
                required: true
            },
            videoUrl: {
                type: String,
                require: true
            }
        },
        methods: {

        }
    }
</script>

<style scoped>
    .layout-nav {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        width: 480px;
    }

    .layout-logo {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        padding: 4px 16px;
        background: #5b6270;
        border-radius: 4px;
    }

    .header-box {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        height: 100%;
    }

    .home-icon {
        font-size: 32px;
        color: white;
    }
</style>
