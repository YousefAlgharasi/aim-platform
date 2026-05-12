"""
AIM - Adaptive Intelligence Module
T-02 Test Suite: SkillGraph

Covers:
  - JSON loading and validation
  - get_skill()
  - get_prerequisites()
  - get_subskills()
  - is_prerequisite_met()
  - get_all_skill_ids()
  - get_skills_by_category()
  - get_skills_by_level()
  - get_relationship_coefficient()
  - Edge cases: missing fields, bad refs, duplicates, bad coefficients
  - __len__, __contains__, __repr__

Run with:
    pytest ai-core/tests/test_skill_graph.py -v
"""

import json
import os
import sys
import tempfile
import pytest

# ---------------------------------------------------------------------------
# Make sure ai-core/ is importable regardless of working directory
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from skill_graph import SkillGraph, SkillGraphError, SkillNotFoundError


# ===========================================================================
# Fixtures
# ===========================================================================

VALID_SKILLS = [
    {
        "id": "VOCAB_BASIC",
        "name": "Basic Vocabulary",
        "category": "Vocabulary",
        "level": 1,
        "prerequisites": [],
        "subskills": ["VOCAB_DAILY"],
        "metadata": {"description": "Foundational words", "estimated_hours": 10},
    },
    {
        "id": "VOCAB_DAILY",
        "name": "Daily Expressions",
        "category": "Vocabulary",
        "level": 2,
        "prerequisites": [
            {"skill_id": "VOCAB_BASIC", "relationship_coefficient": 0.9}
        ],
        "subskills": [],
        "metadata": {"description": "Everyday phrases", "estimated_hours": 8},
    },
    {
        "id": "GRAMMAR_VERB_FORMS",
        "name": "Verb Forms",
        "category": "Grammar",
        "level": 1,
        "prerequisites": [],
        "subskills": [],
        "metadata": {"description": "Base, past, participle", "estimated_hours": 8},
    },
    {
        "id": "GRAMMAR_TO_BE",
        "name": "To Be Verb",
        "category": "Grammar",
        "level": 1,
        "prerequisites": [],
        "subskills": [],
        "metadata": {"description": "is/am/are/was/were", "estimated_hours": 5},
    },
    {
        "id": "GRAMMAR_PRESENT_PERFECT",
        "name": "Present Perfect",
        "category": "Grammar",
        "level": 3,
        "prerequisites": [
            {"skill_id": "GRAMMAR_VERB_FORMS", "relationship_coefficient": 0.95},
            {"skill_id": "GRAMMAR_TO_BE", "relationship_coefficient": 0.8},
        ],
        "subskills": [],
        "metadata": {"description": "Have/has + past participle", "estimated_hours": 8},
    },
    {
        "id": "READING_BASIC",
        "name": "Basic Reading",
        "category": "Reading",
        "level": 1,
        "prerequisites": [
            {"skill_id": "VOCAB_BASIC", "relationship_coefficient": 0.85}
        ],
        "subskills": [],
        "metadata": {"description": "Short texts", "estimated_hours": 10},
    },
]


def _write_graph(skills: list, tmp_dir: str, filename: str = "skill_graph.json") -> str:
    """Write a skill list to a temp JSON file and return its path."""
    path = os.path.join(tmp_dir, filename)
    with open(path, "w") as f:
        json.dump({"version": "1.0", "skills": skills}, f)
    return path


@pytest.fixture
def tmp(tmp_path):
    return str(tmp_path)


@pytest.fixture
def valid_graph(tmp):
    path = _write_graph(VALID_SKILLS, tmp)
    return SkillGraph(path)


# ===========================================================================
# 1. Loading & Validation Tests
# ===========================================================================

class TestLoading:

    def test_loads_valid_graph(self, valid_graph):
        assert len(valid_graph) == len(VALID_SKILLS)

    def test_file_not_found_raises(self):
        with pytest.raises(SkillGraphError, match="not found"):
            SkillGraph("/nonexistent/path/skill_graph.json")

    def test_invalid_json_raises(self, tmp):
        path = os.path.join(tmp, "bad.json")
        with open(path, "w") as f:
            f.write("{ not valid json }")
        with pytest.raises(SkillGraphError, match="Invalid JSON"):
            SkillGraph(path)

    def test_missing_skills_key_raises(self, tmp):
        path = os.path.join(tmp, "no_skills.json")
        with open(path, "w") as f:
            json.dump({"version": "1.0"}, f)
        with pytest.raises(SkillGraphError, match="'skills' list"):
            SkillGraph(path)

    def test_empty_skills_list_raises(self, tmp):
        path = _write_graph([], tmp)
        with pytest.raises(SkillGraphError, match="no skills"):
            SkillGraph(path)

    def test_missing_required_field_raises(self, tmp):
        bad = [{"id": "X", "name": "X", "category": "Grammar", "level": 1,
                "prerequisites": []}]  # missing subskills
        path = _write_graph(bad, tmp)
        with pytest.raises(SkillGraphError, match="missing required fields"):
            SkillGraph(path)

    def test_duplicate_skill_id_raises(self, tmp):
        dup = VALID_SKILLS[:2] + [VALID_SKILLS[0]]
        path = _write_graph(dup, tmp)
        with pytest.raises(SkillGraphError, match="Duplicate skill id"):
            SkillGraph(path)

    def test_invalid_level_raises(self, tmp):
        bad = [
            {"id": "X", "name": "X", "category": "Grammar", "level": 9,
             "prerequisites": [], "subskills": [], "metadata": {}}
        ]
        path = _write_graph(bad, tmp)
        with pytest.raises(SkillGraphError, match="invalid level"):
            SkillGraph(path)

    def test_level_zero_raises(self, tmp):
        bad = [
            {"id": "X", "name": "X", "category": "Grammar", "level": 0,
             "prerequisites": [], "subskills": [], "metadata": {}}
        ]
        path = _write_graph(bad, tmp)
        with pytest.raises(SkillGraphError, match="invalid level"):
            SkillGraph(path)

    def test_unknown_prerequisite_ref_raises(self, tmp):
        bad = [
            {"id": "X", "name": "X", "category": "Grammar", "level": 1,
             "prerequisites": [{"skill_id": "DOES_NOT_EXIST",
                                "relationship_coefficient": 0.8}],
             "subskills": [], "metadata": {}}
        ]
        path = _write_graph(bad, tmp)
        with pytest.raises(SkillGraphError, match="unknown prerequisite"):
            SkillGraph(path)

    def test_unknown_subskill_ref_raises(self, tmp):
        bad = [
            {"id": "X", "name": "X", "category": "Grammar", "level": 1,
             "prerequisites": [], "subskills": ["GHOST"], "metadata": {}}
        ]
        path = _write_graph(bad, tmp)
        with pytest.raises(SkillGraphError, match="unknown subskill"):
            SkillGraph(path)

    def test_missing_relationship_coefficient_raises(self, tmp):
        bad = [
            {"id": "A", "name": "A", "category": "Grammar", "level": 1,
             "prerequisites": [], "subskills": [], "metadata": {}},
            {"id": "B", "name": "B", "category": "Grammar", "level": 2,
             "prerequisites": [{"skill_id": "A"}],   # no coefficient
             "subskills": [], "metadata": {}},
        ]
        path = _write_graph(bad, tmp)
        with pytest.raises(SkillGraphError, match="relationship_coefficient"):
            SkillGraph(path)

    def test_coefficient_out_of_range_raises(self, tmp):
        bad = [
            {"id": "A", "name": "A", "category": "Grammar", "level": 1,
             "prerequisites": [], "subskills": [], "metadata": {}},
            {"id": "B", "name": "B", "category": "Grammar", "level": 2,
             "prerequisites": [{"skill_id": "A",
                                "relationship_coefficient": 1.5}],
             "subskills": [], "metadata": {}},
        ]
        path = _write_graph(bad, tmp)
        with pytest.raises(SkillGraphError, match="relationship_coefficient"):
            SkillGraph(path)

    def test_coefficient_zero_is_valid(self, tmp):
        skills = [
            {"id": "A", "name": "A", "category": "Grammar", "level": 1,
             "prerequisites": [], "subskills": [], "metadata": {}},
            {"id": "B", "name": "B", "category": "Grammar", "level": 2,
             "prerequisites": [{"skill_id": "A",
                                "relationship_coefficient": 0.0}],
             "subskills": [], "metadata": {}},
        ]
        path = _write_graph(skills, tmp)
        sg = SkillGraph(path)
        assert len(sg) == 2

    def test_coefficient_one_is_valid(self, tmp):
        skills = [
            {"id": "A", "name": "A", "category": "Grammar", "level": 1,
             "prerequisites": [], "subskills": [], "metadata": {}},
            {"id": "B", "name": "B", "category": "Grammar", "level": 2,
             "prerequisites": [{"skill_id": "A",
                                "relationship_coefficient": 1.0}],
             "subskills": [], "metadata": {}},
        ]
        path = _write_graph(skills, tmp)
        sg = SkillGraph(path)
        assert len(sg) == 2

    def test_prerequisite_not_a_dict_raises(self, tmp):
        bad = [
            {"id": "A", "name": "A", "category": "Grammar", "level": 1,
             "prerequisites": ["not_a_dict"], "subskills": [], "metadata": {}},
        ]
        path = _write_graph(bad, tmp)
        with pytest.raises(SkillGraphError, match="prerequisites must be objects"):
            SkillGraph(path)


# ===========================================================================
# 2. get_skill() Tests
# ===========================================================================

class TestGetSkill:

    def test_returns_correct_skill(self, valid_graph):
        skill = valid_graph.get_skill("VOCAB_BASIC")
        assert skill["id"] == "VOCAB_BASIC"
        assert skill["name"] == "Basic Vocabulary"
        assert skill["category"] == "Vocabulary"
        assert skill["level"] == 1

    def test_returns_copy_not_reference(self, valid_graph):
        skill = valid_graph.get_skill("VOCAB_BASIC")
        skill["name"] = "MUTATED"
        # original should be unchanged
        assert valid_graph.get_skill("VOCAB_BASIC")["name"] == "Basic Vocabulary"

    def test_unknown_id_raises(self, valid_graph):
        with pytest.raises(SkillNotFoundError):
            valid_graph.get_skill("NONEXISTENT_SKILL")

    def test_all_required_fields_present(self, valid_graph):
        skill = valid_graph.get_skill("GRAMMAR_PRESENT_PERFECT")
        for field in SkillGraph.REQUIRED_FIELDS:
            assert field in skill


# ===========================================================================
# 3. get_prerequisites() Tests
# ===========================================================================

class TestGetPrerequisites:

    def test_no_prerequisites(self, valid_graph):
        prereqs = valid_graph.get_prerequisites("VOCAB_BASIC")
        assert prereqs == []

    def test_single_prerequisite(self, valid_graph):
        prereqs = valid_graph.get_prerequisites("VOCAB_DAILY")
        assert len(prereqs) == 1
        assert prereqs[0]["skill_id"] == "VOCAB_BASIC"
        assert prereqs[0]["relationship_coefficient"] == 0.9

    def test_multiple_prerequisites(self, valid_graph):
        prereqs = valid_graph.get_prerequisites("GRAMMAR_PRESENT_PERFECT")
        ids = [p["skill_id"] for p in prereqs]
        assert "GRAMMAR_VERB_FORMS" in ids
        assert "GRAMMAR_TO_BE" in ids

    def test_returns_copy_not_reference(self, valid_graph):
        prereqs = valid_graph.get_prerequisites("VOCAB_DAILY")
        prereqs.append({"skill_id": "FAKE", "relationship_coefficient": 0.5})
        # original must still have only 1 entry
        assert len(valid_graph.get_prerequisites("VOCAB_DAILY")) == 1

    def test_unknown_skill_raises(self, valid_graph):
        with pytest.raises(SkillNotFoundError):
            valid_graph.get_prerequisites("GHOST")


# ===========================================================================
# 4. get_subskills() Tests
# ===========================================================================

class TestGetSubskills:

    def test_with_subskills(self, valid_graph):
        subs = valid_graph.get_subskills("VOCAB_BASIC")
        assert "VOCAB_DAILY" in subs

    def test_empty_subskills(self, valid_graph):
        subs = valid_graph.get_subskills("VOCAB_DAILY")
        assert subs == []

    def test_returns_list(self, valid_graph):
        subs = valid_graph.get_subskills("VOCAB_BASIC")
        assert isinstance(subs, list)

    def test_returns_copy(self, valid_graph):
        subs = valid_graph.get_subskills("VOCAB_BASIC")
        subs.append("FAKE_SUB")
        assert "FAKE_SUB" not in valid_graph.get_subskills("VOCAB_BASIC")

    def test_unknown_skill_raises(self, valid_graph):
        with pytest.raises(SkillNotFoundError):
            valid_graph.get_subskills("GHOST")


# ===========================================================================
# 5. is_prerequisite_met() Tests
# ===========================================================================

class TestIsPrerequisiteMet:

    def test_no_prerequisites_always_true(self, valid_graph):
        """Skills with no prerequisites are always accessible."""
        result = valid_graph.is_prerequisite_met({}, "VOCAB_BASIC")
        assert result is True

    def test_met_when_mastery_above_threshold(self, valid_graph):
        state = {"VOCAB_BASIC": {"mastery": 85.0}}
        assert valid_graph.is_prerequisite_met(state, "VOCAB_DAILY") is True

    def test_met_exactly_at_threshold(self, valid_graph):
        state = {"VOCAB_BASIC": {"mastery": 70.0}}
        assert valid_graph.is_prerequisite_met(state, "VOCAB_DAILY") is True

    def test_not_met_below_threshold(self, valid_graph):
        state = {"VOCAB_BASIC": {"mastery": 69.9}}
        assert valid_graph.is_prerequisite_met(state, "VOCAB_DAILY") is False

    def test_not_met_when_prereq_missing_from_state(self, valid_graph):
        """Missing prereq in student_state is treated as mastery = 0."""
        assert valid_graph.is_prerequisite_met({}, "VOCAB_DAILY") is False

    def test_not_met_when_mastery_zero(self, valid_graph):
        state = {"VOCAB_BASIC": {"mastery": 0.0}}
        assert valid_graph.is_prerequisite_met(state, "VOCAB_DAILY") is False

    def test_multiple_prereqs_all_met(self, valid_graph):
        state = {
            "GRAMMAR_VERB_FORMS": {"mastery": 90.0},
            "GRAMMAR_TO_BE":      {"mastery": 75.0},
        }
        assert valid_graph.is_prerequisite_met(state, "GRAMMAR_PRESENT_PERFECT") is True

    def test_multiple_prereqs_one_not_met(self, valid_graph):
        state = {
            "GRAMMAR_VERB_FORMS": {"mastery": 90.0},
            "GRAMMAR_TO_BE":      {"mastery": 55.0},   # below threshold
        }
        assert valid_graph.is_prerequisite_met(state, "GRAMMAR_PRESENT_PERFECT") is False

    def test_multiple_prereqs_none_met(self, valid_graph):
        state = {
            "GRAMMAR_VERB_FORMS": {"mastery": 20.0},
            "GRAMMAR_TO_BE":      {"mastery": 30.0},
        }
        assert valid_graph.is_prerequisite_met(state, "GRAMMAR_PRESENT_PERFECT") is False

    def test_extra_skills_in_state_ignored(self, valid_graph):
        """Extra skills in student_state don't affect the result."""
        state = {
            "VOCAB_BASIC":   {"mastery": 80.0},
            "READING_BASIC": {"mastery": 95.0},   # irrelevant for VOCAB_DAILY
        }
        assert valid_graph.is_prerequisite_met(state, "VOCAB_DAILY") is True

    def test_unknown_skill_raises(self, valid_graph):
        with pytest.raises(SkillNotFoundError):
            valid_graph.is_prerequisite_met({}, "GHOST_SKILL")


# ===========================================================================
# 6. get_all_skill_ids() Tests
# ===========================================================================

class TestGetAllSkillIds:

    def test_returns_all_ids(self, valid_graph):
        ids = valid_graph.get_all_skill_ids()
        expected = {s["id"] for s in VALID_SKILLS}
        assert set(ids) == expected

    def test_returns_list(self, valid_graph):
        assert isinstance(valid_graph.get_all_skill_ids(), list)

    def test_no_duplicates(self, valid_graph):
        ids = valid_graph.get_all_skill_ids()
        assert len(ids) == len(set(ids))


# ===========================================================================
# 7. get_skills_by_category() Tests
# ===========================================================================

class TestGetSkillsByCategory:

    def test_grammar_category(self, valid_graph):
        skills = valid_graph.get_skills_by_category("Grammar")
        ids = [s["id"] for s in skills]
        assert "GRAMMAR_VERB_FORMS" in ids
        assert "GRAMMAR_TO_BE" in ids
        assert "GRAMMAR_PRESENT_PERFECT" in ids
        # no vocab or reading
        assert "VOCAB_BASIC" not in ids

    def test_vocabulary_category(self, valid_graph):
        skills = valid_graph.get_skills_by_category("Vocabulary")
        ids = [s["id"] for s in skills]
        assert "VOCAB_BASIC" in ids
        assert "VOCAB_DAILY" in ids

    def test_case_insensitive(self, valid_graph):
        lower = valid_graph.get_skills_by_category("grammar")
        upper = valid_graph.get_skills_by_category("GRAMMAR")
        assert {s["id"] for s in lower} == {s["id"] for s in upper}

    def test_unknown_category_returns_empty(self, valid_graph):
        assert valid_graph.get_skills_by_category("Physics") == []

    def test_all_returned_match_category(self, valid_graph):
        for skill in valid_graph.get_skills_by_category("Reading"):
            assert skill["category"] == "Reading"


# ===========================================================================
# 8. get_skills_by_level() Tests
# ===========================================================================

class TestGetSkillsByLevel:

    def test_level_1_skills(self, valid_graph):
        skills = valid_graph.get_skills_by_level(1)
        ids = [s["id"] for s in skills]
        assert "VOCAB_BASIC" in ids
        assert "GRAMMAR_VERB_FORMS" in ids
        assert "GRAMMAR_TO_BE" in ids
        assert "READING_BASIC" in ids

    def test_level_2_skills(self, valid_graph):
        skills = valid_graph.get_skills_by_level(2)
        ids = [s["id"] for s in skills]
        assert "VOCAB_DAILY" in ids

    def test_level_3_skills(self, valid_graph):
        skills = valid_graph.get_skills_by_level(3)
        ids = [s["id"] for s in skills]
        assert "GRAMMAR_PRESENT_PERFECT" in ids

    def test_nonexistent_level_returns_empty(self, valid_graph):
        assert valid_graph.get_skills_by_level(5) == []

    def test_all_returned_match_level(self, valid_graph):
        for skill in valid_graph.get_skills_by_level(1):
            assert skill["level"] == 1


# ===========================================================================
# 9. get_relationship_coefficient() Tests
# ===========================================================================

class TestGetRelationshipCoefficient:

    def test_known_edge(self, valid_graph):
        coeff = valid_graph.get_relationship_coefficient(
            "VOCAB_BASIC", "VOCAB_DAILY"
        )
        assert coeff == pytest.approx(0.9)

    def test_known_edge_present_perfect(self, valid_graph):
        coeff = valid_graph.get_relationship_coefficient(
            "GRAMMAR_VERB_FORMS", "GRAMMAR_PRESENT_PERFECT"
        )
        assert coeff == pytest.approx(0.95)

    def test_no_direct_edge_returns_none(self, valid_graph):
        # VOCAB_BASIC is not a direct prereq of GRAMMAR_PRESENT_PERFECT
        coeff = valid_graph.get_relationship_coefficient(
            "VOCAB_BASIC", "GRAMMAR_PRESENT_PERFECT"
        )
        assert coeff is None

    def test_reversed_edge_returns_none(self, valid_graph):
        # Edge goes VOCAB_BASIC -> VOCAB_DAILY, not the other way
        coeff = valid_graph.get_relationship_coefficient(
            "VOCAB_DAILY", "VOCAB_BASIC"
        )
        assert coeff is None

    def test_unknown_to_skill_raises(self, valid_graph):
        with pytest.raises(SkillNotFoundError):
            valid_graph.get_relationship_coefficient("VOCAB_BASIC", "GHOST")


# ===========================================================================
# 10. Dunder / Utility Tests
# ===========================================================================

class TestDunder:

    def test_len(self, valid_graph):
        assert len(valid_graph) == len(VALID_SKILLS)

    def test_contains_true(self, valid_graph):
        assert "VOCAB_BASIC" in valid_graph

    def test_contains_false(self, valid_graph):
        assert "NONEXISTENT" not in valid_graph

    def test_repr_contains_count(self, valid_graph):
        r = repr(valid_graph)
        assert str(len(VALID_SKILLS)) in r
        assert "SkillGraph" in r


# ===========================================================================
# 11. Integration: Load the real skill_graph.json
# ===========================================================================

class TestRealSkillGraph:
    """Smoke tests against the production skill_graph.json."""

    @pytest.fixture(autouse=True)
    def load_real(self):
        real_path = os.path.join(
            os.path.dirname(__file__), "..", "skill_graph.json"
        )
        if not os.path.exists(real_path):
            pytest.skip("Real skill_graph.json not found alongside skill_graph.py")
        self.sg = SkillGraph(real_path)

    def test_real_graph_loads(self):
        assert len(self.sg) > 0

    def test_present_perfect_exists(self):
        skill = self.sg.get_skill("GRAMMAR_TENSES_PRESENT_PERFECT")
        assert skill["category"] == "Grammar"

    def test_present_perfect_prereqs(self):
        prereqs = self.sg.get_prerequisites("GRAMMAR_TENSES_PRESENT_PERFECT")
        ids = [p["skill_id"] for p in prereqs]
        assert "GRAMMAR_PAST_PARTICIPLE" in ids

    def test_passive_voice_prereqs(self):
        prereqs = self.sg.get_prerequisites("GRAMMAR_PASSIVE_VOICE")
        ids = [p["skill_id"] for p in prereqs]
        assert "GRAMMAR_TO_BE" in ids
        assert "GRAMMAR_PAST_PARTICIPLE" in ids

    def test_all_prereq_coefficients_in_range(self):
        for sid in self.sg.get_all_skill_ids():
            for p in self.sg.get_prerequisites(sid):
                c = p["relationship_coefficient"]
                assert 0.0 <= c <= 1.0, (
                    f"{sid} -> {p['skill_id']} has bad coefficient {c}"
                )

    def test_grammar_skills_exist(self):
        grammar = self.sg.get_skills_by_category("Grammar")
        assert len(grammar) >= 5

    def test_vocabulary_skills_exist(self):
        vocab = self.sg.get_skills_by_category("Vocabulary")
        assert len(vocab) >= 2

    def test_reading_skills_exist(self):
        reading = self.sg.get_skills_by_category("Reading")
        assert len(reading) >= 1

    def test_is_prerequisite_met_unmet_for_advanced(self):
        """GRAMMAR_PASSIVE_VOICE requires multiple mastered prereqs."""
        result = self.sg.is_prerequisite_met({}, "GRAMMAR_PASSIVE_VOICE")
        assert result is False

    def test_is_prerequisite_met_all_satisfied(self):
        state = {
            "GRAMMAR_PAST_PARTICIPLE": {"mastery": 80.0},
            "GRAMMAR_VERB_FORMS":      {"mastery": 75.0},
        }
        assert self.sg.is_prerequisite_met(
            state, "GRAMMAR_TENSES_PRESENT_PERFECT"
        ) is True

    def test_at_least_one_level_1_skill_has_no_prereqs(self):
        """
        The graph must contain at least one true entry-point skill
        (level 1, no prerequisites) so students always have somewhere to start.
        Reading/Listening/Speaking at level 1 may still depend on basic vocab,
        but Grammar and Vocabulary foundations must be prereq-free.
        """
        level_1_skills = self.sg.get_skills_by_level(1)
        entry_points = [s for s in level_1_skills if s["prerequisites"] == []]
        assert len(entry_points) >= 1, (
            "There must be at least one level-1 skill with no prerequisites"
        )

    def test_foundation_skills_have_no_prereqs(self):
        """VOCAB_BASIC and GRAMMAR_VERB_FORMS are true foundations — no prereqs."""
        for skill_id in ("VOCAB_BASIC", "GRAMMAR_VERB_FORMS", "GRAMMAR_TO_BE"):
            prereqs = self.sg.get_prerequisites(skill_id)
            assert prereqs == [], (
                f"Foundation skill '{skill_id}' should have no prerequisites"
            )
