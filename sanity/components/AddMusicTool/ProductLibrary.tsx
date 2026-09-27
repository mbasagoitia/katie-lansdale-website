import {useEffect, useState} from "react"
import {Button, Card, Flex, Stack, Text} from "@sanity/ui"
import {useClient} from "sanity"
import {apiVersion} from "../../env"
import {deleteProduct, listProductsForManagement} from "./services/music"

type ProductSummary = {_id: string; title: string; productKind: string; availableForPurchase?: boolean}

export default function ProductLibrary({onBack}: {onBack: () => void}) {
  const client = useClient({apiVersion})
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { void listProductsForManagement(client).then(setProducts).catch(() => setError("Your products could not be loaded. Please try again.")) }, [client])

  async function removeProduct(product: ProductSummary) {
    if (!window.confirm(`Delete “${product.title}”? This only removes the product listing; its recordings and album will remain.`)) return
    setDeletingId(product._id)
    setError(null)
    try {
      await deleteProduct(client, product._id)
      setProducts((current) => current.filter((item) => item._id !== product._id))
    } catch {
      setError("The product could not be deleted. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  return <Card padding={5} radius={2} shadow={1}><Stack space={5}>
    <Flex justify="space-between" align="center"><Text size={3} weight="semibold">Manage products</Text><Button text="Back" mode="bleed" onClick={onBack} /></Flex>
    <Text>Delete test product listings here. This does not delete the original recording, work, or album.</Text>
    {error && <Card padding={3} tone="critical"><Text>{error}</Text></Card>}
    {!error && !products.length && <Text muted>No product listings have been created yet.</Text>}
    {products.map((product) => <Card key={product._id} padding={4} tone="transparent"><Flex justify="space-between" gap={4} align="center">
      <Stack space={2}><Text size={2} weight="semibold">{product.title}</Text><Text size={1} muted>{`${labelForKind(product.productKind)} · ${product.availableForPurchase ? "Listed on website" : "Not listed"}`}</Text></Stack>
      <Button text="Delete" tone="critical" mode="ghost" loading={deletingId === product._id} disabled={Boolean(deletingId)} onClick={() => void removeProduct(product)} />
    </Flex></Card>)}
  </Stack></Card>
}

function labelForKind(kind: string): string {
  return {album: "Album", work: "Work", recording: "Recording", bundle: "Collection"}[kind] || "Product"
}
