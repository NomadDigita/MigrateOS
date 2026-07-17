from enum import StrEnum

from pydantic import BaseModel, Field


class RiskLevel(StrEnum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class PlanStatus(StrEnum):
    draft = "draft"
    awaiting_approval = "awaiting_approval"
    approved = "approved"
    rejected = "rejected"


class MigrationStep(BaseModel):
    id: str
    title: str
    description: str
    reason: str
    affected_files: list[str] = []
    affected_dependencies: list[str] = []
    dependencies: list[str] = []
    rollback_order: list[str] = []
    confidence: float = Field(ge=0, le=1)
    risk: RiskLevel
    priority: int = Field(ge=1, le=5)
    estimated_tokens: int
    estimated_runtime_minutes: int
    rollback_instructions: str
    required_approval: bool = True
    status: PlanStatus = PlanStatus.draft


class MigrationPlan(BaseModel):
    id: str
    executive_summary: str
    overall_risk: RiskLevel
    risk_score: int = Field(ge=0, le=100)
    estimated_minutes: int
    estimated_tokens: int
    confidence: float = Field(ge=0, le=1)
    steps: list[MigrationStep]
    human_tasks: list[str]
    events: list[dict[str, object]]
