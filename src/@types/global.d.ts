declare global {
  interface Window {
    yomAPI: WGyomAPI
  }
}
export interface WGyomAPI {
  saveStatus: (status: boolean) => void
  getHashData: (data: string) => number
  getUUID: () => string
  getSoftVersionData: () => {
    softVer: [number, number, number]
    exportStatus: number
  }
  getKyaraProfileData: (file: string) => inputProfileSendReType
  getPlatformData: () => NodeJS.Platform
  opneVoiceFileDir: (defoDir?: string) => [Array<string>, string]
  opneDir: (defoDir?: string, tatie?: string) => string
  opneFile: (defoDir?: string, title?: string, filtersName?: string, filtersExtensions?: string[]) => string
  getVoiceFileDirData: (dirPathName: string) => string
  writeKyaraProfileData: (fileName: string, outJsonData?: string) => boolean
  writeVoiceFileData: (dirPathName: string, outJsonData: string) => boolean
  writeFileListKyaraData: (outJsonData: string) => boolean
  entSaveSetting: (listener: () => void) => void
  getKyraPicFileData: (fileName: string, sizeHeight?: number) => Uint8Array
  opneKyaraPicFileDir: (defoDir?: string) => { uuid: string; name: string; extname: string }[]
  getFileListKyaraData: () => string
  enterEncodeVideoData: (dirPathName: string, outJsonData: string) => string
  getGlobalSettingData: () => string
  writeGlobalSettingData: (outJsonData: string) => boolean
  openGlobalSetting: (listener: () => void) => void
  getJsonFileData: (fileType: string, fileName?: string) => string
  writeJsonFileData: (fileType: string, outJsonData: string, fileName?: string) => boolean
  getEncodePicFileData: (outJsonData: string) => { buffer: Uint8Array; path: string }
  writeUint8ArrayFileData: (
    fileData: Uint8Array,
    fileName: string,
    fileFiltersName: string,
    fileFiltersExtensions: string[],
    defoDir?: string,
  ) => string
}
