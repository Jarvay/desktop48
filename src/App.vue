<template>
    <div id="app">
        <Initialize @on-initialized="onInitialized" v-if="!isInitialized"></Initialize>
        <Index v-else></Index>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import Index from './components/Index.vue';
    import Initialize from '@/components/Initialize.vue';

    @Component({
        components: {
            Index,
            Initialize
        },
    })
    export default class App extends Vue {
        protected isInitialized: boolean = false;

        protected onInitialized() {
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
