import {useEffect, useMemo, useState} from "react"
import {Button, Card, Flex, Stack, Text, TextInput} from "@sanity/ui"
import {useClient} from "sanity"
import {apiVersion} from "../../env"
import {SaleForm} from "./components"
import {createAlbumProduct, createRecordingProduct, deleteProduct, listProductsForManagement, listSaleCandidates, type SaleCandidate} from "./services/music"
import type {SaleDraft} from "./types"

type ProductSummary = {_id: string; title: string; productKind: string; availableForPurchase?: boolean}

export default function ProductLibrary({onBack}: {onBack: () => void}) {
  const client = useClient({apiVersion})
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [candidates, setCandidates] = useState<SaleCandidate[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [candidate, setCandidate] = useState<SaleCandidate | null>(null)
  const [term, setTerm] = useState("")
  const [saving, setSaving] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [sale, setSale] = useState<SaleDraft>({title: "", price: 0, deliveryTypes: ["digitalDownload"]})
  const [error, setError] = useState<string | null>(null)

  const loadProducts = () => void listProductsForManagement(client).then(setProducts).catch(() => setError("Your products could not be loaded. Please try again."))
  useEffect(() => { loadProducts(); void listSaleCandidates(client).then(setCandidates).catch(() => setError("Your uploads could not be loaded. Please try again.")) }, [client])
  const visibleCandidates = useMemo(() => { const query = term.trim().toLocaleLowerCase(); return candidates.filter((item) => !query || [item.title, item.artist].filter(Boolean).some((value) => value!.toLocaleLowerCase().includes(query))) }, [candidates, term])

  async function removeProduct(product: ProductSummary) {
    if (!window.confirm(`Delete product “${product.title}”? This only removes the product listing; its recordings and album will remain.`)) return
    setDeletingId(product._id); setError(null)
    try { await deleteProduct(client, product._id); setProducts((current) => current.filter((item) => item._id !== product._id)) }
    catch { setError("The product could not be deleted. Please try again.") }
    finally { setDeletingId(null) }
  }

  async function createSale() {
    if (!candidate || !sale.title.trim()) return
    setSaving(true); setError(null)
    try {
      if (candidate._type === "album") await createAlbumProduct(client, sale, candidate._id, candidate.recordingIds)
      else await createRecordingProduct(client, sale, candidate.recordingIds)
      setCandidate(null); setShowSetup(false); setSale({title: "", price: 0, deliveryTypes: ["digitalDownload"]}); loadProducts()
    } catch { setError("The product could not be created. Please try again.") }
    finally { setSaving(false) }
  }

  return <Card padding={5} radius={2} shadow={1}><Stack space={5}>
    <Flex justify="space-between" align="center"><Text size={3} weight="semibold">Manage products</Text><Button text="Back" mode="bleed" onClick={onBack} /></Flex>
    <Text>Products are listings for sale. Your source recordings and albums remain in Uploads, whether or not they are listed for sale.</Text>
    <Button text={showSetup ? "Close sale setup" : "List an upload for sale"} tone="primary" onClick={() => { setShowSetup(!showSetup); setCandidate(null); setTerm("") }} />
    {showSetup && <Card padding={4} tone="transparent"><Stack space={4}>
      <Text size={2} weight="semibold">Choose an uploaded recording or album</Text>
      <TextInput placeholder="Search recordings or albums" value={term} onChange={(event) => setTerm(event.currentTarget.value)} />
      {!candidate && visibleCandidates.map((item) => <Button key={`${item._type}-${item._id}`} text={`${item._type === "album" ? "Album" : "Recording"}: ${item.title}${item.artist ? ` — ${item.artist}` : ""}`} mode="ghost" onClick={() => { setCandidate(item); setSale({title: item.title, price: 0, deliveryTypes: ["digitalDownload"]}) }} />)}
      {candidate && <Stack space={4}><Flex justify="space-between" align="center"><Text>{`${candidate._type === "album" ? "Album" : "Recording"}: ${candidate.title}`}</Text><Button text="Choose another" mode="bleed" onClick={() => setCandidate(null)} /></Flex><SaleForm draft={sale} onChange={setSale} /><Button text="Create product listing" tone="primary" loading={saving} disabled={!sale.title.trim() || sale.price < 0} onClick={() => void createSale()} /></Stack>}
    </Stack></Card>}
    {error && <Card padding={3} tone="critical"><Text>{error}</Text></Card>}
    <Text size={2} weight="semibold">Listed for sale</Text>
    {!error && !products.length && <Text muted>No products are currently listed for sale.</Text>}
    {products.map((product) => <Card key={product._id} padding={4} tone="transparent"><Flex justify="space-between" gap={4} align="center"><Stack space={2}><Text size={2} weight="semibold">{product.title}</Text><Text size={1} muted>{`${labelForKind(product.productKind)} · ${product.availableForPurchase ? "Listed for sale" : "Not currently for sale"}`}</Text></Stack><Button text="Delete product" tone="critical" mode="ghost" loading={deletingId === product._id} disabled={Boolean(deletingId)} onClick={() => void removeProduct(product)} /></Flex></Card>)}
  </Stack></Card>
}

function labelForKind(kind: string): string {
  return {album: "Album", work: "Work", recording: "Recording", bundle: "Collection"}[kind] || "Product"
}
