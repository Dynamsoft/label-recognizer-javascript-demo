<script lang="tsx">
import { defineComponent, inject, ref, getCurrentInstance, Ref } from 'vue';
import Clipboard from "clipboard";

export default defineComponent ({
    setup() {
        const runtimeMode = inject('runtimeMode') as Ref<string>;
        const recognizer = inject('recognizer') as any;
        const isShowResults = inject('isShowResults') as Ref<boolean>;
        const recognizeResultInfo = inject('recognizeResultInfo') as any;
        const recognizerFrame = inject('recognizerFrame') as Ref<any>;
        const parseResultInfo = inject('parseResultInfo') as Ref<any>;

        const resultTitles = ref(['Document Type :', 'Issuing State :', 'Surname :', 'Given Name :', 'Passport Number :', 'Nationality :', 'Date of Birth (YYYY-MM-DD) :', 'Gender :', 'Date of Expiry (YYYY-MM-DD) :'] as Array<string>)
        const finalResult = ref([''] as Array<string>);
        const isCopied = ref(false);

        const { proxy }: any = getCurrentInstance();

        (async () => {
            if((runtimeMode.value === 'mrz')) {
                let tmp = parseResultInfo.value;
                finalResult.value.slice(0, finalResult.value.length);
                finalResult.value = tmp;
            } else if(runtimeMode.value === 'vin') {
                finalResult.value.push(recognizeResultInfo.value);
            }
        })()
        
        // Display different titles according to different modes
        const titleMode = () => {
            if(runtimeMode.value === 'mrz') {
                return (
                    resultTitles.value.map((item: string, index: number) => {
                        return (
                            <div>
                                <span class="title">{(item === 'Passport Number :' && finalResult.value[0].substring(0,7) === 'ID CARD') ? 'ID Number :' : item}</span>
                                <span class="content">{' '+finalResult.value[index]}</span>
                            </div>
                        )
                    })
                )
            } else {
                return <div class="title">
                            <label>{ runtimeMode.value.substring(6).toUpperCase() } : {finalResult.value}</label>
                       </div>
            }
        };
        
        const MRZString = () => {
            if(runtimeMode.value === 'mrz') {
                return (
                    <div class="raw-string" v-show={runtimeMode.value === 'mrz'}>
                        MRZ String : 
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
            if(!isCopied.value) {
                let clipboard = new Clipboard('.copy-btn', {
                    text: (): string => {
                        let copyContent = '';
                        if(runtimeMode.value === 'mrz') {
                            for(let i = 0; i < resultTitles.value.length; i++) {
                                copyContent += resultTitles.value[i] + ' ' + finalResult.value[i] + '\n';
                            }
                            copyContent += 'Line1: ' + recognizeResultInfo.value[0] + '\n' +
                            'Line2: ' + recognizeResultInfo.value[1] + '\n' + (recognizeResultInfo.value[2] ? ('Line3: ' + recognizeResultInfo.value[2] + '\n') : '');
                        } else {
                            copyContent = recognizeResultInfo.value;
                        }
                        
                        return copyContent;
                    }
                });
                clipboard.on('success', () => {
                    proxy.$message.success('Copied!');
                    isCopied.value = true;
                    setTimeout(() => {
                        isCopied.value = false;
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
            isShowResults.value = false;
            recognizer.value.resumeScanning();
        }

        return () => (
            <div class="result">
                <div class="result-header">
                    Result
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24.5 24.5" style="margin-top: 3px" onClick={closeResult}>
                        <g transform="translate(-613.75 -3293.75)">
                            <g id="Group_352" data-name="Group 352">
                            <g id="delete-2">
                                <path id="Oval_263" data-name="Oval 263" d="M626,3317.5a11.5,11.5,0,1,0-11.5-11.5A11.5,11.5,0,0,0,626,3317.5Z" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                                <path id="Shape_1812" data-name="Shape 1812" d="M621,3301l10,10" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                                <path id="Shape_1813" data-name="Shape 1813" d="M631,3301l-10,10" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                            </g>
                            </g>
                        </g>
                    </svg>
                </div> 
                <div class={{'content-main': true, 'isMRZ': runtimeMode.value === 'mrz'}}>
                    { titleMode() }
                    { MRZString() }
                </div>
                <div class="footer-btns">
                    <div class="report-btn" onClick={saveFrame}>Save Image</div>
                    <div class="copy-btn" style={{color: !isCopied.value ? '#FE8E14' : 'gray', cursor: !isCopied.value ? 'pointer' : ''}} onClick={copyResults}>{isCopied.value ? 'Copied' : 'Copy'}</div>
                </div>
            </div>
        )
    }
})
</script>
<style lang="scss" scoped>
    .result {
        position: absolute;
        left: 0;
        right: 0;
        z-index: 9999;
        text-align: left;
        // max-width: 740px;
        background-color: #323234;
        .result-header {
            display: flex;
            justify-content: space-between;
            width: 100%;
            height: 38px;
            background-color: #000000;
            font-size: 16px;
            color: white;
            padding: 6px 10px 6px 30px;
            svg {
                cursor: pointer;
            }
        }
        .content-main {
            padding: 17px 0 0 30px;
            font-family: 'OpenSans-Regular';
            font-size: 14px;
            line-height: 30px;
            width: 50vw;
            margin-bottom: 5px;
            overflow: auto;
            // max-width: 740px;
            max-height: 450px;
            &.isMRZ {
                height: 50vh;
            }
            .title {
               color: #B4B4B4;
            }
            .content {
                color: #FFFFFF;
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
        .footer-btns {
            display: flex;
            justify-content: space-between;
            padding: 0 16px 16px 16px;
            .report-btn {
                color: #FE8E14;
                font-size: 16px;
                cursor: pointer;
            }
            .copy-btn {
                color: #FE8E14;
                font-size: 16px;
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

    @media screen and (min-width: 980px) {
        .result {
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            max-width: 740px;
            .content-main {
                max-width: 740px;
            }
        }
    }

    @media screen and (max-width: 980px) {
        .result {
            bottom: 0;
            .content-main {
                width: 100%;
                &.isMRZ {
                    height: 50vh;
                }
            }
        }
    }
</style>