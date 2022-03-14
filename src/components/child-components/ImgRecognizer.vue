<script lang="tsx">
import { defineComponent, inject, ref, watch, getCurrentInstance, Ref } from 'vue';
import Clipboard from "clipboard";
import {mrzParseTwoLine, mrzParseThreeLine} from '../../mrz-parse'

export default defineComponent({
    setup() {
        const recognizer = inject('recognizer') as any;
        const runtimeMode = inject('runtimeMode') as Ref<string>
        const isShowStaticImg = inject('isShowStaticImg') as Ref<boolean>;
        const recognizeResultInfo = inject('recognizeResultInfo') as Ref<string[]>;
        const recognizeImg = inject('recognizeImg') as Ref<any>;
        const recognizeImgInfo = inject('recognizeImgInfo') as Ref<any>;
        const sampleImg = require('@/assets/sampleImg/passport.png');
        const resultTitles = ref(['Document Type :', 'Issuing State :', 'Surname :', 'Given Name :', 'Passport Number :', 'Nationality :', 'Date of Birth (YYYY-MM-DD) :', 'Gender :', 'Date of Expiry (YYYY-MM-DD) :'] as Array<string>)
        const finalResult = ref([''] as Array<string>);

        const { proxy } = getCurrentInstance() as any;

        // Display different titles according to different modes
        const titleMode = () => {
            if(runtimeMode.value === 'video-mrz') {
                return <div class="title">
                            {
                                resultTitles.value.map(item => {
                                    return <label>{(item === 'Passport Number :' && finalResult.value[0].substring(0,7) === 'ID CARD') ? 'ID Number :' : item}</label>
                                })
                            }
                        </div>
            }
        };

        const MRZResult = () => {
            if(runtimeMode.value === 'video-mrz') {
                return (
                    <div style="display:flex;flex-direction:column;justify-content:center;align-items:flex-start;font-size:12px;font-style:italic;">
                        {
                            finalResult.value.map((item: any) => {
                                return <label class="result-item">{ item }</label>
                            })
                        }
                    </div>
                )
            }
        }

        // restart the video
        const restartVideo = () => {
            recognizer.value.resumeScanning();
            isShowStaticImg.value = false;
        };

        const copyResults = () => {
            let clipboard = new Clipboard('.copy-btn', {
                text: (): string => {
                    let copyContent = '';
                    copyContent = 'Line1: ' + recognizeResultInfo.value[0] + '\n' +
                    'Line2: ' + recognizeResultInfo.value[1] + '\n' + (recognizeResultInfo.value[2] ? ('Line3: ' + recognizeResultInfo.value[2] + '\n') : '');
                    for(let i = 0; i < resultTitles.value.length; i++) {
                        copyContent += resultTitles.value[i] + ' ' + finalResult.value[i] + '\n';
                    }
                    return copyContent;
                }
            });
            clipboard.on('success', () => {
                proxy.$message.success('Copied!');
                clipboard.destroy();
            });
            clipboard.on('error', () => {
                proxy.$message.error('Failed!');
                clipboard.destroy();
            })
        }

        watch(recognizeResultInfo, () => {
            finalResult.value.slice(0, finalResult.value.length);
            // All data is normally obtained in passportMrz mode
            if(runtimeMode.value === 'video-mrz' && recognizeResultInfo.value.length === 2) {
                let tmp = mrzParseTwoLine(recognizeResultInfo.value[0], recognizeResultInfo.value[1]);
                finalResult.value.slice(0, finalResult.value.length);
                finalResult.value = tmp;
            } else if((runtimeMode.value === 'video-mrz') && recognizeResultInfo.value.length === 3) {
                let tmp = mrzParseThreeLine(recognizeResultInfo.value[0], recognizeResultInfo.value[1], recognizeResultInfo.value[2]);
                finalResult.value = tmp;
            } else {
                finalResult.value.push(recognizeResultInfo.value[0]);
            }
        }, {immediate: true, deep: true});        

        return () => (
            <>
                <div class="content">
                    <div class="img-container">
                        <img  src={ recognizeImg.value ? recognizeImg.value : sampleImg } alt="Image to recognize"/>
                    </div>
                    <div class="result-container">
                        <div>
                            <label style="font-size: 20px; font-weight:bold;">File Name :</label>
                            <label style="font-size: 20px; margin-left:10px;">{recognizeImgInfo.value.name}</label>
                        </div>
                        <div style="text-align:left;">
                            <label style="font-size:20px;font-weight:bold;">Final Result :</label>
                            {
                                recognizeResultInfo.value.map((item: any, index: number) => {
                                    return (
                                        <div style="color: white; font-family: Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace">
                                            <label>Line{index+1} :</label>
                                            <span>&nbsp;&nbsp;{item}</span>
                                        </div>
                                    )
                                })
                            }
                            <div style="display:flex;">
                                { titleMode() }
                                { MRZResult() }
                            </div>
                        </div>
                        <div class="copyAndCloseBtns">
                            <div class="copy-btn" onClick={copyResults}>Copy all</div>
                        </div>
                    </div>
                    <div class="button-container">
                        <div class="btn-restart" onClick={ restartVideo }>
                            <label>RESTART VIDEO</label>
                        </div>
                    </div>
                </div>
            </>
        )
    },
})
</script>
<style lang="scss" scoped>
    .content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        .img-container {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            max-width: 500px;
            height: 150px;
            background-color: black;
            img {
                height: 100%;
                max-width: 100%;
            }
        }
        .result-container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
            max-width: 500px;
            height: fit-content;
            background-color: gray;
            .result-item {
                margin-left: 10px;
                line-height: 22px;
                height: 22px;
            }
            .copyAndCloseBtns {
                display: flex;
                justify-content: space-around;
                width: 100%;
                margin: 8px 0;
                .copy-btn {
                    color: rgb(254,142,20);
                    font-size: 14px;
                    cursor: pointer;
                }
            }
            > div {
                margin-left: 10px;
            }
            label {
                color: white;
            }
        }
        .button-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 30px;
            height: 40px;
            cursor: pointer;
            .btn-restart {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 140px;
                height: 50px;
                color: white;
                background-color: #FE8E14;
                > label {
                    font-weight: bold;
                    font-size: 15px;
                    cursor: pointer;
                }
            }
        }
    }
    .title {
        display: flex;
        flex-direction: column;
    }

    @media screen and (max-width: 980px) {
        .content {
            height: auto;
            margin-top: 46px;
        }
    }
</style>
