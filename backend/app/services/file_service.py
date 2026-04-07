"""
File processing service for extracting text from various file formats.
Supports: .txt, .pdf, .docx
"""

import os
from pathlib import Path
from io import BytesIO


def extract_text_from_txt(file_content: bytes) -> str:
    """Extract text from .txt files."""
    try:
        # Try UTF-8 first, fall back to other encodings
        try:
            return file_content.decode('utf-8')
        except UnicodeDecodeError:
            try:
                return file_content.decode('cp1251')  # Windows encoding
            except UnicodeDecodeError:
                return file_content.decode('latin-1')
    except Exception as e:
        raise ValueError(f"Failed to read text file: {str(e)}")


def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from .pdf files."""
    try:
        from pypdf import PdfReader
        
        pdf_file = BytesIO(file_content)
        reader = PdfReader(pdf_file)
        
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n\n"
        
        return text.strip()
    except Exception as e:
        raise ValueError(f"Failed to read PDF file: {str(e)}")


def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from .docx files."""
    try:
        from docx import Document
        from io import BytesIO
        
        docx_file = BytesIO(file_content)
        doc = Document(docx_file)
        
        text = ""
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text += paragraph.text + "\n"
        
        return text.strip()
    except Exception as e:
        raise ValueError(f"Failed to read DOCX file: {str(e)}")


def extract_text(file_content: bytes, filename: str) -> str:
    """
    Extract text from file based on extension.
    
    Args:
        file_content: File content as bytes
        filename: Original filename to determine type
        
    Returns:
        Extracted text content
    """
    ext = Path(filename).suffix.lower()
    
    if ext == '.txt':
        return extract_text_from_txt(file_content)
    elif ext == '.pdf':
        return extract_text_from_pdf(file_content)
    elif ext in ['.docx', '.doc']:
        if ext == '.doc':
            raise ValueError("Old .doc format not supported. Please convert to .docx")
        return extract_text_from_docx(file_content)
    else:
        raise ValueError(f"Unsupported file type: {ext}. Supported: .txt, .pdf, .docx")


def validate_file(filename: str, max_size_mb: int = 10) -> None:
    """
    Validate file type and size.
    
    Args:
        filename: Original filename
        max_size_mb: Maximum file size in MB
    """
    ext = Path(filename).suffix.lower()
    allowed_extensions = {'.txt', '.pdf', '.docx'}
    
    if ext not in allowed_extensions:
        raise ValueError(f"File type {ext} not allowed. Allowed: {', '.join(allowed_extensions)}")
