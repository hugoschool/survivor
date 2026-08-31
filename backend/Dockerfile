FROM golang:1.26.6

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .
RUN go build -v -o /app/backend main.go

CMD ["/app/backend"]
