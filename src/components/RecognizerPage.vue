<script lang="tsx">
import { computed, defineComponent, inject, provide, ref, Ref } from 'vue';
import TopToolBar from './child-components/TopToolBar.vue';
import BottomToolBar from './child-components/NavBar.vue';
import Video from './child-components/Video.vue';
import ImgRecognizer from './child-components/ImgRecognizer.vue';
import MrzOrVinResult from './child-components/MrzOrVinResult.vue';
import NumberOrLetterResult from './child-components/NumberOrLetterReault.vue'
import Footer from './Footer.vue';
import { LabelRecognizer } from 'dynamsoft-label-recognizer';
import { CameraEnhancer } from 'dynamsoft-camera-enhancer';

export default defineComponent({
    setup() {
        const runtimeMode = inject('runtimeMode') as Ref<string>;
        // Controls whether to display local image recognition
        const isShowStaticImg = ref(false);
        const isShowResults = ref(false);
        const isShowNumOrLetResults = ref(false);
        // The current operating mode is obtained
        const isShowScanningPrompt = ref(false);
        // Result
        const recognizeResultInfo = ref([] as Array<string>);
        const recognizeImg = ref(null) as Ref<any> as Ref<LabelRecognizer>;
        const cameraList = ref([]);
        const recognizeImgInfo = ref(null as any as File);
        const isShowCameraList = ref(false);
        const isShowModeList = ref(false);
        const isShowSettingList = ref(false);
        const isShowImgRecMethodList = ref(false);
        const recognizerFrame = ref(Element);
        const parseResultInfo = ref([]);
        const recognizerCount = ref(0);
        const cameraEnhancer = ref(null) as Ref<any> as Ref<CameraEnhancer>
        const recognizer = ref(null) as Ref<any> as Ref<LabelRecognizer>;
        const isNeedPlaySound = ref(true) as Ref<boolean>;
        const visibleRegionInPixels = ref(null) as Ref<any>;
        const currentResolution = ref([]) as any;
        const clientWidth = ref(document.body.clientWidth) as any;
        const clientHeight = ref(document.body.clientHeight) as any;
        const cameraIsExists = ref(true) as Ref<boolean>;

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
        provide('cameraList', cameraList);
        provide('recognizeResultInfo', recognizeResultInfo);
        provide('recognizeImg', recognizeImg);
        provide('recognizeImgInfo', recognizeImgInfo);
        provide('isShowStaticImg', isShowStaticImg);
        provide('isShowResults', isShowResults);
        provide('isShowCameraList', isShowCameraList);
        provide('isShowModeList', isShowModeList);
        provide('isShowSettingList', isShowSettingList);
        provide('isShowImgRecMethodList', isShowImgRecMethodList);
        provide('isShowScanningPrompt', isShowScanningPrompt);
        provide('recognizerFrame', recognizerFrame);
        provide('parseResultInfo', parseResultInfo);
        provide('recognizerCount', recognizerCount);
        provide('isShowNumOrLetResults', isShowNumOrLetResults);
        provide('isNeedPlaySound', isNeedPlaySound);
        provide('setRegion', setRegion);
        provide('cameraIsExists', cameraIsExists);

        return () => (
            <div class="labelRecognizer">  
                { !isShowStaticImg.value && <TopToolBar />}
                { isShowStaticImg.value ?  <ImgRecognizer /> : <Video /> }
                { isShowResults.value && <MrzOrVinResult /> }
                { isShowNumOrLetResults.value && <NumberOrLetterResult /> }
                { !isShowStaticImg.value && <BottomToolBar />}
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