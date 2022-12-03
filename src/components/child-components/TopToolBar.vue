<script lang="tsx">
import { defineComponent, inject, ref, getCurrentInstance, Ref, watchEffect } from 'vue';
import { LabelRecognizer } from 'dynamsoft-label-recognizer';
import { CodeParser } from 'shen-dynamsoft-code-parser';
import { DownOutlined, MobileOutlined, UpOutlined } from '@ant-design/icons-vue';
import { useRouter } from "vue-router";
import { mrzParseTwoLine, mrzParseThreeLine } from '../../mrz-parser';
import { CameraEnhancer } from 'dynamsoft-camera-enhancer';

export default defineComponent({
    setup() {
        const mrzSampleImg = require('@/assets/sampleImg/passport.png');
        const vinSampleImg = require('@/assets/sampleImg/vin.png');
        const musicSelected = require('@/assets/image/music-selected.svg');
        const musicUnSelected = require('@/assets/image/music-unselected.svg');
        const liveChat = require('@/assets/image/message.svg');
        const camera = require('@/assets/image/camera.svg')
        const addImage = require('@/assets/image/image-files.svg');
        const arrowGreyDown = require('@/assets/image/arrow-grey-down.svg');
        const arrowGreyUp = require('@/assets/image/arrow-grey-up.svg');
        const download = require('@/assets/image/download.svg');
        const cameraList = inject('cameraList') as any;
        const recognizer = inject('recognizer') as Ref<LabelRecognizer> | any;
        const parser = inject('parser') as Ref<CodeParser> | any
        const cameraEnhancer = inject('cameraEnhancer') as Ref<CameraEnhancer>;
        const isShowResults = inject('isShowResults') as Ref<boolean>;
        const recognizeResultInfo = inject('recognizeResultInfo') as Ref<string[]>;
        const isShowCameraList = inject('isShowCameraList') as Ref<boolean>;
        const isShowModeList = inject('isShowModeList') as Ref<boolean>;
        const isShowSettingList = inject('isShowSettingList') as Ref<boolean>;
        const runtimeMode = inject('runtimeMode') as Ref<string>;
        const isShowImgRecognitionMask = inject('isShowImgRecognitionMask') as Ref<any>;
        const isShowImgRecMethodList = inject('isShowImgRecMethodList') as Ref<boolean>;
        const isShowNumOrLetResults = inject('isShowNumOrLetResults') as Ref<boolean>;
        const isNeedPlaySound = inject('isNeedPlaySound') as Ref<boolean>;
        const cameraIsExists = inject('cameraIsExists') as Ref<boolean>;
        const setRegion = inject('setRegion') as any;
        const isShowScanningPrompt = inject('isShowScanningPrompt') as Ref<boolean>;
        const parseResultInfo = inject('parseResultInfo') as Ref<any>;
        const recognizerFrame = inject('recognizerFrame') as Ref<any>;
        const cameraSelected = ref();
        const cameraLabel = ref('');
        const placement = ref(document.body.clientWidth > 980 ? 'top' : 'topLeft');
        const router = useRouter();
        const { proxy } = getCurrentInstance() as any;

        let timer: any;

        window.addEventListener('resize', () => {
            placement.value = document.body.clientWidth > 980 ? 'bottom' : 'bottomLeft';
        })
        watchEffect(async() => {
            const r = recognizer.value;
            if(r && r.dce && r.dce._currentCamera){
                const current = cameraEnhancer.value.getSelectedCamera();
                cameraSelected.value = current;
                cameraLabel.value = current.label;
            }
        })
        // Local upload image recognition
        const uploadImg = async (event:any) => {
            const imgRecognizer = await LabelRecognizer.createInstance({runtimeSettings: runtimeMode.value});
            try{
                cameraIsExists.value ? recognizer.value.pauseScanning() : null;
                isShowImgRecMethodList.value = false;
                let files = event.target.files;
                for(let i=0;i<files.length;++i) {
                    let file = files[i];
                    isShowImgRecognitionMask.value = true;
                    let result = await imgRecognizer.recognize(file);
                    if(result.length === 0) {
                        proxy.$message.error('No Result Found!');
                    } else {
                        const fr = new FileReader();
                        const imgSrc = await new Promise((rs, rj)=>{
                            fr.readAsDataURL(file);
                            fr.onload = function() {
                                rs(this.result);
                            }
                        });
                        const img = new Image() as any;
                        await new Promise((rs,rj)=>{
                            img.onload = rs;
                            img.src = imgSrc;
                        })
                        recognizerFrame.value = img;
                        let resultArr: Array<string> = [];
                        result[0].lineResults.forEach((res: any) => {
                            resultArr.push(res.text);
                        })
                        if(runtimeMode.value === "mrz") {
                            if(resultArr.length === 2) {
                                let parseResultInfo = mrzParseTwoLine(resultArr[0], resultArr[1]);
                                if(parseResultInfo) {
                                    showResults(parseResultInfo, resultArr);
                                } else {
                                    cameraIsExists.value ? recognizer.value.pauseScanning() : null;
                                    cameraIsExists.value ? recognizer.value.resumeScanning() : null;
                                    proxy.$message.error('Parse Failed!');
                                }
                            } else if(resultArr.length === 3) {
                                let parseResultInfo = mrzParseThreeLine(resultArr[0], resultArr[1], resultArr[2]);
                                if(parseResultInfo) {
                                    showResults(parseResultInfo, resultArr);
                                } else {
                                    cameraIsExists.value ? recognizer.value.pauseScanning() : null;
                                    cameraIsExists.value ? recognizer.value.resumeScanning() : null;
                                    proxy.$message.error('Parse Failed!');
                                }
                            }
                        } else if(runtimeMode.value === "vin") {
                            let resultArr: Array<string> = [];
                            resultArr.push(result[0].lineResults[0].text);
                            isShowResults.value = true;
                            recognizeResultInfo.value = resultArr;
                            cameraIsExists.value ? recognizer.value.pauseScanning() : null;
                        }
                    }
                }
            } catch(ex: any) {
                cameraIsExists.value ? recognizer.value.resumeScanning() : null;
                proxy.$message.error('No recognizable content found!');
            }
            event.target.value = "";
            isShowImgRecognitionMask.value = false;
            imgRecognizer.destroyContext();
        };
        const loadSampleImg = async () => {
            const imgRecognizer = await LabelRecognizer.createInstance({runtimeSettings: runtimeMode.value});
            try {
                isShowImgRecMethodList.value = false;
                cameraIsExists.value ? recognizer.value.pauseScanning() : null;
                const image = new Image();
                await new Promise((rs,rj)=>{
                    image.onload = rs;
                    image.onerror = rj;
                    image.src = runtimeMode.value === 'mrz' ? mrzSampleImg : vinSampleImg;
                });
                recognizerFrame.value = image;
                isShowImgRecognitionMask.value = true;
                let result = await imgRecognizer.recognize(image);
                let resultArr: Array<string> = [];
                result[0].lineResults.forEach((res: any) => {
                    resultArr.push(res.text);
                });
                if(runtimeMode.value === "mrz") {
                    if(resultArr.length === 2) {
                        let parseResultInfo = mrzParseTwoLine(resultArr[0], resultArr[1]);
                        if(parseResultInfo) {
                            showResults(parseResultInfo, resultArr);
                        } else {
                            cameraIsExists.value ? recognizer.value.pauseScanning() : null;
                            cameraIsExists.value ? recognizer.value.resumeScanning() : null;
                        }
                    } else if(resultArr.length === 3) {
                        let parseResultInfo = mrzParseThreeLine(resultArr[0], resultArr[1], resultArr[2]);
                        if(parseResultInfo) {
                            showResults(parseResultInfo, resultArr);
                        } else {
                            cameraIsExists.value ? recognizer.value.pauseScanning() : null;
                            cameraIsExists.value ? recognizer.value.resumeScanning() : null;
                        }
                    }
                } else if(runtimeMode.value === "vin") {
                    let resultArr: Array<string> = [];
                    resultArr.push(result[0].lineResults[0].text);
                    isShowResults.value = true;
                    recognizeResultInfo.value = resultArr;
                    cameraIsExists.value ? recognizer.value.pauseScanning() : null;
                }
            } catch(ex: any) {
                cameraIsExists.value ? recognizer.value.resumeScanning() : null;
                proxy.$message.error(ex.message);
            }
            isShowImgRecognitionMask.value = false;
            imgRecognizer.destroyContext();
        }
        const showResults = (parseResult: object, resultArr: Array<string>) => {
            recognizeResultInfo.value = resultArr;
            isShowScanningPrompt.value = false;
            parseResultInfo.value = parseResult;
            isShowResults.value = true;
            isShowImgRecMethodList.value = false;
            cameraIsExists.value ? recognizer.value.pauseScanning() : null;
        }
        const closeList = () => {
            isShowCameraList.value = false;
            isShowModeList.value = false;
            isShowSettingList.value = false;
            isShowImgRecMethodList.value = false;
        }
        const switchSoundIsPlay = () => {
            isShowCameraList.value = false;
            isShowModeList.value = false;
            isShowSettingList.value = false;
            isShowImgRecMethodList.value = false;
            isNeedPlaySound.value = !isNeedPlaySound.value;
        }
        const switchCameraList = () => {
            isShowCameraList.value = !isShowCameraList.value;
            isShowModeList.value = false;
            isShowSettingList.value = false;
            isShowImgRecMethodList.value = false;
        }
        const switchImgMethodList = () => {
            isShowImgRecMethodList.value = !isShowImgRecMethodList.value;
            isShowModeList.value = false;
            isShowSettingList.value = false;
            isShowCameraList.value = false;
        }
        const switchModeList = (e: any) => {
            e.stopPropagation();
            isShowModeList.value = !isShowModeList.value;
            isShowCameraList.value = false;
            isShowImgRecMethodList.value = false;
        }
        const changeCamera = async (info: any) => {
            isShowCameraList.value = false;
            isShowResults.value = false;
            await cameraEnhancer.value.selectCamera(info);
            recognizer.value.resumeScanning();
            proxy.$message.success(`Switched to ${cameraSelected.value.label} successfully!`);
        }
        const formatModeName = (str: string) => {
            if(str === 'vin') {
                return 'VIN (beta)'
            } else {
                return str.replace(str[0], str[0].toUpperCase())
            }
        }
        const cameraMenu = () => {
            return <ul class="camera-list" /* v-show={isShowCameraList.value && cameraList.value} */>
                        {
                            cameraList.value.length ? 
                            cameraList.value.map((item: any) => {
                                return <li style={{color: (cameraSelected.value && item && cameraSelected.value.deviceId === item.deviceId) ? "#FE8E14" : "white", backgroundColor: (cameraSelected.value && item && cameraSelected.value.deviceId === item.deviceId) ? "#181717" : ""}} onClick={()=>{changeCamera(item)}}><div>{ item.label }</div></li>
                            }) : <li style={{color: "white", width: "150px"}}><div>{cameraIsExists.value ? 'Loading...' : 'No found camera'}</div></li>
                        }
                    </ul>
        }
        const updateLoadImgMenu = () => {
            return  <ul class="imgRecognizerMethod">
                        {
                            <><li onClick={loadSampleImg}><div>Load Sample Image</div></li>
                            { runtimeMode.value === "mrz" ? <label for="imgUpload"><li><div>Upload from Local</div></li></label> : null }
                            <input type="file" accept="image/*" id="imgUpload" onChange={uploadImg} style={{ display: "none" }}/></>
                        }
                    </ul>
        }
        const modeList = () => {
            return <ul class="modeList">
                        {
                            <><li style={{ color: runtimeMode.value==="mrz"? "#fe8e14":'#aaaaaa' }} onClick={() => { changeMode("mrz"); } }><div>MRZ Scanner</div></li>
                            <li style={{ color: runtimeMode.value==="vin"? "#fe8e14":'#aaaaaa' }} onClick={() => { changeMode("vin"); } }><div>VIN (beta)</div></li></>
                        }
                    </ul>
        }
        const changeMode = async (mode: string) => {
            if(!cameraIsExists.value) {
                runtimeMode.value = mode;
            } else {
                isShowNumOrLetResults.value = false;
                if(recognizer.value) {
                    isShowResults.value = false;
                    runtimeMode.value = mode;
                    runtimeMode.value === "mrz" ? await parser.value.setCodeType(16) : await parser.value.setCodeType(32);
                    runtimeMode.value === "mrz" ? document.title = "MRZ Scanner | Dynamsoft Label Recognizer" : document.title = "VIN Scanner (Beta) | Dynamsoft Label Recognizer";
                    recognizer.value.pauseScanning();
                    await recognizer.value.updateRuntimeSettingsFromString(mode);
                    setRegion();
                    isShowScanningPrompt.value = true;
                    if(timer) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(() => {
                        isShowScanningPrompt.value = false;
                    }, 5000)   
                    recognizer.value.resumeScanning();
                    if(mode === 'mrz' && document.body.clientWidth < 980) {
                        proxy.$message.open({
                            content: 'Rotate your device',
                            duration: 3,
                            icon: <MobileOutlined spin style={{ color: "#FE8E14" }}/>
                        });
                    }
                }
            }
            if(mode === 'mrz') {
                router.push(`mrz-scanner.html` + location.search);
            } else {
                router.push(`vin.html` + location.search);
            }
            proxy.$message.success(`Switched to ${mode === 'mrz' ? 'MRZ Scanner' : formatModeName(mode) + ' mode'} successfully!`);
            isShowModeList.value = false;
        }
        const modeListArrowIcon = () => {
            if(isShowModeList.value) return <UpOutlined style={{fontSize: "17px", color: "rgb(170,170,170)", marginLeft: "7px"}}/>
            return <DownOutlined style={{fontSize: "17px", color: "rgb(170,170,170)", marginLeft: "7px"}}/>
        }
        return () => (
            <>
                <div class="content">
                    <div class="function-choose">
                        <a-popover visible={isShowCameraList.value} trigger="click" content={cameraMenu} color="rgb(34,34,34)" placement={placement.value} arrowPointAtCenter>
                            <div class="camera-area">
                                <div class="camera-choose" onClick={switchCameraList}>
                                    <img src={ camera } class="cameraSvg"/>
                                    <span>
                                        <span class='camera-name' style="margin: 0 5px">{cameraLabel.value}</span>
                                        <img src={arrowGreyDown} v-show={!isShowCameraList.value} id="arrow" style="margin-left: 3px; color: #AAAAAA; vertical-align: middle;"/>
                                        <img src={arrowGreyUp} v-show={isShowCameraList.value} style="margin-left: 3px; color: #AAAAAA; vertical-align: middle;"/>
                                    </span>
                                </div>
                            </div>
                        </a-popover>
                        <a-popover visible={isShowImgRecMethodList.value} trigger="click" content={updateLoadImgMenu} color="rgb(34,34,34)" arrowPointAtCenter>
                            <div class="uploadImgLabel" onClick={switchImgMethodList}>
                                <div class="img-upload">
                                    <img src={ addImage } class="updateImgSvg"/>
                                </div>
                            </div>
                        </a-popover>
                        <div class={{'sound': true, 'isPlaySound': isNeedPlaySound.value}} onClick={switchSoundIsPlay}>
                            <img src={ musicUnSelected } class="soundNotPlaySvg" v-show={!isNeedPlaySound.value}/>
                            <img src={ musicSelected } class="soundPlaySvg" v-show={isNeedPlaySound.value}/>
                        </div>
                    </div>
                    <div class="logo" onClick={closeList}>
                        <div style={{height: '100%'}}>
                            <a-popover visible={isShowModeList.value && document.body.clientWidth >= 980 } trigger="click" content={modeList} color="rgb(34,34,34)" arrowPointAtCenter>
                                <div style={{cursor: "pointer"}} onClick={switchModeList}>{runtimeMode.value === 'mrz' ? 'MRZ Scanner' : runtimeMode.value.toUpperCase() + ' (beta)'}{modeListArrowIcon()}</div>
                            </a-popover>
                        </div>
                    </div>
                    <a href="https://github.com/Dynamsoft/label-recognizer-javascript-demo" target="_blank" class="getCode">
                        GET SOURCE CODE
                        <img src={download} class="download-icon"/>
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
                    color: rgb(245,245,245);
                    padding: 0 10px;
                    height: 100%;
                    background-color: rgb(34,34,34);
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
                    border-left: 1px solid rgba(204,204,204, 0.1);
                    background-color: rgb(34,34,34);
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
                    background-color: rgb(37,36,36);
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
                    background-color: rgb(20,20,20);
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
                        border-right: 1px solid rgba(230, 222, 222, 0.1);;
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
                    .camera-choose{
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