import GoogleAd from "./GoogleAd";

export default function SideAds() {
  return (
    <>
      {/* LEFT SIDE AD */}
      <div className="hidden lg:block fixed left-2 top-28 w-48 z-40">
        <GoogleAd
          slot="YOUR_LEFT_SLOT_ID"
          style={{ display: "block", width: "160px", height: "600px" }}
        />
      </div>

      {/* RIGHT SIDE AD */}
      <div className="hidden lg:block fixed right-2 top-28 w-48 z-40">
        <GoogleAd
          slot="YOUR_RIGHT_SLOT_ID"
          style={{ display: "block", width: "160px", height: "600px" }}
        />
      </div>
    </>
  );
}
