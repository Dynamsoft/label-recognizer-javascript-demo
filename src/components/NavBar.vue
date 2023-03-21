<script lang="tsx">
import { defineComponent, ref, inject, watch, getCurrentInstance, Ref } from 'vue';
import { CodeParser } from "shen-dynamsoft-code-parser";
import { MobileOutlined } from '@ant-design/icons-vue';
import { useRouter } from "vue-router";
import { LabelRecognizer } from 'dynamsoft-label-recognizer';

export default defineComponent({
    setup() {
        const {proxy}: any = getCurrentInstance();

        // Get the current operating mode
        const runtimeMode = inject('runtimeMode') as Ref<string>;
        const recognizer = inject('recognizer') as Ref<LabelRecognizer> | any;
        const parser = inject('parser') as Ref<CodeParser> | any
        const bShowResults = inject('bShowResults') as Ref<boolean>;
        const bShowNumOrLetResults = inject('bShowNumOrLetResults') as Ref<boolean>;
        const bShowCameraList = inject('bShowCameraList') as Ref<boolean>;
        const bShowModeList = inject('bShowModeList') as Ref<boolean>;
        const bShowSettingList = inject('bShowSettingList') as Ref<boolean>;
        const bShowImgRecMethodList = inject('bShowImgRecMethodList') as Ref<boolean>;
        const bShowScanningPrompt = inject('bShowScanningPrompt') as Ref<boolean>;
        const cameraIsExists = inject('cameraIsExists') as Ref<boolean>;
        // const bNeedPlaySound = inject('bNeedPlaySound') as Ref<boolean>;
        const setRegion = inject('setRegion') as any;
        const bOpen = inject('bOpen') as Ref<boolean>;
        
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
                    bShowResults.value = false;
                    runtimeMode.value = modeSelected.value;
                    runtimeMode.value === "mrz" ? document.title = "MRZ Scanner | Dynamsoft Label Recognizer" : document.title = "VIN Scanner (Beta) | Dynamsoft Label Recognizer";
                    runtimeMode.value === "mrz" ? await parser.value.setCodeType(16) : await parser.value.setCodeType(32);

                    recognizer.value.pauseScanning();
                    await recognizer.value.updateRuntimeSettingsFromString(modeSelected.value);

                    setRegion();

                    bShowScanningPrompt.value = true;
                    if(timer) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(() => {
                        bShowScanningPrompt.value = false;
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
            bShowModeList.value = false;
            proxy.$message.success(`Switched to ${modeSelected.value === 'mrz' ? 'MRZ Scanner' : formatModeName(modeSelected.value) + ' mode'} successfully!`);
            if(modeSelected.value === 'mrz') {
                router.push(`mrz-scanner.html` + location.search);
            } else {
                router.push(`vin.html` + location.search);
            }
        })

        const formatModeName = (str: string) => {
            if(str === 'vin') {
                return 'VIN (beta)'
            } else {
                return str.replace(str[0], str[0].toUpperCase())
            }
        }
        
        const changeMode = (info: any) => {
            modeSelected.value = info;
            bShowNumOrLetResults.value = false;
        }

        const closeList = () => {
            bShowCameraList.value = false;
            bShowImgRecMethodList.value = false;
        }

        const switchModeList = () => {
            if(!bOpen.value && cameraIsExists.value) return;
            bShowModeList.value = !bShowModeList.value;
            bShowSettingList.value = false;
        }

        return () => (                                                                                                                                                                                                                                                                                                
            <div class="content"  onClick={closeList}>
                <div class="mode-area" onClick={switchModeList}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26.999 26.999">
                        <g style={{stroke: bShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}} id="Programming-Apps-Websites_Apps_app-window-four" data-name="Programming-Apps-Websites / Apps / app-window-four" transform="translate(-412.89 -1846.997)">
                            <g id="Group_200" data-name="Group 200" transform="translate(413.39 1847.497)">
                            <g id="app-window-four">
                                <path style={{stroke: bShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}} id="Rectangle-path_120" data-name="Rectangle-path 120" d="M413.39,1849.758a2.261,2.261,0,0,1,2.261-2.261h6.782a2.262,2.262,0,0,1,2.261,2.261v6.782a2.261,2.261,0,0,1-2.261,2.261h-6.782a2.26,2.26,0,0,1-2.261-2.261Z" transform="translate(-413.39 -1847.497)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                <path style={{stroke: bShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}} id="Shape_1340" data-name="Shape 1340" d="M413.39,1850.5h11.3" transform="translate(-413.39 -1847.106)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                <path style={{stroke: bShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}} id="Rectangle-path_121" data-name="Rectangle-path 121" d="M426.39,1849.758a2.261,2.261,0,0,1,2.261-2.261h6.782a2.262,2.262,0,0,1,2.261,2.261v6.782a2.261,2.261,0,0,1-2.261,2.261h-6.782a2.26,2.26,0,0,1-2.261-2.261Z" transform="translate(-411.695 -1847.497)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                <path style={{stroke: bShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}} id="Shape_1341" data-name="Shape 1341" d="M437.694,1850.5h-11.3" transform="translate(-411.695 -1847.106)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                <path style={{stroke: bShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}} id="Rectangle-path_122" data-name="Rectangle-path 122" d="M413.39,1862.758a2.261,2.261,0,0,1,2.261-2.261h6.782a2.262,2.262,0,0,1,2.261,2.261v6.782a2.261,2.261,0,0,1-2.261,2.261h-6.782a2.26,2.26,0,0,1-2.261-2.261Z" transform="translate(-413.39 -1845.802)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                <path style={{stroke: bShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}} id="Shape_1342" data-name="Shape 1342" d="M413.39,1863.5h11.3" transform="translate(-413.39 -1845.411)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                <path style={{stroke: bShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}} id="Rectangle-path_123" data-name="Rectangle-path 123" d="M426.39,1862.758a2.261,2.261,0,0,1,2.261-2.261h6.782a2.262,2.262,0,0,1,2.261,2.261v6.782a2.261,2.261,0,0,1-2.261,2.261h-6.782a2.26,2.26,0,0,1-2.261-2.261Z" transform="translate(-411.695 -1845.802)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                <path style={{stroke: bShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}} id="Shape_1343" data-name="Shape 1343" d="M437.694,1863.5h-11.3" transform="translate(-411.695 -1845.411)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                            </g>
                            </g>
                        </g>
                    </svg>
                    <div class="runtime-mode" style={{color: bShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)'}}>
                        {runtimeMode.value === 'mrz' ? 'MRZ Scanner' : runtimeMode.value.toUpperCase() + ' (beta)'} 
                    </div>
                </div>
                <ul class="mode" v-show={bShowModeList.value}>
                    {
                        modes.value.map(item => {
                            return <li class={modeSelected.value === item ? 'selected' : 'not-selected' } onClick={()=>{changeMode(item)}}>
                                        {item === 'mrz' ? 'MRZ Scanner' : formatModeName(item)} 
                                    </li>
                        })
                    }
                </ul>
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