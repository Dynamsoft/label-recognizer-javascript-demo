<script lang="tsx">
import { defineComponent, ref, inject, Ref } from 'vue';
import { formatModeName } from '@/util';

export default defineComponent({
    setup() {
        // Get the current operating mode
        const runtimeMode: Ref<string> = inject('runtimeMode')!;
        const bShowCameraList: Ref<boolean> = inject('bShowCameraList')!;
        const bShowModeList: Ref<boolean> = inject('bShowModeList')!;
        const bShowSettingList: Ref<boolean> = inject('bShowSettingList')!;
        const bShowImgRecMethodList: Ref<boolean> = inject('bShowImgRecMethodList')!;
        const cameraIsExists: Ref<boolean> = inject('cameraIsExists')!;
        const bOpenCamera: Ref<boolean> = inject('bOpenCamera')!;
        const modes: Ref<Array<string>> = ref(['mrz', 'vin']);
        
        const closeList = () => {
            bShowCameraList.value = false;
            bShowImgRecMethodList.value = false;
        }

        const switchModeList = () => {
            if (!bOpenCamera.value && cameraIsExists.value) return;
            bShowModeList.value = !bShowModeList.value;
            bShowSettingList.value = false;
        }

        return () => (
            <div class="content" onClick={closeList}>
                <div class="mode-area" onClick={switchModeList}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26.999 26.999">
                        <g style={{ stroke: bShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)' }} id="Programming-Apps-Websites_Apps_app-window-four" data-name="Programming-Apps-Websites / Apps / app-window-four" transform="translate(-412.89 -1846.997)">
                            <g id="Group_200" data-name="Group 200" transform="translate(413.39 1847.497)">
                                <g id="app-window-four">
                                    <path style={{ stroke: bShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)' }} id="Rectangle-path_120" data-name="Rectangle-path 120" d="M413.39,1849.758a2.261,2.261,0,0,1,2.261-2.261h6.782a2.262,2.262,0,0,1,2.261,2.261v6.782a2.261,2.261,0,0,1-2.261,2.261h-6.782a2.26,2.26,0,0,1-2.261-2.261Z" transform="translate(-413.39 -1847.497)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" />
                                    <path style={{ stroke: bShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)' }} id="Shape_1340" data-name="Shape 1340" d="M413.39,1850.5h11.3" transform="translate(-413.39 -1847.106)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" />
                                    <path style={{ stroke: bShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)' }} id="Rectangle-path_121" data-name="Rectangle-path 121" d="M426.39,1849.758a2.261,2.261,0,0,1,2.261-2.261h6.782a2.262,2.262,0,0,1,2.261,2.261v6.782a2.261,2.261,0,0,1-2.261,2.261h-6.782a2.26,2.26,0,0,1-2.261-2.261Z" transform="translate(-411.695 -1847.497)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" />
                                    <path style={{ stroke: bShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)' }} id="Shape_1341" data-name="Shape 1341" d="M437.694,1850.5h-11.3" transform="translate(-411.695 -1847.106)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" />
                                    <path style={{ stroke: bShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)' }} id="Rectangle-path_122" data-name="Rectangle-path 122" d="M413.39,1862.758a2.261,2.261,0,0,1,2.261-2.261h6.782a2.262,2.262,0,0,1,2.261,2.261v6.782a2.261,2.261,0,0,1-2.261,2.261h-6.782a2.26,2.26,0,0,1-2.261-2.261Z" transform="translate(-413.39 -1845.802)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" />
                                    <path style={{ stroke: bShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)' }} id="Shape_1342" data-name="Shape 1342" d="M413.39,1863.5h11.3" transform="translate(-413.39 -1845.411)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" />
                                    <path style={{ stroke: bShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)' }} id="Rectangle-path_123" data-name="Rectangle-path 123" d="M426.39,1862.758a2.261,2.261,0,0,1,2.261-2.261h6.782a2.262,2.262,0,0,1,2.261,2.261v6.782a2.261,2.261,0,0,1-2.261,2.261h-6.782a2.26,2.26,0,0,1-2.261-2.261Z" transform="translate(-411.695 -1845.802)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" />
                                    <path style={{ stroke: bShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)' }} id="Shape_1343" data-name="Shape 1343" d="M437.694,1863.5h-11.3" transform="translate(-411.695 -1845.411)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" />
                                </g>
                            </g>
                        </g>
                    </svg>
                    <div class="runtime-mode" style={{ color: bShowModeList.value ? '#FE8E14' : 'rgb(204, 204, 204)' }}>
                        {runtimeMode.value === 'mrz' ? 'MRZ Scanner' : runtimeMode.value.toUpperCase() + ' (beta)'}
                    </div>
                </div>
                <ul class="mode" v-show={bShowModeList.value}>
                    {
                        modes.value.map(item => {
                            return <li class={runtimeMode.value === item ? 'selected' : 'not-selected'} onClick={() => { runtimeMode.value = item }}>
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
            border-top: 10px solid rgb(50, 50, 52);
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 10px solid transparent;
        }
    }
}

.runtime-mode {
    color: rgb(204, 204, 204);
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
    background-color: rgb(50, 50, 52);
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
        background-color: #323234;

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
                border-right: 10px solid rgb(50, 50, 52);
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

    .runtime-mode

    /* , .scan-settings */
        {
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
        background-color: #323234;

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
}</style>