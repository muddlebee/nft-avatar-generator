import { AvatarGeneratorClient } from "@/components/avatar-generator/avatar-generator-client";

export default async function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <AvatarGeneratorClient />
      </div>
    </main>
  );
}
