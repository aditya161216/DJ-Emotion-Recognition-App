# Dockerfile
FROM python:3.9-slim

# Install system dependencies for OpenCV, TensorFlow, and PostgreSQL
RUN apt-get update && apt-get install -y \
    # OpenCV dependencies
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgstreamer1.0-0 \
    libgstreamer-plugins-base1.0-0 \
    # Video processing dependencies
    ffmpeg \
    libavcodec-dev \
    libavformat-dev \
    libswscale-dev \
    # PostgreSQL client
    libpq-dev \
    # Build tools
    gcc \
    g++ \
    # Clean up
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better Docker layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose port (you're using 3000 in your app.py)
EXPOSE 3000

# Run with gunicorn (note: using port 3000 to match your app.py)
CMD ["gunicorn", "--bind", "0.0.0.0:3000", "--workers", "2", "--timeout", "120", "app:app"]