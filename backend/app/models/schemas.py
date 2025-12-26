"""
Data models for Custom Tag Helper
"""

from typing import List, Optional, Generic, TypeVar
from pydantic import BaseModel, Field

T = TypeVar('T')


class PaginationParams(BaseModel):
    """Pagination parameters for list endpoints"""
    skip: int = Field(default=0, ge=0, description="Number of items to skip (offset)")
    limit: int = Field(default=50, ge=1, le=500, description="Maximum number of items to return")


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper"""
    items: List[T] = Field(description="List of items for current page")
    total_count: int = Field(description="Total number of items across all pages")
    page: int = Field(description="Current page number (1-indexed)")
    page_size: int = Field(description="Number of items per page")
    has_next: bool = Field(description="Whether there are more items after this page")
    has_prev: bool = Field(description="Whether there are items before this page")


class TonieModel(BaseModel):
    """
    Custom Tonie metadata structure
    Matches the tonies.custom.json format
    """
    no: str = Field(default="0", description="Sequential custom tag identifier (auto-generated if missing)")
    model: str = Field(description="RFID tag identifier (e.g., E0:04:03:50:0E:F4:D8:EA)")
    audio_id: List[str] = Field(description="Custom audio identifier array")
    hash: List[str] = Field(description="Content hash verification array")
    title: str = Field(default="", description="Primary title (currently unused in display)")
    series: Optional[str] = Field(default="", description="Series name displayed in GUI")
    episodes: Optional[str] = Field(default="", description="Episode/description shown in GUI")
    tracks: List[str] = Field(default_factory=list, description="Individual track titles")
    release: str = Field(default="0", description="Release identifier")
    language: Optional[str] = Field(default="en-us", description="Language code")
    category: Optional[str] = Field(default="custom", description="Tag categorization")
    pic: Optional[str] = Field(default="", description="Image URL (e.g., /custom_img/cover.png)")

    class Config:
        json_schema_extra = {
            "example": {
                "no": "0",
                "model": "E0:04:03:50:0E:F4:D8:EA",
                "audio_id": ["1768543459"],
                "hash": ["e5e463291034471c3420ae3d433579c4xfdd2d7d"],
                "title": "Die Schule der magischen Tiere",
                "series": "Die Schule der magischen Tiere",
                "episodes": "Folge 1 - Die Schule der magischen Tiere",
                "tracks": ["Track 1", "Track 2"],
                "release": "0",
                "language": "de-de",
                "category": "custom",
                "pic": "/custom_img/magische_tiere.png"
            }
        }


class TonieCreateRequest(BaseModel):
    """Request body for creating a new custom tonie"""
    model: Optional[str] = Field(default=None, description="RFID tag identifier (optional - auto-assigned if not provided)")
    audio_id: str = Field(description="Audio ID from TAF file")
    hash: str = Field(description="Content hash from TAF file")
    series: str = Field(description="Series name")
    episodes: str = Field(description="Episode description")
    title: Optional[str] = Field(default="", description="Title")
    tracks: List[str] = Field(default_factory=list, description="Track titles")
    language: str = Field(default="en-us", description="Language code")
    pic: Optional[str] = Field(default="", description="Cover image filename")


class TonieUpdateRequest(BaseModel):
    """Request body for updating an existing custom tonie"""
    model: Optional[str] = None
    series: Optional[str] = None
    episodes: Optional[str] = None
    title: Optional[str] = None
    tracks: Optional[List[str]] = None
    language: Optional[str] = None
    pic: Optional[str] = None


class ToniesListResponse(BaseModel):
    """Paginated response for tonies list"""
    items: List[TonieModel] = Field(description="Tonies for current page")
    total_count: int = Field(description="Total number of tonies")
    page: int = Field(default=1, description="Current page number (1-indexed)")
    page_size: int = Field(default=50, description="Number of items per page")
    has_next: bool = Field(default=False, description="Whether there are more items after this page")
    has_prev: bool = Field(default=False, description="Whether there are items before this page")


class TAFMetadata(BaseModel):
    """Metadata extracted from TAF file"""
    audio_id: int = Field(description="Unique audio identifier")
    hash: str = Field(description="SHA1 hash (hex)")
    size: int = Field(description="File size in bytes")
    tracks: int = Field(default=1, description="Number of tracks")
    confidence: int = Field(default=0, description="Parse confidence (0-100)")
    filename: str = Field(description="Original filename")
    has_cover: bool = Field(default=False, description="Whether cover image was found")


class LibraryFile(BaseModel):
    """File or directory in the library"""
    name: str = Field(description="File/directory name")
    path: str = Field(description="Full path")
    is_directory: bool = Field(description="Whether this is a directory")
    size: Optional[int] = Field(default=None, description="File size in bytes")
    modified: Optional[str] = Field(default=None, description="Last modified timestamp")
    is_taf: bool = Field(default=False, description="Whether this is a TAF file")


class LibraryBrowseResponse(BaseModel):
    """Response for library browsing"""
    current_path: str = Field(description="Current directory path")
    parent_path: Optional[str] = Field(description="Parent directory path")
    items: List[LibraryFile] = Field(description="Files and directories")


class ParseTAFRequest(BaseModel):
    """Request to parse a TAF file"""
    path: str = Field(description="Path to TAF file (relative to library root)")


class ParseTAFResponse(BaseModel):
    """Response from TAF parsing"""
    success: bool
    metadata: Optional[TAFMetadata] = None
    cover_extracted: bool = Field(default=False)
    cover_filename: Optional[str] = Field(default=None)
    error: Optional[str] = None


class StatusResponse(BaseModel):
    """API status response"""
    status: str
    teddycloud_connected: bool
    library_api_connected: bool
    config_readable: bool


class TAFFileWithTonie(BaseModel):
    """TAF file with associated tonie information (TAF-centric view)"""
    name: str = Field(description="TAF filename")
    path: str = Field(description="Full path to TAF file")
    size: int = Field(description="File size in bytes")
    audio_id: Optional[int] = Field(default=None, description="Audio ID from TAF header")
    hash: Optional[str] = Field(default=None, description="SHA1 hash from TAF header")
    track_count: Optional[int] = Field(default=None, description="Number of tracks")
    track_seconds: Optional[List[int]] = Field(default=None, description="Track durations in seconds")
    linked_tonie: Optional[TonieModel] = Field(default=None, description="Associated custom tonie (if any)")
    is_linked: bool = Field(default=False, description="Whether this TAF is linked to a tonie")


class TAFLibraryResponse(BaseModel):
    """Response for TAF-centric library view with pagination"""
    taf_files: List[TAFFileWithTonie] = Field(description="TAF files for current page")
    total_count: int = Field(description="Total number of TAF files (unfiltered)")
    linked_count: int = Field(description="Number of TAF files linked to tonies")
    orphaned_count: int = Field(description="Number of TAF files not linked to any tonie")
    filtered_count: int = Field(default=0, description="Number of TAF files after applying filter (for pagination)")
    # Pagination fields
    page: int = Field(default=1, description="Current page number (1-indexed)")
    page_size: int = Field(default=50, description="Number of items per page")
    has_next: bool = Field(default=False, description="Whether there are more items after this page")
    has_prev: bool = Field(default=False, description="Whether there are items before this page")
    # Error handling - allows frontend to distinguish between empty data and error
    error: Optional[str] = Field(default=None, description="Error message if request failed")
    success: bool = Field(default=True, description="Whether the request succeeded")
