DELETE FROM question_bank WHERE id IN (SELECT question_id FROM story_scene_questions);
DROP TABLE IF EXISTS story_scene_questions;
DROP TABLE IF EXISTS story_scenes;
DROP TABLE IF EXISTS stories;
