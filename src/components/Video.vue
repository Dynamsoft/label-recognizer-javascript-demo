<script lang="tsx">
import { defineComponent, inject, ref, Ref, onBeforeUnmount, getCurrentInstance, onMounted, onBeforeMount } from 'vue';
import { LabelRecognizer, DLRLineResult, DLRResult } from 'dynamsoft-label-recognizer';
import { CameraEnhancer, DrawingItem, PlayCallbackInfo } from 'dynamsoft-camera-enhancer';
import { CodeParser } from "dynamsoft-code-parser";
import { handleParseReuslt } from '../handleMrzAndVinResult';
import { MobileOutlined } from '@ant-design/icons-vue';
import NoCameraPage from './NoCameraPage.vue';

const formatModeName = (str: string) => {
  switch (str) {
    case 'mrz':
      return 'MRZ code'
    case 'vin':
      return 'VIN number'
    case 'number':
      return 'numbers'
    case 'letter':
      return 'letters'
    default:
      break;
  }
}

export const judgeResolution = (width: number, height: number): "HD" | "FULL HD" => {
  const minValue = Math.min(width, height);
  const maxValue = Math.max(width, height);
  return minValue > 480 && minValue < 960 && maxValue > 960 && maxValue < 1440 ? "HD" : "FULL HD";
};

export default defineComponent({
  setup() {
    const torchIconClose = require('@/assets/image/torch-icon-close.svg');
    const torchIconOpen = require('@/assets/image/torch-icon-open.svg');
    const mrzGuideBox = require('@/assets/image/mrz-guide-box.svg');
    const recognizeResultInfo: Ref<Array<string>> = inject('recognizeResultInfo')!;
    const recognizer: Ref<LabelRecognizer | null> = inject('recognizer')!;
    const cameraEnhancer: Ref<CameraEnhancer | null> = inject('cameraEnhancer')!;
    const parser: Ref<CodeParser> = inject('parser')!;
    const cameraList: Ref<Array<{ deviceId: string, label: string }>> = inject('cameraList')!;
    const cameraId: Ref<string> = inject('cameraId')!;
    const cameraLabel: Ref<string> = inject('cameraLabel')!;
    const resolution: Ref<"HD" | "FULL HD"> = inject('resolution')!;
    const bShowMrzOrVinResult: Ref<boolean> = inject('bShowMrzOrVinResult')!;
    const bShowNumOrLetResult: Ref<boolean> = inject('bShowNumOrLetResult')!;
    const bShowCameraList: Ref<boolean> = inject('bShowCameraList')!;
    const bShowModeList: Ref<boolean> = inject('bShowModeList')!;
    const bShowSettingList:Ref<boolean> = inject('bShowSettingList')!;
    const bShowImgRecMethodList: Ref<boolean> = inject('bShowImgRecMethodList')!;
    const bShowScanningPrompt: Ref<boolean> = inject('bShowScanningPrompt')!;
    const recognizerFrame: Ref<HTMLImageElement | HTMLCanvasElement> = inject('recognizerFrame')!;
    const runtimeMode: Ref<string> = inject('runtimeMode')!;
    const bNeedPlaySound: Ref<boolean> = inject('bNeedPlaySound')!;
    const cameraIsExists: Ref<boolean> = inject('cameraIsExists')!;
    const bOpenCamera: Ref<boolean> = inject('bOpenCamera')!;
    const mrzGuideBoxInset: Ref<string> = inject('mrzGuideBoxInset')!;

    const setRegion: () => void = inject('setRegion')!;
    const showResult: (parseResult: object, resultArr: Array<string>) => void = inject("showResult")!;

    const bShowScanningText: Ref<boolean> = ref(false);
    const bShowTorch: Ref<boolean> = ref(document.body.clientWidth < 980);
    const elRefs: Ref<HTMLDivElement|undefined> = ref();
    const changeClientTimeoutId: Ref<any> = ref();
    const bIphone: Ref<Boolean> = ref(true);
    let video_OnWindowResize: () => Promise<void>;

    const { proxy }: any = getCurrentInstance();
    const bOpenTorch: Ref<boolean> = ref(false);
    let bSupportTorch: boolean = true;
    let bShowScreenShotBtn: boolean = false;

    runtimeMode.value = location.pathname.indexOf('vin') === -1 ? 'mrz' : 'vin';
    document.title = `${runtimeMode.value === "mrz" ? "MRZ Scanner" : "VIN Scanner (Beta)"} | Dynamsoft Label Recognizer`;

    onBeforeMount(async () => {
      const environment = await CameraEnhancer.detectEnvironment();
      cameraIsExists.value = environment.camera;
      bIphone.value = (environment.OS === "iPhone" && environment.version < 17);
    })

    onMounted(async () => {
      parser.value = await CodeParser.createInstance();
      if (cameraIsExists.value) {
        cameraEnhancer.value = await CameraEnhancer.createInstance();
        cameraEnhancer.value.ifShowScanRegionMask = !(runtimeMode.value === "mrz");
        cameraEnhancer.value.ifShowScanRegionLaser = !(runtimeMode.value === "mrz");
        (window as any).dce = cameraEnhancer.value;
        await cameraEnhancer.value.setUIElement(elRefs.value!);
        if (resolution.value === "HD") {
          cameraEnhancer.value.setResolution(1280, 720);
        } else if (resolution.value === "FULL HD") {
          cameraEnhancer.value.setResolution(1920, 1080);
        }
        cameraEnhancer.value.on("played", (info: PlayCallbackInfo) => {
          const _cameraLabel = cameraEnhancer.value!.getSelectedCamera().label;
          const _resolution = judgeResolution(info.width, info.height);
          if (cameraId.value && (info.deviceId !== cameraId.value || _resolution !== resolution.value)) {
            proxy.$message.success(`Switched to ${_cameraLabel}(${_resolution}) successfully!`);
          }
          cameraId.value = info.deviceId;
          cameraLabel.value = _cameraLabel;
          resolution.value = _resolution;
        });

        video_OnWindowResize = async () => {
          changeClientTimeoutId.value && clearTimeout(changeClientTimeoutId.value);
          mrzGuideBoxInset.value = "";
          bShowScanningText.value = false;
          bShowTorch.value = false;
          recognizer.value!.pauseScanning();
          changeClientTimeoutId.value = setTimeout(() => {
            setRegion();
            if (bSupportTorch) bShowTorch.value = document.body.clientWidth < 980;
            bShowScanningText.value = true;
            if (!bShowMrzOrVinResult.value) {
              recognizer.value!.resumeScanning();
            }
          }, 500);
        }
        recognizer.value! = await LabelRecognizer.createInstance();
        (window as any).dlr = recognizer.value!;
        await recognizer.value!.setImageSource(cameraEnhancer.value, { resultsHighlightBaseShapes: DrawingItem });
        await recognizer.value!.updateRuntimeSettingsFromString(runtimeMode.value);
        if (runtimeMode.value === "mrz") {
          const settings = JSON.parse(await recognizer.value!.outputRuntimeSettingsToString());
          settings.LabelRecognizerParameterArray[0].BinarizationModes[1] = { Mode: 'BM_THRESHOLD' };
          settings.LabelRecognizerParameterArray[0].LineStringRegExPattern = settings.TextAreaArray[0].LineStringRegExPattern = settings.LineSpecificationArray[0].LineStringRegExPattern = "([ACI][A-Z<][A-Z][A-Z<]{2}[A-Z0-9<]{9}[0-9<][A-Z0-9<]{15}){(30)}|([0-9<]{6}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z][A-Z<]{2}[A-Z0-9<]{11}[0-9]){(30)}|([A-Z][A-Z<]{29}){(30)}|([ACIV][A-Z<][A-Z][A-Z<]{33}){(36)}|([A-Z0-9<]{9}[0-9][A-Z][A-Z<]{2}[0-9<]{6}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{8}){(36)}|(I[A-Z<]FRA[A-Z<]{25}[A-Z0-9<]{6}){(36)}|([A-Z0-9<]{12}[0-9][A-Z<]{14}[0-9]{2}[(01-12)][(01-31)][0-9][MF<][0-9]){(36)}|([PV][A-Z<][A-Z][A-Z<]{41}){(44)}|([A-Z0-9<]{9}[0-9][A-Z][A-Z<]{2}[0-9<]{6}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{14}[0-9<][0-9]){(44)}|([A-Z0-9<]{9}[0-9][A-Z][A-Z<]{2}[0-9<]{6}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{14}[A-Z0-9<]{2}){(44)}";
          settings.TextAreaArray[0].FirstPoint = [0, 66];
          settings.TextAreaArray[0].SecondPoint = [100, 66];
          await recognizer.value!.updateRuntimeSettingsFromString(settings, true);
        }
        cameraEnhancer.value.setVideoFit('cover');
        recognizer.value!.ifSaveOriginalImageInACanvas = true;
        window.addEventListener('resize', video_OnWindowResize);

        recognizer.value!.onImageRead = (results: DLRResult[]) => {
          if (results.length !== 0 && ["number", "letter"].includes(runtimeMode.value)) {
            let resultArr: Array<string> = [];
            results[0].lineResults.forEach((res: DLRLineResult) => {
              resultArr.push(res.text);
            })
            recognizeResultInfo.value = resultArr;
            bShowNumOrLetResult.value = true;
          }
        };

        recognizer.value!.onMRZRead = callbackMrzOrVinRecognition;
        recognizer.value!.onVINRead = callbackMrzOrVinRecognition;

        await recognizer.value.startScanning(false);
        bOpenCamera.value = true;
        setRegion();
        bShowScreenShotBtn = true;
        cameraList.value = await cameraEnhancer.value.getAllCameras();
        bShowScanningText.value = true;
        if (document.body.clientWidth < 980 && runtimeMode.value === 'mrz') {
          proxy.$message.open({
            content: 'Rotate your device',
            duration: 3,
            icon: <MobileOutlined spin style={{ color: "#FE8E14" }} />
          });
        }
      }
    })

    const callbackMrzOrVinRecognition = async (text: string, results: DLRLineResult[] | DLRLineResult) => {
      recognizerFrame.value = recognizer.value!.getOriginalImageInACanvas();
      let resultArr: Array<string> = [];
      if(runtimeMode.value === "mrz") {
        (results as DLRLineResult[]).forEach((res: any) => {
          resultArr.push(res.text);
        })
      } else if(runtimeMode.value === "vin") {
        resultArr.push(text);
      }
      let parseResultInfo = await parser.value.parse(resultArr.join(""));
      parseResultInfo = handleParseReuslt(parseResultInfo, runtimeMode.value);
      if (JSON.stringify(parseResultInfo) === "{}") {
        proxy.$message.error('Parse Failed!');
      }
      showResult(parseResultInfo, resultArr);
      bNeedPlaySound.value && recognizer.value!.beepSound.play();
      recognizer.value!.pauseScanning();
    }

    onBeforeUnmount(() => {
      window.removeEventListener('resize', video_OnWindowResize);
      cameraEnhancer.value?.dispose(false);
      recognizer.value?.destroyContext();
      cameraEnhancer.value = null;
      recognizer.value = null;
    })

    const closeAllList = () => {
      bShowCameraList.value = false;
      bShowModeList.value = false;
      bShowSettingList.value = false;
      bShowImgRecMethodList.value = false;
    }

    const openTorch = async () => {
      try {
        if (bOpenTorch.value) {
          await cameraEnhancer.value!.turnOffTorch();
          bOpenTorch.value = false;
        } else {
          await cameraEnhancer.value!.turnOnTorch();
          bOpenTorch.value = true;
        }
      } catch (ex: any) {
        proxy.$message.error(ex.message);
        bSupportTorch = false;
        bShowTorch.value = false;
        bOpenTorch.value = false;
      }
    }

    return () => (
      <>
        <div class="scanningPrompt" v-show={bShowScanningPrompt.value && bShowScanningText.value}>
            <div v-show={runtimeMode.value === 'vin'}>2C4RDGCG0FR805928</div>
            <div v-show={runtimeMode.value === 'letter'}>ABCDEFGHIJK....</div>
            <div v-show={runtimeMode.value === 'number'}>123456789...</div>
        </div>
        <div class="div-mrz-guide-box-container" v-show={runtimeMode.value === 'mrz' && mrzGuideBoxInset.value} style={{ inset: mrzGuideBoxInset.value }}>
          <img src={mrzGuideBox} class="mrz-guide-box" />
        </div>
        {cameraIsExists.value ? (
          <div class="container" ref={elRefs} onClick={closeAllList}>
            <svg class="dce-bg-loading" viewBox="0 0 1792 1792"><path d="M1760 896q0 176-68.5 336t-184 275.5-275.5 184-336 68.5-336-68.5-275.5-184-184-275.5-68.5-336q0-213 97-398.5t265-305.5 374-151v228q-221 45-366.5 221t-145.5 406q0 130 51 248.5t136.5 204 204 136.5 248.5 51 248.5-51 204-136.5 136.5-204 51-248.5q0-230-145.5-406t-366.5-221v-228q206 31 374 151t265 305.5 97 398.5z" /></svg>
            <svg class="dce-bg-camera" viewBox="0 0 2048 1792"><path d="M1024 672q119 0 203.5 84.5t84.5 203.5-84.5 203.5-203.5 84.5-203.5-84.5-84.5-203.5 84.5-203.5 203.5-84.5zm704-416q106 0 181 75t75 181v896q0 106-75 181t-181 75h-1408q-106 0-181-75t-75-181v-896q0-106 75-181t181-75h224l51-136q19-49 69.5-84.5t103.5-35.5h512q53 0 103.5 35.5t69.5 84.5l51 136h224zm-704 1152q185 0 316.5-131.5t131.5-316.5-131.5-316.5-316.5-131.5-316.5 131.5-131.5 316.5 131.5 316.5 316.5 131.5z" /></svg>
            <div class="dce-video-container"></div>
            <div class="dce-scanarea">
              <div class="bShowScanningText" v-show={bShowScanningText.value} style={{ top: runtimeMode.value === 'mrz' ? '-10%' : '-35%' }}>{`Align the frame within the ${formatModeName(runtimeMode.value)} and start scanning`}</div>
              <div class="dce-scanlight" style="display: none"></div>
              <img src={torchIconClose} class="torch-icon" v-show={bShowTorch.value && !bOpenTorch.value && !bIphone.value} onClick={openTorch} />
              <img src={torchIconOpen} class="torch-icon" v-show={bShowTorch.value && bOpenTorch.value} onClick={openTorch} />
            </div>
            <div class="dlr-msg-poweredby">
              <svg viewBox="0 0 94 17">
                <g>
                  <path d="M0.9,14V4.3h2.3c0.6,0,1,0.1,1.4,0.3c0.3,0.2,0.6,0.5,0.7,0.9s0.2,0.8,0.2,1.4c0,0.5-0.1,0.9-0.2,1.3 C5.1,8.5,4.9,8.8,4.5,9.1C4.2,9.3,3.7,9.4,3.2,9.4H1.8V14H0.9z M1.8,8.7h1.2c0.4,0,0.7-0.1,1-0.2S4.3,8.2,4.4,8 c0.1-0.3,0.2-0.6,0.2-1.1c0-0.5,0-0.9-0.1-1.2C4.3,5.4,4.2,5.2,3.9,5.1S3.4,5,2.9,5H1.8V8.7z" /><path d="M8.1,14.1c-0.5,0-0.8-0.1-1.1-0.3s-0.5-0.5-0.6-0.9s-0.2-0.9-0.2-1.4V9.6c0-0.6,0.1-1,0.2-1.4 C6.5,7.8,6.7,7.5,7,7.3S7.6,7,8.1,7C8.6,7,9,7.1,9.2,7.3s0.5,0.5,0.6,0.9C9.9,8.5,9.9,9,9.9,9.6v1.9c0,0.6-0.1,1-0.2,1.4 c-0.1,0.4-0.3,0.7-0.6,0.9S8.6,14.1,8.1,14.1z M8.1,13.4c0.3,0,0.5-0.1,0.7-0.2C8.9,13,9,12.8,9,12.5c0-0.3,0-0.6,0-1v-2 c0-0.4,0-0.7,0-1C9,8.2,8.9,8,8.8,7.9C8.6,7.7,8.4,7.6,8.1,7.6c-0.3,0-0.5,0.1-0.7,0.2C7.3,8,7.2,8.2,7.2,8.5c0,0.3-0.1,0.6-0.1,1 v2c0,0.4,0,0.7,0.1,1c0,0.3,0.1,0.5,0.3,0.7C7.6,13.4,7.8,13.4,8.1,13.4z" /><path d="M12,14l-1.1-6.9h0.7l0.9,5.8l1.1-5.8h0.8l1.1,5.8l0.8-5.8H17L15.9,14H15l-1.1-5.6L12.8,14H12z" /><path d="M19.8,14.1c-0.4,0-0.8-0.1-1.1-0.3s-0.5-0.5-0.6-0.9c-0.1-0.4-0.2-0.9-0.2-1.6V9.6c0-0.7,0.1-1.2,0.2-1.6 c0.1-0.4,0.3-0.7,0.6-0.8C19,7,19.3,7,19.8,7c0.5,0,0.9,0.1,1.1,0.3c0.3,0.2,0.4,0.5,0.5,0.9c0.1,0.4,0.1,1,0.1,1.6v0.6h-2.8v1.2 c0,0.4,0,0.8,0.1,1.1c0.1,0.3,0.2,0.4,0.3,0.6s0.3,0.2,0.6,0.2c0.2,0,0.3,0,0.5-0.1c0.1-0.1,0.3-0.2,0.3-0.4s0.1-0.5,0.1-0.8v-0.5 h0.9V12c0,0.6-0.1,1.1-0.4,1.5S20.4,14.1,19.8,14.1z M18.8,9.9h1.9V9.4c0-0.4,0-0.7-0.1-0.9c0-0.3-0.1-0.5-0.3-0.6S20,7.6,19.8,7.6 c-0.2,0-0.4,0.1-0.6,0.2c-0.1,0.1-0.3,0.3-0.3,0.6c-0.1,0.3-0.1,0.7-0.1,1.1V9.9z" /><path d="M22.8,14V7.1h0.9V8c0.2-0.4,0.5-0.6,0.8-0.8C24.8,7.1,25,7,25.3,7c0,0,0,0,0.1,0s0.1,0,0.1,0v0.9 c-0.1,0-0.1,0-0.2-0.1c-0.1,0-0.2,0-0.2,0c-0.3,0-0.5,0.1-0.7,0.2c-0.2,0.1-0.4,0.3-0.6,0.6V14H22.8z" /><path d="M28,14.1c-0.4,0-0.8-0.1-1.1-0.3s-0.5-0.5-0.6-0.9c-0.1-0.4-0.2-0.9-0.2-1.6V9.6c0-0.7,0.1-1.2,0.2-1.6 c0.1-0.4,0.3-0.7,0.6-0.8C27.3,7,27.6,7,28,7c0.5,0,0.9,0.1,1.1,0.3c0.3,0.2,0.4,0.5,0.5,0.9c0.1,0.4,0.1,1,0.1,1.6v0.6H27v1.2 c0,0.4,0,0.8,0.1,1.1c0.1,0.3,0.2,0.4,0.3,0.6s0.3,0.2,0.6,0.2c0.2,0,0.3,0,0.5-0.1c0.1-0.1,0.3-0.2,0.3-0.4s0.1-0.5,0.1-0.8v-0.5 h0.9V12c0,0.6-0.1,1.1-0.4,1.5S28.7,14.1,28,14.1z M27,9.9H29V9.4c0-0.4,0-0.7-0.1-0.9c0-0.3-0.1-0.5-0.3-0.6S28.3,7.6,28,7.6 c-0.2,0-0.4,0.1-0.6,0.2c-0.1,0.1-0.3,0.3-0.3,0.6C27.1,8.6,27,9,27,9.5V9.9z" />
                  <path d="M32.6,14.1c-0.6,0-1-0.2-1.3-0.7c-0.3-0.4-0.4-1.2-0.4-2.2V9.9c0-0.6,0-1.1,0.1-1.6c0.1-0.4,0.2-0.8,0.5-1 c0.2-0.2,0.6-0.4,1-0.4C32.8,7,33,7,33.2,7.1c0.2,0.1,0.4,0.3,0.5,0.4V4.3h0.9V14h-0.9v-0.5c-0.1,0.2-0.3,0.3-0.5,0.4 C33,14,32.8,14.1,32.6,14.1z M32.7,13.4c0.2,0,0.4,0,0.5-0.1c0.2-0.1,0.3-0.2,0.5-0.3V8.1c-0.1-0.1-0.3-0.2-0.4-0.3 c-0.2-0.1-0.4-0.2-0.6-0.2c-0.4,0-0.6,0.2-0.8,0.5S31.8,9,31.8,9.6v1.6c0,0.5,0,0.9,0.1,1.2c0.1,0.3,0.1,0.6,0.3,0.7 C32.3,13.3,32.5,13.4,32.7,13.4z" /><path d="M40.5,14.1c-0.3,0-0.5-0.1-0.7-0.2c-0.2-0.1-0.4-0.3-0.5-0.4V14h-0.9V4.3h0.9v3.4c0.1-0.2,0.3-0.3,0.5-0.5 C40.1,7,40.3,7,40.6,7C41,7,41.2,7,41.4,7.2c0.2,0.2,0.4,0.4,0.5,0.6c0.1,0.3,0.2,0.6,0.2,0.9s0.1,0.7,0.1,1v1.5 c0,0.6,0,1.1-0.1,1.5c-0.1,0.4-0.3,0.8-0.5,1C41.3,14,41,14.1,40.5,14.1z M40.4,13.4c0.3,0,0.5-0.1,0.6-0.3 c0.1-0.2,0.2-0.4,0.3-0.8s0.1-0.7,0.1-1.2V9.7c0-0.5,0-0.8-0.1-1.1S41.1,8,41,7.9c-0.1-0.2-0.3-0.2-0.6-0.2c-0.2,0-0.4,0.1-0.6,0.2 c-0.2,0.1-0.3,0.2-0.5,0.4v4.7c0.1,0.1,0.3,0.3,0.5,0.4C40,13.4,40.2,13.4,40.4,13.4z" /><path d="M43.2,15.7V15c0.4,0,0.7,0,0.9-0.1c0.2-0.1,0.3-0.1,0.4-0.3c0.1-0.1,0.1-0.2,0.1-0.4c0-0.1,0-0.3-0.1-0.5 c0-0.2-0.1-0.4-0.2-0.6L43,7.1h0.9l1.2,5.9l1.2-5.9h0.9l-1.7,7.4c-0.1,0.3-0.2,0.5-0.3,0.7c-0.2,0.2-0.4,0.3-0.6,0.4 c-0.3,0.1-0.6,0.1-1,0.1H43.2z" /><path d="M50.6,14V4.3h2.1c0.7,0,1.2,0.1,1.6,0.4c0.4,0.2,0.6,0.6,0.8,1c0.2,0.4,0.2,0.9,0.2,1.5V11 c0,0.6-0.1,1.1-0.2,1.6s-0.4,0.8-0.8,1S53.5,14,52.8,14H50.6z M51.5,13.3h1.2c0.5,0,0.9-0.1,1.1-0.3s0.4-0.5,0.5-0.9 s0.1-0.8,0.1-1.3V7.2c0-0.5,0-0.9-0.1-1.2s-0.2-0.6-0.5-0.8S53.2,5,52.7,5h-1.2V13.3z" /><path d="M56.5,15.7V15c0.4,0,0.7,0,0.9-0.1c0.2-0.1,0.3-0.1,0.4-0.3c0.1-0.1,0.1-0.2,0.1-0.4c0-0.1,0-0.3-0.1-0.5 c0-0.2-0.1-0.4-0.2-0.6l-1.4-6.1h0.9l1.2,5.9l1.2-5.9h0.9l-1.7,7.4c-0.1,0.3-0.2,0.5-0.3,0.7s-0.4,0.3-0.6,0.4s-0.6,0.1-1,0.1H56.5 z" /><path d="M61.3,14V7.1h0.9v0.7c0.2-0.2,0.5-0.4,0.8-0.6C63.2,7,63.5,7,63.8,7C64,7,64.2,7,64.4,7.1s0.3,0.3,0.4,0.5 c0.1,0.2,0.1,0.5,0.1,0.8V14H64V8.6c0-0.4-0.1-0.6-0.2-0.8c-0.1-0.1-0.3-0.2-0.5-0.2c-0.2,0-0.4,0.1-0.6,0.2s-0.4,0.3-0.6,0.5V14 H61.3z" />
                  <path d="M67.4,14.1c-0.3,0-0.5-0.1-0.7-0.2c-0.2-0.1-0.4-0.3-0.5-0.6C66,13.1,66,12.8,66,12.6c0-0.4,0.1-0.7,0.2-0.9 s0.3-0.5,0.5-0.7c0.2-0.2,0.5-0.4,0.9-0.6c0.4-0.2,0.8-0.4,1.3-0.6V9.3c0-0.4,0-0.8-0.1-1c-0.1-0.2-0.1-0.4-0.3-0.5 c-0.1-0.1-0.3-0.2-0.5-0.2c-0.2,0-0.3,0-0.5,0.1c-0.1,0.1-0.3,0.2-0.3,0.4c-0.1,0.2-0.1,0.4-0.1,0.7V9l-0.9,0 c0-0.7,0.2-1.2,0.5-1.6C66.8,7.1,67.3,7,68,7c0.6,0,1.1,0.2,1.3,0.6c0.3,0.4,0.4,1,0.4,1.7v3.4c0,0.1,0,0.3,0,0.5 c0,0.2,0,0.4,0,0.5c0,0.2,0,0.3,0,0.4h-0.8c0-0.2-0.1-0.3-0.1-0.5c0-0.2,0-0.3-0.1-0.5c-0.1,0.3-0.3,0.5-0.5,0.7 S67.7,14.1,67.4,14.1z M67.6,13.4c0.2,0,0.3,0,0.5-0.1c0.1-0.1,0.3-0.2,0.4-0.3s0.2-0.3,0.3-0.4v-2.2c-0.3,0.2-0.6,0.3-0.9,0.5 c-0.2,0.1-0.4,0.3-0.6,0.4c-0.2,0.1-0.3,0.3-0.3,0.5s-0.1,0.4-0.1,0.6c0,0.4,0.1,0.6,0.2,0.8C67.2,13.3,67.4,13.4,67.6,13.4z" /><path d="M70.9,14V7.1h0.8v0.7c0.2-0.3,0.5-0.5,0.8-0.6c0.3-0.1,0.6-0.2,0.9-0.2c0.2,0,0.5,0.1,0.7,0.2s0.3,0.4,0.4,0.7 c0.2-0.3,0.5-0.5,0.8-0.7c0.3-0.2,0.6-0.2,0.9-0.2c0.2,0,0.4,0,0.6,0.1s0.3,0.3,0.4,0.5c0.1,0.2,0.2,0.5,0.2,0.9V14h-0.8V8.6 c0-0.4-0.1-0.7-0.2-0.8s-0.3-0.2-0.5-0.2c-0.2,0-0.4,0.1-0.7,0.2S74.7,8,74.5,8.3c0,0,0,0.1,0,0.1s0,0.1,0,0.1V14h-0.8V8.6 c0-0.4-0.1-0.7-0.2-0.8c-0.1-0.1-0.3-0.2-0.5-0.2c-0.2,0-0.4,0.1-0.7,0.2c-0.2,0.1-0.4,0.3-0.6,0.5V14H70.9z" /><path d="M80.2,14.1c-0.6,0-1-0.2-1.3-0.5c-0.3-0.4-0.5-0.8-0.6-1.4l0.7-0.2c0,0.5,0.2,0.9,0.4,1.2 c0.2,0.2,0.5,0.4,0.8,0.4c0.3,0,0.5-0.1,0.7-0.3c0.2-0.2,0.2-0.4,0.2-0.7c0-0.2-0.1-0.5-0.2-0.7c-0.1-0.2-0.4-0.5-0.6-0.7l-0.9-0.8 c-0.3-0.3-0.5-0.5-0.7-0.8c-0.2-0.3-0.2-0.6-0.2-0.9c0-0.3,0.1-0.6,0.2-0.8c0.1-0.2,0.3-0.4,0.6-0.5C79.5,7,79.8,7,80.2,7 c0.5,0,0.9,0.2,1.2,0.5c0.3,0.3,0.4,0.8,0.4,1.3L81.2,9c0-0.3-0.1-0.6-0.1-0.8s-0.2-0.4-0.3-0.5c-0.1-0.1-0.3-0.1-0.5-0.1 c-0.3,0-0.5,0.1-0.6,0.2c-0.2,0.1-0.2,0.4-0.2,0.6c0,0.2,0,0.4,0.1,0.6c0.1,0.2,0.2,0.3,0.4,0.5l1,0.9c0.2,0.2,0.4,0.3,0.6,0.5 c0.2,0.2,0.3,0.4,0.4,0.6c0.1,0.2,0.2,0.5,0.2,0.8c0,0.4-0.1,0.7-0.2,0.9c-0.1,0.2-0.4,0.4-0.6,0.6C80.9,14,80.6,14.1,80.2,14.1z" />
                  <path d="M84.7,14.1c-0.5,0-0.8-0.1-1.1-0.3c-0.3-0.2-0.5-0.5-0.6-0.9s-0.2-0.9-0.2-1.4V9.6c0-0.6,0.1-1,0.2-1.4 c0.1-0.4,0.3-0.7,0.6-0.9C83.9,7.1,84.3,7,84.7,7c0.5,0,0.9,0.1,1.1,0.3s0.5,0.5,0.6,0.9c0.1,0.4,0.2,0.9,0.2,1.4v1.9 c0,0.6-0.1,1-0.2,1.4s-0.3,0.7-0.6,0.9S85.2,14.1,84.7,14.1z M84.7,13.4c0.3,0,0.5-0.1,0.7-0.2c0.1-0.2,0.2-0.4,0.3-0.7 c0-0.3,0-0.6,0-1v-2c0-0.4,0-0.7,0-1c0-0.3-0.1-0.5-0.3-0.7c-0.1-0.2-0.4-0.2-0.7-0.2c-0.3,0-0.5,0.1-0.7,0.2 c-0.1,0.2-0.2,0.4-0.3,0.7c0,0.3-0.1,0.6-0.1,1v2c0,0.4,0,0.7,0.1,1c0,0.3,0.1,0.5,0.3,0.7C84.2,13.4,84.4,13.4,84.7,13.4z" /><path d="M88.2,14V7.7h-0.9V7.1h0.9V6.3c0-0.3,0-0.6,0.1-0.9c0.1-0.3,0.2-0.5,0.4-0.6c0.2-0.2,0.5-0.2,0.8-0.2 c0.1,0,0.2,0,0.4,0c0.1,0,0.2,0,0.3,0.1v0.6c-0.1,0-0.2,0-0.2,0c-0.1,0-0.2,0-0.2,0c-0.3,0-0.4,0.1-0.5,0.2s-0.1,0.4-0.1,0.8v0.8 h1.1v0.6h-1.1V14H88.2z" /><path d="M92.7,14.1c-0.3,0-0.6-0.1-0.8-0.2s-0.3-0.3-0.4-0.5c-0.1-0.2-0.1-0.5-0.1-0.8V7.6h-0.9V7.1h0.9V4.9h0.9v2.1 h1.2v0.6h-1.2v4.8c0,0.3,0,0.6,0.1,0.7c0.1,0.1,0.2,0.2,0.5,0.2c0.1,0,0.2,0,0.2,0s0.2,0,0.3,0V14c-0.1,0-0.2,0-0.4,0.1 C92.9,14.1,92.8,14.1,92.7,14.1z" />
                </g>
              </svg>
            </div>
          </div>) : <NoCameraPage />
        }
      </>
    )
  },
})
</script>

<style scoped lang="scss">
@keyframes dce-rotate {
  from {
    transform: rotate(0turn);
  }

  to {
    transform: rotate(1turn);
  }
}

@keyframes dce-scanlight {
  from {
    top: 0;
  }

  to {
    top: 97%;
  }
}

.container {
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 100px;
  background: #eee;
  position: relative;
  overflow: hidden;
}

.dce-bg-loading {
  animation: 1s linear infinite dce-rotate;
  width: 40%;
  height: 40%;
  position: absolute;
  margin: auto;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  fill: #aaa;
}

.dce-bg-camera {
  display: none;
  width: 40%;
  height: 40%;
  position: absolute;
  margin: auto;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  fill: #aaa;
}

.dce-video-container {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.dce-scanarea {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.dce-scanarea .dce-scanlight {
  position: absolute;
  width: 100%;
  height: 1%;
  border-radius: 50%;
  box-shadow: 0px 0px 1px 2px #fe8e14;
  background-color: #fe8e14;
  animation: 3s infinite dce-scanlight;
  user-select: none;
}

.dlr-msg-poweredby {
  position: absolute;
  left: 50%;
  bottom: 10%;
  transform: translateX(-50%);
  pointer-events: none;
}

.dlr-msg-poweredby svg {
  height: max(3vmin, 17px);
  fill: #FFFFFF;
}

.bShowScanningText {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  z-index: 1;
  color: white;
  font-family: 'OpenSans-Regular';
  font-size: 10px;
}

.screenshot {
  width: 45px;
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  right: 10px;
  bottom: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  color: #ffffff;
  z-index: 1;

  .screenshotIcon {
    width: 20px;
    height: 20px;
  }
}

.torch-icon {
  position: absolute;
  top: 110%;
  left: 50%;
  transform: translateX(-50%);
}

.scanningPrompt {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 998;
  color: white;

  div {
    font-size: 10px;
    font-family: Consolas, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
  }
}

.div-mrz-guide-box-container {
  position: absolute;
  z-index: 998;
  pointer-events: none;

  .mrz-guide-box {
    width: 100%;
    height: 100%;
  }
}

.video-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  margin: auto 0;
}

@media screen and (min-width: 980px) {
  .currentMode {
    display: none;
  }

  .bShowScanningText {
    font-size: 18px;
  }

  .scanningPrompt {
    div {
      font-size: 18px;
    }
  }
}

@media screen and (max-width: 979px) and (orientation: landscape) {
  .dlr-msg-poweredby {
    bottom: 12%;
  }
}
</style>../handleMrzAndVinResult