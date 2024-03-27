<script lang="tsx">
import { defineComponent, provide, ref, Ref } from 'vue';
import { LabelRecognizer } from 'dynamsoft-label-recognizer';
import './dlr'
import './dce'
import './dcp'

export default defineComponent({
  setup() {
    const isShowHomePage: Ref<boolean> = ref(true);
    const runtimeMode: Ref<string> = ref("mrz");
    const bShowMask: Ref<boolean> = ref(false);
    const bShowImgRecognitionMask: Ref<boolean> = ref(false);
    const progressRate: Ref<number> = ref(0);

    provide('isShowHomePage', isShowHomePage);
    provide('runtimeMode', runtimeMode);
    provide('bShowMask', bShowMask);
    provide('progressRate', progressRate);
    provide('bShowImgRecognitionMask', bShowImgRecognitionMask);

    LabelRecognizer.onResourcesLoadStarted = () => { bShowMask.value = true; }
    LabelRecognizer.onResourcesLoadProgress = (_?: string, progress?: { loaded: number, total: number }): void => {
      progressRate.value = (progress!.loaded / progress!.total) * 100;
    };
    LabelRecognizer.onResourcesLoaded = () => { bShowMask.value = false; }

    return () => (
      <>
        <router-view></router-view>
        <div class="dataLoadingMask" v-show={bShowMask.value}>
          <div>Model Loading......</div>
        </div>
        <div class="imgRecognitionMask" v-show={bShowImgRecognitionMask.value}>
          <div>recognizing...</div>
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
  min-width: 300px;
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
ul {
  margin-bottom: 0;
}
li {
  list-style: none;
}
img {
  vertical-align: inherit;
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
.ant-popover-inner-content {
  padding: 0;
  .camera-list, .imgRecognizerMethod, .modeList {
    color: #AAAAAA;
    opacity: 0.9;
    li {
        height: 50px;
        line-height: 50px;
        background-color: #222222;
        text-align: center;
        cursor: pointer;
        div {
          padding: 0 10px;
        }
    }
  }
}
.ant-spin {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}
.ant-popover-placement-bottom > .ant-popover-content > .ant-popover-arrow, .ant-popover-placement-bottomLeft > .ant-popover-content > .ant-popover-arrow, .ant-popover-placement-bottomRight > .ant-popover-content > .ant-popover-arrow {
  border-top-color: rgb(34,34,34);
  border-left-color: rgb(34,34,34);
}

@media screen and (min-width: 980px) {
  .ant-dropdown  {
    top: 70px !important;
  }
}

@media screen and (max-width: 980px) {
  .ant-dropdown  {
    top: 46px !important;
  }
  .ant-popover-inner-content {
    .camera-list {
      li {
        height: 35px;
        line-height: 35px;
      }
    }
    
  }
  [id*=comm100-float-button] {
    display: none !important;
    width: 1px !important;
    height: 1px !important;
    overflow: hidden !important;
  }
}

</style>
