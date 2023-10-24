import Table from "./components/Table";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-6">
      <div className="bg-white text-black p-4 text-center">
        <h1 className="text-3xl font-bold">Telepathy Message Explorer</h1>
      </div>
      <Table />
    </main>
  );
}
