import MenuClient from "./MenuClient"

export default function MenuPage({ params }: { params: { domain: string } }) {
  return <MenuClient domain={params.domain} />
}
