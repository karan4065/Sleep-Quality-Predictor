# Use the official lightweight Python image
FROM python:3.9-slim

# Configure environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=7860

# Set up a new user named "user" with UID 1000
RUN useradd -m -u 1000 user

# Set the working directory to user's home app directory
WORKDIR /home/user/app

# Copy requirements.txt and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files (including models)
COPY --chown=user . .

# Switch to non-root user
USER user

# Expose Hugging Face Space port
EXPOSE 7860

# Run the web service using gunicorn bound to port 7860
CMD ["gunicorn", "-b", "0.0.0.0:7860", "app:app"]
