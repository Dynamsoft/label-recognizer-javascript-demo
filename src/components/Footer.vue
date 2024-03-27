<script lang="tsx">
import { defineComponent } from 'vue';
import {linkToDynamsoftHomePage} from "../util"

export default defineComponent({
    setup() {
        const dynamsofticon = require('@/assets/image/dynamsoft_logo_orange.png');

        return () => (
            <>
                <div class="footer">
                    <div class="footer-content">
                        <img src={dynamsofticon} onClick={linkToDynamsoftHomePage}/>
                        <span>
                            © 2003 - {new Date().getUTCFullYear()} Dynamsoft. All rights reserved. 
                            <a href="https://www.dynamsoft.com/PrivacyStatement.aspx"> Privacy Statement </a>
                            /
                            <a href="https://www.dynamsoft.com/SiteMap.aspx"> Site Map</a>
                        </span>
                    </div>
                </div>
            </>
        )
    },
})
</script>

<style lang="scss" scoped>
    .footer {
        position: absolute;
        bottom: 0;
        width: 100%;
        min-width: 375px;
        height: 7vh;
        background-color: rgb(34,34,34);
        line-height: 7vh;
        .support-content {
            position: absolute;
            left: 50%;
            bottom: 8vh;
            width: 80%;
            height: 5vh;
            transform: translateX(-50%);
            background-color: #373739;
            font-size: 16px;
            color: #aaaaaa;
            font-family: "OpenSans-Regular";
            line-height: 5vh;
        }
        .footer-content {
            height: 100%;
            img {
                height: 60%;
                margin-right: 45px;
                vertical-align: middle;
                cursor: pointer;
            }
            span {
                font-size: 16px;
                color: white;
                font-family: "OpenSans-Regular";
                a {
                    color: #FE8E14;
                }
            }
        }
    }

    @media screen and (max-width: 980px) {
        .footer {
            display: none;
        }
    }
</style>