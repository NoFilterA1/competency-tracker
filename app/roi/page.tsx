import { Roi } from "@/components/Roi";

export default function RoiPage() {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <h1 className="display text-4xl sm:text-5xl">Окупаемость</h1>
        <p className="muted mt-3 text-[1.05rem] leading-relaxed">Калькулятор для разговора с заказчиком: сколько времени экономится, когда окупается внедрение и при каком масштабе система выгодна. Двигайте ползунки, расчёт обновляется сразу.</p>
      </div>
      <Roi />
    </div>
  );
}
