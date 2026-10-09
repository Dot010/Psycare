import { BrandLoader } from "@/components/brand/BrandLoader";

export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <BrandLoader />
    </div>
  );
}
