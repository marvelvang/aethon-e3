import './Spinner.css'

interface Props {
  size?: number
}

export default function Spinner({ size = 13 }: Props) {
  return (
    <div
      className="aethon-spinner"
      style={{ width: size, height: size }}
    />
  )
}
