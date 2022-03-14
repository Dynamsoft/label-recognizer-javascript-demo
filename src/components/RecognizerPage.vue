<script lang="tsx">
import { defineComponent, provide, reactive, ref, Ref } from 'vue';
import TopToolBar from './child-components/TopToolBar.vue';
import BottomToolBar from './child-components/NavBar.vue';
import Video from './child-components/Video.vue';
import ImgRecognizer from './child-components/ImgRecognizer.vue';
import MrzOrVinResult from './child-components/MrzOrVinResult.vue';
import NumberOrLetterResult from './child-components/NumberOrLetterReault.vue'
import Footer from './Footer.vue';
import { LabelRecognizer } from 'dynamsoft-label-recognizer'

export default defineComponent({
    setup() {
        // Controls whether to display local image recognition
        const isShowStaticImg = ref(false);
        const isShowResults = ref(false);
        const isShowNumOrLetResults = ref(false);
        // The current operating mode is obtained
        const isShowScanningPrompt = ref(false);
        // Result
        const recognizeResultInfo = ref([] as Array<string>);
        const recognizeImg = ref(null);
        const cameraList = ref([]);
        const recognizeImgInfo = ref(null as any as File);
        const isShowCameraList = ref(false);
        const isShowModeList = ref(false);
        const isShowSettingList = ref(false);
        const isPlaySound = ref(true);
        const isShowImgRecMethodList = ref(false);
        const recognizerFrame = ref(Element);
        const parseResultInfo = ref([]);
        const recognizerCount = ref(0);
        const recognizer = ref(null) as Ref<any> as Ref<LabelRecognizer>;

        
        const setRegion = async (first1: number,first2: number, second1: number, second2: number, third1: number, third2: number, fourth1: number, fourth2: number) => {
            const r = recognizer.value;
            let settings = JSON.parse(await r.outputRuntimeSettingsToString());
            const lz = settings.ReferenceRegionArray[0].Localization;
            lz.FirstPoint[0] = first1;
            lz.FirstPoint[1] = first2;
            lz.SecondPoint[0] = second1;
            lz.SecondPoint[1] = second2;
            lz.ThirdPoint[0] = third1;
            lz.ThirdPoint[1] = third2;
            lz.FourthPoint[0] = fourth1;
            lz.FourthPoint[1] = fourth2;
            await r.updateRuntimeSettingsFromString(JSON.stringify(settings));  
        }

        provide('recognizer', recognizer);
        provide('cameraList', cameraList);
        provide('recognizeResultInfo', recognizeResultInfo);
        provide('recognizeImg', recognizeImg);
        provide('recognizeImgInfo', recognizeImgInfo);
        provide('isShowStaticImg', isShowStaticImg);
        provide('isShowResults', isShowResults);
        provide('isShowCameraList', isShowCameraList);
        provide('isShowModeList', isShowModeList);
        provide('isShowSettingList', isShowSettingList);
        provide('isPlaySound', isPlaySound);
        provide('isShowImgRecMethodList', isShowImgRecMethodList);
        provide('isShowScanningPrompt', isShowScanningPrompt);
        provide('recognizerFrame', recognizerFrame);
        provide('parseResultInfo', parseResultInfo);
        provide('recognizerCount', recognizerCount);
        provide('isShowNumOrLetResults', isShowNumOrLetResults);

        provide('setRegion', setRegion);

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
    width: 100%;
    height: 100%;
}
</style>