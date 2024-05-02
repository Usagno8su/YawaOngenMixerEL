// 参考
// https://qiita.com/raratyurara/items/3ec1d78bebb76bde641a
// typecheckが動くように修正
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{ '' }, { '' }, any>
  export default component
}
