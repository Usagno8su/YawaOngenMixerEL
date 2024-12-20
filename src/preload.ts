// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

contextBridge.exposeInMainWorld('yomAPI', {
  saveStatus: (status: boolean) => {
    ipcRenderer.send('SaveStatus', status)
  },
  getHashData: (mesg: string) => {
    const ans = ipcRenderer.sendSync('hashData', mesg)
    console.log('preload ans: ' + ans.toString(16))
    return ans
  },
  getUUID: () => {
    return ipcRenderer.sendSync('newUUID')
  },
  getPlatformData: (): NodeJS.Platform => {
    return ipcRenderer.sendSync('GetPlatformData')
  },
  getSoftVersionData: () => {
    return ipcRenderer.sendSync('SoftVersionData')
  },
  getKyaraProfileData: (file: string) => {
    return ipcRenderer.sendSync('loadKyaraProfileData', file)
  },
  opneVoiceFileDir: (defoDir?: string): [Array<string>, string] => {
    return ipcRenderer.sendSync('voiceDirOpen', defoDir)
  },
  opneDir: (defoDir?: string, title?: string): [Array<string>, string] => {
    return ipcRenderer.sendSync('loadDirPath', defoDir, title)
  },
  opneFile: (defoDir?: string, title?: string, filtersName?: string, filtersExtensions?: string[]): string => {
    return ipcRenderer.sendSync('loadFilePath', defoDir, title, filtersName, filtersExtensions)
  },
  getVoiceFileDirData: (dirPathName: string) => {
    return ipcRenderer.sendSync('loadVoiceFileData', dirPathName)
  },
  writeKyaraProfileData: (fileName: string, outJsonData?: string): boolean => {
    return ipcRenderer.sendSync('saveKyaraProfileData', fileName, outJsonData)
  },
  writeVoiceFileData: (dirPathName: string, outJsonData: string): boolean => {
    return ipcRenderer.sendSync('saveVoiceFileData', dirPathName, outJsonData)
  },
  entSaveSetting: (listener: () => void) =>
    ipcRenderer.on('SaveSettingKeyCom', (_event: IpcRendererEvent) => listener()),
  getKyraPicFileData: (fileName: string, sizeHeight?: number): Uint8Array => {
    return ipcRenderer.sendSync('loadKyraPicFileData', fileName, sizeHeight)
  },
  opneKyaraPicFileDir: (defoDir?: string): { uuid: string; name: string; extname: string }[] => {
    return ipcRenderer.sendSync('selectSaveKyraPicFileData', defoDir)
  },
  getFileListKyaraData: (): string => {
    return ipcRenderer.sendSync('loadFileListKyaraData')
  },
  writeFileListKyaraData: (outJsonData: string): boolean => {
    return ipcRenderer.sendSync('saveFileListKyaraData', outJsonData)
  },
  enterEncodeVideoData: async (dirPathName: string, outJsonData: string): Promise<string> => {
    return await ipcRenderer.invoke('enterEncodeVideoData', dirPathName, outJsonData)
  },
  getGlobalSettingData: (): string => {
    return ipcRenderer.sendSync('loadGlobalSettingData')
  },
  writeGlobalSettingData: (outJsonData: string): boolean => {
    return ipcRenderer.sendSync('saveGlobalSettingData', outJsonData)
  },
  openGlobalSetting: (listener: () => void) => ipcRenderer.on('openGlobalKeyCom', () => listener()),
  getJsonFileData: (fileType: string, fileName?: string): string => {
    return ipcRenderer.sendSync('loadJsonString', fileType, fileName)
  },
  writeJsonFileData: (fileType: string, outJsonData: string, fileName?: string): boolean => {
    return ipcRenderer.sendSync('saveJsonString', fileType, outJsonData, fileName)
  },
  getEncodePicFileData: (outJsonData: string): { buffer: Uint8Array; path: string } => {
    return ipcRenderer.sendSync('loadEncodePicFileData', outJsonData)
  },
  writeUint8ArrayFileData: async (
    fileData: Uint8Array,
    fileName: string,
    fileFiltersName: string,
    fileFiltersExtensions: string[],
    defoDir?: string,
  ): Promise<string> => {
    return await ipcRenderer.invoke(
      'saveUint8ArrayFileData',
      fileData,
      fileName,
      fileFiltersName,
      fileFiltersExtensions,
      defoDir,
    )
  },
  getSubTextString: (dir: string, fileName: string): { val: string; active: boolean } => {
    return ipcRenderer.sendSync('loadSubTextString', dir, fileName)
  },
  getSubTextStringList: (
    dir: string,
    itemList: { uuid: string; fileName: string }[],
  ): { [key: string]: { val: string; active: boolean } } => {
    return ipcRenderer.sendSync('loadSubTextStringList', dir, itemList)
  },
  EntEditName: (listener: () => void) => ipcRenderer.on('EditNameKeyCom', () => listener()),
  EntAskDelete: (listener: () => void) => ipcRenderer.on('AskDeleteKeyCom', () => listener()),
  CopyToKyara: (listener: (dataType: string) => void) =>
    ipcRenderer.on('CopyToKyaraCom', (_event: IpcRendererEvent, dataType: string) => listener(dataType)),
})
