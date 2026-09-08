package routes

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/hugoschool/survivor/database"
	internal "github.com/hugoschool/survivor/internal/video"
	"github.com/hugoschool/survivor/models"
	"gorm.io/gorm"
)

const (
	MaxVideoUploadSize = 100 << 20 // 100 MB
)

type videoPaginatedResponse struct {
	Video models.VideoLink `json:"video"`
	User  models.User      `json:"user"`
}

type videoSetReviewStatusBody struct {
	Status  models.VideoStatus `json:"status" binding:"required"`
	Message string             `json:"message" binding:"required"`
}

func VideosPaginatedFeed(c *gin.Context, status models.VideoStatus) {
	var videos []models.Video
	page, _ := strconv.Atoi(c.Query("page"))

	err := database.DB.Scopes(database.Paginate(page, UsersPageSize)).
		Where("status = ?", status).
		Find(&videos).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	var response []videoPaginatedResponse

	videoUploader, err := internal.GetCurrentVideoUploader()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	for _, video := range videos {
		user, err := database.GetSimpleUserById(video.UserID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
			return
		}

		url, err := videoUploader.PlaybackURL(video.VideoID)

		if err != nil {
			continue
		}

		response = append(response, videoPaginatedResponse{
			Video: models.VideoLink{
				ID:   video.VideoID,
				Link: url,
			},
			User: user,
		})
	}

	c.JSON(http.StatusOK, response)
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
	VideosPaginatedFeed(c, models.VideoStatus(models.VideoStatusValidated))
}

// VideoGetReview godoc
// @Summary Get a feed of videos to be reviewed
// @Schemes
// @Description Get a feed of videos to be reviewed
// @Tags Videos
// @Accept json
// @Produce json
// @Param page query int true "Page"
// @Success 200 {object} []videoPaginatedResponse
// @Failure 400 {object} models.ApiError
// @Failure 401 {object} models.ApiError
// @Failure 500 {object} models.ApiError
// @Router /videos/review [get]
func VideosPaginatedReviewHandler(c *gin.Context) {
	VideosPaginatedFeed(c, models.VideoStatus(models.VideoStatusAwaitingModeration))
}

// VideoGetCurrent godoc
// @Summary Get the current user videos
// @Schemes
// @Description Get the current user videos
// @Tags Videos
// @Accept json
// @Produce json
// @Success 200 {object} []models.Video
// @Failure 400 {object} models.ApiError
// @Failure 401 {object} models.ApiError
// @Failure 404 {object} models.ApiError
// @Failure 500 {object} models.ApiError
// @Router /videos/me [get]
func VideosGetCurrentUserHandler(c *gin.Context) {
	user, err := models.GetUserFromContext(c)

	if err != nil {
		c.JSON(http.StatusNotFound, models.ApiError{Message: "User not found"})
		return
	}

	var videos []models.Video
	err = database.DB.Where("user_id = ?", user.ID).Find(&videos).Error

	fmt.Println(videos, err)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	c.JSON(http.StatusOK, videos)
}

// VideoGetURLFromId godoc
// @Summary Get the video URL from its video ID
// @Schemes
// @Description Get the video URL from its video ID
// @Tags Videos
// @Accept json
// @Produce json
// @Success 200 {object} models.VideoLink
// @Failure 400 {object} models.ApiError
// @Failure 401 {object} models.ApiError
// @Failure 404 {object} models.ApiError
// @Failure 500 {object} models.ApiError
// @Router /videos/:id [get]
func VideoGetURLFromIdHandler(c *gin.Context) {
	id := c.Param("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, models.ApiError{Message: "Incorrect ID"})
		return
	}

	ctx := context.Background()
	video, err := gorm.G[models.Video](database.DB).Where("video_id = ?", id).First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, models.ApiError{Message: "Video not found"})
			return
		} else {
			fmt.Println(err.Error())
			c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
			return
		}
	}

	if video.Status != models.VideoStatus(models.VideoStatusValidated) {
		c.JSON(http.StatusUnauthorized, models.ApiError{Message: "Video not validated"})
		return
	}

	videoUploader, err := internal.GetCurrentVideoUploader()

	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	url, err := videoUploader.PlaybackURL(video.VideoID)

	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	videoLink := models.VideoLink{
		ID:   video.VideoID,
		Link: url,
	}

	c.JSON(http.StatusOK, videoLink)
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
		Status:  models.VideoStatus(models.VideoStatusAwaitingModeration),
	}

	ctx := context.Background()
	err = gorm.G[models.Video](database.DB).Create(ctx, &video)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	c.JSON(http.StatusOK, videoLink)
}

// VideoSetReviewStatus godoc
// @Summary Set video review status
// @Schemes
// @Description Set video review status
// @Tags Videos
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param request body videoSetReviewStatusBody true "Request body"
// @Success 200 {object} models.ApiMessage
// @Failure 400 {object} models.ApiError
// @Failure 401 {object} models.ApiError
// @Failure 500 {object} models.ApiError
// @Router /videos/:id/review [put]
func VideosSetReviewStatusHandler(c *gin.Context) {
	// The ID given is the VideoID field inside the models.Video
	id := c.Param("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, models.ApiError{Message: "Incorrect body"})
		return
	}

	var body videoSetReviewStatusBody

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, models.ApiError{Message: "Incorrect body"})
		return
	}

	ctx := context.Background()
	video, err := gorm.G[models.Video](database.DB).Where("video_id = ?", id).First(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, models.ApiError{Message: "Incorrect body"})
			return
		}
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	video.Status = body.Status
	video.StatusReason = body.Message

	err = database.DB.Save(&video).Error

	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	c.JSON(http.StatusOK, models.ApiMessage{Message: "Success"})
}
