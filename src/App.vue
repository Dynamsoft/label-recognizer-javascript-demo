<script lang="tsx">
import { defineComponent, provide, ref, Ref } from 'vue';
import HomePage from './components/HomePage.vue';
import RecognizerPage from './components/RecognizerPage.vue';
import { LabelRecognizer } from 'dynamsoft-label-recognizer'

export default defineComponent({
  setup() {
    const isShowHomePage = ref(true) as Ref<boolean>;
    const runtimeMode = ref('') as Ref<string>;
    const isShowMask = ref(false) as Ref<boolean>;
    const isShowImgRecognitionMask = ref(false) as Ref<boolean>;
    const progressRate = ref() as Ref<number>;

    LabelRecognizer.loadWasm();

    const getPathName = (): string => {
      let pathname: string = location.hash;
      pathname = pathname.substring(1);
      return pathname;
    }

    (() => {
      if(getPathName() === 'mrz') {
        runtimeMode.value = 'video-mrz';
        isShowHomePage.value = false;
      } else if(getPathName() === 'vin') {
        runtimeMode.value = 'video-vin';
        isShowHomePage.value = false;
      }
    })();

    provide('isShowHomePage', isShowHomePage);
    provide('runtimeMode', runtimeMode);
    provide('isShowMask', isShowMask);
    provide('progressRate', progressRate);
    provide('isShowImgRecognitionMask', isShowImgRecognitionMask);

    return () => (
      <>
        { isShowHomePage.value ? <HomePage /> : <RecognizerPage /> }
        <div class="dataLoadingMask" v-show={isShowMask.value}>
          <div>Model Loading......</div>
          <progress class="loadProgress" value={progressRate.value} max={100}></progress>
        </div>
        <div class="imgRecognitionMask" v-show={isShowImgRecognitionMask.value}>
          <div>decoding...</div>
        </div>
      </>
    )
  },
});
</script>

<style lang="scss">
@font-face {
  font-family: "Oswald-Regular";
  src: url("./assets/font/Oswald-Regular.ttf");
}
@font-face {
  font-family: "Oswald-Light";
  src: url("./assets/font/Oswald-Light.ttf");
}
@font-face {
  font-family: "OpenSans-Regular";
  src: url("./assets/font/OpenSans-Regular.ttf");
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body {
  font-family: "Oswald-Regular";
  overflow: hidden;
  width: 100%;
  height: 100%;
}
#app {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: rgb(50,50,52);
}
li {
  list-style: none;
}
.dce-video, .dlr-cvs-drawarea {
  object-fit: cover !important;
}
.dlr-scanlight {
  border-radius: 50%;
  box-shadow: #fe8e14 0px 0px 1px 2px !important;
  background-color: #fe8e14 !important;
  height: 1% !important;
}
.dataLoadingMask progress { 
  -webkit-appearance: none; 
}
.dataLoadingMask ::-webkit-progress-value { 
  background: rgb(254,142,20); 
}
.dataLoadingMask ::-moz-progress-bar { 
  background: rgb(254,142,20); 
}
.dataLoadingMask ::-ms-fill { 
  background: rgb(254,142,20); 
}
.dataLoadingMask, .imgRecognitionMask {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0,0,0, 0.5);
  z-index: 9999;
  font-size: 30px;
  color: white;
}
</style>
