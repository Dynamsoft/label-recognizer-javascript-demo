<script lang="tsx">
import { defineComponent, ref, inject, watch, getCurrentInstance, Ref } from 'vue';
import { MobileOutlined } from '@ant-design/icons-vue';

export default defineComponent({
    setup() {
        const {proxy}: any = getCurrentInstance();

        // Get the current operating mode
        const runtimeMode = inject('runtimeMode') as Ref<string>;
        const recognizer = inject('recognizer') as any;
        const isShowResults = inject('isShowResults') as Ref<boolean>;
        const isShowNumOrLetResults = inject('isShowNumOrLetResults') as Ref<boolean>;
        const isShowCameraList = inject('isShowCameraList') as Ref<boolean>;
        const isShowModeList = inject('isShowModeList') as Ref<boolean>;
        const isShowSettingList = inject('isShowSettingList') as Ref<boolean>;
        const isShowImgRecMethodList = inject('isShowImgRecMethodList') as Ref<boolean>;
        const isShowScanningPrompt = inject('isShowScanningPrompt') as Ref<boolean>;
        const isPlaySound = inject('isPlaySound') as Ref<boolean>;
        const setRegion = inject('setRegion') as any;
        
        // const modes = ref(['video-mrz','video-vin', 'video-number', 'video-letter']);
        const modes = ref(['video-mrz','video-vin']);
        const modeSelected = ref(runtimeMode.value) as Ref<string>;
        const isInverted = ref(false);
        const isShowLoading = ref(false);
        let timer: any;

        // Run mode change listening
        watch(modeSelected, async () => {
            if(recognizer.value) {
                isShowResults.value = false;
                runtimeMode.value = modeSelected.value;
                isShowLoading.value = true;

                recognizer.value.cameraEnhancer.pause();
                await recognizer.value.updateRuntimeSettingsFromString(modeSelected.value);
                if((window as any).document.body.clientWidth >= 980) {
                    await setRegion(25,40,75,40,75,60,25,60);
                } else {
                    await setRegion(5,40,95,40,95,60,5,60);
                }
                await recognizer.value.cameraEnhancer.play();
                isShowScanningPrompt.value = true;
                if(timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(() => {
                    isShowScanningPrompt.value = false;
                }, 5000)   
                recognizer.value.resumeScanning();
                if(modeSelected.value === 'video-mrz' && document.body.clientWidth < 980) {
                    proxy.$message.open({
                        content: 'Rotate your device',
                        duration: 3,
                        icon: <MobileOutlined spin style={{ color: "#FE8E14" }}/>
                    });
                }
                isShowLoading.value = false;
                isShowModeList.value = false;
                proxy.$message.success(`Switched to ${modeSelected.value === 'video-mrz' ? 'MRZ Scanner' : formatModeName(modeSelected.value.substring(6)) + ' mode'} successfully!`);
            }
        })

        const formatModeName = (str: string) => {
            if(str === 'vin') {
                return 'VIN'
            } else {
                return str.replace(str[0], str[0].toUpperCase())
            }
        }

        // Set Inverted
        watch(()=>isInverted.value, async ()=>{
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
            }
            
        })

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

        const switchSettingList = () => {
            isShowSettingList.value = !isShowSettingList.value;
            isShowModeList.value = false;
        }

        const switchInverted = (e: any) => {
            e.stopPropagation();
            isInverted.value = !isInverted.value;
        }    

        const switchSoundPlay = (e: any) => {
            e.stopPropagation();
            isPlaySound.value = !isPlaySound.value;
            recognizer.value.whenToPlaySoundforSuccessfulRead = isPlaySound.value;
        }

        return () => (                                                                                                                                                                                                                                                                                                
            <>
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
                            {runtimeMode.value === 'video-mrz' ? 'MRZ Scanner' : runtimeMode.value.substring(6).toUpperCase()}
                            <span class="loading" v-show={isShowLoading.value}></span>
                        </div>
                    </div>
                    <ul class="mode" v-show={isShowModeList.value}>
                        {
                            modes.value.map(item => {
                                return <li class={modeSelected.value === item ? 'selected' : 'not-selected' } onClick={()=>{changeMode(item)}}>
                                            {item === 'video-mrz' ? 'MRZ Scanner' : formatModeName(item.substring(6))} 
                                        </li>
                            })
                        }
                    </ul>
                    <div class="setting-area" onClick={switchSettingList}>
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
                        <div class="scan-settings" style={{color: isShowSettingList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}}>Scan Settings</div>
                        <div class="setting" v-show={isShowSettingList.value}>
                            <div class="scan-inverted" v-show={modeSelected.value === 'video-vin'}>
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
                                    <div class={{'sound-play': true, 'selected': isPlaySound.value}} style="text-align: center" onClick={switchSoundPlay}>Play</div>
                                    <div class={{'sound-not-play': true, 'selected': !isPlaySound.value}} style="text-align: center" onClick={switchSoundPlay}>Don't Play</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
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
        .mode-area {
            .runtime-mode {
                .loading {
                    display: inline-block;
                    width: 15px;
                    height: 15px;
                    border-top: 1px solid lightgray;
                    border-left: 1px solid lightgray;
                    border-right: 1px solid lightgray;
                    border-bottom: 1px solid transparent;
                    border-radius: 50%;
                    margin: 0 5px;
                    animation: rotating 1s infinite linear;
                }
            }
        }
        .mode {
            transform: translateX(25%);
            &::after {
                content: '';
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-top: 10px solid rgb(50,50,52);
                border-left: 10px solid transparent;
                border-right: 10px solid transparent;
                border-bottom: 10px solid transparent;
            }
        }
        .setting-area {
            .setting {
                position: relative;
                left: 50%;
                padding: 25px 0 25px 18px;
                transform: translateX(-50%);
                width: 80%;
                &::after {
                    content: '';
                    position: absolute;
                    right: 16%;
                    bottom: -13%;
                    width: 0;
                    height: 0;
                    border-top: 10px solid rgb(50,50,52);
                    border-left: 10px solid transparent;
                    border-right: 10px solid transparent;
                    border-bottom: 10px solid transparent;
                }
                .setting-title {
                    font-size: 14px;
                    color: #dddddd;
                    text-align: left;
                    margin-bottom: 8px;
                }
                .clear-texture, .scan-inverted, .isPlaySound {
                    .options {
                        text-align: left;
                        .option1 {
                            display: flex;
                            width: 90%;
                            .enable {
                                flex: 50%;
                            }
                            .laebl {
                                width: 265px;
                            }
                        }
                        .option2 {
                            display: flex;
                            width: 90%;
                            margin-top: 15px;
                            .disable {
                                flex: 50%;
                            }
                            .laeblInvert {
                                width: 265px;
                            }
                        }
                        .clear, .sound-play {
                            margin-right: 10px;
                        }

                        .laebl {
                            display: inline-block;
                            width: 55px;
                            height: 40px;
                            background-color: black;
                            line-height: 40px;
                            font-family: 'OpenSans-Regular';
                            img {
                                width: 85%;
                                height: 85%;
                            }
                        }

                        .laeblInvert {
                            display: inline-block;
                            width: 55px;
                            height: 40px;
                            background-color: white;
                            line-height: 40px;
                            font-family: 'OpenSans-Regular';
                            img {
                                width: 85%;
                                height: 85%;
                            }
                        }
                        
                        .clear, .no-clear, .enable, .disable, .sound-not-play, .sound-play {
                            display: inline-block;
                            width: 80px;
                            height: 40px;
                            background-color: #606060;
                            line-height: 40px;
                            cursor: pointer;
                            &:hover {
                                background-color: rgb(24, 23, 23);
                            }

                            &.selected {
                                background-color: rgb(254,142,20);
                            }
                        }
                    }
                }
            }
        }
    }
    .mode, .setting {
        position: absolute;
        width: 33%;
        color: white;
        background-color: rgb(50,50,52);
        margin-bottom: 0;
        opacity: 0.9;
        li {
            width: 100%;
            height: 40px;
            line-height: 40px;
        }
    }
    .scan-settings, .runtime-mode {
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
            width: 140px;
            height: 200px;
            left: 3%;
            top: 50%;
            transform: translateY(-50%);
            background-color:#323234;
            .mode-area {
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                width: 100%;
                height: 50%;
                border-bottom: 1px solid rgba(204,204,204, 0.1);
                &:hover {
                    background-color: rgb(39, 39, 41);
                }
            }
            .mode {
                width: 120px;
                left: 90%;
                top: 0%;
                &::after {
                    content: '';
                    left: -8%;
                    top: 25%;
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
            .setting-area {
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
                .setting {
                    position: absolute;
                    width: 310px;
                    left: 218%;
                    bottom: 0;
                    &::after {
                        content: '';
                        position: absolute;
                        right: none;
                        left: -6%;
                        bottom: 15%;
                        bottom: none;
                        border-top: 10px solid transparent;
                        border-right: 10px solid rgb(50,50,52);
                    }
                }
            }
        } 
        .runtime-mode, .scan-settings {
            font-size: 16px;
        }
        svg {
            width: 26px;
            height: 26px;
            margin-bottom: 5px;
        }
    }

    @media screen and (max-width: 980px) {
        .content {
            position: absolute;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999;
            bottom: 0;
            width: 100%;
            height: 8vh;
            background-color:#323234;
            .setting-area {
                .setting {
                    position: absolute;
                    left: 50%;
                    bottom: 10vh;
                    padding: 25px 0 25px 18px;
                    transform: translateX(-50%);
                    width: 350px;
                    &::after {
                        right: 16%;
                        top: 100%;
                        bottom: none;
                    }
                }
            }
            .mode-area, .setting-area {
                flex: 33.33%;
                text-align: center;
            }
            .mode {
                bottom: 10vh;
                left: 0%;
            }
        }
    }
</style>