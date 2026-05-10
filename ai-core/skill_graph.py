"""
AIM - Adaptive Intelligence Module
System 1: Skill Graph

Loads the English skill hierarchy from skill_graph.json,
validates it, and exposes query methods used by all other systems.

Branch: feature/T-02-skill-graph
Depends on: T-01 (repo skeleton)
"""

import json
import os
from typing import Any


# ---------------------------------------------------------------------------
# Exceptions
# ---------------------------------------------------------------------------

class SkillGraphError(Exception):
    """Raised when the skill graph JSON is malformed or invalid."""


class SkillNotFoundError(KeyError):
    """Raised when a requested skill ID does not exist in the graph."""


# ---------------------------------------------------------------------------
# SkillGraph
# ---------------------------------------------------------------------------

class SkillGraph:
    """
    Loads, validates and exposes the AIM English skill tree.

    Usage
    -----
    sg = SkillGraph()                     # loads from default path
    sg = SkillGraph("/path/to/file.json") # loads from custom path

    Public methods
    --------------
    get_skill(skill_id)                              -> dict
    get_prerequisites(skill_id)                      -> list[dict]
    get_subskills(skill_id)                          -> list[str]
    is_prerequisite_met(student_state, skill_id)     -> bool
    get_all_skill_ids()                              -> list[str]
    get_skills_by_category(category)                 -> list[dict]
    get_skills_by_level(level)                       -> list[dict]
    get_relationship_coefficient(from_skill, to_skill) -> float | None
    """

    # Required fields for every skill node
    REQUIRED_FIELDS = {"id", "name", "category", "level", "prerequisites", "subskills"}

    # Mastery threshold for prerequisite satisfaction (from architecture doc)
    MASTERY_THRESHOLD = 70.0

    def __init__(self, json_path: str | None = None) -> None:
        if json_path is None:
            json_path = os.path.join(os.path.dirname(__file__), "skill_graph.json")

        self._path = json_path
        self._skills: dict[str, dict] = {}  # id -> skill node
        self._load_and_validate()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _load_and_validate(self) -> None:
        """Load JSON from disk and run all validation checks."""
        try:
            with open(self._path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except FileNotFoundError:
            raise SkillGraphError(f"skill_graph.json not found at: {self._path}")
        except json.JSONDecodeError as exc:
            raise SkillGraphError(f"Invalid JSON in skill graph: {exc}") from exc

        if "skills" not in data or not isinstance(data["skills"], list):
            raise SkillGraphError("skill_graph.json must have a top-level 'skills' list")

        raw_skills: list[dict] = data["skills"]

        if not raw_skills:
            raise SkillGraphError("Skill graph contains no skills")

        # First pass: index by id and check required fields
        for skill in raw_skills:
            missing = self.REQUIRED_FIELDS - set(skill.keys())
            if missing:
                sid = skill.get("id", "<unknown>")
                raise SkillGraphError(
                    f"Skill '{sid}' is missing required fields: {missing}"
                )

            sid = skill["id"]
            if not isinstance(sid, str) or not sid:
                raise SkillGraphError("Each skill must have a non-empty string 'id'")

            if sid in self._skills:
                raise SkillGraphError(f"Duplicate skill id: '{sid}'")

            level = skill["level"]
            if not isinstance(level, int) or not (1 <= level <= 5):
                raise SkillGraphError(
                    f"Skill '{sid}' has invalid level '{level}' (must be int 1-5)"
                )

            self._skills[sid] = skill

        # Second pass: validate prerequisite references and coefficients
        for sid, skill in self._skills.items():
            for prereq in skill["prerequisites"]:
                if not isinstance(prereq, dict):
                    raise SkillGraphError(
                        f"Skill '{sid}': prerequisites must be objects with "
                        f"'skill_id' and 'relationship_coefficient'"
                    )
                if "skill_id" not in prereq:
                    raise SkillGraphError(
                        f"Skill '{sid}': a prerequisite is missing 'skill_id'"
                    )
                ref = prereq["skill_id"]
                if ref not in self._skills:
                    raise SkillGraphError(
                        f"Skill '{sid}' references unknown prerequisite '{ref}'"
                    )
                coeff = prereq.get("relationship_coefficient")
                if coeff is None:
                    raise SkillGraphError(
                        f"Skill '{sid}' → prereq '{ref}' is missing "
                        f"'relationship_coefficient'"
                    )
                if not isinstance(coeff, (int, float)) or not (0.0 <= coeff <= 1.0):
                    raise SkillGraphError(
                        f"Skill '{sid}' → prereq '{ref}' has invalid "
                        f"relationship_coefficient '{coeff}' (must be 0.0-1.0)"
                    )

            # Validate subskill references
            for sub_id in skill["subskills"]:
                if sub_id not in self._skills:
                    raise SkillGraphError(
                        f"Skill '{sid}' references unknown subskill '{sub_id}'"
                    )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def get_skill(self, skill_id: str) -> dict[str, Any]:
        """
        Return the full skill node for *skill_id*.

        Parameters
        ----------
        skill_id : str

        Returns
        -------
        dict with keys: id, name, category, level, prerequisites, subskills, metadata

        Raises
        ------
        SkillNotFoundError if skill_id is not in the graph
        """
        if skill_id not in self._skills:
            raise SkillNotFoundError(f"Skill '{skill_id}' not found in skill graph")
        return dict(self._skills[skill_id])  # return a copy

    def get_prerequisites(self, skill_id: str) -> list[dict[str, Any]]:
        """
        Return the list of prerequisite objects for *skill_id*.

        Each item is a dict:
            {
                "skill_id": str,
                "relationship_coefficient": float   # 0.0 – 1.0
            }

        Parameters
        ----------
        skill_id : str

        Returns
        -------
        list[dict]  (empty list if no prerequisites)

        Raises
        ------
        SkillNotFoundError
        """
        skill = self.get_skill(skill_id)
        return list(skill["prerequisites"])

    def get_subskills(self, skill_id: str) -> list[str]:
        """
        Return the list of subskill IDs for *skill_id*.

        Parameters
        ----------
        skill_id : str

        Returns
        -------
        list[str]  (empty list if no subskills)

        Raises
        ------
        SkillNotFoundError
        """
        skill = self.get_skill(skill_id)
        return list(skill["subskills"])

    def is_prerequisite_met(
        self,
        student_state: dict[str, dict],
        skill_id: str,
    ) -> bool:
        """
        Return True if every prerequisite of *skill_id* is satisfied by the
        student's current mastery scores.

        A prerequisite is satisfied when the student's mastery for that skill
        is >= MASTERY_THRESHOLD (70).  If the student has no record for a
        prerequisite skill, mastery is treated as 0 (not met).

        Parameters
        ----------
        student_state : dict
            Mapping of skill_id -> {"mastery": float, ...}
            Example:
            {
                "GRAMMAR_VERB_FORMS": {"mastery": 85.0},
                "GRAMMAR_TO_BE":      {"mastery": 72.5},
            }
        skill_id : str
            The skill we are checking readiness for.

        Returns
        -------
        bool

        Raises
        ------
        SkillNotFoundError
        """
        prerequisites = self.get_prerequisites(skill_id)

        # A skill with no prerequisites is always accessible
        if not prerequisites:
            return True

        for prereq in prerequisites:
            prereq_id = prereq["skill_id"]
            skill_data = student_state.get(prereq_id, {})
            mastery = skill_data.get("mastery", 0.0)
            if mastery < self.MASTERY_THRESHOLD:
                return False

        return True

    def get_all_skill_ids(self) -> list[str]:
        """Return all skill IDs in the graph."""
        return list(self._skills.keys())

    def get_skills_by_category(self, category: str) -> list[dict[str, Any]]:
        """
        Return all skill nodes that belong to *category*.

        Parameters
        ----------
        category : str  e.g. "Grammar", "Vocabulary", "Reading"

        Returns
        -------
        list[dict]  (may be empty if no match)
        """
        return [
            dict(s) for s in self._skills.values()
            if s["category"].lower() == category.lower()
        ]

    def get_skills_by_level(self, level: int) -> list[dict[str, Any]]:
        """
        Return all skill nodes at *level* (1-5).

        Parameters
        ----------
        level : int

        Returns
        -------
        list[dict]
        """
        return [dict(s) for s in self._skills.values() if s["level"] == level]

    def get_relationship_coefficient(
        self, from_skill_id: str, to_skill_id: str
    ) -> float | None:
        """
        Return the relationship_coefficient on the edge from_skill_id -> to_skill_id,
        i.e. how strongly mastering *from_skill_id* accelerates learning *to_skill_id*.

        Returns None if no direct prerequisite edge exists between the two skills.

        Parameters
        ----------
        from_skill_id : str   (the prerequisite)
        to_skill_id   : str   (the skill being learned)

        Returns
        -------
        float | None
        """
        prereqs = self.get_prerequisites(to_skill_id)
        for p in prereqs:
            if p["skill_id"] == from_skill_id:
                return p["relationship_coefficient"]
        return None

    # ------------------------------------------------------------------
    # Dunder helpers
    # ------------------------------------------------------------------

    def __len__(self) -> int:
        return len(self._skills)

    def __contains__(self, skill_id: str) -> bool:
        return skill_id in self._skills

    def __repr__(self) -> str:
        return f"SkillGraph(skills={len(self._skills)}, path='{self._path}')"
