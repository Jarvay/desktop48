<template>
    <div id="app">
        <Initialize @on-initialized="onInitialized" v-if="!isInitialized"></Initialize>
        <Index v-else></Index>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import Index from "./components/Index.vue";
    import Initialize from "@/components/Initialize.vue";
    import Constants from "@/assets/js/constants";

    import * as ElementUI from "element-ui";
    import "element-ui/lib/theme-chalk/index.css";

    import "./assets/css/app.scss";
    import './assets/css/fonts/iconfont.css';

    Vue.use(ElementUI);
    Vue.prototype.Constants = Constants;

    @Component({
        components: {
            Index,
            Initialize
        },
    })
    export default class App extends Vue {
        private isInitialized: boolean = false;

        private onInitialized() {
            this.isInitialized = true;
        }
    }
</script>

<style lang="scss">
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 8px;
    }
</style>
