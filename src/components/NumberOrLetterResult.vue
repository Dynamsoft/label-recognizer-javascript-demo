<script lang="tsx">
import { defineComponent, inject, watch, ref, getCurrentInstance, Ref } from 'vue'
import Clipboard from "clipboard";

export default defineComponent({
  setup() {
    const runtimeMode: Ref<string> = inject('runtimeMode')!;
    const recognizeResultInfo: Ref<Array<string>> = inject('recognizeResultInfo')!;
    const bShowNumOrLetResult: Ref<boolean> = inject('bShowNumOrLetResult')!;

    const bCopied: Ref<boolean> = ref(false);
    const recognizerCount: Ref<number> = ref(0);
    const { proxy }: any = getCurrentInstance();
    let timer: any;
    let currentRes: string = '';

    watch(recognizeResultInfo, () => {
      if (currentRes !== recognizeResultInfo.value[0]) {
        recognizerCount.value = 0;
      }
      currentRes = recognizeResultInfo.value[0];
      timer && clearTimeout(timer);
      recognizerCount.value++;
      timer = setTimeout(() => {
        bShowNumOrLetResult.value = false;
      }, 5000)
    }, { immediate: true })

    const copyResults = () => {
      if (!bCopied.value) {
        let clipboard = new Clipboard('.copy-btn', {
          text: (): string => {
            let copyContent = '';
            recognizeResultInfo.value.map((item: string) => {
              copyContent += item + '\n';
            })
            return copyContent;
          }
        });
        clipboard.on('success', () => {
          proxy.$message.success('Copied!');
          bCopied.value = true;
          setTimeout(() => {
            bCopied.value = false;
          }, 5000)
          clipboard.destroy();
        });
        clipboard.on('error', () => {
          proxy.$message.error('Failed!');
          clipboard.destroy();
        })
      }
    }

    return () => (
      <div class="result">
        <div class="title">{runtimeMode.value.toUpperCase()} :</div>
        <div class="content">
          {
            recognizeResultInfo.value.map((item: string) => {
              return item + ' ';
            })
          }
        </div>
        <div class="copy-btn" style={{ color: !bCopied.value ? '#FE8E14' : 'gray', cursor: !bCopied.value ? 'pointer' : '' }} onClick={copyResults}>{bCopied.value ? 'Copied' : 'Copy'}</div>
        <div>{recognizerCount.value}X</div>
      </div>
    )
  }
})
</script>

<style lang="scss" scoped>
.result {
  position: absolute;
  display: flex;
  justify-content: space-around;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  width: 50vw;
  height: 60px;
  max-width: 740px;
  background-color: rgba(34, 34, 34, 0.8);
  line-height: 60px;
  text-align: center;
  color: #dddddd;
  font-size: 18px;
  padding: 0 15px;

  .content {
    width: 50%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .copy-btn {
    color: #fe8e14;
  }
}

@media screen and (max-width: 980px) {
  .result {
    width: 85vw;
    height: 40px;
    line-height: 40px;
    font-size: 12px;
  }
}
</style>