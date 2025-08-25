import os
import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import uvicorn
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Gemma-2-2B API",
    description="API para el modelo Gemma-2-2B de Google",
    version="1.0.0"
)

# Global variables for model and tokenizer
model = None
tokenizer = None

class GenerateRequest(BaseModel):
    prompt: str
    max_length: Optional[int] = 512
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.9
    do_sample: Optional[bool] = True
    num_return_sequences: Optional[int] = 1

class GenerateResponse(BaseModel):
    generated_text: str
    prompt: str
    model_name: str

@app.on_event("startup")
async def load_model():
    """Load the Gemma model and tokenizer on startup"""
    global model, tokenizer
    
    try:
        model_name = os.getenv("MODEL_NAME", "google/gemma-2-2b")
        hf_token = os.getenv("HF_TOKEN")
        cache_dir = "/app/cache"
        
        logger.info(f"Loading model: {model_name}")
        
        # Load tokenizer
        tokenizer = AutoTokenizer.from_pretrained(
            model_name,
            token=hf_token,
            cache_dir=cache_dir,
            trust_remote_code=True
        )
        
        # Load model
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            token=hf_token,
            cache_dir=cache_dir,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto" if torch.cuda.is_available() else None,
            trust_remote_code=True
        )
        
        # Set pad token if not exists
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        
        logger.info("Model loaded successfully!")
        
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        raise e

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {"status": "healthy", "model_loaded": True}

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Gemma-3-270M API",
        "model": os.getenv("MODEL_NAME", "google/gemma-3-270m"),
        "endpoints": {
            "/generate": "POST - Generate text from prompt",
            "/health": "GET - Health check",
            "/docs": "GET - API documentation"
        }
    }

@app.post("/generate", response_model=GenerateResponse)
async def generate_text(request: GenerateRequest):
    """Generate text using the Gemma model"""
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Tokenize input
        inputs = tokenizer(
            request.prompt,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=512
        )
        
        # Move to device if CUDA available
        if torch.cuda.is_available():
            inputs = {k: v.cuda() for k, v in inputs.items()}
        
        # Generate
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_length=min(request.max_length, 1024),
                temperature=request.temperature,
                top_p=request.top_p,
                do_sample=request.do_sample,
                num_return_sequences=request.num_return_sequences,
                pad_token_id=tokenizer.eos_token_id,
                eos_token_id=tokenizer.eos_token_id
            )
        
        # Decode output
        generated_text = tokenizer.decode(
            outputs[0], 
            skip_special_tokens=True
        )
        
        # Remove the original prompt from the generated text
        if generated_text.startswith(request.prompt):
            generated_text = generated_text[len(request.prompt):].strip()
        
        return GenerateResponse(
            generated_text=generated_text,
            prompt=request.prompt,
            model_name=os.getenv("MODEL_NAME", "google/gemma-3-270m")
        )
        
    except Exception as e:
        logger.error(f"Error generating text: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Generation error: {str(e)}")

@app.get("/model-info")
async def model_info():
    """Get model information"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    return {
        "model_name": os.getenv("MODEL_NAME", "google/gemma-3-270m"),
        "model_type": type(model).__name__,
        "tokenizer_type": type(tokenizer).__name__,
        "vocab_size": tokenizer.vocab_size,
        "device": str(next(model.parameters()).device) if model else "unknown",
        "dtype": str(next(model.parameters()).dtype) if model else "unknown"
    }

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )