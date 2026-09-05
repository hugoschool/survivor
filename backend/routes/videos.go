package routes

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/hugoarnal/survivor/database"
	internal "github.com/hugoarnal/survivor/internal/video"
	"github.com/hugoarnal/survivor/models"
	"gorm.io/gorm"
)

const (
	MaxVideoUploadSize = 100 << 20 // 100 MB
)

type videoPaginatedResponse struct {
	Video models.Video `json:"video"`
	User  models.User  `json:"user"`
}

// VideoPaginatedGet godoc
// @Summary Get a feed of videos
// @Schemes
// @Description Get a feed of videos
// @Tags Videos
// @Accept json
// @Produce json
// @Param page query int true "Page"
// @Success 200 {object} []videoPaginatedResponse
// @Failure 400 {object} models.ApiError
// @Failure 401 {object} models.ApiError
// @Failure 500 {object} models.ApiError
// @Router /videos [get]
func VideosPaginatedHandler(c *gin.Context) {
	var videos []models.Video
	page, _ := strconv.Atoi(c.Query("page"))

	err := database.DB.Scopes(database.Paginate(page, UsersPageSize)).Find(&videos).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	var response []videoPaginatedResponse

	for _, video := range videos {
		user, err := database.GetSimpleUserById(video.UserID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
			return
		}

		response = append(response, videoPaginatedResponse{
			Video: video,
			User:  user,
		})
	}

	c.JSON(http.StatusOK, response)
}

// VideoUpload godoc
// @Summary Upload a file
// @Schemes
// @Description Upload a file
// @Tags Videos
// @Accept json
// @Produce json
// @Param file formData file true "Video file"
// @Success 200 {object} models.VideoLink
// @Failure 400 {object} models.ApiError
// @Failure 401 {object} models.ApiError
// @Failure 413 {object} models.ApiError
// @Failure 500 {object} models.ApiError
// @Router /videos/upload [post]
func VideoUploadHandler(c *gin.Context) {
	user, err := models.GetUserFromContext(c)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxVideoUploadSize)

	if err := c.Request.ParseMultipartForm(MaxVideoUploadSize); err != nil {
		if _, ok := err.(*http.MaxBytesError); ok {
			c.JSON(http.StatusRequestEntityTooLarge, models.ApiError{
				Message: fmt.Sprintf("file too large (max: %d bytes)", MaxVideoUploadSize),
			})
			return
		}
		c.JSON(http.StatusBadRequest, models.ApiError{Message: "Bad request"})
		return
	}

	file, _, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ApiError{Message: "Bad request"})
		return
	}
	defer file.Close() //nolint:errcheck

	videoUploader, err := internal.GetCurrentVideoUploader()
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	id, err := videoUploader.Store(file)
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	link, err := videoUploader.PlaybackURL(id)
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	videoLink := models.VideoLink{
		ID:   id,
		Link: link,
	}

	video := models.Video{
		UserID:  user.ID,
		VideoID: videoLink.ID,
		Status:  models.VideoStatus(models.VideoStatusExists),
	}

	ctx := context.Background()
	err = gorm.G[models.Video](database.DB).Create(ctx, &video)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	c.JSON(http.StatusOK, videoLink)
}
