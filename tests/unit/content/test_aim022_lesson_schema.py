import json
import os
from pathlib import Path

import pytest

from aim.content.validators import AssessmentModel, LessonModel, QuestionModel

REPO_ROOT = Path(__file__).resolve().parents[3]
LESSONS_DIR = REPO_ROOT / "content" / "lessons"
ASSESSMENTS_DIR = REPO_ROOT / "content" / "assessments"

LESSON_FILES = sorted(LESSONS_DIR.glob("*.json"))
ASSESSMENT_FILES = sorted(ASSESSMENTS_DIR.glob("*.json"))

REQUIRED_QUESTION_FIELDS = {
    "question_id",
    "skill_id",
    "concept",
    "difficulty",
    "type",
    "prompt_en",
    "prompt_ar",
    "correct_answer",
    "explanation_en",
    "explanation_ar",
    "common_error_tags",
    "prerequisites",
    "hints",
}


class TestQuestionSchemaFields:
    def test_required_fields_are_defined(self):
        fields = set(QuestionModel.model_fields.keys())
        for f in REQUIRED_QUESTION_FIELDS:
            assert f in fields, f"QuestionModel missing field: {f}"

    def test_valid_question_passes(self):
        q = QuestionModel(
            question_id="L01-Q01",
            skill_id="SK-V01",
            concept="greeting_selection",
            difficulty=1,
            type="mcq",
            prompt_en="Which word means hello?",
            prompt_ar="ما الكلمة التي تعني مرحباً؟",
            choices=["Hello", "Goodbye", "Sorry", "Please"],
            correct_answer="Hello",
            explanation_en="Hello is the standard greeting used when meeting someone.",
            explanation_ar="Hello هي التحية المعيارية عند مقابلة شخص.",
            common_error_tags=["greeting_time_confusion"],
            prerequisites=[],
            hints=["Think about the word you use when meeting someone."],
        )
        assert q.question_id == "L01-Q01"

    def test_mcq_without_choices_fails(self):
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            QuestionModel(
                question_id="L01-Q01",
                skill_id="SK-V01",
                concept="greeting",
                difficulty=1,
                type="mcq",
                prompt_en="Which word means hello?",
                prompt_ar="ما الكلمة؟",
                correct_answer="Hello",
                explanation_en="Hello is the standard greeting used when meeting someone.",
                explanation_ar="Hello هي التحية المعيارية عند مقابلة شخص.",
                common_error_tags=[],
                prerequisites=[],
                hints=["hint one"],
            )

    def test_invalid_skill_id_format_fails(self):
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            QuestionModel(
                question_id="L01-Q01",
                skill_id="INVALID",
                concept="greeting",
                difficulty=1,
                type="fill",
                prompt_en="Complete the sentence.",
                prompt_ar="أكمل الجملة.",
                correct_answer="is",
                explanation_en="We use is with third-person singular subjects.",
                explanation_ar="نستخدم is مع المفرد الغائب.",
                common_error_tags=[],
                prerequisites=[],
                hints=["hint one"],
            )

    def test_difficulty_out_of_range_fails(self):
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            QuestionModel(
                question_id="L01-Q01",
                skill_id="SK-V01",
                concept="greeting",
                difficulty=6,
                type="fill",
                prompt_en="Complete the sentence.",
                prompt_ar="أكمل الجملة.",
                correct_answer="is",
                explanation_en="We use is with third-person singular subjects.",
                explanation_ar="نستخدم is مع المفرد الغائب.",
                common_error_tags=[],
                prerequisites=[],
                hints=["hint one"],
            )

    def test_empty_hints_fails(self):
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            QuestionModel(
                question_id="L01-Q01",
                skill_id="SK-V01",
                concept="greeting",
                difficulty=1,
                type="fill",
                prompt_en="Complete the sentence.",
                prompt_ar="أكمل الجملة.",
                correct_answer="is",
                explanation_en="We use is with third-person singular subjects.",
                explanation_ar="نستخدم is مع المفرد الغائب.",
                common_error_tags=[],
                prerequisites=[],
                hints=[],
            )


@pytest.mark.parametrize("lesson_file", LESSON_FILES, ids=lambda p: p.name)
class TestLessonFiles:
    def test_lesson_passes_schema(self, lesson_file):
        with open(lesson_file) as f:
            data = json.load(f)
        lesson = LessonModel.model_validate(data)
        assert lesson.lesson_id is not None

    def test_lesson_has_minimum_questions(self, lesson_file):
        with open(lesson_file) as f:
            data = json.load(f)
        assert len(data["questions"]) >= 3

    def test_lesson_questions_have_all_aim_fields(self, lesson_file):
        with open(lesson_file) as f:
            data = json.load(f)
        for q in data["questions"]:
            missing = REQUIRED_QUESTION_FIELDS - set(q.keys())
            assert not missing, (
                f"{lesson_file.name} question {q.get('question_id')} missing: {missing}"
            )

    def test_lesson_question_ids_are_unique(self, lesson_file):
        with open(lesson_file) as f:
            data = json.load(f)
        ids = [q["question_id"] for q in data["questions"]]
        assert len(ids) == len(set(ids)), f"{lesson_file.name}: duplicate question_ids"

    def test_lesson_skills_covered_not_empty(self, lesson_file):
        with open(lesson_file) as f:
            data = json.load(f)
        assert len(data["skills_covered"]) >= 1

    def test_lesson_difficulty_in_range(self, lesson_file):
        with open(lesson_file) as f:
            data = json.load(f)
        assert 1 <= data["difficulty"] <= 5


@pytest.mark.parametrize("assessment_file", ASSESSMENT_FILES, ids=lambda p: p.name)
class TestAssessmentFiles:
    def test_assessment_passes_schema(self, assessment_file):
        with open(assessment_file) as f:
            data = json.load(f)
        assessment = AssessmentModel.model_validate(data)
        assert assessment.assessment_id is not None

    def test_assessment_questions_have_all_aim_fields(self, assessment_file):
        with open(assessment_file) as f:
            data = json.load(f)
        for q in data["questions"]:
            missing = REQUIRED_QUESTION_FIELDS - set(q.keys())
            assert not missing, (
                f"{assessment_file.name} question {q.get('question_id')} missing: {missing}"
            )

    def test_assessment_has_scoring(self, assessment_file):
        with open(assessment_file) as f:
            data = json.load(f)
        assert "scoring" in data
        assert "total_questions" in data["scoring"]
        assert "pass_threshold" in data["scoring"]


class TestSchemaFilesExist:
    def test_question_schema_json_exists(self):
        schema = REPO_ROOT / "content" / "schemas" / "question_schema.json"
        assert schema.exists(), "content/schemas/question_schema.json not found"

    def test_lesson_schema_json_exists(self):
        schema = REPO_ROOT / "content" / "schemas" / "lesson_schema.json"
        assert schema.exists(), "content/schemas/lesson_schema.json not found"

    def test_assessment_schema_json_exists(self):
        schema = REPO_ROOT / "content" / "schemas" / "assessment_schema.json"
        assert schema.exists(), "content/schemas/assessment_schema.json not found"

    def test_question_schema_json_is_valid_json(self):
        schema = REPO_ROOT / "content" / "schemas" / "question_schema.json"
        with open(schema) as f:
            data = json.load(f)
        assert data["$id"] == "aim:content:question_schema:v1"

    def test_lesson_schema_json_is_valid_json(self):
        schema = REPO_ROOT / "content" / "schemas" / "lesson_schema.json"
        with open(schema) as f:
            data = json.load(f)
        assert data["$id"] == "aim:content:lesson_schema:v1"


class TestAIMMandatoryMetadataIntegration:
    def test_all_lessons_skill_ids_match_skill_map(self):
        skill_map_path = REPO_ROOT / "content" / "skill_map.json"
        with open(skill_map_path) as f:
            skill_map = json.load(f)
        valid_skill_ids = {s["skill_id"] for s in skill_map["skills"]}

        for lesson_file in LESSON_FILES:
            with open(lesson_file) as f:
                data = json.load(f)
            for q in data["questions"]:
                assert q["skill_id"] in valid_skill_ids, (
                    f"{lesson_file.name} question {q['question_id']}: "
                    f"skill_id '{q['skill_id']}' not in skill_map"
                )

    def test_all_assessments_skill_ids_match_skill_map(self):
        skill_map_path = REPO_ROOT / "content" / "skill_map.json"
        with open(skill_map_path) as f:
            skill_map = json.load(f)
        valid_skill_ids = {s["skill_id"] for s in skill_map["skills"]}

        for assessment_file in ASSESSMENT_FILES:
            with open(assessment_file) as f:
                data = json.load(f)
            for q in data["questions"]:
                assert q["skill_id"] in valid_skill_ids, (
                    f"{assessment_file.name} question {q['question_id']}: "
                    f"skill_id '{q['skill_id']}' not in skill_map"
                )

    def test_common_error_tags_reference_glossary(self):
        skill_map_path = REPO_ROOT / "content" / "skill_map.json"
        with open(skill_map_path) as f:
            skill_map = json.load(f)
        glossary_tags = set(skill_map["common_error_tags_glossary"].keys())

        for lesson_file in LESSON_FILES:
            with open(lesson_file) as f:
                data = json.load(f)
            for q in data["questions"]:
                for tag in q.get("common_error_tags", []):
                    assert tag in glossary_tags, (
                        f"{lesson_file.name} question {q['question_id']}: "
                        f"error tag '{tag}' not in skill_map glossary"
                    )

    def test_no_speed_fields_in_content(self):
        forbidden = {"response_time", "avg_response_time", "speed_score"}
        for lesson_file in LESSON_FILES:
            with open(lesson_file) as f:
                raw = f.read()
            for field in forbidden:
                assert field not in raw, (
                    f"{lesson_file.name} contains forbidden speed field: {field}"
                )
