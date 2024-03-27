<script lang="tsx">
import { defineComponent, inject, ref, getCurrentInstance, Ref } from 'vue';
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import { CameraEnhancer } from 'dynamsoft-camera-enhancer';
import { judgeResolution } from './Video.vue';

export default defineComponent({
    setup() {
        const musicSelected = require('@/assets/image/music-selected.svg');
        const musicUnSelected = require('@/assets/image/music-unselected.svg');
        const camera = require('@/assets/image/camera.svg')
        const addImage = require('@/assets/image/image-files.svg');
        const screenshotIcon = require('@/assets/image/grey.svg');
        const arrowGreyDown = require('@/assets/image/arrow-grey-down.svg');
        const arrowGreyUp = require('@/assets/image/arrow-grey-up.svg');
        const download = require('@/assets/image/download.svg');
        const cameraList: Ref<Array<{ deviceId: string, label: string }>> = inject('cameraList')!;
        const cameraId: Ref<string> = inject('cameraId')!;
        const cameraLabel: Ref<string> = inject('cameraLabel')!;
        const resolution: Ref<"HD" | "FULL HD"> = inject('resolution')!;
        const resolutionList: Array<"HD" | "FULL HD"> = inject('resolutionList')!;
        const cameraEnhancer: Ref<CameraEnhancer> = inject('cameraEnhancer')!;
        const bShowMrzOrVinResult: Ref<boolean> = inject('bShowMrzOrVinResult')!;
        const bShowCameraList: Ref<boolean> = inject('bShowCameraList')!;
        const bShowModeList: Ref<boolean> = inject('bShowModeList')!;
        const bShowSettingList: Ref<boolean> = inject('bShowSettingList')!;
        const runtimeMode: Ref<string> = inject('runtimeMode')!;
        const bShowImgRecMethodList: Ref<boolean> = inject('bShowImgRecMethodList')!;
        const bNeedPlaySound: Ref<boolean> = inject('bNeedPlaySound')!;
        const cameraIsExists: Ref<boolean> = inject('cameraIsExists')!;
        const bOpenCamera: Ref<boolean> = inject('bOpenCamera')!;
        const getImages: (payload: MouseEvent) => void = inject('getImages')!;
        const uploadImg: (event: any, bUploadSampleImage: boolean) => Promise<void> = inject("uploadImg")!;
        const placement: Ref<string> = ref(document.body.clientWidth > 980 ? 'top' : 'topLeft');
        const { proxy }: any = getCurrentInstance();

        window.addEventListener('resize', () => {
            placement.value = document.body.clientWidth > 980 ? 'bottom' : 'bottomLeft';
        })

        const closeList = () => {
            bShowCameraList.value = false;
            bShowModeList.value = false;
            bShowSettingList.value = false;
            bShowImgRecMethodList.value = false;
        }
        const switchSoundIsPlay = () => {
            bShowCameraList.value = false;
            bShowModeList.value = false;
            bShowSettingList.value = false;
            bShowImgRecMethodList.value = false;
            bNeedPlaySound.value = !bNeedPlaySound.value;
        }
        const switchCameraList = () => {
            bShowCameraList.value = !bShowCameraList.value;
            bShowModeList.value = false;
            bShowSettingList.value = false;
            bShowImgRecMethodList.value = false;
        }
        const switchImgMethodList = () => {
            if (!bOpenCamera.value && cameraIsExists.value) return;
            bShowImgRecMethodList.value = !bShowImgRecMethodList.value;
            bShowModeList.value = false;
            bShowSettingList.value = false;
            bShowCameraList.value = false;
        }
        const switchModeList = (e: Event) => {
            e.stopPropagation();
            if (!bOpenCamera.value && cameraIsExists.value) return;
            bShowModeList.value = !bShowModeList.value;
            bShowCameraList.value = false;
            bShowImgRecMethodList.value = false;
        }
        const changeCameraAndResolution = async (deviceId: string, resolution: "HD" | "FULL HD") => {
            bShowCameraList.value = false;
            bShowMrzOrVinResult.value = false;
            const constraints: MediaStreamConstraints = {
                video: {
                    deviceId: {
                        exact: deviceId
                    }
                }
            };
            if (resolution === "HD") {
                (constraints.video as MediaTrackConstraints).width = {
                    ideal: 1280
                };
                (constraints.video as MediaTrackConstraints).height = {
                    ideal: 720
                };
            } else {
                (constraints.video as MediaTrackConstraints).width = {
                    ideal: 1920
                };
                (constraints.video as MediaTrackConstraints).height = {
                    ideal: 1080
                };
            }
            try {
                const info = await cameraEnhancer.value.updateVideoSettings(constraints);
                if (info && judgeResolution(info.width, info.height) !== resolution) {
                    const _cameraLabel = cameraEnhancer.value!.getSelectedCamera().label;
                    proxy.$message.warning(`${_cameraLabel}(${resolution}) not supported!`);
                }
            } catch (e: any) {
                const message = e.message | e;
                proxy.$message.error(message);
            }

        }

        const cameraMenu = () => {
            return <ul class="camera-list" /* v-show={bShowCameraList.value && cameraList.value} */>
                {
                    cameraList.value.length ?
                        cameraList.value.map((item: { deviceId: string, label: string }) => {
                            return <>
                                <li style={cameraId.value === item.deviceId && resolution.value === resolutionList[0] ? { color: "#FE8E14", backgroundColor: "#181717" } : { color: "white", backgroundColor: "" }} onClick={() => { changeCameraAndResolution(item.deviceId, resolutionList[0]) }}>
                                    <div>{item.label}({resolutionList[0]})</div>
                                </li>
                                <li style={cameraId.value === item.deviceId && resolution.value === resolutionList[1] ? { color: "#FE8E14", backgroundColor: "#181717" } : { color: "white", backgroundColor: "" }} onClick={() => { changeCameraAndResolution(item.deviceId, resolutionList[1]) }}>
                                    <div>{item.label}({resolutionList[1]})</div>
                                </li>
                            </>
                        })
                        :
                        <li style={{ color: "white", width: "150px" }}><div>{cameraIsExists.value ? 'Loading...' : 'No camera found'}</div></li>
                }
            </ul>
        }
        const updateLoadImgMenu = () => {
            return <ul class="imgRecognizerMethod">
                {
                    <><li onClick={(e) => { uploadImg(e, true) }}><div>Load Sample Image</div></li>
                        {runtimeMode.value === "mrz" ? <label for="imgUpload"><li><div>Upload from Local</div></li></label> : null}
                        <input type="file" accept="image/*" id="imgUpload" onChange={(e) => { uploadImg(e, false) }} style={{ display: "none" }} /></>
                }
            </ul>
        }
        const modeList = () => {
            return <ul class="modeList">
                {
                    <><li style={{ color: runtimeMode.value === "mrz" ? "#fe8e14" : '#aaaaaa' }} onClick={() => { runtimeMode.value = "mrz" }}><div>MRZ Scanner</div></li>
                        <li style={{ color: runtimeMode.value === "vin" ? "#fe8e14" : '#aaaaaa' }} onClick={() => { runtimeMode.value = "vin" }}><div>VIN (beta)</div></li></>
                }
            </ul>
        }
        const modeListArrowIcon = () => {
            if (bShowModeList.value) return <UpOutlined style={{ fontSize: "17px", color: "rgb(170,170,170)", marginLeft: "7px" }} />
            return <DownOutlined style={{ fontSize: "17px", color: "rgb(170,170,170)", marginLeft: "7px" }} />
        }
        return () => (
            <>
                <div class="content">
                    <div class="function-choose">
                        <a-popover visible={bShowCameraList.value} trigger="click" content={cameraMenu} color="rgb(34,34,34)" placement={placement.value} arrowPointAtCenter>
                            <div class="camera-area">
                                <div class="camera-choose" onClick={switchCameraList}>
                                    <img src={camera} class="cameraSvg" />
                                    <span>
                                        <span class='camera-name' style="margin: 0 5px">{cameraLabel.value}</span>
                                        <img src={arrowGreyDown} v-show={!bShowCameraList.value} id="arrow" style="margin-left: 3px; color: #AAAAAA; vertical-align: middle;" />
                                        <img src={arrowGreyUp} v-show={bShowCameraList.value} style="margin-left: 3px; color: #AAAAAA; vertical-align: middle;" />
                                    </span>
                                </div>
                            </div>
                        </a-popover>
                        <a-popover visible={bShowImgRecMethodList.value} trigger="click" content={updateLoadImgMenu} color="rgb(34,34,34)" arrowPointAtCenter>
                            <div class="uploadImgLabel" onClick={switchImgMethodList}>
                                <div class="img-upload">
                                    <img src={addImage} class="updateImgSvg" />
                                </div>
                            </div>
                        </a-popover>
                        <div class={{ 'sound': true, 'isPlaySound': bNeedPlaySound.value }} onClick={switchSoundIsPlay}>
                            <img src={musicUnSelected} class="soundNotPlaySvg" v-show={!bNeedPlaySound.value} />
                            <img src={musicSelected} class="soundPlaySvg" v-show={bNeedPlaySound.value} />
                        </div>
                    </div>
                    <div class="logo" onClick={closeList}>
                        <div style={{ height: '100%' }}>
                            <a-popover visible={bShowModeList.value && document.body.clientWidth >= 980} trigger="click" content={modeList} color="rgb(34,34,34)" arrowPointAtCenter>
                                <div style={{ cursor: "pointer" }} onClick={switchModeList}>{runtimeMode.value === 'mrz' ? 'MRZ Scanner' : runtimeMode.value.toUpperCase() + ' (beta)'}{modeListArrowIcon()}</div>
                            </a-popover>
                        </div>
                    </div>
                    <a href="https://github.com/Dynamsoft/label-recognizer-javascript-demo" target="_blank" class="getCode">
                        GET SOURCE CODE
                        <img src={download} class="download-icon" />
                    </a>
                    <div class="currentMode">{runtimeMode.value === 'mrz' ? 'MRZ Scanner' : 'VIN(beta)'}</div>
                </div>
            </>
        )
    }
})
</script>
<style lang="scss" scoped>
.content {
    position: absolute;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    z-index: 999;
    top: 0;
    margin: 0 auto;
    width: 100%;
    height: 6.9vh;
    min-width: 300px;
    background-color: rgba($color: #000000, $alpha: 0.5);

    .function-choose {
        position: relative;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        height: 100%;

        .camera-area {
            height: 100%;
            background-color: #222222;
            cursor: pointer;

            .camera-choose {
                display: flex;
                justify-content: center;
                align-items: center;
                color: rgb(245, 245, 245);
                padding: 0 10px;
                height: 100%;
                background-color: rgb(34, 34, 34);

                .cameraSvg {
                    height: 20px;
                }

                span {
                    display: flex;
                    align-items: center;
                }
            }
        }

        .uploadImgLabel {
            height: 100%;
            font-size: 30px;
            color: #CCCCCC;
            cursor: pointer;

            .img-upload {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 0 15px;
                height: 100%;
                border-left: 1px solid rgba(204, 204, 204, 0.1);
                background-color: rgb(34, 34, 34);

                input {
                    display: none;
                }

                .updateImgSvg {
                    height: 55%;
                }
            }

            .imgRecognizerMethod {
                position: absolute;
                top: 46px;
                font-size: 14px;
                z-index: 99999;
                color: white;
                width: 150px;
                background-color: rgb(37, 36, 36);

                li {
                    height: 50px;
                    line-height: 50px;
                    cursor: pointer;

                    &:hover {
                        background-color: rgb(27, 27, 27);
                    }
                }
            }
        }

        .sound {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 15px;
            height: 100%;
            cursor: pointer;

            &.isPlaySound {
                background-color: rgba(110, 110, 110, 0.8);
            }

            &:hover {
                background-color: rgba(110, 107, 107, 0.5);
            }

            .soundNotPlaySvg {
                height: 50%;
            }

            .soundPlaySvg {
                height: 60%;
                margin-top: 5px;
            }
        }

        .screenshot {
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 25px;
            border-right: 1px solid rgba(230, 222, 222, 0.1);
            background-color: rgb(34, 34, 34);
            cursor: pointer;

            &:hover {
                background-color: rgb(20, 20, 20);
            }
        }

        .liveChat {
            display: flex;
            align-items: center;
            margin-left: 10px;
            height: 100%;

            img {
                height: 50%;
            }
        }
    }

    .logo {
        width: 100%;
        height: 70px;
        line-height: 70px;

        div {
            display: none;
        }
    }

    .getCode {
        width: 220px;
        font-size: 14px;
        color: #ffffff;

        .download-icon {
            margin: 0 5px;
        }
    }

    .currentMode {
        display: none; // todo
        position: absolute;
        top: 120%;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        font-size: 16px;
    }
}

@media screen and (min-width: 980px) {
    .content {
        height: 70px;

        .function-choose {
            .camera-area {
                .camera-choose {
                    width: 200px;
                }

                .cameraSvg {
                    width: 45.22px;
                    height: 25.31px;
                }
            }

            .uploadImgLabel {
                .img-upload {
                    width: 100px;
                    border-right: 1px solid rgba(230, 222, 222, 0.1);
                    ;

                    &:hover {
                        background-color: rgb(20, 20, 20);
                    }
                }

                .imgRecognizerMethod {
                    top: 70px;
                }
            }

            .sound {
                width: 80px;

                label {
                    .soundNotPlaySvg {
                        width: 36px;
                        height: 36px;
                        margin-top: 10px;
                    }

                    .soundPlaySvg {
                        width: 40px;
                        height: 40px;
                        margin-top: 15px;
                    }
                }
            }

            .liveChat {
                display: none;
            }
        }

        .logo {
            div {
                display: block;
                font-size: 24px;
                color: #ffffff;
            }
        }

        .getCode {
            width: 400px;
            height: 42px;
            background-color: #FE8E14;
            font-size: 18px;
            line-height: 42px;
            margin-right: 111px;

            .download-icon {
                display: none;
            }
        }

        .currentMode {
            display: none;
        }
    }
}

@media screen and (max-width: 979px) {
    .content {
        .function-choose {
            .camera-area {
                .camera-choose {
                    .camera-name {
                        display: none;
                    }
                }
            }
        }

        .logo {
            display: none;
        }

        .getCode {
            text-align: right;
            margin-right: 10px;
        }
    }
}

@media screen and (max-width: 979px) and (orientation: landscape) {
    .content {
        height: 8vh;

        .function-choose {
            .camera-area {
                .camera-choose {
                    padding: 0 15px;

                    .cameraSvg {
                        height: 50%;
                    }
                }
            }

            .uploadImgLabel {
                .img-upload {
                    padding: 0 20px;
                }
            }

            .sound {
                padding: 0 20px;

                .soundPlaySvg {
                    margin-top: 0;
                }
            }

            .liveChat {
                margin-left: 15px;
            }
        }
    }
}
</style>