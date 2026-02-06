 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/components/ads/AdBanner.tsx b/src/components/ads/AdBanner.tsx
index 37a72e22e3932c540042aad90c9ed221d7e3be1c..f6d32fba600c2c7f0712d13cfbc49171c6ee4168 100644
--- a/src/components/ads/AdBanner.tsx
+++ b/src/components/ads/AdBanner.tsx
@@ -68,34 +68,34 @@
        height={60}
        className="jf93c9f9f58"
        domain="//data527.click"
        affQuery="/16a22f324d5687c1f7a4/f93c9f9f58/?placementName=MiniBanner"
        placementName="MiniBanner"
      />
    );
  }
  
  export function LargeBannerAd() {
    return (
      <AdBanner
        width={728}
        height={90}
        className="sfb45f70481"
        domain="//data527.click"
        affQuery="/a4127c19028b6c01ba5c/fb45f70481/?placementName=LargeBanner"
        placementName="LargeBanner"
      />
    );
  }
  
 export function SidebarAd() {
   return (
     <AdBanner
-      width={0}
-      height={0}
+      width={300}
+      height={250}
       className="m5afd89751f"
       domain="//data527.click"
       affQuery="/5fbf3d48481d384a64a7/5afd89751f/?placementName=SidebarAd"
       placementName="SidebarAd"
     />
   );
 }
 
EOF
)
