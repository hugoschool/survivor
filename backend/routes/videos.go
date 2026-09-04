package routes

import (
	"context"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/hugoarnal/survivor/database"
	"github.com/hugoarnal/survivor/models"
	"gorm.io/gorm"
)

type videoLinkUploadBody struct {
	Link string `json:"link" binding:"required"`
}

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

// Useful for an iframe, doesn't work on video tags
func videoLinkReplacer(link string) string {
	if strings.Contains(link, "youtube.com/watch?v=") {
		return strings.Replace(link, "youtube.com/watch?v=", "youtube.com/embed/", 1)
	}
	return link
}

// VideoLinkUpload godoc
// @Summary Upload a video link
// @Schemes
// @Description Upload a video link, must be direct links to files (.mp4)
// @Tags Videos
// @Accept json
// @Produce json
// @Param request body videoLinkUploadBody true "Request body"
// @Success 200 {object} models.Video
// @Failure 400 {object} models.ApiError
// @Failure 401 {object} models.ApiError
// @Failure 500 {object} models.ApiError
// @Router /videos/link [post]
func VideoLinkUploadHandler(c *gin.Context) {
	user, err := models.GetUserFromContext(c)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	var body videoLinkUploadBody

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, models.ApiError{Message: "Incorrect body"})
		return
	}

	link := videoLinkReplacer(body.Link)

	video := models.Video{
		UserID: user.ID,
		Link:   link,
	}

	ctx := context.Background()
	_, err = gorm.G[models.Video](database.DB).Where(&video).First(ctx)

	if err == nil {
		c.JSON(http.StatusBadRequest, models.ApiError{Message: "Video already exists for your user"})
		return
	}

	ctx = context.Background()
	err = gorm.G[models.Video](database.DB).Create(ctx, &video)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	c.JSON(http.StatusOK, video)
}
