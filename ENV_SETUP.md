# Настройка переменных окружения

## Важно!

Файл `.env.local` должен находиться в **корне проекта** (на том же уровне, что и `package.json`), а НЕ в папке `.next/`.

## Создание файла .env.local

1. Создайте файл `.env.local` в корне проекта (рядом с `package.json`)
2. Добавьте следующие переменные:

```env
NEXT_PUBLIC_SUPABASE_URL=https://bwqymhrzywfzcdzonsd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cXltaHJ6eXdmemNkenpvbnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzM5NjAsImV4cCI6MjA4NTgwOTk2MH0.27u9e9QW4vT9T6nTRg536k-QyWg5OV-BlcoSwkR6PqQ
```

## После создания файла

1. **Перезапустите dev сервер** (остановите `npm run dev` и запустите снова)
2. Next.js загружает переменные окружения только при старте сервера

## Проверка

После перезапуска в консоли сервера вы должны увидеть:
- `Supabase URL: ✓ Set`
- `Supabase Key: ✓ Set`

Если видите `✗ Missing`, проверьте:
- Файл находится в корне проекта (не в `.next/`)
- Названия переменных написаны правильно (без опечаток)
- Сервер был перезапущен после создания файла
