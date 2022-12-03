<script lang="tsx">
import { defineComponent } from 'vue';

export default defineComponent({
    setup() {
        const dynamsofticon = require('@/assets/image/dynamsoft_logo_orange.png'); // todo: why can't use import
        const download = require('@/assets/image/download.svg');

        return () => (
            <>
                <div class="header">
                    <img src={ dynamsofticon } alt="logo" class="dynamsoft-icon"/>
                    <div class="getCode"><a href="https://github.com/Dynamsoft/label-recognizer-javascript-demo" target="_blank">
                        Get Source Code
                        <img src={download} class="download-icon"/>
                    </a></div>
                </div>
            </>
        )
    },
})
</script>

<style lang="scss" scoped>
    .header {
        position: absolute;
        display: flex;
        align-items: center;
        top: 0;
        margin: 0 auto;
        width: 100%;
        height: 60px;
        background-color: rgb(34,34,34);
        .dynamsoft-icon {
            height: 50%;
            margin-left: 20px;
        }
        .getCode {
            width: 100%;
            text-align: right;
            min-width: 112px;
            a {
                text-align: right;
                color: #ffffff;
            }
            .download-icon {
                margin: 0 10px 0 5px;
            }
        }
    }
    @media screen and (min-width: 980px) {
        .header {
            display: none;
        }
    }
</style>