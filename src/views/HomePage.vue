<script lang="tsx">
import { Ref, defineComponent, ref } from 'vue';
import { CheckOutlined } from '@ant-design/icons-vue';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import { Router, useRouter } from "vue-router";

export default defineComponent({
    setup() {
        const mrzIcon = require('@/assets/image/mrz-icon.svg');
        const dlrLogoIcon = require('@/assets/image/dlr-logo-icon.svg');
        const selected: Ref<string> = ref('mrz');
        const router: Router = useRouter();

        // Select the operation mode and go to the recognition page
        // if PC, when choose a mode, enter directly.
        // if mobile, when choose a mode, need click `START SCAN` btn to enter.
        const startScan = (isBtn: boolean, mode?: string): any => {
            if(document.body.clientWidth >= 980 || isBtn) {
                if(mode) {
                    const url = (mode === 'mrz') ? 'mrz-scanner.html' : 'vin.html'
                    router.push(url + location.search)
                } 
                else {
                    const url = (selected.value === 'mrz') ? 'mrz-scanner.html' : 'vin.html';
                    router.push(url + location.search);
                }
            }
        }

        return () => (
            <>
                <Header/>
                <div class="homepage">
                    <div class="content">
                        <div class="content-header">
                            <img src={ dlrLogoIcon } class="dlr-logo"/>
                            <div class="explain-text">Turn your web page into a text scanner with just a few lines of code!</div>
                        </div> 
                        <div class="choices">
                            <div class="toolTip">To try the library, select a mode below and start scannning</div>
                            <div class="passport-mrz" style={{border: (selected.value == 'mrz')?"1px solid #FE8E14":"1px solid #323234"}} onClick={ ()=>{startScan(false, 'mrz')} }>
                                <input type="radio" name="mode" id="passport-mrz" value="mrz" v-model={selected.value}/>
                                <label for="passport-mrz">
                                    <div style="margin-left: 10px">
                                        <span>MRZ Scanner</span>
                                        <div class="mrzToolTip">Recognizes MRZ code & extracts data from ID-cards, passports, and visas. Supports TD-1, TD-2, TD-3, MRV-A, and MRV-B standards</div>
                                    </div>
                                    <div class="icon-mrz">
                                        <img src={ mrzIcon }/>
                                    </div>
                                    <div class="choice-right" style="margin-top: -50px">
                                        <div class="circle" style={{backgroundColor: (selected.value == 'mrz')?"#FE8E14":"#F5F5F5"}}>
                                            <CheckOutlined style="font-size: 12px"/>
                                        </div>
                                    </div>
                                </label>
                            </div>
                            <div class="vin" style={{border: (selected.value == 'vin')?"1px solid #FE8E14":"1px solid #323234"}} onClick={ ()=>startScan(false, 'vin')}>            
                                <input type="radio" name="mode" id="vin" value="vin"  v-model={selected.value}/>
                                <label for="vin">
                                    <div style="margin-left: 10px">
                                        VIN<span class="vin-text" style="margin-left: 7px;">(Vehicle Identification Number)</span>
                                    </div>
                                    <div class="choice-right">
                                        <div class="circle" style={{backgroundColor: (selected.value == 'vin')?"#FE8E14":"#F5F5F5"}}>
                                            <CheckOutlined style="font-size: 12px"/>
                                        </div>
                                    </div>
                                </label>
                            </div>
                            <div class="number" style={{border: (selected.value == 'number')?"1px solid #FE8E14":"1px solid #323234"}}>            
                                <label for="number">
                                    <div class="modeName">
                                        <span>Number</span>
                                        <span class="coming-soon">Coming soon...</span>
                                    </div>
                                </label>
                            </div>
                            <div class="letter" style={{border: (selected.value == 'letter')?"1px solid #FE8E14":"1px solid #323234"}}>            
                                <label for="letter">
                                    <div class="modeName">
                                        <span>Letter</span>
                                        <span class="coming-soon">Coming soon...</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div class="btn-scan" onClick={ ()=>{startScan(true)} }>START SCAN</div>
                    </div>
                </div>
                <div class="support-content">
                    <div>Supported Browsers: Safari v14+, Chrome v78+, Firefox 62+ and Edge v79+ on Desktop/Android/iOS.</div>
                </div>
                <Footer />
            </>
        )
    },
})
</script>
<style scoped lang="scss">
    .homepage {
        position: fixed;
        top: 80px;
        width: 100%;
        height: 100%;
        padding-bottom: 120px;
        overflow-x: hidden;
        overflow-y: auto;
        .content {
            width: 100%;
            margin-top: 4vh;
            .btn-scan {
                margin: auto;
                height: 40px;
                width: 120px;
                max-width: 200px;
                color: #FE8E14;
                border: 2px solid #FE8E14;
                line-height: 36px;
                background-color: #323234;
                cursor: pointer;
            }
            .content-header {
                .dlr-logo {
                    width: 516px;
                    height: 66px;
                }
                .explain-text {
                    color: #AAAAAA;
                    font-size: 12px;
                    margin: 20px 0;
                    min-width: 350px;
                    padding: 0 50px;
                    font-family: "OpenSans-Regular";
                }
            }
            .choices {
                display: flex;
                justify-content: space-around;
                width: 100%;
                height: 100%;
                margin: auto;
                padding: 0 20px;
                background-color: rgb(50,50,52);
                flex-wrap: wrap;
                margin-bottom: 20px;
                margin-top: 18px;
                .toolTip {
                    font-size: 18px;
                    color: #cccccc;
                    padding-left: 15px;
                    text-align: left;
                }
                .passport-mrz {
                    .mrzToolTip {
                        font-size: 12px;
                        font-family: "OpenSans-Regular";
                        color: #999999;
                        margin-top: 8px;
                    }
                    input {
                        display: none;
                    }
                    label {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        height: 100%;
                    }
                }
                .passport-mrz, .vin, .number, .letter {
                    width: 100%;
                    font-size: 16px;
                    color: #F5F5F5;
                    background-color: rgb(34,34,34);
                    input {
                        display: none;
                    }
                    label {
                        display: flex;
                        align-items: center;
                        height: 100%;
                        text-align: left;
                        padding-left: 6%;
                    }
                }
                .number, .letter {
                    background-color: #3B3B3C;
                    label {
                        .modeName {
                            display: flex;
                            justify-content: space-between;
                            line-height: 40px;
                            color: #676767;
                            .coming-soon {
                                font-size: 16px; 
                                font-family: "OpenSans-Regular";
                                padding-right: 16px;
                            }
                        }
                    }
                }
                .icon-mrz {
                    display: none;
                }
                .choice-right {
                    margin-right: -70%;
                    .circle {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 14px;
                        height: 14px;
                        border-radius: 50%;
                        background-color: #F5F5F5;
                    }
                }
                div {
                    flex: 40%;
                }
            }
        }
    }
    .support-content {
        position: absolute;
        bottom: 8%;
        left: 50%;
        transform: translateX(-50%);
        width: 70%;
        height: 5vh;
        background-color: #373739;
        font-size: 16px;
        color: #aaaaaa;
        font-family: "OpenSans-Regular";
        line-height: 5vh;
    }
    ::-webkit-scrollbar{
        width:19px;
        background-color: #1A1A1A;
        padding: 0 5px;
    }
    ::-webkit-scrollbar-thumb{
        background-color:#272626;
        border: 7px solid transparent;
        background-clip: content-box;
    }
    @media screen and (min-width: 980px) {
        .homepage {
            .content {
                .content-header {
                    .explain-text {
                        color: #ffffff;
                        font-size: 16px;
                    }
                }
                .choices {
                    flex-wrap: wrap;
                    max-width: 1200px;
                    .passport-mrz, .vin, .number, .letter {
                        height: 10vh;
                        margin: 10px;
                    }
                    .passport-mrz {
                        position: relative;
                        flex: 100%;
                        height: 140px;
                        border: 0 !important;
                        font-size: 24px;
                        transition: all 0.2s ease-in-out;
                        &:hover {
                            transition: all 0.2s ease-in-out;
                            box-shadow: -8px 8px #888888;
                            transform: translate(8px, -8px);
                        }
                        .mrzToolTip {
                            font-size: 16px;
                            color: #ffffff;
                            font-family: 'OpenSans-Regular';
                            width: 164%;
                        }
                        label {
                            padding-left: 2%;
                            cursor: pointer;
                        }
                    }
                    .vin {
                        transition: all 0.2s ease-in-out;
                        label {
                            cursor: pointer;
                        }
                        &:hover {
                            transition: all 0.2s ease-in-out;
                            box-shadow: -8px 8px #888888;
                            transform: translate(8px, -8px);
                        }
                    }
                    .vin, .number, .letter {
                        flex: 30%;
                        height: 90px;
                        border: 0 !important;
                        font-size: 24px;
                    }
                    .icon-mrz {
                        display: block;
                        width: 30%;
                        text-align: right;
                        margin-right: 36px;
                    }
                    .choice-right {
                        display: none;
                    }
                    .toolTip {
                        margin-top: 30px;
                        margin-bottom: 20px;
                    }
                }
                .btn-scan {
                    display: none;
                }
            }
        }
        .support-content { 
            min-width: 950px;
        }
    }

    @media screen and (max-width: 980px) {
        .homepage {
            top: 60px;
            .content {
                .content-header {
                    margin-bottom: 0;
                    .dlr-logo {
                        width: 255px;
                        height: 32px;
                    }
                }
                .choices {
                    display: block;
                    .passport-mrz {
                        height: 15vh;
                        // min-width: 340px;
                        min-height: 110px;
                    }
                    .vin, .number, .letter {
                        height: 7vh;
                        margin-top: 15px;
                        // min-width: 340px;
                    }
                    .number, .letter {
                        label {
                            .modeName {
                                .coming-soon {
                                    font-size: 12px; 
                                }
                            }
                        }
                    }
                    .toolTip {
                        display: none;
                    }
                    .choice-right {
                        margin-right: -75%;
                    }
                }
            }
        }
        .support-content {
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 50px;
            font-size: 12px;
            line-height: 20px;

            div {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%,-50%);
                width: 100%;
                padding: 0 10px;
            }
        }
        .vin-text {
            font-size: 16px;
        }
    }

    @media screen and (max-height: 600px) and (min-width: 980px) {
      .homepage {
        top: 0;
      }
      .support-content {
        display: none;
      }  
    }
</style>
