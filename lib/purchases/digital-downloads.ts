import "server-only"

import {supabaseAdmin} from "@/lib/supabase/server"
import type {Product} from "@/types/product"

const DOWNLOAD_LINK_TTL_SECONDS = 60 * 60 * 24 * 7

export type DigitalDownload = {
  productTitle: string
  recordings: Array<{
    title: string
    url: string
  }>
}

/** Creates short-lived links only for the digital recordings included in paid products. */
export async function createDigitalDownloads(products: Product[]): Promise<DigitalDownload[]> {
  const deliveredRecordingIds = new Set<string>()
  const downloads: DigitalDownload[] = []

  for (const product of products) {
    if (!isDigital(product)) continue
    const recordings = await Promise.all(product.recordings.map(async (recording) => {
      if (deliveredRecordingIds.has(recording._id)) return null
      deliveredRecordingIds.add(recording._id)
      const path = recording.mediaType === "video" ? recording.fullVideo : recording.fullAudio
      if (!path) return null
      const bucket = recording.mediaType === "video" ? "video-full" : "audio-full"
      const {data, error} = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, DOWNLOAD_LINK_TTL_SECONDS, {download: true})
      if (error || !data?.signedUrl) {
        console.error("Unable to create a digital download link", {productId: product._id, recordingId: recording._id, error: error?.message})
        return null
      }
      return {title: recording.title, url: data.signedUrl}
    }))
    const availableRecordings = recordings.filter((recording): recording is {title: string; url: string} => Boolean(recording))
    if (availableRecordings.length) downloads.push({productTitle: product.title, recordings: availableRecordings})
  }

  return downloads
}

function isDigital(product: Product): boolean {
  const types = product.deliveryTypes?.length ? product.deliveryTypes : product.type ? [product.type] : []
  return types.includes("digitalDownload")
}
