<script lang="tsx">
import { defineComponent } from 'vue';

export default defineComponent({
    setup() {
        const dynamsofticon = require('@/assets/image/dynamsoft_logo_orange.png'); // todo: why can't use import
        const download = require('@/assets/image/download.svg');

        const goToChat = () => {
            let link = document.querySelector("#comm100-container a");
            if (!link) {
                link = document.getElementById("comm100-float-button-2-inner");
            }
            if (!link) {
                link = document.querySelector("#comm100-container img");
            }
            if (!link) {
                link = document.getElementById("comm100-container");
            }
            try {
                let ev = new MouseEvent("click", {
                view: window,
                bubbles: true,
                cancelable: true,
                });
                link!.dispatchEvent(ev);
            } catch (ex) {
                (link as HTMLLinkElement)!.click();
            }
        }

        return () => (
            <>
                <div class="header">
                    <img src={ dynamsofticon } alt="logo" class="dynamsoft-icon"/>
                    <div style="margin-left: 15px;">
                        <svg width="24" height="24" viewBox="0 0 24 24" onClick={ goToChat }><g transform="translate(-319 -816.551)"><g><g id="conversation-chat-2"><path d="M333.5,817.051h-10a4,4,0,0,0-4,4v5a4,4,0,0,0,4,4h1v4l4.5-4h4.5a4,4,0,0,0,4-4v-5A4,4,0,0,0,333.5,817.051Z" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/><path d="M330.5,833.051v1.5a2.5,2.5,0,0,0,2.5,2.5h2.5l3,3v-3H340a2.5,2.5,0,0,0,2.5-2.5v-3a2.5,2.5,0,0,0-2.5-2.5h-.5" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/></g></g></g></svg>
                    </div>
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