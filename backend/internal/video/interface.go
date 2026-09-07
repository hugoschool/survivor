package internal

import (
	"fmt"
	"os"
	"strings"

	"github.com/hugoschool/survivor/models"
)

const (
	BaseURLEnv                string = "BACKEND_BASE_URL"
	VideoUploaderEnv          string = "BACKEND_VIDEO_UPLOADER"
	VideoUploaderLocalPathEnv string = "BACKEND_VIDEO_UPLOADER_LOCAL_PATH"
)

var (
	ErrVideoUploaderNotFound error = fmt.Errorf("no video uploader found in %s", VideoUploaderEnv)
	ErrVideoLinkNotFound     error = fmt.Errorf("no link found")
	ErrMissingEnv            error = fmt.Errorf("missing env var")
	ErrCannotConvertFile     error = fmt.Errorf("cannot convert file to the right interface")

	BaseURL                string = os.Getenv(BaseURLEnv)
	VideoUploaderLocalPath string = os.Getenv(VideoUploaderLocalPathEnv)
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
	if videoUploader == "local" {
		if BaseURL == "" || VideoUploaderLocalPath == "" {
			return nil, ErrMissingEnv
		}
		return LocalVideoUploader{
			BaseURL:     BaseURL,
			StoragePath: VideoUploaderLocalPath,
		}, nil
	}
	return FakeVideoUploader{}, nil
}
