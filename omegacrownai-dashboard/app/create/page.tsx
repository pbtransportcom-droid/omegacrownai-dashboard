import { Suspense } from "react";
import CreateClient from "@/components/create/CreateClient";

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted">Loading create engine...</div>}>
      <CreateClient />
    </Suspense>
  );
}
