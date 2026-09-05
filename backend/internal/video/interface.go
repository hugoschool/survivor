package internal

import (
	"fmt"
	"os"
	"strings"

	"github.com/hugoarnal/survivor/models"
)

const (
	VideoUploaderEnv string = "BACKEND_VIDEO_UPLOADER"
)

var (
	ErrVideoUploaderNotFound error = fmt.Errorf("no video uploader found in %s", VideoUploaderEnv)
	ErrVideoLinkNotFound     error = fmt.Errorf("no link found")
)

type VideoUploader interface {
	// Returns the ID of the stored file
	Store(file any) (string, error)

	Status(id string) (models.VideoStatus, error)
	// Returns the url of the given ID
	PlaybackURL(id string) (string, error)
	Delete(id string) error
}

func GetCurrentVideoUploader() (VideoUploader, error) {
	videoUploader := os.Getenv(VideoUploaderEnv)
	videoUploader = strings.ToLower(videoUploader)

	if videoUploader == "fake" {
		return FakeVideoUploader{}, nil
	}
	return FakeVideoUploader{}, nil
}
