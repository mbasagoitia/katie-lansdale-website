import { getProducts } from "@/sanity/data/products";


export default async function WatchListen() {
  const products = await getProducts();
  return (
    <div>
        <h1>Watch/Listen</h1>
      {products.map((product) => (
        <article
        key={product._id}
        className="rounded-lg border p-6 shadow-sm"
    >
        <h2 className="text-2xl font-bold">
        {product.title}
        </h2>

        <p>${product.price}</p>

        <h3>Recordings</h3>

        <ul>
        {product.recordings.map((recording) => (
            <li key={recording._id}>
            {recording.title} ({recording.duration})
            </li>
        ))}
        </ul>
        </article>
    ))}
    </div>
  );
}