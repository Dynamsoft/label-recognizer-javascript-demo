<script lang="tsx">
import { defineComponent, inject, ref, getCurrentInstance, Ref, onMounted, onBeforeMount } from 'vue';
import Clipboard from "clipboard";
import { LabelRecognizer } from 'dynamsoft-label-recognizer';
import { CodeParser } from 'shen-dynamsoft-code-parser';
import { mrzParseTwoLine, mrzParseThreeLine } from '../mrz-parser';

export default defineComponent ({
    setup() {
        const runtimeMode = inject('runtimeMode') as Ref<string>;
        const recognizer = inject('recognizer') as Ref<LabelRecognizer>;
        const parser = inject('parser') as Ref<CodeParser> | any;
        const bShowResults = inject('bShowResults') as Ref<boolean>;
        const recognizeResultInfo = inject('recognizeResultInfo') as any;
        const recognizerFrame = inject('recognizerFrame') as Ref<any>;
        const parseResultInfo = inject('parseResultInfo') as Ref<any>;
        const cameraIsExists = inject('cameraIsExists') as Ref<boolean>;
        const bShowImgRecognitionMask = inject('bShowImgRecognitionMask') as Ref<any>;
        const bShowImgRecMethodList = inject('bShowImgRecMethodList') as Ref<boolean>;

        const mrzResultTitles = ref(['Document Type :', 'Issuing State :', 'Surname :', 'Given Name :', 'Passport Number :', 'Nationality :', 'Date of Birth (YYYY-MM-DD) :', 'Gender :', 'Date of Expiry (YYYY-MM-DD) :'] as Array<string>)
        const vinResultTitles = ref(['Region :', 'Check Digit :', 'Model Year :', 'Plant Code :', 'Serial Number :'] as Array<string>);
        const fieldValues = ref([] as Array<string>)
        const finalResult = ref([] as Array<string>);
        const bCopied = ref(false) as Ref<Boolean>;
        const elImageDivRef = ref(null) as Ref<any> as Ref<HTMLElement>;

        const { proxy }: any = getCurrentInstance();

        onBeforeMount(async()=>{
            await updateResultInfo();
        })

        onMounted(()=>{
            updateOriImage();
        })

        const updateResultInfo = async () => {
            if((runtimeMode.value === 'mrz')) {
                let tmp = parseResultInfo.value;
                finalResult.value.slice(0, finalResult.value.length);
                finalResult.value = tmp;
            } else if(runtimeMode.value === 'vin') {
                parseResultInfo.value = await parser.value.parseData(recognizeResultInfo.value[0]);
                vinResultTitles.value.forEach(item=>{
                    finalResult.value.push(item.replace(item[0], item[0].toLowerCase()).replace(/\s/g, "").replace(":", ""));
                })
                for(let i=0;i<finalResult.value.length;i++) {
                    finalResult.value[i] = await parseResultInfo.value.getFieldValueByName(finalResult.value[i]);
                }
                fieldValues.value = finalResult.value;
            }
        }

        const updateOriImage = () => {
            const cvs = document.createElement("canvas");
            cvs.width = recognizerFrame.value.width; 
            cvs.height = recognizerFrame.value.height;
            const ctx = cvs.getContext("2d");
            ctx!.drawImage(recognizerFrame.value, 0, 0);  
            recognizerFrame.value = cvs;
            recognizerFrame.value.style.width = "100%";
            recognizerFrame.value.style.height = "100%";
            recognizerFrame.value.style.objectFit = "contain";
            elImageDivRef.value.innerHTML = "";
            elImageDivRef.value!.appendChild(recognizerFrame.value);
        }
       
        const uploadImg = async (event: any) => {
            const imgRecognizer = await LabelRecognizer.createInstance({runtimeSettings: runtimeMode.value});
            if(runtimeMode.value === "mrz") {
                const settings = JSON.parse(await imgRecognizer.outputRuntimeSettingsToString());
                settings.LabelRecognizerParameterArray[0].LineStringRegExPattern = settings.TextAreaArray[0].LineStringRegExPattern = settings.LineSpecificationArray[0].LineStringRegExPattern = "([ACI][A-Z<][A-Z][A-Z<]{2}[A-Z0-9<]{9}[0-9<][A-Z0-9<]{15}){(30)}|([0-9<]{6}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z][A-Z<]{2}[A-Z0-9<]{11}[0-9]){(30)}|([A-Z][A-Z<]{29}){(30)}|([ACIV][A-Z<][A-Z][A-Z<]{33}){(36)}|([A-Z0-9<]{9}[0-9][A-Z][A-Z<]{2}[0-9<]{6}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{8}){(36)}|(I[A-Z<]FRA[A-Z<]{25}[A-Z0-9<]{6}){(36)}|([A-Z0-9<]{12}[0-9][A-Z<]{14}[0-9]{2}[(01-12)][(01-31)][0-9][MF<][0-9]){(36)}|([PV][A-Z<][A-Z][A-Z<]{41}){(44)}|([A-Z0-9<]{9}[0-9][A-Z][A-Z<]{2}[0-9<]{6}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{14}[0-9<][0-9]){(44)}|([A-Z0-9<]{9}[0-9][A-Z][A-Z<]{2}[0-9<]{6}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{14}[A-Z0-9<]{2}){(44)}"
                await imgRecognizer.updateRuntimeSettingsFromString(settings, true);
            }
            try{
                cameraIsExists.value ? recognizer.value.pauseScanning() : null;
                bShowImgRecMethodList.value = false;
                let files = event.target.files;
                for(let i=0;i<files.length;++i) {
                    let file = files[i];
                    bShowImgRecognitionMask.value = true;
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
                        updateOriImage();
                        let resultArr: Array<string> = [];
                        result[0].lineResults.forEach((res: any) => {
                            resultArr.push(res.text);
                        })
                        if(runtimeMode.value === "mrz") {
                            if(resultArr.length === 2) {
                                let parseResultInfo = mrzParseTwoLine(resultArr[0], resultArr[1]);
                                if(parseResultInfo) {
                                    await showResults(parseResultInfo, resultArr);
                                    await updateResultInfo();
                                } else {
                                    proxy.$message.error('Parse Failed!');
                                    recognizeResultInfo.value = [];
                                    finalResult.value = [];
                                    fieldValues.value = [];
                                }
                            } else if(resultArr.length === 3) {
                                let parseResultInfo = mrzParseThreeLine(resultArr[0], resultArr[1], resultArr[2]);
                                if(parseResultInfo) {
                                    await showResults(parseResultInfo, resultArr);
                                    await updateResultInfo();
                                } else {
                                    proxy.$message.error('Parse Failed!');
                                    recognizeResultInfo.value = [];
                                    finalResult.value = [];
                                    fieldValues.value = [];
                                }
                            }
                        } else if(runtimeMode.value === "vin") {
                            let resultArr: Array<string> = [];
                            resultArr.push(result[0].lineResults[0].text);
                            bShowResults.value = true;
                            recognizeResultInfo.value = resultArr;
                            recognizer.value.pauseScanning();
                        }
                    }
                }
            } catch(ex: any) {
                cameraIsExists.value ? recognizer.value.resumeScanning() : null;
                proxy.$message.error('No recognizable content found!');
            }
            event.target.value = "";
            bShowImgRecognitionMask.value = false;
            imgRecognizer.destroyContext();
        };

        const showResults = async (parseResult: object, resultArr: Array<string>) => {
            recognizeResultInfo.value = resultArr;
            parseResultInfo.value = parseResult;
        }

        // Display different titles according to different modes
        const titleMode = () => {
            if(runtimeMode.value === 'mrz') {
                return (
                    mrzResultTitles.value.map((item: string, index: number) => {
                        if(finalResult.value[index]) {
                            return (
                                <div>
                                    <span class="title">{(item === 'Passport Number :' && finalResult.value[0].substring(0,7) === 'ID CARD') ? 'ID Number :' : item}</span>
                                    <span class="content">{' '+finalResult.value[index]}</span>
                                </div>
                            )
                        }
                    })
                )
            } else {
                return (
                    vinResultTitles.value.map((item: string, index: number) => {
                        if(fieldValues.value[index]) {
                            return (
                                <div>
                                    <span class="title">{item}</span>
                                    <span class="content">{' '+fieldValues.value[index]}</span>
                                </div>
                            )
                        }
                    })
                )
            }
        };
        
        const atomicString = () => {
            if(recognizeResultInfo.value.length) {
                return (
                    <div class="raw-string">
                        {runtimeMode.value === 'mrz' ? "MRZ" : "VIN"} String : 
                        {
                            recognizeResultInfo.value.map((item: any, index: number) => {
                                return (
                                    <div class={'line'+ (index+1)}>{item}</div>
                                )
                            })
                        }    
                    </div>
                )
            }
        }

        const copyResults = () => {
            if(!bCopied.value) {
                let clipboard = new Clipboard('.result-copy-mobile, .result-copy-web', {
                    text: (): string => {
                        let copyContent = '';
                        if(runtimeMode.value === 'mrz') {
                            for(let i = 0; i < mrzResultTitles.value.length; i++) {
                                copyContent += mrzResultTitles.value[i] + ' ' + finalResult.value[i] + '\n';
                            }
                            copyContent += 'Line1: ' + recognizeResultInfo.value[0] + '\n' +
                            'Line2: ' + recognizeResultInfo.value[1] + '\n' + (recognizeResultInfo.value[2] ? ('Line3: ' + recognizeResultInfo.value[2] + '\n') : '');
                        } else {
                            for(let i = 0; i < vinResultTitles.value.length; i++) {
                                if(fieldValues.value[i]) {
                                    copyContent += vinResultTitles.value[i] + ' ' + fieldValues.value[i] + '\n';
                                }
                            }
                            copyContent += `VIN String : ${recognizeResultInfo.value}`;
                        }
                        
                        return copyContent;
                    }
                });
                clipboard.on('success', () => {
                    proxy.$message.success('Copied!');
                    bCopied.value = true;
                    setTimeout(() => {
                        bCopied.value = false;
                    }, 5000)
                    clipboard.destroy();
                });
                clipboard.on('error', () => {
                    proxy.$message.error('Failed!');
                    clipboard.destroy();
                })
            }   
        }

        const saveFrame = () => {
            recognizerFrame.value.toBlob((blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                let download = document.createElement("a");
                download.download = Date.now().toString();
                download.href = url;
                download.click();
            })
        }

        const closeResult = () => {
            bShowResults.value = false;
            cameraIsExists.value ? recognizer.value.resumeScanning() : null;
        }

        return () => (
            <div class="result">
                <div class="result-header">
                    <svg class="result-left-icon" onClick={ closeResult } viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2676" width="25" height="25"><path d="M670.977781 808.954249c-5.300726 0-10.596336-2.045589-14.603603-6.126534L368.69006 509.86743c-7.818059-7.961322-7.818059-20.717857 0-28.67918l287.684118-292.960285c7.92039-8.065699 20.877493-8.182356 28.942169-0.26299 8.065699 7.919367 8.182356 20.877493 0.264013 28.942169L411.976936 495.526817l273.603425 278.620695c7.918343 8.064676 7.801686 21.022803-0.264013 28.942169C681.331593 807.002804 676.153664 808.954249 670.977781 808.954249z" p-id="2677"></path></svg>
                    <div>Result</div>
                    <div></div>
                </div>
                <div class="middle-area">
                    <div class="result-original-img" ref={elImageDivRef}></div>
                    <div class="content-main" style={{padding: runtimeMode.value === 'mrz' ? '10px 10px 0 30px' : '10px 10px 0 17px'}}>
                        <div class="top-info-web">
                            <div class="output">Output</div>
                            <div class="result-copy-web" onClick={ copyResults }>{bCopied.value ? 'Copied' : 'Copy Result'}</div>
                        </div>
                        <div class="result-copy-mobile" onClick={ copyResults }>{bCopied.value ? 'Copied' : 'Copy Result'}</div>
                        <div class="report-btn">
                            <span onClick={ saveFrame }>Save Image</span>
                        </div>
                        <div class="content">
                            { titleMode() }
                            { atomicString() }
                        </div>
                        <div class="report-btn-web">
                            <span onClick={ saveFrame }>Save Image</span>
                        </div>
                    </div>
                </div>
                <div class="footer-btns" style={{justifyContent: runtimeMode.value === 'mrz' ? "space-between" : "center", padding: runtimeMode.value === 'mrz' ? "15px 40px 16px 30px" : "0"}}>
                    <div class="restart-video-btn" onClick={ closeResult }>RESTART VIDEO</div>
                    <label for="imgUpload"><div class="upload-local-image" v-show={ runtimeMode.value === 'mrz' }>OR Upload From Local</div></label>
                    <input type="file" accept="image/*" id="imgUpload" onChange={ uploadImg } style={{ display: "none" }}/>
                </div>
            </div>
        )
    }
})
</script>
<style lang="scss" scoped>
    .result {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        text-align: left;
        background-color: #323234;
        .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            height: 38px;
            background-color: #000000;
            font-size: 16px;
            color: white;
            padding: 6px 35px 6px 10px;
            .result-left-icon {
                filter: invert(1);
            }
        }
        .middle-area {
            width: 100%;
            height: 80%;
            .result-original-img {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 30%;
                background-color: #393939;
            }
            .content-main {
                font-family: 'OpenSans-Regular';
                font-size: 14px;
                line-height: 30px;
                width: 100%;
                height: 70%;
                margin-bottom: 5px;
                max-height: 450px;
                .output {
                    display: none;
                }
                .result-copy-mobile {
                    display: inline-block;
                    color: #FE8E14;
                    font-family: 'Oswald-Regular';
                    font-size: 16px;
                    width: 100px;
                    text-align: left;
                }
                .report-btn {
                    display: inline-block;
                    margin-right: 15px;
                }
                .report-btn, .report-btn-web {
                    color: #FE8E14;
                    font-size: 16px;
                    font-family: 'Oswald-Regular';
                    margin-bottom: 10px;
                    span {
                        cursor: pointer;
                    }
                }
                .report-btn-web, .result-copy-web {
                    display: none;
                }
                .content {
                    width: 100%;
                    height: 88%;
                    overflow: auto;
                    color: #FFFFFF;
                }
                .title {
                    color: #B4B4B4;
                }
                .raw-string {
                    color: #B4B4B4;
                    margin-top: 18px;
                    font-family: 'OpenSans-Regular';
                    .line1, .line2, .line3 {
                        color: white;
                        font-size: 14px;
                        font-family:Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace;
                    }
                }
            }
        }
        .footer-btns {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 16px;
            height: calc(20% - 38px);
            .restart-video-btn {
                height: 48px;
                width: 150px;
                color: #FFF;
                background-color: #FE8E14;
                text-align: center;
                line-height: 48px;
                cursor: pointer;
            }
            .upload-local-image {
                color: #FE8E14;
                cursor: pointer;
            }
        }
    }

    ::-webkit-scrollbar{
        width: 19px;
        background-color: transparent;
        padding: 0 5px;
    }
    ::-webkit-scrollbar-thumb{
        background-color:#272626;
        border: 7px solid transparent;
        background-clip: content-box;
    }
    ::-webkit-scrollbar-corner{
        background-color: rgba(0,0,0,1);
    }

    @media screen and (min-width: 980px) , (max-width: 979px) and (orientation: landscape) {
        .result {
            .result-header {
                display: none;
            }
            .middle-area {
                width: 80%;
                height: 50%;
                display: flex;
                position: absolute;
                top: 45%;
                left: 50%;
                transform: translate(-50%, -50%);
                .result-original-img {
                    width: 100%;
                    height: 100%;
                    background-color: #121212;
                }
                .content-main {
                    height: 100%;
                    max-height: 100%;
                    background-color: #707070;
                    .result-copy-mobile {
                        display: none;
                    }
                    .top-info-web {
                        display: flex;
                        justify-content: space-between;
                        color: #FFFFFF;
                        font-family: 'Oswald-Regular';
                        padding-right: 15px;
                        height: 7%;
                        margin-bottom: 10px;
                        .output {
                            display: block;
                            height: 100%;
                            font-size: 22px;
                            margin-bottom: 10px;
                            margin-right: 15px;
                        }
                        .result-copy-web {
                            display: block;
                            color: #FE8E14;
                            font-size: 18px;
                            cursor: pointer;
                            height: 100%;
                        }
                    }
                    .content {
                        height: calc(85% - 20px);
                        max-height: 82%;
                    }
                    .report-btn {
                        display: none;
                    }
                    .report-btn-web {
                        display: block;
                        height: 8%;
                    }
                }
            }
            .footer-btns {
                position: absolute;
                bottom: 15%;
                left: 50%;
                transform: translateX(-50%);
                .restart-video-btn {
                    margin-right: 20px;
                }
            }
        }
    }
    @media screen and (max-width: 979px) and (max-height: 500px) and (orientation: landscape) {
        .result {
            .middle-area {
                height: 60%;
                .content-main {
                    line-height: 16px;
                    .content {
                        height: calc(90% - 20px);
                    }
                    .top-info-web {
                        margin-bottom: 5px;
                        .output {
                            display: none;
                        }
                        .result-copy-web {
                            font-size: 12px;
                        }
                    }
                }
            }
            .footer-btns {
                position: absolute;
                bottom: 10%;
                left: 50%;
                transform: translateX(-50%);
                .restart-video-btn {
                    height: 35px;
                    line-height: 35px;
                    font-size: 16px;
                    margin-right: 20px;
                }
                .upload-local-image {
                    width: 128px;
                }
            }
        }
    }
</style>