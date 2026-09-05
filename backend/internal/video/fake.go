package internal

import (
	"math/rand"
	"time"

	"github.com/hugoarnal/survivor/models"
)

var (
	FakeVideos = []FakeVideo{
		{ID: "test-video-1", Link: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"},
		{ID: "test-video-2", Link: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4"},
		{ID: "test-video-3", Link: "https://media.w3.org/2010/05/sintel/trailer.mp4"},
		{ID: "test-video-4", Link: "https://media.w3.org/2010/05/bunny/trailer.mp4"},
		{ID: "test-video-5", Link: "https://media.w3.org/2010/05/video/movie_300.mp4"},
	}
)

type FakeVideo struct {
	ID   string
	Link string
}

type FakeVideoUploader struct{}

func (FakeVideoUploader) Store(_ any) (string, error) {
	seed := rand.NewSource(time.Now().Unix())
	r := rand.New(seed)
	i := r.Intn(len(FakeVideos))
	video := FakeVideos[i]

	return video.ID, nil
}

func (FakeVideoUploader) Status(id string) (models.VideoStatus, error) {
	return models.VideoStatus(models.VideoStatusExists), nil
}

func (FakeVideoUploader) PlaybackURL(id string) (string, error) {
	for _, video := range FakeVideos {
		if video.ID == id {
			return video.Link, nil
		}
	}
	return "", ErrVideoLinkNotFound
}

func (FakeVideoUploader) Delete(id string) error {
	return nil
}
