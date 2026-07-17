from uuid import uuid4
from backend.app.application.migration_planning.models import MigrationPlan, MigrationStep, RiskLevel
from backend.app.application.repository_intelligence.models import RepositoryAnalysis

class MigrationPlanner:
 def create(self, analysis: RepositoryAnalysis) -> MigrationPlan:
  steps=[]
  for index, dependency in enumerate(analysis.dependencies,1):
   risk=RiskLevel.high if dependency.version and dependency.version.startswith('^0.') else RiskLevel.medium
   steps.append(MigrationStep(id=f'step-{index}',title=f'Upgrade {dependency.name}',description='Upgrade through the approved ecosystem migration path.',reason='Dependency inventory identified a versioned modernization candidate.',affected_dependencies=[dependency.name],confidence=.72,risk=risk,priority=1 if risk==RiskLevel.high else 3,estimated_tokens=900,estimated_runtime_minutes=20,rollback_instructions=f'Restore the previous {dependency.manifest_path} entry and lockfile.'))
  score=min(100,sum(35 if step.risk==RiskLevel.high else 15 for step in steps)); risk=RiskLevel.critical if score>=75 else RiskLevel.high if score>=50 else RiskLevel.medium if score>=20 else RiskLevel.low
  return MigrationPlan(id=str(uuid4()),executive_summary='Deterministic migration plan generated from repository evidence.',overall_risk=risk,risk_score=score,estimated_minutes=sum(s.estimated_runtime_minutes for s in steps),estimated_tokens=sum(s.estimated_tokens for s in steps),confidence=round(sum(s.confidence for s in steps)/len(steps),2) if steps else 1.0,steps=steps,human_tasks=['Review breaking-change evidence before approval.'],events=[{'event_type':'migration.plan_generated','risk_score':score}])
