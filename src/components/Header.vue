<script lang="tsx">
import { defineComponent } from 'vue';

export default defineComponent({
    setup() {
        const dynamsofticon = require('@/assets/image/dynamsoft_logo_orange.png'); // todo: why can't use import

        const goToChat = () => {
            location.href = 'https://support.dynamsoft.com/LiveChatServer/chatwindowmobile.aspx?planId=5000110&siteId=10008&dynamic=false&pageTitle=Barcode%20Reader%20JavaScript%20Demo%20%7C%20Dynamsoft&pageUrl=https%3A%2F%2Fdemo.dynamsoft.com%2Fbarcode-reader-js%2F&newurl=1&r=4&embInv=0&dirChat=0&guid=&chatGroup='
        }

        return () => (
            <>
                <div class="header">
                    <img src={ dynamsofticon } alt="logo" class="dynamsoft-icon"/>
                    <div style="margin-left: 15px;">
                        <svg width="24" height="24" viewBox="0 0 24 24" onClick={ goToChat }>
                            <g transform="translate(-319 -816.551)">
                            <g>
                                <g id="conversation-chat-2">
                                <path
                                    d="M333.5,817.051h-10a4,4,0,0,0-4,4v5a4,4,0,0,0,4,4h1v4l4.5-4h4.5a4,4,0,0,0,4-4v-5A4,4,0,0,0,333.5,817.051Z"
                                    fill="none"
                                    stroke="#fff"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1"
                                />
                                <path
                                    d="M330.5,833.051v1.5a2.5,2.5,0,0,0,2.5,2.5h2.5l3,3v-3H340a2.5,2.5,0,0,0,2.5-2.5v-3a2.5,2.5,0,0,0-2.5-2.5h-.5"
                                    fill="none"
                                    stroke="#fff"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1"
                                />
                                </g>
                            </g>
                            </g>
                        </svg>
                    </div>
                    <div class="getCode"><a href="https://github.com/Dynamsoft/label-recognizer-javascript-demo" target="_blank">
                        Get Source Code
                        <svg xmlns="http://www.w3.org/2000/svg" width="14.003" height="14.003" viewBox="0 0 14.003 14.003" class="download-icon">
                            <g id="Internet-Networks-Servers_Upload_Download_download-circle" data-name="Internet-Networks-Servers / Upload/Download / download-circle" transform="translate(-519.5 -1341.5)">
                                <g id="Group_166" data-name="Group 166" transform="translate(520 1342)">
                                <g id="download-circle">
                                    <path id="Oval_90" data-name="Oval 90" d="M526.5,1353a6.5,6.5,0,1,0-6.5-6.5A6.5,6.5,0,0,0,526.5,1353Z" transform="translate(-520 -1340)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                    <path id="Shape_1431" data-name="Shape 1431" d="M531,1352.155V1344.5" transform="translate(-524.498 -1341.826)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                    <path id="Shape_1432" data-name="Shape 1432" d="M532.037,1352l-3.268,3.269L525.5,1352" transform="translate(-522.267 -1344.92)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                </g>
                                </g>
                            </g>
                        </svg>
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