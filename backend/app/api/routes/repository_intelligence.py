"""Repository intelligence delivery endpoints."""

import asyncio

from fastapi import APIRouter, HTTPException

from backend.app.application.repository_intelligence.models import AnalysisRequest, RepositoryAnalysis
from backend.app.application.repository_intelligence.service import RepositoryIntelligenceService

router = APIRouter(prefix="/repository-intelligence", tags=["repository intelligence"])


@router.post("/analyze", response_model=RepositoryAnalysis, summary="Analyze a local or public GitHub repository")
async def analyze_repository(request: AnalysisRequest) -> RepositoryAnalysis:
    """Run bounded, deterministic analysis outside the request event loop."""

    try:
        return await asyncio.to_thread(RepositoryIntelligenceService().analyze, request)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail="Repository analysis failed safely.") from error
