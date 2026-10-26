import { PipelineView } from "@/components/pipeline/PipelineView";
import { MOCK_DEALS } from "@/data/mock-deals";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1920px] px-6 py-8">
      <PipelineView initialDeals={MOCK_DEALS} />
    </main>
  );
}
