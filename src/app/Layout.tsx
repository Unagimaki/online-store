import { Header } from "@/widgets/header/ui/Header";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
