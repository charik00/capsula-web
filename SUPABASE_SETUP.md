# Настройка Supabase для формы захвата

## 1. Создание таблицы leads в Supabase

1. Откройте ваш проект в Supabase Dashboard
2. Перейдите в раздел "Table Editor"
3. Нажмите "New Table"
4. Назовите таблицу `leads`
5. Добавьте следующие колонки:

| Column Name | Type | Default Value | Nullable |
|------------|------|---------------|----------|
| id | uuid | gen_random_uuid() | false (Primary Key) |
| first_name | text | - | false |
| last_name | text | - | false |
| phone | text | - | false |
| created_at | timestamptz | now() | false |

6. Сохраните таблицу

## 2. Настройка Row Level Security (RLS)

1. Перейдите в раздел "Authentication" > "Policies"
2. Для таблицы `leads` создайте политику:
   - Policy Name: "Allow insert for all"
   - Allowed Operation: INSERT
   - Target Roles: anon
   - USING expression: `true`
   - WITH CHECK expression: `true`

Или выполните SQL:

```sql
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for all" ON leads
  FOR INSERT
  TO anon
  WITH CHECK (true);
```

## 3. Настройка переменных окружения

1. Скопируйте `.env.example` в `.env.local`
2. Заполните переменные:
   - `NEXT_PUBLIC_SUPABASE_URL` - URL вашего проекта (можно найти в Settings > API)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon/Public key (можно найти в Settings > API)

## 4. Установка зависимостей

```bash
npm install @supabase/supabase-js
```

## Готово!

После выполнения этих шагов форма захвата будет работать и сохранять данные в таблицу `leads`.
