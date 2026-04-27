export default function AccessibilityPage() {
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
          <h1 className="text-3xl md:text-5xl">Доступность / הצהרת נגישות</h1>

          <div className="space-y-4 text-base md:text-lg leading-relaxed text-[#F5F3ED]/90">
            <p>
              Capsula Israel стремится обеспечить доступность сайта для всех пользователей в соответствии с
              израильским стандартом (SI 5568) и Законом о равных правах для людей с ограниченными возможностями.
            </p>
            <p>Уровень доступности: AA (WCAG 2.1)</p>
            <p>
              Что реализовано: текст читается программами для чтения с экрана; контрастность соответствует
              стандарту; навигация доступна с клавиатуры; изображения содержат описания (alt text); размер шрифта
              можно увеличить в браузере.
            </p>
            <p>
              Известные ограничения: видео на мобильной версии пока не имеет субтитров. Мы работаем над этим.
            </p>
            <p>Координатор по доступности: info@capsulaisrael.com, 054-485-5822</p>
            <p>Дата последней проверки: апрель 2026</p>
          </div>

          <div dir="rtl" className="space-y-4 text-base md:text-lg leading-relaxed text-[#F5F3ED]/90">
            <p>
              Capsula Israel שואפת להנגיש את האתר לכלל המשתמשים בהתאם לתקן הנגישות הישראלי (SI 5568) וחוק שוויון
              זכויות לאנשים עם מוגבלות.
            </p>
            <p>רמת הנגישות: AA (WCAG 2.1)</p>
            <p>
              מה יושם: הטקסט נקרא על ידי תוכנות קריאת מסך; ניגודיות הטקסט עומדת בתקן; ניווט זמין באמצעות מקלדת;
              תמונות כוללות תיאורים; ניתן להגדיל גופן בדפדפן.
            </p>
            <p>מגבלות ידועות: לסרטון בגרסה הניידת אין כתוביות בשלב זה. אנו עובדים על כך.</p>
            <p>רכז נגישות: info@capsulaisrael.com, 054-485-5822</p>
            <p>תאריך בדיקה אחרונה: אפריל 2026</p>
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
