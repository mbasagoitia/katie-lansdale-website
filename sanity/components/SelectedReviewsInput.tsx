import {useEffect, useState} from "react"
import {Card, Select, Stack, Text} from "@sanity/ui"
import {set, type ArrayOfPrimitivesInputProps, useClient} from "sanity"
import {apiVersion} from "../env"

type ReviewOption = {_id: string; quote: string; attribution?: string}
type ReviewReference = {_key: string; _type: "reference"; _ref: string}

const reviewsQuery = `*[_id == "page-reviews"][0].reviews[]->{_id, quote, attribution}`

export default function SelectedReviewsInput(props: ArrayOfPrimitivesInputProps) {
  const client = useClient({apiVersion})
  const [reviews, setReviews] = useState<ReviewOption[]>([])
  const [loading, setLoading] = useState(true)
  // Sanity currently types an array of references as a primitive array even
  // though the stored values are reference objects.
  const selected = (props.value || []) as unknown as ReviewReference[]

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const nextReviews = await client.fetch<ReviewOption[]>(reviewsQuery)
        if (mounted) setReviews(nextReviews || [])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void load()
    const subscription = client.listen(reviewsQuery, {}, {visibility: "query"}).subscribe(() => void load())
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [client])

  const selectedIds = selected.map((review) => review._ref)

  function replaceReview(index: number, reviewId: string) {
    const next = [...selected]
    const existing = next[index]
    next[index] = {_key: existing?._key || `selected-review-${index + 1}`, _type: "reference", _ref: reviewId}
    props.onChange(set(next))
  }

  return <Stack space={3}>
    {[0, 1, 2].map((index) => {
      const current = selected[index]?._ref || ""
      return <Card key={index} padding={3} radius={2} border>
        <Stack space={2}>
          <Text size={1} weight="semibold">Review {index + 1}</Text>
          <Select
            value={current}
            disabled={props.readOnly || loading}
            onChange={(event) => replaceReview(index, event.currentTarget.value)}
          >
            {!current && <option value="">Choose a review</option>}
            {reviews.map((review) => <option key={review._id} value={review._id} disabled={review._id !== current && selectedIds.includes(review._id)}>
              {`${review.quote}${review.attribution ? ` — ${review.attribution}` : ""}`}
            </option>)}
          </Select>
        </Stack>
      </Card>
    })}
    {!loading && !reviews.length && <Text size={1} muted>Add reviews to the Reviews page before choosing the three to feature here.</Text>}
  </Stack>
}
