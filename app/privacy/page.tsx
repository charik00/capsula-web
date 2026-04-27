export default function PrivacyPage() {
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
          <h1 className="text-3xl md:text-5xl">Политика конфиденциальности / מדיניות פרטיות</h1>

          <div className="space-y-4 text-base md:text-lg leading-relaxed text-[#F5F3ED]/90">
            <p>
              Сайт capsulaisrael.com принадлежит компании Capsula Israel. Мы серьёзно относимся к защите
              ваших персональных данных в соответствии с Законом о защите частной жизни Израиля (5741-1981).
            </p>
            <p>Какие данные мы собираем: Имя и номер телефона при заполнении формы заявки.</p>
            <p>Как мы используем данные: Исключительно для связи с вами. Данные не передаются третьим лицам.</p>
            <p>Хранение: Данные хранятся в защищённой системе. По запросу удаляются.</p>
            <p>Ваши права: Запрос доступа, исправления или удаления — info@capsulaisrael.com</p>
            <p>Cookie: Технические cookie для работы сайта. Аналитические — только с вашего согласия.</p>
            <p>Применимое право: Законодательство Государства Израиль.</p>
          </div>

          <div dir="rtl" className="space-y-4 text-base md:text-lg leading-relaxed text-[#F5F3ED]/90">
            <p>
              האתר capsulaisrael.com שייך לחברת Capsula Israel. אנו מתייחסים ברצינות להגנה על המידע האישי שלך
              בהתאם לחוק הגנת הפרטיות הישראלי (5741-1981).
            </p>
            <p>אילו נתונים אנו אוספים: שם ומספר טלפון בעת מילוי טופס הבקשה.</p>
            <p>כיצד אנו משתמשים בנתונים: אך ורק ליצירת קשר עמך. המידע אינו מועבר לצדדים שלישיים.</p>
            <p>שמירת נתונים: הנתונים נשמרים במערכת מאובטחת. לפי בקשתך יימחקו.</p>
            <p>הזכויות שלך: בקשת גישה, תיקון או מחיקה — info@capsulaisrael.com</p>
            <p>עוגיות: עוגיות טכניות לתפקוד תקין. אנליטיות רק בהסכמתך.</p>
            <p>חוק החל: חוקי מדינת ישראל.</p>
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
