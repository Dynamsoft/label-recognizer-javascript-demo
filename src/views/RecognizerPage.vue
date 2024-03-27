<script lang="tsx">
import { computed, defineComponent, inject, provide, ref, Ref, getCurrentInstance, watch } from "vue";
import TopToolBar from "../components/TopToolBar.vue";
import BottomToolBar from "../components/NavBar.vue";
import Video from "../components/Video.vue";
import MrzOrVinResult from "../components/MrzOrVinResult.vue";
import NumberOrLetterResult from "../components/NumberOrLetterResult.vue";
import Footer from "../components/Footer.vue";
import { LabelRecognizer } from "dynamsoft-label-recognizer";
import { CameraEnhancer } from "dynamsoft-camera-enhancer";
import { CodeParser, ParsedResultItem } from "dynamsoft-code-parser";
import { Router, useRouter } from "vue-router";
import { MobileOutlined } from '@ant-design/icons-vue';
import { formatModeName } from "@/util";
import { handleParseReuslt } from "@/handleMrzAndVinResult";

export default defineComponent({
  setup() {
    const mrzSampleImg = require('@/assets/sampleImg/passport.png');
    const vinSampleImg = require('@/assets/sampleImg/vin.png');
    const runtimeMode: Ref<string> = inject("runtimeMode")!;
    const bShowImgRecognitionMask: Ref<boolean> = inject('bShowImgRecognitionMask')!;
    // Controls whether to display local image recognition
    const bShowMrzOrVinResult: Ref<boolean> = ref(false);
    const bShowNumOrLetResult: Ref<boolean> = ref(false);
    // The current operating mode is obtained
    const bShowScanningPrompt: Ref<boolean> = ref(false);
    // Result
    const recognizeResultInfo: Ref<Array<string>> = ref([]);
    const cameraList: Ref<Array<{ deviceId: string; label: string }>> = ref([]);
    const cameraId: Ref<string> = ref("");
    const cameraLabel: Ref<string> = ref("");
    const resolution: Ref<"HD" | "FULL HD"> = ref("FULL HD");
    const bShowCameraList: Ref<boolean> = ref(false);
    const bShowModeList: Ref<boolean> = ref(false);
    const bShowSettingList: Ref<boolean> = ref(false);
    const bShowImgRecMethodList: Ref<boolean> = ref(false);
    const recognizerFrame: Ref<HTMLImageElement | HTMLCanvasElement | undefined> = ref();
    const parseResultInfo: Ref<{ [key: string]: any }> = ref({});
    const recognizerCount: Ref<number> = ref(0);
    const cameraEnhancer: Ref<CameraEnhancer|null> = ref(null);
    const recognizer: Ref<LabelRecognizer|null> = ref(null);
    const parser: Ref<CodeParser|null> = ref(null);
    const bNeedPlaySound: Ref<boolean> = ref(true);
    const visibleRegionInPixels: Ref<any> = ref(null);
    const currentResolution: Ref<Array<number>> = ref([]);
    const cameraIsExists: Ref<boolean> = ref(true);
    const bOpenCamera: Ref<Boolean> = ref(false);
    const mrzGuideBoxInset: Ref<string> = ref("");
    const router: Router = useRouter();
    const { proxy }: any = getCurrentInstance();
    let timer: any;

    const setRegion = () => {
      cameraEnhancer.value?.setScanRegion(region.value);
    };

    watch(runtimeMode, async () => {
      setRegion();
      bShowModeList.value = false;
      bShowMrzOrVinResult.value = false;
      bShowNumOrLetResult.value = false;
      cameraEnhancer.value!.ifShowScanRegionMask = !(runtimeMode.value === "mrz");
      cameraEnhancer.value!.ifShowScanRegionLaser = !(runtimeMode.value === "mrz");
      document.title = `${runtimeMode.value === "mrz" ? "MRZ Scanner" : "VIN Scanner (Beta)"} | Dynamsoft Label Recognizer`;
      if (runtimeMode.value === 'mrz') {
        router.push(`mrz-scanner.html` + location.search);
      } else {
        router.push(`vin.html` + location.search);
      }
      await recognizer.value?.updateRuntimeSettingsFromString(runtimeMode.value);
      if(cameraIsExists.value) {
        recognizer.value?.pauseScanning();
        if (runtimeMode.value === "mrz") {
          const settingsStr = await recognizer.value?.outputRuntimeSettingsToString();
          if(settingsStr) {
            const settings = JSON.parse(settingsStr);
            settings.LabelRecognizerParameterArray[0].LineStringRegExPattern = settings.TextAreaArray[0].LineStringRegExPattern = settings.LineSpecificationArray[0].LineStringRegExPattern = "([ACI][A-Z<][A-Z][A-Z<]{2}[A-Z0-9<]{9}[0-9<][A-Z0-9<]{15}){(30)}|([0-9<]{6}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z][A-Z<]{2}[A-Z0-9<]{11}[0-9]){(30)}|([A-Z][A-Z<]{29}){(30)}|([ACIV][A-Z<][A-Z][A-Z<]{33}){(36)}|([A-Z0-9<]{9}[0-9][A-Z][A-Z<]{2}[0-9<]{6}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{8}){(36)}|(I[A-Z<]FRA[A-Z<]{25}[A-Z0-9<]{6}){(36)}|([A-Z0-9<]{12}[0-9][A-Z<]{14}[0-9]{2}[(01-12)][(01-31)][0-9][MF<][0-9]){(36)}|([PV][A-Z<][A-Z][A-Z<]{41}){(44)}|([A-Z0-9<]{9}[0-9][A-Z][A-Z<]{2}[0-9<]{6}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{14}[0-9<][0-9]){(44)}|([A-Z0-9<]{9}[0-9][A-Z][A-Z<]{2}[0-9<]{6}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{14}[A-Z0-9<]{2}){(44)}";
            settings.TextAreaArray[0].FirstPoint = [0, 66];
            settings.TextAreaArray[0].SecondPoint = [100, 66];
            await recognizer.value?.updateRuntimeSettingsFromString(settings, true);
          }
        }
        bShowScanningPrompt.value = true;
        timer && clearTimeout(timer);
        timer = setTimeout(() => {
          bShowScanningPrompt.value = false;
        }, 5000)
        if (runtimeMode.value === 'mrz' && document.body.clientWidth < 980) {
          proxy.$message.open({
            content: 'Rotate your device',
            duration: 3,
            icon: <MobileOutlined spin style={{ color: "#FE8E14" }} />
          });
        }
      }
      proxy.$message.success(`Switched to ${runtimeMode.value === 'mrz' ? 'MRZ Scanner' : formatModeName(runtimeMode.value) + ' mode'} successfully!`);
      recognizer.value?.resumeScanning();
    })

    const regionEdgeLength = computed(() => {
      if (!cameraEnhancer.value || !cameraEnhancer.value.isOpen()) return 0;
      visibleRegionInPixels.value = cameraEnhancer.value.getVisibleRegion(true);
      const visibleRegionWidth =
        visibleRegionInPixels.value.regionRight - visibleRegionInPixels.value.regionLeft;
      const visibleRegionHeight =
        visibleRegionInPixels.value.regionBottom - visibleRegionInPixels.value.regionTop;
      let regionEdgeLength = 0.4 * Math.min(visibleRegionWidth, visibleRegionHeight);
      return Math.round(regionEdgeLength);
    });

    const regionLeft = computed(() => {
      if (!cameraEnhancer.value || !cameraEnhancer.value.isOpen()) return 0;
      visibleRegionInPixels.value = cameraEnhancer.value.getVisibleRegion(true);
      currentResolution.value = cameraEnhancer.value.getResolution();
      const vw = currentResolution.value[0];
      const visibleRegionWidth =
        visibleRegionInPixels.value.regionRight - visibleRegionInPixels.value.regionLeft;
      let left = 0.5 - regionEdgeLength.value / vw / 2;
      if (runtimeMode!.value === "mrz") {
        let regionCssW;
        // 1.77 is the aspect ratio of 'mrz-guide-box.svg'
        if (document.body.clientWidth > document.body.clientHeight * 1.77) {
          let regionCssH = document.body.clientHeight * 0.75;
          regionCssW = regionCssH * 1.77;
        } else {
          regionCssW = document.body.clientWidth * 0.8;
        }
        regionCssW = Math.min(regionCssW, 800);
        const regionWidthInPixel =
          (visibleRegionWidth / document.body.clientWidth) * regionCssW;
        left = ((vw - regionWidthInPixel) / 2 / vw) * 100;
        left = Math.round(left);
      } else if (runtimeMode!.value === "vin") {
        if (document.body.clientWidth > document.body.clientHeight) {
          left = Math.round((left - (0.2 * visibleRegionWidth) / vw) * 100);
        } else {
          left = Math.round((left - (0.25 * visibleRegionWidth) / vw) * 100);
        }
        left = left < 0 || left >= 50 ? 0 : left;
      } else {
        left = Math.round(left * 100);
        left = left < 0 || left >= 50 ? 0 : left;
      }
      return left;
    });

    const regionTop = computed(() => {
      if (!cameraEnhancer.value || !cameraEnhancer.value.isOpen()) return 0;
      visibleRegionInPixels.value = cameraEnhancer.value.getVisibleRegion(true);
      currentResolution.value = cameraEnhancer.value.getResolution();
      const vh = currentResolution.value[1];
      const visibleRegionHeight =
        visibleRegionInPixels.value.regionBottom - visibleRegionInPixels.value.regionTop;
      let top = 0.5 - regionEdgeLength.value / vh / 2;
      if (runtimeMode!.value === "mrz") {
        const vw = currentResolution.value[0];
        const regionWidthInPixel = vw - (regionLeft.value * 2 * vw) / 100;
        const regionHeightInPixel = regionWidthInPixel / 1.77; // 1.77 is the aspect ratio of 'mrz-guide-box.svg'
        top = ((vh - regionHeightInPixel) / 2 / vh) * 100;
        top = Math.round(top);
      } else if (runtimeMode!.value === "vin") {
        if (document.body.clientWidth > document.body.clientHeight) {
          top = Math.round((top + (0.15 * visibleRegionHeight) / vh) * 100);
        } else {
          top = Math.round((top + (0.15 * visibleRegionHeight) / vh) * 100);
        }
        top = top < 0 || top >= 45 ? 45 : top;
      } else {
        top = Math.round(top * 100);
      }
      return top;
    });

    const region = computed(() => {
      if (cameraEnhancer.value?.isOpen()) {
        const resolution = cameraEnhancer.value.getResolution();
        const vw = resolution[0],
          vh = resolution[1];
        const pointRelatedToVideo = {
          x: (vw * regionLeft.value) / 100,
          y: (vh * regionTop.value) / 100,
        };

        const pointRelatedToView = cameraEnhancer.value.convertToClientCoordinates(
          pointRelatedToVideo
        );
        const left =
            Math.round((pointRelatedToView.x / document.body.clientWidth) * 100) + "%",
          top =
            Math.round((pointRelatedToView.y / document.body.clientHeight) * 100) + "%";
        mrzGuideBoxInset.value = `${top} ${left}`;
      } else {
        mrzGuideBoxInset.value = "";
      }

      let region = {
        regionLeft: regionLeft.value,
        regionRight: 100 - regionLeft.value,
        regionTop: regionTop.value,
        regionBottom: 100 - regionTop.value,
        regionMeasuredByPercentage: 1,
      };
      return region;
    });

    const uploadImg = async (event: any, bUploadSampleImage: boolean) => {
      let imgRecognizer: LabelRecognizer|null = null;
      try {
        bShowImgRecognitionMask.value = true;
        recognizer.value?.pauseScanning();
        imgRecognizer = await LabelRecognizer.createInstance({ runtimeSettings: runtimeMode.value });
        if (runtimeMode.value === "mrz") {
          const settings = JSON.parse(await imgRecognizer.outputRuntimeSettingsToString());
          settings.LabelRecognizerParameterArray[0].BinarizationModes[1] = { Mode: 'BM_THRESHOLD' };
          settings.LabelRecognizerParameterArray[0].LineStringRegExPattern = settings.TextAreaArray[0].LineStringRegExPattern = settings.LineSpecificationArray[0].LineStringRegExPattern = "([ACI][A-Z<][A-Z][A-Z<]{2}[A-Z0-9<]{9}[0-9<][A-Z0-9<]{15}){(30)}|([0-9<]{6}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z][A-Z<]{2}[A-Z0-9<]{11}[0-9]){(30)}|([A-Z][A-Z<]{29}){(30)}|([ACIV][A-Z<][A-Z][A-Z<]{33}){(36)}|([A-Z0-9<]{9}[0-9][A-Z][A-Z<]{2}[0-9<]{6}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{8}){(36)}|(I[A-Z<]FRA[A-Z<]{25}[A-Z0-9<]{6}){(36)}|([A-Z0-9<]{12}[0-9][A-Z<]{14}[0-9]{2}[(01-12)][(01-31)][0-9][MF<][0-9]){(36)}|([PV][A-Z<][A-Z][A-Z<]{41}){(44)}|([A-Z0-9<]{9}[0-9][A-Z][A-Z<]{2}[0-9<]{6}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{14}[0-9<][0-9]){(44)}|([A-Z0-9<]{9}[0-9][A-Z][A-Z<]{2}[0-9<]{6}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{14}[A-Z0-9<]{2}){(44)}";
          settings.TextAreaArray[0].FirstPoint = [0, 0];
          settings.TextAreaArray[0].SecondPoint = [100, 0];
          await imgRecognizer.updateRuntimeSettingsFromString(settings, true);
        }
        bShowImgRecMethodList.value = false;
        let file: File;
        let img: HTMLImageElement;
        let imgSrc: any = runtimeMode.value === 'mrz' ? mrzSampleImg : vinSampleImg;
        if (!bUploadSampleImage) {
          file = event.target.files[0];
          const fr = new FileReader();
          imgSrc = await new Promise((rs, rj) => {
            fr.readAsDataURL(file);
            fr.onload = function () {
              rs(this.result);
            }
          });
        }
        img = new Image();
        await new Promise((rs, rj) => {
          img.onload = rs;
          img.onerror = rj;
          img.src = imgSrc;
        })
        let result = await imgRecognizer.recognize(img);
        if (result.length === 0) {
          proxy.$message.error('No Result Found!');
          recognizer.value?.resumeScanning();
        } else {
          recognizerFrame!.value = img;
          let resultArr: Array<string> = [];
          result[0].lineResults.forEach((res: any) => {
            resultArr.push(res.text);
          })
          let parseResultInfo: ParsedResultItem = await parser.value!.parse(resultArr.join(""));
          parseResultInfo = handleParseReuslt(parseResultInfo, runtimeMode.value);
          if (JSON.stringify(parseResultInfo) === "{}") {
            proxy.$message.error('Parse Failed!');
          }
          showResult(parseResultInfo, resultArr);
        }
      } catch {
        recognizer.value?.resumeScanning();
        proxy.$message.error('No recognizable content found!');
      } finally {
        event.target.value = "";
        bShowImgRecognitionMask.value = false;
        imgRecognizer?.destroyContext();
      }
    };

    const showResult = (parseResult: object, resultArr: Array<string>) => {
      recognizeResultInfo.value = resultArr;
      parseResultInfo.value = parseResult;
      bShowScanningPrompt.value = false;
      bShowImgRecMethodList.value = false;
      bShowMrzOrVinResult.value = true;
    }

    provide("recognizer", recognizer);
    provide("cameraEnhancer", cameraEnhancer);
    provide("parser", parser);
    provide("cameraList", cameraList);
    provide("cameraId", cameraId);
    provide("cameraLabel", cameraLabel);
    provide("resolutionList", ["HD", "FULL HD"]);
    provide("resolution", resolution);
    provide("recognizeResultInfo", recognizeResultInfo);
    provide("bShowMrzOrVinResult", bShowMrzOrVinResult);
    provide("bShowCameraList", bShowCameraList);
    provide("bShowModeList", bShowModeList);
    provide("bShowSettingList", bShowSettingList);
    provide("bShowImgRecMethodList", bShowImgRecMethodList);
    provide("bShowScanningPrompt", bShowScanningPrompt);
    provide("recognizerFrame", recognizerFrame);
    provide("parseResultInfo", parseResultInfo);
    provide("recognizerCount", recognizerCount);
    provide("bShowNumOrLetResult", bShowNumOrLetResult);
    provide("bNeedPlaySound", bNeedPlaySound);
    provide("cameraIsExists", cameraIsExists);
    provide("bOpenCamera", bOpenCamera);
    provide("setRegion", setRegion);
    provide("uploadImg", uploadImg);
    provide("showResult", showResult);
    provide("mrzGuideBoxInset", mrzGuideBoxInset);

    return () => (
      <div class="labelRecognizer">
        <TopToolBar />
        <Video />
        { bShowMrzOrVinResult.value && <MrzOrVinResult /> }
        { bShowNumOrLetResult.value && <NumberOrLetterResult /> }
        <BottomToolBar />
        <Footer />
      </div>
    );
  },
});
</script>

<style lang="scss" scoped>
.labelRecognizer {
  overflow: auto;
  width: 100%;
  height: 100%;
}
</style>
