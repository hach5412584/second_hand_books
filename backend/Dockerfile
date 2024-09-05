# Use the official Golang image to create a build artifact.
# This is based on Debian and sets the GOPATH to /go.
FROM golang:1.22.4 AS builder

# Create and change to the app directory.
WORKDIR /app

# Copy go.mod and go.sum files to the workspace.
COPY go.mod go.sum ./

# Download and cache dependencies.
RUN go mod download

# Copy the local package code to the workspace.
COPY . .

# Build the application.
RUN go build -o main .

COPY ./pkg/config/config.json /app/config.json

# Run the web service on container startup.
CMD ["./main"]
