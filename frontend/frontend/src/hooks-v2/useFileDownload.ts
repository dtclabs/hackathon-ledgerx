import { zipFilesToDownload } from '@/utils-v2/zip-files-to-download'
import { getAccessToken } from '@/utils/localStorageService'
import { toast } from 'react-toastify'

export interface IFileObject {
    path: string
    filename: string
}

export const useFileDownload = () => {
    const handleFileDownload = async(fileObjects: IFileObject[]) => {
        const accessToken = getAccessToken()
        const headers = {}

    if (accessToken) {
      /* eslint-disable dot-notation */
      headers['authorization'] = `Bearer ${accessToken}`
    }

    if (fileObjects?.length === 1) {
        try {
            const response = await fetch(fileObjects[0].path, {method: 'GET', headers})
            if (response.status !== 200) throw new Error()
            const file = await response.blob()
            const hiddenElement = document.createElement('a')
            const url = window.URL || window.webkitURL
            const blobPDF = url.createObjectURL(file)
            hiddenElement.href = blobPDF
            hiddenElement.target = '_blank'
            hiddenElement.download = fileObjects[0].filename
            hiddenElement.click()
        } catch {
            toast.error('Sorry there was an error in file download')
        }
    } else if (fileObjects?.length > 1) {
        try {
            const filePromises = fileObjects.map(async (fileObj) => ({fileName: fileObj.filename, fileBlob: await fetch(fileObj.path, {method: 'GET', headers})})) 
            const responses = await Promise.all(filePromises)

            // Fail the whole download if a single file fails
            // Possible improvement - Download files that are successful and fail the rest
            responses.forEach(response => {
                if (response.fileBlob.status !== 200) throw new Error()
            })
            const files = responses.map(async (response) => ({...response, fileBlob: await response.fileBlob.blob()}))
            const final = await Promise.all(files)
            
            zipFilesToDownload(final)
        } catch {
            toast.error('Sorry there was an error in file download')
        }
    }
  }

  return {handleFileDownload}
}
