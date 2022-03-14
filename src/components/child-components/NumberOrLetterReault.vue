<script lang="tsx">
import { defineComponent, inject, watch, ref, getCurrentInstance, Ref } from 'vue'
import Clipboard from "clipboard";

export default defineComponent ({
  setup() {
    const runtimeMode = inject('runtimeMode') as Ref<string>;
    const recognizeResultInfo = inject('recognizeResultInfo') as any;
    const isShowNumOrLetResults = inject('isShowNumOrLetResults') as Ref<boolean>;

    const isCopied = ref(false);
    const recognizerCount = ref(0);
    const { proxy }: any = getCurrentInstance();
    let timer: any;

    watch(recognizeResultInfo, () => {
      if(timer) {
        clearTimeout(timer);
      }
      recognizerCount.value++;
      timer = setTimeout(() => {
        isShowNumOrLetResults.value = false;
      }, 5000)
    }, {immediate: true})

    const copyResults = () => {
      if(!isCopied.value) {
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

    return () => (
      <div class="result">
        <div class="title">{runtimeMode.value.substring(6).toUpperCase()} :</div>
        <div class="content">
          {
            recognizeResultInfo.value.map((item: string) => {
              return item + ' ';
            })
          }
        </div>
        <div class="copy-btn" style={{color: !isCopied.value ? '#FE8E14' : 'gray', cursor: !isCopied.value ? 'pointer' : ''}} onClick={ copyResults }>{isCopied.value ? 'Copied' : 'Copy'}</div>
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