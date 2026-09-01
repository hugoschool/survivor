package models

const (
	ApiErrorOccuredStr string = "An error occured"
)

var (
	ApiErrorOccured ApiError = ApiError{Message: ApiErrorOccuredStr}
)

type ApiMessage struct {
	Message string `json:"message"`
}

type ApiError = ApiMessage
