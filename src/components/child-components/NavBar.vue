<script lang="tsx">
import { defineComponent, ref, inject, watch, getCurrentInstance, Ref } from 'vue';
import { CodeParser } from "shen-dynamsoft-code-parser";
import { MobileOutlined } from '@ant-design/icons-vue';
import { useRouter } from "vue-router";
import { LabelRecognizer } from 'keillion-dynamsoft-label-recognizer';

export default defineComponent({
    setup() {
        const {proxy}: any = getCurrentInstance();

        // Get the current operating mode
        const runtimeMode = inject('runtimeMode') as Ref<string>;
        const recognizer = inject('recognizer') as Ref<LabelRecognizer> | any;
        const parser = inject('parser') as Ref<CodeParser> | any
        const isShowResults = inject('isShowResults') as Ref<boolean>;
        const isShowNumOrLetResults = inject('isShowNumOrLetResults') as Ref<boolean>;
        const isShowCameraList = inject('isShowCameraList') as Ref<boolean>;
        const isShowModeList = inject('isShowModeList') as Ref<boolean>;
        const isShowSettingList = inject('isShowSettingList') as Ref<boolean>;
        const isShowImgRecMethodList = inject('isShowImgRecMethodList') as Ref<boolean>;
        const isShowScanningPrompt = inject('isShowScanningPrompt') as Ref<boolean>;
        const cameraIsExists = inject('cameraIsExists') as Ref<boolean>;
        // const isNeedPlaySound = inject('isNeedPlaySound') as Ref<boolean>;
        const setRegion = inject('setRegion') as any;
        
        // const modes = ref(['mrz','vin', 'number', 'letter']);
        const modes = ref(['mrz','vin']);
        const modeSelected = ref(runtimeMode.value) as Ref<string>;
        // const isInverted = ref(false);
        // const isShowLoading = ref(false);
        const router = useRouter();
        let timer: any;

        // Run mode change listening
        watch(modeSelected, async () => {
            if(!cameraIsExists.value) {
                runtimeMode.value = modeSelected.value;
            } else {
                if(recognizer.value) {
                    isShowResults.value = false;
                    runtimeMode.value = modeSelected.value;
                    runtimeMode.value === "mrz" ? document.title = "MRZ Scanner | Dynamsoft Label Recognizer" : document.title = "VIN Scanner (Beta) | Dynamsoft Label Recognizer";
                    runtimeMode.value === "mrz" ? await parser.value.setCodeType(16) : await parser.value.setCodeType(32);

                    recognizer.value.pauseScanning();
                    await recognizer.value.updateRuntimeSettingsFromString(modeSelected.value);

                    setRegion();

                    isShowScanningPrompt.value = true;
                    if(timer) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(() => {
                        isShowScanningPrompt.value = false;
                    }, 5000)   
                    recognizer.value.resumeScanning();
                    if(modeSelected.value === 'mrz' && document.body.clientWidth < 980) {
                        proxy.$message.open({
                            content: 'Rotate your device',
                            duration: 3,
                            icon: <MobileOutlined spin style={{ color: "#FE8E14" }}/>
                        });
                    }
                }
            }
            isShowModeList.value = false;
            proxy.$message.success(`Switched to ${modeSelected.value === 'mrz' ? 'MRZ Scanner' : formatModeName(modeSelected.value) + ' mode'} successfully!`);
            if(modeSelected.value === 'mrz') {
                router.push(`mrz-scanner.html` + location.search);
            } else {
                router.push(`vin.html` + location.search);
            }
        })

        // Set Inverted
        /* watch(()=>isInverted.value, async ()=>{
            // isShowLoading.value = true;
            if(recognizer.value) {
                let inverTed = JSON.parse(await recognizer.value.outputRuntimeSettingsToString());
                if(isInverted.value) {
                    inverTed.TextAreaArray[0].GrayscaleTransformationModes = [{
                        "LibraryFileName" : "",
                        "LibraryParameters" : "",
                        "Mode" : "GTM_INVERTED"
                    }]
                } else {
                    inverTed.TextAreaArray[0].GrayscaleTransformationModes = [{
                        "LibraryFileName" : "",
                        "LibraryParameters" : "",
                        "Mode" : "GTM_ORIGINAL"
                    }]
                }
                await recognizer.value.updateRuntimeSettingsFromString(JSON.stringify(inverTed));
                // isShowLoading.value = false;
            }
        }) */

        const formatModeName = (str: string) => {
            if(str === 'vin') {
                return 'VIN (beta)'
            } else {
                return str.replace(str[0], str[0].toUpperCase())
            }
        }
        
        const changeMode = (info: any) => {
            modeSelected.value = info;
            isShowNumOrLetResults.value = false;
        }

        const closeList = () => {
            isShowCameraList.value = false;
            isShowImgRecMethodList.value = false;
        }

        const switchModeList = () => {
            isShowModeList.value = !isShowModeList.value;
            isShowSettingList.value = false;
        }

        /* const switchSettingList = () => {
            isShowSettingList.value = !isShowSettingList.value;
            isShowModeList.value = false;
        } */

        /* const switchInverted = (e: any) => {
            e.stopPropagation();
            isInverted.value = !isInverted.value;
        }   */  

        /* const switchSoundPlay = (e: any) => {
            e.stopPropagation();
            isNeedPlaySound.value = !isNeedPlaySound.value;
        } */

        return () => (                                                                                                                                                                                                                                                                                                
            <div class="content"  onClick={closeList}>
                <div class="mode-area" onClick={switchModeList}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26.999 26.999">
                        <g style={{stroke: isShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}} id="Programming-Apps-Websites_Apps_app-window-four" data-name="Programming-Apps-Websites / Apps / app-window-four" transform="translate(-412.89 -1846.997)">
                            <g id="Group_200" data-name="Group 200" transform="translate(413.39 1847.497)">
                            <g id="app-window-four">
                                <path style={{stroke: isShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}} id="Rectangle-path_120" data-name="Rectangle-path 120" d="M413.39,1849.758a2.261,2.261,0,0,1,2.261-2.261h6.782a2.262,2.262,0,0,1,2.261,2.261v6.782a2.261,2.261,0,0,1-2.261,2.261h-6.782a2.26,2.26,0,0,1-2.261-2.261Z" transform="translate(-413.39 -1847.497)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                <path style={{stroke: isShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}} id="Shape_1340" data-name="Shape 1340" d="M413.39,1850.5h11.3" transform="translate(-413.39 -1847.106)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                <path style={{stroke: isShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}} id="Rectangle-path_121" data-name="Rectangle-path 121" d="M426.39,1849.758a2.261,2.261,0,0,1,2.261-2.261h6.782a2.262,2.262,0,0,1,2.261,2.261v6.782a2.261,2.261,0,0,1-2.261,2.261h-6.782a2.26,2.26,0,0,1-2.261-2.261Z" transform="translate(-411.695 -1847.497)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                <path style={{stroke: isShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}} id="Shape_1341" data-name="Shape 1341" d="M437.694,1850.5h-11.3" transform="translate(-411.695 -1847.106)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                <path style={{stroke: isShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}} id="Rectangle-path_122" data-name="Rectangle-path 122" d="M413.39,1862.758a2.261,2.261,0,0,1,2.261-2.261h6.782a2.262,2.262,0,0,1,2.261,2.261v6.782a2.261,2.261,0,0,1-2.261,2.261h-6.782a2.26,2.26,0,0,1-2.261-2.261Z" transform="translate(-413.39 -1845.802)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                <path style={{stroke: isShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}} id="Shape_1342" data-name="Shape 1342" d="M413.39,1863.5h11.3" transform="translate(-413.39 -1845.411)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                <path style={{stroke: isShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}} id="Rectangle-path_123" data-name="Rectangle-path 123" d="M426.39,1862.758a2.261,2.261,0,0,1,2.261-2.261h6.782a2.262,2.262,0,0,1,2.261,2.261v6.782a2.261,2.261,0,0,1-2.261,2.261h-6.782a2.26,2.26,0,0,1-2.261-2.261Z" transform="translate(-411.695 -1845.802)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                <path style={{stroke: isShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}} id="Shape_1343" data-name="Shape 1343" d="M437.694,1863.5h-11.3" transform="translate(-411.695 -1845.411)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                            </g>
                            </g>
                        </g>
                    </svg>
                    <div class="runtime-mode" style={{color: isShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}}>
                        {runtimeMode.value === 'mrz' ? 'MRZ Scanner' : runtimeMode.value.toUpperCase() + ' (beta)'} 
                    </div>
                </div>
                <ul class="mode" v-show={isShowModeList.value}>
                    {
                        modes.value.map(item => {
                            return <li class={modeSelected.value === item ? 'selected' : 'not-selected' } onClick={()=>{changeMode(item)}}>
                                        {item === 'mrz' ? 'MRZ Scanner' : formatModeName(item)} 
                                    </li>
                        })
                    }
                </ul>
                {
                // #region
                /* <div class="setting-area" onClick={switchSettingList}>
                    <svg
                            style={{
                                stroke: isShowSettingList.value ?  '#FE8E14' : 'rgb(204, 204, 204)',
                            }}
                            viewBox="0 0 19 19"
                            >
                            <g transform="translate(-230 -1618)">
                                <g transform="translate(230.5 1618.5)">
                                    <g>
                                        <path
                                        d="M245.96,1628.674h1.758a.783.783,0,0,0,.783-.782v-.782a.783.783,0,0,0-.783-.783h-1.758a9.237,9.237,0,0,0-.783-2.287l1.244-1.243a.783.783,0,0,0,0-1.106l-1.11-1.107a.783.783,0,0,0-1.107,0l-1.244,1.243a9.216,9.216,0,0,0-2.285-.782v-1.762a.783.783,0,0,0-.783-.783h-.783a.783.783,0,0,0-.783.783v1.76a9.243,9.243,0,0,0-2.286.783l-1.244-1.242a.783.783,0,0,0-1.107,0l-1.107,1.107a.784.784,0,0,0,0,1.107l1.244,1.243a9.239,9.239,0,0,0-.783,2.286h-1.761a.783.783,0,0,0-.783.782v.783a.783.783,0,0,0,.783.783h1.758a9.233,9.233,0,0,0,.783,2.286l-1.244,1.245a.783.783,0,0,0,0,1.106l1.111,1.106a.783.783,0,0,0,1.107,0l1.244-1.244a9.217,9.217,0,0,0,2.287.783v1.761a.783.783,0,0,0,.783.782h.783a.783.783,0,0,0,.783-.782v-1.757a9.217,9.217,0,0,0,2.285-.783l1.245,1.244a.783.783,0,0,0,1.107,0l1.107-1.106a.783.783,0,0,0,0-1.107l-1.244-1.244A9.253,9.253,0,0,0,245.96,1628.674Z"
                                        transform="translate(-230.5 -1618.5)"
                                        fill="none"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1"
                                        />
                                        <path
                                        d="M240.608,1631.717a3.108,3.108,0,1,0-3.108-3.108A3.109,3.109,0,0,0,240.608,1631.717Z"
                                        transform="translate(-231.608 -1619.609)"
                                        fill="none"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1"
                                        />
                                    </g>
                                </g>
                            </g>
                        </svg>
                    <div class="scan-settings" style={{color: isShowSettingList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}}>
                        <span style="vertical-align: middle;">Scan Settings</span>
                        <a-spin size="small" spinning={isShowLoading.value} style="margin-left: 5px;"/>
                    </div>
                </div>
                <div class="setting" v-show={isShowSettingList.value}>
                    <div class="scan-inverted" v-show={modeSelected.value === 'vin'}>
                        <div class="setting-title">Scan Inverted Texts</div>
                        <div style="font-size: 10px; font-family: OpenSans-Regular; text-align: left; margin-top: -8px; margin-bottom: 10px; color: #aaaaaa">Scan light texts on dark background</div>
                        <div class="options" style="margin-bottom: 15px;">
                            <div class="option1">
                                <div class={{'enable': true, 'selected': isInverted.value}} style="text-align: center;" onClick={switchInverted}>Enable</div>
                                <div class="laebl" onClick={switchInverted} style="text-align: center;">2C4RDGCG0FR805928</div>
                            </div>
                            <div class='option2'>
                                <div class={{'disable': true, 'selected': !isInverted.value}} style="text-align: center" onClick={switchInverted}>Disable</div>
                                <div class="laeblInvert" style="color: black; text-align: center;" onClick={switchInverted}>2C4RDGCG0FR805928</div>
                            </div>
                        </div>
                    </div>
                    <div class="isPlaySound">
                        <div class="setting-title">Play Sound After Scan</div>
                        <div style="font-size: 10px; font-family: OpenSans-Regular; text-align: left; margin-top: -8px; margin-bottom: 10px; color: #aaaaaa">Play a “beep” sound upon a successful scan</div>
                        <div class="options" style="margin-left: -2px">
                            <div class={{'sound-play': true, 'selected': isNeedPlaySound.value}} style="text-align: center" onClick={switchSoundPlay}>Play</div>
                            <div class={{'sound-not-play': true, 'selected': !isNeedPlaySound.value}} style="text-align: center" onClick={switchSoundPlay}>Don't Play</div>
                        </div>
                    </div>
                </div> */
                // #endregion
                }
            </div>
        )
    },
})
</script>

<style lang="scss" scoped>
    @keyframes rotating {
        from {
            transform: rotate(0);
        }
        to {
            transform: rotate(359deg);
        }
    }
    .content {
        z-index: 999;
        cursor: pointer;
        .mode {
            transform: translateX(25%);
            li {
                width: 100%;
                height: 40px;
                line-height: 40px;
            }
            &::after {
                content: '';
                position: absolute;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-top: 10px solid rgb(50,50,52);
                border-left: 10px solid transparent;
                border-right: 10px solid transparent;
                border-bottom: 10px solid transparent;
            }
        }
    }
    .runtime-mode {
        color: rgb(204, 204, 204);;
        font-size: 12px;
    }
    svg {
        width: 5vw;
        height: 2.5vh;
    }
    .selected {
        color: white;
        background-color: #fe8e14 !important;
    }
    .not-selected {
        color: #888888;
        background-color: rgb(50,50,52);
    }

    @media screen and (min-width: 980px) {
        .content {
            position: absolute;
            display: none;
            justify-content: center;
            align-items: center;
            left: 3%;
            top: 50%;
            width: 140px;
            height: 100px;
            transform: translateY(-50%);
            background-color:#323234;
            .mode-area {
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                width: 100%;
                height: 100%;
                &:hover {
                    background-color: rgb(39, 39, 41);
                }
            }
            .mode {
                position: absolute;
                width: 120px;
                left: 90%;
                top: 0%;
                &::after {
                    content: '';
                    left: -8%;
                    top: 25%;
                    transform: translateX(-50%);
                    border-top: 10px solid transparent;
                    border-right: 10px solid rgb(50,50,52);
                }
                li {
                    height: 60px;
                    line-height: 60px;
                    &:hover {
                        background-color: rgb(39, 39, 41);
                    }
                }
            }
            /* .setting-area {
                position: relative;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                width: 100%;
                height: 50%;
                &:hover {
                    background-color: rgb(39, 39, 41);
                }
            }
            .setting {
                position: absolute;
                width: 310px;
                left: 218%;
                transform: translateX(-50%);
                bottom: 0;
                &::after {
                    content: '';
                    position: absolute;
                    left: -6%;
                    bottom: 15%;
                    border-top: 10px solid transparent;
                    border-right: 10px solid rgb(50,50,52);
                }
            } */
        } 
        .runtime-mode/* , .scan-settings */ {
            font-size: 16px;
        }
        svg {
            width: 26px;
            height: 26px;
            margin-bottom: 5px;
        }
    }

    @media screen and (max-width: 979px) {
        .content {
            position: absolute;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999;
            bottom: 0;
            width: 100%;
            height: 8vh;
            min-width: 300px;
            background-color:#323234;
            .mode-area {
                flex: 1;
                text-align: center;
            }
            .mode {
                position: absolute;
                bottom: calc(100% + 15px);
                left: 50%;
                transform: translateX(-50%);
                width: 150px;
            }
        }
    }

    @media screen and (max-width: 979px) and (orientation: landscape) {
        .content {
            height: 10vh;
        }
    }
    @media screen and (max-width: 979px) and (max-height: 500px) and (orientation: landscape) {
        svg {
            display: none;
        }
    }
</style>