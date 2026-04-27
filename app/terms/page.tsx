export default function TermsPage() {
  return (
    <main className="bg-[#302012] text-[#F5F3ED] min-h-screen">
      <div className="fixed top-4 right-4 z-50">
        <a
          href="/"
          className="w-10 h-10 rounded-full bg-[#F5F3ED]/20 hover:bg-[#F5F3ED]/30 backdrop-blur-sm border border-[#F5F3ED]/30 flex items-center justify-center transition-all"
          aria-label="Закрыть"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </a>
      </div>

      <section className="pt-16 pb-12 md:pt-20 md:pb-20 px-4">
        <div className="container mx-auto max-w-4xl space-y-10">
          <h1 className="text-3xl md:text-5xl">Правила пользования / תקנון האתר</h1>

          <div className="space-y-4 text-base md:text-lg leading-relaxed text-[#F5F3ED]/90">
            <p>1. Использование сайта означает согласие с настоящими правилами.</p>
            <p>2. Вся информация носит ознакомительный характер и не является медицинским советом.</p>
            <p>
              3. Метод нейро-сенсорной капсульной терапии не является медицинским лечением и не заменяет
              консультацию врача.
            </p>
            <p>
              4. Capsula Israel оставляет за собой право изменять содержимое сайта без предварительного уведомления.
            </p>
            <p>5. Все права на материалы сайта принадлежат Capsula Israel.</p>
            <p>6. Результаты программы индивидуальны и могут отличаться у разных клиентов.</p>
            <p>
              7. Споры разрешаются в соответствии с законодательством Государства Израиль в судах Тель-Авивского
              округа.
            </p>
          </div>

          <div dir="rtl" className="space-y-4 text-base md:text-lg leading-relaxed text-[#F5F3ED]/90">
            <p>1. השימוש באתר מהווה הסכמה לתקנון זה.</p>
            <p>2. כל המידע באתר הוא למטרות מידע בלבד ואינו מהווה ייעוץ רפואי.</p>
            <p>3. שיטת הטיפול הנוירו-חושי בקפסולה אינה טיפול רפואי ואינה מחליפה התייעצות עם רופא.</p>
            <p>4. Capsula Israel שומרת לעצמה את הזכות לשנות את תוכן האתר ללא הודעה מוקדמת.</p>
            <p>5. כל הזכויות על חומרי האתר שייכות ל-Capsula Israel.</p>
            <p>6. תוצאות התוכנית אינדיבידואליות ועשויות להשתנות בין לקוחות שונים.</p>
            <p>7. סכסוכים יוכרעו בהתאם לחוקי מדינת ישראל בבתי המשפט במחוז תל אביב.</p>
          </div>

          <div className="text-center mt-12">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#F5F3ED] text-[#302012] rounded-lg hover:bg-[#F5F3ED]/90 transition-colors"
            >
              ← На главную
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
