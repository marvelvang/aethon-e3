declare module '*.svg?raw' {
  const content: string
  export default content
}

declare module '*.png' {
  const url: string
  export default url
}

declare const __BUILD_NUMBER__: string
