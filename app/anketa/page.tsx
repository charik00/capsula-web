import { AnketaForm } from "./anketa-form";

export const metadata = {
  title: "Анкета — Capsula",
};

export default function AnketaPage() {
  return (
    <div className="min-h-screen bg-[#F5F3ED] py-10 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-light text-[#302012] mb-2">Анкета</h1>
          <p className="text-[#302012]/70">
            Заполните, пожалуйста, перед началом работы.
          </p>
        </div>
        <AnketaForm />
      </div>
    </div>
  );
}
