package main

import (
	"context"
	"fmt"
	"net/http"

	"github.com/hugoarnal/survivor/database"
	internal "github.com/hugoarnal/survivor/internal/video"
	"github.com/hugoarnal/survivor/models"
	"gorm.io/gorm"
)

// Has to be named Video for the table to be found by GORM correctly
type Video struct {
	gorm.Model
	UserID uint   `json:"user_id"`
	Link   string `json:"link"`
}

func main() {
	videoUploader, err := internal.GetCurrentVideoUploader()
	if err != nil {
		panic(err)
	}

	database.Connect()

	ctx := context.Background()
	videos, err := gorm.G[Video](database.DB).Find(ctx)

	if err != nil {
		panic(err)
	}

	videosWithLinkAmount := 0
	videosUpdatedAmount := 0

	for _, video := range videos {
		if video.Link == "" {
			continue
		}

		videosWithLinkAmount += 1
		fmt.Printf("Processing video ID %d: %s\n", video.ID, video.Link)

		resp, err := http.Get(video.Link)
		if err != nil {
			fmt.Printf("An error occured: %s\n", err.Error())
			continue
		}
		defer resp.Body.Close() //nolint:errcheck

		id, err := videoUploader.Store(resp.Body)
		if err != nil {
			fmt.Printf("An error occured: %s\n", err.Error())
			continue
		}

		newVideo := models.Video{
			Model:   video.Model,
			UserID:  video.UserID,
			VideoID: id,
			Status:  models.VideoStatus(models.VideoStatusAwaitingModeration),
		}
		err = database.DB.Save(&newVideo).Error
		if err != nil {
			fmt.Printf("An error occured: %s\n", err.Error())
			continue
		}

		videosUpdatedAmount += 1
		fmt.Printf("Processed video ID %d\n", video.ID)
	}

	fmt.Printf("Videos found: %d\n", videosWithLinkAmount)
	fmt.Printf("Videos updated: %d\n", videosUpdatedAmount)
}
