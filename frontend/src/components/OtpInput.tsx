import { useRef } from "react"

export default function OtpInput({ onComplete }: { onComplete: (otp: string) => void }) {

  const inputs = useRef<Array<HTMLInputElement | null>>([])

  const handleChange = (value: string, index: number) => {

    if (!/^[0-9]?$/.test(value)) return

    if (value && index < 5) {
      inputs.current[index + 1]?.focus()
    }

    const otp = inputs.current.map(i => i?.value || "").join("")

    if (otp.length === 6) {
      onComplete(otp)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !inputs.current[index]?.value && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
      {[...Array(6)].map((_, i) => (
        <input
          key={i}
          type="text"
          maxLength={1}
          ref={(el) => (inputs.current[i] = el)}
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          style={{
            width: "50px",
            height: "55px",
            fontSize: "22px",
            textAlign: "center",
            borderRadius: "10px",
            border: "2px solid #ddd",
            outline: "none"
          }}
        />
      ))}
    </div>
  )
}