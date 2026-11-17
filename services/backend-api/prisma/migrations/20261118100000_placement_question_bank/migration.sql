-- Placement test: bigger randomised question bank + per-attempt random draw.
--
-- Scope: Placement Test only.
--  1. placement_questions gets a difficulty band (1 = Starter/A1.1 ... 4 = A2.2+/B1) and an
--     is_active flag so the admin can retire a question without deleting its answers.
--  2. placement_sections gets draw_count: how many bank questions each student receives.
--  3. placement_attempt_questions stores the random set drawn for each attempt (resume-safe).
--  4. Seeds ~30 questions for each of grammar / vocabulary / reading / listening and
--     10 writing + 10 speaking prompts. The 26 questions already live stay in the bank.

ALTER TABLE placement_questions
  ADD COLUMN IF NOT EXISTS difficulty SMALLINT NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE placement_questions
  DROP CONSTRAINT IF EXISTS placement_questions_difficulty_check;
ALTER TABLE placement_questions
  ADD CONSTRAINT placement_questions_difficulty_check CHECK (difficulty BETWEEN 1 AND 4);

ALTER TABLE placement_sections
  ADD COLUMN IF NOT EXISTS draw_count INTEGER NULL;
ALTER TABLE placement_sections
  DROP CONSTRAINT IF EXISTS placement_sections_draw_count_check;
ALTER TABLE placement_sections
  ADD CONSTRAINT placement_sections_draw_count_check CHECK (draw_count IS NULL OR draw_count > 0);

CREATE TABLE IF NOT EXISTS placement_attempt_questions (
  placement_attempt_id UUID NOT NULL REFERENCES placement_attempts (id) ON DELETE CASCADE,
  placement_question_id UUID NOT NULL REFERENCES placement_questions (id) ON DELETE CASCADE,
  placement_section_id UUID NOT NULL REFERENCES placement_sections (id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (placement_attempt_id, placement_question_id)
);
CREATE INDEX IF NOT EXISTS placement_attempt_questions_section_idx
  ON placement_attempt_questions (placement_attempt_id, placement_section_id, position);
CREATE INDEX IF NOT EXISTS placement_attempt_questions_question_idx
  ON placement_attempt_questions (placement_question_id);

-- Existing questions: spread them over the difficulty bands by their position (1..6).
UPDATE placement_questions
SET difficulty = CASE order_index WHEN 1 THEN 1 WHEN 2 THEN 1 WHEN 3 THEN 2 WHEN 4 THEN 3 WHEN 5 THEN 3 ELSE 4 END
WHERE order_index <= 6 AND placement_section_id IN (
  SELECT id FROM placement_sections WHERE skill_code IN ('grammar', 'vocabulary', 'reading', 'listening'));

-- Number of questions each student draws from the bank.
UPDATE placement_sections SET draw_count = CASE skill_code
  WHEN 'grammar' THEN 9 WHEN 'vocabulary' THEN 9 WHEN 'reading' THEN 8 WHEN 'listening' THEN 8
  WHEN 'writing' THEN 1 WHEN 'speaking' THEN 1 END
WHERE placement_test_id IN (SELECT id FROM placement_tests WHERE status = 'published');

-- New bank questions.
DROP TABLE IF EXISTS _new_bank;
CREATE TEMP TABLE _new_bank (
  skill_code TEXT, question_type TEXT, difficulty SMALLINT, prompt TEXT, correct_answer TEXT,
  listening_script TEXT, order_index INTEGER
);

INSERT INTO _new_bank VALUES
  ('grammar', 'multiple_choice', 1, 'Choose the correct word:

My brother ___ 12 years old.

A) am
B) is
C) be
D) are', 'B', NULL, 101),
  ('grammar', 'multiple_choice', 1, 'Choose the correct word:

___ you like pizza?

A) Does
B) Are
C) Is
D) Do', 'D', NULL, 102),
  ('grammar', 'multiple_choice', 1, 'Choose the correct word:

There ___ two books on the table.

A) are
B) am
C) is
D) be', 'A', NULL, 103),
  ('grammar', 'multiple_choice', 1, 'Choose the correct word:

I ___ breakfast every morning.

A) has
B) have
C) having
D) am have', 'B', NULL, 104),
  ('grammar', 'true_false', 1, 'Is this sentence correct?

"He don''t like milk."

A) True
B) False', 'false', NULL, 105),
  ('grammar', 'multiple_choice', 1, 'Choose the correct word:

This is ___ apple.

A) some
B) an
C) the
D) a', 'B', NULL, 106),
  ('grammar', 'multiple_choice', 1, 'Choose the correct word:

They ___ playing football now.

A) do
B) are
C) am
D) is', 'B', NULL, 107),
  ('grammar', 'multiple_choice', 1, 'Choose the correct word:

Where ___ she live?

A) do
B) are
C) does
D) is', 'C', NULL, 108),
  ('grammar', 'multiple_choice', 2, 'Choose the correct word:

Yesterday we ___ to the park.

A) going
B) went
C) go
D) goes', 'B', NULL, 109),
  ('grammar', 'multiple_choice', 2, 'Choose the correct word:

I am taller ___ my sister.

A) that
B) than
C) as
D) then', 'B', NULL, 110),
  ('grammar', 'multiple_choice', 2, 'Choose the correct form:

She ___ TV when I called.

A) is watching
B) was watching
C) watches
D) watched', 'B', NULL, 111),
  ('grammar', 'multiple_choice', 2, 'Choose the correct word:

You ___ smoke here. It is not allowed.

A) may
B) needn''t
C) don''t have to
D) mustn''t', 'D', NULL, 112),
  ('grammar', 'multiple_choice', 2, 'Choose the correct word:

How ___ water do you drink every day?

A) few
B) a lot
C) much
D) many', 'C', NULL, 113),
  ('grammar', 'true_false', 2, 'Is this sentence correct?

"I have lived here since five years."

A) True
B) False', 'false', NULL, 114),
  ('grammar', 'multiple_choice', 2, 'Choose the correct form:

If it rains tomorrow, we ___ at home.

A) will stay
B) would stay
C) stayed
D) stay', 'A', NULL, 115),
  ('grammar', 'multiple_choice', 2, 'Choose the correct word:

This is the ___ film I have ever seen.

A) best
B) good
C) most good
D) better', 'A', NULL, 116),
  ('grammar', 'multiple_choice', 3, 'Choose the correct form:

I ___ my keys. Can you help me look for them?

A) lost
B) lose
C) have lost
D) was losing', 'C', NULL, 117),
  ('grammar', 'multiple_choice', 3, 'Choose the correct sentence:

She asked me ...

A) where I lived.
B) where do I live.
C) where did I live.
D) where I do live.', 'A', NULL, 118),
  ('grammar', 'multiple_choice', 3, 'Choose the correct form:

If I ___ more money, I would buy a bigger house.

A) had
B) will have
C) would have
D) have', 'A', NULL, 119),
  ('grammar', 'multiple_choice', 3, 'Choose the correct form:

The letter ___ yesterday.

A) sent
B) was sent
C) has sent
D) is sent', 'B', NULL, 120),
  ('grammar', 'multiple_choice', 3, 'Choose the correct form:

He is used to ___ up early.

A) getting
B) gets
C) got
D) get', 'A', NULL, 121),
  ('grammar', 'true_false', 3, 'Is this sentence correct?

"She suggested to go to the cinema."

A) True
B) False', 'false', NULL, 122),
  ('grammar', 'multiple_choice', 3, 'Choose the correct word:

I wish I ___ speak French.

A) would
B) could
C) can
D) will', 'B', NULL, 123),
  ('grammar', 'multiple_choice', 3, 'Choose the correct form:

By the time we arrived, the film ___.

A) was starting
B) has started
C) had started
D) started', 'C', NULL, 124),
  ('grammar', 'multiple_choice', 4, 'Choose the correct sentence:

Not only ___ late, but he also forgot the documents.

A) was he
B) did he
C) he was
D) he is', 'A', NULL, 125),
  ('grammar', 'multiple_choice', 4, 'Choose the correct form:

Had I known about the delay, I ___ earlier.

A) left
B) had left
C) would leave
D) would have left', 'D', NULL, 126),
  ('grammar', 'multiple_choice', 4, 'Choose the correct form:

The manager insisted that she ___ present at the meeting.

A) is
B) being
C) was
D) be', 'D', NULL, 127),
  ('grammar', 'multiple_choice', 4, 'Choose the correct form:

Neither of the answers ___ correct.

A) were
B) be
C) are
D) is', 'D', NULL, 128),
  ('grammar', 'true_false', 4, 'Is this sentence correct?

"Hardly had he sat down when the phone rang."

A) True
B) False', 'true', NULL, 129),
  ('grammar', 'multiple_choice', 4, 'Choose the correct form:

She is said ___ the best surgeon in the city.

A) is
B) to being
C) being
D) to be', 'D', NULL, 130),
  ('vocabulary', 'multiple_choice', 1, 'What is the opposite of "big"?

A) long
B) small
C) tall
D) wide', 'B', NULL, 101),
  ('vocabulary', 'multiple_choice', 1, 'Which word means a person who teaches students?

A) driver
B) farmer
C) doctor
D) teacher', 'D', NULL, 102),
  ('vocabulary', 'multiple_choice', 1, 'Which day comes after Monday?

A) Sunday
B) Wednesday
C) Friday
D) Tuesday', 'D', NULL, 103),
  ('vocabulary', 'fill_blank', 1, 'Complete the sentence with one word:

I drink ___ when I am thirsty. (w____)', 'water', NULL, 104),
  ('vocabulary', 'multiple_choice', 1, 'Which one is a fruit?

A) carrot
B) potato
C) banana
D) onion', 'C', NULL, 105),
  ('vocabulary', 'multiple_choice', 1, 'Which word is a color?

A) happy
B) fast
C) green
D) round', 'C', NULL, 106),
  ('vocabulary', 'multiple_choice', 1, 'A "sister" is a ___ family member.

A) female
B) old
C) small
D) male', 'A', NULL, 107),
  ('vocabulary', 'fill_blank', 1, 'Complete the sentence with one word:

We sleep in a ___. (b__)', 'bed', NULL, 108),
  ('vocabulary', 'multiple_choice', 2, 'Which word means "very big"?

A) huge
B) tiny
C) quiet
D) narrow', 'A', NULL, 109),
  ('vocabulary', 'multiple_choice', 2, 'Choose the correct word:

I need to ___ my teeth every night.

A) brush
B) clean up
C) comb
D) wash', 'A', NULL, 110),
  ('vocabulary', 'multiple_choice', 2, 'Which word describes the weather when water falls from the sky?

A) foggy
B) windy
C) sunny
D) rainy', 'D', NULL, 111),
  ('vocabulary', 'fill_blank', 2, 'Complete the sentence with one word:

A place where you borrow books is a ___. (l_____)', 'library', NULL, 112),
  ('vocabulary', 'multiple_choice', 2, 'Choose the correct word:

He was so ___ that he fell asleep in class.

A) tired
B) tires
C) tire
D) tiring', 'A', NULL, 113),
  ('vocabulary', 'multiple_choice', 2, 'Which is the best word?

The train leaves at 8:00. Please don''t be ___.

A) lately
B) last
C) late
D) slow', 'C', NULL, 114),
  ('vocabulary', 'multiple_choice', 2, 'What does "borrow" mean?

A) take something and give it back later
B) keep something forever
C) give something as a gift
D) buy something', 'A', NULL, 115),
  ('vocabulary', 'multiple_choice', 2, 'Which phrase is correct?

A) make a mistake
B) do a mistake
C) take a mistake
D) have a mistake', 'A', NULL, 116),
  ('vocabulary', 'multiple_choice', 3, 'Choose the correct word:

The company will ___ a new product next month.

A) lend
B) lunch
C) lean
D) launch', 'D', NULL, 117),
  ('vocabulary', 'multiple_choice', 3, 'Which word means the same as "begin"?

A) commence
B) continue
C) complete
D) conclude', 'A', NULL, 118),
  ('vocabulary', 'fill_blank', 3, 'Complete the sentence with one word:

He has a lot of ___ because he has worked in this job for 15 years. (e________)', 'experience', NULL, 119),
  ('vocabulary', 'multiple_choice', 3, 'Choose the correct word:

I can''t ___ this noise any longer.

A) stay
B) stand
C) stick
D) stop', 'B', NULL, 120),
  ('vocabulary', 'multiple_choice', 3, 'What does "reliable" mean?

A) someone you can trust
B) someone who is very rich
C) someone who is always late
D) someone who talks too much', 'A', NULL, 121),
  ('vocabulary', 'multiple_choice', 3, 'Choose the correct phrasal verb:

Please ___ your shoes before you enter the house.

A) give up
B) put off
C) turn down
D) take off', 'D', NULL, 122),
  ('vocabulary', 'multiple_choice', 3, 'Which word is the opposite of "generous"?

A) polite
B) selfish
C) careful
D) friendly', 'B', NULL, 123),
  ('vocabulary', 'multiple_choice', 3, 'Choose the best word:

There has been a ___ increase in prices this year.

A) sharpen
B) sharply
C) sharp
D) sharpness', 'C', NULL, 124),
  ('vocabulary', 'multiple_choice', 4, 'Which word means "to make something less severe"?

A) accumulate
B) abandon
C) alleviate
D) aggravate', 'C', NULL, 125),
  ('vocabulary', 'multiple_choice', 4, 'Choose the best word:

The two reports gave ___ results, so we could not decide.

A) identical
B) conflicting
C) consistent
D) converting', 'B', NULL, 126),
  ('vocabulary', 'fill_blank', 4, 'Complete the sentence with one word:

It is hard to make ___ meet when prices keep rising. (e___)', 'ends', NULL, 127),
  ('vocabulary', 'multiple_choice', 4, 'What does "ambiguous" mean?

A) having more than one possible meaning
B) extremely important
C) very clear
D) easy to forget', 'A', NULL, 128),
  ('vocabulary', 'multiple_choice', 4, 'Choose the best word:

Her success was largely ___ to years of hard work.

A) distributed
B) substituted
C) attributed
D) contributed', 'C', NULL, 129),
  ('vocabulary', 'multiple_choice', 4, 'Which word is closest in meaning to "reluctant"?

A) unwilling
B) confident
C) curious
D) eager', 'A', NULL, 130),
  ('reading', 'multiple_choice', 1, 'Read:

"Sam has a dog. The dog is brown. It likes to run in the park."

What color is the dog?

A) yellow
B) black
C) brown
D) white', 'C', NULL, 101),
  ('reading', 'multiple_choice', 1, 'Read:

"Anna gets up at 6 o''clock. She eats breakfast at 7 and goes to school at 8."

When does Anna eat breakfast?

A) at 9 o''clock
B) at 6 o''clock
C) at 7 o''clock
D) at 8 o''clock', 'C', NULL, 102),
  ('reading', 'true_false', 1, 'Read:

"The shop opens at nine and closes at five."

The shop is open at four o''clock.

A) True
B) False', 'true', NULL, 103),
  ('reading', 'multiple_choice', 1, 'Read:

"Tom lives in a small house with his mother, his father and his sister."

How many people live in Tom''s house?

A) six
B) three
C) five
D) four', 'D', NULL, 104),
  ('reading', 'multiple_choice', 1, 'Read the sign:

"NO PARKING"

What does the sign mean?

A) Cars must go fast.
B) You cannot leave your car here.
C) The road is closed.
D) You can leave your car here.', 'B', NULL, 105),
  ('reading', 'multiple_choice', 1, 'Read:

"Lina likes tea with milk but without sugar."

What does Lina put in her tea?

A) honey
B) milk
C) sugar
D) lemon', 'B', NULL, 106),
  ('reading', 'true_false', 1, 'Read:

"It is Friday today. Tomorrow is Saturday."

Tomorrow is the weekend.

A) True
B) False', 'true', NULL, 107),
  ('reading', 'multiple_choice', 1, 'Read:

"Ali has two cats and three fish."

How many animals does Ali have?

A) six
B) three
C) five
D) two', 'C', NULL, 108),
  ('reading', 'multiple_choice', 2, 'Read:

"Dear Maya, I am writing from the beach. The weather is hot and the water is warm. We swim every morning and eat fresh fish for dinner. See you next week! Love, Hana"

Where is Hana?

A) at the beach
B) at school
C) at home
D) in the mountains', 'A', NULL, 109),
  ('reading', 'multiple_choice', 2, 'Read the notice:

"The swimming pool is closed on Mondays for cleaning. It opens at 7 a.m. on all other days."

When can you NOT swim?

A) on Friday
B) at 7 a.m.
C) on Monday
D) on Sunday', 'C', NULL, 110),
  ('reading', 'true_false', 2, 'Read:

"Karim wanted to play outside, but it was raining, so he stayed at home and read a book."

Karim went outside.

A) True
B) False', 'false', NULL, 111),
  ('reading', 'multiple_choice', 2, 'Read:

"Layla is learning to cook. Last week she made soup, and today she is making a cake for her father''s birthday."

Why is Layla making a cake?

A) She is learning to swim.
B) Her friend asked her to.
C) She is hungry.
D) It is her father''s birthday.', 'D', NULL, 112),
  ('reading', 'multiple_choice', 2, 'Read:

"The bus to the city centre leaves every 20 minutes. The journey takes about half an hour."

How long is the journey?

A) one hour
B) 20 minutes
C) 10 minutes
D) 30 minutes', 'D', NULL, 113),
  ('reading', 'multiple_choice', 2, 'Read the message:

"Hi Sara, I can''t come to the party on Saturday because I have to visit my grandmother. Sorry! Can we meet on Sunday instead? Nora"

Why can''t Nora come on Saturday?

A) She is ill.
B) She has an exam.
C) She is on holiday.
D) She is visiting her grandmother.', 'D', NULL, 114),
  ('reading', 'multiple_choice', 2, 'Read:

"Many people drink coffee in the morning because it helps them wake up. However, drinking too much coffee can make it difficult to sleep at night."

What is the problem with too much coffee?

A) It makes you hungry.
B) It can stop you from sleeping.
C) It is very expensive.
D) It makes you tall.', 'B', NULL, 115),
  ('reading', 'true_false', 2, 'Read:

"Fatima''s flight leaves at 6 p.m. She must be at the airport two hours before."

Fatima must arrive at the airport at 4 p.m.

A) True
B) False', 'true', NULL, 116),
  ('reading', 'multiple_choice', 3, 'Read:

"Although the hotel was cheap, the rooms were clean and the staff were friendly. The only problem was the noise from the street at night."

What was the problem with the hotel?

A) the unfriendly staff
B) the dirty rooms
C) the high price
D) the noise at night', 'D', NULL, 117),
  ('reading', 'multiple_choice', 3, 'Read:

"Recycling paper saves trees and reduces the amount of rubbish that goes to landfills. Many cities now provide special bins so that people can recycle easily."

What is the main idea?

A) Landfills are growing smaller.
B) Trees are very expensive.
C) Recycling paper has benefits and is easy to do.
D) Cities do not have enough bins.', 'C', NULL, 118),
  ('reading', 'multiple_choice', 3, 'Read the email:

"Thank you for your order. Unfortunately, the blue jacket is out of stock. We can send you the black one at the same price, or give you a full refund. Please reply by Friday."

What should the customer do?

A) Wait for the blue jacket.
B) Tell the shop what they prefer by Friday.
C) Return the blue jacket.
D) Pay more money.', 'B', NULL, 119),
  ('reading', 'true_false', 3, 'Read:

"The museum offers free entry for children under 12, but adults must pay. On the first Sunday of each month, entry is free for everyone."

An adult can enter for free on the first Sunday of the month.

A) True
B) False', 'true', NULL, 120),
  ('reading', 'multiple_choice', 3, 'Read:

"Omar had never been on a plane before, so he felt nervous. However, once the flight began, he relaxed and enjoyed the view from the window."

How did Omar feel at the end?

A) relaxed
B) bored
C) sick
D) angry', 'A', NULL, 121),
  ('reading', 'multiple_choice', 3, 'Read:

"Working from home saves time because there is no commute. On the other hand, some people feel lonely and find it hard to separate work from free time."

What is one disadvantage of working from home?

A) It wastes time.
B) People may feel lonely.
C) It costs more money.
D) It needs a car.', 'B', NULL, 122),
  ('reading', 'multiple_choice', 3, 'Read:

"The festival begins on Thursday evening with a concert in the main square. On Friday and Saturday there will be food stalls and street theatre, and it ends on Sunday with fireworks."

When are the fireworks?

A) on Friday
B) on Saturday
C) on Sunday
D) on Thursday', 'C', NULL, 123),
  ('reading', 'multiple_choice', 3, 'Read:

"Dr. Hassan advised his patients to walk for at least thirty minutes a day. He explained that even moderate exercise can improve both physical and mental health."

What did Dr. Hassan recommend?

A) strict diets
B) more sleep
C) less work
D) daily walking', 'D', NULL, 124),
  ('reading', 'multiple_choice', 4, 'Read:

"Critics of the new tax argue that it will hit low-income families hardest, since a larger share of their income goes on basic goods. Supporters reply that the extra revenue will fund public transport, which those same families rely on."

What do supporters of the tax say?

A) The money will improve services poorer families use.
B) Basic goods will become cheaper.
C) Low-income families will pay nothing.
D) Public transport will be abolished.', 'A', NULL, 125),
  ('reading', 'multiple_choice', 4, 'Read:

"The study found no direct link between screen time and poor grades. Instead, researchers suggested that lack of sleep, which often accompanies late-night screen use, was the more likely cause."

What do the researchers think is the likely cause of poor grades?

A) playing sports
B) watching television
C) reading before bed
D) not getting enough sleep', 'D', NULL, 126),
  ('reading', 'true_false', 4, 'Read:

"Far from being a sudden invention, the bicycle evolved gradually over decades, with many inventors contributing improvements."

The text says the bicycle was invented suddenly by one person.

A) True
B) False', 'false', NULL, 127),
  ('reading', 'multiple_choice', 4, 'Read:

"While renewable energy has grown rapidly, it still supplies only a fraction of global demand. Analysts warn that without investment in storage technology, the unpredictability of wind and solar power will limit further expansion."

What might limit the growth of renewable energy?

A) too many investors
B) a lack of wind and sun worldwide
C) low global demand
D) difficulty storing the energy', 'D', NULL, 128),
  ('reading', 'multiple_choice', 4, 'Read:

"The author''s tone throughout the essay is cautious: she presents the evidence carefully, acknowledges its limits, and avoids claiming that the findings apply to every situation."

Which word best describes the author''s approach?

A) careless
B) careful
C) humorous
D) aggressive', 'B', NULL, 129),
  ('reading', 'multiple_choice', 4, 'Read:

"Contrary to popular belief, goldfish can remember things for months, not seconds. Experiments show they can learn to find food at certain times and recognise the people who feed them."

What is the writer''s point?

A) Goldfish dislike people.
B) Goldfish forget everything quickly.
C) Goldfish cannot be trained to eat.
D) Goldfish have better memories than people think.', 'D', NULL, 130),
  ('listening', 'listening_choice', 1, 'How old is Sara?

A) eleven
B) ten
C) nine
D) twelve', 'B', 'Hello, my name is Sara. I am ten years old and I live in Cairo.', 101),
  ('listening', 'listening_choice', 1, 'Where is the bag?

A) under the bed
B) on the table
C) on the chair
D) in the car', 'C', 'I have a red bag and a blue pen. My bag is on the chair.', 102),
  ('listening', 'listening_choice', 1, 'What day is it?

A) Sunday
B) Friday
C) Tuesday
D) Monday', 'D', 'Good morning, class. Today is Monday. Please open your books.', 103),
  ('listening', 'listening_choice', 1, 'What does the child want?

A) a banana
B) a sandwich
C) an apple
D) some water', 'C', 'Mum, I am hungry. Can I have an apple, please?', 104),
  ('listening', 'listening_choice', 1, 'Where is the cat?

A) in the garden
B) under the table
C) behind the door
D) on the table', 'B', 'The cat is sleeping under the table.', 105),
  ('listening', 'listening_choice', 1, 'What is the father''s job?

A) doctor
B) teacher
C) farmer
D) driver', 'A', 'My father works in a hospital. He is a doctor.', 106),
  ('listening', 'listening_choice', 1, 'What are they going to do?

A) go swimming
B) play football
C) watch television
D) do homework', 'B', 'It is sunny today. We are going to the park to play football.', 107),
  ('listening', 'listening_choice', 1, 'What time is it?

A) 4:30
B) 3:30
C) 3:15
D) 2:30', 'B', 'Excuse me, what time is it? It is half past three.', 108),
  ('listening', 'listening_choice', 2, 'Which stop does the bus leave from?

A) stop eight
B) stop three
C) stop ten
D) stop five', 'D', 'The bus to the airport leaves at ten past eight from stop number five.', 109),
  ('listening', 'listening_choice', 2, 'How much is it?

A) 6.50 dollars
B) 16 dollars
C) 6 dollars
D) 5.60 dollars', 'A', 'I''d like a large coffee and a chocolate cake, please. That is six dollars fifty.', 110),
  ('listening', 'listening_choice', 2, 'When is the meeting now?

A) Tuesday at 2:00
B) Thursday at 12:00
C) Tuesday at 12:00
D) Thursday at 2:00', 'D', 'Hi Jack, it''s Emma. The meeting has moved from Tuesday to Thursday at two o''clock. Please call me back.', 111),
  ('listening', 'listening_choice', 2, 'Where must you turn right?

A) at the bank
B) at the library
C) at the traffic lights
D) at the corner shop', 'C', 'Go straight along this road, then turn right at the traffic lights. The library is next to the bank.', 112),
  ('listening', 'listening_choice', 2, 'What will the weather be like on Sunday?

A) cloudy with rain
B) cold and windy
C) warm and sunny
D) snowy', 'C', 'This weekend will be cloudy on Saturday with some rain, but Sunday will be warm and sunny.', 113),
  ('listening', 'listening_choice', 2, 'How does the speaker travel when it rains?

A) by bicycle
B) by bus
C) by taxi
D) on foot', 'B', 'I usually walk to work, but when it rains I take the bus because it is faster than waiting for a taxi.', 114),
  ('listening', 'listening_choice', 2, 'What time will they arrive?

A) 11 p.m.
B) 9 p.m.
C) 9 a.m.
D) 7 p.m.', 'B', 'Our flight is delayed by two hours, so we will not arrive until nine o''clock in the evening.', 115),
  ('listening', 'listening_choice', 2, 'What does the mother like?

A) sport and travel
B) films and shopping
C) gardening and reading
D) cooking and music', 'C', 'Can you help me? I''m looking for a gift for my mother. She likes gardening and reading.', 116),
  ('listening', 'listening_choice', 3, 'What should a caller do for a normal appointment?

A) call again tomorrow
B) press one
C) send an email
D) come in today', 'A', 'Thanks for calling the dental clinic. Our office is closed today for a public holiday. If this is an emergency, please press one. Otherwise, call back tomorrow after nine.', 117),
  ('listening', 'listening_choice', 3, 'What did the speaker decide to do?

A) go to the cinema
B) visit relatives
C) go camping
D) stay at home', 'A', 'I was planning to go camping, but the forecast says heavy rain all weekend, so I''ve decided to go to the cinema with friends instead.', 118),
  ('listening', 'listening_choice', 3, 'What do new members get if they join this week?

A) a half-price year
B) a free first month and a fitness test
C) a free gym bag
D) a personal trainer', 'B', 'The new gym opens next Monday. If you join this week, the first month is free, and you also get a free fitness test.', 119),
  ('listening', 'listening_choice', 3, 'Why is the speaker late?

A) public transport problems
B) they stayed at work
C) they overslept
D) they lost their keys', 'A', 'I''m sorry I''m late. The train was cancelled, so I had to take two buses, and the second one broke down.', 120),
  ('listening', 'listening_choice', 3, 'Until when can guests use the pool?

A) 7 a.m.
B) 10 p.m.
C) 10 a.m.
D) 8 p.m.', 'D', 'Our hotel offers breakfast from seven to ten, and there is a swimming pool on the roof, which is open until eight in the evening.', 121),
  ('listening', 'listening_choice', 3, 'What does the speaker miss?

A) the traffic
B) the restaurants
C) the noise
D) their old job', 'B', 'I used to live in a big city, but I moved to a village last year. It is much quieter, though I miss the restaurants.', 122),
  ('listening', 'listening_choice', 3, 'What should passengers have ready?

A) visa and money
B) passport and boarding pass
C) passport and phone
D) ticket and luggage', 'B', 'Attention, passengers on flight 482 to Dubai. Boarding will begin at gate twelve in ten minutes. Please have your passport and boarding pass ready.', 123),
  ('listening', 'listening_choice', 3, 'Where is the lecture now?

A) room 401
B) room 101
C) room 124
D) room 204', 'D', 'The lecture on healthy eating is moved to room 204, because room 101 is being repaired. It starts at the same time, four o''clock.', 124),
  ('listening', 'listening_choice', 4, 'Where did most of the growth come from?

A) new shops
B) advertising on television
C) online customers
D) lower prices', 'C', 'Sales rose by twelve percent in the first quarter, which is better than we expected, though most of the growth came from online customers rather than from our shops.', 125),
  ('listening', 'listening_choice', 4, 'What did the speaker do?

A) negotiated a higher salary
B) asked for more time
C) accepted the job
D) refused the job', 'D', 'I''d have accepted the job if the salary had been a little higher, but the long commute made me hesitate, so in the end I turned it down.', 126),
  ('listening', 'listening_choice', 4, 'What was the main criticism of the film?

A) a confusing ending
B) a boring beginning
C) bad acting
D) poor music', 'A', 'Although the film received excellent reviews, many viewers found the ending confusing and felt that the story was too complicated to follow.', 127),
  ('listening', 'listening_choice', 4, 'What is the speaker''s main argument?

A) cycling is dangerous
B) cars should be banned
C) cycling lanes bring several benefits
D) pollution is not a problem', 'C', 'The speaker argued that cities should invest more in cycling lanes, not simply because they reduce pollution, but because they make streets safer and encourage healthier lifestyles.', 128),
  ('listening', 'listening_choice', 4, 'What will happen if the council does not change its decision?

A) the theatre will be demolished
B) the car park will be closed
C) the theatre will be repaired
D) a new theatre will be built', 'A', 'Unless the council reconsiders its decision, the old theatre will be demolished next spring, and a car park will be built on the site.', 129),
  ('listening', 'listening_choice', 4, 'Why does she never seem rushed?

A) she has an assistant
B) she ignores deadlines
C) she works fewer hours
D) she plans ahead', 'D', 'She''s remarkably well-organised; she plans her week on Sunday evening, which is why she never seems to be rushed, even when deadlines are close.', 130),
  ('writing', 'writing', 1, 'Write 4 or 5 simple sentences about yourself: your name, your age, where you live, and what you like to do.', 'ai_graded', NULL, 101),
  ('writing', 'writing', 1, 'Describe your family. Write 4 or 5 sentences about the people in your family.', 'ai_graded', NULL, 102),
  ('writing', 'writing', 2, 'Write a short paragraph (60-100 words) about what you do on a typical day, from morning to night.', 'ai_graded', NULL, 103),
  ('writing', 'writing', 2, 'Write a short message to a friend inviting them to your home this weekend. Say when, what you will do, and what they should bring.', 'ai_graded', NULL, 104),
  ('writing', 'writing', 2, 'Write a short paragraph (60-100 words) about your favourite food or place and say why you like it.', 'ai_graded', NULL, 105),
  ('writing', 'writing', 3, 'Write a short paragraph (80-150 words) about a memorable trip or experience you have had. Describe what happened, how you felt, and why it was memorable.', 'ai_graded', NULL, 106),
  ('writing', 'writing', 3, 'Write an email (80-150 words) to a hotel to complain about a problem with your room and ask for a solution.', 'ai_graded', NULL, 107),
  ('writing', 'writing', 3, 'Write a paragraph (80-150 words) about the advantages and disadvantages of learning English online.', 'ai_graded', NULL, 108),
  ('writing', 'writing', 4, 'Some people think children should start learning a foreign language at a very young age. Write 120-180 words giving your opinion and reasons.', 'ai_graded', NULL, 109),
  ('writing', 'writing', 4, 'Write a paragraph (120-180 words) about a decision that changed your life. Explain what you decided, why, and what happened afterwards.', 'ai_graded', NULL, 110),
  ('speaking', 'speaking', 1, 'Introduce yourself: say your name, where you are from, and what you like to do. Speak for about one minute.', 'ai_graded', NULL, 101),
  ('speaking', 'speaking', 1, 'Talk about your family and your home. Speak for about one minute.', 'ai_graded', NULL, 102),
  ('speaking', 'speaking', 2, 'Talk about what you do on a normal day, from morning to evening. Speak for about two minutes.', 'ai_graded', NULL, 103),
  ('speaking', 'speaking', 2, 'Describe your favourite food and say how it is made or why you like it. Speak for about two minutes.', 'ai_graded', NULL, 104),
  ('speaking', 'speaking', 2, 'Talk about a place you like in your city or town and why people should visit it. Speak for about two minutes.', 'ai_graded', NULL, 105),
  ('speaking', 'speaking', 3, 'Talk about yourself for up to 3 minutes: your background, interests, daily routine, and future goals.', 'ai_graded', NULL, 106),
  ('speaking', 'speaking', 3, 'Describe a memorable trip or experience you have had and explain why it was special. Speak for up to 3 minutes.', 'ai_graded', NULL, 107),
  ('speaking', 'speaking', 3, 'Talk about a person who has influenced you. Say who they are, what they did, and how they changed your life. Speak for up to 3 minutes.', 'ai_graded', NULL, 108),
  ('speaking', 'speaking', 4, 'Do you think technology makes our lives better or worse? Give your opinion with reasons and examples. Speak for up to 3 minutes.', 'ai_graded', NULL, 109),
  ('speaking', 'speaking', 4, 'Talk about a problem in your community and suggest how it could be solved. Speak for up to 3 minutes.', 'ai_graded', NULL, 110);

WITH ins AS (
  INSERT INTO placement_questions
    (placement_section_id, question_type, prompt, order_index, correct_answer, listening_script, difficulty)
  SELECT ps.id, nb.question_type, nb.prompt, nb.order_index, nb.correct_answer, nb.listening_script, nb.difficulty
  FROM _new_bank nb
  JOIN placement_sections ps ON ps.skill_code = nb.skill_code
   AND ps.placement_test_id IN (SELECT id FROM placement_tests WHERE status = 'published')
  RETURNING id, placement_section_id, order_index, question_type
),
-- Existing (pre-bank) questions of each section and the skills they were linked to.
old_links AS (
  SELECT pq.placement_section_id, pqs.skill_id, pqs.is_primary,
         DENSE_RANK() OVER (PARTITION BY pq.placement_section_id ORDER BY pq.order_index) AS rk
  FROM placement_questions pq
  JOIN placement_question_skills pqs ON pqs.placement_question_id = pq.id
  WHERE pq.order_index <= 6
),
old_cnt AS (
  SELECT placement_section_id, MAX(rk) AS n FROM old_links GROUP BY placement_section_id
),
new_ranked AS (
  SELECT i.id, i.placement_section_id, i.question_type,
         ROW_NUMBER() OVER (PARTITION BY i.placement_section_id ORDER BY i.order_index) AS rn
  FROM ins i
)
INSERT INTO placement_question_skills (placement_question_id, skill_id, is_primary)
SELECT nr.id, ol.skill_id, ol.is_primary
FROM new_ranked nr
JOIN old_cnt oc ON oc.placement_section_id = nr.placement_section_id
JOIN old_links ol ON ol.placement_section_id = nr.placement_section_id
                 AND ol.rk = ((nr.rn - 1) % oc.n) + 1
WHERE nr.question_type NOT IN ('writing', 'speaking')
ON CONFLICT DO NOTHING;

-- Writing / speaking prompts link to the dedicated placement skills.
INSERT INTO placement_question_skills (placement_question_id, skill_id, is_primary)
SELECT pq.id,
       CASE pq.question_type WHEN 'writing' THEN '9d100000-0000-0000-0000-000000000001'::uuid
                             ELSE '9d100000-0000-0000-0000-000000000002'::uuid END,
       true
FROM placement_questions pq
WHERE pq.question_type IN ('writing', 'speaking') AND pq.order_index > 100
ON CONFLICT DO NOTHING;

-- Keep the backend-computed section counters equal to the bank size.
UPDATE placement_sections ps
SET total_questions = (SELECT COUNT(*) FROM placement_questions pq WHERE pq.placement_section_id = ps.id)
WHERE placement_test_id IN (SELECT id FROM placement_tests WHERE status = 'published');

DROP TABLE IF EXISTS _new_bank;
