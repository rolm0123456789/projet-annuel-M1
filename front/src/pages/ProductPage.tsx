export default function ProductPage({ params }: { params: { id: string } }) {
    return (
        <div>
            <h1 className="text-2xl font-bold">Product {params.id}</h1>
        </div>
    )
}
