import OtpInput from "../components/OtpInput"

export default function VerifyOtp() {

  const handleOtp = (otp: string) => {
    console.log("OTP entered:", otp)
  }

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Enter OTP</h2>
      <OtpInput onComplete={handleOtp} />
    </div>
  )
}