package internal

import (
	"errors"
	"fmt"
	"io"
	"os"

	"github.com/google/uuid"
	"github.com/hugoschool/survivor/models"
)

type LocalVideoUploader struct {
	BaseURL     string
	StoragePath string
}

func GetLocalPath(path string, id string) string {
	return fmt.Sprintf("%s/%s.mp4", path, id)
}

func (l LocalVideoUploader) Store(file any) (string, error) {
	id := uuid.New()
	uuidStr := id.String()

	out, err := os.Create(GetLocalPath(l.StoragePath, uuidStr))
	if err != nil {
		return "", err
	}
	defer out.Close() //nolint:errcheck

	reader, ok := file.(io.Reader)

	if !ok {
		return "", ErrCannotConvertFile
	}

	_, err = io.Copy(out, reader)
	if err != nil {
		return "", err
	}

	return uuidStr, nil
}

func (LocalVideoUploader) Status(id string) (models.VideoStatus, error) {
	return models.VideoStatus(models.VideoStatusValidated), nil
}

func (l LocalVideoUploader) PlaybackURL(id string) (string, error) {
	url := fmt.Sprintf("%s/videos/storage/%s.mp4", l.BaseURL, id)

	if _, err := os.Stat(GetLocalPath(l.StoragePath, id)); errors.Is(err, os.ErrNotExist) {
		return "", err
	}

	return url, nil
}

func (l LocalVideoUploader) Delete(id string) error {
	err := os.Remove(GetLocalPath(l.StoragePath, id))

	return err
}
