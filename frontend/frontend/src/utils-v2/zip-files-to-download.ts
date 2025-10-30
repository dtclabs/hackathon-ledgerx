/* eslint-disable @typescript-eslint/no-var-requires */
const JSZip = require('jszip')

interface BulkDowloadParam {
    fileBlob: Blob
    fileName:string
}

export const zipFilesToDownload = (files: BulkDowloadParam[]) => {
    const zip = new JSZip()
    const url = window.URL || window.webkitURL
    for (const file of files) {
      zip.file(file.fileName, file.fileBlob)
    }

    // Generate the complete zip file
    zip.generateAsync({ type: 'blob' }).then((blobdata) => {
      // create zip blob file
      const zipblob = new Blob([blobdata])

      // For development and testing purpose
      // Download the zipped file
      const elem = window.document.createElement('a')
      elem.href = url.createObjectURL(zipblob)
      elem.download = `${files.length}-files.zip`
      elem.click()
    })
}