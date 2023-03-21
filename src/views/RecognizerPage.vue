<script lang="tsx">
import { computed, defineComponent, inject, provide, ref, Ref, getCurrentInstance } from 'vue';
import TopToolBar from '../components/TopToolBar.vue';
import BottomToolBar from '../components/NavBar.vue';
import Video from '../components/Video.vue';
import MrzOrVinResult from '../components/MrzOrVinResult.vue';
import NumberOrLetterResult from '../components/NumberOrLetterResult.vue'
import Footer from '../components/Footer.vue';
import { LabelRecognizer } from 'dynamsoft-label-recognizer';
import { CameraEnhancer } from 'dynamsoft-camera-enhancer';
import { CodeParser } from "shen-dynamsoft-code-parser";

export default defineComponent({
    setup() {
        const saveAs = require('file-saver');
        const runtimeMode = inject('runtimeMode') as Ref<string>;
        // Controls whether to display local image recognition
        const bShowStaticImg = ref(false);
        const bShowResults = ref(false);
        const bShowNumOrLetResults = ref(false);
        // The current operating mode is obtained
        const bShowScanningPrompt = ref(false);
        // Result
        const recognizeResultInfo = ref([] as Array<string>);
        const cameraList = ref([]);
        const bShowCameraList = ref(false);
        const bShowModeList = ref(false);
        const bShowSettingList = ref(false);
        const bShowImgRecMethodList = ref(false);
        const recognizerFrame = ref(Element);
        const parseResultInfo = ref([]);
        const recognizerCount = ref(0);
        const cameraEnhancer = ref(null) as Ref<any> as Ref<CameraEnhancer>
        const recognizer = ref(null) as Ref<any> as Ref<LabelRecognizer>;
        const parser = ref(null) as Ref<any> as Ref<CodeParser>;
        const bNeedPlaySound = ref(true) as Ref<boolean>;
        const visibleRegionInPixels = ref(null) as Ref<any>;
        const currentResolution = ref([]) as any;
        const clientWidth = ref(document.body.clientWidth) as any;
        const clientHeight = ref(document.body.clientHeight) as any;
        const cameraIsExists = ref(true) as Ref<boolean>;
        const bOpen = ref(false) as Ref<Boolean>;
        const { proxy } = getCurrentInstance() as any;
        let downloadImg: {name: string, blob: Blob}[] = [];

        const setRegion = async () => {
            cameraEnhancer.value.setScanRegion(await region.value);
        }

        const regionEdgeLength = computed(()=>{
            if(!cameraEnhancer.value || !cameraEnhancer.value.isOpen()) return 0;
            visibleRegionInPixels.value = cameraEnhancer.value.getVisibleRegion(true);
            const visibleRegionWidth = visibleRegionInPixels.value.regionRight - visibleRegionInPixels.value.regionLeft;
            const visibleRegionHeight = visibleRegionInPixels.value.regionBottom - visibleRegionInPixels.value.regionTop;
            let regionEdgeLength = 0.4 * Math.min(visibleRegionWidth, visibleRegionHeight);
            return Math.round(regionEdgeLength);
        })

        const regionLeft = computed(()=>{
            if(!cameraEnhancer.value || !cameraEnhancer.value.isOpen()) return 0;
            visibleRegionInPixels.value = cameraEnhancer.value.getVisibleRegion(true);
            currentResolution.value = cameraEnhancer.value.getResolution();
            const vw = currentResolution.value[0];
            const visibleRegionWidth = visibleRegionInPixels.value.regionRight - visibleRegionInPixels.value.regionLeft;
            let left = 0.5-regionEdgeLength.value/vw/2;
            if (runtimeMode.value === "mrz") {
                if (clientWidth.value > clientHeight.value) {
                    left = Math.round((left-0.2*visibleRegionWidth/vw) * 100);
                } else {
                    left = Math.round((left-0.25*visibleRegionWidth/vw) * 100);
                }
            } else if(runtimeMode.value === "vin") {
                if (clientWidth.value > clientHeight.value) {
                    left = Math.round((left-0.2*visibleRegionWidth/vw) * 100);
                } else {
                    left = Math.round((left-0.25*visibleRegionWidth/vw) * 100);
                }
            } else {
                left = Math.round(left * 100);
            }
            left = left<0||left>=50?0:left;
            return left;
        })

        const regionTop = computed(()=>{
            if(!cameraEnhancer.value || !cameraEnhancer.value.isOpen()) return 0;
            visibleRegionInPixels.value = cameraEnhancer.value.getVisibleRegion(true);
            currentResolution.value = cameraEnhancer.value.getResolution();
            const vh = currentResolution.value[1];
            const visibleRegionHeight = visibleRegionInPixels.value.regionBottom - visibleRegionInPixels.value.regionTop;
            let top = 0.5-regionEdgeLength.value/vh/2;
            if (runtimeMode.value === "mrz") {
                if (clientWidth.value > clientHeight.value) {
                    top = Math.round((top + 0.08*visibleRegionHeight/vh)*100);
                } else {
                    top = Math.round((top + 0.08*visibleRegionHeight/vh)*100);
                }
                top = top<0||top>=40?40:top;
            } else if(runtimeMode.value === "vin") {
                if (clientWidth.value > clientHeight.value) {
                    top = Math.round((top + 0.15*visibleRegionHeight/vh) * 100);
                } else {
                    top = Math.round((top + 0.15*visibleRegionHeight/vh) * 100);
                }
                top = top<0||top>=45?45:top;
            } else {
                top = Math.round(top * 100);
            }
            return top;
        })

        const region = computed(async()=>{
            let region = {
                regionLeft: regionLeft.value,
                regionRight: 100 - regionLeft.value,
                regionTop: regionTop.value,
                regionBottom: 100 - regionTop.value,
                regionMeasuredByPercentage: 1,
            };
            return region;
        })

        provide('recognizer', recognizer);
        provide('cameraEnhancer', cameraEnhancer);
        provide('parser', parser);
        provide('cameraList', cameraList);
        provide('recognizeResultInfo', recognizeResultInfo);
        provide('bShowStaticImg', bShowStaticImg);
        provide('bShowResults', bShowResults);
        provide('bShowCameraList', bShowCameraList);
        provide('bShowModeList', bShowModeList);
        provide('bShowSettingList', bShowSettingList);
        provide('bShowImgRecMethodList', bShowImgRecMethodList);
        provide('bShowScanningPrompt', bShowScanningPrompt);
        provide('recognizerFrame', recognizerFrame);
        provide('parseResultInfo', parseResultInfo);
        provide('recognizerCount', recognizerCount);
        provide('bShowNumOrLetResults', bShowNumOrLetResults);
        provide('bNeedPlaySound', bNeedPlaySound);
        provide('cameraIsExists', cameraIsExists);
        provide('bOpen', bOpen);
        provide('setRegion', setRegion);
        
        return () => (
            <div class="labelRecognizer">  
                { !bShowStaticImg.value && <TopToolBar />}
                <Video />
                { bShowResults.value && <MrzOrVinResult /> }
                { bShowNumOrLetResults.value && <NumberOrLetterResult /> }
                { !bShowStaticImg.value && <BottomToolBar />}
                <Footer />
            </div>
        )
    },
})
</script>

<style lang="scss" scoped>
.labelRecognizer {
    overflow: auto;
    width: 100%;
    height: 100%;
}
</style>