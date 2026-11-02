-- Practice Speaking + Write a Paragraph: starter topics with English and Arabic text.
-- Run AFTER migration 20261102230000_create_practice_topics. Safe to re-run (fixed ids, ON CONFLICT DO NOTHING).
-- Edit or add topics later from the admin dashboard; ai_prompt is backend-only and never shown to students.

INSERT INTO practice_topics (id, kind, level_code, xp_reward, time_limit_seconds, min_words, ai_prompt, sort_order) VALUES
  ('e0000000-0000-0000-0000-000000000101', 'speaking', 'A1', 20, 180, NULL, 'You are Sam, a friendly friend of the student. The two of you are chatting about weekend plans. Start by asking what they want to do this weekend. React to what they say, ask one short follow-up question at a time, and share one small thing about your own plans.', 1),
  ('e0000000-0000-0000-0000-000000000102', 'speaking', 'A2', 30, 240, NULL, 'You are Mr. Brown, the student''s boss at a small company. The student is your employee and wants to ask you for one day off next week. Be polite but realistic: ask why, when, and who will cover their work. Stay in role as the boss; keep each turn to one or two short sentences.', 2),
  ('e0000000-0000-0000-0000-000000000103', 'speaking', 'A2', 30, 240, NULL, 'You are Alex, a friendly classmate the student has just met at a community class. The two of you are planning a fun, respectful day out together as friends: where to go, what time, what to eat. Keep the tone light and polite, ask one short question at a time, and stay in role.', 3),
  ('e0000000-0000-0000-0000-000000000104', 'speaking', 'A1', 20, 180, NULL, 'You are a waiter at a small restaurant and the student is the customer. Greet them, offer a simple menu (soup, chicken, pasta, salad, tea, juice), take their order, and ask if they want anything else. Keep turns very short and speak simply.', 4),
  ('e0000000-0000-0000-0000-000000000105', 'speaking', 'A2', 30, 240, NULL, 'You are Dr. Lee, a kind doctor. The student is your patient and does not feel well. Ask what is wrong, how long it has lasted, and give simple, safe advice (rest, water, see a pharmacist). Do not give diagnoses or name medicines. Keep turns short and simple.', 5),
  ('e0000000-0000-0000-0000-000000000106', 'speaking', 'A1', 20, 180, NULL, 'You are a shop assistant in a clothes shop and the student is a customer who wants to buy a shirt. Ask about size, colour and budget, suggest one or two items, and talk about the price. Keep turns very short and speak simply.', 6),
  ('e0000000-0000-0000-0000-000000000201', 'writing', 'A1', 20, 600, 30, 'The student describes their daily routine from morning to night.', 1),
  ('e0000000-0000-0000-0000-000000000202', 'writing', 'A1', 20, 600, 30, 'The student describes their best friend: appearance, personality and what they do together.', 2),
  ('e0000000-0000-0000-0000-000000000203', 'writing', 'A1', 20, 600, 30, 'The student describes their family members and what each one does.', 3),
  ('e0000000-0000-0000-0000-000000000204', 'writing', 'A2', 30, 900, 50, 'The student writes about their favourite food: what it is, how it tastes, and when they eat it.', 4),
  ('e0000000-0000-0000-0000-000000000205', 'writing', 'A2', 30, 900, 50, 'The student tells about a trip they took, using the past tense: where, with whom, what they did.', 5),
  ('e0000000-0000-0000-0000-000000000206', 'writing', 'A2', 30, 900, 50, 'The student writes about their dream job: what it is, why they want it and what they need to learn.', 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO practice_topic_translations (topic_id, locale, title, description) VALUES
  ('e0000000-0000-0000-0000-000000000101', 'en', 'Chat with a friend: weekend plans', 'Talk to a friend about what you will do this weekend.'),
  ('e0000000-0000-0000-0000-000000000101', 'ar', 'محادثة مع صديق: خطط نهاية الأسبوع', 'تحدّث مع صديقك عمّا ستفعله في نهاية هذا الأسبوع.'),
  ('e0000000-0000-0000-0000-000000000102', 'en', 'Employee and boss: asking for a day off', 'You are an employee. Ask your boss politely for a day off.'),
  ('e0000000-0000-0000-0000-000000000102', 'ar', 'موظف ومديره: طلب إجازة ليوم', 'أنت موظف. اطلب من مديرك بأدب إجازة ليوم واحد.'),
  ('e0000000-0000-0000-0000-000000000103', 'en', 'Two friends planning a day out', 'A boy and a girl who are friends plan a day out together.'),
  ('e0000000-0000-0000-0000-000000000103', 'ar', 'صديقان يخططان ليوم خارج المنزل', 'شاب وفتاة صديقان يخططان لقضاء يوم معًا.'),
  ('e0000000-0000-0000-0000-000000000104', 'en', 'At a restaurant', 'Order food and drinks from a waiter.'),
  ('e0000000-0000-0000-0000-000000000104', 'ar', 'في المطعم', 'اطلب الطعام والمشروبات من النادل.'),
  ('e0000000-0000-0000-0000-000000000105', 'en', 'At the doctor', 'Tell the doctor how you feel and listen to simple advice.'),
  ('e0000000-0000-0000-0000-000000000105', 'ar', 'عند الطبيب', 'أخبر الطبيب كيف تشعر واستمع إلى نصيحة بسيطة.'),
  ('e0000000-0000-0000-0000-000000000106', 'en', 'Shopping for clothes', 'Buy a shirt: talk about size, colour and price.'),
  ('e0000000-0000-0000-0000-000000000106', 'ar', 'شراء الملابس', 'اشترِ قميصًا: تحدّث عن المقاس واللون والسعر.'),
  ('e0000000-0000-0000-0000-000000000201', 'en', 'My daily routine', 'Write about what you do from the morning until the night.'),
  ('e0000000-0000-0000-0000-000000000201', 'ar', 'روتيني اليومي', 'اكتب عمّا تفعله من الصباح حتى الليل.'),
  ('e0000000-0000-0000-0000-000000000202', 'en', 'My best friend', 'Describe your best friend and what you do together.'),
  ('e0000000-0000-0000-0000-000000000202', 'ar', 'صديقي المفضل', 'صِف صديقك المفضل وما تفعلانه معًا.'),
  ('e0000000-0000-0000-0000-000000000203', 'en', 'My family', 'Write about the people in your family.'),
  ('e0000000-0000-0000-0000-000000000203', 'ar', 'عائلتي', 'اكتب عن أفراد عائلتك.'),
  ('e0000000-0000-0000-0000-000000000204', 'en', 'My favourite food', 'Write about the food you like most and why.'),
  ('e0000000-0000-0000-0000-000000000204', 'ar', 'طعامي المفضل', 'اكتب عن الطعام الذي تحبه أكثر ولماذا.'),
  ('e0000000-0000-0000-0000-000000000205', 'en', 'A trip I took', 'Tell about a trip you took in the past.'),
  ('e0000000-0000-0000-0000-000000000205', 'ar', 'رحلة قمت بها', 'احكِ عن رحلة قمت بها في الماضي.'),
  ('e0000000-0000-0000-0000-000000000206', 'en', 'My dream job', 'Write about the job you want in the future.'),
  ('e0000000-0000-0000-0000-000000000206', 'ar', 'وظيفة أحلامي', 'اكتب عن الوظيفة التي تريدها في المستقبل.')
ON CONFLICT (topic_id, locale) DO NOTHING;
