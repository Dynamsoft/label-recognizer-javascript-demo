<script lang="tsx">
import { defineComponent, inject, ref, getCurrentInstance, Ref, watchEffect } from 'vue';
import { LabelRecognizer } from 'dynamsoft-label-recognizer';
import { DownOutlined, MobileOutlined, UpOutlined } from '@ant-design/icons-vue';
import { useRouter } from "vue-router";
export default defineComponent({
    setup() {
        const mrzSampleImg = require('@/assets/sampleImg/passport.png');
        const vinSampleImg = require('@/assets/sampleImg/vin.png');
        const { proxy } = getCurrentInstance() as any;
        const cameraList = inject('cameraList') as any;
        const recognizer = inject('recognizer') as any;
        const cameraEnhancer = inject('cameraEnhancer') as any;
        const isShowStaticImg = inject('isShowStaticImg') as Ref<boolean>;
        const isShowResults = inject('isShowResults') as Ref<boolean>;
        const recognizeResultInfo = inject('recognizeResultInfo') as Ref<string[]>;
        const recognizeImg = inject('recognizeImg') as Ref<any>;
        const recognizeImgInfo = inject('recognizeImgInfo') as Ref<any>;
        const isShowCameraList = inject('isShowCameraList') as Ref<boolean>;
        const isShowModeList = inject('isShowModeList') as Ref<boolean>;
        const isShowSettingList = inject('isShowSettingList') as Ref<boolean>;
        const runtimeMode = inject('runtimeMode') as Ref<string>;
        const isShowImgRecognitionMask = inject('isShowImgRecognitionMask') as Ref<any>;
        const isShowImgRecMethodList = inject('isShowImgRecMethodList') as Ref<boolean>;
        const isShowNumOrLetResults = inject('isShowNumOrLetResults') as Ref<boolean>;
        const isNeedPlaySound = inject('isNeedPlaySound') as Ref<boolean>;
        const cameraIsExists = inject('cameraIsExists') as any;
        const setRegion = inject('setRegion') as any;
        const isShowScanningPrompt = inject('isShowScanningPrompt') as Ref<boolean>;
        const cameraSelected = ref();
        const cameraLabel = ref('');
        const placement = ref(document.body.clientWidth > 980 ? 'top' : 'topLeft');
        const router = useRouter();
        let timer: any;
        window.addEventListener('resize', () => {
            if(document.body.clientWidth > 980) {
                placement.value = 'bottom';
            } else {
                placement.value = 'bottomLeft';
            }
        })
        watchEffect(async() => {
            const r = recognizer.value;
            if(r && r.dce && r.dce._currentCamera){
                const current = await cameraEnhancer.value.getSelectedCamera();
                cameraSelected.value = current;
                cameraLabel.value = current.label;
            }
        })
        // Local upload image recognition
        const uploadImg = async (event: any) => {
            const imgRecognizer = await LabelRecognizer.createInstance({runtimeSettings: runtimeMode.value});
            try{
                cameraIsExists.value ? recognizer.value.pauseScanning() : null;
                isShowResults.value = false;
                isShowImgRecMethodList.value = false;
                let files = event.target.files;
                for(let i=0;i<files.length;++i) {
                    let file = files[i];
                    recognizeImgInfo.value = file;
                    let fr = new FileReader();
                    fr.onload = function() {
                        recognizeImg.value = this.result;
                    }
                    fr.readAsDataURL(file);
                    isShowImgRecognitionMask.value = true;
                    let recognizeResults = await imgRecognizer.recognize(file);
                    isShowImgRecognitionMask.value = false;
                    let resultArr: Array<string> = [];
                    recognizeResults[0].lineResults.forEach((res: any) => {
                        resultArr.push(res.text);
                    })
                    recognizeResultInfo.value = resultArr;
                    if(recognizeResults.length === 0) {
                        proxy.$message.error('No Result Found!');
                    } else {
                        isShowStaticImg.value = true;
                        isShowNumOrLetResults.value = false;
                    }
                }
            } catch(ex: any) {
                cameraIsExists.value ? recognizer.value.resumeScanning() : null;
                proxy.$message.error('No recognizable content found!');
            }
            imgRecognizer.destroyContext();
        };
        const loadSampleImg = async () => {
            const imgRecognizer = await LabelRecognizer.createInstance({runtimeSettings: runtimeMode.value});
            try {
                isShowResults.value = false;
                cameraIsExists.value ? recognizer.value.pauseScanning() : null;
                const image = new Image();
                await new Promise((rs,rj)=>{
                    image.onload = rs;
                    image.onerror = rj;
                    image.src = runtimeMode.value === 'mrz' ? mrzSampleImg : vinSampleImg;
                });
                recognizeImgInfo.value = {name: 'Sample Img'} as any;
                recognizeImg.value = runtimeMode.value === 'mrz' ? mrzSampleImg : vinSampleImg;
                isShowImgRecognitionMask.value = true;
                let result = await imgRecognizer.recognize(image);
                isShowImgRecognitionMask.value = false;
                let resultArr: Array<string> = [];
                result[0].lineResults.forEach((res: any) => {
                    resultArr.push(res.text);
                })
                recognizeResultInfo.value = resultArr;
                isShowStaticImg.value = true;
                isShowImgRecMethodList.value = false;
                isShowNumOrLetResults.value = false;
            } catch(ex: any) {
                cameraIsExists.value ? recognizer.value.resumeScanning() : null;
                proxy.$message.error(ex.message);
            }
            imgRecognizer.destroyContext();
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
        const goToChat = () => {
            location.href = 'https://support.dynamsoft.com/LiveChatServer/chatwindowmobile.aspx?planId=5000110&siteId=10008&dynamic=false&pageTitle=Barcode%20Reader%20JavaScript%20Demo%20%7C%20Dynamsoft&pageUrl=https%3A%2F%2Fdemo.dynamsoft.com%2Fbarcode-reader-js%2F&newurl=1&r=4&embInv=0&dirChat=0&guid=&chatGroup='
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
                            <label for="imgUpload"><li><div>Upload from Local</div></li></label>
                            <input type="file" accept="image/*" id="imgUpload" onChange={uploadImg} style={{ display: "none" }}/></>
                        }
                    </ul>
        }
        const modeList = () => {
            return <ul class="modeList">
                        {
                            <><li style={{ color: runtimeMode.value==="mrz"? "#fe8e14":'#aaaaaa' }} onClick={() => { changeMode("mrz"); } }><div>MRZ Scanner</div></li>
                            <li style={{ color: runtimeMode.value==="vin"? "#fe8e14":'#aaaaaa' }} onClick={() => { changeMode("vin"); } }><div>VIN (bate)</div></li></>
                        }
                    </ul>
        }
        const changeMode = async (mode: any) => {
            if(!cameraIsExists.value) {
                runtimeMode.value = mode;
            } else {
                isShowNumOrLetResults.value = false;
                if(recognizer.value) {
                    isShowResults.value = false;
                    runtimeMode.value = mode;
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
                router.push(`mrz-scanner.html`);
            } else {
                router.push(`vin.html`);
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
                                    <svg viewBox="0 0 29.308 17" class="cameraSvg">
                                        <g transform="translate(-346.925 -627.702)">
                                        <g transform="translate(347.425 628.202)">
                                            <g>
                                            <path
                                                d="M365.791,644.2H348.656a1.231,1.231,0,0,1-1.231-1.231V629.433a1.231,1.231,0,0,1,1.231-1.231h16a1.231,1.231,0,0,1,1.231,1.231v14.733"
                                                transform="translate(-347.425 -628.202)"
                                                fill="none"
                                                stroke="#aaa"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="1"
                                            />
                                            <path
                                                d="M371.81,640.606a1.23,1.23,0,0,1-1.781,1.1l-4.923-2.462a1.229,1.229,0,0,1-.681-1.1v-4.633a1.232,1.232,0,0,1,.681-1.1l4.923-2.462a1.231,1.231,0,0,1,1.781,1.1Z"
                                                transform="translate(-343.502 -627.828)"
                                                fill="none"
                                                stroke="#aaa"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="1"
                                            />
                                            </g>
                                        </g>
                                        </g>
                                    </svg>
                                    <span>
                                        <span class='camera-name' style="margin: 0 5px">{cameraLabel.value}</span>
                                        <svg v-show={!isShowCameraList.value} id="arrow" width="15.3" height="7.07" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.412 4.978" style="margin-left: 3px; color: #AAAAAA; vertical-align: middle;">
                                            <path id="arrow_grey_down" data-name="arrow grey down" d="M620.5,7015.91l3.485,3.484a.728.728,0,0,0,1.028,0l3.485-3.484" transform="translate(-619.793 -7015.203)" fill="none" stroke="#aaa" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                        </svg>
                                        <svg v-show={isShowCameraList.value} style="margin-left: 3px; color: #AAAAAA; vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" width="15.3" height="7.07" viewBox="0 0 9.412 4.978">
                                            <path id="arrow_grey_up" data-name="arrow grey up" d="M620.5,7015.91l3.485,3.484a.728.728,0,0,0,1.028,0l3.485-3.484" transform="translate(629.204 7020.18) rotate(180)" fill="none" stroke="#aaa" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </a-popover>
                        <a-popover visible={isShowImgRecMethodList.value} trigger="click" content={updateLoadImgMenu} color="rgb(34,34,34)" arrowPointAtCenter>
                            <div class="uploadImgLabel" onClick={switchImgMethodList}>
                                <div class="img-upload">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34" class="updateImgSvg">
                                        <g id="Images-Photography_Image-Files_image-file-add" data-name="Images-Photography / Image-Files / image-file-add" transform="translate(-376.074 -2192.76)">
                                            <g id="Group_184" data-name="Group 184" transform="translate(377.074 2193.76)">
                                            <g id="image-file-add">
                                                <path id="Oval_118" data-name="Oval 118" d="M383.857,2204.325a2.782,2.782,0,1,0-2.783-2.782A2.782,2.782,0,0,0,383.857,2204.325Z" transform="translate(-375.509 -2191.804)" fill="none" stroke="#ccc" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                                                <path id="Shape_876" data-name="Shape 876" d="M392.657,2204.907l-.863-1.38a.7.7,0,0,0-1.18,0l-3.672,5.874-1.5-2.4a.7.7,0,0,0-1.18,0l-4.193,6.709h6.956" transform="translate(-375.9 -2190.066)" fill="none" stroke="#ccc" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                                                <path id="Shape_877" data-name="Shape 877" d="M390.987,2225.76H378.465a1.392,1.392,0,0,1-1.391-1.391v-29.217a1.392,1.392,0,0,1,1.391-1.391H396.96a1.394,1.394,0,0,1,.984.407l5.157,5.157a1.39,1.39,0,0,1,.408.984v5.973" transform="translate(-377.074 -2193.76)" fill="none" stroke="#ccc" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                                                <path id="Oval_119" data-name="Oval 119" d="M396.422,2221.456a8.348,8.348,0,1,0-8.348-8.348A8.347,8.347,0,0,0,396.422,2221.456Z" transform="translate(-372.77 -2189.456)" fill="none" stroke="#ccc" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                                                <path id="Shape_878" data-name="Shape 878" d="M394.074,2207.76v8.348" transform="translate(-370.422 -2188.282)" fill="none" stroke="#ccc" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                                                <path id="Shape_879" data-name="Shape 879" d="M399.422,2210.76h-8.348" transform="translate(-371.596 -2187.108)" fill="none" stroke="#ccc" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                                            </g>
                                            </g>
                                        </g>
                                    </svg>
                                </div>
                            </div>
                        </a-popover>
                        
                        <div class={{'sound': true, 'isPlaySound': isNeedPlaySound.value}} style="cursor: pointer;" onClick={switchSoundIsPlay}>
                            <label style="cursor: pointer;">
                                <svg xmlns="http://www.w3.org/2000/svg" class="soundNotPlaySvg" viewBox="0 0 23.005 23.005" v-show={!isNeedPlaySound.value}>
                                    <g id="Music-Audio_Playlists_playlist" data-name="Music-Audio / Playlists / playlist" transform="translate(-532.82 -2020.614)">
                                        <g id="Group_192" data-name="Group 192" transform="translate(531.004 2021.114)">
                                        <g id="playlist">
                                            <path id="Rectangle-path_82" data-name="Rectangle-path 82" d="M533,2022.272a1.157,1.157,0,0,1,1.158-1.158h19.689a1.158,1.158,0,0,1,1.158,1.158v19.689a1.159,1.159,0,0,1-1.158,1.158H534.162a1.158,1.158,0,0,1-1.158-1.158Z" transform="translate(-530.688 -2021.114)" fill="none" stroke="#ccc" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                            <path id="Oval_258" data-name="Oval 258" d="M545.741,2034.589a1.737,1.737,0,1,0-1.737-1.737A1.738,1.738,0,0,0,545.741,2034.589Z" transform="translate(-528.948 -2019.533)" fill="none" stroke="#ccc" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                            <path id="Oval_259" data-name="Oval 259" d="M538.741,2035.589a1.737,1.737,0,1,0-1.737-1.737A1.738,1.738,0,0,0,538.741,2035.589Z" transform="translate(-530.055 -2019.375)" fill="none" stroke="#ccc" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                            <path id="Shape_1263" data-name="Shape 1263" d="M540,2034.911v-6.655a1.158,1.158,0,0,1,.84-1.113l5.791-1.655a1.158,1.158,0,0,1,1.477,1.114v7.151" transform="translate(-529.581 -2020.429)" fill="none" stroke="#ccc" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                        </g>
                                        </g>
                                    </g>
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" class="soundPlaySvg" viewBox="0 0 27.001 27.001" v-show={isNeedPlaySound.value}>
                                    <g id="Music-Audio_Playlists_playlist-check" data-name="Music-Audio / Playlists / playlist-check" transform="translate(-338.504 -1922.614)">
                                        <g id="Group_168" data-name="Group 168" transform="translate(339.004 1923.114)">
                                        <g id="playlist-check">
                                            <path id="Shape_1158" data-name="Shape 1158" d="M359.353,1935.549v-11.3a1.13,1.13,0,0,0-1.13-1.131H340.134a1.129,1.129,0,0,0-1.13,1.131v18.088a1.13,1.13,0,0,0,1.13,1.131h11.3" transform="translate(-339.004 -1923.114)" fill="none" stroke="#ccc" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                            <path id="Oval_195" data-name="Oval 195" d="M350.7,1936.506a1.7,1.7,0,1,0-1.7-1.7A1.7,1.7,0,0,0,350.7,1936.506Z" transform="translate(-337.699 -1921.809)" fill="none" stroke="#ccc" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                            <path id="Oval_196" data-name="Oval 196" d="M343.7,1937.506a1.7,1.7,0,1,0-1.7-1.7A1.7,1.7,0,0,0,343.7,1937.506Z" transform="translate(-338.612 -1921.679)" fill="none" stroke="#ccc" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                            <path id="Shape_1159" data-name="Shape 1159" d="M345,1936.685v-6.5a1.131,1.131,0,0,1,.82-1.086l5.652-1.615a1.13,1.13,0,0,1,1.441,1.087v6.98" transform="translate(-338.221 -1922.549)" fill="none" stroke="#ccc" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                            <path id="Oval_197" data-name="Oval 197" d="M357.656,1947.419a5.652,5.652,0,1,0-5.652-5.653A5.653,5.653,0,0,0,357.656,1947.419Z" transform="translate(-337.308 -1921.418)" fill="#fe8e14" stroke="#fe8e14" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                            <path id="Shape_1160" data-name="Shape 1160" d="M355,1941.875l1.224,1.224a.567.567,0,0,0,.859-.071l2.438-3.414" transform="translate(-336.916 -1920.961)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/>
                                        </g>
                                        </g>
                                    </g>
                                </svg>
                            </label>
                        </div>
                        <svg class="msgSvg" viewBox="0 0 24 24" style="margin-left: 10px" onClick={ goToChat }>
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
                    <div class="logo" onClick={closeList}>
                        <div style={{height: '100%'}}>
                            <a-popover visible={isShowModeList.value && document.body.clientWidth >= 980 } trigger="click" content={modeList} color="rgb(34,34,34)" arrowPointAtCenter>
                                <div style={{cursor: "pointer"}} onClick={switchModeList}>{runtimeMode.value === 'mrz' ? 'MRZ Scanner' : runtimeMode.value.toUpperCase() + ' (beta)'}{modeListArrowIcon()}</div>
                            </a-popover>
                        </div>
                    </div>
                    <a href="https://github.com/Dynamsoft/label-recognizer-javascript-demo" target="_blank" class="getCode">
                        GET SOURCE CODE
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
                    </a>
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
        height: 46px;
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
                        width: 25.84px;
                        height: 16px;
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
                    padding: 0 10px;
                    height: 100%;
                    border-left: 1px solid rgba(204,204,204, 0.1);
                    background-color: rgb(34,34,34);
                    input {
                        display: none;
                    }
                    .updateImgSvg {
                        width: 34px;
                        height: 34px;
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
                &.isPlaySound {
                    background-color: rgba(110, 110, 110, 0.8);
                }
                &:hover {
                    background-color: rgba(110, 107, 107, 0.5);
                }
                label {
                    font-size: 30px;
                    color: #CCCCCC;
                    .soundNotPlaySvg {
                        width: 23.005px;
                        height: 23.005px;
                    }
                    .soundPlaySvg {
                        width: 27.001px;
                        height: 27.001px;
                    }
                }
            }
            .msgSvg {
                width: 24px;
                height: 24px;
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
                            width: 33.01px;
                            height: 33.01px;
                            margin-top: 10px;
                        }
                        .soundPlaySvg {
                            width: 33.24px;
                            height: 33.24px;
                            margin-top: 10px;
                        }
                    }
                }
                .msgSvg {
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
                .uploadImgLabel {
                    .img-upload {
                        .updateImgSvg {
                            width: 22px;
                            height: 22px;
                        }
                    }
                }
            }
            .logo {
                display: none;
            }
            .getCode {
                text-align: right;
            }
        }
    }
</style>