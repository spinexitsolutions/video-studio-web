import { Suspense } from "react";
import BookingsInbox from "@/components/admin/BookingsInbox";

export default function Page() {
  return (
    <Suspense>
      <BookingsInbox />
    </Suspense>
  );
}
