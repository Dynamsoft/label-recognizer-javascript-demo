<script lang="tsx">
import { defineComponent, ref, inject, Ref } from 'vue'

export default defineComponent({
  setup() {
    const qrcode = require('@/assets/image/qrcode.png');

    const isShowCameraList = inject('isShowCameraList') as Ref<boolean>;
    const isShowModeList = inject('isShowModeList') as Ref<boolean>;
    const isShowSettingList = inject('isShowSettingList') as Ref<boolean>;
    const isShowImgRecMethodList = inject('isShowImgRecMethodList') as Ref<boolean>;

    const clientWidth = ref(document.body.clientWidth) as any;

    window.addEventListener('resize', () => {
      clientWidth.value = document.body.clientWidth;
    })

    const closeList = () => {
      isShowCameraList.value = false;
      isShowModeList.value = false;
      isShowSettingList.value = false;
      isShowImgRecMethodList.value = false;
    }

    return () => (
      <div class="no-camera" onClick={closeList}>
        <div class="no-camera-main">
          <div class="header">
            <svg viewBox="64 64 896 896" data-icon="warning" width="26" height="26" fill="currentColor" aria-hidden="true" focusable="false" class=""><path d="M464 720a48 48 0 1 0 96 0 48 48 0 1 0-96 0zm16-304v184c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V416c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8zm475.7 440l-416-720c-6.2-10.7-16.9-16-27.7-16s-21.6 5.3-27.7 16l-416 720C56 877.4 71.4 904 96 904h832c24.6 0 40-26.6 27.7-48zm-783.5-27.9L512 239.9l339.8 588.2H172.2z"></path></svg>
            <h2>No camera detected</h2>
          </div>
          { clientWidth.value >= 980 ? <div class="qrcode"><img src={qrcode} /></div> : ''}
          { clientWidth.value >= 980 ? 
            <div class="text">Scan the QR code and try the demo on your phone</div> 
              : 
            <div class="text">Please check whether your browser has camera permission</div> 
          }
        </div>
      </div>
    )
  },
})
</script>

<style lang="scss" scoped>
.no-camera {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: rgb(88,87,87);

  .no-camera-main {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    .header {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 300px;
      height: 55px;
      background-color: #222;
      svg {
        color: #fff;
        margin-right: 10px;
      }
      h2 {
        color: #fff;
        font-size: 26px;
        margin-bottom: 0;
      }
    }

    .qrcode {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 288px;
      height: 288px;
      background-color: #fff;
      margin-top: 30px;
      img {
        width: 200px;
        height: 200px;
      }
    }

    .text {
      font-size: 18px;
      color: #fff;
      margin-top: 30px;
    }
  }
}
</style>