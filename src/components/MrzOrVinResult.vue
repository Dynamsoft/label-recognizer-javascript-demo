<script lang="tsx">
import { defineComponent, inject, ref, getCurrentInstance, Ref, onMounted } from 'vue';
import Clipboard from "clipboard";
import { LabelRecognizer } from 'dynamsoft-label-recognizer';

export default defineComponent({
    setup() {
        const runtimeMode: Ref<string> = inject('runtimeMode')!;
        const recognizer: Ref<LabelRecognizer> = inject('recognizer')!;
        const bShowMrzOrVinResult: Ref<boolean> = inject('bShowMrzOrVinResult')!;
        const recognizeResultInfo: Ref<Array<string>> = inject('recognizeResultInfo')!;
        const recognizerFrame: Ref<HTMLImageElement|HTMLCanvasElement> = inject('recognizerFrame')!;
        const parseResultInfo: Ref<{[key: string]: any}> = inject('parseResultInfo')!;
        const cameraIsExists: Ref<boolean> = inject('cameraIsExists')!;
        const uploadImg: (event: any, bUploadSampleImage: boolean) => Promise<void> = inject("uploadImg")!;

        const bCopied: Ref<Boolean> = ref(false);
        const elImageDivRef: Ref<HTMLDivElement|null> = ref(null);

        const { proxy }: any = getCurrentInstance();

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
            elImageDivRef.value!.innerHTML = "";
            elImageDivRef.value!.appendChild(recognizerFrame.value);
        }

        onMounted(updateOriImage);

        // Display different titles according to different modes
        const titleMode = () => {
            return (
                Object.keys(parseResultInfo.value).map((item: string) => {
                    if (parseResultInfo.value[item]) {
                        return (
                            <div>
                                <span class="title">{(item === 'Passport Number :' && parseResultInfo.value['Document Type :'].substring(0, 7) === 'ID CARD') ? 'ID Number :' : item}</span>
                                <span class="content">{' ' + parseResultInfo.value[item]}</span>
                            </div>
                        )
                    }
                })
            )
        };

        const atomicString = () => {
            if (recognizeResultInfo.value.length) {
                return (
                    <div class="raw-string">
                        {runtimeMode.value.toUpperCase()} String :
                        {
                            recognizeResultInfo.value.map((item: string, index: number) => {
                                return (
                                    <div class={'line' + (index + 1)}>{item}</div>
                                )
                            })
                        }
                    </div>
                )
            }
        }

        const copyResults = () => {
            if (!bCopied.value) {
                let clipboard = new Clipboard('.result-copy-mobile, .result-copy-web', {
                    text: (): string => {
                        let copyContent = '';
                        for (let info in parseResultInfo.value) {
                            if (parseResultInfo.value[info]) {
                                copyContent += info + ' ' + parseResultInfo.value[info] + '\n';
                            }
                        }
                        if (runtimeMode.value === 'mrz') {
                            copyContent += 'Line1: ' + recognizeResultInfo.value[0] + '\n' +
                                'Line2: ' + recognizeResultInfo.value[1] + '\n' + (recognizeResultInfo.value[2] ? ('Line3: ' + recognizeResultInfo.value[2] + '\n') : '');
                        } else {
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
            (recognizerFrame.value as HTMLCanvasElement).toBlob((blob: Blob | null) => {
                const url = window.URL.createObjectURL(blob!);
                let download = document.createElement("a");
                download.download = Date.now().toString();
                download.href = url;
                download.click();
            })
        }

        const closeResult = () => {
            bShowMrzOrVinResult.value = false;
            cameraIsExists.value ? recognizer.value.resumeScanning() : null;
        }

        return () => (
            <div class="result">
                <div class="result-header">
                    <svg class="result-left-icon" onClick={closeResult} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2676" width="25" height="25"><path d="M670.977781 808.954249c-5.300726 0-10.596336-2.045589-14.603603-6.126534L368.69006 509.86743c-7.818059-7.961322-7.818059-20.717857 0-28.67918l287.684118-292.960285c7.92039-8.065699 20.877493-8.182356 28.942169-0.26299 8.065699 7.919367 8.182356 20.877493 0.264013 28.942169L411.976936 495.526817l273.603425 278.620695c7.918343 8.064676 7.801686 21.022803-0.264013 28.942169C681.331593 807.002804 676.153664 808.954249 670.977781 808.954249z" p-id="2677"></path></svg>
                    <div>Result</div>
                    <div></div>
                </div>
                <div class="middle-area">
                    <div class="result-original-img" ref={elImageDivRef}></div>
                    <div class="content-main" style={{ padding: runtimeMode.value === 'mrz' ? '10px 10px 0 30px' : '10px 10px 0 17px' }}>
                        <div class="top-info-web">
                            <div class="output">Output</div>
                            <div class="result-copy-web" onClick={copyResults}>{bCopied.value ? 'Copied' : 'Copy Result'}</div>
                        </div>
                        <div class="result-copy-mobile" onClick={copyResults}>{bCopied.value ? 'Copied' : 'Copy Result'}</div>
                        <div class="report-btn">
                            <span onClick={saveFrame}>Save Image</span>
                        </div>
                        <div class="content">
                            {titleMode()}
                            {atomicString()}
                        </div>
                        <div class="report-btn-web">
                            <span onClick={saveFrame}>Save Image</span>
                        </div>
                    </div>
                </div>
                <div class="footer-btns" style={{ justifyContent: runtimeMode.value === 'mrz' ? "space-between" : "center", padding: runtimeMode.value === 'mrz' ? "15px 40px 16px 30px" : "0" }}>
                    <div class="restart-video-btn" onClick={closeResult}>RESTART VIDEO</div>
                    <label for="imgUpload"><div class="upload-local-image" v-show={runtimeMode.value === 'mrz'}>OR Upload From Local</div></label>
                    <input type="file" accept="image/*" id="imgUpload" onChange={async (e)=>{await uploadImg(e, false); updateOriImage();}} style={{ display: "none" }} />
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

            .report-btn,
            .report-btn-web {
                color: #FE8E14;
                font-size: 16px;
                font-family: 'Oswald-Regular';
                margin-bottom: 10px;

                span {
                    cursor: pointer;
                }
            }

            .report-btn-web,
            .result-copy-web {
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

                .line1,
                .line2,
                .line3 {
                    color: white;
                    font-size: 14px;
                    font-family: Consolas, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
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
            width: 120px;
            max-width: 150px;
            padding: 0 10px;
            color: #FFF;
            background-color: #FE8E14;
            text-align: center;
            line-height: 48px;
            cursor: pointer;
        }

        .upload-local-image {
            color: #FE8E14;
            cursor: pointer;
            width: 128px;
        }
    }
}

::-webkit-scrollbar {
    width: 19px;
    background-color: transparent;
    padding: 0 5px;
}

::-webkit-scrollbar-thumb {
    background-color: #272626;
    border: 7px solid transparent;
    background-clip: content-box;
}

::-webkit-scrollbar-corner {
    background-color: rgba(0, 0, 0, 1);
}

@media screen and (min-width: 980px),
(max-width: 979px) and (orientation: landscape) {
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
        }
    }
}
</style>